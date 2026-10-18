import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { UPLOAD_LIMITS, tooLargeMessage } from '../../src/content/uploadLimits';

/**
 * Files added from the admin, prepared like scripts/make-image-variants.py does and kept in the
 * staging folder (DATA_DIR/admin/uploads/, laid out like public/) until Publish copies them:
 *   images  → sRGB WebP, at most 1920 px wide; card covers (folder '') also get sm/ and md/
 *   videos  → MP4 / WebM as they are       pdf → as it is
 * Names end with a hash of the content: a replaced file always gets a new name, so the 30-day
 * cache on public/ never serves the old one.
 */

export class UploadError extends Error {}

export type UploadKind = 'image' | 'video' | 'pdf';

export { UPLOAD_LIMITS };

const UNSUPPORTED = 'Format non pris en charge : exporte en JPEG ou PNG';
const VARIANTS = { sm: { width: 640, quality: 76 }, md: { width: 1280, quality: 78 } };

/** "Capture écran.png" → "capture-ecran" */
export function slugify(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'fichier'
  );
}

const hash8 = (body: Buffer) => crypto.createHash('sha256').update(body).digest('hex').slice(0, 8);

function save(stagingDir: string, src: string, data: Buffer) {
  const file = path.join(stagingDir, src);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}

export async function processUpload(input: {
  kind: UploadKind;
  filename: string;
  body: Buffer;
  /** Below public/images/: '' for card covers, 'case/<project>' for case study images */
  folder: string;
  stagingDir: string;
}): Promise<{ src: string; width?: number; height?: number }> {
  const { kind, filename, body, folder, stagingDir } = input;
  const limit = UPLOAD_LIMITS[kind];
  if (body.length > limit) throw new UploadError(tooLargeMessage(kind));
  if (folder !== '' && !/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(folder)) throw new UploadError('Dossier invalide.');
  const base = `${slugify(filename)}-${hash8(body)}`;

  if (kind === 'pdf') {
    if (body.subarray(0, 5).toString('latin1') !== '%PDF-') throw new UploadError('Ce fichier n’est pas un PDF.');
    const src = `/pdf/${base}.pdf`;
    save(stagingDir, src, body);
    return { src };
  }

  if (kind === 'video') {
    const isMp4 = body.subarray(4, 8).toString('latin1') === 'ftyp';
    const isWebm = body.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
    if (!isMp4 && !isWebm) throw new UploadError('Vidéo non prise en charge : exporte en MP4 (H.264) ou WebM.');
    const src = `/videos/${base}.${isMp4 ? 'mp4' : 'webm'}`;
    save(stagingDir, src, body);
    return { src };
  }

  let meta: sharp.Metadata;
  try {
    meta = await sharp(body).metadata();
  } catch {
    throw new UploadError(UNSUPPORTED);
  }
  // sharp reports AVIF as 'heif'; an iPhone HEIC (HEVC) can't be decoded and fails just below
  if (!meta.format || !['jpeg', 'png', 'webp', 'avif', 'heif', 'tiff', 'gif'].includes(meta.format)) throw new UploadError(UNSUPPORTED);

  // rotate(): apply the EXIF orientation; sharp converts from the embedded profile (Display P3
  // for Mac screenshots) to sRGB, so the colours don't look washed out in the browser
  const encode = (width: number, quality: number) =>
    sharp(body).rotate().resize({ width, withoutEnlargement: true }).toColourspace('srgb').webp({ quality }).toBuffer({ resolveWithObject: true });

  let full: { data: Buffer; info: sharp.OutputInfo };
  try {
    full = await encode(1920, 82);
  } catch {
    throw new UploadError(UNSUPPORTED);
  }
  const dir = folder ? `/images/${folder}` : '/images';
  const src = `${dir}/${base}.webp`;
  save(stagingDir, src, full.data);
  if (folder === '') {
    for (const [name, v] of Object.entries(VARIANTS)) {
      const out = await encode(v.width, v.quality);
      save(stagingDir, `/images/${name}/${base}.webp`, out.data);
    }
  }
  return { src, width: full.info.width, height: full.info.height };
}
