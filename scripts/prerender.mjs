// Writes one static HTML file per route (FR + EN home, every project page) and
// the sitemap, so crawlers that don't run JavaScript still see real content,
// per-page <head> metadata and structured data.
// Runs after `vite build` (client) and `vite build --ssr` (dist-ssr).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dist = path.join(root, 'dist');
const ssrEntry = path.join(root, 'dist-ssr', 'entry-server.js');

const { render, getAllRoutes, getHeadData, renderHeadTags, renderSitemap, projectImagePaths, pathFor, USER_INFO } = await import(
  pathToFileURL(ssrEntry).href
);

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');
const SEO_BLOCK = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;
if (!SEO_BLOCK.test(template)) throw new Error('index.html is missing the <!--seo:start--> / <!--seo:end--> markers');

for (const route of getAllRoutes()) {
  const url = pathFor(route);
  const head = getHeadData(route);

  let page = template;
  // noindex pages (privacy policy): their own robots tag replaces the template's generic one
  if (head.noindex) page = page.replace(/\s*<meta name="robots"[^>]*>/, '');
  const html = page
    .replace(/<html lang="[^"]*"/, `<html lang="${head.lang}"`)
    .replace(SEO_BLOCK, `<!--seo:start-->\n${renderHeadTags(head)}\n    <!--seo:end-->`)
    .replace('<div id="root"></div>', `<div id="root">${render(url)}</div>`);

  // Write both "x.html" and "x/index.html": `vite preview` (and many static hosts)
  // resolve "/projets/x" to x.html, others (nginx try_files $uri/) to x/index.html.
  // "/" only needs dist/index.html; "/en/" also gets en.html so "/en" works.
  const trimmed = url.replace(/\/$/, '');
  const files = [path.join(dist, url, 'index.html')];
  if (trimmed) files.push(path.join(dist, `${trimmed}.html`));
  for (const file of files) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  }
  console.log(`prerendered ${url}`);
}

// 404 pages, French and English (served with a real 404 status by the production server,
// the English one for /en/… addresses): noindex instead of the template's generic robots tag
for (const lang of ['fr', 'en']) {
  const head = getHeadData({ name: 'notFound', lang });
  const html = template
    .replace(/<html lang="[^"]*"/, `<html lang="${head.lang}"`)
    .replace(/\s*<meta name="robots"[^>]*>/, '')
    .replace(SEO_BLOCK, `<!--seo:start-->\n${renderHeadTags(head)}\n    <!--seo:end-->`)
    .replace('<div id="root"></div>', `<div id="root">${render(lang === 'fr' ? '/404' : '/en/404')}</div>`);
  const file = lang === 'fr' ? '404.html' : '404-en.html';
  fs.writeFileSync(path.join(dist, file), html);
  console.log(`prerendered ${file}`);
}

// Sitemap lastmod = date of the last commit touching the files a page is made of, so it only
// moves when the page's content does. Without git (or for files never committed): today.
const today = new Date().toISOString().slice(0, 10);
const lastCommit = (paths) => {
  try {
    const date = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...paths], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return date || today;
  } catch {
    return today;
  }
};

// Case study file of each project (src/data/caseStudies/); a project missing here falls back
// to the project data file
const CASE_STUDY_FILES = {
  hug: 'hug',
  'karting-vuiteboeuf': 'karting',
  oceansight: 'oceansight',
  'etoile-blanche': 'etoileBlanche',
  drivegear: 'drivegear',
  'f1-pitwall': 'f1Pitwall',
};
const HOME_SOURCES = [
  'src/data/portfolioData.ts',
  'src/context/LanguageContext.tsx',
  ...['Hero', 'HeroBandeau', 'SkillsSection', 'ProjectsSection', 'ProjectCard', 'AboutSection', 'ContactSection', 'ContactExtras'].map(
    (name) => `src/components/${name}.tsx`,
  ),
  ':(glob)public/images/*.webp',
];
const sourcesFor = (route) => {
  if (route.name === 'project') {
    const file = CASE_STUDY_FILES[route.slug];
    if (!file) return ['src/data/portfolioData.ts'];
    const folders = new Set(projectImagePaths(route.lang, route.slug).map((src) => `public${path.posix.dirname(src)}`));
    return [`src/data/caseStudies/${file}.ts`, ...folders];
  }
  return HOME_SOURCES;
};

const sitemap = renderSitemap({
  page: (route) => lastCommit(sourcesFor(route)),
  cv: lastCommit([path.posix.join('public', USER_INFO.cv)]),
});
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
console.log('wrote sitemap.xml');

fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
