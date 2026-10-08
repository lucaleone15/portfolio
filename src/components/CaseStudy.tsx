import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowUpRight01Icon, Pdf02Icon } from '@hugeicons/core-free-icons';
import { Icon } from './Icon';
import { useLanguage } from '../context/LanguageContext';
import { Project } from '../types';
import { imageSrcSet } from '../data/images';
import { projectMediaTransition } from '../viewTransitions';
import type { CaseBlock, CaseFigure, CaseImage, CaseStep, CaseStudy as CaseStudyData } from '../data/caseStudies';

/**
 * Case study page told as a scroll story. One template for every project: the content
 * lives in data/caseStudies.ts as prose paragraphs and typed blocks (key figures, sticky
 * steps, before/after slider, quote, video…), rendered here in reading order.
 *
 * Every effect has to explain something: figures count up when they arrive, a visual stays
 * pinned while the text that comments it scrolls, the slider compares two stages of a
 * screen. No scroll library: IntersectionObserver + CSS sticky. With reduced motion, the
 * same content without movement (MotionConfig handles transforms, the rest is checked here).
 * Everything is plain markup, so the prerendered page carries the whole story.
 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Fades content up once as it enters the viewport */
function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number; key?: string | number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Picture({ image, className = '', sizes = '(min-width: 1152px) 1088px, 100vw', eager = false }: { image: CaseImage; className?: string; sizes?: string; eager?: boolean }) {
  return (
    <img
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  );
}

function Caption({ children }: { children: ReactNode }) {
  return <figcaption className="mt-3 text-sm text-neutral-500 dark:text-[#A1A1AA]">{children}</figcaption>;
}

function Prose({ text }: { text: string }) {
  // Missing data stays visible in the draft, never presented as content
  if (text.startsWith('[À COMPLÉTER')) {
    return (
      <p className="max-w-2xl rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 dark:bg-amber-400/10 px-4 py-3 text-base font-semibold text-amber-800 dark:text-amber-300">
        {text}
      </p>
    );
  }
  return <p className="max-w-2xl text-lg sm:text-xl leading-relaxed text-neutral-700 dark:text-[#D4D4D8]">{text}</p>;
}

/* ---------- Key figures: count up once in view ---------- */

function Counter({ figure }: { figure: CaseFigure }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduceMotion) return;
    const controls = animate(0, figure.value, {
      duration: 1.2,
      ease: EASE_OUT,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, reduceMotion, figure.value]);

  return (
    <span className="tabular-nums">
      {figure.prefix}
      {/* Final value in the markup: right without JavaScript and for search engines */}
      <span ref={ref}>{figure.value}</span>
      {figure.suffix}
    </span>
  );
}

