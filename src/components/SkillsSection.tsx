import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePrinting } from '../print';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { Icon } from './Icon';
import { useLanguage } from '../context/LanguageContext';
import { useSite } from '../content/ContentContext';
import { useEditAttrs } from '../content/edit';

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
          <div className="flex items-center gap-2 mb-3">
            <span className="eyebrow sm:text-sm text-[var(--accent)]">
              {lang === 'fr' ? 'Compétences' : 'Skills & Capabilities'}
            </span>
          </div>
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
                className={`group transition-colors duration-200 ${
                  isOpen ? 'bg-black/[0.02] dark:bg-white/[0.02]' : ''
                }`}
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
                  className="py-7 sm:py-8 cursor-pointer select-none"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 items-start">
                    {/* Index + Titre principal */}
                    <h3 className="lg:col-span-5">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="flex items-baseline gap-4 sm:gap-6 text-left w-full cursor-pointer rounded-md"
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
                      <AnimatePresence initial={false}>
                        {isOpen ? (
                          <motion.div
                            key="content"
                            // Printing: shown at once, no height animation the paper would freeze at 0
                            initial={printing ? false : { opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0, transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } }}
                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                            className="space-y-4 overflow-hidden"
                          >
                            <p {...edit(`skills.${index}.desc`)} className="text-sm sm:text-base text-neutral-600 dark:text-[#A1A1AA] leading-relaxed max-w-2xl">
                              {skill.desc}
                            </p>

                            {/* Tags des outils */}
                            <div className="flex flex-wrap gap-2 pt-1 pb-1">
                              {skill.tools.map((tool) => (
                                <span
                                  key={tool}
                                  className="h-7 px-3 rounded-full text-xs font-medium inline-flex items-center bg-black/[0.05] text-neutral-800 dark:bg-white/[0.08] dark:text-neutral-200"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          <div className="hidden lg:flex items-center h-8 text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
                            <span>{lang === 'fr' ? 'Survoler pour afficher' : 'Hover to reveal'}</span>
                          </div>
                        )}
                      </AnimatePresence>
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
