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
      details: "Multidisciplinary program focused on digital strategy and innovation, combining digital marketing, project management, requirements analysis, web development, and UI/UX design (web & mobile).\n\nEnabling end-to-end management of digital products: business understanding, strategy definition, user-centric solution design, and performance optimization.\n\nDeveloping technical skills (code, UX/UI, data, digital tools) and strategic vision (positioning, communication, performance marketing) with an impact-driven approach."
    },
    {
      period: '2023 - 2024',
      title: 'Specialized Baccalaureate in Communication & Information',
      institution: 'ERACOM',
      location: 'Lausanne, Switzerland',
      details: "Preparatory training for digital communication and media professions, with both a creative and practical approach.\n\nSkill development in project design, visual communication, interactive media, and audiovisual production through diverse formats: print & digital content, videos, and podcasts."
    },
    {
      period: '2020 – 2023',
      title: 'General Culture Certificate in Communication & Information',
      institution: "Gymnase d'Yverdon",
      location: 'Yverdon-les-Bains, Switzerland',
      details: "General secondary education with a specialized focus on information, communication, and digital media."
    }
  ];

  const experience = lang === 'fr' ? EXPERIENCE_TIMELINE : [
    {
      period: 'May 2026 - Present · 5 mos',
      title: 'Digital Communication Manager',
      company: 'Karting - Indépendant',
      location: 'Vuitebœuf, Vaud, Switzerland · Hybrid',
      description: `Developing online presence and brand strategy for the karting track:

• Social media management and growth (Instagram & TikTok)
• Field photo and video production (Reels, stories, visual assets)
• Highlighting racing championships, offers, events, and the ASK Academy
• Content copywriting, campaign design, and audience engagement`
    },
    {
      period: 'Jul 2022 · 1 mo',
      title: 'Intern',
      company: 'Groupe AFH Automobile - Stage',
      location: 'Yverdon-les-Bains, Switzerland · On-site',
      description: 'Commercial department immersion: client greeting and inquiries, lead and invoicing support, administrative management, and digital communication assistance.'
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
    <section id="a-propos" className="relative py-20 sm:py-28 border-b border-white/[0.06] bg-[#0A0A0C]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-white/[0.08] pb-6 mb-12 flex items-baseline gap-3.5"
        >
          <span className="font-serif italic text-2xl sm:text-3xl text-white/40 font-normal select-none">
            {t('about.index')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight font-extrabold">
            {t('about.title')}
          </h2>
        </motion.div>

        {/* 2-Column Clean Layout: Left = Photo & Bio & Distinct Languages/Passions, Right = Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Photo & Presentation with Scroll Animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-7"
          >
            {/* Photo Container with natural facial crop, zoom and interactive light sweep */}
            <div className="glass-shine-hover relative rounded-[2rem] overflow-hidden bg-[#141416] border border-white/[0.08] hover:border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.5)] aspect-[4/5] w-full group transition-all duration-300">
              <img
                src="/photo.jpeg"
                alt="Luca Leone"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-[center_14%] scale-[1.28] transition-transform duration-700 ease-out group-hover:scale-[1.32]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/Photo.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Profile Bio split into clear paragraphs */}
            <div className="space-y-4">
              {t('about.bio').split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* SEPARATED SECTION 1: LANGUES (Clean & Distinct) */}
            <div className="pt-4 border-t border-white/[0.08] space-y-4">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">
                <span>{t('about.languagesTitle')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages.map((item, idx) => (
                  <div
                    key={`lang-${idx}`}
                    className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-[#E4E4E7] flex items-center gap-1.5"
                  >
                    <span className="font-semibold text-white">{item.name}</span>
                    <span className="text-[#A1A1AA]">·</span>
                    <span className="text-[#A1A1AA]">{item.level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SEPARATED SECTION 2: PASSIONS (Clean & Distinct) */}
            <div className="pt-4 border-t border-white/[0.08] space-y-4">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">
                <span>{t('about.passionsTitle')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {passions.map((item, idx) => (
                  <span
                    key={`passion-${idx}`}
                    className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-white/90"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Timelines Formations & Expériences with Scroll Animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-12"
          >
            {/* Formation & Éducation */}
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1AA] mb-6 pb-3 border-b border-white/[0.08]">
                <span>{t('about.educationTitle')}</span>
              </div>

              <div className="space-y-4">
                {education.map((item, idx) => (
                  <div
                    key={`edu-${idx}`}
                    className="glass-shine-hover p-5 sm:p-6 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/20 transition-all duration-300 group shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-white transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-xs font-bold text-[#CCFF00] tracking-wide">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] font-medium">
                      {item.institution} · {item.location}
                    </p>
                    <div className="text-xs sm:text-sm text-[#A1A1AA] mt-3 space-y-2 leading-relaxed">
                      {item.details.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expérience professionnelle */}
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1AA] mb-6 pb-3 border-b border-white/[0.08]">
                <span>{t('about.experienceTitle')}</span>
              </div>

              <div className="space-y-4">
                {experience.map((item, idx) => (
                  <div
                    key={`exp-${idx}`}
                    className="glass-shine-hover p-5 sm:p-6 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/20 transition-all duration-300 group shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-white transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-xs font-bold text-[#CCFF00] tracking-wide">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] font-medium">
                      {item.company} {item.location ? `· ${item.location}` : ''}
                    </p>
                    <div className="text-xs sm:text-sm text-[#A1A1AA] mt-3 space-y-2.5 leading-relaxed">
                      {item.description.split('\n\n').map((paragraph, pIdx) => {
                        if (paragraph.includes('•')) {
                          const lines = paragraph.split('\n').filter((l) => l.trim().length > 0);
                          return (
                            <ul key={pIdx} className="space-y-2 my-2.5 pl-0.5">
                              {lines.map((line, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-2.5 text-white/85">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] mt-1.5 shrink-0" />
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
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
