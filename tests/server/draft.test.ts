import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createDraftStore, DraftError } from '../../server/admin/draft';
import { minimalProject, realContent } from '../content/fixtures';
import { tmpDir } from './helpers';

let repo: string;
let dir: string;
const write = (file: string, data: unknown) => {
  fs.mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
  fs.writeFileSync(path.join(repo, file), JSON.stringify(data, null, 2) + '\n');
};
const project = (id: string, title = 'Titre') => {
  const p = minimalProject();
  return { ...p, id, name: id.toUpperCase(), study: { ...p.study, title: { fr: title, en: title } } };
};
const store = () => createDraftStore({ repoRoot: repo, dir });

beforeEach(() => {
  repo = tmpDir('repo');
  dir = path.join(tmpDir('data'), 'draft');
  write('content/site.json', realContent().site);
  write('content/projects.json', { order: ['a', 'b'], hidden: [], redirects: { 'hug-sangsationnel': 'hug' } });
  write('content/projects/a.json', project('a'));
  write('content/projects/b.json', project('b'));
  execFileSync('git', ['init', '-q'], { cwd: repo });
});

test('without a draft, reading gives the repo content', () => {
  const r = store().read();
  expect(r.changed).toEqual([]);
  expect(r.content.projects.a.name).toBe('A');
  expect(r.content.index.order).toEqual(['a', 'b']);
});

test('an invalid page is refused', () => {
  expect(() => store().write('project:a', { ...project('a'), kind: 'nope' }, 0)).toThrow(DraftError);
  try {
    store().write('project:a', { id: 'a' }, 0);
  } catch (err) {
    expect((err as DraftError).code).toBe('invalid');
  }
});

test('a save made on an outdated revision is refused (another device saved first)', () => {
  const s = store();
  expect(s.write('project:a', project('a', 'Un'), 0).revision).toBe(1);
  expect(() => s.write('project:a', project('a', 'Deux'), 0)).toThrow(expect.objectContaining({ code: 'stale' }));
  expect(s.read().content.projects.a.study.title.fr).toBe('Un');
  expect(s.read().changed).toEqual(['project:a']);
});

test('conflicts: a page changed in the draft and in the repo', () => {
  const s = store();
  s.write('project:a', project('a', 'Brouillon'), 0);
  write('content/projects/a.json', project('a', 'Portable'));
  write('content/projects/b.json', project('b', 'Portable'));
  expect(s.conflicts()).toEqual(['project:a']);
  s.refreshUntouched();
  expect(s.read().content.projects.b.study.title.fr).toBe('Portable');
  expect(s.read().content.projects.a.study.title.fr).toBe('Brouillon');
});

test('resolving a conflict with the repo version', () => {
  const s = store();
  s.write('project:a', project('a', 'Brouillon'), 0);
  write('content/projects/a.json', project('a', 'Portable'));
  s.resolve('project:a', 'repo');
  expect(s.conflicts()).toEqual([]);
  expect(s.read().content.projects.a.study.title.fr).toBe('Portable');
  expect(s.read().changed).toEqual([]);
});

test('keeping the draft clears the conflict and keeps the change', () => {
  const s = store();
  s.write('project:a', project('a', 'Brouillon'), 0);
  write('content/projects/a.json', project('a', 'Portable'));
  s.resolve('project:a', 'draft');
  expect(s.conflicts()).toEqual([]);
  expect(s.read().changed).toEqual(['project:a']);
});

test('rename: refused onto an existing id, a redirect source or an invalid slug; redirects are flattened', () => {
  const s = store();
  expect(() => s.rename('a', 'b')).toThrow(expect.objectContaining({ code: 'taken' }));
  expect(() => s.rename('a', 'hug-sangsationnel')).toThrow(expect.objectContaining({ code: 'taken' }));
  expect(() => s.rename('a', 'A b')).toThrow(expect.objectContaining({ code: 'invalid-id' }));
  s.rename('a', 'c');
  s.rename('c', 'd');
  const { content } = s.read();
  // c was never published: only the published address a keeps working, pointing straight at d
  expect(content.index.redirects).toEqual({ 'hug-sangsationnel': 'hug', a: 'd' });
  expect(content.index.order).toEqual(['d', 'b']);
  expect(content.projects.d.id).toBe('d');
  expect(content.projects.a).toBeUndefined();
});

test('a new project joins the order; removing one takes it out', () => {
  const s = store();
  s.write('project:neuf', project('neuf'), 0);
  expect(s.read().content.index.order).toEqual(['a', 'b', 'neuf']);
  s.remove('b');
  const { content, changed } = s.read();
  expect(content.index.order).toEqual(['a', 'neuf']);
  expect(content.projects.b).toBeUndefined();
  expect(changed.sort()).toEqual(['index', 'project:b', 'project:neuf']);
});

test('applyTo writes only what changed and deletes removed projects', () => {
  const s = store();
  s.write('project:a', project('a', 'Nouveau'), 0);
  s.remove('b');
  const siteBefore = fs.statSync(path.join(repo, 'content/site.json')).mtimeMs;
  s.applyTo(repo);
  expect(JSON.parse(fs.readFileSync(path.join(repo, 'content/projects/a.json'), 'utf8')).study.title.fr).toBe('Nouveau');
  expect(fs.existsSync(path.join(repo, 'content/projects/b.json'))).toBe(false);
  expect(fs.statSync(path.join(repo, 'content/site.json')).mtimeMs).toBe(siteBefore);
});

test('a project deleted then created again at the same address starts from revision 0', () => {
  const s = store();
  s.remove('b');
  expect(s.read().revisions['project:b']).toBeUndefined();
  expect(s.write('project:b', project('b', 'Nouveau b'), 0).revision).toBe(1);
});

test('renaming back to the previous address works, and drops that redirect', () => {
  const s = store();
  s.rename('a', 'a2');
  s.rename('a2', 'a');
  const { content } = s.read();
  expect(content.projects.a.id).toBe('a');
  // a2 was never published: no redirect for it either
  expect(content.index.redirects).toEqual({ 'hug-sangsationnel': 'hug' });
});

test('renaming a project that was never published leaves no redirect behind', () => {
  const s = store();
  s.write('project:neuf', project('neuf'), 0);
  s.rename('neuf', 'neuf2');
  expect(s.read().content.index.redirects).toEqual({ 'hug-sangsationnel': 'hug' });
});

test('a new project cannot take an address that redirects elsewhere', () => {
  expect(() => store().write('project:hug-sangsationnel', project('hug-sangsationnel'), 0)).toThrow(expect.objectContaining({ code: 'taken' }));
});

test('no conflict when the draft and the repo already hold the same page', () => {
  const s = store();
  s.write('project:a', project('a', 'Pareil'), 0);
  write('content/projects/a.json', project('a', 'Pareil'));
  expect(s.conflicts()).toEqual([]);
});
