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

export { getAllRoutes, getHeadData, projectImagePaths, renderHeadTags, renderSitemap } from './seo';
export { USER_INFO } from './data/portfolioData';
export { pathFor } from './router';
export { CONTENT } from './content/load';
export { checkContent } from './content/check';
export { generateShareImages } from './content/shareImages';
export { DERIVED_FILES, fillDerivedFile } from './content/derived';
