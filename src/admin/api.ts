import type { PageRef } from '../content/pages';
import type { ContentResponse } from './store';

/** Calls to the admin API (server/admin/), relative to the admin's <base href="ADMIN_PATH/"> */

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API ${status}`);
  }
}

export const apiUrl = (path: string) => new URL(`api/${path.replace(/^\//, '')}`, document.baseURI).toString();

/** The admin's root path, e.g. "/atelier-7k2q9" */
export const adminRoot = () => new URL(document.baseURI).pathname.replace(/\/$/, '');

export async function api<T = void>(method: string, path: string, body?: unknown, opts: { keepalive?: boolean; raw?: BodyInit; type?: string } = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method,
    credentials: 'same-origin',
    keepalive: opts.keepalive,
    headers: { 'X-Admin': '1', ...(opts.raw ? { 'Content-Type': opts.type ?? 'application/octet-stream' } : body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: opts.raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  let data: unknown = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text;
  }
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export const login = (password: string, code: string) => api('POST', 'login', { password, code });
export const logout = () => api('POST', 'logout');
export async function me(): Promise<boolean> {
  try {
    await api('GET', 'me');
    return true;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return false;
    throw err;
  }
}


export const getContent = () => api<ContentResponse & { staged: string[] }>('GET', 'content');
export const savePage = (ref: PageRef, data: unknown, revision: number, opts: { keepalive?: boolean } = {}) =>
  api<{ revision: number }>('PUT', `content/${ref}`, { data, revision }, opts);
export const deleteProject = (id: string) => api('DELETE', `content/project:${id}`);
export const renameProject = (from: string, to: string) => api('POST', `content/project:${from}/rename`, { to });
export const discardDraft = () => api('POST', 'draft/discard');
export const upload = (file: Blob & { name?: string }, kind: 'image' | 'video' | 'pdf', folder: string) =>
  api<{ src: string; width?: number; height?: number }>(
    'POST',
    `uploads?${new URLSearchParams({ kind, folder, filename: file.name ?? 'fichier' })}`,
    undefined,
    { raw: file, type: file.type || 'application/octet-stream' },
  );

/** A file of the site as the admin shows it: uploads not published yet come from the staging area */
export const previewSrc = (src: string, staged: Set<string>) => (staged.has(src) ? new URL(`staged${src}`, document.baseURI).toString() : src);

export interface PublishStatus {
  state: 'idle' | 'running' | 'done' | 'failed';
  step?: 'pull' | 'check' | 'write' | 'build' | 'push' | 'swap';
  error?: { code: string; pages?: PageRef[]; files?: string[]; log?: string };
  published?: PageRef[];
}
export interface PublishSummary {
  status: PublishStatus;
  changed: { ref: PageRef; label: string }[];
  stale: { ref: string; path: string; fr: string }[];
  missingEn: { ref: string; path: string; fr: string }[];
}
export const getPublish = () => api<PublishSummary>('GET', 'publish');
export const startPublish = () => api<PublishStatus>('POST', 'publish');
export const resolveConflict = (ref: PageRef, keep: 'draft' | 'repo') => api('POST', 'publish/resolve', { ref, keep });
