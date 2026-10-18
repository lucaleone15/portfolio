import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { processUpload, UploadError } from '../../server/admin/uploads';
import { tmpDir } from './helpers';

let staging: string;
beforeEach(() => {
  staging = tmpDir('staging');
});

/** A 400×300 image in Display P3 (like a Mac screenshot), one flat colour */
const p3Png = () =>
  sharp({ create: { width: 400, height: 300, channels: 3, background: { r: 200, g: 100, b: 50 } } })
    .withIccProfile('p3')
    .png()
    .toBuffer();

test('a Display P3 image comes out as sRGB WebP, with its size', async () => {
  const out = await processUpload({ kind: 'image', filename: 'Capture écran.png', body: await p3Png(), folder: 'case/hug', stagingDir: staging });
  expect(out.src).toMatch(/^\/images\/case\/hug\/capture-ecran-[0-9a-f]{8}\.webp$/);
  expect(out).toMatchObject({ width: 400, height: 300 });
  const file = path.join(staging, out.src);
  const meta = await sharp(file).metadata();
  expect(meta.format).toBe('webp');
  // The fixture stores P3 values (187, 105, 62) for sRGB (200, 100, 50): converted, the WebP is
  // back to ~200; a profile merely dropped would leave 187
  const stored = await sharp(await p3Png(), { ignoreIcc: true }).raw().toBuffer();
  expect(stored[0]).toBeLessThan(190);
  const { data } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  expect(Math.abs(data[0] - 200)).toBeLessThanOrEqual(2);
});

test('card covers get the sm and md variants, case study images do not', async () => {
  const cover = await processUpload({ kind: 'image', filename: 'x.png', body: await p3Png(), folder: '', stagingDir: staging });
  const name = path.basename(cover.src);
  expect(fs.existsSync(path.join(staging, 'images', 'sm', name))).toBe(true);
  expect(fs.existsSync(path.join(staging, 'images', 'md', name))).toBe(true);
  const inCase = await processUpload({ kind: 'image', filename: 'y.png', body: await p3Png(), folder: 'case/hug', stagingDir: staging });
  expect(fs.existsSync(path.join(staging, 'images', 'sm', 'case'))).toBe(false);
  expect(inCase.src.startsWith('/images/case/hug/')).toBe(true);
});

test('wide images are brought down to 1920 px', async () => {
  const big = await sharp({ create: { width: 3000, height: 1000, channels: 3, background: '#fff' } }).jpeg().toBuffer();
  const out = await processUpload({ kind: 'image', filename: 'large.jpg', body: big, folder: 'case/hug', stagingDir: staging });
  expect(out).toMatchObject({ width: 1920, height: 640 });
});

test('same file name, different content: different names', async () => {
  const a = await processUpload({ kind: 'image', filename: 'img.png', body: await p3Png(), folder: 'case/hug', stagingDir: staging });
  const other = await sharp({ create: { width: 10, height: 10, channels: 3, background: '#000' } }).png().toBuffer();
  const b = await processUpload({ kind: 'image', filename: 'img.png', body: other, folder: 'case/hug', stagingDir: staging });
  expect(a.src).not.toBe(b.src);
});

test('unreadable images, fake PDFs and oversized videos are refused with a French message', async () => {
  const junk = Buffer.from(Array.from({ length: 5000 }, (_, i) => (i * 37) % 256));
  await expect(processUpload({ kind: 'image', filename: 'photo.jpg', body: junk, folder: 'case/hug', stagingDir: staging })).rejects.toThrow(
    new UploadError('Format non pris en charge : exporte en JPEG ou PNG'),
  );
  await expect(processUpload({ kind: 'image', filename: 'IMG_0001.heic', body: junk, folder: 'case/hug', stagingDir: staging })).rejects.toThrow(
    'Format non pris en charge : exporte en JPEG ou PNG',
  );
  await expect(processUpload({ kind: 'pdf', filename: 'cv.pdf', body: junk, folder: '', stagingDir: staging })).rejects.toBeInstanceOf(UploadError);
  const huge = Buffer.alloc(61 * 1024 * 1024);
  huge.write('ftypisom', 4);
  await expect(processUpload({ kind: 'video', filename: 'clip.mp4', body: huge, folder: '', stagingDir: staging })).rejects.toThrow(/60 Mo/);
  await expect(processUpload({ kind: 'image', filename: 'a.png', body: await p3Png(), folder: '../etc', stagingDir: staging })).rejects.toBeInstanceOf(UploadError);
});

test('a real PDF and an MP4 are kept as they are', async () => {
  const pdf = Buffer.from('%PDF-1.7\n%âãÏÓ\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');
  const out = await processUpload({ kind: 'pdf', filename: 'CV Luca 2027.pdf', body: pdf, folder: '', stagingDir: staging });
  expect(out.src).toMatch(/^\/pdf\/cv-luca-2027-[0-9a-f]{8}\.pdf$/);
  expect(fs.readFileSync(path.join(staging, out.src)).equals(pdf)).toBe(true);
  const mp4 = Buffer.alloc(2000);
  mp4.write('ftypisom', 4);
  const video = await processUpload({ kind: 'video', filename: 'survol.mp4', body: mp4, folder: '', stagingDir: staging });
  expect(video.src).toMatch(/^\/videos\/survol-[0-9a-f]{8}\.mp4$/);
});
