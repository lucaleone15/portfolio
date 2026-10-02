import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {createContactHandler} from './server/contact';
import {createAnalyticsHandler} from './server/analytics';

/**
 * The site's own endpoints during `npm run dev` / `vite preview` (production uses
 * server/index.ts): POST /api/contact and the first-party analytics.
 */
function siteApi(env: Record<string, string>): Plugin {
  const contact = createContactHandler(env);
  const analytics = createAnalyticsHandler(env);
  const mount = (server: { middlewares: { use: (fn: never) => void } }) => {
    server.middlewares.use(contact as never);
    server.middlewares.use(analytics as never);
  };
  return { name: 'site-api', configureServer: mount, configurePreviewServer: mount };
}

export default defineConfig(({ isSsrBuild, mode }) => {
  // All variables from .env (not only VITE_*): SMTP settings stay server-side
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env } as Record<string, string>;
  return {
    plugins: [react(), tailwindcss(), siteApi(env)],
    build: {
      // The SSR bundle (dist-ssr) is only used by scripts/prerender.mjs: no need to copy public/
      copyPublicDir: !isSsrBuild,
      // Fonts are always real files: tiny subsets would otherwise be inlined as data: URIs,
      // which the production CSP (font-src 'self') rightly blocks
      assetsInlineLimit: (filePath: string) => (/\.(woff2?|ttf|otf)$/.test(filePath) ? false : undefined),
      // Source maps for the browser bundle (debugging in production; the code is public anyway)
      sourcemap: !isSsrBuild,
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
