import { useRef, type MouseEvent, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { Icon } from './Icon';

/**
 * Words rise one by one out of their own mask. The trigger is NOT on the words: a word
 * hidden below its mask has no visible area, so it would never count as "in view". The
 * parent heading (see RevealHeading) owns the viewport trigger; words follow via variants.
 */
const wordVariants = {
  hidden: { y: '110%' },
  shown: (delay: number) => ({ y: '0%', transition: { duration: 0.8, delay, ease: [0.23, 1, 0.32, 1] as const } }),
};

export function RevealWords({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-flex overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <motion.span variants={wordVariants} custom={delay + i * 0.06} className={`inline-block ${className}`}>
            {word}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </>
  );
}

/**
 * Heading that reveals its RevealWords children once it has been seen.
 * The seen state lives here (not in a one-shot whileInView gesture): words that mount later —
 * e.g. after switching language — inherit the "shown" target and rise in too, instead of
 * staying hidden forever. Any visible part counts (amount: "some"), which matters on phones
 * where a tall heading rarely shows 40% of itself at once.
 */
export function RevealHeading({ className = '', children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const seen = useInView(ref, { once: true, amount: 'some', margin: '0px 0px -10% 0px' });
  return (
    <motion.h2 ref={ref} initial="hidden" animate={seen ? 'shown' : 'hidden'} className={className}>
      {children}
    </motion.h2>
  );
}

/**
 * Text field whose label sits inside the field and floats up when focused or filled; an
 * accent underline draws from the left on focus. Errors appear under the field.
 */
export function FloatingField({
  id,
  name,
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  required,
  multiline,
  error,
  onBlur,
  className = '',
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  multiline?: boolean;
  error?: string;
  onBlur?: (el: HTMLInputElement | HTMLTextAreaElement) => void;
  className?: string;
}) {
  // Styled for the accent contact sheet (white on accent); autofill keeps the sheet's colours
  const fieldClass = `peer w-full bg-transparent border-b pt-6 pb-2.5 text-base sm:text-lg text-white caret-white outline-none placeholder-transparent transition-colors [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_99999s] ${
    error ? 'border-white' : 'border-white/35'
  }`;
  const common = {
    id,
    name,
    value,
    required,
    autoComplete,
    placeholder: ' ', // keeps :placeholder-shown usable to know if the field is empty
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
    onBlur: (e: { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => onBlur?.(e.currentTarget),
  };

  return (
    <div className={`relative ${className}`}>
      {multiline ? (
        <textarea
          {...common}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} block resize-none min-h-[4.75rem] [field-sizing:content]`}
        />
      ) : (
        <input {...common} type={type} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-6 origin-left text-base sm:text-lg text-white/70 transition-transform duration-200 ease-out peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-white peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75"
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <span
        className="pointer-events-none absolute left-0 bottom-0 h-[2px] w-full origin-left scale-x-0 bg-white transition-transform duration-300 ease-out peer-focus:scale-x-100"
        aria-hidden="true"
      />
      {error && (
        <p id={`${id}-error`} className="absolute -bottom-6 left-0 text-xs font-semibold text-white">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Big direct-contact row (icon, small label, large value, trailing icon), on the accent sheet.
 * On hover a white band sweeps across from the left and the content turns accent.
 */
export function ContactRow({
  icon,
  label,
  value,
  href,
  onClick,
  external,
  ariaLabel,
  trailing,
  className = '',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  external?: boolean;
  ariaLabel?: string;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <li className={`flex border-b border-white/25 ${className}`}>
      <a
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group relative flex flex-1 items-center gap-4 px-3 sm:px-4 py-5 sm:py-6 overflow-hidden text-white active:scale-[0.99] transition-transform"
      >
        <span
          className="absolute inset-0 bg-white [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)] transition-[clip-path] duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]"
          aria-hidden="true"
        />
        <span className="relative w-11 h-11 shrink-0 rounded-full bg-white/15 flex items-center justify-center transition-colors duration-300 group-hover:bg-[var(--accent-light)]/10 group-hover:text-[var(--accent-light)]">
          {icon}
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block text-xs text-white/70 transition-colors duration-300 group-hover:text-[var(--accent-light)]/80">
            {label}
          </span>
          <span className="block text-lg sm:text-2xl font-bold tracking-tight truncate transition-colors duration-300 group-hover:text-[var(--accent-light)]">
            {value}
          </span>
        </span>
        <span className="relative shrink-0 transition-[color,transform] duration-300 group-hover:text-[var(--accent-light)] group-hover:translate-x-1" aria-hidden="true">
          {trailing ?? <Icon icon={ArrowUpRight01Icon} className="w-5 h-5" />}
        </span>
      </a>
    </li>
  );
}

/**
 * Oversized signature closing the page: the very last element, fully visible, flush with the
 * page bottom. The gradient is clipped to the text, and a background only covers the element's
 * box: with such tight leading the letters overflow the line box by ~0.15em, so the paragraph
 * carries em-based vertical padding to keep every glyph painted (it looked cut otherwise).
 * Width: the word is 5.4× its font size (measured), so the size is derived from the space
 * available (viewport minus side padding, capped by the 1200px container) ÷ 5.5.
 */
export function Signature() {
  return (
    <div className="select-none text-[min(calc((100vw-3rem)/5.5),13.6rem)] sm:text-[min(calc((100vw-5rem)/5.5),13.6rem)] pb-[0.04em]" aria-hidden="true">
      <motion.p
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
        className="inline-block font-serif whitespace-nowrap font-black leading-[0.95] py-[0.14em] tracking-[-0.05em] bg-gradient-to-b from-white via-white/70 to-white/10 bg-clip-text text-transparent"
      >
        Luca Leone<span className="text-[#0A0A0C]">.</span>
      </motion.p>
    </div>
  );
}
