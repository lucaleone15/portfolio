import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {createContactHandler} from './server/contact';

/** POST /api/contact on the dev and preview (production) servers — see server/contact.ts */
function contactApi(env: Record<string, string>): Plugin {
  const handler = createContactHandler(env);
  return {
    name: 'contact-api',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig(({ isSsrBuild, mode }) => {
  // All variables from .env (not only VITE_*): SMTP settings stay server-side
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env } as Record<string, string>;
  return {
    plugins: [react(), tailwindcss(), contactApi(env)],
    build: {
      // The SSR bundle (dist-ssr) is only used by scripts/prerender.mjs: no need to copy public/
      copyPublicDir: !isSsrBuild,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      allowedHosts: ['luca-leone.ch', 'www.luca-leone.ch'],
    },
  };
});
