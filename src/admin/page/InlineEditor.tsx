import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Language } from '../../types';
import { setEn, setFr, type Txt } from '../../content/txt';

/**
 * The in-place text editor of Page mode: a textarea laid exactly over the clicked element, in
 * that element's own typography, following it when the page scrolls. Each keystroke goes to the
 * draft (the page underneath re-renders); Escape or a click elsewhere closes it.
 */
export function InlineEditor({ target: clicked, path, value, lang, onChange, onClose }: { target: HTMLElement; path: string; value: Txt; lang: Language; onChange: (v: Txt) => void; onClose: () => void }) {
  // React may replace the element while its text changes (lists keyed by that text): follow the
  // element now showing this path
  const target = clicked.isConnected ? clicked : (document.querySelector<HTMLElement>(`[data-edit="${path}"]`) ?? clicked);
  const box = useRef<HTMLTextAreaElement>(null);
  const [rect, setRect] = useState(() => target.getBoundingClientRect());
  const style = useRef(window.getComputedStyle(target));
  const text = lang === 'fr' ? value.fr : value.en;

  useLayoutEffect(() => {
    const update = () => setRect(target.getBoundingClientRect());
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [target, text]);

  useEffect(() => {
    box.current?.focus();
    const len = box.current?.value.length ?? 0;
    box.current?.setSelectionRange(len, len);
  }, []);

  // Grows with its text, never smaller than the element it covers
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(rect.height, el.scrollHeight)}px`;
  }, [text, rect.height]);

  const s = style.current;
  // The first opaque background behind the element (a dark chip, a coloured band, the page)
  const background = (() => {
    for (let el: HTMLElement | null = target; el; el = el.parentElement) {
      const bg = window.getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) return bg;
    }
    return 'var(--color-paper)';
  })();

  return (
    <textarea
      ref={box}
      aria-label="Modifier le texte"
      rows={1}
      value={text}
      onChange={(e) => onChange(lang === 'fr' ? setFr(value, e.target.value) : setEn(value, e.target.value))}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      onBlur={onClose}
      style={{
        position: 'fixed',
        top: rect.top - 6,
        left: rect.left - 8,
        width: rect.width + 16,
        zIndex: 60,
        padding: '6px 8px',
        margin: 0,
        resize: 'none',
        overflow: 'hidden',
        // At least 16 px: smaller text makes iOS zoom in on focus
        fontSize: `max(16px, ${s.fontSize})`,
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        fontStyle: s.fontStyle,
        lineHeight: s.lineHeight,
        letterSpacing: s.letterSpacing,
        textTransform: s.textTransform as never,
        textAlign: s.textAlign as never,
        color: s.color,
        background,
        border: 'none',
        borderRadius: 10,
        outline: '2px solid var(--accent)',
        boxShadow: '0 12px 40px -12px rgba(0,0,0,0.35)',
      }}
    />
  );
}
