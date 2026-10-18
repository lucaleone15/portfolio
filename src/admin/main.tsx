import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/syne';
import '../index.css';
import './admin.css';
import { AdminApp } from './AdminApp';

// Light / dark follows the system (no inline script: the site's CSP allows none here)
const dark = window.matchMedia('(prefers-color-scheme: dark)');
const applyTheme = () => {
  document.documentElement.classList.toggle('dark', dark.matches);
  document.documentElement.style.colorScheme = dark.matches ? 'dark' : 'light';
};
// The page behind the app (overscroll on phones) follows the theme too
document.body.classList.add('bg-[var(--color-paper)]', 'dark:bg-[#0A0A0C]');
applyTheme();
dark.addEventListener('change', applyTheme);

createRoot(document.getElementById('admin')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
