import type { MouseEvent, ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

/** Words rise one by one out of their own mask when the heading enters the viewport. */
export function RevealWords({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-flex overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
          <motion.span
            initial={{ y: '110%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: delay + i * 0.06, ease: [0.23, 1, 0.32, 1] }}
            className={`inline-block ${className}`}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </>
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
    <div className="relative">
      {multiline ? (
        <textarea
          {...common}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} resize-none min-h-[7.5rem] [field-sizing:content]`}
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
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  external?: boolean;
  ariaLabel?: string;
  trailing?: ReactNode;
}) {
  return (
    <li className="border-b border-white/25">
      <a
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group relative flex items-center gap-4 px-3 sm:px-4 py-5 sm:py-6 overflow-hidden text-white active:scale-[0.99] transition-transform"
      >
        <span
          className="absolute inset-0 bg-white [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)] transition-[clip-path] duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]"
          aria-hidden="true"
        />
        <span className="relative w-11 h-11 shrink-0 rounded-full border border-white/35 flex items-center justify-center transition-colors duration-300 group-hover:border-[var(--accent-light)]/30 group-hover:text-[var(--accent-light)]">
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
          {trailing ?? <ArrowUpRight className="w-5 h-5" />}
        </span>
      </a>
    </li>
  );
}

/** Oversized signature closing the page: the very last element, fully visible, flush with the bottom. */
export function Signature() {
  return (
    <div className="select-none pb-3 sm:pb-5" aria-hidden="true">
      <motion.p
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
        className="font-serif whitespace-nowrap font-black leading-[0.95] tracking-[-0.05em] text-[min(18vw,15.5rem)] bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent"
      >
        Luca Leone<span className="text-[#0A0A0C]">.</span>
      </motion.p>
    </div>
  );
}
