import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ContentSchema, PROJECT_ID_RE, type Content, type ProjectsIndex } from '../../src/content/schema';
import { allPages, pageFile, pageSchema, projectIdOf, projectRef, type PageRef } from '../../src/content/pages';

/**
 * The admin's draft (DATA_DIR/admin/draft/): a full copy of content/ that Luca edits, plus
 * base.json — the repo commit and each file's hash when the draft started, and a revision per
 * page. Nothing reaches content/ (and git) until Publish calls applyTo().
 *
 * Revisions: a save names the revision it was made from; if another device saved the page
 * since, it is refused ('stale') instead of silently overwriting.
 * Conflicts: a page changed in the draft AND in the repo since the draft started.
 */

export class DraftError extends Error {
  constructor(
    public code: 'invalid' | 'stale' | 'taken' | 'invalid-id' | 'missing',
    public issues?: unknown,
  ) {
    super(code);
  }
}

interface Base {
  commit: string;
  /** Repo file (relative path) → sha256 when the draft started (or was last reconciled) */
  hashes: Record<string, string>;
  revisions: Record<string, number>;
}

const sha = (text: string) => crypto.createHash('sha256').update(text).digest('hex');
const serialize = (data: unknown) => JSON.stringify(data, null, 2) + '\n';

function readTree(root: string): Record<string, string> {
  const files: Record<string, string> = {};
  const read = (rel: string) => {
    try {
      files[rel] = fs.readFileSync(path.join(root, rel), 'utf8');
    } catch {
      // absent
    }
  };
  read('content/site.json');
  read('content/projects.json');
  let names: string[] = [];
  try {
    names = fs.readdirSync(path.join(root, 'content', 'projects'));
  } catch {
    // no projects folder
  }
  for (const name of names) if (name.endsWith('.json')) read(`content/projects/${name}`);
  return files;
}

function treeToContent(files: Record<string, string>): Content {
  const projects: Record<string, unknown> = {};
  for (const [rel, text] of Object.entries(files)) {
    const m = /^content\/projects\/(.+)\.json$/.exec(rel);
    if (m) projects[m[1]] = JSON.parse(text);
  }
  return ContentSchema.parse({
    site: JSON.parse(files['content/site.json']),
    index: JSON.parse(files['content/projects.json']),
    projects,
  });
}

function writeAtomic(file: string, text: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}

const refOfFile = (rel: string): PageRef =>
  rel === 'content/site.json' ? 'site' : rel === 'content/projects.json' ? 'index' : projectRef(rel.slice('content/projects/'.length, -'.json'.length));

