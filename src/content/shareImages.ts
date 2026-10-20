import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import satori from 'satori';
import sharp from 'sharp';
import type { Content } from './schema';
import { visibleProjects } from './localize';
import { personalCardInputs, personalShareImage, projectShareImage, shareCardInputs, SHARE_SIZE } from './og';
import { PersonalShareCard, PORTRAIT_SIZE, ProjectShareCard } from './ShareCard';

/**
 * Build time (scripts/prerender.mjs): the personal share image per language, and one per
 * project and language shown on the site, written where og.ts says. satori turns the card into vector shapes (text
 * included, in the site's own fonts), sharp makes the JPEG — no browser needed on the server.
 */

const font = (pkg: string, file: string) => fs.readFileSync(path.join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', file));

function fonts() {
  const pjs = (w: 500 | 600 | 700 | 800) =>
    ['latin', 'latin-ext'].map((range) => ({ name: 'Plus Jakarta Sans', data: font('plus-jakarta-sans', `plus-jakarta-sans-${range}-${w}-normal.woff`), weight: w, style: 'normal' as const }));
  return [
    ...pjs(500),
    ...pjs(600),
    ...pjs(700),
    ...pjs(800),
    ...['latin', 'latin-ext'].map((range) => ({ name: 'Syne', data: font('syne', `syne-${range}-700-normal.woff`), weight: 700 as const, style: 'normal' as const })),
  ];
}

const dataUri = (mime: string, buf: Buffer) => `data:${mime};base64,${buf.toString('base64')}`;

export async function generateShareImages(content: Content, opts: { publicDir: string; outDir: string; portrait?: string }): Promise<string[]> {
  const fontList = fonts();
  const written: string[] = [];
  const render = async (file: string, element: Parameters<typeof satori>[0]) => {
    const target = path.join(opts.outDir, file);
    written.push(file);
    if (fs.existsSync(target)) return;
    const svg = await satori(element, { width: SHARE_SIZE.width, height: SHARE_SIZE.height, fonts: fontList });
    const jpeg = await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, jpeg);
  };

  // The personal image: the hero's words and the cut-out portrait (public/images/portrait-cutout.webp)
  const portraitFile = opts.portrait ?? path.join(opts.publicDir, 'images', 'portrait-cutout.webp');
  const portrait = dataUri(
    'image/png',
    await sharp(portraitFile).resize(PORTRAIT_SIZE.width, PORTRAIT_SIZE.height, { fit: 'contain', position: 'bottom', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
  );
  for (const lang of ['fr', 'en'] as const) {
    await render(personalShareImage(content.site, lang), createElement(PersonalShareCard, { ...personalCardInputs(content.site, lang), portrait }));
  }

  for (const lang of ['fr', 'en'] as const) {
    for (const p of visibleProjects(content, lang)) {
      const file = projectShareImage(p, lang, content.site);
      if (!file.startsWith(`/og/${p.id}-`)) continue; // no cover: the personal image is used
      if (fs.existsSync(path.join(opts.outDir, file))) {
        written.push(file);
        continue;
      }
      const inputs = shareCardInputs(p, lang);
      const cover = await sharp(path.join(opts.publicDir, p.imageUrl)).resize(1190, 744, { fit: 'cover' }).jpeg({ quality: 86 }).toBuffer();
      let logo: { src: string; width: number; height: number } | undefined;
      if (p.logo?.srcDark) {
        const png = await sharp(path.join(opts.publicDir, p.logo.srcDark)).png().toBuffer();
        logo = { src: dataUri('image/png', png), width: p.logo.width, height: p.logo.height };
      }
      await render(
        file,
        createElement(ProjectShareCard, {
          hook: inputs.hook,
          name: inputs.name,
          role: inputs.role,
          year: inputs.year,
          cover: dataUri('image/jpeg', cover),
          logo,
        }),
      );
    }
  }
  return written;
}
