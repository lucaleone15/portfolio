import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { usePrinting } from '../print';
import { ArrowDown01Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { Icon } from './Icon';
import { useLanguage } from '../context/LanguageContext';
import { useSite } from '../content/ContentContext';
import { useEditAttrs } from '../content/edit';

/** A panel element coming in when its row opens (fade + rise; just the fade with reduced motion) */
const EASE = 'ease-[cubic-bezier(0.23,1,0.32,1)]';
const reveal = (open: boolean) =>
  `transition-[opacity,translate,clip-path] duration-600 ${EASE} ${
    open ? 'opacity-100 translate-y-0 [clip-path:inset(0_0_0_0)]' : 'opacity-0 motion-safe:translate-y-3 motion-safe:[clip-path:inset(0_0_100%_0)]'
  }`;
/** The keywords pop in with a slight overshoot */
const pop = (open: boolean) =>
  `transition-[opacity,scale,translate] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
    open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 motion-safe:scale-75 motion-safe:translate-y-1'
  }`;

export function SkillsSection() {
  const { lang } = useLanguage();
  const { skills } = useSite();
  // Admin preview only: what can be edited in place
  const edit = useEditAttrs();
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  // On paper every skill is open (there's no hover to reveal them)
  const printing = usePrinting();

  const toggleSkill = (id: string) => {
    setActiveSkillId((prev) => (prev === id ? null : id));
  };

  // Mouse/trackpad: open on hover. Touch: open on tap (emulated mouseenter is ignored there,
  // otherwise a tap would open then immediately close the row).
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    setCanHover(query.matches);
    const onChange = (e: MediaQueryListEvent) => setCanHover(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Hover intent: a short delay so sweeping the pointer across rows doesn't open each one
  // (opening one row shifts the others under the pointer).
  const hoverTimer = useRef<number | undefined>(undefined);
  const openOnHover = (id: string) => {
    if (!canHover) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setActiveSkillId(id), 120);
  };
  const cancelHover = () => window.clearTimeout(hoverTimer.current);
  const closeOnLeave = () => {
    if (!canHover) return;
    cancelHover();
    setActiveSkillId(null);
  };
  useEffect(() => cancelHover, []);

  return (
    <section
      id="competences"
      className="relative py-20 sm:py-28 bg-[#F9F9FB] dark:bg-[#0A0A0C] border-b border-black/[0.06] dark:border-white/[0.06] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Section Header with smooth entrance */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.18]">
            {lang === 'fr' ? (
              <>
                Savoir-faire alliant{' '}
                <span className="text-[var(--accent)]">créativité</span> et{' '}
                <span className="text-[var(--accent)]">technique</span>.
              </>
            ) : (
              <>
                Expertise bridging{' '}
                <span className="text-[var(--accent)]">design</span> and{' '}
                <span className="text-[var(--accent)]">technology</span>.
              </>
            )}
          </h2>
        </motion.div>

        {/* Skills list: number + title by default; description and tools open on hover (mouse)
            or tap (touch). */}
        <div
          onMouseLeave={closeOnLeave}
          className="divide-y divide-black/10 dark:divide-white/10 border-y border-black/10 dark:border-white/10"
        >
          {skills.map((skill, index) => {
            const isOpen = printing || activeSkillId === skill.id;
            const panelId = `skill-panel-${skill.id}`;

            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: [0.16, 1, 0.3, 1]
                }}
                onMouseEnter={() => openOnHover(skill.id)}
                onMouseLeave={cancelHover}
                className={`group transition-colors duration-300 ${isOpen ? 'bg-black/[0.02] dark:bg-white/[0.02]' : ''}`}
              >
                {/* The whole row is clickable for the mouse; the <button> carries keyboard + a11y.
                    Its click bubbles here, so it toggles exactly once. */}
                <div
                  onClick={(e) => {
                    // e.detail === 0: keyboard activation of the <button> → toggle
                    if (canHover && e.detail > 0) {
                      cancelHover();
                      setActiveSkillId(skill.id);
                    } else {
                      toggleSkill(skill.id);
                    }
                  }}
                  className="relative py-7 sm:py-8 pl-4 sm:pl-6 pr-14 sm:pr-20 cursor-pointer select-none"
                >
                  {/* An accent line draws itself under the open row */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 right-0 -bottom-px h-0.5 bg-[var(--accent)] origin-left transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      isOpen ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                  {/* The row opens: a chevron at its end, set in from the edge, turned up once open */}
                  <span
                    aria-hidden="true"
                    className={`absolute right-2 sm:right-6 top-7 sm:top-8 lg:top-1/2 lg:-translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-full transition-[rotate,color,background-color] duration-300 ${
                      isOpen
                        ? 'rotate-180 text-[var(--accent)] bg-[rgba(var(--accent-rgb),0.1)]'
                        : 'text-neutral-500 dark:text-white/60 group-hover:text-[var(--accent)] group-hover:bg-[rgba(var(--accent-rgb),0.08)]'
                    }`}
                  >
                    <Icon icon={ArrowDown01Icon} className="w-5 h-5" />
                  </span>
                  <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 items-start lg:items-center">
                    {/* Index + Titre principal */}
                    <h3 className="lg:col-span-5">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className={`flex items-baseline gap-4 sm:gap-6 text-left w-full cursor-pointer rounded-md motion-safe:transition-[translate] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                          isOpen ? 'lg:translate-x-3' : 'lg:group-hover:translate-x-3'
                        }`}
                      >
                        <span
                          className={`index-number text-base sm:text-lg transition-colors duration-200 ${
                            isOpen
                              ? 'text-[var(--accent)]'
                              : 'text-neutral-500 dark:text-white/60 group-hover:text-[var(--accent)]'
                          }`}
                        >
                          {skill.number}
                        </span>
                        <span
                          {...edit(`skills.${index}.title`)}
                          className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight transition-colors duration-200 ${
                            isOpen
                              ? 'text-[var(--accent)]'
                              : 'text-neutral-900 dark:text-white group-hover:text-[var(--accent)]'
                          }`}
                        >
                          {skill.title}
                        </span>
                      </button>
                    </h3>

                    <div className="lg:col-span-7" id={panelId}>
                      {/* Large screens: the panel keeps its room while closed, so a row never changes
                          height, it only fades in. Smaller ones: it opens under the title (the
                          grid row grows from 0 to its content's height). */}
                      <div
                        aria-hidden={!isOpen}
                        className={`grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                          isOpen ? 'grid-rows-[1fr] opacity-100 visible' : 'grid-rows-[0fr] lg:grid-rows-[1fr] opacity-0 invisible'
                        }`}
                      >
                        <div className="min-h-0 overflow-hidden space-y-4">
                          {/* Opening: the text is uncovered from the bottom, then the keywords pop in one by one */}
                          <p
                            {...edit(`skills.${index}.desc`)}
                            className={`text-sm sm:text-base text-neutral-600 dark:text-[#A1A1AA] leading-relaxed max-w-2xl ${reveal(isOpen)}`}
                            style={{ transitionDelay: isOpen ? '120ms' : '0ms' }}
                          >
                            {skill.desc}
                          </p>

                          {/* Tags des outils */}
                          <div className="flex flex-wrap gap-2 pt-1 pb-1">
                            {skill.tools.map((tool, t) => (
                              <span
                                key={tool}
                                {...edit(`skills.${index}.tools.${t}`)}
                                className={`h-7 px-3 rounded-full text-xs font-medium inline-flex items-center bg-black/[0.05] text-neutral-800 dark:bg-white/[0.08] dark:text-neutral-200 ${pop(isOpen)}`}
                                style={{ transitionDelay: isOpen ? `${260 + t * 70}ms` : '0ms' }}
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
