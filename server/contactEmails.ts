/**
 * Emails sent by the contact form (server/contact.ts): the notification to the site owner
 * and the confirmation to the visitor. Table-based HTML with inline styles (what every mail
 * client renders, Outlook included) plus a plain-text version of each.
 *
 * The confirmation never repeats the visitor's message: the form could otherwise be used to
 * send arbitrary text to any address from this domain.
 */

export type MailLang = 'fr' | 'en';

export interface ContactDetails {
  name: string;
  email: string;
  subject: string;
  message: string;
  lang: MailLang;
  page: string;
  date: Date;
}

const ACCENT = '#C50E36';
const SITE = 'https://luca-leone.ch';
const LINKEDIN = 'https://linkedin.com/in/leone-luca';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const swissDate = (d: Date, lang: MailLang) =>
  new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CH' : 'en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Zurich',
  }).format(d);

/** Shared frame: light card on a soft grey background, readable in dark-mode clients too */
function frame(preheader: string, inner: string) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title></title>
</head>
<body style="margin:0;padding:0;background:#F2F2F4;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2F2F4;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1A1A1A;">
<tr><td style="height:6px;background:${ACCENT};font-size:0;line-height:0;">&nbsp;</td></tr>
${inner}
</table>
</td></tr>
</table>
</body>
</html>`;
}

const button = (href: string, label: string) =>
  `<a href="${esc(href)}" style="display:inline-block;background:${ACCENT};color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:13px 24px;border-radius:999px;">${esc(label)}</a>`;

/* ---------- To the site owner ---------- */

export function ownerEmail(d: ContactDetails) {
  const topic = d.subject || 'Sans sujet';
  const replySubject = `Re: ${d.subject ? `${d.subject} – ` : ''}votre message sur luca-leone.ch`;
  const replyHref = `mailto:${d.email}?subject=${encodeURIComponent(replySubject)}`;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;width:110px;vertical-align:top;font-size:13px;color:#6B6B6B;">${label}</td><td style="padding:6px 0;font-size:15px;color:#1A1A1A;">${value}</td></tr>`;

  const html = frame(
    `${d.name} : ${d.message.slice(0, 90)}`,
    `<tr><td style="padding:28px 32px 8px;">
<p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${ACCENT};">Nouveau message · Portfolio</p>
<h1 style="margin:0;font-size:24px;line-height:1.25;color:#1A1A1A;">${esc(d.name)}</h1>
</td></tr>
<tr><td style="padding:16px 32px 4px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${row('Email', `<a href="mailto:${esc(d.email)}" style="color:${ACCENT};text-decoration:none;">${esc(d.email)}</a>`)}
${row('Sujet', `<span style="display:inline-block;background:#F6E3E7;color:${ACCENT};font-weight:700;font-size:13px;padding:3px 10px;border-radius:999px;">${esc(topic)}</span>`)}
${row('Langue', d.lang === 'fr' ? 'Français' : 'Anglais')}
</table>
</td></tr>
<tr><td style="padding:16px 32px 8px;">
<div style="background:#F7F7F8;border-radius:12px;padding:18px 20px;font-size:15px;line-height:1.6;color:#1A1A1A;white-space:pre-wrap;">${esc(d.message)}</div>
</td></tr>
<tr><td style="padding:20px 32px 28px;">${button(replyHref, `Répondre à ${d.name}`)}</td></tr>
<tr><td style="padding:16px 32px 24px;border-top:1px solid #EEEEF0;font-size:12px;line-height:1.6;color:#8A8A8E;">
Envoyé le ${esc(swissDate(d.date, 'fr'))}<br>depuis ${esc(SITE + d.page)}
</td></tr>`,
  );

  const text = [
    `Nouveau message depuis le portfolio`,
    ``,
    `De : ${d.name} <${d.email}>`,
    `Sujet : ${topic}`,
    `Langue : ${d.lang === 'fr' ? 'français' : 'anglais'}`,
    ``,
    d.message,
    ``,
    `—`,
    `Envoyé le ${swissDate(d.date, 'fr')} depuis ${SITE}${d.page}`,
    `Répondre : répondez simplement à cet email.`,
  ].join('\n');

  return {
    subject: `${d.subject ? `${d.subject} · ` : ''}${d.name} vous a écrit`,
    html,
    text,
  };
}

