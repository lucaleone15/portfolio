import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Transporter } from 'nodemailer';
import { ownerEmail, visitorEmail, type MailLang } from './contactEmails';

/**
 * POST /api/contact — sends the contact form through the site owner's own SMTP account
 * (no third-party form service). Mounted on the Vite dev and preview servers (vite.config.ts).
 *
 * Configuration (environment, e.g. a .env file next to package.json — never committed):
 *   SMTP_HOST, SMTP_PORT (465 = TLS, 587 = STARTTLS), SMTP_USER, SMTP_PASS
 *   CONTACT_TO   recipient (defaults to SMTP_USER)
 *   SMTP_FROM    sender address (defaults to SMTP_USER; must be allowed by the SMTP account)
 *
 * Two emails per message: a formatted notification to the owner (reply goes straight to the
 * visitor) and a confirmation to the visitor (server/contactEmails.ts).
 *
 * Protections: JSON body ≤ 20 KB, field validation, honeypot, 5 messages / 10 min per IP,
 * and at most 3 confirmations a day to the same address (the form can't be used to flood
 * someone's inbox).
 */

type Env = Record<string, string | undefined>;

const MAX_BODY_BYTES = 20_000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CONFIRM_WINDOW_MS = 24 * 60 * 60 * 1000;
const CONFIRM_MAX = 3;
// Topics offered by the form (FR and EN); anything else is dropped
const TOPICS = new Set(['Projet', 'Collaboration', 'Travail de Bachelor', 'Stage / emploi', 'Autre', 'Project', 'Bachelor thesis', 'Internship / job', 'Other']);

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
  const confirmations = new Map<string, number[]>();
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
      // Never leave the visitor waiting on a stuck mail server
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
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

  const mayConfirm = (address: string) => {
    const key = address.toLowerCase();
    const now = Date.now();
    const recent = (confirmations.get(key) ?? []).filter((t) => now - t < CONFIRM_WINDOW_MS);
    if (recent.length >= CONFIRM_MAX) return false;
    recent.push(now);
    confirmations.set(key, recent);
    return true;
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
    const rawSubject = oneLine(payload.subject, 80);
    const subject = TOPICS.has(rawSubject) ? rawSubject : '';
    const lang: MailLang = payload.lang === 'en' ? 'en' : 'fr';
    const page = /^\/[\w\-/]*$/.test(String(payload.page ?? '')) ? String(payload.page) : '/';
    const message = String(payload.message ?? '').trim().slice(0, 5000);
    if (!name || !EMAIL_RE.test(email) || !message) return json(res, 422, { error: 'invalid_fields' });

    const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
    const ip = forwarded || req.socket.remoteAddress || 'unknown';
    if (rateLimited(ip)) return json(res, 429, { error: 'rate_limited' });

    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
      return json(res, 503, { error: 'not_configured' });
    }

    const details = { name, email, subject, message, lang, page, date: new Date() };
    let mailer: Transporter;
    const sender = env.SMTP_FROM || env.SMTP_USER;
    const owner = env.CONTACT_TO || env.SMTP_USER;
    try {
      mailer = await getTransporter();
      const mail = ownerEmail(details);
      await mailer.sendMail({
        from: { name: `Portfolio · ${name}`, address: sender },
        to: owner,
        replyTo: { name, address: email },
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });
    } catch (err) {
      console.error('[contact] send failed:', err);
      return json(res, 502, { error: 'send_failed' });
    }

    // The message is delivered: the confirmation is a courtesy and may fail on its own
    let confirmed = false;
    if (mayConfirm(email)) {
      try {
        const mail = visitorEmail(details);
        await mailer.sendMail({
          from: { name: 'Luca Leone', address: sender },
          // Address only: the visitor-typed name never reaches a header of an outgoing email
          to: email,
          replyTo: owner,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
        });
        confirmed = true;
      } catch (err) {
        console.error('[contact] confirmation failed:', err);
      }
    }
    return json(res, 200, { ok: true, confirmed });
  };
}
