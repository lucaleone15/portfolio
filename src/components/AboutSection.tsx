import { motion } from 'motion/react';
import { EDUCATION_TIMELINE, EXPERIENCE_TIMELINE } from '../data/portfolioData';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export function AboutSection() {
  const { lang, t } = useLanguage();

  const education = lang === 'fr' ? EDUCATION_TIMELINE : [
    {
      period: '2024 - 2027',
      title: 'Bachelor of Science in Media Engineering',
      institution: 'HEIG-VD',
      location: 'Yverdon-les-Bains, Switzerland',
      details: "Digital strategy & innovation, web development, marketing, and user interface design (UX/UI)."
    },
    {
      period: '2023 - 2024',
      title: 'Specialized Baccalaureate in Communication & Information',
      institution: 'ERACOM',
      location: 'Lausanne, Switzerland',
      details: "Visual communication, interactive media, print & digital content creation, audiovisual formats."
    },
    {
      period: '2020 – 2023',
      title: 'General Culture Certificate in Communication & Information',
      institution: "Gymnase d'Yverdon",
      location: 'Yverdon-les-Bains, Switzerland',
      details: ''
    }
  ];

  const experience = lang === 'fr' ? EXPERIENCE_TIMELINE : [
    {
      period: 'May 2026 - Present',
      title: 'Digital Communication & Content Creation Manager',
      company: 'Karting de Vuiteboeuf',
      location: 'Vuitebœuf, Vaud, Switzerland · Hybrid',
      description: 'Brand strategy & social media (Instagram, TikTok), on-track photo/video production, and event campaigns.'
    },
    {
      period: 'July 2022 (1 month)',
      title: 'Intern',
      company: 'Groupe AFH Automobile',
      location: 'Yverdon-les-Bains, Switzerland · On-site',
      description: 'Customer relations, administrative support, and commercial digital communication management.'
    }
  ];

  const languages = lang === 'fr' ? [
    { name: 'Français', level: 'Langue maternelle' },
    { name: 'Anglais', level: 'Niveau C1' },
    { name: 'Italien', level: 'Niveau B2' }
  ] : [
    { name: 'French', level: 'Native language' },
    { name: 'English', level: 'C1 Level' },
    { name: 'Italian', level: 'B2 Level' }
  ];

  const passions = lang === 'fr'
    ? ['Automobile', 'Sport', 'Voyage', 'Technologies']
    : ['Automotive', 'Sports', 'Travel', 'Technology'];

  // Scroll-linked details (GSAP loaded on demand): bio words sharpen while read,
  // timeline rails draw and their dots light up as each step is passed
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      if (cancelled || !sectionRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          gsap.fromTo(
            '[data-bio] [data-word]',
            { opacity: 0.2 },
            {
              opacity: 1,
              ease: 'none',
              stagger: 0.05,
              scrollTrigger: { trigger: '[data-bio]', start: 'top 80%', end: 'bottom 55%', scrub: true },
            },
          );
          gsap.utils.toArray<HTMLElement>('[data-timeline]').forEach((timeline) => {
            gsap.fromTo(
              timeline.querySelector('[data-timeline-progress]'),
              { scaleY: 0 },
              { scaleY: 1, ease: 'none', scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 60%', scrub: true } },
            );
          });
        });
        // Dots light up (also with reduced motion: it's a state change, not movement)
        gsap.utils.toArray<HTMLElement>('[data-timeline-item]').forEach((item) => {
          ScrollTrigger.create({
            trigger: item,
            start: 'top 70%',
            onEnter: () => item.classList.add('timeline-lit'),
            onLeaveBack: () => item.classList.remove('timeline-lit'),
          });
        });
        return () => mm.revert();
      }, sectionRef);
      cleanup = () => ctx.revert();
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [lang]);

  return (
    <section ref={sectionRef} id="a-propos" className="relative py-20 sm:py-28 border-b border-black/[0.06] dark:border-white/[0.06] bg-[#F9F9FB] dark:bg-[#0A0A0C] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-black/[0.08] dark:border-white/[0.08] pb-6 mb-12 flex items-baseline gap-3.5"
        >
          <span className="font-serif italic text-2xl sm:text-3xl text-neutral-500 dark:text-white/40 font-normal select-none">
            {t('about.index')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-neutral-900 dark:text-white tracking-tight font-extrabold">
            {t('about.title')}
          </h2>
        </motion.div>

        {/* Top Block: Photo + Presentation/Profil side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-16 border-b border-black/[0.08] dark:border-white/[0.08]">
          {/* Photo: clean, zero overlay or badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex justify-center lg:justify-start"
          >
            <div className="relative rounded-2xl overflow-hidden bg-neutral-200 dark:bg-[#141416] aspect-[4/5] max-w-sm sm:max-w-md w-full shadow-2xl border border-black/5 dark:border-white/5">
              <img
                src="/photo.jpeg"
                alt="Portrait de Luca Leone - Étudiant en ingénierie des médias"
                width="448"
                height="560"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-[center_14%] scale-[1.6] transition-transform duration-700 ease-out hover:scale-[1.64]"
              />
            </div>
          </motion.div>

          {/* Profile & Bio: right next to the photo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#A1A1AA] pb-2 border-b border-black/[0.08] dark:border-white/[0.08] mb-3">
                <span>{lang === 'fr' ? 'Profil & Vision' : 'Profile & Vision'}</span>
              </div>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                Luca Leone
              </h3>
            </div>

            {/* Bio: each word sharpens from faint to full as it scrolls through the reading zone */}
            <div data-bio className="space-y-4">
              {t('about.bio').split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-base sm:text-lg text-neutral-800 dark:text-[#E4E4E7] leading-relaxed">
                  {paragraph.split(' ').map((word, w) => (
                    <span key={w} data-word>
                      {word}{' '}
                    </span>
                  ))}
                </p>
              ))}
            </div>

            {/* Langues & Centres d'intérêt */}
            <div className="pt-4 border-t border-black/[0.08] dark:border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Langues: only language name by default, level revealed on hover */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#A1A1AA]">
                  <span>{t('about.languagesTitle')}</span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {languages.map((item, idx) => (
                    <div
                      key={`lang-${idx}`}
                      className="h-8 px-3.5 rounded-full bg-neutral-900 text-white hover:bg-[var(--accent)] hover:text-[var(--accent-contrast-text)] dark:bg-white dark:text-black dark:hover:bg-[var(--accent)] dark:hover:text-[var(--accent-contrast-text)] text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors duration-150 cursor-default select-none"
                    >
                      <span>{item.name}</span>
                      <span className="text-white/60 dark:text-black/60 font-medium">· {item.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passions */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#A1A1AA]">
                  <span>{t('about.passionsTitle')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {passions.map((item, idx) => (
                    <span
                      key={`passion-${idx}`}
                      className="h-8 px-3.5 rounded-full bg-neutral-900 text-white hover:bg-[var(--accent)] hover:text-[var(--accent-contrast-text)] dark:bg-white dark:text-black dark:hover:bg-[var(--accent)] dark:hover:text-[var(--accent-contrast-text)] text-xs font-bold inline-flex items-center shadow-xs transition-colors duration-150 select-none cursor-default"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Block: Expériences & Formations en dessous */}
        <div className="pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Expérience professionnelle */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#A1A1AA] pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
                <span>{t('about.experienceTitle')}</span>
              </div>

              <div data-timeline className="relative space-y-8 pl-8">
                {/* Rail + progress drawn by the scroll */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-black/10 dark:bg-white/10" aria-hidden="true">
                  <div data-timeline-progress className="w-full h-full origin-top bg-[var(--accent)]" style={{ transform: 'scaleY(0)' }} />
                </div>
                {experience.map((item, idx) => (
                  <motion.div
                    key={`exp-${idx}`}
                    data-timeline-item
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative transition-colors duration-200 group"
                  >
                    <span data-dot className="timeline-dot absolute -left-8 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-black/20 dark:border-white/25 bg-[#F9F9FB] dark:bg-[#0A0A0C]" aria-hidden="true" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-2 mb-1.5">
                      <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-[var(--accent)] transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-xs font-bold text-[var(--accent)] tracking-wide shrink-0">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-[#A1A1AA] font-medium">
                      {item.company} {item.location ? `· ${item.location}` : ''}
                    </p>
                    <div className="text-xs sm:text-sm text-neutral-600 dark:text-[#A1A1AA] mt-3 space-y-2.5 leading-relaxed">
                      {item.description.split('\n\n').map((paragraph, pIdx) => {
                        if (paragraph.includes('•')) {
                          const lines = paragraph.split('\n').filter((l) => l.trim().length > 0);
                          return (
                            <ul key={pIdx} className="space-y-2 my-2.5 pl-0.5">
                              {lines.map((line, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-2.5 text-neutral-800 dark:text-white/85">
                                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 dark:bg-neutral-300 mt-1.5 shrink-0" />
                                  <span>{line.replace(/^•\s*/, '')}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return <p key={pIdx}>{paragraph}</p>;
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Formation & Éducation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#A1A1AA] pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
                <span>{t('about.educationTitle')}</span>
              </div>

              <div data-timeline className="relative space-y-8 pl-8">
                {/* Rail + progress drawn by the scroll */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-black/10 dark:bg-white/10" aria-hidden="true">
                  <div data-timeline-progress className="w-full h-full origin-top bg-[var(--accent)]" style={{ transform: 'scaleY(0)' }} />
                </div>
                {education.map((item, idx) => (
                  <motion.div
                    key={`edu-${idx}`}
                    data-timeline-item
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative transition-colors duration-200 group"
                  >
                    <span data-dot className="timeline-dot absolute -left-8 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-black/20 dark:border-white/25 bg-[#F9F9FB] dark:bg-[#0A0A0C]" aria-hidden="true" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-2 mb-1.5">
                      <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-[var(--accent)] transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-xs font-bold text-[var(--accent)] tracking-wide shrink-0">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-[#A1A1AA] font-medium">
                      {item.institution} · {item.location}
                    </p>
                    {item.details && item.details.trim().length > 0 && (
                      <div className="text-xs sm:text-sm text-neutral-600 dark:text-[#A1A1AA] mt-3 space-y-2 leading-relaxed">
                        {item.details.split('\n\n').map((paragraph, pIdx) => (
                          <p key={pIdx}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
