import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowDown01Icon, FilterHorizontalIcon } from '@hugeicons/core-free-icons';
import { Icon } from './Icon';
import { getCustomProjects } from '../data/projectsStorage';
import { ProjectCard } from './ProjectCard';
import { useLanguage } from '../context/LanguageContext';

export function ProjectsSection() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showAllFilterPills, setShowAllFilterPills] = useState<boolean>(false);
  const projectsData = getCustomProjects();
  const { lang, t } = useLanguage();

  const currentProjects = lang === 'fr' ? projectsData.fr : projectsData.en;

  // Dynamically compute category filters based on current projects
  const uniqueCategories = Array.from(new Set(currentProjects.map((p) => p.category).filter(Boolean)));
  const categories = [
    { id: 'all', label: lang === 'fr' ? 'Tous les projets' : 'All projects' },
    ...uniqueCategories.map((cat) => ({ id: cat, label: cat }))
  ];

  // Mobile stack: as the next card slides over, the covered one recedes (scale + dim).
  // GSAP is loaded on demand; desktop and reduced motion keep the plain grid.
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      if (cancelled || !gridRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
          const cards = gsap.utils.toArray<HTMLElement>('[data-stack-card]');
          cards.slice(0, -1).forEach((card, i) => {
            gsap.to(card.querySelector('[data-stack-inner]'), {
              scale: 0.9,
              opacity: 0.35,
              ease: 'none',
              scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 76px', scrub: true },
            });
          });
        });
        return () => mm.revert();
      }, gridRef);
      cleanup = () => ctx.revert();
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [selectedFilter, lang]);

  const filteredProjects = selectedFilter === 'all'
    ? currentProjects
    : currentProjects.filter((p) => p.category === selectedFilter || p.id === selectedFilter);

  return (
    <section id="projets" className="py-20 sm:py-28 border-b border-black/[0.06] dark:border-white/[0.06] bg-[#F9F9FB] dark:bg-[#0A0A0C] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Section Header: Index "01" + "Projects" + Filter pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-6 mb-12"
        >
          <div className="flex items-baseline gap-3.5">
            <span className="font-serif italic text-2xl sm:text-3xl text-neutral-500 dark:text-white/40 font-normal select-none">
              {t('projects.index')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-neutral-900 dark:text-white tracking-tight font-extrabold">
              {t('projects.title')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllFilterPills(!showAllFilterPills)}
              aria-expanded={showAllFilterPills}
              className="glass font-syne px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-neutral-900 dark:text-white inline-flex items-center gap-2 cursor-pointer active:scale-[0.97]"
            >
              <Icon icon={FilterHorizontalIcon} className="w-4 h-4" />
              <span>{selectedFilter === 'all' ? t('projects.seeAll') : t('projects.reset')}</span>
              <Icon icon={ArrowDown01Icon} className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllFilterPills ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Optional Filter Pills */}
        {showAllFilterPills && (
          <div className="flex flex-wrap gap-2 mb-10 py-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`font-syne text-xs px-4 py-2 rounded-full transition cursor-pointer font-bold active:scale-[0.97] ${
                  selectedFilter === cat.id
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs'
                    : 'glass text-neutral-700 dark:text-[#D4D4D8]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Project Cards Grid with staggered scroll reveal */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 35, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.5,
                delay: (idx % 2) * 0.12,
                ease: [0.16, 1, 0.3, 1]
              }}
              // Mobile: cards stick under the header and the next one slides over (stack)
              data-stack-card
              className="sticky top-[76px] md:static"
            >
              <div data-stack-inner className="origin-top bg-[#F9F9FB] dark:bg-[#0A0A0C] pb-2">
                <ProjectCard project={project} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
