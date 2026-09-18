import { ArrowUpRight } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  key?: string | number;
  project: Project;
  onSelect: (project: Project) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <article
      onClick={() => onSelect(project)}
      className="group relative cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-1"
    >
      {/* Main Card Container: Transparent glass aesthetic with subtle clean borders and light sweep on hover */}
      <div className="glass-shine-hover relative w-full rounded-[2rem] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 backdrop-blur-xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col h-full p-4 sm:p-5">
        {/* Full-width Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.4rem] bg-[#121215] border border-white/[0.06]">
          <img
            src={project.imageUrl}
            alt={project.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>

        {/* Card Content Section */}
        <div className="pt-5 sm:pt-6 pb-2 px-1 flex flex-col justify-between flex-1 gap-3.5">
          {/* Header Row: Title & Subtitle on Left, Circle Arrow Button on Right */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-sans text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-white transition-colors truncate leading-snug">
                {project.title}
              </h3>
              {/* Date directly below title with green accent - no monochrome badge */}
              <div className="mt-1.5 flex items-baseline gap-2.5">
                <span className="text-xs font-bold text-[#CCFF00] tracking-wider shrink-0">{project.year}</span>
                <span className="text-xs font-medium text-[#A1A1AA] truncate">{project.subtitle}</span>
              </div>
            </div>

            {/* Circular Arrow Button with green accent on hover */}
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/20 bg-white/[0.05] text-white group-hover:bg-[#CCFF00] group-hover:text-black group-hover:border-[#CCFF00] flex items-center justify-center transition-colors duration-200 shrink-0 shadow-xs"
              aria-label={`Ouvrir le projet ${project.title}`}
            >
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>

          {/* Mini Description */}
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed line-clamp-2">
            {project.summary}
          </p>

          {/* Keywords / Tags with transparent pills */}
          <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
            {project.stack.slice(0, 4).map((keyword) => (
              <span
                key={keyword}
                className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/[0.04] text-[#D4D4D8] border border-white/[0.08]"
              >
                {keyword}
              </span>
            ))}
            {project.stack.length > 4 && (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.02] text-[#71717A] border border-white/[0.06]">
                +{project.stack.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
