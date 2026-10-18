import { createContext, useCallback, useContext, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { Icon } from './Icon';
import { useLanguage } from '../context/LanguageContext';
import type { CaseImage } from '../data/caseStudies/types';

/**
 * Full-screen viewer for a case study's images: a tap on any image opens it large, then
 * arrows, ←/→ keys or a swipe move through every image of the project in reading order.
 * A native modal <dialog>: focus kept inside, Escape closes, focus returns to the image.
 * Nothing is rendered until it opens, so the prerendered page is unchanged.
 */

const LightboxContext = createContext<((src: string) => void) | null>(null);

/** Props that make an image open the viewer (none outside a LightboxProvider) */
export function useZoomable(image: CaseImage, { enabled = true, tabbable = true } = {}) {
  const open = useContext(LightboxContext);
  const { lang } = useLanguage();
  if (!open || !enabled) return {};
  return {
    role: 'button',
    tabIndex: tabbable ? 0 : -1,
    'aria-label': `${lang === 'fr' ? 'Agrandir l’image :' : 'Enlarge image:'} ${image.alt}`,
    onClick: () => open(image.src),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      open(image.src);
    },
  };
}

export function LightboxProvider({ images, children }: { images: CaseImage[]; children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = useCallback(
    (src: string) => {
      const i = images.findIndex((im) => im.src === src);
      if (i >= 0) setIndex(i);
    },
    [images],
  );
  return (
    <LightboxContext.Provider value={open}>
      {children}
      {index !== null && <Lightbox images={images} index={index} onIndex={setIndex} onClose={() => setIndex(null)} />}
    </LightboxContext.Provider>
  );
}

function Lightbox({ images, index, onIndex, onClose }: { images: CaseImage[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const swiped = useRef(false);
  const count = images.length;
  const image = images[index];
  const go = (step: number) => onIndex((index + step + count) % count);
  const close = () => ref.current?.close();

  // Open as a modal; the page behind stops scrolling until the viewer closes
  useEffect(() => {
    ref.current?.showModal();
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = overflow;
    };
  }, []);

  // The neighbours load in the background: the next image is there at once
  useEffect(() => {
    [index - 1, index + 1].forEach((i) => {
      new Image().src = images[(i + count) % count].src;
    });
  }, [index, images, count]);

  const navButton = 'flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-[0.96]';

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={lang === 'fr' ? 'Images du projet' : 'Project images'}
      onKeyDown={(e) => {
        if (count < 2 || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
        e.preventDefault();
        go(e.key === 'ArrowLeft' ? -1 : 1);
      }}
      onPointerDown={(e) => {
        touchX.current = e.pointerType === 'mouse' ? null : e.clientX;
      }}
      onPointerUp={(e) => {
        if (touchX.current === null || count < 2) return;
        const dx = e.clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 50) return;
        swiped.current = true;
        go(dx < 0 ? 1 : -1);
      }}
      onClick={(e) => {
        // A swipe ends with a click: it must not close the viewer
        if (swiped.current) {
          swiped.current = false;
          return;
        }
        // A click beside the image closes, like on the backdrop
        if (!(e.target as Element).closest('img, button, figcaption')) close();
      }}
      className="lightbox fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-white backdrop:bg-black/90 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3 sm:px-6">
          <p className="text-sm font-semibold tabular-nums text-white/70" aria-live="polite">
            {index + 1} / {count}
          </p>
          <button type="button" onClick={close} aria-label={lang === 'fr' ? 'Fermer' : 'Close'} className={navButton}>
            <Icon icon={Cancel01Icon} className="h-5 w-5" />
          </button>
        </div>

        <figure className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 pb-4 sm:px-24">
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            decoding="async"
            className="lightbox-image h-auto max-h-[calc(100dvh-11rem)] w-auto max-w-full rounded-lg object-contain sm:max-h-[calc(100dvh-8rem)]"
            style={{ touchAction: 'pan-y pinch-zoom' }}
          />
          {image.caption && <figcaption className="max-w-2xl text-center text-sm text-white/75">{image.caption}</figcaption>}
        </figure>

        {/* Under the image on phones, on either side on larger screens */}
        {count > 1 && (
          <div className="flex justify-center gap-4 pb-[max(20px,env(safe-area-inset-bottom))] sm:contents">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={lang === 'fr' ? 'Image précédente' : 'Previous image'}
              className={`${navButton} sm:absolute sm:left-5 sm:top-1/2 sm:-translate-y-1/2`}
            >
              <Icon icon={ArrowLeft01Icon} className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={lang === 'fr' ? 'Image suivante' : 'Next image'}
              className={`${navButton} sm:absolute sm:right-5 sm:top-1/2 sm:-translate-y-1/2`}
            >
              <Icon icon={ArrowRight01Icon} className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
