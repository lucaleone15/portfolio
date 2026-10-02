// Writes one static HTML file per route (FR + EN home, every project page) and
// the sitemap, so crawlers that don't run JavaScript still see real content,
// per-page <head> metadata and structured data.
// Runs after `vite build` (client) and `vite build --ssr` (dist-ssr).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dist = path.join(root, 'dist');
const ssrEntry = path.join(root, 'dist-ssr', 'entry-server.js');

const { render, getAllRoutes, getHeadData, renderHeadTags, renderSitemap, pathFor } = await import(
  pathToFileURL(ssrEntry).href
);

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8');
const SEO_BLOCK = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;
if (!SEO_BLOCK.test(template)) throw new Error('index.html is missing the <!--seo:start--> / <!--seo:end--> markers');

for (const route of getAllRoutes()) {
  const url = pathFor(route);
  const head = getHeadData(route);

  const html = template
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

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(dist, 'sitemap.xml'), renderSitemap(today));
console.log('wrote sitemap.xml');

fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
