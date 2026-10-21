// Captures the Karting Vuiteboeuf app (../KartingVuiteboeufApp) in Chrome for the case study: its built
// renderer with a mocked window.api fed by the local snapshots, then the results visuals from its exporter.
//   node scripts/mockups/capture-karting-app.mjs <outDir> [zoom]   (zoom: closer view, for the crop step)
import { chromium } from '/Users/lucaleone/Desktop/PROG/MockupLab/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, join } from 'node:path';

const outDir = process.argv[2];
const ZOOM = process.argv[3] === 'zoom';
const PHOTO = '/Users/lucaleone/Desktop/PERSO/KV/Photos/2026_05_10-Junior_Cup/Podium/Podium_20260510-12.jpg';
const APP = '/Users/lucaleone/Desktop/PROG/KartingVuiteboeufApp';
const DIST = APP + '/src/renderer/dist';
const SNAP = '/Users/lucaleone/Library/Application Support/vuiteboeuf-track-export/snapshots/';
const require = createRequire(import.meta.url);
const { diffSnapshots } = require(APP + '/src/main/diffSnapshots.js');

const prev = JSON.parse(readFileSync(SNAP + '2026-09-22T08-12-34-854Z.json', 'utf8'));
const cur = JSON.parse(readFileSync(SNAP + '2026-10-21T13-32-58-963Z.json', 'utf8'));
const diff = diffSnapshots(prev, cur);

// Fictional podium on the races used for the crop shot (the photo is a made-up one too).
const FICT = ['Morel Julien', 'Keller Noah', 'Dubois Marco'];
for (const r of cur.results.entries) {
  if (r.eventName === 'Junior Cup Pro C1') r.rankings.slice(0, 3).forEach((e, i) => { e.driver = FICT[i]; });
}

const types = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.html': 'text/html', '.png': 'image/png' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = join(DIST, p);
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(4789);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage(ZOOM ? { viewport: { width: 1008, height: 655 }, deviceScaleFactor: 3 } : { viewport: { width: 1512, height: 982 }, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.addInitScript(({ prev, cur, diff }) => {
  const snaps = { [prev.scrapedAt]: prev, [cur.scrapedAt]: cur };
  let list = [{ timestamp: prev.scrapedAt }];
  window.api = {
    historyList: async () => list,
    historyGet: async (ts) => snaps[ts],
    scrapeStart: async () => { list = [{ timestamp: cur.scrapedAt }, ...list]; return { ...cur, diff }; },
    settingsGet: async () => ({ calendarLimit: 20, resultsLimit: 20 }),
    settingsSet: async () => ({}),
    exportSnapshot: async () => ({}),
    exportResultImages: async (races, dateLabel, eventPhotos) => { window.__exportArgs = { races, dateLabel, eventPhotos }; return {}; },
  };
}, { prev, cur, diff });

await page.goto('http://localhost:4789/');
await page.waitForTimeout(800);
await page.getByRole('button', { name: /Mettre à jour/ }).click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${outDir}/kv-calendrier.png` });

await page.getByText('Résultats', { exact: true }).first().click();
await page.waitForTimeout(500);
for (const name of ['Junior Cup Pro C1', 'Junior Cup Pro C2', 'Junior Cup Pro C3', 'Junior Cup Pro C4']) {
  const card = page.locator('div', { has: page.getByText(name, { exact: true }) }).filter({ has: page.locator('input[type=checkbox]') }).last();
  await card.locator('input[type=checkbox]').first().check();
}
await page.waitForTimeout(400);
await page.screenshot({ path: `${outDir}/kv-resultats.png` });

await page.getByRole('button', { name: /Générer/ }).click();
// event photo: the whole podium, as a slide after the cover
await page.locator('input[type=file]').first().setInputFiles(PHOTO);
await page.waitForTimeout(800);
await page.getByRole('button', { name: 'Valider' }).click();
await page.getByRole('button', { name: 'Continuer' }).click();
// first race (Pro C1): the same photo cut in three
await page.getByRole('button', { name: /Photo de groupe à cropper/ }).click();
await page.locator('input[type=file]').setInputFiles(PHOTO);
await page.waitForTimeout(1200);
// zones in stage order (P2, P1, P3), in the 560px-wide display of the photo: [x, y, width]
const targets = [[109, 83, 100], [227, 72, 100], [365, 100, 100]];
const zones = page.locator('div.cursor-move');
const img = await page.locator('img[alt="À recadrer"]').boundingBox();
for (let i = 0; i < 3; i++) {
  const z = zones.nth(i);
  let b = await z.boundingBox();
  // resize from the corner handle, then move by the body
  const h = await z.locator('div.cursor-nwse-resize').boundingBox();
  const [tx, ty, tw] = targets[i];
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
  await page.mouse.down();
  await page.mouse.move(h.x + h.width / 2 - (b.width - tw), h.y + h.height / 2, { steps: 5 });
  await page.mouse.up();
  b = await z.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(img.x + tx + b.width / 2, img.y + ty + b.height / 2, { steps: 5 });
  await page.mouse.up();
}
await page.mouse.move(0, 0);
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/kv-podium.png` });
await page.getByRole('button', { name: 'Valider' }).click();
for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /Sans photos/ }).click();
await page.waitForFunction(() => window.__exportArgs);
const args = await page.evaluate(() => window.__exportArgs);
const { generateResultImages } = require(APP + '/src/main/exporters/resultImage.js');
const images = await generateResultImages(args.races, { dateLabel: args.dateLabel, eventPhotos: args.eventPhotos });
const { writeFileSync, mkdirSync } = await import('node:fs');
mkdirSync(`${outDir}/visuels`, { recursive: true });
for (const im of images) writeFileSync(`${outDir}/visuels/${im.filename}`, im.buffer);
console.log(images.map((i) => i.filename).join(' '));
await browser.close();
server.close();
