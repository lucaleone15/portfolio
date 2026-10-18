import { useEffect, useState, type ReactNode } from 'react';
import { api } from '../api';
import { pageClass } from '../ui';
import { Segmented } from './ProjectEditor';

/**
 * Statistiques: the site's own page views (no cookie, no IP), over 7, 30 or 90 days, against
 * the same length of time just before. One hue for single series (the site's red); French and
 * English get the red and a blue, validated for colour blindness in light and dark.
 */

export interface Stats {
  days: number;
  total: number;
  previousTotal: number;
  byDay: { day: string; views: number }[];
  projects: { id: string; name: string; views: number; fr: number; en: number }[];
  pages: { path: string; label: string; views: number }[];
  referrers: { host: string; views: number }[];
  languages: { fr: number; en: number };
}

const nf = new Intl.NumberFormat('fr-CH');
const dayLabel = (day: string, long = false) => {
  const text = new Date(`${day}T12:00:00Z`).toLocaleDateString('fr-CH', long ? { weekday: 'long', day: 'numeric', month: 'long' } : { day: 'numeric', month: 'short' });
  return long ? text.charAt(0).toUpperCase() + text.slice(1) : text;
};
const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

function Tile({ label, value, sub, word = false }: { label: string; value: string; sub?: ReactNode; word?: boolean }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500 dark:text-[#A1A1AA]">{label}</p>
      <p className={`mt-2 truncate font-extrabold tracking-tight ${word ? 'text-xl leading-9' : 'font-syne text-3xl tabular-nums'}`} title={value}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-neutral-500 dark:text-[#A1A1AA]">{sub}</p>}
    </div>
  );
}

function Delta({ now, before }: { now: number; before: number }) {
  if (!before) return <span>{now ? 'Nouvelle période' : '—'}</span>;
  const change = Math.round(((now - before) / before) * 100);
  return (
    <span>
      <strong className="font-semibold text-neutral-900 dark:text-white">{`${change > 0 ? '+' : ''}${change} %`}</strong> par rapport à la période précédente ({nf.format(before)})
    </span>
  );
}

/** Page views per day: thin bars on a baseline, a tooltip on hover or focus, the figures as a table */
function DailyChart({ byDay }: { byDay: Stats['byDay'] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...byDay.map((d) => d.views));
  const tick = Math.max(1, Math.ceil(max / 4));
  const ticks = [0, tick, tick * 2, tick * 3, tick * 4].filter((t) => t <= max + tick);
  const top = ticks[ticks.length - 1];
  const label = (i: number) => byDay.length <= 7 || i === 0 || i === byDay.length - 1 || i === Math.floor(byDay.length / 2);

  return (
    <figure className="rounded-2xl border border-[var(--color-border)] bg-white p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
      <figcaption className="font-syne text-base font-extrabold">Pages vues par jour</figcaption>
      <div className="relative mt-5 flex h-48 gap-2 sm:h-56">
        <div className="flex flex-col-reverse justify-between pb-6 text-right text-[11px] tabular-nums text-neutral-400" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t}>{nf.format(t)}</span>
          ))}
        </div>
        <div className="relative flex-1">
          {/* Recessive grid */}
          <div className="absolute inset-x-0 bottom-6 top-0 flex flex-col-reverse justify-between" aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} className={`border-t ${t === 0 ? 'border-neutral-300 dark:border-white/25' : 'border-dashed border-neutral-200 dark:border-white/[0.07]'}`} />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 top-0 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)} aria-hidden="true">
            {byDay.map((d, i) => (
              <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end pb-6" onMouseEnter={() => setHover(i)}>
                <div
                  className={`mx-auto w-full max-w-7 rounded-t-[4px] transition-opacity ${hover !== null && hover !== i ? 'opacity-40' : ''}`}
                  style={{ height: `${(d.views / top) * 100}%`, minHeight: d.views ? 2 : 0, background: 'var(--accent)' }}
                />
                {label(i) && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-neutral-400">{dayLabel(d.day)}</span>}
              </div>
            ))}
          </div>
          {hover !== null && (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-1.5 text-xs text-white shadow-lg dark:bg-white dark:text-neutral-900"
              style={{ left: `${((hover + 0.5) / byDay.length) * 100}%` }}
            >
              {dayLabel(byDay[hover].day, true)} · <strong>{nf.format(byDay[hover].views)}</strong>
            </div>
          )}
        </div>
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-neutral-500 dark:text-[#A1A1AA]">Voir les chiffres</summary>
        <table aria-label="Pages vues par jour" className="mt-2 w-full text-left text-xs">
          <thead>
            <tr className="text-neutral-500">
              <th className="py-1 font-semibold">Jour</th>
              <th className="py-1 text-right font-semibold">Pages vues</th>
            </tr>
          </thead>
          <tbody>
            {byDay.map((d) => (
              <tr key={d.day} className="border-t border-[var(--color-border)] dark:border-white/10">
                <td className="py-1">{dayLabel(d.day, true)}</td>
                <td className="py-1 text-right tabular-nums">{nf.format(d.views)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** A ranked list with a thin bar per row (one series: the site's red) */
function Ranking({ title, rows }: { title: string; rows: { key: string; label: string; views: number; note?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
      <h2 className="font-syne text-base font-extrabold">{title}</h2>
      {rows.length ? (
        <ol className="mt-4 space-y-3">
          {rows.map((r) => (
            <li key={r.key}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-semibold">{r.label}</span>
                <span className="shrink-0 tabular-nums text-neutral-600 dark:text-[#A1A1AA]">
                  {r.note && <span className="mr-2 text-xs text-neutral-400">{r.note}</span>}
                  {nf.format(r.views)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-[var(--color-surface)] dark:bg-white/[0.06]" aria-hidden="true">
                <div className="h-full rounded-full" style={{ width: `${(r.views / max) * 100}%`, background: 'var(--accent)' }} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-neutral-500">Rien sur cette période.</p>
      )}
    </section>
  );
}

/** French / English: two segments with a 2 px gap, labelled directly and in a legend */
function Languages({ fr, en }: Stats['languages']) {
  const total = fr + en;
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
      <h2 className="font-syne text-base font-extrabold">Langue des pages vues</h2>
      <div className="mt-4 flex h-3 gap-[2px] overflow-hidden rounded-full" role="img" aria-label={`Français ${pct(fr, total)} %, anglais ${pct(en, total)} %`}>
        {fr > 0 && <div className="h-full bg-[var(--accent)]" style={{ width: `${pct(fr, total)}%` }} />}
        {en > 0 && <div className="h-full bg-[#2F6DB5] dark:bg-[#4A8BD8]" style={{ width: `${pct(en, total)}%` }} />}
      </div>
      <ul className="mt-3 flex gap-5 text-sm">
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
          Français <span className="tabular-nums text-neutral-500">{nf.format(fr)}</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#2F6DB5] dark:bg-[#4A8BD8]" aria-hidden="true" />
          Anglais <span className="tabular-nums text-neutral-500">{nf.format(en)}</span>
        </li>
      </ul>
    </section>
  );
}

export function StatsView({ stats }: { stats: Stats }) {
  if (!stats.total) {
    return <p className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-neutral-500 dark:border-white/10">Pas encore de visites sur cette période.</p>;
  }
  const opened = stats.projects.reduce((n, p) => n + p.views, 0);
  const topSource = stats.referrers.find((r) => r.host);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Pages vues" value={nf.format(stats.total)} sub={<Delta now={stats.total} before={stats.previousTotal} />} />
        <Tile label="Projets ouverts" value={nf.format(opened)} sub={stats.projects[0] ? `Le plus vu : ${stats.projects[0].name}` : undefined} />
        <Tile label="En anglais" value={`${pct(stats.languages.en, stats.total)} %`} sub={`${nf.format(stats.languages.en)} pages vues`} />
        <Tile word label="Première provenance" value={topSource?.host ?? '—'} sub={topSource ? `${nf.format(topSource.views)} pages vues` : 'Surtout des accès directs'} />
      </div>
      <DailyChart byDay={stats.byDay} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Ranking title="Projets les plus vus" rows={stats.projects.map((p) => ({ key: p.id, label: p.name, views: p.views, note: `FR ${p.fr} · EN ${p.en}` }))} />
        <Ranking title="Provenance" rows={stats.referrers.map((r) => ({ key: r.host || 'direct', label: r.host || 'Accès direct', views: r.views }))} />
        <Ranking title="Pages" rows={stats.pages.map((p) => ({ key: p.path, label: p.label, views: p.views }))} />
        <Languages {...stats.languages} />
      </div>
      <p className="text-xs text-neutral-500 dark:text-[#A1A1AA]">Pages vues, pas visiteurs : le site ne pose ni cookie ni identifiant, et ne compte ni les robots ni les visiteurs « Do Not Track ».</p>
    </div>
  );
}

export function StatsPage() {
  const [days, setDays] = useState<'7' | '30' | '90'>('30');
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    setError(false);
    api<Stats>('GET', `stats?days=${days}`).then(
      (s) => alive && setStats(s),
      () => alive && setError(true),
    );
    return () => {
      alive = false;
    };
  }, [days]);

  return (
    <div className={pageClass}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[var(--accent)]">Statistiques</p>
          <h1 className="mt-2 font-syne text-3xl font-extrabold tracking-tight md:text-4xl">Visites du site</h1>
        </div>
        <Segmented
          label="Période"
          value={days}
          onChange={setDays}
          options={[
            ['7', '7 jours'],
            ['30', '30 jours'],
            ['90', '90 jours'],
          ]}
        />
      </div>
      {error ? <p className="text-sm text-[var(--accent)]">Impossible de charger les statistiques.</p> : stats ? <StatsView stats={stats} /> : <p className="text-sm text-neutral-500">Chargement…</p>}
    </div>
  );
}
