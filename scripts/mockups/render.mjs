// Renders the case studies' device mock-ups with MockupLab (../MockupLab, its dev server on
// :5173: cd ../MockupLab && npx vite) from scripts/mockups/jobs.json, then frame.py crops them.
//   node scripts/mockups/render.mjs scripts/mockups/jobs.json <outDir> [name,...]
// Sources are paths relative to the portfolio (matiere/ is local only). Background: radial
// gradient fitted on each project's preview (same colours).
// Job: { name, model, images: [path, ...] (one per device), bg: [inner, outer], ratio, resolution,
//        camera?: {...}, arrange?: true, scale?: n, params?: {...}, paramImages?: { param: path } }
import { chromium } from '../../../MockupLab/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const [, , jobsFile, outDir, only] = process.argv;
const jobs = JSON.parse(readFileSync(jobsFile, 'utf8')).filter((j) => !only || only.split(',').includes(j.name));
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.addInitScript(() => { indexedDB.deleteDatabase('mockuplab'); localStorage.setItem('mockuplab:theme', 'dark'); });
page.on('pageerror', (e) => console.log('pageerror', e.message));
for (const job of jobs) {
  await page.goto('http://localhost:5173/studio');
  await page.waitForFunction(() => window.__mockuplab, null, { timeout: 30000 });
  await page.waitForTimeout(1000);
  const toFile = (p) => ({ name: p.split('/').pop(), type: p.endsWith('.jpg') || p.endsWith('.jpeg') ? 'image/jpeg' : p.endsWith('.webp') ? 'image/webp' : 'image/png', data: readFileSync(p).toString('base64') });
  const abs = (p) => fileURLToPath(new URL('../../' + p, import.meta.url));
  const files = job.images.map(abs).map(toFile);
  const paramFiles = Object.entries(job.paramImages ?? {}).map(([k, p]) => ({ param: k, ...toFile(abs(p)) }));
  const res = await page.evaluate(async ({ job, files, paramFiles }) => {
    const api = window.__mockuplab; const st = () => api.project.getState();
    const toFile = (f) => { const bin = atob(f.data); const buf = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) buf[k] = bin.charCodeAt(k); return new File([buf], f.name, { type: f.type }); };
    st().replaceModel(st().selectedId, job.model);
    for (let i = 1; i < files.length; i++) st().addItem(job.model);
    for (const [k, v] of Object.entries(job.params ?? {})) for (const it of st().items) st().setParam(it.id, k, v);
    if (job.row) {
      // side by side, facing the camera, centred
      const n = st().items.length; const step = job.row;
      st().items.forEach((it, i) => st().updateItem(it.id, { position: [(i - (n - 1) / 2) * step, 0, 0], rotation: [0, job.yaw ?? 0, 0] }));
    } else if (files.length > 1) st().arrange();
    st().setBackground({ kind: 'gradient', type: 'radial', angle: 0, stops: [{ color: job.bg[0], at: 0 }, { color: job.bg[1], at: 1 }] });
    if (job.camera) st().setCamera(job.camera);
    if (job.lighting) st().setLighting(job.lighting);
    if (job.ground) st().setGround(job.ground);
    // no studio set (MockupLab's default is a backdrop sweep): the gradient is the background
    st().setDecor({ kind: 'none' });
    const slots = [];
    for (const [i, f] of files.entries()) {
      const asset = await api.importAsset(toFile(f));
      const item = st().items[i];
      const slot = Object.keys(item.surfaces)[0] ?? 'screen';
      slots.push(slot);
      st().setSurface(item.id, slot, { assetId: asset.id, fit: 'cover', align: job.align ?? 0 });
    }
    // image params (e.g. a social post's account photo) take an imported asset's id
    for (const f of paramFiles) {
      const asset = await api.importAsset(toFile(f));
      for (const it of st().items) st().setParam(it.id, f.param, asset.id);
    }
    st().setExport({ resolution: job.resolution ?? '2k', ratio: job.ratio ?? '4:3', format: 'png', ...(job.export ?? {}) });
    await new Promise((r) => setTimeout(r, 2500));
    const enc = async () => {
      const r = await api.renderImage();
      const b = new Uint8Array(await r.blob.arrayBuffer()); let s = '';
      for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
      return btoa(s);
    };
    const data = await enc();
    // same scene on a transparent background: its alpha gives the devices' outline (framing)
    st().setBackground({ kind: 'transparent' });
    await new Promise((r) => setTimeout(r, 600));
    const alpha = await enc();
    return { data, alpha, slots, items: st().items.length };
  }, { job, files, paramFiles });
  writeFileSync(`${outDir}/${job.name}.png`, Buffer.from(res.data, 'base64'));
  writeFileSync(`${outDir}/${job.name}.alpha.png`, Buffer.from(res.alpha, 'base64'));
  console.log(job.name, 'items', res.items, 'slots', res.slots.join(','));
}
await browser.close();
