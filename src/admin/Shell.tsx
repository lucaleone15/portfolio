import type { ReactNode } from 'react';
import { Button, Monogram, Pill } from './ui';
import { adminNavigate } from './nav';
import { THEME_LABEL, useTheme, type ThemeChoice } from './theme';

function ThemeIcon({ theme }: { theme: ThemeChoice }) {
  if (theme === 'light')
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  if (theme === 'dark')
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

/** Switches the atelier's theme: system → light → dark */
function ThemeButton({ withLabel = false }: { withLabel?: boolean }) {
  const [theme, next] = useTheme();
  return (
    <button
      type="button"
      onClick={next}
      aria-label={`${THEME_LABEL[theme]} (changer)`}
      title={THEME_LABEL[theme]}
      className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-neutral-600 hover:bg-[var(--color-surface)] dark:text-[#A1A1AA] dark:hover:bg-white/5"
    >
      <ThemeIcon theme={theme} />
      {withLabel && THEME_LABEL[theme]}
    </button>
  );
}

const NAV = [
  { id: 'contenu', label: 'Contenu', to: '/', ready: true },
  { id: 'stats', label: 'Statistiques', to: '', ready: false },
  { id: 'messages', label: 'Messages', to: '', ready: false },
];

/**
 * The admin frame: side navigation on large screens, a bar at the bottom on phones; the top bar
 * holds the page's own actions and the Publish button.
 */
export function Shell({
  children,
  status,
  publish,
  onSignOut,
}: {
  children: ReactNode;
  /** Save state, shown next to Publish */
  status?: ReactNode;
  publish?: ReactNode;
  onSignOut: () => void;
}) {
  return (
    <div className="min-h-dvh bg-[var(--color-paper)] text-neutral-900 dark:bg-[#0A0A0C] dark:text-white md:flex">
      <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-[var(--color-border)] md:dark:border-white/10 md:px-4 md:py-6 md:sticky md:top-0 md:h-dvh">
        <a href="./" onClick={(e) => (e.preventDefault(), adminNavigate('/'))} className="mb-8 flex items-center gap-2.5 px-2">
          <Monogram size={30} />
          <span className="leading-tight">
            <span className="block font-syne text-sm font-extrabold">Luca Leone</span>
            <span className="block text-xs text-neutral-500 dark:text-[#A1A1AA]">Atelier</span>
          </span>
        </a>
        <nav className="flex flex-col gap-1" aria-label="Sections">
          {NAV.map((item) =>
            item.ready ? (
              <a
                key={item.id}
                href="./"
                onClick={(e) => (e.preventDefault(), adminNavigate(item.to))}
                aria-current="page"
                className="flex min-h-11 items-center rounded-xl bg-[rgba(var(--accent-rgb),0.1)] px-3 font-syne text-sm font-bold text-[var(--accent)]"
              >
                {item.label}
              </a>
            ) : (
              <span key={item.id} aria-disabled="true" className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-semibold text-neutral-400 dark:text-white/30">
                {item.label} <Pill>bientôt</Pill>
              </span>
            ),
          )}
        </nav>
        <div className="mt-auto space-y-1">
          <ThemeButton withLabel />
          <Button variant="quiet" onClick={onSignOut} className="w-full justify-start">
            Se déconnecter
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-paper)]/85 px-4 backdrop-blur-md dark:border-white/10 dark:bg-[#0A0A0C]/85 md:px-8">
          <a href="./" onClick={(e) => (e.preventDefault(), adminNavigate('/'))} className="md:hidden" aria-label="Accueil de l’atelier">
            <Monogram size={28} />
          </a>
          <div className="ml-auto flex items-center gap-3">
            <span className="md:hidden">
              <ThemeButton />
            </span>
            {status}
            {publish}
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>

      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[var(--color-border)] bg-[var(--color-paper)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-white/10 dark:bg-[#0A0A0C]/95 md:hidden"
      >
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={!item.ready}
            onClick={() => item.ready && adminNavigate(item.to)}
            className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-bold ${item.ready ? 'text-[var(--accent)]' : 'text-neutral-400 dark:text-white/30'}`}
          >
            {item.label}
            {!item.ready && <span className="text-[9px] font-semibold uppercase tracking-wider">bientôt</span>}
          </button>
        ))}
        <button type="button" onClick={onSignOut} className="flex min-h-16 flex-1 items-center justify-center text-xs font-bold text-neutral-500 dark:text-[#A1A1AA]">
          Quitter
        </button>
      </nav>
    </div>
  );
}
