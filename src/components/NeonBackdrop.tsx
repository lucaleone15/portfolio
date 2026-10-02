/**
 * Background texture shared by the intro curtain and the hero: a soft accent gradient
 * (one glow top-right, a fainter one bottom-left) under a fine, still paper/film grain.
 * Stays in the background on purpose: no lines, no motion. Decorative only.
 */
export function NeonBackdrop({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute -top-[35%] -right-[20%] w-[80vw] h-[80vw] max-w-[1100px] max-h-[1100px] rounded-full bg-[radial-gradient(closest-side,rgba(var(--accent-rgb),0.13),transparent)] dark:bg-[radial-gradient(closest-side,rgba(var(--accent-rgb),0.2),transparent)]" />
      <div className="absolute -bottom-[45%] -left-[25%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(var(--accent-rgb),0.06),transparent)] dark:bg-[radial-gradient(closest-side,rgba(var(--accent-rgb),0.1),transparent)]" />
      <div className="paper-grain absolute inset-0 opacity-[0.05] dark:opacity-[0.07] mix-blend-multiply dark:mix-blend-screen" />
    </div>
  );
}
