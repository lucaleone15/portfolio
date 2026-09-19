import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Filter } from 'lucide-react';
import { Project } from '../types';
import { PROJECTS_FR, PROJECTS_EN } from '../data/portfolioData';
import { ProjectCard } from './ProjectCard';
import { useLanguage } from '../context/LanguageContext';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
}

export function ProjectsSection({ onSelectProject }: ProjectsSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showAllFilterPills, setShowAllFilterPills] = useState<boolean>(false);
  const { lang, t } = useLanguage();

  const currentProjects = lang === 'fr' ? PROJECTS_FR : PROJECTS_EN;

  const categories = lang === 'fr' ? [
    { id: 'all', label: 'Tous les projets' },
    { id: 'pulse-app', label: 'Mobile App' },
    { id: 'lumen-studio', label: 'E-Commerce' },
    { id: 'karting-vuiteboeuf', label: 'Communication & Réseaux' },
    { id: 'nova-editorial', label: 'Développement Web' },
  ] : [
    { id: 'all', label: 'All projects' },
    { id: 'pulse-app', label: 'Mobile App' },
    { id: 'lumen-studio', label: 'E-Commerce' },
    { id: 'karting-vuiteboeuf', label: 'Media & Social' },
    { id: 'nova-editorial', label: 'Web Development' },
  ];

  const filteredProjects = selectedFilter === 'all'
    ? currentProjects
    : currentProjects.filter((p) => p.id === selectedFilter);

  return (
    <section id="projets" className="py-20 sm:py-28 border-b border-white/[0.06] bg-[#0A0A0C]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Section Header: Index "01" + "Projects" + Filter pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-12"
        >
          <div className="flex items-baseline gap-3.5">
            <span className="font-serif italic text-2xl sm:text-3xl text-white/40 font-normal select-none">
              {t('projects.index')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight font-extrabold">
              {t('projects.title')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllFilterPills(!showAllFilterPills)}
              className={`px-5 py-2.5 rounded-full border text-xs sm:text-sm font-syne font-bold transition-all duration-200 backdrop-blur-md inline-flex items-center gap-2 cursor-pointer ${
                showAllFilterPills
                  ? 'bg-white text-black border-white shadow-xs'
                  : 'bg-white/[0.05] hover:bg-white text-white hover:text-black border-white/20'
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
          <div className="flex flex-wrap gap-2 mb-10 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md animate-in fade-in duration-200">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`text-xs px-4 py-2 rounded-full transition-all cursor-pointer font-syne font-bold ${
                  selectedFilter === cat.id
                    ? 'bg-white text-black shadow-xs'
                    : 'bg-white/[0.05] hover:bg-white/[0.12] text-[#A1A1AA] hover:text-white border border-white/[0.08]'
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: (idx % 2) * 0.12, ease: [0.16, 1, 0.3, 1] }}
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
