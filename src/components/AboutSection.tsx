import { ArrowUpRight01Icon, Pdf02Icon } from '@hugeicons/core-free-icons';
import { Icon } from './Icon';
import { motion } from 'motion/react';
import { useContact, useSite } from '../content/ContentContext';
import { useEditAttrs, useEditing } from '../content/edit';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * A bio paragraph: each word its own span (they sharpen while read); "**…**" marks what stands
 * out, in bold (see .bio-mark). Spaces stay plain text, so punctuation right after a marked
 * phrase sticks to it.
 */
function bioWords(paragraph: string) {
  const words = (text: string) => text.split(/(\s+)/).map((piece, i) => (!piece || /^\s+$/.test(piece) ? piece : <span key={i} data-word>{piece}</span>));
  return paragraph.split(/\*\*(.+?)\*\*/g).map((text, i) =>
    i % 2 ? (
      <strong key={i} className="bio-mark">
        {words(text)}
      </strong>
    ) : (
      <span key={i}>{words(text)}</span>
    ),
  );
}

export function AboutSection() {
  const { lang, t } = useLanguage();

  const { bio, quote, education, experience, languages, passions } = useSite().about;
  const contact = useContact();
  // Admin preview only: what can be edited in place
  const edit = useEditAttrs();
  const editing = useEditing();

  // Scroll-linked details (GSAP loaded on demand): bio words sharpen while read,
  // timeline rails draw and their dots light up as each step is passed
  const sectionRef = useRef<HTMLElement>(null);
  // Timeline dots light up (accent) once their step has come into view, and stay lit
  const [litSteps, setLitSteps] = useState<Set<string>>(() => new Set());
  const setLit = (key: string, on: boolean) =>
    setLitSteps((prev) => {
      if (prev.has(key) === on) return prev;
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  const dotClass = (key: string) =>
    `absolute -left-8 top-1.5 w-[15px] h-[15px] rounded-full transition-[background-color,box-shadow] duration-300 group-hover:bg-[var(--accent)] ${
      litSteps.has(key)
        ? 'bg-[var(--accent)] shadow-[0_0_0_4px_rgba(var(--accent-rgb),0.18),0_0_14px_rgba(var(--accent-rgb),0.5)]'
        : 'bg-neutral-300 dark:bg-neutral-700'
    }`;
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
              { scaleY: 1, ease: 'none', scrollTrigger: { trigger: timeline, start: 'top 65%', end: 'bottom 65%', scrub: true } },
            );
          });
        });
        // Each dot lights up when the drawn line reaches it (same 65% reading line), and
        // turns off again when scrolling back up
        gsap.utils.toArray<HTMLElement>('[data-timeline-item]').forEach((item) => {
          const key = item.dataset.timelineItem!;
          ScrollTrigger.create({
            trigger: item,
            start: 'top+=10 65%',
            onEnter: () => setLit(key, true),
            onLeaveBack: () => setLit(key, false),
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
          className="border-b border-black/[0.08] dark:border-white/[0.08] pb-6 mb-12 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-baseline gap-3.5">
            <span className="index-number text-2xl sm:text-3xl text-neutral-500 dark:text-white/40">
              {t('about.index')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-neutral-900 dark:text-white tracking-tight font-extrabold">
              {t('about.title')}
            </h2>
          </div>

          {/* CV: same place and style as the projects filter button */}
          <a
            href={contact.cv}
            target="_blank"
            rel="noopener"
            className="glass font-syne group px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-neutral-900 dark:text-white inline-flex items-center gap-2 cursor-pointer active:scale-[0.97]"
          >
            <Icon icon={Pdf02Icon} className="w-4 h-4" />
            {lang === 'fr' ? 'Voir mon CV' : 'View my CV'}
            <Icon icon={ArrowUpRight01Icon} className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span className="sr-only">{lang === 'fr' ? '(PDF, nouvel onglet)' : '(PDF, opens in a new tab)'}</span>
          </a>
        </motion.div>

        {/* Top Block: photo + quote, bio, languages side by side. On large screens the photo
            stretches to the column's height: its top on the quote's line, its bottom on the
            last row. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 lg:items-stretch pb-16 border-b border-black/[0.08] dark:border-white/[0.08]">
          {/* Photo: clean, zero overlay or badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex justify-center lg:justify-start"
          >
            <div className="relative rounded-2xl overflow-hidden bg-neutral-200 dark:bg-[#141416] aspect-[4/5] lg:aspect-auto max-w-sm sm:max-w-md lg:max-w-none w-full shadow-2xl">
              {/* Full-resolution original (1684×2528), sized so the frame always shows the same
                  band of it, from 10% to 70% of its height: room above the hair (which starts at
                  ~16%), cut at the chest, never the hands. Height 1/0.6, shifted up 0.1/0.6.
                  Small screens: a 4:5 frame; large ones: the text column's height. */}
              <img
                src="/photo.webp"
                alt="Portrait de Luca Leone - Étudiant en ingénierie des médias"
                width="448"
                height="560"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="absolute left-1/2 -translate-x-1/2 top-[-16.7%] h-[166.7%] w-auto max-w-none transition-transform duration-700 ease-out hover:scale-[1.03]"
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
            {/* A sentence of his own, in red between guillemets, in its own block between two
                hairlines (left out when empty) */}
            {(quote || editing) && (
              <blockquote
                {...edit('about.quote')}
                className="py-6 border-y border-black/[0.08] dark:border-white/[0.08] text-2xl sm:text-3xl font-extrabold tracking-tight leading-[1.18] text-[var(--accent)]"
              >
                <span aria-hidden="true">{lang === 'fr' ? '«\u202f' : '“'}</span>
                {quote || '(citation)'}
                <span aria-hidden="true">{lang === 'fr' ? '\u202f»' : '”'}</span>
              </blockquote>
            )}

            {/* Bio: each word sharpens from faint to full as it scrolls through the reading zone */}
            <div {...edit('about.bio')} data-bio className="space-y-4">
              {bio.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-base sm:text-lg text-neutral-800 dark:text-[#E4E4E7] leading-relaxed">
                  {bioWords(paragraph)}
                </p>
              ))}
            </div>


            {/* Langues & Centres d'intérêt: the rows come in one by one as the block is reached,
                each divider drawing itself from the left; on hover a row's name slides over
                behind a short accent dash */}
            <div className="pt-4 border-t border-black/[0.08] dark:border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Langues: plain rows (not pills: nothing here is clickable) */}
              <div className="space-y-3">
                <div className="eyebrow text-neutral-500 dark:text-[#A1A1AA]">
                  <span>{t('about.languagesTitle')}</span>
                </div>
                <ul>
                  {languages.map((item, idx) => (
                    <InfoRow key={`lang-${idx}`} index={idx} {...edit(`about.languages.${idx}`)}>
                      <RowName {...edit(`about.languages.${idx}.name`)}>{item.name}</RowName>
                      <span {...edit(`about.languages.${idx}.level`)} className="text-sm text-neutral-500 dark:text-[#A1A1AA]">{item.level}</span>
                    </InfoRow>
                  ))}
                </ul>
              </div>

              {/* Passions: the same plain rows as the languages, a beat later */}
              <div className="space-y-3">
                <div className="eyebrow text-neutral-500 dark:text-[#A1A1AA]">
                  <span>{t('about.passionsTitle')}</span>
                </div>
                <ul>
                  {passions.map((item, idx) => (
                    <InfoRow key={`passion-${idx}`} index={idx} delay={0.12} {...edit(`about.passions.${idx}`)}>
                      <RowName>{item}</RowName>
                    </InfoRow>
                  ))}
                </ul>
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
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
                {t('about.experienceTitle')}
              </h3>

              <div data-timeline className="relative space-y-8 pl-8">
                {/* Rail + progress drawn by the scroll */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-black/10 dark:bg-white/10" aria-hidden="true">
                  <div data-timeline-progress className="w-full h-full origin-top bg-[var(--accent)]" style={{ transform: 'scaleY(0)' }} />
                </div>
                {experience.map((item, idx) => (
                  <motion.div
                    key={`exp-${idx}`}
                    data-timeline-item={`exp-${idx}`}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative transition-colors duration-200 group"
                  >
                    <span className={dotClass(`exp-${idx}`)} aria-hidden="true" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-2 mb-1.5">
                      <h4 {...edit(`about.experience.${idx}.title`)} className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-[var(--accent)] transition-colors">
                        {item.title}
                      </h4>
                      <span {...edit(`about.experience.${idx}.period`)} className="text-xs font-bold text-[var(--accent)] tracking-wide shrink-0">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-[#A1A1AA] font-medium">
                      {editing ? (
                        // Admin preview: company and place as separate parts, each editable
                        <>
                          <span {...edit(`about.experience.${idx}.company`)}>{item.company}</span>{' '}
                          <span {...edit(`about.experience.${idx}.location`)}>{item.location ? `· ${item.location}` : '· (lieu)'}</span>
                        </>
                      ) : (
                        <>
                          {item.company} {item.location ? `· ${item.location}` : ''}
                        </>
                      )}
                    </p>
                    <div {...edit(`about.experience.${idx}.description`)} className="text-xs sm:text-sm text-neutral-600 dark:text-[#A1A1AA] mt-3 space-y-2.5 leading-relaxed">
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
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
                {t('about.educationTitle')}
              </h3>

              <div data-timeline className="relative space-y-8 pl-8">
                {/* Rail + progress drawn by the scroll */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-black/10 dark:bg-white/10" aria-hidden="true">
                  <div data-timeline-progress className="w-full h-full origin-top bg-[var(--accent)]" style={{ transform: 'scaleY(0)' }} />
                </div>
                {education.map((item, idx) => (
                  <motion.div
                    key={`edu-${idx}`}
                    data-timeline-item={`edu-${idx}`}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative transition-colors duration-200 group"
                  >
                    <span className={dotClass(`edu-${idx}`)} aria-hidden="true" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-2 mb-1.5">
                      <h4 {...edit(`about.education.${idx}.title`)} className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white group-hover:text-[var(--accent)] transition-colors">
                        {item.title}
                      </h4>
                      <span {...edit(`about.education.${idx}.period`)} className="text-xs font-bold text-[var(--accent)] tracking-wide shrink-0">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-[#A1A1AA] font-medium">
                      {editing ? (
                        <>
                          <span {...edit(`about.education.${idx}.institution`)}>{item.institution}</span>
                          {' · '}
                          <span {...edit(`about.education.${idx}.location`)}>{item.location || '(lieu)'}</span>
                        </>
                      ) : (
                        <>
                          {item.institution} · {item.location}
                        </>
                      )}
                    </p>
                    {item.details && item.details.trim().length > 0 && (
                      <div {...edit(`about.education.${idx}.details`)} className="text-xs sm:text-sm text-neutral-600 dark:text-[#A1A1AA] mt-3 space-y-2 leading-relaxed">
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

const ROW_EASE = [0.16, 1, 0.3, 1] as const;
// The divider follows its row's state: scaled to nothing, a line has no area to be "in view"
const rowVariants = {
  hidden: { opacity: 0, x: -14 },
  shown: (at: number) => ({ opacity: 1, x: 0, transition: { duration: 0.55, delay: at, ease: ROW_EASE } }),
};
const dividerVariants = {
  hidden: { scaleX: 0 },
  shown: (at: number) => ({ scaleX: 1, transition: { duration: 0.8, delay: at, ease: ROW_EASE } }),
};

/** A language or interest row: rises in after the ones above it, its divider drawn from the left */
function InfoRow({ index, delay = 0, children, ...attrs }: { index: number; delay?: number; children: ReactNode } & Record<string, unknown>) {
  const at = delay + index * 0.08;
  return (
    <motion.li
      {...attrs}
      variants={rowVariants}
      custom={at}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '-40px' }}
      className="group/row relative flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0"
    >
      {index > 0 && (
        <motion.span
          aria-hidden="true"
          variants={dividerVariants}
          custom={at}
          className="absolute left-0 right-0 top-0 h-px origin-left bg-black/[0.06] dark:bg-white/[0.06]"
        />
      )}
      {children}
    </motion.li>
  );
}

/** The row's name: on hover it slides right behind a short accent dash */
function RowName({ children, ...attrs }: { children: ReactNode } & Record<string, unknown>) {
  return (
    <span className="relative inline-flex items-baseline text-base font-semibold text-neutral-900 dark:text-white">
      <span
        aria-hidden="true"
        className="absolute left-0 top-1/2 h-0.5 w-3 -translate-y-1/2 origin-left scale-x-0 rounded-full bg-[var(--accent)] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/row:scale-x-100"
      />
      <span
        {...attrs}
        className="transition-[translate,color] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:group-hover/row:translate-x-5 group-hover/row:text-[var(--accent)]"
      >
        {children}
      </span>
    </span>
  );
}
