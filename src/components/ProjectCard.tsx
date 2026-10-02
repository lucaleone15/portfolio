import { useState, useRef, MouseEvent } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Link, projectPath } from '../router';
import { projectAccentVars } from '../data/portfolioData';
import { LiquidImage } from './LiquidImage';
import { imageSrcSet } from '../data/images';
import { projectMediaTransition } from '../viewTransitions';

interface ProjectCardProps {
  key?: string | number;
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { lang, t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  // Pointer position inside the image: motion values update the transform directly (no re-render per mousemove)
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const trackPointer = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    pointerX.set(e.clientX - rect.left);
    pointerY.set(e.clientY - rect.top);
  };

  return (
    <Link
      href={projectPath(lang, project.id)}
      style={projectAccentVars(project)}
      className="project-accent group relative cursor-pointer flex flex-col transition duration-300 hover:-translate-y-1 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
    >
      <article className="flex flex-col h-full">
      {/* Frameless Showcase Container */}
      <div className="relative w-full flex flex-col h-full">
        {/* Full-width Image Container - strictly uniform 16/10 aspect ratio on every screen */}
        <div
          ref={imageContainerRef}
          onMouseEnter={(e) => {
            trackPointer(e);
            setIsHovered(true);
          }}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={trackPointer}
          className="relative aspect-[16/10] w-full rounded-2xl bg-neutral-200 dark:bg-[#121215] shrink-0 border border-black/5 dark:border-white/5"
        >
          {/* Clipped image wrapper. Its view-transition name matches the project page's main
              visual, so opening the project morphs this image into it (and back). */}
          <div
            className="w-full h-full overflow-hidden rounded-2xl"
            style={projectMediaTransition(project.id)}
          >
            <LiquidImage
              src={project.imageUrl}
              srcSet={imageSrcSet(project.imageUrl)}
              sizes="(min-width: 768px) 46vw, 100vw"
              alt={`${project.name} – ${project.subtitle}`}
              width={600}
              height={375}
            />
          </div>

          {/* Category Badge pinned at top-left of image */}
          <div className="absolute top-3.5 left-3.5 z-20 max-w-[calc(100%-28px)]">
            <span
              className="font-syne h-7 px-3.5 rounded-full text-[11px] sm:text-xs font-extrabold inline-flex items-center shadow-md tracking-wide transition-colors truncate max-w-full text-white"
              style={{ backgroundColor: 'var(--pa)' }}
            >
              {project.category}
            </span>
          </div>

          {/* Liquid Glass Capsule following mouse position - OUTSIDE overflow-hidden with z-50 to never be cut off */}
          <motion.div
            className="pointer-events-none absolute left-0 top-0 z-50 transition-opacity duration-200 hidden sm:block"
            style={{ x: pointerX, y: pointerY, opacity: isHovered ? 1 : 0 }}
            aria-hidden="true"
          >
            <div className="-translate-x-1/2 -translate-y-1/2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-neutral-950/90 dark:bg-black/85 backdrop-blur-xl border border-white/20 shadow-[0_16px_36px_rgba(0,0,0,0.5)] flex items-center gap-2 whitespace-nowrap">
              <span className="font-syne font-bold text-xs sm:text-sm tracking-wide text-white drop-shadow-sm select-none">
                {t('projects.viewProject') || 'Voir le projet'}
              </span>
              <ArrowUpRight
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                style={{ color: 'var(--pa-dark)' }}
              />
            </div>
          </motion.div>
        </div>

        {/* Card Content Section */}
        <div className="pt-5 pb-1 flex flex-col justify-between flex-1 gap-3.5">
          {/* Header Row: Title & Subtitle on Left, Circle Arrow Button on Right */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className="font-sans text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight transition-colors truncate leading-snug"
                style={isHovered ? { color: 'var(--pa-text)' } : undefined}
              >
                {project.title}
              </h3>
              {/* Date directly below title with project's own accent */}
              <div className="mt-1.5 flex items-baseline gap-2.5">
                <span
                  className="text-xs font-bold tracking-wider shrink-0"
                  style={{ color: 'var(--pa-text)' }}
                >
                  {project.year}
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-[#A1A1AA] truncate">{project.subtitle}</span>
              </div>
            </div>

            {/* Circular Arrow Button with project-specific theme hover */}
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-black/10 dark:border-white/20 bg-black/[0.04] dark:bg-white/[0.05] text-neutral-800 dark:text-white flex items-center justify-center transition duration-200 shrink-0 shadow-xs"
              style={isHovered ? {
                backgroundColor: 'var(--pa)',
                borderColor: 'var(--pa)',
                color: '#FFFFFF'
              } : undefined}
              aria-hidden="true"
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
    </Link>
  );
}
