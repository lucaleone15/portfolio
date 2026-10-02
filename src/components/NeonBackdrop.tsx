/**
 * Background texture shared by the intro curtain and the hero:
 * - a fine dot grid (engineering paper), sharp in the middle and fading toward the edges,
 * - a soft accent glow top-right and a fainter one bottom-left,
 * - a still film grain on top.
 * The whole layer fades out at the bottom, so the hero melts into the next section.
 * No motion, no lines: it stays in the background. Decorative only.
 */
export function NeonBackdrop({ className = '', fadeBottom = true }: { className?: string; fadeBottom?: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${fadeBottom ? 'backdrop-fade-bottom' : ''} ${className}`}
      aria-hidden="true"
    >
      <div className="dot-grid absolute inset-0" />
      <div className="absolute -top-[35%] -right-[20%] w-[80vw] h-[80vw] max-w-[1100px] max-h-[1100px] rounded-full bg-[radial-gradient(closest-side,rgba(var(--accent-rgb),0.13),transparent)] dark:bg-[radial-gradient(closest-side,rgba(var(--accent-rgb),0.2),transparent)]" />
      <div className="absolute -bottom-[45%] -left-[25%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(var(--accent-rgb),0.06),transparent)] dark:bg-[radial-gradient(closest-side,rgba(var(--accent-rgb),0.1),transparent)]" />
      <div className="paper-grain absolute inset-0 opacity-[0.05] dark:opacity-[0.07] mix-blend-multiply dark:mix-blend-screen" />
    </div>
  );
}
