import fs from 'node:fs';
import path from 'node:path';
import { createMessageStore } from '../../server/messages';
import { createContactHandler } from '../../server/contact';
import { serve, tmpDir } from './helpers';

const sample = { name: 'Camille', email: 'camille@example.com', subject: 'Stage / emploi', message: 'Bonjour !', lang: 'fr' as const, page: '/contact' };

test('messages are added newest first, updated, removed, and survive a restart', () => {
  const dir = tmpDir('msg');
  let clock = Date.parse('2026-10-18T10:00:00Z');
  const store = () => createMessageStore(dir, { now: () => clock });
  const a = store().add(sample);
  clock += 1000;
  const b = store().add({ ...sample, name: 'Noé' });
  expect(store().list().map((m) => m.id)).toEqual([b.id, a.id]);
  expect(a.status).toBe('new');
  store().update(a.id, { status: 'read' });
  expect(store().list().find((m) => m.id === a.id)?.status).toBe('read');
  expect(store().unread()).toBe(1);
  store().remove(b.id);
  expect(store().list()).toHaveLength(1);
  expect(fs.readFileSync(path.join(dir, 'messages.json'), 'utf8')).toContain('Camille');
});

test('messages older than 12 months are deleted', () => {
  const dir = tmpDir('msg');
  let clock = Date.parse('2025-09-01T10:00:00Z');
  const store = () => createMessageStore(dir, { now: () => clock });
  store().add(sample);
  clock = Date.parse('2026-10-18T10:00:00Z');
  store().add({ ...sample, name: 'Récent' });
  expect(store().list().map((m) => m.name)).toEqual(['Récent']);
});

test('the contact form keeps the message even without email settings, and ignores the honeypot', async () => {
  const dir = tmpDir('msg');
  const messages = createMessageStore(dir);
  const srv = await serve(createContactHandler({}, { messages }) as never);
  const post = (body: object) => fetch(`${srv.base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const ok = await post(sample);
  expect(ok.status).toBe(200);
  expect(await ok.json()).toEqual({ ok: true, confirmed: false });
  expect(messages.list()).toMatchObject([{ name: 'Camille', email: 'camille@example.com', subject: 'Stage / emploi', message: 'Bonjour !', status: 'new', emailed: false }]);
  await post({ ...sample, honey: 'bot' });
  expect(messages.list()).toHaveLength(1);
  expect((await post({ ...sample, email: 'pas-un-email' })).status).toBe(422);
  await srv.close();
});