/* ---------- To the visitor ---------- */

const COPY: Record<MailLang, { subject: string; hello: (n: string) => string; body: string[]; topic: string; sign: string; site: string; note: string }> = {
  fr: {
    subject: 'Merci pour votre message · Luca Leone',
    hello: (n) => (n ? `Bonjour ${n},` : 'Bonjour,'),
    body: [
      'Merci pour votre message, il m’est bien parvenu.',
      'Je le lis attentivement et je reviens vers vous dès que possible.',
    ],
    topic: 'Sujet',
    sign: 'Meilleures salutations,',
    site: 'Voir mon portfolio',
    note: 'Vous recevez cet email parce que ce formulaire a été rempli avec votre adresse sur luca-leone.ch. Si ce n’était pas vous, ignorez-le simplement.',
  },
  en: {
    subject: 'Thanks for your message · Luca Leone',
    hello: (n) => (n ? `Hello ${n},` : 'Hello,'),
    body: ['Thank you for your message, it reached me safely.', 'I’ll read it carefully and get back to you as soon as possible.'],
    topic: 'Topic',
    sign: 'Best regards,',
    site: 'See my portfolio',
    note: 'You’re receiving this email because the contact form on luca-leone.ch was filled in with your address. If it wasn’t you, simply ignore it.',
  },
};

/** Names that look like links or addresses are not repeated back (anti-abuse) */
const safeName = (name: string) => (/https?:|www\.|@|\.[a-z]{2,}\//i.test(name) ? '' : name.slice(0, 60));

export function visitorEmail(d: ContactDetails) {
  const c = COPY[d.lang];
  const name = safeName(d.name);
  const html = frame(
    c.body[0],
    `<tr><td style="padding:32px 32px 8px;">
<p style="margin:0 0 18px;font-size:17px;line-height:1.5;color:#1A1A1A;">${esc(c.hello(name))}</p>
${c.body.map((p) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#3A3A3C;">${esc(p)}</p>`).join('\n')}
${d.subject ? `<p style="margin:6px 0 0;font-size:13px;color:#6B6B6B;">${c.topic} : <strong style="color:#1A1A1A;">${esc(d.subject)}</strong></p>` : ''}
</td></tr>
<tr><td style="padding:22px 32px 6px;">
<p style="margin:0 0 4px;font-size:15px;color:#3A3A3C;">${esc(c.sign)}</p>
<p style="margin:0;font-size:17px;font-weight:700;color:#1A1A1A;">Luca Leone</p>
<p style="margin:2px 0 0;font-size:13px;color:#6B6B6B;">${d.lang === 'fr' ? 'Étudiant en Ingénierie des médias · HEIG-VD' : 'Media Engineering student · HEIG-VD'}</p>
</td></tr>
<tr><td style="padding:22px 32px 28px;">${button(d.lang === 'fr' ? SITE : `${SITE}/en/`, c.site)}
<a href="${LINKEDIN}" style="display:inline-block;margin-left:12px;color:${ACCENT};font-weight:700;font-size:15px;text-decoration:none;">LinkedIn</a></td></tr>
<tr><td style="padding:16px 32px 24px;border-top:1px solid #EEEEF0;font-size:12px;line-height:1.6;color:#8A8A8E;">${esc(c.note)}</td></tr>`,
  );
  const text = [c.hello(name), '', ...c.body, d.subject ? `\n${c.topic} : ${d.subject}` : '', '', c.sign, 'Luca Leone', SITE, '', c.note]
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    .join('\n');
  return { subject: c.subject, html, text };
}
