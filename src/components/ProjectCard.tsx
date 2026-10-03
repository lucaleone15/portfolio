import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { Icon } from './Icon';
import { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Link, projectPath } from '../router';
import { projectAccentVars } from '../data/portfolioData';
import { imageSrcSet } from '../data/images';
import { projectMediaTransition } from '../viewTransitions';

// Hover: the image leans toward the pointer (Apple TV poster style). The photo is never
// distorted or lit up, only tilted by a few degrees.
const MAX_TILT = 3; // degrees, each axis
const TILT_SPRING = { stiffness: 170, damping: 26 }; // critically damped: settles without wobble

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
  const tiltX = useSpring(0, TILT_SPRING);
  const tiltY = useSpring(0, TILT_SPRING);
  const reduceMotion = useReducedMotion();
  // Touch screens fire mouseenter on tap: the tilt is for a real pointer only
  const finePointer = useRef(false);
  useEffect(() => {
    finePointer.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  const trackPointer = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    pointerX.set(px * rect.width);
    pointerY.set(py * rect.height);
    if (finePointer.current && !reduceMotion) {
      tiltX.set((0.5 - py) * 2 * MAX_TILT);
      tiltY.set((px - 0.5) * 2 * MAX_TILT);
    }
  };
  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <Link
      href={projectPath(lang, project.id)}
      style={projectAccentVars(project)}
      // Flat again before the image morphs into the project page
      onClick={() => {
        tiltX.jump(0);
        tiltY.jump(0);
      }}
      className="project-accent group relative cursor-pointer flex flex-col transition duration-300 hover:-translate-y-1 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
    >
      <article className="flex flex-col h-full">
      {/* Frameless Showcase Container */}
      <div className="relative w-full flex flex-col h-full">
        {/* Full-width Image Container - strictly uniform 16/10 aspect ratio on every screen */}
        <motion.div
          ref={imageContainerRef}
          onMouseEnter={(e) => {
            trackPointer(e);
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            resetTilt();
          }}
          onMouseMove={trackPointer}
          // The round cursor and the link outline step aside: the disc below replaces them
          data-cursor-hidden
          style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1000 }}
          className="relative aspect-[16/10] w-full rounded-2xl bg-neutral-200 dark:bg-[#121215] shrink-0"
        >
          {/* Clipped image wrapper. Its view-transition name matches the project page's main
              visual, so opening the project morphs this image into it (and back). */}
          <div
            className="w-full h-full overflow-hidden rounded-2xl"
            style={projectMediaTransition(project.id)}
          >
            <img
              src={project.imageUrl}
              srcSet={imageSrcSet(project.imageUrl)}
              sizes="(min-width: 768px) 46vw, 100vw"
              alt={`${project.name} – ${project.subtitle}`}
              width={600}
              height={375}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Category Badge pinned at top-left of image */}
          <div className="absolute top-3.5 left-3.5 z-20 max-w-[calc(100%-28px)]">
            <span
              className="font-syne h-7 px-3.5 rounded-full text-[11px] sm:text-xs font-extrabold inline-flex items-center tracking-wide truncate max-w-full shadow-[0_4px_12px_-2px_rgba(0,0,0,0.35)]"
              style={{ backgroundColor: 'var(--pa)', color: 'var(--pa-on)' }}
            >
              {project.category}
            </span>
          </div>

          {/* Pointer replacement over the image: a lens of strong blur whose edge fades out
              Plain blur with a faint neutral tint: no outline, no brightening.
              Follows the pointer 1:1 (a cursor must never lag); grows in from a dot like the
              round cursor it takes over from. Mouse/trackpad only. */}
          <motion.div
            className="pointer-events-none absolute left-0 top-0 z-50 hidden [@media(hover:hover)_and_(pointer:fine)]:block"
            style={{ x: pointerX, y: pointerY }}
            aria-hidden="true"
          >
            <motion.div
              initial={false}
              animate={{ scale: isHovered ? 1 : 0.15, opacity: isHovered ? 1 : 0 }}
              transition={{ scale: { type: 'spring', bounce: 0, duration: 0.35 }, opacity: { duration: 0.18 } }}
              className="-translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full flex items-center justify-center text-center backdrop-blur-lg bg-white/[0.07]"
            >
              <span className="max-w-[5rem] font-sans text-[14px] leading-[1.25] font-normal uppercase tracking-[0.02em] text-white/85 select-none">
                {t('projects.viewProject') || 'Voir le projet'}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Card Content Section */}
        <div className="pt-5 pb-1 flex flex-col justify-between flex-1 gap-3.5">
          {/* Header Row: Title & Subtitle on Left, Circle Arrow Button on Right */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className="font-sans text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight transition-colors truncate leading-snug uppercase"
                style={isHovered ? { color: 'var(--pa-text)' } : undefined}
              >
                {/* Same name as the project page (proper case in the DOM, uppercase on screen) */}
                {project.name}
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
              className="glass w-11 h-11 sm:w-12 sm:h-12 rounded-full text-neutral-800 dark:text-white flex items-center justify-center duration-200 shrink-0"
              style={isHovered ? {
                background: 'var(--pa)',
                color: 'var(--pa-on)'
              } : undefined}
              aria-hidden="true"
            >
              <Icon icon={ArrowUpRight01Icon} className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
