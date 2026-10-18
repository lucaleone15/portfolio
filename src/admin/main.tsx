import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/syne';
import '../index.css';
import './admin.css';
import { AdminApp } from './AdminApp';
import { applySavedTheme } from './theme';

// Light / dark: the device's, unless chosen in the atelier (src/admin/theme.ts). No inline
// script: the site's CSP allows none here
document.body.classList.add('bg-[var(--color-paper)]', 'dark:bg-[#0A0A0C]');
applySavedTheme();

createRoot(document.getElementById('admin')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
