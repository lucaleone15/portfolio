import type { CSSProperties } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';

/**
 * Every icon of the site (Hugeicons, stroke rounded), drawn with one stroke weight so they
 * all read as one set, LinkedIn's logo included. Decorative by default: the text next to
 * the icon, or the control's aria-label, carries the meaning.
 */
export function Icon({ icon, className = '', style }: { icon: IconSvgElement; className?: string; style?: CSSProperties }) {
  return <HugeiconsIcon icon={icon} strokeWidth={1.75} className={className} style={style} aria-hidden="true" focusable="false" />;
}
