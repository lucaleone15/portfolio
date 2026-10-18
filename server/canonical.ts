import fs from 'node:fs';
import path from 'node:path';

/** Renamed projects: old slug → current one (content/projects.json, kept up to date by the admin) */
export function loadRedirects(root: string): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, 'content', 'projects.json'), 'utf8')).redirects ?? {};
  } catch {
    return {};
  }
}

/** The one spelling of a page path that the site links to and declares canonical */
export function canonicalPagePath(pathname: string, redirects: Record<string, string>) {
  let p = pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (p === '/en') p = '/en/';
  else if (p.length > 1 && p.endsWith('/') && p !== '/en/') p = p.slice(0, -1);
  return p.replace(/^(\/(?:en\/)?(?:projets|projects)\/)([^/]+)$/, (whole, prefix: string, slug: string) =>
    Object.hasOwn(redirects, slug) ? prefix + redirects[slug] : whole,
  );
}
