import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { USER_INFO } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export function ContactSection() {
  const { lang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const PRIMARY_EMAIL = 'luca@luca-leone.ch';

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(PRIMARY_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

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
          _subject: formData.subject || `Nouveau message - Portfolio Luca Leone (${formData.name})`,
          _replyto: formData.email,
          _captcha: 'false',
          _template: 'table'
        })
      });

      const data = await response.json().catch(() => ({}));
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      if (data?.message && typeof data.message === 'string' && data.message.toLowerCase().includes('activation')) {
        setStatusMessage(
          lang === 'fr'
            ? "Message transmis ! Un premier email d'activation a été envoyé à votre adresse pour autoriser la réception."
            : "Message transmitted! An activation email has been sent to confirm receipt."
        );
      } else {
        setStatusMessage(
          lang === 'fr'
            ? "Votre message a bien été envoyé directement à Luca Leone !"
            : "Your message has been sent directly to Luca Leone!"
        );
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
        
        {/* Massive Typographic Headline with Clean High Contrast */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 sm:mb-20"
        >
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] font-normal text-neutral-900 dark:text-white">
            {t('contact.talkPrefix')} <br />
            <span className="font-extrabold text-[var(--accent)]">
              {t('contact.talkHighlight')}
            </span>
          </h2>
        </motion.div>

        {/* 2-Column Minimalist Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Underline Form Fields */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <form onSubmit={handleFormSubmit} className="space-y-8 sm:space-y-10">
              {/* Nom */}
              <div className="relative group">
                <input
                  type="text"
                  required
                  placeholder={t('contact.namePlaceholder')}
                  aria-label={t('contact.namePlaceholder') || 'Votre nom'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pb-3 bg-transparent border-b border-black/20 dark:border-white/20 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/35 text-base sm:text-lg focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <input
                  type="email"
                  required
                  placeholder={t('contact.emailPlaceholder')}
                  aria-label={t('contact.emailPlaceholder') || 'Votre adresse email'}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pb-3 bg-transparent border-b border-black/20 dark:border-white/20 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/35 text-base sm:text-lg focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>

              {/* Sujet */}
              <div className="relative group">
                <input
                  type="text"
                  placeholder={t('contact.subjectPlaceholder')}
                  aria-label={t('contact.subjectPlaceholder') || 'Sujet'}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full pb-3 bg-transparent border-b border-black/20 dark:border-white/20 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/35 text-base sm:text-lg focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>

              {/* Message */}
              <div className="relative group">
                <textarea
                  required
                  rows={4}
                  placeholder={t('contact.messagePlaceholder')}
                  aria-label={t('contact.messagePlaceholder') || 'Votre message'}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full pb-3 bg-transparent border-b border-black/20 dark:border-white/20 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-white/35 text-base sm:text-lg focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                />
              </div>

              {/* Submit Status Feedback */}
              <AnimatePresence>
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast-text)]"
                  >
                    <div className="text-xs sm:text-sm leading-relaxed font-medium">
                      {statusMessage}
                    </div>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
                  >
                    <div className="text-xs sm:text-sm leading-relaxed font-medium">
                      {statusMessage}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button: Pill Button with Loading State */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-4 px-10 rounded-full bg-[var(--accent)] text-[var(--accent-contrast-text)] hover:opacity-90 disabled:opacity-50 font-syne font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer disabled:cursor-not-allowed shadow-xs active:scale-98 inline-flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <span>{lang === 'fr' ? 'Envoi du message...' : 'Sending message...'}</span>
                  ) : (
                    <span>{t('contact.sendBtn')}</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Right Column: EMAIL DIRECT & LinkedIn with clean typography & line dividers */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-12 lg:pl-6"
          >
            {/* EMAIL DIRECT */}
            <div>
              <span className="block text-xs uppercase font-bold tracking-[0.2em] text-neutral-600 dark:text-neutral-300 mb-3">
                {t('contact.directEmailLabel')}
              </span>
              <a
                href={`mailto:${PRIMARY_EMAIL}`}
                className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white hover:text-[var(--accent)] transition-colors block break-all font-sans"
              >
                {PRIMARY_EMAIL}
              </a>
              <button
                type="button"
                onClick={copyEmailToClipboard}
                className="mt-3 inline-flex items-center px-4 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-neutral-800 border border-black/10 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-xs font-syne font-bold dark:text-white/80 transition-colors cursor-pointer dark:border-white/10"
              >
                {copied ? (
                  <span className="text-[var(--accent)] font-bold">{lang === 'fr' ? 'Email copié !' : 'Email copied!'}</span>
                ) : (
                  <span>{lang === 'fr' ? "Copier l'email" : 'Copy email'}</span>
                )}
              </button>
            </div>

            {/* NUMÉRO DIRECT */}
            <div>
              <span className="block text-xs uppercase font-bold tracking-[0.2em] text-neutral-600 dark:text-neutral-300 mb-3">
                {t('contact.directPhoneLabel')}
              </span>
              <a
                href={`tel:${USER_INFO.phone.replace(/\s/g, '')}`}
                className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white hover:text-[var(--accent)] transition-colors block font-sans"
              >
                {USER_INFO.phone}
              </a>
            </div>

            {/* RÉSEAUX SOCIAUX - LinkedIn Only */}
            <div>
              <span className="block text-xs uppercase font-bold tracking-[0.2em] text-neutral-600 dark:text-neutral-300 mb-4">
                {t('contact.socialLabel')}
              </span>

              <div className="divide-y divide-black/10 dark:divide-white/15">
                {/* LinkedIn */}
                <a
                  href={USER_INFO.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-4 text-base sm:text-lg font-semibold text-neutral-900 dark:text-white hover:text-[var(--accent)] transition-colors"
                >
                  <span>LinkedIn</span>
                  <span className="text-neutral-600 dark:text-neutral-300 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </a>
              </div>
            </div>

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
            <a
              href="#projets"
              className="text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors font-medium"
            >
              {t('nav.projects')}
            </a>
            <a
              href="#a-propos"
              className="text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors font-medium"
            >
              {t('nav.about')}
            </a>
            <a
              href={USER_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors font-medium"
            >
              LinkedIn
            </a>

            {/* Discrete Theme Toggle in Footer */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer opacity-90 hover:opacity-100"
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              aria-label="Basculer le thème"
            >
              {theme === 'dark' ? (
                <Sun className="w-3 h-3 text-[var(--accent)]" />
              ) : (
                <Moon className="w-3 h-3 text-neutral-700" />
              )}
              <span className="font-syne font-bold text-[10px] tracking-wide uppercase">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}
