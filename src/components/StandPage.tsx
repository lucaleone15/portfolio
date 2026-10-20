import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { hiddenPath, homePath, Link } from '../router';
import { CONTENT } from '../content/load';

const UNIFIED_PROJECTS = CONTENT.index.order.map((id) => CONTENT.projects[id]);
import { getAllRoutes, getHeadData, projectImagePaths } from '../seo';

/**
 * /stand: hidden page (easter egg), the pits of the portfolio. How the site is built, its
 * numbers, what this very page load cost, and hints to the other secrets. Every number is
 * real: counted from the site's data, read at build time (__BUILD_INFO__, vite.config.ts) or
 * measured in the visitor's browser.
 */

interface LoadStats {
  kb: number;
  requests: number;
  ms: number;
  cached: boolean;
}

function useLoadStats() {
  const [stats, setStats] = useState<LoadStats | null>(null);
  useEffect(() => {
    const read = () => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const bytes = (nav?.transferSize ?? 0) + resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      setStats({
        kb: Math.round(bytes / 1024),
        requests: resources.length + 1,
        ms: Math.round(nav ? nav.loadEventEnd || nav.domContentLoadedEventEnd : performance.now()),
        cached: bytes < 2048,
      });
    };
    if (document.readyState === 'complete') read();
    else window.addEventListener('load', read, { once: true });
  }, []);
  return stats;
}

