import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** The admin's own bundle (dist-admin/), served only under ADMIN_PATH by server/admin/handler.ts */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  publicDir: false,
  define: { __BUILD_INFO__: JSON.stringify({ commits: 0, firstCommit: '', builtAt: '', versions: {} }) },
  build: {
    outDir: 'dist-admin',
    emptyOutDir: true,
    rollupOptions: { input: 'admin.html' },
    assetsInlineLimit: (filePath: string) => (/\.(woff2?|ttf|otf)$/.test(filePath) ? false : undefined),
  },
});
