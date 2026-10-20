import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { hiddenPath, Link, sectionPath, useRouter } from '../router';

/**
 * /podium: hidden page (easter egg), the leaderboard of the "Lights out" start
 * (src/easter/lightsOut.ts, served by server/podium.ts). The top three stand on a podium,
 * the rest is a list; the visitor's own best start (kept in their browser) is shown too.
 */

interface Entry {
  name: string;
  ms: number;
  date: string;
}

const formatStart = (ms: number, lang: 'fr' | 'en') => {
  const s = (ms / 1000).toFixed(3);
  return `${lang === 'fr' ? s.replace('.', ',') : s} s`;
};

export function PodiumPage() {
  const { lang } = useLanguage();
  const { navigate } = useRouter();
  const fr = lang === 'fr';
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [mine, setMine] = useState<number | null>(null);

  const refresh = useCallback(() => {
    fetch('/api/podium')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { top: Entry[] }) => setEntries(d.top))
      .catch(() => setFailed(true));
    try {
      const v = Number(localStorage.getItem('lights-out-best'));
      setMine(v > 0 ? v : null);
    } catch {
      /* storage blocked */
    }
  }, []);
  useEffect(refresh, [refresh]);

  const race = () =>
    void import('../easter/lightsOut').then((m) =>
      m.lightsOut(lang, {
        goToProjects: () => navigate(sectionPath(lang, 'projets')),
        // Already here: just reload the board once the visitor is listed
        goToPodium: refresh,
      }),
    );

  const top3 = entries?.slice(0, 3) ?? [];
  // Classic podium order: 2nd, 1st, 3rd
  const podium = [top3[1], top3[0], top3[2]].map((e, i) => ({ e, place: [2, 1, 3][i], height: ['h-28 sm:h-36', 'h-36 sm:h-48', 'h-20 sm:h-28'][i] }));

  return (
    <main id="main-content" className="relative z-10 pt-28 sm:pt-36 pb-24 sm:pb-32">
      <article className="max-w-3xl mx-auto px-6 sm:px-10">
        <p className="eyebrow sm:text-base text-[var(--accent)] mb-5">{fr ? 'Lights out · page cachée' : 'Lights out · hidden page'}</p>
        <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-[-0.035em] leading-[1.05] text-neutral-900 dark:text-white mb-6">
          {fr ? 'Les meilleurs départs' : 'The best starts'}
          <span className="text-[var(--accent)]">.</span>
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-[#A1A1AA] leading-relaxed mb-8 max-w-2xl">
          {fr
            ? 'Cinq feux rouges s’allument, puis s’éteignent : le plus rapide à réagir gagne. Un pilote de F1 réagit en environ 0,2 seconde.'
            : 'Five red lights come on, then go out: the quickest to react wins. A Formula 1 driver reacts in about 0.2 seconds.'}
        </p>

        <div className="flex flex-wrap items-center gap-4 mb-14">
          <button
            type="button"
            onClick={race}
            className="font-syne inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[var(--accent)] text-[var(--accent-contrast-text)] text-sm font-bold cursor-pointer active:scale-[0.97]"
          >
            🚦 {fr ? 'Tenter le départ' : 'Take the start'}
          </button>
          {mine && (
            <p className="text-sm text-neutral-600 dark:text-[#A1A1AA]">
              {fr ? 'Ton meilleur départ : ' : 'Your best start: '}
              <strong className="text-neutral-900 dark:text-white tabular-nums">{formatStart(mine, lang)}</strong>
            </p>
          )}
        </div>

        {failed ? (
          <p className="text-neutral-600 dark:text-[#A1A1AA]">{fr ? 'Le classement est indisponible pour le moment.' : 'The leaderboard is unavailable right now.'}</p>
        ) : entries === null ? (
          <p className="text-neutral-500 dark:text-[#A1A1AA]">{fr ? 'Chargement du classement…' : 'Loading the leaderboard…'}</p>
        ) : entries.length === 0 ? (
          <p className="text-lg text-neutral-700 dark:text-[#D4D4D8]">{fr ? 'Personne encore sur le podium. La première place est libre.' : 'Nobody on the podium yet. First place is up for grabs.'}</p>
        ) : (
          <>
            {/* The podium */}
            <div className="grid grid-cols-3 items-end gap-3 sm:gap-4 mb-12" role="list" aria-label="Podium">
              {podium.map(({ e, place, height }) => (
                <div key={place} role="listitem" className="text-center">
                  {e ? (
                    <>
                      <p className="font-bold text-neutral-900 dark:text-white truncate">{e.name}</p>
                      <p className="text-sm text-neutral-600 dark:text-[#A1A1AA] tabular-nums mb-2">{formatStart(e.ms, lang)}</p>
                    </>
                  ) : (
                    <p className="text-sm text-neutral-400 dark:text-white/30 mb-2">—</p>
                  )}
                  <div
                    className={`${height} rounded-t-2xl flex items-start justify-center pt-3 font-serif text-4xl sm:text-5xl font-extrabold ${
                      place === 1 ? 'bg-[var(--accent)] text-[var(--accent-contrast-text)]' : 'bg-black/[0.06] text-neutral-700 dark:bg-white/[0.08] dark:text-white/80'
                    }`}
                  >
                    {place}
                  </div>
                </div>
              ))}
            </div>

            {entries.length > 3 && (
              <ol start={4} className="divide-y divide-black/[0.08] dark:divide-white/[0.08] border-y border-black/[0.08] dark:border-white/[0.08]">
                {entries.slice(3).map((e, i) => (
                  <li key={e.name} className="flex items-baseline gap-4 py-3">
                    <span className="index-number w-8 text-neutral-500 dark:text-white/40">{i + 4}</span>
                    <span className="flex-1 font-semibold text-neutral-900 dark:text-white truncate">{e.name}</span>
                    <span className="tabular-nums text-neutral-600 dark:text-[#A1A1AA]">{formatStart(e.ms, lang)}</span>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}

        <p className="mt-14 text-sm text-neutral-500 dark:text-[#A1A1AA]">
          {fr ? 'Envie de voir comment ce site est construit ? ' : 'Curious how this site is built? '}
          <Link href={hiddenPath(lang, 'stand')} className="underline underline-offset-2 hover:text-[var(--accent)]">
            {fr ? 'Passe au stand' : 'Come to the pits'}
          </Link>
          .
        </p>
      </article>
    </main>
  );
}
