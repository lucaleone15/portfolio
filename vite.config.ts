import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {createContactHandler} from './server/contact';
import {createAnalyticsHandler} from './server/analytics';
import {createPodiumHandler} from './server/podium';
import {createAdminRoutes} from './server/admin/routes';
import {execSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';

/**
 * The site's own endpoints during `npm run dev` / `vite preview` (production uses
 * server/index.ts): POST /api/contact and the first-party analytics.
 */
function siteApi(env: Record<string, string>): Plugin {
  const contact = createContactHandler(env);
  const analytics = createAnalyticsHandler(env);
  const podium = createPodiumHandler();
  const notFound = (_req: IncomingMessage, res: ServerResponse) => {
    res.statusCode = 404;
    res.end('Not found');
  };
  const mount = (server: { middlewares: { use: (fn: never) => void }; transformIndexHtml?: (url: string, html: string) => Promise<string> }) => {
    // The admin under ADMIN_PATH (dev: admin.html straight from Vite; preview: dist-admin)
    const admin = createAdminRoutes(env, {
      dataDir: path.resolve(process.cwd(), env.DATA_DIR || '.data'),
      repoRoot: process.cwd(),
      distAdmin: path.resolve(process.cwd(), 'dist-admin'),
      notFound,
      onPublished: () => {},
      servePage: server.transformIndexHtml
        ? (req, res, withBase) => {
            server.transformIndexHtml!(req.url ?? '/', withBase(readFileSync('admin.html', 'utf8'))).then((html) => {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(html);
            }, () => notFound(req, res));
          }
        : undefined,
    });
    server.middlewares.use(admin as never);
    server.middlewares.use(contact as never);
    server.middlewares.use(analytics as never);
    server.middlewares.use(podium as never);
  };
  return { name: 'site-api', configureServer: mount, configurePreviewServer: mount };
}

/** Facts shown on the hidden /stand page, read at build time (git may be missing: then empty) */
function buildInfo() {
  const git = (cmd: string) => {
    try {
      return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      return '';
    }
  };
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const version = (name: string) => String(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name] ?? '').replace(/^[\^~]/, '');
  return {
    commits: Number(git('git rev-list --count HEAD')) || 0,
    firstCommit: git('git log --reverse --format=%cs | head -1'),
    builtAt: new Date().toISOString().slice(0, 10),
    versions: Object.fromEntries(['react', 'vite', 'tailwindcss', 'typescript', 'motion', 'gsap', 'nodemailer'].map((n) => [n, version(n)])),
  };
}

export default defineConfig(({ isSsrBuild, mode }) => {
  // All variables from .env (not only VITE_*): SMTP settings stay server-side
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env } as Record<string, string>;
  return {
    plugins: [react(), tailwindcss(), siteApi(env)],
    define: { __BUILD_INFO__: JSON.stringify(buildInfo()) },
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
