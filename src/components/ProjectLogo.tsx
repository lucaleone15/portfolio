import type { CSSProperties } from 'react';
import { Project } from '../types';

/**
 * A project's logo in place of its name. The theme is a class on <html>, so both versions
 * are in the page and CSS shows one. The name stays in the DOM (visually hidden) for search
 * engines and screen readers. `scale` multiplies the per-logo card height (`logo.display`);
 * phones get 85 % of it. Without a logo, the name is written out.
 */
export function ProjectLogo({ project, scale = 1, eager = false }: { project: Project; scale?: number; eager?: boolean }) {
  const logo = project.logo;
  if (!logo) return <>{project.name}</>;
  const style = { '--logo-h': `${Math.round(logo.display * scale)}px` } as CSSProperties;
  const common = {
    width: logo.width,
    height: logo.height,
    alt: '',
    'aria-hidden': true,
    loading: eager ? undefined : ('lazy' as const),
    decoding: 'async' as const,
    style,
  };
  return (
    <>
      <span className="sr-only">{project.name}</span>
      <img src={logo.src} {...common} className="block dark:hidden w-auto max-w-full h-[calc(var(--logo-h)*0.85)] sm:h-(--logo-h)" />
      <img src={logo.srcDark} {...common} className="hidden dark:block w-auto max-w-full h-[calc(var(--logo-h)*0.85)] sm:h-(--logo-h)" />
    </>
  );
}
