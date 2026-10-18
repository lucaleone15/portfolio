import fs from 'node:fs';

/**
 * The atelier's statistics, from the first-party page views (server/analytics.ts writes one
 * line per view: date, page, referrer host — no cookie, no IP). Page views, not visitors: with
 * nothing to recognise a visitor by, the two can't be told apart.
 */

export interface Hit {
  t: string;
  p: string;
  r: string;
}

export interface Stats {
  days: number;
  total: number;
  /** Same length of time just before, for the comparison */
  previousTotal: number;
  byDay: { day: string; views: number }[];
  projects: { id: string; name: string; views: number; fr: number; en: number }[];
  pages: { path: string; label: string; views: number }[];
  /** '' = direct or unknown */
  referrers: { host: string; views: number }[];
  languages: { fr: number; en: number };
}

const DAY = 86_400_000;

export function readHits(file: string, sinceMs: number): Hit[] {
  if (!fs.existsSync(file)) return [];
  const out: Hit[] = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line) continue;
    try {
      const h = JSON.parse(line) as Hit;
      if (Date.parse(h.t) >= sinceMs) out.push(h);
    } catch {
      // a damaged line: skipped
    }
  }
  return out;
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'Accueil',
  '/projets': 'Projets',
  '/a-propos': 'À propos',
  '/contact': 'Contact',
  '/confidentialite': 'Confidentialité',
  '/stand': 'Stand (caché)',
  '/podium': 'Podium (caché)',
  '/en/': 'Accueil (EN)',
  '/en/projects': 'Projets (EN)',
  '/en/about': 'À propos (EN)',
  '/en/contact': 'Contact (EN)',
  '/en/privacy': 'Confidentialité (EN)',
  '/en/stand': 'Stand (caché, EN)',
  '/en/podium': 'Podium (caché, EN)',
};

const projectOf = (path: string) => /^\/(?:projets|en\/projects)\/([^/]+)$/.exec(path)?.[1] ?? null;

function labelOf(path: string, names: Record<string, string>): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  const id = projectOf(path);
  if (id) return `Projet · ${names[id] ?? id}${path.startsWith('/en/') ? ' (EN)' : ''}`;
  return path;
}

const ranked = <K extends string>(map: Map<string, number>, key: K) =>
  [...map.entries()].sort((a, b) => b[1] - a[1]).map(([k, views]) => ({ [key]: k, views }) as { [P in K]: string } & { views: number });

export function computeStats(hits: Hit[], opts: { days: number; now: number; projectNames: Record<string, string> }): Stats {
  const { days, now, projectNames } = opts;
  const today = new Date(now).toISOString().slice(0, 10);
  const firstDay = new Date(Date.parse(today) - (days - 1) * DAY);
  const start = firstDay.getTime();
  const previousStart = start - days * DAY;

  const current = hits.filter((h) => Date.parse(h.t) >= start);
  const previousTotal = hits.filter((h) => Date.parse(h.t) >= previousStart && Date.parse(h.t) < start).length;

  const perDay = new Map<string, number>();
  for (let i = 0; i < days; i++) perDay.set(new Date(start + i * DAY).toISOString().slice(0, 10), 0);
  const pages = new Map<string, number>();
  const referrers = new Map<string, number>();
  const projects = new Map<string, { fr: number; en: number }>();
  const languages = { fr: 0, en: 0 };

  for (const h of current) {
    const day = h.t.slice(0, 10);
    if (perDay.has(day)) perDay.set(day, perDay.get(day)! + 1);
    pages.set(h.p, (pages.get(h.p) ?? 0) + 1);
    referrers.set(h.r ?? '', (referrers.get(h.r ?? '') ?? 0) + 1);
    const en = h.p === '/en' || h.p.startsWith('/en/');
    languages[en ? 'en' : 'fr']++;
    const id = projectOf(h.p);
    if (id) {
      const p = projects.get(id) ?? { fr: 0, en: 0 };
      p[en ? 'en' : 'fr']++;
      projects.set(id, p);
    }
  }

  return {
    days,
    total: current.length,
    previousTotal,
    byDay: [...perDay.entries()].map(([day, views]) => ({ day, views })),
    projects: [...projects.entries()]
      .map(([id, p]) => ({ id, name: projectNames[id] ?? id, views: p.fr + p.en, fr: p.fr, en: p.en }))
      .sort((a, b) => b.views - a.views || a.name.localeCompare(b.name)),
    pages: ranked(pages, 'path')
      .slice(0, 12)
      .map((p) => ({ path: p.path, label: labelOf(p.path, projectNames), views: p.views })),
    referrers: ranked(referrers, 'host').slice(0, 10),
    languages,
  };
}
