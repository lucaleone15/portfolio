// Real dates of each page, read from git at build time (vite.config.ts injects them as
// __PAGE_DATES__): a page's last update is the date of the last commit touching the files it
// is made of, so it only moves when its content really changes. The same dates feed the
// visible "updated on" line, the structured data (dateModified) and the sitemap (lastmod).
// Without git (or for files never committed): today.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/** Files the home page is made of */
export const HOME_SOURCES = [
  'content/site.json',
  'content/projects.json',
  ':(glob)content/projects/*.json',
  'src/context/LanguageContext.tsx',
  ...['Hero', 'HeroBandeau', 'SkillsSection', 'ProjectsSection', 'ProjectCard', 'AboutSection', 'ContactSection', 'ContactExtras'].map(
    (name) => `src/components/${name}.tsx`,
  ),
  ':(glob)public/images/*.webp',
];

/** Files a project page is made of: its content, and the folders of the images and videos it shows */
function projectSources(root, slug) {
  const file = `content/projects/${slug}.json`;
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const folders = new Set([...text.matchAll(/"(\/(?:images|videos)\/[^"]+)"/g)].map((m) => `public${path.posix.dirname(m[1])}`));
  return [file, ...folders];
}

export function computePageDates(root = process.cwd()) {
  const today = new Date().toISOString().slice(0, 10);
  const git = (args) => {
    try {
      return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      return '';
    }
  };
  const lastCommit = (paths) => git(['log', '-1', '--format=%cs', '--', ...paths]) || today;
  const firstCommit = (paths) => git(['log', '--diff-filter=A', '--format=%cs', '--', ...paths]).split('\n').filter(Boolean).pop() || today;

  const dir = path.join(root, 'content/projects');
  const slugs = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)) : [];
  return {
    site: {
      published: git(['log', '--reverse', '--format=%cs']).split('\n')[0] || today,
      modified: lastCommit(HOME_SOURCES),
    },
    projects: Object.fromEntries(
      slugs.map((slug) => [slug, { added: firstCommit([`content/projects/${slug}.json`]), modified: lastCommit(projectSources(root, slug)) }]),
    ),
  };
}
