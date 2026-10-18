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
