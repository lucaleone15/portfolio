import { useState, useRef, useEffect, useCallback, MouseEvent, TouchEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { Icon } from './Icon';
import { ProjectLogo } from './ProjectLogo';
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

// Hover video: plays to the end and holds the last frame; on leave it plays backwards
// (seeking frame by frame: the files are encoded with a keyframe on every frame) and then
// fades back to the cover. Touch screens: the same on a long press; a short tap still opens.
const REWIND_SECONDS = 1; // the whole clip rewinds in this time, wherever it stopped
const LONG_PRESS_MS = 260;

function useDiveVideo(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const rewindFrame = useRef(0);
  const wanted = useRef(false);

  const stopRewind = () => cancelAnimationFrame(rewindFrame.current);

  const forward = useCallback(() => {
    const video = videoRef.current;
    if (!enabled || !video) return;
    wanted.current = true;
    stopRewind();
    // Undo a reset() (inline styles win over the classes)
    video.style.transition = '';
    video.style.opacity = '';
    if (video.preload !== 'auto') video.preload = 'auto';
    // Shown once a frame is actually ready, so the cover never flashes to a blank video
    const show = () => wanted.current && setVisible(true);
    if (video.readyState >= 2) show();
    else video.addEventListener('loadeddata', show, { once: true });
    if (video.ended || video.currentTime >= video.duration) return; // already holding the last frame
    video.play().catch(() => {});
  }, [enabled]);

  const backward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    wanted.current = false;
    video.pause();
    stopRewind();
    const duration = video.duration || 0;
    if (!duration || video.currentTime <= 0.02) {
      setVisible(false);
      return;
    }
    const speed = duration / REWIND_SECONDS;
    let last = performance.now();
    const step = (now: number) => {
      const t = Math.max(0, video.currentTime - ((now - last) / 1000) * speed);
      last = now;
      video.currentTime = t;
      if (t > 0) rewindFrame.current = requestAnimationFrame(step);
      else setVisible(false);
    };
    rewindFrame.current = requestAnimationFrame(step);
  }, []);

  // Hidden at once (no rewind): before the image morphs into the project page
  const reset = useCallback(() => {
    const video = videoRef.current;
    wanted.current = false;
    stopRewind();
    if (video) {
      video.pause();
      video.style.transition = 'none';
      video.style.opacity = '0';
    }
  }, []);

  useEffect(() => () => cancelAnimationFrame(rewindFrame.current), []);

  return { videoRef, visible, forward, backward, reset };
}

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

  const dive = useDiveVideo(!!project.video && !reduceMotion);

  // Long press on touch screens: play while held, rewind on release; the tap that follows a
  // long press doesn't open the project
  const pressTimer = useRef(0);
  const pressStart = useRef({ x: 0, y: 0 });
  const held = useRef(false);
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (finePointer.current || !project.video) return;
    held.current = false;
    pressStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    pressTimer.current = window.setTimeout(() => {
      held.current = true;
      dive.forward();
    }, LONG_PRESS_MS);
  };
  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const dx = e.touches[0].clientX - pressStart.current.x;
    const dy = e.touches[0].clientY - pressStart.current.y;
    // Scrolling, not pressing
    if (Math.hypot(dx, dy) > 10) window.clearTimeout(pressTimer.current);
  };
  const onTouchEnd = () => {
    window.clearTimeout(pressTimer.current);
    if (held.current) dive.backward();
  };

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
      onClick={(e) => {
        if (held.current) {
          // End of a long press (video preview), not a tap
          e.preventDefault();
          held.current = false;
          return;
        }
        tiltX.jump(0);
        tiltY.jump(0);
        dive.reset();
      }}
      // Long press: no "open link" menu over the video preview
      onContextMenu={(e) => {
        if (held.current) e.preventDefault();
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
            if (finePointer.current) dive.forward();
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            resetTilt();
            if (finePointer.current) dive.backward();
          }}
          onMouseMove={trackPointer}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          // The round cursor and the link outline step aside: the disc below replaces them
          data-cursor-hidden
          style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1000 }}
          className="relative aspect-[16/10] w-full rounded-2xl bg-neutral-200 dark:bg-[#121215] shrink-0 select-none [-webkit-touch-callout:none]"
        >
          {/* Clipped image wrapper. Its view-transition name matches the project page's main
              visual, so opening the project morphs this image into it (and back). */}
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl"
            style={projectMediaTransition(project.id)}
          >
            {/* The cover is the hover clip's first frame (same framing): no shift when it starts */}
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
            {project.video && (
              <video
                ref={dive.videoRef}
                src={project.video}
                poster={project.imageUrl}
                muted
                playsInline
                preload="none"
                disablePictureInPicture
                aria-hidden="true"
                tabIndex={-1}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${dive.visible ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
          </div>

          {/* Hook written over the image, on a dark fade so it reads on any visual. Outside
              the morphing wrapper: only the photo flies to the project page. */}
          {project.hook && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-end overflow-hidden rounded-2xl bg-gradient-to-t from-black/75 via-black/25 via-35% to-transparent to-60% p-4 sm:p-6">
              <p className="max-w-[85%] font-serif text-xl sm:text-2xl lg:text-[1.7rem] font-extrabold leading-[1.1] tracking-tight text-white [text-wrap:balance]">
                {project.hook}
              </p>
            </div>
          )}

          {/* My role on the project (the category only drives the filter) */}
          <div className="absolute top-3.5 left-3.5 z-20 max-w-[calc(100%-28px)]">
            <span
              className="font-syne h-7 px-3.5 rounded-full text-[11px] sm:text-xs font-extrabold inline-flex items-center tracking-wide truncate max-w-full shadow-[0_4px_12px_-2px_rgba(0,0,0,0.35)]"
              style={{ backgroundColor: 'var(--pa)', color: 'var(--pa-on)' }}
            >
              {project.badge ?? project.category}
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
              {/* The brand's logo in place of the name (the name stays in the DOM) */}
              <h3 className="flex min-h-9 sm:min-h-10 items-center font-sans text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight truncate leading-snug uppercase">
                <ProjectLogo project={project} />
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

        </div>
      </div>
      </article>
    </Link>
  );
}