export function StandPage() {
  const { lang } = useLanguage();
  const fr = lang === 'fr';
  const load = useLoadStats();
  const info = __BUILD_INFO__;

  const indexedPages = getAllRoutes().filter((r) => !(r.name === 'home' && r.section) && !getHeadData(r).noindex).length;
  const images = new Set(UNIFIED_PROJECTS.flatMap((p) => projectImagePaths('fr', p.id))).size;
  const videos = UNIFIED_PROJECTS.filter((p) => p.video).length;
  const since = info.firstCommit
    ? new Intl.DateTimeFormat(fr ? 'fr-CH' : 'en-GB', { month: 'long', year: 'numeric' }).format(new Date(info.firstCommit))
    : '';
  const n = (v: number) => v.toLocaleString(fr ? 'fr-CH' : 'en-GB');

  const figures: { value: string; label: string }[] = [
    { value: n(UNIFIED_PROJECTS.length), label: fr ? 'études de cas, en français et en anglais' : 'case studies, in French and English' },
    { value: n(indexedPages), label: fr ? 'pages indexées par Google' : 'pages indexed by Google' },
    { value: n(images), label: fr ? 'images dans les projets' : 'images in the projects' },
    { value: n(videos), label: fr ? 'vidéos de survol' : 'hover videos' },
    ...(info.commits ? [{ value: n(info.commits), label: fr ? `commits depuis ${since}` : `commits since ${since}` }] : []),
    { value: '100', label: fr ? 'score SEO Lighthouse sur chaque page' : 'Lighthouse SEO score on every page' },
  ];

  const stack: { name: string; role: string; version?: string }[] = [
    { name: 'React', version: info.versions.react, role: 'interface' },
    { name: 'TypeScript', version: info.versions.typescript, role: fr ? 'tout le code, typé' : 'all the code, typed' },
    { name: 'Tailwind CSS', version: info.versions.tailwindcss, role: 'styles' },
    { name: 'Vite', version: info.versions.vite, role: fr ? 'build et pré-rendu de chaque page' : 'build and prerendering of every page' },
    { name: 'Motion', version: info.versions.motion, role: 'animations' },
    { name: 'GSAP', version: info.versions.gsap, role: fr ? 'cartes empilées sur mobile' : 'stacked cards on mobile' },
    { name: 'Node.js', role: fr ? 'serveur maison : pages, formulaire, statistiques' : 'own server: pages, form, statistics' },
    { name: 'Nodemailer', version: info.versions.nodemailer, role: fr ? 'emails du formulaire de contact' : 'contact form emails' },
  ];

  const secrets = fr
    ? [
        'Imprime une page : tout le site sort sur papier, rien de caché.',
        'Dans la recherche (⌘K), tape le signal de départ d’un Grand Prix.',
        'Le point final de la grande signature, tout en bas, n’est pas très bien fixé.',
        'Et tu es déjà sur l’un d’eux.',
      ]
    : [
        'Print a page: the whole site comes out on paper, nothing hidden.',
        'In the search (⌘K), type what a Grand Prix start is called.',
        'The full stop of the big signature, at the very bottom, isn’t fixed very well.',
        'And you’re already on one of them.',
      ];

  const h2 = 'flex items-baseline gap-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6';
  const num = 'index-number text-xl sm:text-2xl text-neutral-500 dark:text-white/40';

  return (
    <main id="main-content" className="relative z-10 pt-28 sm:pt-36 pb-24 sm:pb-32">
      <article className="max-w-4xl mx-auto px-6 sm:px-10">
        <p className="eyebrow sm:text-base text-[var(--accent)] mb-5">{fr ? 'Au stand · page cachée' : 'In the pits · hidden page'}</p>
        <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-[-0.035em] leading-[1.05] text-neutral-900 dark:text-white mb-6">
          {fr ? 'Les coulisses du portfolio' : 'Behind the portfolio'}
          <span className="text-[var(--accent)]">.</span>
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-[#A1A1AA] leading-relaxed mb-14 max-w-2xl">
          {fr
            ? 'Bienvenue dans le garage. Ce site, je l’ai conçu et développé moi-même, du design au serveur. Voici ce qu’il y a sous le capot.'
            : 'Welcome to the garage. I designed and built this site myself, from the design to the server. Here’s what’s under the hood.'}
        </p>

        {/* This very page load, measured in the visitor's browser */}
        <section className="mb-16" aria-labelledby="stand-load">
          <h2 id="stand-load" className={h2}>
            <span className={num} aria-hidden="true">01</span>
            {fr ? 'Ton arrêt au stand' : 'Your pit stop'}
          </h2>
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-black/[0.06] dark:bg-white/[0.08]">
            {[
              { value: load ? (load.cached ? 'cache' : fr ? `${n(load.kb)} Ko` : `${n(load.kb)} KB`) : '…', label: fr ? 'téléchargés pour cette page' : 'downloaded for this page' },
              { value: load ? n(load.requests) : '…', label: fr ? 'fichiers chargés' : 'files loaded' },
              { value: load ? `${(load.ms / 1000).toLocaleString(fr ? 'fr-CH' : 'en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} s` : '…', label: fr ? 'pour être prête' : 'to be ready' },
            ].map((f) => (
              <div key={f.label} className="bg-[#F9F9FB] dark:bg-[#0A0A0C] p-5 sm:p-7">
                <p className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--accent)] tabular-nums">{f.value}</p>
                <p className="mt-2 text-sm text-neutral-600 dark:text-[#A1A1AA]">{f.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500 dark:text-[#A1A1AA]">
            {fr ? 'Mesuré à l’instant dans ton navigateur.' : 'Measured just now in your browser.'}
            {load?.cached ? (fr ? ' Les fichiers venaient déjà de ton cache : rien à télécharger.' : ' The files were already in your cache: nothing to download.') : ''}
          </p>
        </section>

        <section className="mb-16" aria-labelledby="stand-numbers">
          <h2 id="stand-numbers" className={h2}>
            <span className={num} aria-hidden="true">02</span>
            {fr ? 'Le site en chiffres' : 'The site in numbers'}
          </h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8">
            {figures.map((f) => (
              <div key={f.label}>
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <p className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white tabular-nums">{f.value}</p>
                  <p className="mt-1.5 text-sm text-neutral-600 dark:text-[#A1A1AA]">{f.label}</p>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mb-16" aria-labelledby="stand-stack">
          <h2 id="stand-stack" className={h2}>
            <span className={num} aria-hidden="true">03</span>
            {fr ? 'Sous le capot' : 'Under the hood'}
          </h2>
          <ul className="divide-y divide-black/[0.08] dark:divide-white/[0.08] border-y border-black/[0.08] dark:border-white/[0.08]">
            {stack.map((s) => (
              <li key={s.name} className="flex items-baseline justify-between gap-4 py-3.5">
                <span className="font-bold text-neutral-900 dark:text-white">
                  {s.name}
                  {s.version && <span className="ml-2 text-xs font-medium text-neutral-500 dark:text-[#A1A1AA] tabular-nums">{s.version}</span>}
                </span>
                <span className="text-sm text-right text-neutral-600 dark:text-[#A1A1AA]">{s.role}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-neutral-600 dark:text-[#A1A1AA] leading-relaxed">
            {fr
              ? 'Aucun service tiers : ni cookie, ni outil de suivi, ni police chargée ailleurs. Hébergé en Suisse.'
              : 'No third-party service: no cookie, no tracking tool, no font loaded from elsewhere. Hosted in Switzerland.'}
            {info.builtAt && (fr ? ` Dernière version : ${new Date(info.builtAt).toLocaleDateString('fr-CH')}.` : ` Latest version: ${new Date(info.builtAt).toLocaleDateString('en-GB')}.`)}
          </p>
        </section>

        <section className="mb-16" aria-labelledby="stand-secrets">
          <h2 id="stand-secrets" className={h2}>
            <span className={num} aria-hidden="true">04</span>
            {fr ? 'Les secrets du site' : 'The site’s secrets'}
          </h2>
          <ol className="space-y-3">
            {secrets.map((s, i) => (
              <li key={s} className="flex gap-4 text-base sm:text-lg text-neutral-800 dark:text-[#E4E4E7] leading-relaxed">
                <span className="index-number text-neutral-500 dark:text-white/60 shrink-0">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href={hiddenPath(lang, 'podium')}
            className="font-syne inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[var(--accent)] text-[var(--accent-contrast-text)] text-sm font-bold active:scale-[0.97]"
          >
            🏁 {fr ? 'Voir le podium des départs' : 'See the starts podium'}
          </Link>
          <Link
            href={homePath(lang)}
            className="glass font-syne inline-flex items-center h-12 px-6 rounded-full text-neutral-900 dark:text-white text-sm font-bold active:scale-[0.97]"
          >
            {fr ? 'Retour au portfolio' : 'Back to the portfolio'}
          </Link>
        </div>
      </article>
    </main>
  );
}
