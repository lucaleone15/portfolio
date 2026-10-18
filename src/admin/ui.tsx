import type { ButtonHTMLAttributes, ReactNode } from 'react';

/** The LL monogram (public/favicon.svg) */
export function Monogram({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" className="shrink-0">
      <clipPath id="ll-tile">
        <rect width="64" height="64" rx="14" />
      </clipPath>
      <g clipPath="url(#ll-tile)">
        <path fill="#FF2E55" d="M0 0H64V64H0Z" />
        <path fill="#C50E36" d="M0 0H20L44 64H0Z" />
        <path fill="#FFFFFF" d="M10 10H19V45H33V54H10Z" />
        <path fill="#FFFFFF" d="M54 54H45V19H31V10H54Z" />
      </g>
    </svg>
  );
}

const VARIANTS = {
  primary:
    'bg-[var(--accent)] text-[var(--accent-contrast-text)] hover:opacity-90 shadow-[0_10px_30px_-12px_rgba(var(--accent-rgb),0.7)] disabled:opacity-40 disabled:shadow-none',
  ghost:
    'border border-[var(--color-border)] dark:border-white/10 text-neutral-900 dark:text-white hover:bg-[var(--color-surface)] dark:hover:bg-white/5 disabled:opacity-40',
  quiet: 'text-neutral-600 dark:text-[#A1A1AA] hover:text-neutral-900 dark:hover:text-white hover:bg-[var(--color-surface)] dark:hover:bg-white/5',
  danger: 'border border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast-text)]',
};

export function Button({ variant = 'ghost', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof VARIANTS }) {
  return (
    <button
      type="button"
      {...props}
      className={`font-syne inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${className}`}
    />
  );
}

export function Pill({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'accent' | 'warn' }) {
  const tones = {
    muted: 'bg-[var(--color-surface)] dark:bg-white/10 text-neutral-600 dark:text-[#A1A1AA]',
    accent: 'bg-[rgba(var(--accent-rgb),0.12)] text-[var(--accent)]',
    warn: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${tones[tone]}`}>{children}</span>;
}

export const fieldClass =
  'w-full min-h-11 rounded-xl border border-[var(--color-border)] dark:border-white/10 bg-white dark:bg-white/[0.04] px-3.5 py-2.5 text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[rgba(var(--accent-rgb),0.15)]';

export const labelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500 dark:text-[#A1A1AA]';
