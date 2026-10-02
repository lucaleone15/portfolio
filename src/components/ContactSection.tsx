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
    <section id="contact" className="relative py-20 sm:py-28 overflow-hidden bg-[#F9F9FB] dark:bg-[#0A0A0C] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Headline: words rise out of their masks */}
        <h2 className="mb-14 sm:mb-20 text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] font-normal text-neutral-900 dark:text-white">
          <span className="block">
            <RevealWords text={t('contact.talkPrefix')} />
          </span>
          <span className="block">
            <RevealWords text={t('contact.talkHighlight')} delay={0.2} className="font-extrabold text-[var(--accent)]" />
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
                <legend className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#A1A1AA]">
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
                            ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-contrast-text)]'
                            : 'border-black/15 dark:border-white/15 text-neutral-700 dark:text-[#D4D4D8] hover:border-black/40 dark:hover:border-white/40'
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
                      className={`text-sm font-medium ${submitStatus === 'error' ? 'text-red-600 dark:text-red-400' : 'text-neutral-700 dark:text-[#D4D4D8]'}`}
                    >
                      {statusMessage}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-5">
                <p className="text-xs text-neutral-500 dark:text-[#A1A1AA]">
                  {lang === 'fr' ? '* Nom, email et message requis.' : '* Name, email and message required.'}
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="font-syne relative min-w-[15rem] h-14 px-10 rounded-full bg-[var(--accent)] text-[var(--accent-contrast-text)] hover:opacity-90 disabled:cursor-wait font-bold text-sm tracking-wide transition duration-200 cursor-pointer shadow-xs active:scale-[0.97] inline-flex items-center justify-center overflow-hidden"
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

          {/* Direct contact: three big rows, an accent band sweeps across on hover */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#A1A1AA]">
              {lang === 'fr' ? 'Ou directement' : 'Or directly'}
            </p>
            <ul className="border-t border-black/10 dark:border-white/10">
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
        <footer className="mt-20 pt-8 border-t border-black/[0.08] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-700 dark:text-neutral-300">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-white inline-flex items-baseline">
              Luca Leone<span className="text-[var(--accent)] font-bold">.</span>
            </span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">© {new Date().getFullYear()}</span>
            <span className="text-neutral-400 dark:text-neutral-500">·</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">HEIG-VD</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link
              href={sectionPath(lang, 'projets')}
              className="text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors font-medium"
            >
              {t('nav.projects')}
            </Link>
            <Link
              href={sectionPath(lang, 'a-propos')}
              className="text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors font-medium"
            >
              {t('nav.about')}
            </Link>
            <a
              href={USER_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors font-medium"
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
              className="font-syne inline-flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white hover:text-[var(--accent)] dark:hover:text-[var(--accent)] transition-colors cursor-pointer"
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
    </section>
  );
}