function Figures({ items, source }: { items: CaseFigure[]; source?: string }) {
  return (
    <div className="py-6 sm:py-10">
      <dl className={`grid gap-x-8 gap-y-10 ${items.length > 3 ? 'sm:grid-cols-2 lg:grid-cols-4' : items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {items.map((f) => (
          <Reveal key={f.label}>
            <dt className="sr-only">{f.label}</dt>
            <dd>
              <span
                className={`block font-serif font-extrabold tracking-tight leading-none ${items.length > 2 ? 'text-[clamp(3rem,6vw,5rem)]' : 'text-[clamp(3.5rem,9vw,7.5rem)]'}`}
                style={{ color: 'var(--pa-text)' }}
              >
                <Counter figure={f} />
              </span>
              <span className="mt-3 block max-w-xs text-base text-neutral-600 dark:text-[#A1A1AA]">{f.label}</span>
            </dd>
          </Reveal>
        ))}
      </dl>
      {source && <p className="mt-8 text-xs text-neutral-500 dark:text-[#71717A]">{source}</p>}
    </div>
  );
}

/* ---------- Sticky steps: the visual stays, the text scrolls ---------- */

function StepVisual({ step, frame, active }: { step: CaseStep; frame: 'screen' | 'plain' | 'mockup'; active: boolean; key?: string }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={!active}
    >
      <Picture
        image={step.image}
        sizes="(min-width: 1024px) 640px, 100vw"
        className={`max-w-full max-h-full ${
          frame === 'plain' ? 'object-contain rounded-xl' : `w-full h-full ${step.image.fit === 'contain' ? 'object-contain' : 'object-cover'}`
        }`}
      />
    </div>
  );
}

function Steps({ steps, frame = 'plain' }: { steps: CaseStep[]; frame?: 'screen' | 'plain' | 'mockup' }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // The step crossing the middle band of the viewport drives the pinned visual
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const frameClass =
    frame === 'screen'
      ? 'relative w-full aspect-[16/10] overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-black/10 dark:ring-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]'
      : frame === 'mockup'
        ? 'relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-[#0A0A0C] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]'
        : 'relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-[#141418] p-4 sm:p-6';

  return (
    <div className="py-6 lg:grid lg:grid-cols-12 lg:gap-12">
      {/* Pinned visual (desktop) */}
      <div className="hidden lg:block lg:col-span-7 lg:order-2">
        <div className="sticky top-28 flex h-[calc(100vh-9rem)] items-center">
          <div className={frameClass}>
            {steps.map((s, i) => (
              <StepVisual key={s.image.src} step={s} frame={frame} active={i === active} />
            ))}
          </div>
        </div>
      </div>

      {/* Text steps; on mobile each carries its own visual */}
      <ol className="lg:col-span-5 lg:order-1">
        {steps.map((s, i) => (
          <li key={s.image.src}>
            <div
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-step={i}
              className={`py-8 lg:flex lg:min-h-[70vh] lg:items-center lg:transition-opacity lg:duration-500 ${i === active ? 'lg:opacity-100' : 'lg:opacity-35'}`}
            >
              <div>
                <figure className="mb-5 lg:hidden">
                  <div className={frameClass.replace('aspect-[4/3]', 'aspect-auto').replace(' p-4 sm:p-6', ' p-3')}>
                    <Picture image={s.image} sizes="100vw" className="w-full h-auto rounded-lg" />
                  </div>
                </figure>
                <p className="font-syne text-sm font-bold tabular-nums" style={{ color: 'var(--pa-text)' }}>
                  {String(i + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                </p>
                <p className="mt-3 text-lg sm:text-xl leading-relaxed text-neutral-800 dark:text-[#E4E4E7]">{s.text}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- Before / after slider ---------- */

function Compare({ block }: { block: Extract<CaseBlock, { type: 'compare' }> }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-120px' });
  const reduceMotion = useReducedMotion();
  const touched = useRef(false);

  // Hint once: the divider sweeps from the "after" side to the middle
  useEffect(() => {
    if (!inView || reduceMotion || touched.current) return;
    const controls = animate(88, 50, { duration: 1.4, ease: EASE_OUT, onUpdate: (v) => !touched.current && setPos(v) });
    return () => controls.stop();
  }, [inView, reduceMotion]);

  return (
    <Reveal className="py-6">
      <figure className="mx-auto max-w-5xl">
        <div
          ref={ref}
          className="relative overflow-hidden rounded-2xl bg-neutral-200 dark:bg-[#141418] select-none ring-1 ring-black/5 dark:ring-white/10"
          style={{ aspectRatio: `${block.after.width} / ${block.after.height}` }}
        >
          <Picture image={block.after} sizes="(min-width: 768px) 768px, 100vw" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <Picture image={block.before} sizes="(min-width: 768px) 768px, 100vw" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          {/* Divider */}
          <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" style={{ left: `${pos}%` }} aria-hidden="true">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg text-sm font-bold">
              ⇆
            </span>
          </div>
          <span className="glass-media pointer-events-none absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold">{block.beforeLabel}</span>
          <span className="glass-media pointer-events-none absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold">{block.afterLabel}</span>
          {/* A native range input: drag, click, keyboard and screen readers for free */}
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(pos)}
            onChange={(e) => {
              touched.current = true;
              setPos(Number(e.target.value));
            }}
            aria-label={`${block.beforeLabel} / ${block.afterLabel}`}
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
        <Caption>{block.caption}</Caption>
      </figure>
    </Reveal>
  );
}

/* ---------- Architecture: the diagram builds itself, node by node ---------- */

function Architecture({ block }: { block: Extract<CaseBlock, { type: 'architecture' }> }) {
  const appear = (step: number) => ({
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.5, delay: step * 0.3 },
  });
  return (
    <figure className="py-6">
      <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {block.nodes.map((n, i) => [
          <motion.div
            key={n.title}
            {...appear(i * 2)}
            className={`rounded-2xl p-5 ${n.highlight ? 'text-[var(--pa-on)]' : 'bg-black/[0.04] dark:bg-white/[0.06]'}`}
            style={n.highlight ? { backgroundColor: 'var(--pa)' } : undefined}
          >
            <p className="font-syne text-xs font-bold uppercase tracking-widest opacity-70">{n.sub}</p>
            <p className="mt-1 text-xl font-bold">{n.title}</p>
            <p className="mt-3 text-sm leading-relaxed opacity-85">{n.note}</p>
          </motion.div>,
          i < block.nodes.length - 1 && (
            <motion.div
              key={`link-${i}`}
              {...appear(i * 2 + 1)}
              className="flex items-center justify-center py-1 text-xs font-semibold text-neutral-500 dark:text-[#A1A1AA]"
              aria-hidden="true"
            >
              <span className="md:hidden">↕ {block.links[i]}</span>
              <span className="hidden md:flex flex-col items-center gap-1">
                <span>{block.links[i]}</span>
                <span className="text-lg leading-none">⇄</span>
              </span>
            </motion.div>
          ),
        ])}
      </div>
      <Caption>{block.caption}</Caption>
    </figure>
  );
}

/* ---------- Video: plays only while visible ---------- */

function Video({ block }: { block: Extract<CaseBlock, { type: 'video' }> }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduceMotion) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.4 });
    io.observe(video);
    return () => io.disconnect();
  }, [reduceMotion]);

  return (
    <Reveal className="py-6">
      <figure>
        <video
          ref={ref}
          src={block.src}
          poster={block.poster}
          width={block.width}
          height={block.height}
          muted
          loop
          playsInline
          preload="none"
          controls={!!reduceMotion}
          aria-label={block.caption}
          className="w-full h-auto rounded-2xl bg-black"
        />
        <Caption>{block.caption}</Caption>
      </figure>
    </Reveal>
  );
}

/* ---------- Block dispatcher ---------- */

function Block({ block }: { block: CaseBlock; key?: string | number }) {
  const { lang } = useLanguage();
  switch (block.type) {
    case 'figures':
      return <Figures items={block.items} source={block.source} />;
    case 'steps':
      return <Steps steps={block.steps} frame={block.frame} />;
    case 'compare':
      return <Compare block={block} />;
    case 'architecture':
      return <Architecture block={block} />;
    case 'video':
      return <Video block={block} />;
    case 'pair':
      return (
        <Reveal className="py-6">
          <figure>
            <div className="grid gap-4 md:grid-cols-2">
              {block.items.map((im, i) => (
                <div key={im.src} className="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-[#141418]">
                  <Picture image={im} sizes="(min-width: 768px) 544px, 100vw" className="w-full h-auto" />
                  <span className="glass-media absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold">{i === 0 ? (lang === 'fr' ? 'Avant' : 'Before') : lang === 'fr' ? 'Après' : 'After'}</span>
                </div>
              ))}
            </div>
            <Caption>{block.caption}</Caption>
          </figure>
        </Reveal>
      );
    case 'strip':
      return (
        <div className={`py-6 -mx-5 sm:mx-0 flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 sm:px-0 sm:grid sm:overflow-visible ${block.items.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
          {block.items.map((im, i) => (
            <Reveal key={im.src} delay={i * 0.08} className="w-[72%] shrink-0 snap-start sm:w-auto">
              <figure>
                <Picture image={im} sizes="(min-width: 640px) 360px, 72vw" className="w-full aspect-[3/4] object-cover rounded-2xl" />
                {im.caption && <Caption>{im.caption}</Caption>}
              </figure>
            </Reveal>
          ))}
        </div>
      );
    case 'gallery': {
      const cols = block.cols ?? 4;
      const grid = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-2 sm:grid-cols-3', 4: 'grid-cols-2 lg:grid-cols-4' }[cols];
      return (
        <figure className="py-6">
          <div className={`grid gap-4 ${grid} ${block.narrow ? 'max-w-xl' : ''}`}>
            {block.items.map((im, i) => (
              <Reveal key={im.src} delay={(i % 4) * 0.08}>
                {block.boxed ? (
                  // Mixed formats (A5, roll-up…) sit in equal boxes so the row stays tidy
                  <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] p-4 sm:p-6">
                    <Picture image={im} sizes="(min-width: 640px) 360px, 50vw" className="max-h-full w-auto object-contain shadow-[0_20px_40px_-20px_rgba(0,0,0,0.45)]" />
                  </div>
                ) : (
                  <Picture image={im} sizes={cols === 1 ? '(min-width: 1152px) 1088px, 100vw' : '(min-width: 1024px) 360px, 50vw'} className={`w-full h-auto ${block.narrow ? '' : 'rounded-xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.4)]'}`} />
                )}
                {im.caption && <Caption>{im.caption}</Caption>}
              </Reveal>
            ))}
          </div>
          {block.caption && <Caption>{block.caption}</Caption>}
        </figure>
      );
    }
    case 'image': {
      const pic = <Picture image={block.image} className="w-full h-auto rounded-2xl ring-1 ring-black/5 dark:ring-white/10" />;
      return (
        <Reveal className="py-6">
          <figure>
            {block.href ? (
              <a href={block.href} target="_blank" rel="noopener" className="block transition-transform duration-300 hover:-translate-y-1">
                {pic}
              </a>
            ) : (
              pic
            )}
            {block.image.caption && <Caption>{block.image.caption}</Caption>}
          </figure>
        </Reveal>
      );
    }
    case 'quote':
      return (
        <Reveal className="py-16 sm:py-24">
          <figure className="mx-auto max-w-4xl text-center">
            {/* Short quotes go giant; longer ones stay readable */}
            <blockquote
              className={`font-serif font-extrabold leading-[1.15] tracking-tight text-neutral-900 dark:text-white ${
                block.text.length > 80 ? 'text-[clamp(1.6rem,3.4vw,2.6rem)]' : 'text-[clamp(2rem,5vw,4rem)]'
              }`}
            >
              <span style={{ color: 'var(--pa-text)' }}>«&nbsp;</span>
              {block.text}
              <span style={{ color: 'var(--pa-text)' }}>&nbsp;»</span>
            </blockquote>
            <figcaption className="mt-6 text-sm font-semibold text-neutral-500 dark:text-[#A1A1AA]">{block.source}</figcaption>
          </figure>
        </Reveal>
      );
    case 'team':
      return (
        <Reveal className="py-6">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {block.members.map((m) => (
              <li
                key={m.name}
                className={`rounded-2xl p-5 ${m.me ? 'text-[var(--pa-on)]' : 'bg-black/[0.04] dark:bg-white/[0.06]'}`}
                style={m.me ? { backgroundColor: 'var(--pa)' } : undefined}
              >
                <p className="font-bold">{m.name}</p>
                <p className={`mt-1 text-sm ${m.me ? 'opacity-90' : 'text-neutral-600 dark:text-[#A1A1AA]'}`}>{m.role}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      );
  }
}

/* ---------- Page ---------- */

export function CaseStudy({ project, study }: { project: Project; study: CaseStudyData; key?: string }) {
  const { lang } = useLanguage();
  const newTab = lang === 'fr' ? '(nouvel onglet)' : '(opens in a new tab)';
  return (
    <article>
      {/* Hero: the stake first, then the facts */}
      <header className="pb-10 sm:pb-14">
        <Reveal>
          <p className="font-syne text-xs sm:text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--pa-text)' }}>
            {study.kicker}
          </p>
          <h1 className="mt-4 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.02] text-neutral-900 dark:text-white">
            {study.title}
          </h1>
          <p className="mt-6 max-w-4xl font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.2] tracking-tight text-neutral-900 dark:text-white">
            {study.hook}
          </p>
          <p className="mt-5 max-w-3xl text-lg sm:text-xl leading-relaxed text-neutral-600 dark:text-[#A1A1AA]">{study.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {study.liveUrl && (
              <a
                href={study.liveUrl}
                target="_blank"
                rel="noopener"
                className="font-syne group inline-flex items-center gap-2 h-12 px-6 rounded-full text-sm font-bold transition active:scale-[0.97] hover:opacity-90"
                style={{ backgroundColor: 'var(--pa)', color: 'var(--pa-on)' }}
              >
                {study.liveLabel}
                <Icon icon={ArrowUpRight01Icon} className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <span className="sr-only">{newTab}</span>
              </a>
            )}
            {project.pdfUrl && (
              <a
                href={project.pdfUrl}
                target="_blank"
                rel="noopener"
                className="glass font-syne inline-flex items-center gap-2 h-12 px-6 rounded-full text-sm font-bold text-neutral-900 dark:text-white active:scale-[0.97]"
              >
                <Icon icon={Pdf02Icon} className="w-4 h-4" />
                {lang === 'fr' ? 'Dossier PDF' : 'PDF report'}
                <span className="sr-only">{newTab}</span>
              </a>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-black/10 dark:border-white/10 pt-8 md:grid-cols-3 lg:grid-cols-6">
            {study.meta.map((m) => (
              <div key={m.label}>
                <dt className="font-syne text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-[#71717A]">{m.label}</dt>
                <dd className="mt-2 text-sm font-semibold leading-snug text-neutral-900 dark:text-white">{m.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </header>

      {/* Same view-transition name as the project card: the card image morphs into this one */}
      <div
        style={projectMediaTransition(project.id)}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-200 dark:bg-[#141418] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        <img
          src={project.imageUrl}
          srcSet={imageSrcSet(project.imageUrl)}
          sizes="(min-width: 1152px) 1088px, 100vw"
          alt={`${project.name} – ${project.subtitle}`}
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* In short: for the 60-second read */}
      <section aria-label={lang === 'fr' ? 'En bref' : 'In short'} className="mt-12 sm:mt-16 grid gap-px overflow-hidden rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] md:grid-cols-3">
        {study.brief.map((b, i) => (
          <Reveal key={b.label} delay={i * 0.08} className="bg-[#F9F9FB] dark:bg-[#0A0A0C] p-6 sm:p-8">
            <p className="font-syne text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--pa-text)' }}>{b.label}</p>
            <p className="mt-3 text-lg font-semibold leading-snug text-neutral-900 dark:text-white">{b.text}</p>
          </Reveal>
        ))}
      </section>

      {/* The story */}
      {study.sections.map((section, s) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="mt-24 sm:mt-32">
          <Reveal>
            <p className="font-syne text-sm font-bold tabular-nums" style={{ color: 'var(--pa-text)' }}>
              {String(s + 1).padStart(2, '0')}
            </p>
            <h2 id={`${section.id}-title`} className="mt-2 max-w-4xl text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] text-neutral-900 dark:text-white">
              {section.title}
            </h2>
          </Reveal>
          <div className="mt-8 space-y-6">
            {section.content.map((item, i) =>
              typeof item === 'string' ? (
                <Reveal key={i}>
                  <Prose text={item} />
                </Reveal>
              ) : (
                <Block key={i} block={item} />
              ),
            )}
          </div>
        </section>
      ))}

      {/* Credits and links */}
      <section aria-labelledby="credits-title" className="mt-24 sm:mt-32 border-t border-black/10 dark:border-white/10 pt-10">
        <h2 id="credits-title" className="font-syne text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-[#71717A]">
          {lang === 'fr' ? 'Crédits' : 'Credits'}
        </h2>
        <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {study.credits.map((c) => (
            <li key={c.name} className="text-sm">
              <span className="font-bold text-neutral-900 dark:text-white">{c.name}</span>
              <span className="text-neutral-600 dark:text-[#A1A1AA]"> · {c.role}</span>
            </li>
          ))}
        </ul>
        {study.creditsNote && <p className="mt-6 text-sm text-neutral-600 dark:text-[#A1A1AA]">{study.creditsNote}</p>}
      </section>
    </article>
  );
}
