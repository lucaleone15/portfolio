import { lazy, Suspense, useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * ⌘K / Ctrl+K command palette: jump to a section or a project, copy the email, switch
 * theme or language, open LinkedIn. This shell only listens for the shortcut; the dialog
 * (cmdk) is downloaded the first time it opens. Keyboard-opened, so no open animation.
 */

export const OPEN_COMMAND_PALETTE = 'open-command-palette';

const CommandPaletteDialog = lazy(() => import('./CommandPaletteDialog'));

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setRequested(true);
        setOpen((o) => !o);
      }
    };
    const onOpen = () => {
      setRequested(true);
      setOpen(true);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_COMMAND_PALETTE, onOpen);
    // Warm the chunk once the page is idle, so the first ⌘K opens instantly
    const prefetch = () => void import('./CommandPaletteDialog');
    const hasIdle = typeof window.requestIdleCallback === 'function'; // missing in older Safari
    const idleId = hasIdle ? window.requestIdleCallback(prefetch, { timeout: 4000 }) : window.setTimeout(prefetch, 3000);
    return () => {
      if (hasIdle) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_COMMAND_PALETTE, onOpen);
    };
  }, []);

  if (!requested) return null;
  return (
    <Suspense fallback={null}>
      <CommandPaletteDialog open={open} onOpenChange={setOpen} />
    </Suspense>
  );
}

/** Small "⌘K" hint button (shows Ctrl K outside Apple platforms). */
export function CommandPaletteHint({ className = '' }: { className?: string }) {
  const [isApple, setIsApple] = useState(true);
  const { lang } = useLanguage();
  useEffect(() => {
    setIsApple(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent));
  }, []);
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE))}
      aria-label={lang === 'fr' ? 'Ouvrir la barre de commande' : 'Open command menu'}
      title={lang === 'fr' ? 'Barre de commande' : 'Command menu'}
      className={`font-syne h-7 px-2 inline-flex items-center gap-0.5 rounded-full text-[11px] font-bold text-neutral-600 hover:text-black dark:text-[#A1A1AA] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition cursor-pointer active:scale-[0.97] ${className}`}
    >
      {isApple ? '⌘' : 'Ctrl'} K
    </button>
  );
}

