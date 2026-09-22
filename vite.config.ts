import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import {defineConfig, Plugin} from 'vite';

function saveProjectsPlugin(): Plugin {
  return {
    name: 'save-projects-api',
    configureServer(server) {
      server.middlewares.use('/api/save-projects', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              const filePath = path.resolve(__dirname, 'src/data/projectsData.json');
              fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Saved' }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end();
        }
      });

      // API to list existing media in /public/images and /public/pdf
      server.middlewares.use('/api/media-files', (req, res) => {
        if (req.method === 'GET') {
          try {
            const imagesDir = path.resolve(__dirname, 'public/images');
            const pdfDir = path.resolve(__dirname, 'public/pdf');
            
            const images = fs.existsSync(imagesDir)
              ? fs.readdirSync(imagesDir).filter((f) => /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(f)).map((f) => `/images/${f}`)
              : [];
            
            const pdfs = fs.existsSync(pdfDir)
              ? fs.readdirSync(pdfDir).filter((f) => /\.pdf$/i.test(f)).map((f) => `/pdf/${f}`)
              : [];

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ images, pdfs }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: String(err) }));
          }
        } else {
          res.statusCode = 405;
          res.end();
        }
      });

      // API to upload new media file directly to /public/images or /public/pdf
      server.middlewares.use('/api/upload-media', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { folder, filename, base64 } = JSON.parse(body);
              const targetFolder = folder === 'pdf' ? 'public/pdf' : 'public/images';
              const targetDir = path.resolve(__dirname, targetFolder);
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }

              // Sanitize filename
              const cleanFilename = (filename || `upload-${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_');
              const finalPath = path.resolve(targetDir, cleanFilename);

              // Strip base64 metadata prefix if present
              const pureBase64 = base64.replace(/^data:[^;]+;base64,/, '');
              const buffer = Buffer.from(pureBase64, 'base64');
              fs.writeFileSync(finalPath, buffer);

              // Automatically optimize uploaded images (resize down to max 1920x1080 and compress quality 82, strip metadata)
              if (folder !== 'pdf') {
                try {
                  const ext = path.extname(finalPath).toLowerCase();
                  if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
                    const tempOptimized = `${finalPath}.opt.tmp`;
                    // Run ImageMagick convert to optimize size and remove bulky camera / design tool metadata
                    execSync(`convert "${finalPath}" -resize '1920x1080>' -quality 82 -strip "${tempOptimized}"`, { timeout: 10000 });
                    if (fs.existsSync(tempOptimized) && fs.statSync(tempOptimized).size > 0) {
                      fs.renameSync(tempOptimized, finalPath);
                    }
                  }
                } catch (optErr) {
                  console.warn('Image optimization skipped or failed, fallback to original:', optErr);
                }
              }

              const publicUrl = `/${targetFolder.replace('public/', '')}/${cleanFilename}`;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, url: publicUrl, filename: cleanFilename }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), saveProjectsPlugin()],
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
  };
});
