import { useLanguage } from '../context/LanguageContext';
import { homePath, Link, sectionPath } from '../router';
import { NeonBackdrop } from './NeonBackdrop';

/** 404: shown for unknown URLs (served with a real 404 status by server/index.ts). */
export function NotFound() {
  const { lang } = useLanguage();
  return (
    <main id="main-content" className="relative z-10 min-h-[100dvh] flex items-center overflow-hidden">
      <NeonBackdrop fadeBottom={false} />
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 w-full py-32">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--accent)] mb-6">
          {lang === 'fr' ? 'Erreur 404' : 'Error 404'}
        </p>
        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-[-0.035em] leading-[1.02] text-neutral-900 dark:text-white mb-6">
          {lang === 'fr' ? 'Cette page s’est égarée' : 'This page got lost'}
          <span className="text-[var(--accent)]">.</span>
        </h1>
        <p className="max-w-xl text-lg sm:text-xl text-neutral-600 dark:text-[#A1A1AA] leading-relaxed mb-10">
          {lang === 'fr'
            ? 'L’adresse n’existe pas, ou plus. Mes projets, eux, sont toujours là.'
            : 'This address doesn’t exist, or no longer does. My projects are still here, though.'}
        </p>
        <div className="flex flex-wrap gap-3.5">
          <Link
            href={sectionPath(lang, 'projets')}
            className="font-syne py-4 px-8 rounded-full bg-[var(--accent)] text-[var(--accent-contrast-text)] hover:opacity-90 text-sm sm:text-base font-bold transition active:scale-[0.97]"
          >
            {lang === 'fr' ? 'Voir les projets' : 'See the projects'}
          </Link>
          <Link
            href={homePath(lang)}
            className="font-syne py-4 px-8 rounded-full border border-black/15 dark:border-white/20 text-neutral-900 dark:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 text-sm sm:text-base font-bold transition active:scale-[0.97]"
          >
            {lang === 'fr' ? 'Retour à l’accueil' : 'Back to home'}
          </Link>
        </div>
      </div>
    </main>
  );
}
