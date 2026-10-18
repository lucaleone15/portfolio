import { useSyncExternalStore } from 'react';
import type { Content } from '../content/schema';
import { allPages, pageData, projectIdOf, type PageRef } from '../content/pages';
import { englishTodo } from '../content/txt';
import { ApiError } from './api';

/**
 * The draft as the admin sees it: edits apply at once on screen, and each page is saved to the
 * server a moment after the last keystroke (debounce). The server stays the reference (the same
 * draft on the phone and the computer); nothing here survives a reload except what was saved.
 *
 *   offline     the network failed: retried every few seconds, edits kept
 *   signedOut   the session expired (the API answers 404): edits kept, sent after signing in
 *   conflict    another device saved the page first: reload to see its version
 */

export type SaveState = 'saved' | 'saving' | 'offline' | 'signedOut' | 'conflict' | 'invalid';
type Todo = { ref: string; path: string; fr: string }[];

export interface ContentResponse {
  content: Content;
  revisions: Record<string, number>;
  changed: PageRef[];
  baseCommit: string;
  stale: Todo;
  missingEn: Todo;
}

export interface DraftApi {
  getContent(): Promise<ContentResponse>;
  savePage(ref: PageRef, data: unknown, revision: number, opts?: { keepalive?: boolean }): Promise<{ revision: number }>;
}

export interface DraftState {
  loaded: boolean;
  content: Content;
  revisions: Record<string, number>;
  changed: Set<PageRef>;
  stale: Todo;
  missingEn: Todo;
  saveState: SaveState;
  pending: Set<PageRef>;
}

const todoOf = (content: Content) => englishTodo(allPages(content).map((ref) => ({ ref, data: pageData(content, ref) })));

function withPage(content: Content, ref: PageRef, data: unknown): Content {
  if (ref === 'site') return { ...content, site: data as Content['site'] };
  if (ref === 'index') return { ...content, index: data as Content['index'] };
  return { ...content, projects: { ...content.projects, [projectIdOf(ref)!]: data as Content['projects'][string] } };
}

export function createDraftClient(api: DraftApi, opts: { debounceMs: number; retryMs: number }) {
  let state: DraftState = {
    loaded: false,
    content: undefined as unknown as Content,
    revisions: {},
    changed: new Set(),
    stale: [],
    missingEn: [],
    saveState: 'saved',
    pending: new Set(),
  };
  const listeners = new Set<() => void>();
  const timers = new Map<PageRef, ReturnType<typeof setTimeout>>();
  const inFlight = new Map<PageRef, Promise<void>>();
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  const set = (patch: Partial<DraftState>) => {
    state = { ...state, ...patch };
    listeners.forEach((fn) => fn());
  };

  const settle = () => {
    if (state.saveState === 'conflict' || state.saveState === 'signedOut' || state.saveState === 'invalid') return;
    set({ saveState: state.pending.size ? (state.saveState === 'offline' ? 'offline' : 'saving') : 'saved' });
  };

  async function save(ref: PageRef, keepalive = false): Promise<void> {
    if (!state.pending.has(ref)) return;
    if (inFlight.has(ref)) {
      await inFlight.get(ref);
      return save(ref, keepalive);
    }
    const data = pageData(state.content, ref);
    const run = (async () => {
      try {
        const { revision } = await api.savePage(ref, data, state.revisions[ref] ?? 0, keepalive ? { keepalive } : undefined);
        const pending = new Set(state.pending);
        // Edited again while saving: another save follows
        if (pageData(state.content, ref) === data) pending.delete(ref);
        const recovered = state.saveState === 'offline' || state.saveState === 'invalid';
        set({ revisions: { ...state.revisions, [ref]: revision }, pending, changed: new Set(state.changed).add(ref), saveState: recovered ? 'saving' : state.saveState });
        settle();
        if (pending.has(ref)) schedule(ref);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) set({ saveState: 'signedOut' });
        else if (err instanceof ApiError && err.status === 409) set({ saveState: 'conflict' });
        // A refused page (422…): kept, not retried until it is edited again
        else if (err instanceof ApiError && err.status >= 400 && err.status < 500) set({ saveState: 'invalid' });
        // Network failure, or the server restarting (5xx): retried
        else {
          set({ saveState: 'offline' });
          if (!retryTimer) {
            retryTimer = setTimeout(() => {
              retryTimer = null;
              void flush();
            }, opts.retryMs);
          }
        }
      }
    })();
    inFlight.set(ref, run);
    try {
      await run;
    } finally {
      inFlight.delete(ref);
    }
  }

  function schedule(ref: PageRef) {
    clearTimeout(timers.get(ref));
    timers.set(
      ref,
      setTimeout(() => {
        timers.delete(ref);
        if (state.saveState !== 'signedOut' && state.saveState !== 'conflict') void save(ref);
      }, opts.debounceMs),
    );
  }

  async function flush(keepalive = false) {
    for (const t of timers.values()) clearTimeout(t);
    timers.clear();
    await Promise.all([...state.pending].map((ref) => save(ref, keepalive)));
  }

  const onLeave = () => {
    if (!state.pending.size || state.saveState === 'signedOut' || state.saveState === 'conflict') return;
    for (const ref of state.pending) {
      // A save already on its way will bump the revision: the last edit goes out one ahead,
      // now (the page is closing, there is no waiting for the first one)
      if (inFlight.has(ref)) void api.savePage(ref, pageData(state.content, ref), (state.revisions[ref] ?? 0) + 1, { keepalive: true }).catch(() => {});
      else void save(ref, true);
    }
  };
  const onVisibility = () => document.visibilityState === 'hidden' && onLeave();
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
  }

  return {
    getState: () => state,
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    async load() {
      const r = await api.getContent();
      set({
        loaded: true,
        content: r.content,
        revisions: r.revisions,
        changed: new Set(r.changed),
        stale: r.stale,
        missingEn: r.missingEn,
        saveState: 'saved',
        pending: new Set(),
      });
    },
    /** Edits a copy of the page (mutate `draft` freely); saved shortly after */
    update<T = Record<string, any>>(ref: PageRef, updater: (draft: T) => void) {
      const draft = structuredClone(pageData(state.content, ref)) as T;
      updater(draft);
      this.set(ref, draft);
    },
    /** Replaces a page (also creates a project) */
    set(ref: PageRef, data: unknown) {
      const content = withPage(state.content, ref, data);
      set({ content, ...todoOf(content), pending: new Set(state.pending).add(ref), saveState: state.saveState === 'saved' ? 'saving' : state.saveState });
      schedule(ref);
    },
    flush: () => flush(),
    async resumeAfterLogin() {
      set({ saveState: state.pending.size ? 'saving' : 'saved' });
      await flush();
    },
    dispose() {
      for (const t of timers.values()) clearTimeout(t);
      if (retryTimer) clearTimeout(retryTimer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('pagehide', onLeave);
        document.removeEventListener('visibilitychange', onVisibility);
      }
    },
  };
}

export type DraftClient = ReturnType<typeof createDraftClient>;

/** Sign out only once the pending edits are on the server */
export async function signOutAfterSaving(client: Pick<DraftClient, 'flush'>, logout: () => Promise<void>) {
  await client.flush().catch(() => {});
  await logout();
}

export function useDraft(client: DraftClient): DraftState {
  return useSyncExternalStore(client.subscribe, client.getState);
}
