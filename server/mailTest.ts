import path from 'node:path';
import { resolveTxt } from 'node:dns/promises';
import nodemailer from 'nodemailer';
import { confirmationMail } from './contact';
import { visitorEmail } from './contactEmails';

/**
 * Delivery test for the contact form's confirmation email, run on the server with the same
 * .env as the site: `npm run mail:test -- someone@example.com`
 *
 * 1. checks the SMTP login, 2. sends the real confirmation (FR) to the given address,
 * 3. prints what the SMTP server answered and the sending domain's SPF / DMARC records.
 * If the server accepts the message but it never shows up, the receiving side filtered it:
 * look in the spam folder, and check that DKIM is enabled for the domain.
 */

try {
  process.loadEnvFile(path.join(process.cwd(), '.env'));
} catch {
  // no .env file: rely on the real environment
}
const env = process.env;
const to = process.argv[2];

if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) {
  console.error('Usage: npm run mail:test -- someone@example.com');
  process.exit(1);
}
if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
  console.error('✗ SMTP_HOST, SMTP_USER and SMTP_PASS must be set in .env');
  process.exit(1);
}

const sender = env.SMTP_FROM || env.SMTP_USER;
const owner = env.CONTACT_TO || env.SMTP_USER;
const port = Number(env.SMTP_PORT || 465);
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port,
  secure: port === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,
});

console.log(`SMTP ${env.SMTP_HOST}:${port} as ${env.SMTP_USER}, sending from ${sender}`);
try {
  await transporter.verify();
  console.log('✓ SMTP login ok');
} catch (err) {
  console.error('✗ SMTP login failed:', (err as Error).message);
  process.exit(1);
}

try {
  const mail = visitorEmail({
    name: 'Test',
    email: to,
    subject: 'Projet',
    message: '(test)',
    lang: 'fr',
    page: '/',
    date: new Date(),
  });
  const info = await transporter.sendMail(confirmationMail(mail, sender, owner, to));
  console.log(`${info.rejected?.length ? '✗' : '✓'} SMTP answer: ${info.response}`);
  console.log(`  accepted: ${info.accepted?.join(', ') || '—'} · rejected: ${info.rejected?.join(', ') || '—'}`);
  console.log(`  Message-ID: ${info.messageId}`);
} catch (err) {
  console.error('✗ Sending failed:', (err as Error).message);
  process.exit(1);
}

const domain = sender.split('@')[1];
const txt = async (name: string) => (await resolveTxt(name).catch(() => [])).map((r) => r.join('')).join(' | ') || '— none —';
console.log(`\nDNS of ${domain}`);
console.log(`  SPF:   ${(await txt(domain)).split(' | ').filter((r) => r.startsWith('v=spf1')).join(' | ') || '— none —'}`);
console.log(`  DMARC: ${await txt(`_dmarc.${domain}`)}`);
console.log('\nAccepted but not in the inbox? Check the spam folder, then the DKIM setting of the mail service.');
