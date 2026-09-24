import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Filter } from 'lucide-react';
import { Project } from '../types';
import { getCustomProjects } from '../data/projectsStorage';
import { ProjectCard } from './ProjectCard';
import { useLanguage } from '../context/LanguageContext';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
}

export function ProjectsSection({ onSelectProject }: ProjectsSectionProps) {
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
            <span className="font-serif italic text-2xl sm:text-3xl text-neutral-400 dark:text-white/40 font-normal select-none">
              {t('projects.index')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-neutral-900 dark:text-white tracking-tight font-extrabold">
              {t('projects.title')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllFilterPills(!showAllFilterPills)}
              className={`px-5 py-2.5 rounded-full border text-xs sm:text-sm font-syne font-bold transition-all duration-200 backdrop-blur-md inline-flex items-center gap-2 cursor-pointer ${
                showAllFilterPills
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white shadow-xs'
                  : 'bg-black/[0.04] hover:bg-black text-neutral-900 hover:text-white border-black/15 dark:bg-white/[0.05] dark:hover:bg-white dark:text-white dark:hover:text-black dark:border-white/20'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{selectedFilter === 'all' ? t('projects.seeAll') : t('projects.reset')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Optional Filter Pills */}
        {showAllFilterPills && (
          <div className="flex flex-wrap gap-2 mb-10 py-2 animate-in fade-in duration-200">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`text-xs px-4 py-2 rounded-full transition-all cursor-pointer font-syne font-bold ${
                  selectedFilter === cat.id
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-black/[0.05] hover:bg-black text-neutral-600 hover:text-white dark:bg-white/[0.06] dark:hover:bg-white dark:text-[#A1A1AA] dark:hover:text-black'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Project Cards Grid with staggered scroll reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 35, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.7,
                delay: (idx % 2) * 0.12,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <ProjectCard
                project={project}
                onSelect={onSelectProject}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
