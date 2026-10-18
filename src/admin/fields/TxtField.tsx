import { useId } from 'react';
import type { Language } from '../../types';
import { isMissingEn, isStale, setEn, setFr, type Txt } from '../../content/txt';
import { fieldClass, labelClass, Pill } from '../ui';

/** Guidance under some fields: SEO lengths (Google's display limits), the hero's one-line words */
export function hintFor(path: string, text: string): { text: string; warn: boolean } | null {
  const n = text.length;
  if (/(^|\.)seo\.title$/.test(path) || /^seo\.[\w-]+\.title$/.test(path)) return { text: `${n} / 60`, warn: n > 60 };
  if (/(^|\.)seo\.description$/.test(path) || /^seo\.[\w-]+\.description$/.test(path)) return { text: `${n} / 120–160`, warn: n > 0 && (n < 120 || n > 160) };
  if (/^hero\.outcomes\.\d+$/.test(path) && n > 23) return { text: 'Trop long pour tenir sur une ligne : 23 caractères au plus.', warn: true };
  return null;
}

/**
 * A text in both languages. In French it edits the French; in English it shows the French above
 * (to translate from) and flags English that is missing or older than the French.
 */
export function TxtField({ value, onChange, lang, path, label, bare, long: multiline }: { value: Txt; onChange: (v: Txt) => void; lang: Language; path: string; label?: string; bare?: boolean; long?: boolean }) {
  const id = useId();
  const t = value ?? { fr: '', en: '' };
  const current = lang === 'fr' ? t.fr : t.en;
  const long = multiline || t.fr.length > 90 || /\n/.test(t.fr);
  const hint = hintFor(path, current);
  const update = (text: string) => onChange(lang === 'fr' ? setFr(t, text) : setEn(t, text));

  return (
    <div data-path={path}>
      <div className="mb-1.5 flex items-center gap-2">
        {!bare || label ? (
          <label className={`${labelClass} mb-0`} htmlFor={id}>
            {label}
          </label>
        ) : null}
        {lang === 'en' && isStale(t) && <Pill tone="warn">à revoir</Pill>}
        {lang === 'en' && isMissingEn(t) && t.fr.trim() !== '' && <Pill tone="accent">manquant</Pill>}
      </div>
      {lang === 'en' && t.fr && <p className="mb-1.5 whitespace-pre-line text-xs leading-relaxed text-neutral-500 dark:text-[#A1A1AA]">{t.fr}</p>}
      {long ? (
        <textarea id={id} rows={Math.min(10, Math.max(3, Math.ceil(current.length / 60)))} className={fieldClass} value={current} onChange={(e) => update(e.target.value)} />
      ) : (
        <input id={id} className={fieldClass} value={current} onChange={(e) => update(e.target.value)} />
      )}
      {hint && <p className={`mt-1 text-xs font-semibold ${hint.warn ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{hint.text}</p>}
    </div>
  );
}
