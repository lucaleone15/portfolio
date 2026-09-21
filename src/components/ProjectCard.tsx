import { useState, useRef, MouseEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProjectCardProps {
  key?: string | number;
  project: Project;
  onSelect: (project: Project) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const { t } = useLanguage();
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <article
      onClick={() => onSelect(project)}
      className="group relative cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-1"
    >
      {/* Frameless Showcase Container */}
      <div className="relative w-full flex flex-col h-full">
        {/* Full-width Image Container - strictly uniform 16/10 aspect ratio on every screen */}
        <div
          ref={imageContainerRef}
          onMouseEnter={(e) => {
            if (imageContainerRef.current) {
              const rect = imageContainerRef.current.getBoundingClientRect();
              setCursorPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }
            setIsHovered(true);
          }}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
          className="relative aspect-[16/10] w-full h-[220px] sm:h-[260px] md:h-[280px] lg:h-[300px] rounded-2xl bg-neutral-200 dark:bg-[#121215] shrink-0 border border-black/5 dark:border-white/5"
        >
          {/* Clipped image wrapper so image zoom stays contained */}
          <div className="w-full h-full overflow-hidden rounded-2xl">
            <img
              src={project.imageUrl}
              alt={project.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          </div>

          {/* Role Badge pinned at top-left of image for clear visual hierarchy */}
          <div className="absolute top-3.5 left-3.5 z-20">
            <span className="h-7 px-3 rounded-full bg-neutral-900 text-white dark:bg-[#CCFF00] dark:text-black text-[11px] sm:text-xs font-syne font-extrabold inline-flex items-center shadow-md tracking-wide">
              {project.role}
            </span>
          </div>

          {/* Liquid Glass Capsule following mouse position - OUTSIDE overflow-hidden with z-50 to never be cut off */}
          <div
            className="pointer-events-none absolute z-50 transition-opacity duration-200 hidden sm:block"
            style={{
              opacity: isHovered ? 1 : 0,
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-neutral-950/90 dark:bg-black/85 backdrop-blur-xl border border-white/20 shadow-[0_16px_36px_rgba(0,0,0,0.5)] flex items-center gap-2 whitespace-nowrap">
              <span className="font-syne font-bold text-xs sm:text-sm tracking-wide text-white drop-shadow-sm select-none">
                {t('projects.viewProject') || 'Voir le projet'}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white dark:text-[#CCFF00]" />
            </div>
          </div>
        </div>

        {/* Card Content Section */}
        <div className="pt-5 pb-1 flex flex-col justify-between flex-1 gap-3.5">
          {/* Header Row: Title & Subtitle on Left, Circle Arrow Button on Right */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-sans text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight group-hover:text-black dark:group-hover:text-[#CCFF00] transition-colors truncate leading-snug">
                {project.title}
              </h3>
              {/* Date directly below title with sleek accent */}
              <div className="mt-1.5 flex items-baseline gap-2.5">
                <span className="text-xs font-bold text-neutral-900 dark:text-[#CCFF00] tracking-wider shrink-0">{project.year}</span>
                <span className="text-xs font-medium text-neutral-500 dark:text-[#A1A1AA] truncate">{project.subtitle}</span>
              </div>
            </div>

            {/* Circular Arrow Button with sleek theme hover */}
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-black/10 dark:border-white/20 bg-black/[0.04] dark:bg-white/[0.05] text-neutral-800 dark:text-white group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 dark:group-hover:bg-[#CCFF00] dark:group-hover:text-black dark:group-hover:border-[#CCFF00] flex items-center justify-center transition-colors duration-200 shrink-0 shadow-xs"
              aria-label={`Ouvrir le projet ${project.title}`}
            >
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>

          {/* Mini Description */}
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#A1A1AA] leading-relaxed line-clamp-2">
            {project.summary}
          </p>
        </div>
      </div>
    </article>
  );
}
