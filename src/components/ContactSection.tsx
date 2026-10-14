import { useEffect, useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { USER_INFO } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { Link, privacyPath, sectionPath } from '../router';
import { Add01Icon, ArrowUpRight01Icon, Call02Icon, Copy01Icon, Linkedin02Icon, Loading03Icon, Mail01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { Icon } from './Icon';
import { ContactRow, FloatingField, RevealHeadline, RevealWords, Signature } from './ContactExtras';

const TOPICS = {
  fr: ['Projet', 'Collaboration', 'Travail de Bachelor', 'Stage / emploi', 'Autre'],
  en: ['Project', 'Collaboration', 'Bachelor thesis', 'Internship / job', 'Other'],
};

/** Fired by the hero's availability line: preselects the "Bachelor thesis" topic. */
export const PRESELECT_TOPIC_EVENT = 'contact-preselect-topic';
export const BACHELOR_TOPIC_INDEX = 2;


export function ContactSection() {
  const { lang, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    // Honeypot: hidden from people, filled in by bots
    honey: ''
  });

  const PRIMARY_EMAIL = 'luca@luca-leone.ch';
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [topicMissing, setTopicMissing] = useState(false);
  const chooseTopic = (topic: string) => {
    setFormData((prev) => ({ ...prev, subject: topic }));
    setTopicMissing(false);
  };

  // Switching language keeps the chosen topic (same position in the other list)
  useEffect(() => {
    setFormData((prev) => {
      const other = TOPICS[lang === 'fr' ? 'en' : 'fr'].indexOf(prev.subject);
      return other === -1 ? prev : { ...prev, subject: TOPICS[lang][other] };
    });
  }, [lang]);

  useEffect(() => {
    const onPreselect = (e: Event) => {
      const index = (e as CustomEvent<number>).detail;
      setFormData((prev) => ({ ...prev, subject: TOPICS[lang][index] ?? prev.subject }));
      setTopicMissing(false);
    };
    window.addEventListener(PRESELECT_TOPIC_EVENT, onPreselect);
    return () => window.removeEventListener(PRESELECT_TOPIC_EVENT, onPreselect);
  }, [lang]);


  // The address row opens the mail app; this separate button copies it (for webmail users,
  // whose browser may have no mail app set up)
  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(PRIMARY_EMAIL);
    } catch {
      // Older browsers / insecure context: select-and-copy through a temporary field
      const field = document.createElement('textarea');
      field.value = PRIMARY_EMAIL;
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.subject) {
      setTopicMissing(true);
      return;
    }
    if (!formData.name || !formData.email || !formData.message) return;

    const successMessage =
      lang === 'fr' ? 'Merci ! Votre message est bien arrivé, je reviens vers vous rapidement.' : 'Thank you! Your message has arrived, I’ll get back to you soon.';

    // A bot filled the hidden field: pretend it worked, send nothing
    if (formData.honey) {
      setSubmitStatus('success');
      setStatusMessage(successMessage);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setStatusMessage('');

    try {
      // Our own endpoint (server/contact.ts): sent through the site's own mailbox, no third party
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...formData, lang, page: window.location.pathname }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw Object.assign(new Error(data?.error || `HTTP ${response.status}`), { code: data?.error });
      }
      setIsSubmitting(false);
      setSubmitStatus('success');
      setStatusMessage(
        data.confirmed
          ? lang === 'fr'
            ? `Merci ${formData.name.split(' ')[0]} ! Votre message est bien arrivé. Une confirmation vous a été envoyée à ${formData.email} (pensez à regarder dans les indésirables).`
            : `Thank you ${formData.name.split(' ')[0]}! Your message has arrived. A confirmation has been sent to ${formData.email} (check your spam folder if you don’t see it).`
          : successMessage,
      );
      setFormData({ name: '', email: '', subject: '', message: '', honey: '' });
    } catch (err) {
      console.error('Contact submission error:', err);
      setIsSubmitting(false);
      setSubmitStatus('error');
      const code = (err as { code?: string }).code;
      setStatusMessage(
        code === 'rate_limited'
          ? lang === 'fr'
            ? 'Plusieurs messages viennent d’être envoyés. Réessayez dans quelques minutes, ou utilisez votre messagerie :'
            : 'Several messages were just sent. Try again in a few minutes, or use your mail app:'
          : lang === 'fr'
            ? 'L’envoi n’a pas abouti. Votre message n’est pas perdu : envoyez-le depuis votre messagerie.'
            : 'Sending didn’t go through. Your message isn’t lost: send it from your mail app.'
      );
    }
  };

  // Fallback that always works: the visitor's own mail app, with their message pre-filled
  const mailtoFallback = `mailto:${PRIMARY_EMAIL}?subject=${encodeURIComponent(
    `${formData.subject ? `${formData.subject} – ` : ''}Portfolio Luca Leone (${formData.name})`,
  )}&body=${encodeURIComponent(formData.message)}`;

  return (
    // The whole contact area is one accent "sheet" rising over the page (rounded top):
    // form, direct contacts and signature share the same ground, so they read as one block.
    // Fixed deep accent (≥ 6:1 with white) in both themes.
    <section id="contact" className="relative pt-6 sm:pt-10 bg-[#F9F9FB] dark:bg-[#0A0A0C] transition-colors duration-300">
      <div
        data-on-accent
        className="relative overflow-hidden rounded-t-[2rem] sm:rounded-t-[3rem] bg-[var(--accent-light)] text-white pt-16 sm:pt-24 pb-20 sm:pb-28 selection:bg-white! selection:text-[var(--accent-light)]! [&_*:focus-visible]:outline-white"
      >
        {/* Depth: a darker pool bottom-left, a lighter one top-right, and grain */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-1/3 -right-1/4 w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.14),transparent)]" />
          <div className="absolute -bottom-1/3 -left-1/4 w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(0,0,0,0.22),transparent)]" />
          <div className="paper-grain absolute inset-0 opacity-[0.08] mix-blend-overlay" />
        </div>
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Section header, same as Projects and About: index "03" + "Contact", in white on the accent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-baseline gap-3.5 border-b border-white/20 pb-6 mb-12 sm:mb-16"
        >
          <span className="index-number text-2xl sm:text-3xl text-white/70">
            {t('contact.index')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight font-extrabold">{t('contact.title')}</h2>
        </motion.div>

        {/* Headline: words rise out of their masks */}
        <RevealHeadline className="mb-6 sm:mb-8 text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] font-normal text-white/75">
          <span className="block">
            <RevealWords text={t('contact.talkPrefix')} />
          </span>
          <span className="block">
            <RevealWords text={t('contact.talkHighlight')} delay={0.2} className="font-extrabold text-white" />
          </span>
        </RevealHeadline>

        {/* What I'm looking for, right where people decide to write */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 sm:mb-20 max-w-3xl text-lg sm:text-2xl leading-relaxed text-white/85"
        >
          {lang === 'fr' ? (
            <>
              Un projet, une collaboration, un stage ou un sujet pour mon{' '}
              <strong className="font-bold text-white">travail de Bachelor</strong> ? Écrivez-moi, je reviens vers vous
              rapidement.
            </>
          ) : (
            <>
              A project, a collaboration, an internship or a topic for my{' '}
              <strong className="font-bold text-white">Bachelor thesis</strong>? Get in touch, I'll get back to you soon.
            </>
          )}
        </motion.p>

        {/* One shared grid of rows: each form row sits on the same row as a direct-contact row,
            so their lines meet (labels / chips ↔ email / name+email ↔ phone / message ↔ LinkedIn).
            The form and the list use display:contents so their children become grid items;
            on mobile the DOM order (form, then contacts) is kept. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-16">
          <form onSubmit={handleFormSubmit} className="contents">
            {/* Row 1 — label */}
            <p id="contact-topic-label" className="lg:col-span-7 lg:row-start-1 mb-3 lg:mb-4 self-end eyebrow text-white/70">
              {lang === 'fr' ? 'Votre demande concerne' : 'This is about'}
              <span aria-hidden="true"> *</span>
            </p>

            {/* Row 2 — topic choice (one tap instead of typing a subject), required. Real buttons
                (the pointer outline wraps them, like every other button),
                exposed as a radio group: arrow keys move the choice, Tab enters and leaves the group.
                Each chip carries a "+" that turns into a tick once chosen, so it reads as an action.
                Grid, so a second line stays a clean block: phones 2 columns with the long "Bachelor"
                chip across both; wider screens 3 chips then 2 (6-column grid), each row filling the width,
                so no single chip looks more important than the others. */}
            <div
              role="radiogroup"
              aria-labelledby="contact-topic-label"
              aria-required="true"
              aria-invalid={topicMissing || undefined}
              aria-describedby={topicMissing ? 'contact-topic-error' : undefined}
              onKeyDown={(e) => {
                const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
                if (!step) return;
                e.preventDefault();
                const chips = Array.from(e.currentTarget.querySelectorAll('[role="radio"]')) as HTMLElement[];
                const from = chips.indexOf(document.activeElement as HTMLElement);
                const next = (Math.max(from, 0) + step + chips.length) % chips.length;
                chooseTopic(TOPICS[lang][next]);
                chips[next]?.focus();
              }}
              className="lg:col-span-7 lg:row-start-2 self-center grid grid-cols-2 sm:grid-cols-6 gap-2"
            >
                    {TOPICS[lang].map((topic, i) => {
                      const selected = formData.subject === topic;
                      // Roving focus: only the chosen chip (or the first one) is a Tab stop
                      const tabStop = formData.subject ? selected : i === 0;
                      return (
                        <button
                          key={topic}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          tabIndex={tabStop ? 0 : -1}
                          onClick={() => chooseTopic(topic)}
                          className={`font-syne group h-11 px-2.5 sm:px-3 max-[359px]:text-[13px] inline-flex items-center justify-center gap-1.5 rounded-full border text-sm font-bold whitespace-nowrap ${
                            i === 2 ? 'col-span-2' : i < 2 ? 'sm:col-span-2' : 'sm:col-span-3'
                          } transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97] cursor-pointer ${
                            selected
                              ? 'bg-white border-white text-[var(--accent-light)]'
                              : `bg-transparent text-white hover:bg-white/15 hover:border-white ${topicMissing ? 'border-white' : 'border-white/50'}`
                          }`}
                        >
                          <span aria-hidden="true" className="relative w-4 h-4 shrink-0">
                            <Icon
                              icon={Add01Icon}
                              className={`absolute inset-0 w-4 h-4 transition duration-200 ease-out ${selected ? 'opacity-0 rotate-90 scale-50' : 'opacity-80 group-hover:opacity-100'}`}
                            />
                            <Icon
                              icon={Tick02Icon}
                              className={`absolute inset-0 w-4 h-4 transition duration-200 ease-out ${selected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                            />
                          </span>
                          {topic}
                        </button>
                      );
                    })}
              {topicMissing && (
                <p id="contact-topic-error" className="col-span-full pt-1 text-xs font-semibold text-white">
                  {lang === 'fr' ? 'Choisissez le sujet de votre demande.' : 'Choose what your message is about.'}
                </p>
              )}
            </div>

            {/* Row 3 — name + email, underlines on the row's bottom edge */}
            <div className="lg:col-span-7 lg:row-start-3 self-end grid grid-cols-1 sm:grid-cols-2 gap-x-9 gap-y-2 pt-8">
              <FloatingField
                id="contact-name"
                name="name"
                label={lang === 'fr' ? 'Votre nom' : 'Your name'}
                autoComplete="name"
                required
                value={formData.name}
                onChange={(v) => setFormData({ ...formData, name: v })}
              />
              <FloatingField
                id="contact-email"
                name="email"
                type="email"
                label={lang === 'fr' ? 'Votre email' : 'Your email'}
                autoComplete="email"
                required
                value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })}
                error={emailInvalid ? (lang === 'fr' ? 'Cette adresse email semble incomplète.' : 'This email address looks incomplete.') : undefined}
                onBlur={(el) => setEmailInvalid(el.value.length > 0 && !el.validity.valid)}
              />
            </div>

            {/* Row 4 — message */}
            <FloatingField
              id="contact-message"
              name="message"
              label={lang === 'fr' ? 'Parlez-moi de votre projet' : 'Tell me about your project'}
              multiline
              required
              value={formData.message}
              onChange={(v) => setFormData({ ...formData, message: v })}
              className="lg:col-span-7 lg:row-start-4 self-end pt-10"
            />

              {/* Honeypot: off-screen, skipped by keyboard and screen readers */}
              <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
                <label htmlFor="contact-honey">Ne pas remplir</label>
                <input
                  id="contact-honey"
                  name="_honey"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.honey}
                  onChange={(e) => setFormData({ ...formData, honey: e.target.value })}
                />
              </div>

            {/* Row 5 — status + submit */}
            <div className="lg:col-span-7 lg:row-start-5 pt-10 space-y-5">
                {/* Submit Status Feedback (announced by screen readers) */}
                <div role="status" aria-live="polite">
                  <AnimatePresence>
                    {submitStatus !== 'idle' && statusMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className={`text-sm font-medium ${submitStatus === 'error' ? 'text-white font-semibold' : 'text-white/90'}`}
                      >
                        {statusMessage}
                        {submitStatus === 'error' && (
                          <a
                            href={mailtoFallback}
                            className="font-syne ml-2 inline-flex items-center gap-1.5 underline underline-offset-4 decoration-white/50 hover:decoration-white font-bold"
                          >
                            {lang === 'fr' ? 'Envoyer via votre messagerie' : 'Send with your mail app'} ↗
                          </a>
                        )}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

              <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    // The browser checks the text fields itself; the topic is flagged at the same time
                    onClick={() => !formData.subject && setTopicMissing(true)}
                    className="font-syne relative min-w-[15rem] h-14 px-10 rounded-full bg-white text-[var(--accent-light)] hover:bg-white/90 disabled:cursor-wait font-bold text-sm tracking-wide transition duration-200 cursor-pointer shadow-xs active:scale-[0.97] inline-flex items-center justify-center overflow-hidden"
                  >
                    {/* State morph: the labels cross-fade through a light blur so they read as one
                        element changing, not two swapping */}
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={isSubmitting ? 'sending' : submitStatus === 'success' ? 'sent' : 'idle'}
                        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                        className="inline-flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Icon icon={Loading03Icon} className="w-4 h-4 animate-spin" />
                            {lang === 'fr' ? 'Envoi…' : 'Sending…'}
                          </>
                        ) : submitStatus === 'success' ? (
                          <>
                            <Icon icon={Tick02Icon} className="w-4 h-4" />
                            {lang === 'fr' ? 'Message envoyé' : 'Message sent'}
                          </>
                        ) : (
                          t('contact.sendBtn')
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                <p className="mt-4 text-xs text-white/70 leading-relaxed max-w-md">
                  {lang === 'fr' ? 'Vos données servent uniquement à vous répondre. ' : 'Your data is only used to reply to you. '}
                  <Link href={privacyPath(lang)} className="underline underline-offset-2 decoration-white/40 hover:decoration-white">
                    {lang === 'fr' ? 'Politique de confidentialité' : 'Privacy policy'}
                  </Link>
                </p>
              </div>
            </div>
          </form>

          {/* Direct contact rows (rows 1–4 of the right column) */}
          <p className="mt-16 lg:mt-0 lg:col-start-8 lg:col-span-5 lg:row-start-1 mb-3 lg:mb-4 self-end eyebrow text-white/70">
            {lang === 'fr' ? 'Ou directement' : 'Or directly'}
          </p>
          <ul role="list" className="contents">
            <ContactRow
              className="lg:col-start-8 lg:col-span-5 lg:row-start-2 border-t"
              icon={<Icon icon={Mail01Icon} className="w-5 h-5" />}
              label={copied ? (lang === 'fr' ? 'Adresse copiée' : 'Address copied') : 'Email'}
              value={PRIMARY_EMAIL}
              href={`mailto:${PRIMARY_EMAIL}`}
              trailing={<Icon icon={ArrowUpRight01Icon} className="w-5 h-5" />}
              aside={
                <button
                  type="button"
                  onClick={copyEmailToClipboard}
                  aria-label={lang === 'fr' ? 'Copier l’adresse email' : 'Copy the email address'}
                  title={lang === 'fr' ? 'Copier l’adresse' : 'Copy the address'}
                  className="shrink-0 w-14 sm:w-16 flex items-center justify-center text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Icon icon={copied ? Tick02Icon : Copy01Icon} className="w-5 h-5" />
                </button>
              }
            />
            <ContactRow
              className="lg:col-start-8 lg:col-span-5 lg:row-start-3"
              icon={<Icon icon={Call02Icon} className="w-5 h-5" />}
              label={lang === 'fr' ? 'Téléphone' : 'Phone'}
              value={USER_INFO.phone}
              href={`tel:${USER_INFO.phone.replace(/\s/g, '')}`}
            />
            <ContactRow
              className="lg:col-start-8 lg:col-span-5 lg:row-start-4"
              icon={<Icon icon={Linkedin02Icon} className="w-5 h-5" />}
              label="LinkedIn"
              value="in/leone-luca"
              href={USER_INFO.linkedin}
              external
            />
          </ul>
          {/* Copy confirmation for screen readers */}
          <span className="sr-only" role="status" aria-live="polite">{copied ? (lang === 'fr' ? 'Adresse copiée' : 'Address copied') : ''}</span>
        </div>

        {/* Minimal Clean Footer with WCAG AAA Compliant High Contrast */}
        {/* Footer. Phones: brand, then links (each kept on one line, wrapping as whole items),
            then "back to top" on its own line. Wider screens: one row. */}
        <footer className="mt-20 pt-8 border-t border-white/20 flex flex-col items-center gap-5 text-xs text-white/80 sm:flex-row sm:flex-wrap sm:justify-between">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-bold text-white inline-flex items-baseline">
              Luca Leone<span className="text-[#0A0A0C] font-bold">.</span>
            </span>
            {/* Year may differ between build time and visit: not a real mismatch */}
            <span className="font-medium" suppressHydrationWarning>© {new Date().getFullYear()}</span>
            <span className="text-white/50">·</span>
            <span className="font-medium">HEIG-VD</span>
          </div>
          <nav aria-label={lang === 'fr' ? 'Pied de page' : 'Footer'} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href={sectionPath(lang, 'projets')} className="whitespace-nowrap font-medium hover:text-white transition-colors">
              {t('nav.projects')}
            </Link>
            <Link href={sectionPath(lang, 'a-propos')} className="whitespace-nowrap font-medium hover:text-white transition-colors">
              {t('nav.about')}
            </Link>
            <a
              href={USER_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap font-medium hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <Link href={privacyPath(lang)} className="whitespace-nowrap font-medium hover:text-white transition-colors">
              {lang === 'fr' ? 'Confidentialité' : 'Privacy'}
            </Link>
          </nav>
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
              })
            }
            className="font-syne whitespace-nowrap inline-flex items-center gap-1.5 font-bold text-white hover:text-white/70 transition-colors cursor-pointer"
          >
            {lang === 'fr' ? 'Retour en haut' : 'Back to top'} ↑
          </button>
        </footer>

        {/* Signature */}
        <div className="mt-12 sm:mt-16 -mb-20 sm:-mb-28">
          <Signature />
        </div>
      </div>
      </div>
    </section>
  );
}
