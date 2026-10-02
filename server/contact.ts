import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Transporter } from 'nodemailer';

/**
 * POST /api/contact — sends the contact form through the site owner's own SMTP account
 * (no third-party form service). Mounted on the Vite dev and preview servers (vite.config.ts).
 *
 * Configuration (environment, e.g. a .env file next to package.json — never committed):
 *   SMTP_HOST, SMTP_PORT (465 = TLS, 587 = STARTTLS), SMTP_USER, SMTP_PASS
 *   CONTACT_TO   recipient (defaults to SMTP_USER)
 *   SMTP_FROM    sender address (defaults to SMTP_USER; must be allowed by the SMTP account)
 *
 * Protections: JSON body ≤ 20 KB, field validation, honeypot, 5 messages / 10 min per IP.
 */

type Env = Record<string, string | undefined>;

const MAX_BODY_BYTES = 20_000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (res: ServerResponse, status: number, body: object) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

// Header-safe single line (no CR/LF), trimmed and length-capped
const oneLine = (value: unknown, max: number) =>
  String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

const readBody = (req: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('too_large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

export function createContactHandler(env: Env) {
  const hits = new Map<string, number[]>();
  let transporter: Transporter | null = null;

  const getTransporter = async () => {
    if (transporter) return transporter;
    const { default: nodemailer } = await import('nodemailer');
    const port = Number(env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
    return transporter;
  };

  const rateLimited = (ip: string) => {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);
    return recent.length > RATE_MAX;
  };

  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith('/api/contact')) return next();
    if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(await readBody(req));
    } catch (err) {
      const status = (err as { status?: number }).status ?? 400;
      return json(res, status, { error: status === 413 ? 'too_large' : 'invalid_json' });
    }

    // Honeypot filled: pretend success, send nothing
    if (oneLine(payload.honey, 200)) return json(res, 200, { ok: true });

    const name = oneLine(payload.name, 120);
    const email = oneLine(payload.email, 200);
    const subject = oneLine(payload.subject, 80);
    const message = String(payload.message ?? '').trim().slice(0, 5000);
    if (!name || !EMAIL_RE.test(email) || !message) return json(res, 422, { error: 'invalid_fields' });

    const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
    const ip = forwarded || req.socket.remoteAddress || 'unknown';
    if (rateLimited(ip)) return json(res, 429, { error: 'rate_limited' });

    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
      return json(res, 503, { error: 'not_configured' });
    }

    try {
      const mailer = await getTransporter();
      const sender = env.SMTP_FROM || env.SMTP_USER;
      await mailer.sendMail({
        from: { name: `Portfolio – ${name}`, address: sender },
        to: env.CONTACT_TO || env.SMTP_USER,
        replyTo: { name, address: email },
        subject: `${subject ? `${subject} – ` : 'Nouveau message – '}Portfolio Luca Leone (${name})`,
        text: [`De : ${name} <${email}>`, subject ? `Sujet : ${subject}` : '', '', message].filter((l, i) => l || i > 1).join('\n'),
      });
      return json(res, 200, { ok: true });
    } catch (err) {
      console.error('[contact] send failed:', err);
      return json(res, 502, { error: 'send_failed' });
    }
  };
}
