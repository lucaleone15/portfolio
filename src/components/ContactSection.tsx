import { useState, FormEvent, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { USER_INFO } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { Link, sectionPath } from '../router';
import { Check, Copy, Linkedin, Loader2, Mail, Phone } from 'lucide-react';
import { ContactRow, FloatingField, RevealWords, Signature } from './ContactExtras';

const TOPICS = {
  fr: ['Projet', 'Collaboration', 'Stage / emploi', 'Autre'],
  en: ['Project', 'Collaboration', 'Internship / job', 'Other'],
};

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

  // Clicking the address copies it; if the clipboard is unavailable, fall back to the mail app
  const copyEmailToClipboard = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(PRIMARY_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${PRIMARY_EMAIL}`;
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    const successMessage =
      lang === 'fr' ? 'Votre message a bien été envoyé directement à Luca Leone !' : 'Your message has been sent directly to Luca Leone!';

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
      const response = await fetch(`https://formsubmit.co/ajax/${PRIMARY_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || `Message de ${formData.name} via le portfolio`,
          message: formData.message,
          _subject: `${formData.subject ? `${formData.subject} – ` : 'Nouveau message – '}Portfolio Luca Leone (${formData.name})`,
          _replyto: formData.email,
          _captcha: 'false',
          _honey: formData.honey,
          _template: 'table'
        })
      });

      const data = await response.json().catch(() => ({}));
      // FormSubmit answers { success: "false" } (sometimes with HTTP 200) when it rejects a message
      if (!response.ok || String(data?.success) === 'false') {
        throw new Error(`FormSubmit rejected the message (${response.status}): ${data?.message ?? ''}`);
      }
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', honey: '' });

      if (data?.message && typeof data.message === 'string' && data.message.toLowerCase().includes('activation')) {
        setStatusMessage(
          lang === 'fr'
            ? "Message transmis ! Un premier email d'activation a été envoyé à votre adresse pour autoriser la réception."
            : "Message transmitted! An activation email has been sent to confirm receipt."
        );
      } else {
        setStatusMessage(successMessage);
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      setIsSubmitting(false);
      setSubmitStatus('error');
      setStatusMessage(
        lang === 'fr'
          ? "Une erreur est survenue lors de l'envoi. Vous pouvez également écrire à " + PRIMARY_EMAIL
          : "An error occurred while sending. You can also write directly to " + PRIMARY_EMAIL
      );
    }
  };

  return (
    // The whole contact area is one accent "sheet" rising over the page (rounded top):
    // form, direct contacts and signature share the same ground, so they read as one block.
    // Fixed deep accent (≥ 6:1 with white) in both themes.
    <section id="contact" className="relative pt-6 sm:pt-10 bg-[#F9F9FB] dark:bg-[#0A0A0C] transition-colors duration-300">
      <div
        data-on-accent
        className="relative overflow-hidden rounded-t-[2rem] sm:rounded-t-[3rem] bg-[var(--accent-light)] text-white pt-16 sm:pt-24 pb-20 sm:pb-28 selection:bg-white selection:text-[var(--accent-light)] [&_*:focus-visible]:outline-white"
      >
        {/* Depth: a darker pool bottom-left, a lighter one top-right, and grain */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-1/3 -right-1/4 w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.14),transparent)]" />
          <div className="absolute -bottom-1/3 -left-1/4 w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(0,0,0,0.22),transparent)]" />
          <div className="paper-grain absolute inset-0 opacity-[0.08] mix-blend-overlay" />
        </div>
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Headline: words rise out of their masks */}
        <h2 className="mb-14 sm:mb-20 text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] font-normal text-white/75">
          <span className="block">
            <RevealWords text={t('contact.talkPrefix')} />
          </span>
          <span className="block">
            <RevealWords text={t('contact.talkHighlight')} delay={0.2} className="font-extrabold text-white" />
          </span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Form (open layout, like the rest of the site) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <form
              onSubmit={handleFormSubmit}
              noValidate={false}
              className="relative space-y-10"
            >
              {/* Topic: one tap instead of typing a subject */}
              <fieldset>
                <legend className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                  {lang === 'fr' ? 'Votre demande concerne' : 'This is about'}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {TOPICS[lang].map((topic) => {
                    const selected = formData.subject === topic;
                    return (
                      <button
                        key={topic}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setFormData({ ...formData, subject: selected ? '' : topic })}
                        className={`font-syne h-10 px-4 rounded-full text-sm font-bold border transition active:scale-[0.97] cursor-pointer ${
                          selected
                            ? 'bg-white border-white text-[var(--accent-light)]'
                            : 'border-white/40 text-white hover:border-white hover:bg-white/10'
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-9">
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

              <FloatingField
                id="contact-message"
                name="message"
                label={lang === 'fr' ? 'Parlez-moi de votre projet' : 'Tell me about your project'}
                multiline
                required
                value={formData.message}
                onChange={(v) => setFormData({ ...formData, message: v })}
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
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
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
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          {lang === 'fr' ? 'Envoi…' : 'Sending…'}
                        </>
                      ) : submitStatus === 'success' ? (
                        <>
                          <Check className="w-4 h-4" aria-hidden="true" />
                          {lang === 'fr' ? 'Message envoyé' : 'Message sent'}
                        </>
                      ) : (
                        t('contact.sendBtn')
                      )}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>
            </form>
          </motion.div>

          {/* Direct contact: three big rows, a white band sweeps across on hover */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              {lang === 'fr' ? 'Ou directement' : 'Or directly'}
            </p>
            <ul className="border-t border-white/25">
              <ContactRow
                icon={<Mail className="w-5 h-5" />}
                label={copied ? (lang === 'fr' ? 'Copié !' : 'Copied!') : lang === 'fr' ? 'Email · cliquer pour copier' : 'Email · click to copy'}
                value={PRIMARY_EMAIL}
                href={`mailto:${PRIMARY_EMAIL}`}
                onClick={copyEmailToClipboard}
                ariaLabel={lang === 'fr' ? `Copier l'adresse ${PRIMARY_EMAIL}` : `Copy the address ${PRIMARY_EMAIL}`}
                trailing={<Copy className="w-4 h-4" />}
              />
              <ContactRow
                icon={<Phone className="w-5 h-5" />}
                label={lang === 'fr' ? 'Téléphone' : 'Phone'}
                value={USER_INFO.phone}
                href={`tel:${USER_INFO.phone.replace(/\s/g, '')}`}
              />
              <ContactRow
                icon={<Linkedin className="w-5 h-5" />}
                label="LinkedIn"
                value="in/leone-luca"
                href={USER_INFO.linkedin}
                external
              />
            </ul>
            {/* Copy confirmation for screen readers */}
            <span className="sr-only" role="status" aria-live="polite">{copied ? (lang === 'fr' ? 'Adresse copiée' : 'Address copied') : ''}</span>
          </motion.div>
        </div>

        {/* Minimal Clean Footer with WCAG AAA Compliant High Contrast */}
        <footer className="mt-20 pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white inline-flex items-baseline">
              Luca Leone<span className="text-[#0A0A0C] font-bold">.</span>
            </span>
            <span className="font-medium text-white/80">© {new Date().getFullYear()}</span>
            <span className="text-white/50">·</span>
            <span className="font-medium text-white/80">HEIG-VD</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link
              href={sectionPath(lang, 'projets')}
              className="text-white/80 hover:text-white transition-colors font-medium"
            >
              {t('nav.projects')}
            </Link>
            <Link
              href={sectionPath(lang, 'a-propos')}
              className="text-white/80 hover:text-white transition-colors font-medium"
            >
              {t('nav.about')}
            </Link>
            <a
              href={USER_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors font-medium"
            >
              LinkedIn
            </a>
            <button
              type="button"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                })
              }
              className="font-syne inline-flex items-center gap-1.5 font-bold text-white hover:text-white/70 transition-colors cursor-pointer"
            >
              {lang === 'fr' ? 'Retour en haut' : 'Back to top'} ↑
            </button>
          </div>
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
