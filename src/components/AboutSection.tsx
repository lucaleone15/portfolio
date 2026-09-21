import { motion } from 'motion/react';
import { EDUCATION_TIMELINE, EXPERIENCE_TIMELINE } from '../data/portfolioData';
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
      period: 'May 2026 - Present · 5 mos',
      title: 'Digital Communication Manager',
      company: 'Karting - Indépendant',
      location: 'Vuitebœuf, Vaud, Switzerland · Hybrid',
      description: 'Brand strategy & social media (Instagram, TikTok), on-track photo/video production, and event campaigns.'
    },
    {
      period: 'Jul 2022 · 1 mo',
      title: 'Intern',
      company: 'Groupe AFH Automobile - Stage',
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

  return (
    <section id="a-propos" className="relative py-20 sm:py-28 border-b border-black/[0.06] dark:border-white/[0.06] bg-[#F9F9FB] dark:bg-[#0A0A0C] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-black/[0.08] dark:border-white/[0.08] pb-6 mb-12 flex items-baseline gap-3.5"
        >
          <span className="font-serif italic text-2xl sm:text-3xl text-neutral-400 dark:text-white/40 font-normal select-none">
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
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex justify-center lg:justify-start"
          >
            <div className="relative rounded-2xl overflow-hidden bg-neutral-200 dark:bg-[#141416] aspect-[4/5] max-w-sm sm:max-w-md w-full shadow-2xl border border-black/5 dark:border-white/5">
              <img
                src="/photo.jpeg"
                alt="Luca Leone"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-[center_14%] scale-[1.28] transition-transform duration-700 ease-out hover:scale-[1.32]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/Photo.jpg';
                }}
              />
            </div>
          </motion.div>

          {/* Profile & Bio: right next to the photo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#A1A1AA] pb-2 border-b border-black/[0.08] dark:border-white/[0.08] mb-3">
                <span>{lang === 'fr' ? 'Profil & Vision' : 'Profile & Vision'}</span>
              </div>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-syne font-black text-neutral-900 dark:text-white tracking-tight">
                Luca Leone
              </h3>
            </div>

            {/* Profile Bio paragraphs */}
            <div className="space-y-4">
              {t('about.bio').split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-sm sm:text-base text-neutral-700 dark:text-[#D4D4D8] leading-relaxed">
                  {paragraph}
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
                <div className="flex flex-wrap gap-2">
                  {languages.map((item, idx) => (
                    <div
                      key={`lang-${idx}`}
                      className="group/lang relative h-8 px-3.5 rounded-full bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-[#CCFF00] dark:hover:text-black text-xs font-syne font-bold inline-flex items-center gap-1.5 shadow-xs transition-all duration-200 cursor-default select-none border border-transparent hover:border-[#CCFF00]/40"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] shrink-0" />
                      <span className="font-syne font-bold">{item.name}</span>
                      <span className="max-w-0 opacity-0 group-hover/lang:max-w-xs group-hover/lang:opacity-100 transition-all duration-200 overflow-hidden whitespace-nowrap opacity-80 font-syne font-medium pl-0.5">
                        · {item.level}
                      </span>
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
                      className="h-8 px-3.5 rounded-full bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-[#CCFF00] dark:hover:text-black text-xs font-syne font-bold inline-flex items-center shadow-xs transition-colors duration-150 select-none cursor-default"
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
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#A1A1AA] pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
                <span>{t('about.experienceTitle')}</span>
              </div>

              <div className="space-y-6">
                {experience.map((item, idx) => (
                  <div
                    key={`exp-${idx}`}
                    className="pb-6 border-b border-black/[0.06] dark:border-white/[0.06] last:border-b-0 last:pb-0 transition-colors duration-200 group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-black dark:group-hover:text-[#CCFF00] transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-xs font-bold text-neutral-900 dark:text-[#CCFF00] tracking-wide">
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
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] border border-black/20 dark:border-none shadow-[0_0_4px_rgba(204,255,0,0.5)] mt-1.5 shrink-0" />
                                  <span>{line.replace(/^•\s*/, '')}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return <p key={pIdx}>{paragraph}</p>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Formation & Éducation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-[#A1A1AA] pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
                <span>{t('about.educationTitle')}</span>
              </div>

              <div className="space-y-6">
                {education.map((item, idx) => (
                  <div
                    key={`edu-${idx}`}
                    className="pb-6 border-b border-black/[0.06] dark:border-white/[0.06] last:border-b-0 last:pb-0 transition-colors duration-200 group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-black dark:group-hover:text-[#CCFF00] transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-xs font-bold text-neutral-900 dark:text-[#CCFF00] tracking-wide">
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
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
