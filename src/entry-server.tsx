import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

/** Build-time only: renders a route to static HTML (see scripts/prerender.mjs). */
export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <App initialUrl={url} />
    </StrictMode>,
  );
}

export { getAllRoutes, getHeadData, renderHeadTags, renderSitemap } from './seo';
export { pathFor } from './router';
