import { useEffect, useState } from 'react';
import { adminRoot } from './api';

/** The admin's own routes, below ADMIN_PATH: "/", "/projets/<id>", "/site/<tab>" */
export function currentAdminPath(): string {
  return window.location.pathname.slice(adminRoot().length) || '/';
}

export function adminNavigate(to: string) {
  window.history.pushState(null, '', adminRoot() + to);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

export function useAdminPath(): { path: string; query: URLSearchParams } {
  const read = () => ({ path: currentAdminPath(), query: new URLSearchParams(window.location.search) });
  const [loc, setLoc] = useState(read);
  useEffect(() => {
    const onPop = () => setLoc(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return loc;
}
