import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { motion } from 'motion/react';
import { Pause, Play, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getCustomProjects } from '../data/projectsStorage';
import { Link, projectPath } from '../router';
import { projectAccentVars } from '../data/portfolioData';

/**
 * "Story"-style reel of project visuals (a nod to the community-manager side): a vertical
 * frame where images advance on their own with a slow Ken Burns drift, segmented progress
 * bars on top, caption with a link to the project.
 * Tap left/right third to go back/forward, press and hold to pause, explicit pause button
 * (WCAG 2.2.2). Pauses off-screen and in background tabs. Reduced motion: no drift.
 */

const SLIDE_MS = 4200;
const MAX_SLIDES = 10;

export function PhotoReel() {
  const { lang } = useLanguage();
  const projects = lang === 'fr' ? getCustomProjects().fr : getCustomProjects().en;

  // Round-robin across projects so consecutive slides come from different projects
  const slides = useMemo(() => {
    const queues = projects.map((p) => (p.images?.length ? p.images : [p.imageUrl]).map((src) => ({ src, project: p })));
    const out: { src: string; project: (typeof projects)[number] }[] = [];
    for (let round = 0; out.length < MAX_SLIDES && queues.some((q) => q.length > round); round++) {
      queues.forEach((q) => q[round] && out.length < MAX_SLIDES && out.push(q[round]));
    }
    return out;
  }, [projects]);

  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const pressStart = useRef(0);

  const paused = userPaused || holding || !inView || !tabVisible;
  const current = slides[index];

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const frame = frameRef.current;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    if (frame) io.observe(frame);
    const onVisibility = () => setTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const go = (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length);

  // Tap zones like a story: left third goes back, the rest goes forward
  const onTap = (e: MouseEvent<HTMLDivElement>) => {
    // A long press was a pause, not a tap
    if (performance.now() - pressStart.current > 250) return;
    const rect = e.currentTarget.getBoundingClientRect();
    go(e.clientX - rect.left < rect.width / 3 ? -1 : 1);
  };

  if (!current) return null;

  return (
    <section
      id="en-images"
      className="relative py-20 sm:py-28 bg-[#F9F9FB] dark:bg-[#0A0A0C] border-b border-black/[0.06] dark:border-white/[0.06] transition-colors duration-300 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Copy + project list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 space-y-6"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
            {lang === 'fr' ? 'En images' : 'In pictures'}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
            {lang === 'fr' ? (
              <>Des projets qui se <span className="text-[var(--accent)]">voient</span>.</>
            ) : (
              <>Projects you can <span className="text-[var(--accent)]">see</span>.</>
            )}
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-[#A1A1AA] leading-relaxed max-w-lg">
            {lang === 'fr'
              ? 'Campagnes, interfaces, contenus terrain : un aperçu de mon travail, en story.'
              : 'Campaigns, interfaces, on-site content: a glimpse of my work, story-style.'}
          </p>

          <ul className="pt-2 divide-y divide-black/10 dark:divide-white/10 border-y border-black/10 dark:border-white/10">
            {projects.map((p) => {
              const isCurrent = p.id === current.project.id;
              return (
                <li key={p.id} style={projectAccentVars(p)} className="project-accent">
                  <button
                    type="button"
                    onClick={() => setIndex(slides.findIndex((s) => s.project.id === p.id))}
                    aria-current={isCurrent ? 'true' : undefined}
                    className="w-full flex items-center justify-between gap-4 py-3.5 text-left cursor-pointer group"
                  >
                    <span
                      className={`text-base sm:text-lg font-bold transition-colors duration-300 ${
                        isCurrent ? '' : 'text-neutral-400 dark:text-white/35 group-hover:text-neutral-900 dark:group-hover:text-white'
                      }`}
                      style={isCurrent ? { color: 'var(--pa-text)' } : undefined}
                    >
                      {p.name}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-[#A1A1AA]">{p.category}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </motion.div>

        {/* Story frame */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[340px]">
            {/* Blurred copy of the current image as an ambient glow behind the frame */}
            <div
              className="absolute -inset-10 rounded-[3rem] opacity-40 dark:opacity-30 blur-3xl transition-[background-image] duration-700 bg-cover bg-center"
              style={{ backgroundImage: `url(${current.src})` }}
              aria-hidden="true"
            />

            <div
              ref={frameRef}
              role="region"
              aria-roledescription={lang === 'fr' ? 'carrousel' : 'carousel'}
              aria-label={lang === 'fr' ? 'Aperçu des projets en images' : 'Project highlights'}
              onMouseLeave={() => setHolding(false)}
              onPointerDown={() => {
                pressStart.current = performance.now();
                setHolding(true);
              }}
              onPointerUp={() => setHolding(false)}
              onPointerCancel={() => setHolding(false)}
              className="relative aspect-[9/16] rounded-[2rem] overflow-hidden bg-neutral-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/10 dark:ring-white/10 select-none"
            >
              {/* Slides (stacked, crossfading; the active one drifts) */}
              <div className="absolute inset-0 cursor-pointer" onClick={onTap}>
                {slides.map((slide, i) => (
                  <div
                    key={`${slide.src}-${i}`}
                    className="absolute inset-0 transition-opacity duration-700 ease-out"
                    style={{ opacity: i === index ? 1 : 0 }}
                    aria-hidden={i !== index}
                  >
                    <img
                      // Re-keyed when it becomes active so the drift restarts from the beginning
                      key={i === index ? `active-${index}` : 'idle'}
                      src={slide.src}
                      alt={i === index ? `${slide.project.name} – ${slide.project.subtitle}` : ''}
                      loading={Math.abs(i - index) <= 1 ? 'eager' : 'lazy'}
                      decoding="async"
                      draggable={false}
                      className={`w-full h-full object-cover ${i === index && !reduceMotion ? 'reel-drift' : ''}`}
                      style={{ animationPlayState: paused ? 'paused' : 'running', animationDuration: `${SLIDE_MS + 800}ms` }}
                    />
                  </div>
                ))}
              </div>

              {/* Readability gradients */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/75 to-transparent" />

              {/* Progress segments */}
              <div className="absolute top-3 inset-x-3 flex gap-1" aria-hidden="true">
                {slides.map((_, i) => (
                  <div key={i} className="h-[3px] flex-1 rounded-full bg-white/30 overflow-hidden">
                    <div
                      key={i === index ? `run-${index}` : 'still'}
                      className={`h-full bg-white origin-left ${i === index ? 'reel-progress' : ''}`}
                      style={{
                        transform: i < index ? 'scaleX(1)' : i > index ? 'scaleX(0)' : undefined,
                        animationDuration: `${SLIDE_MS}ms`,
                        animationPlayState: paused ? 'paused' : 'running',
                      }}
                      onAnimationEnd={() => go(1)}
                    />
                  </div>
                ))}
              </div>

              {/* Header: avatar + name, pause button */}
              <div className="absolute top-7 inset-x-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/photo.jpeg" alt="" className="w-7 h-7 rounded-full object-cover object-[center_18%] ring-2 ring-white/80" />
                  <span className="text-xs font-semibold text-white drop-shadow">luca.leone</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserPaused((p) => !p);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label={userPaused ? (lang === 'fr' ? 'Lire' : 'Play') : lang === 'fr' ? 'Mettre en pause' : 'Pause'}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition cursor-pointer active:scale-[0.97]"
                >
                  {userPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Caption */}
              <div className="absolute bottom-0 inset-x-0 p-5 space-y-3" style={projectAccentVars(current.project)}>
                <span
                  className="font-syne inline-flex h-6 px-2.5 rounded-full text-[11px] font-bold items-center text-white"
                  style={{ backgroundColor: 'var(--pa)' }}
                >
                  {current.project.category}
                </span>
                <p className="text-xl font-extrabold text-white leading-tight">{current.project.name}</p>
                <Link
                  href={projectPath(lang, current.project.id)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="font-syne inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-white text-neutral-900 text-xs font-bold hover:bg-white/90 transition active:scale-[0.97]"
                >
                  {lang === 'fr' ? 'Voir le projet' : 'View project'}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Screen readers / keyboard: explicit previous / next */}
              <div className="sr-only">
                <button type="button" onClick={() => go(-1)}>{lang === 'fr' ? 'Image précédente' : 'Previous image'}</button>
                <button type="button" onClick={() => go(1)}>{lang === 'fr' ? 'Image suivante' : 'Next image'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
