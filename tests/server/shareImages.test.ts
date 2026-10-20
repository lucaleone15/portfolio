import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { generateShareImages } from '../../src/content/shareImages';
import { personalShareImage, projectShareImage } from '../../src/content/og';
import { realContent } from '../content/fixtures';
import { tmpDir } from './helpers';

test('the build writes a 1200×630 JPEG per project and language, and the personal ones', async () => {
  const c = realContent();
  const out = tmpDir('og');
  const only = { ...c, index: { ...c.index, order: ['hug'] } };
  const written = await generateShareImages(only, { publicDir: path.join(process.cwd(), 'public'), outDir: out });
  const fr = path.join(out, projectShareImage(c.projects.hug, 'fr', c.site));
  expect(written).toContain(projectShareImage(c.projects.hug, 'fr', c.site));
  for (const lang of ['fr', 'en'] as const) {
    const personal = path.join(out, personalShareImage(c.site, lang));
    expect(await sharp(personal).metadata()).toMatchObject({ format: 'jpeg', width: 1200, height: 630 });
  }
  expect(fs.existsSync(fr)).toBe(true);
  const meta = await sharp(fr).metadata();
  expect(meta).toMatchObject({ format: 'jpeg', width: 1200, height: 630 });
  expect(fs.statSync(fr).size).toBeLessThan(300_000);
}, 30_000);
