import { useEffect, useRef, useState } from 'react';
import { FileDown } from 'lucide-react';
import { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { imageSrcSet } from '../data/images';

/**
 * Project case study told while scrolling (desktop):
 * a browser-window frame stays pinned on the left while the steps scroll on the right
 * (Overview → Challenges → Approach → At a glance). Each step wipes its own visual into the
 * frame, the active step is in focus and the others dim, a rail tracks reading progress,
 * the frame tilts into place as the section arrives, and scores count up.
 * Mobile / reduced motion: the same content, simply stacked.
 *
 * GSAP is loaded on demand (dynamic import) so it stays out of the home page bundle; the
 * content itself is plain markup, prerendered for search engines.
 */

const EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)';

interface Step {
  key: string;
  title: string;
}

export function ProjectStory({ project }: { project: Project; key?: string }) {
  const { lang, t } = useLanguage();
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [storyMode, setStoryMode] = useState(false);

  const images = project.images?.length ? project.images : [project.imageUrl];

  const steps: Step[] = [
    { key: 'overview', title: t('modal.overview') },
    ...(project.challenges?.length ? [{ key: 'challenges', title: lang === 'fr' ? 'Enjeux' : 'Challenges' }] : []),
    ...(project.solutions?.length ? [{ key: 'solutions', title: lang === 'fr' ? 'Réponses apportées' : 'Approach' }] : []),
    { key: 'facts', title: lang === 'fr' ? 'En bref' : 'At a glance' },
  ];
  // The gallery above already shows image 1: the story starts from image 2
  const imageForStep = (i: number) => images[(i + 1) % images.length];

  const activate = (i: number) => {
    setActive((current) => {
      if (current !== i) setPrevious(current);
      return i;
    });
  };

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      // gsap.context scopes the selectors to this section and reverts everything on cleanup
      const ctx = gsap.context(() => {
        const root = rootRef.current;
        if (!root) return;
        const mm = gsap.matchMedia();

        mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
          setStoryMode(true);
          const stepEls = gsap.utils.toArray<HTMLElement>('[data-story-step]', root);

          // Active step = the one crossing the middle of the viewport
          stepEls.forEach((el, i) => {
            ScrollTrigger.create({
              trigger: el,
              start: 'top 55%',
              end: 'bottom 55%',
              onToggle: (self) => self.isActive && activate(i),
            });
          });

          // The frame tilts up into place as the section arrives
          gsap.fromTo(
            '[data-story-frame]',
            { rotateX: 14, scale: 0.9, y: 60, opacity: 0.3 },
            {
              rotateX: 0,
              scale: 1,
              y: 0,
              opacity: 1,
              ease: 'none',
              scrollTrigger: { trigger: root, start: 'top bottom', end: 'top 25%', scrub: 0.6 },
            },
          );

          // Reading progress rail
          gsap.fromTo(
            '[data-story-rail]',
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: { trigger: '[data-story-steps]', start: 'top 55%', end: 'bottom 55%', scrub: true },
            },
          );

          return () => setStoryMode(false);
        });

        // Mobile: each step's visual opens from an inset frame while the photo settles
        // (scrubbed to the scroll), then the copy rises in
        mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
          gsap.utils.toArray<HTMLElement>('[data-mobile-visual]', root).forEach((visual) => {
            gsap.fromTo(
              visual,
              { clipPath: 'inset(14% 10% 14% 10% round 28px)' },
              {
                clipPath: 'inset(0% 0% 0% 0% round 16px)',
                ease: 'none',
                scrollTrigger: { trigger: visual, start: 'top 95%', end: 'top 45%', scrub: true },
              },
            );
            gsap.fromTo(
              visual.querySelector('img'),
              { scale: 1.3 },
              { scale: 1, ease: 'none', scrollTrigger: { trigger: visual, start: 'top 95%', end: 'bottom 30%', scrub: true } },
            );
          });
          gsap.utils.toArray<HTMLElement>('[data-mobile-copy]', root).forEach((copy) => {
            gsap.from(copy, {
              y: 28,
              opacity: 0,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: { trigger: copy, start: 'top 88%', once: true },
            });
          });
        });

        // Scores count up once, on every screen size (no motion involved)
        gsap.utils.toArray<HTMLElement>('[data-count-to]', root).forEach((el) => {
          const to = parseFloat(el.dataset.countTo || '0');
          const decimals = (el.dataset.countTo || '').split('.')[1]?.length ?? 0;
          const counter = { value: 0 };
          el.textContent = (0).toFixed(decimals);
          gsap.to(counter, {
            value: to,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            onUpdate: () => {
              el.textContent = counter.value.toFixed(decimals);
            },
          });
        });
        return () => mm.revert();
      }, rootRef);
      cleanup = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [project.id, lang]);

  const stepClass = (i: number) =>
    `transition-opacity duration-500 ${storyMode && i !== active ? 'opacity-30' : 'opacity-100'}`;

  return (
    <section ref={rootRef} className="lg:grid lg:grid-cols-12 lg:gap-16 pt-4">
      {/* Pinned visual (desktop only) */}
      <div className="hidden lg:block lg:col-span-7" aria-hidden="true">
        <div className="sticky top-28 h-[calc(100vh-9rem)] flex items-center [perspective:1400px]">
          <div
            data-story-frame
            className="w-full rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#141418] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] origin-bottom"
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-3 h-10 px-4 border-b border-black/10 dark:border-white/10 bg-neutral-100/80 dark:bg-white/[0.04]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="px-3 py-1 rounded-md bg-black/[0.05] dark:bg-white/[0.06] text-[11px] text-neutral-500 dark:text-[#A1A1AA] truncate max-w-[60%]">
                  {project.name} — {steps[active]?.title}
                </span>
              </div>
              <span className="w-12" />
            </div>

            {/* One layer per step; the active one wipes up over the previous one */}
            <div className="relative aspect-[16/10] bg-neutral-200 dark:bg-[#0E0E12]">
              {steps.map((step, i) => {
                const isActive = i === active;
                const isPrevious = i === previous;
                return (
                  <img
                    key={step.key}
                    src={imageForStep(i)}
                    srcSet={imageSrcSet(imageForStep(i))}
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      zIndex: isActive ? 2 : isPrevious ? 1 : 0,
                      clipPath: isActive || isPrevious ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
                      transition: isActive ? `clip-path 0.8s ${EASE_IN_OUT}` : 'none',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div data-story-steps className="relative lg:col-span-5">
        {/* Progress rail (desktop) */}
        <div className="hidden lg:block absolute -left-8 top-0 bottom-0 w-px bg-black/10 dark:bg-white/10" aria-hidden="true">
          <div data-story-rail className="w-full h-full origin-top" style={{ backgroundColor: 'var(--pa-text)', transform: 'scaleY(0)' }} />
        </div>

        {steps.map((step, i) => (
          <div
            key={step.key}
            data-story-step
            className={`py-8 lg:py-0 lg:min-h-[75vh] lg:flex lg:flex-col lg:justify-center ${stepClass(i)}`}
          >
            {/* Mobile: each step carries its own visual, revealed as it scrolls in */}
            <div
              data-mobile-visual
              className="lg:hidden mb-6 aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-200 dark:bg-[#141418] ring-1 ring-black/10 dark:ring-white/10"
              aria-hidden="true"
            >
              <img src={imageForStep(i)}
                    srcSet={imageSrcSet(imageForStep(i))}
                    sizes="(min-width: 1024px) 55vw, 100vw" alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
            <div data-mobile-copy>
            <p className="font-syne text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--pa-text)' }}>
              {String(i + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mb-5">{step.title}</h2>

            {step.key === 'overview' && (
              <div className="space-y-4">
                <p className="text-lg sm:text-xl text-neutral-800 dark:text-[#E4E4E7] leading-relaxed font-medium">
                  {project.summary}
                </p>
                {project.overview.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-base sm:text-lg text-neutral-600 dark:text-[#A1A1AA] leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {(step.key === 'challenges' || step.key === 'solutions') && (
              <ul className="space-y-4">
                {(step.key === 'challenges' ? project.challenges : project.solutions)!.map((item) => (
                  <li key={item} className="flex gap-3.5 text-base sm:text-lg text-neutral-600 dark:text-[#A1A1AA] leading-relaxed">
                    <span
                      className="mt-[0.7em] w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: 'var(--pa-text)' }}
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {step.key === 'facts' && (
              <div className="space-y-8">
                {project.metrics.length > 0 && (
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-6">
                    {project.metrics.map((metric) => {
                      // "5.9 / 6" → count up the 5.9, keep " / 6"
                      const score = metric.value.match(/^(\d+(?:\.\d+)?)(\s*\/\s*\d+)$/);
                      return (
                        <div key={metric.label} className="border-t border-black/10 dark:border-white/10 pt-3">
                          <dt className="text-xs uppercase tracking-wider text-neutral-500 dark:text-[#A1A1AA] mb-1.5">{metric.label}</dt>
                          <dd className={score ? 'text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white' : 'text-base font-semibold text-neutral-900 dark:text-white'}>
                            {score ? (
                              <>
                                <span data-count-to={score[1]}>{score[1]}</span>
                                <span className="text-lg text-neutral-500 dark:text-[#A1A1AA] font-semibold">{score[2]}</span>
                              </>
                            ) : (
                              metric.value
                            )}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                )}

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-500 dark:text-[#A1A1AA] uppercase tracking-wider">
                    {lang === 'fr' ? 'Technologies & Outils' : 'Technologies & Tools'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="h-8 px-3.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-neutral-800 dark:text-[#E4E4E7] border border-black/10 dark:border-white/15 text-xs font-medium inline-flex items-center"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {project.pdfUrl && (
                  <a
                    href={project.pdfUrl}
                    download
                    className="font-syne inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.18] text-neutral-900 dark:text-white border border-black/15 dark:border-white/20 transition duration-200 cursor-pointer group active:scale-[0.97]"
                  >
                    <FileDown className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: 'var(--pa-text)' }} />
                    <span className="text-sm sm:text-base font-semibold tracking-wide">
                      {lang === 'fr' ? 'Télécharger le document PDF' : 'Download PDF Document'}
                    </span>
                  </a>
                )}
              </div>
            )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