export function createDraftStore(deps: { repoRoot: string; dir: string }) {
  const baseFile = path.join(deps.dir, 'base.json');
  const exists = () => fs.existsSync(baseFile);
  const loadBase = (): Base => JSON.parse(fs.readFileSync(baseFile, 'utf8'));
  const saveBase = (b: Base) => writeAtomic(baseFile, JSON.stringify(b, null, 2));
  const repoTree = () => readTree(deps.repoRoot);
  const draftTree = () => readTree(deps.dir);

  const headCommit = () => {
    try {
      return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: deps.repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      return '';
    }
  };

  /** Starts a draft as a copy of the repo content */
  const ensure = () => {
    if (exists()) return;
    const tree = repoTree();
    for (const [rel, text] of Object.entries(tree)) writeAtomic(path.join(deps.dir, rel), text);
    saveBase({ commit: headCommit(), hashes: Object.fromEntries(Object.entries(tree).map(([rel, text]) => [rel, sha(text)])), revisions: {} });
  };

  const changedFiles = (): string[] => {
    if (!exists()) return [];
    const base = loadBase();
    const draft = draftTree();
    const files = new Set([...Object.keys(base.hashes), ...Object.keys(draft)]);
    return [...files].filter((rel) => (draft[rel] === undefined ? undefined : sha(draft[rel])) !== base.hashes[rel]).sort();
  };

  const writePage = (ref: PageRef, data: unknown) => writeAtomic(path.join(deps.dir, pageFile(ref)), serialize(data));
  const readIndex = (): ProjectsIndex => JSON.parse(fs.readFileSync(path.join(deps.dir, 'content/projects.json'), 'utf8'));
  const bump = (base: Base, ...refs: PageRef[]) => {
    for (const ref of refs) base.revisions[ref] = (base.revisions[ref] ?? 0) + 1;
  };

  return {
    read() {
      const tree = exists() ? draftTree() : repoTree();
      const content = treeToContent(tree);
      const revisions: Record<string, number> = {};
      const base = exists() ? loadBase() : null;
      for (const ref of allPages(content)) revisions[ref] = base?.revisions[ref] ?? 0;
      return { content, revisions, changed: changedFiles().map(refOfFile), baseCommit: base?.commit ?? headCommit() };
    },

    write(ref: PageRef, data: unknown, revision: number): { revision: number } {
      const parsed = pageSchema(ref).safeParse(data);
      if (!parsed.success) throw new DraftError('invalid', parsed.error.issues);
      const id = projectIdOf(ref);
      if (id !== null && (parsed.data as { id: string }).id !== id) throw new DraftError('invalid', [{ path: ['id'], message: 'id does not match the page' }]);
      ensure();
      // A new project can't take an old address that redirects to another one
      if (id !== null && !fs.existsSync(path.join(deps.dir, pageFile(ref))) && Object.hasOwn(readIndex().redirects, id)) throw new DraftError('taken');
      const base = loadBase();
      if ((base.revisions[ref] ?? 0) !== revision) throw new DraftError('stale');
      writePage(ref, parsed.data);
      bump(base, ref);
      // A new project joins the end of the list
      if (id !== null) {
        const index = readIndex();
        if (!index.order.includes(id)) {
          writePage('index', { ...index, order: [...index.order, id] });
          bump(base, 'index');
        }
      }
      saveBase(base);
      return { revision: base.revisions[ref] };
    },

    remove(id: string) {
      ensure();
      const file = path.join(deps.dir, pageFile(projectRef(id)));
      if (!fs.existsSync(file)) throw new DraftError('missing');
      fs.rmSync(file);
      const index = readIndex();
      writePage('index', { ...index, order: index.order.filter((x) => x !== id), hidden: index.hidden.filter((x) => x !== id) });
      const base = loadBase();
      // A project created again at this address starts over from revision 0
      delete base.revisions[projectRef(id)];
      bump(base, 'index');
      saveBase(base);
    },

    rename(from: string, to: string) {
      if (!PROJECT_ID_RE.test(to)) throw new DraftError('invalid-id');
      ensure();
      const index = readIndex();
      const fromFile = path.join(deps.dir, pageFile(projectRef(from)));
      if (!fs.existsSync(fromFile)) throw new DraftError('missing');
      // Back to an address that redirects to this very project is fine (undoing a rename)
      const backToOld = index.redirects[to] === from;
      if (fs.existsSync(path.join(deps.dir, pageFile(projectRef(to)))) || (Object.hasOwn(index.redirects, to) && !backToOld)) throw new DraftError('taken');
      const project = JSON.parse(fs.readFileSync(fromFile, 'utf8'));
      writePage(projectRef(to), { ...project, id: to });
      fs.rmSync(fromFile);
      // Old addresses keep working, and never through a chain of redirects
      const redirects = Object.fromEntries(Object.entries(index.redirects).map(([k, v]) => [k, v === from ? to : v]));
      delete redirects[to];
      // Only a published address needs to keep working
      if (repoTree()[pageFile(projectRef(from))] !== undefined) redirects[from] = to;
      const swap = (ids: string[]) => ids.map((x) => (x === from ? to : x));
      writePage('index', { order: swap(index.order), hidden: swap(index.hidden), redirects });
      const base = loadBase();
      delete base.revisions[projectRef(from)];
      bump(base, projectRef(to), 'index');
      saveBase(base);
    },

    conflicts(): PageRef[] {
      if (!exists()) return [];
      const base = loadBase();
      const repo = repoTree();
      const draft = draftTree();
      return changedFiles()
        .filter((rel) => (repo[rel] === undefined ? undefined : sha(repo[rel])) !== base.hashes[rel])
        // Both sides ended up the same (e.g. a publish cut short after its push): nothing to choose
        .filter((rel) => draft[rel] !== repo[rel])
        .map(refOfFile);
    },

    resolve(ref: PageRef, keep: 'draft' | 'repo') {
      ensure();
      const rel = pageFile(ref);
      const repo = repoTree();
      const base = loadBase();
      if (keep === 'repo') {
        if (repo[rel] === undefined) fs.rmSync(path.join(deps.dir, rel), { force: true });
        else writeAtomic(path.join(deps.dir, rel), repo[rel]);
        bump(base, ref);
      }
      if (repo[rel] === undefined) delete base.hashes[rel];
      else base.hashes[rel] = sha(repo[rel]);
      saveBase(base);
    },

    /** Pages the draft doesn't change follow the repo (someone pushed from elsewhere) */
    refreshUntouched() {
      if (!exists()) return;
      const changed = new Set(changedFiles());
      const repo = repoTree();
      const draft = draftTree();
      const base = loadBase();
      for (const rel of new Set([...Object.keys(repo), ...Object.keys(draft)])) {
        if (changed.has(rel)) continue;
        if (repo[rel] === undefined) {
          fs.rmSync(path.join(deps.dir, rel), { force: true });
          delete base.hashes[rel];
        } else {
          if (draft[rel] !== repo[rel]) writeAtomic(path.join(deps.dir, rel), repo[rel]);
          base.hashes[rel] = sha(repo[rel]);
        }
      }
      saveBase(base);
    },

    /** Writes the changed pages into the repo's content/, and deletes removed projects */
    applyTo(root: string) {
      const draft = draftTree();
      for (const rel of changedFiles()) {
        if (draft[rel] === undefined) fs.rmSync(path.join(root, rel), { force: true });
        else writeAtomic(path.join(root, rel), draft[rel]);
      }
    },

    changedRefs: (): PageRef[] => changedFiles().map(refOfFile),

    /**
     * After a publish: the repo now holds what was published, so it becomes the draft's base.
     * Pages saved in the meantime (during the build) still differ, and stay in the draft.
     */
    settle() {
      if (!exists()) return;
      const base = loadBase();
      const repo = repoTree();
      base.commit = headCommit();
      base.hashes = Object.fromEntries(Object.entries(repo).map(([rel, text]) => [rel, sha(text)]));
      saveBase(base);
      if (!changedFiles().length) this.discard();
    },

    discard() {
      fs.rmSync(deps.dir, { recursive: true, force: true });
    },
  };
}

export type DraftStore = ReturnType<typeof createDraftStore>;
