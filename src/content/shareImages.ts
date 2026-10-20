import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import satori from 'satori';
import sharp from 'sharp';
import type { Content } from './schema';
import { visibleProjects } from './localize';
import { projectShareImage, shareCardInputs, SHARE_SIZE } from './og';
import { ShareCard } from './ShareCard';

/**
 * Build time (scripts/prerender.mjs): one share image per project and language shown on the
 * site, written where projectShareImage() says. satori turns the card into vector shapes (text
 * included, in the site's own fonts), sharp makes the JPEG — no browser needed on the server.
 */

const KIND = {
  fr: { pro: 'Projet professionnel', 'school-client': 'Académique · vrai client', school: 'Projet académique' },
  en: { pro: 'Professional work', 'school-client': 'Academic · real client', school: 'Academic project' },
} as const;

const font = (pkg: string, file: string) => fs.readFileSync(path.join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', file));

function fonts() {
  const pjs = (w: 500 | 600 | 700 | 800) =>
    ['latin', 'latin-ext'].map((range) => ({ name: 'Plus Jakarta Sans', data: font('plus-jakarta-sans', `plus-jakarta-sans-${range}-${w}-normal.woff`), weight: w, style: 'normal' as const }));
  return [
    ...pjs(500),
    ...pjs(600),
    ...pjs(700),
    ...pjs(800),
    ...['latin', 'latin-ext'].map((range) => ({ name: 'Syne', data: font('syne', `syne-${range}-800-normal.woff`), weight: 800 as const, style: 'normal' as const })),
  ];
}

const dataUri = (mime: string, buf: Buffer) => `data:${mime};base64,${buf.toString('base64')}`;

export async function generateShareImages(content: Content, opts: { publicDir: string; outDir: string }): Promise<string[]> {
  const fontList = fonts();
  const monogram = dataUri('image/svg+xml', fs.readFileSync(path.join(opts.publicDir, 'favicon.svg')));
  const written: string[] = [];

  for (const lang of ['fr', 'en'] as const) {
    for (const p of visibleProjects(content, lang)) {
      const file = projectShareImage(p, lang);
      if (!file.startsWith('/og/')) continue; // no cover: the personal image is used
      const target = path.join(opts.outDir, file);
      if (fs.existsSync(target)) {
        written.push(file);
        continue;
      }
      const inputs = shareCardInputs(p, lang);
      const cover = await sharp(path.join(opts.publicDir, p.imageUrl))
        .resize(SHARE_SIZE.width, SHARE_SIZE.height, { fit: 'cover', position: 'right' })
        .jpeg({ quality: 85 })
        .toBuffer();
      let logo: { src: string; width: number; height: number } | undefined;
      if (p.logo?.srcDark) {
        const png = await sharp(path.join(opts.publicDir, p.logo.srcDark)).png().toBuffer();
        logo = { src: dataUri('image/png', png), width: p.logo.width, height: p.logo.height };
      }
      const svg = await satori(
        createElement(ShareCard, {
          name: inputs.name,
          hook: inputs.hook,
          label: inputs.label,
          kindLabel: KIND[lang][p.kind],
          year: inputs.year,
          accent: p.accentColor ?? '#C50E36',
          cover: dataUri('image/jpeg', cover),
          logo,
          monogram,
        }),
        { width: SHARE_SIZE.width, height: SHARE_SIZE.height, fonts: fontList },
      );
      const jpeg = await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, jpeg);
      written.push(file);
    }
  }
  return written;
}
