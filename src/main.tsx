import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import App from './App.tsx';
// Fonts are self-hosted (no request to Google Fonts: visitors' IPs stay on this site)
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/plus-jakarta-sans/wght-italic.css';
import '@fontsource-variable/syne';
import './index.css';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production pages are prerendered (scripts/prerender.mjs): React adopts that HTML instead of
// wiping and redrawing it (the redraw cost ~3.5 s of "render delay" on mid-range phones).
// The dev server serves an empty #root: plain client render there.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
