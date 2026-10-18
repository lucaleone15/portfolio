import { useId, useRef, useState } from 'react';
import type { Language } from '../../types';
import { ImageSchema, type StoredImage } from '../../content/schema';
import { ApiError } from '../api';
import { UPLOAD_LIMITS, tooLargeMessage } from '../../content/uploadLimits';
import { FieldEditor, useMedia } from './FieldEditor';
import type { FileKind } from './schemaWalk';
import { Button, labelClass } from '../ui';

const ACCEPT: Record<FileKind, string> = { image: 'image/*', video: 'video/mp4,video/webm', pdf: 'application/pdf' };

function useUpload(kind: FileKind, cover: boolean) {
  const { upload } = useMedia();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const run = async (file: File) => {
    if (!upload) return null;
    // Refused here rather than cut off mid-way by the server (which looks like a network error)
    if (file.size > UPLOAD_LIMITS[kind]) {
      setError(tooLargeMessage(kind));
      return null;
    }
    setBusy(true);
    setError('');
    try {
      return await upload(file, kind, cover);
    } catch (err) {
      setError(err instanceof ApiError ? String((err.body as { error?: string })?.error ?? 'Envoi impossible.') : 'Envoi impossible : vérifie ta connexion.');
      return null;
    } finally {
      setBusy(false);
    }
  };
  return { run, busy, error, enabled: !!upload };
}

function PickButton({ kind, busy, onFile, children }: { kind: FileKind; busy: boolean; onFile: (f: File) => void; children: string }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={input} type="file" accept={ACCEPT[kind]} className="sr-only" tabIndex={-1} onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      <Button onClick={() => input.current?.click()} disabled={busy}>
        {busy ? 'Envoi…' : children}
      </Button>
    </>
  );
}

/** An image block: thumbnail, replace (opens the photo library on a phone), alt text, caption, framing */
export function ImageField({ value, onChange, lang, path, label }: { value: StoredImage; onChange: (v: StoredImage) => void; lang: Language; path: string; label?: string }) {
  const { preview } = useMedia();
  const { run, busy, error, enabled } = useUpload('image', false);
  const img = value ?? { src: '', width: 1, height: 1, alt: { fr: '', en: '' } };
  const shape = ImageSchema.shape;

  return (
    <div data-path={path} className="space-y-4">
      {label && <p className={labelClass}>{label}</p>}
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-xl bg-[var(--color-surface)] dark:bg-white/10">
          {img.src ? <img src={preview(img.src)} alt="" className="size-full object-cover" /> : <span className="text-xs text-neutral-400">Aucune image</span>}
        </div>
        <div className="min-w-0 space-y-2">
          {enabled && (
            <PickButton kind="image" busy={busy} onFile={async (f) => {
              const out = await run(f);
              if (out) onChange({ ...img, src: out.src, width: out.width ?? img.width, height: out.height ?? img.height });
            }}>
              {img.src ? 'Remplacer' : 'Choisir une image'}
            </PickButton>
          )}
          {img.src && <p className="truncate text-xs text-neutral-500 dark:text-[#A1A1AA]">{img.width} × {img.height} px</p>}
          {error && <p role="alert" className="text-xs font-semibold text-[var(--accent)]">{error}</p>}
        </div>
      </div>
      <FieldEditor schema={shape.alt} value={img.alt} lang={lang} path={`${path}.alt`} onChange={(v) => onChange({ ...img, alt: v as StoredImage['alt'] })} />
      <FieldEditor schema={shape.caption} value={img.caption} lang={lang} path={`${path}.caption`} onChange={(v) => onChange({ ...img, caption: v as StoredImage['caption'] })} />
      <FieldEditor schema={shape.fit} value={img.fit} lang={lang} path={`${path}.fit`} onChange={(v) => onChange({ ...img, fit: v as StoredImage['fit'] })} />
    </div>
  );
}

/** A file kept as a site path: card cover, hover video, poster, CV */
export function FileField({ id, label, kind, value, onChange, path }: { id: string; label: string; kind: FileKind; value: string; onChange: (v: string) => void; path: string }) {
  const { preview } = useMedia();
  const cover = path === 'imageUrl';
  const { run, busy, error, enabled } = useUpload(kind, cover);
  const fallbackId = useId();
  return (
    <div data-path={path}>
      <label className={labelClass} htmlFor={id ?? fallbackId}>
        {label}
      </label>
      <div className="flex items-center gap-4">
        {kind === 'image' && (
          <div className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-[var(--color-surface)] dark:bg-white/10">
            {value && <img src={preview(value)} alt="" className="size-full object-cover" />}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <p id={id ?? fallbackId} className="truncate text-sm text-neutral-600 dark:text-[#A1A1AA]">{value || 'Aucun fichier'}</p>
          <div className="flex flex-wrap gap-2">
            {enabled && (
              <PickButton kind={kind} busy={busy} onFile={async (f) => {
                const out = await run(f);
                if (out) onChange(out.src);
              }}>
                {value ? 'Remplacer' : 'Choisir un fichier'}
              </PickButton>
            )}
          </div>
          {error && <p role="alert" className="text-xs font-semibold text-[var(--accent)]">{error}</p>}
        </div>
      </div>
    </div>
  );
}
