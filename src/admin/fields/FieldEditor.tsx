import { createContext, useContext, useId, type ReactNode } from 'react';
import { z } from 'zod';
import type { Language } from '../../types';
import { PROJECT_KIND_LABEL } from '../../data/portfolioData';
import { describeOf, emptyOf, isImageSchema, isTxtSchema, type FileKind } from './schemaWalk';
import { TxtField } from './TxtField';
import { ImageField, FileField } from './ImageField';
import { fieldClass, labelClass } from '../ui';

/**
 * A form generated from the content schema: every field kind of the schema has its control,
 * labels come from `.describe()`. Each field carries data-path (its place in the page) so the
 * Page and Structure modes can point at the same thing.
 */

export interface Media {
  /** Uploads a file, returns its site path (and size for images) */
  upload?: (file: File, kind: FileKind, cover: boolean) => Promise<{ src: string; width?: number; height?: number }>;
  /** A site path as the admin can show it (uploads not published yet) */
  preview: (src: string) => string;
}
export const MediaContext = createContext<Media>({ preview: (src) => src });
export const useMedia = () => useContext(MediaContext);

const ENUM_LABELS: Record<string, string> = {
  cover: 'Remplir le cadre',
  contain: 'Image entière',
  screen: 'Écran',
  plain: 'Sans cadre',
  mockup: 'Maquette',
  accent: 'Oui',
  ...Object.fromEntries(Object.entries(PROJECT_KIND_LABEL).map(([k, v]) => [k, v.fr])),
};

interface Props {
  key?: string;
  schema: z.ZodTypeAny;
  value: unknown;
  onChange: (value: unknown) => void;
  lang: Language;
  path: string;
  /** Overrides the schema's label (list items) */
  label?: string;
  /** Hides the label (when a card header already says it) */
  bare?: boolean;
}

export function FieldEditor(props: Props) {
  const { schema, value, onChange, path } = props;
  const { label } = describeOf(schema);
  const shown = props.label ?? label;

  if (schema instanceof z.ZodOptional) {
    const inner = schema.unwrap();
    if (value === undefined) {
      return (
        <button
          type="button"
          data-path={path}
          onClick={() => onChange(emptyOf(inner) ?? '')}
          className="min-h-11 rounded-full border border-dashed border-[var(--color-border)] px-4 text-sm font-semibold text-neutral-600 hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-white/15 dark:text-[#A1A1AA]"
        >
          Ajouter {shown}
        </button>
      );
    }
    return (
      <div className="relative">
        <FieldEditor {...props} schema={inner} label={shown} />
        <button type="button" onClick={() => onChange(undefined)} className="absolute right-0 top-0 text-xs font-semibold text-neutral-500 underline-offset-2 hover:text-[var(--accent)] hover:underline dark:text-[#A1A1AA]">
          Retirer
        </button>
      </div>
    );
  }

  if (isTxtSchema(schema)) return <TxtField {...props} label={shown} long={describeOf(schema).long} value={value as never} />;
  if (isImageSchema(schema)) return <ImageField {...props} label={shown} value={value as never} />;
  if (schema instanceof z.ZodLiteral) return null;
  if (schema instanceof z.ZodDiscriminatedUnion) {
    const option = schema.optionsMap.get((value as { type: string })?.type) ?? schema.options[0];
    return <FieldEditor {...props} schema={option} />;
  }
  if (schema instanceof z.ZodObject) return <ObjectField {...props} label={shown} />;
  if (schema instanceof z.ZodArray || schema instanceof z.ZodTuple) return <ListField {...props} label={shown} />;
  return <ScalarField {...props} label={shown} />;
}

function ObjectField({ schema, value, onChange, lang, path, label, bare }: Props) {
  const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;
  const obj = (value ?? {}) as Record<string, unknown>;
  return (
    <fieldset data-path={path} className="space-y-5">
      {label && !bare && path && <legend className="mb-3 font-syne text-sm font-extrabold">{label}</legend>}
      {Object.entries(shape).map(([key, child]) => (
        <FieldEditor
          key={key}
          schema={child}
          value={obj[key]}
          lang={lang}
          path={path ? `${path}.${key}` : key}
          onChange={(v) => {
            const next = { ...obj };
            if (v === undefined) delete next[key];
            else next[key] = v;
            onChange(next);
          }}
        />
      ))}
    </fieldset>
  );
}

function ListField({ schema, value, onChange, lang, path, label }: Props) {
  const tuple = schema instanceof z.ZodTuple;
  const items = (value ?? []) as unknown[];
  const elementOf = (i: number): z.ZodTypeAny => (tuple ? (schema as z.ZodTuple).items[i] : (schema as z.ZodArray<z.ZodTypeAny>).element);
  const itemLabel = describeOf(elementOf(0) ?? z.any()).label || 'Élément';
  const move = (from: number, to: number) => {
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };
  const small = 'grid size-9 place-items-center rounded-full text-sm text-neutral-500 hover:bg-[var(--color-surface)] disabled:opacity-25 dark:text-[#A1A1AA] dark:hover:bg-white/5';

  return (
    <div data-path={path}>
      <p className={labelClass}>{label}</p>
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="rounded-2xl border border-[var(--color-border)] bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="mb-2 flex items-center gap-1">
              <span className="mr-auto text-xs font-bold text-neutral-500 dark:text-[#A1A1AA]">
                {itemLabel} {i + 1}
              </span>
              <button type="button" className={small} aria-label="Monter" disabled={i === 0} onClick={() => move(i, i - 1)}>
                ↑
              </button>
              <button type="button" className={small} aria-label="Descendre" disabled={i === items.length - 1} onClick={() => move(i, i + 1)}>
                ↓
              </button>
              {!tuple && (
                <button type="button" className={small} aria-label="Retirer" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                  ✕
                </button>
              )}
            </div>
            <FieldEditor schema={elementOf(i)} value={item} lang={lang} path={`${path}.${i}`} bare label={itemLabel} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} />
          </li>
        ))}
      </ol>
      {!tuple && (
        <button
          type="button"
          onClick={() => onChange([...items, emptyOf(elementOf(0))])}
          className="mt-3 min-h-11 rounded-full border border-dashed border-[var(--color-border)] px-4 text-sm font-semibold text-neutral-600 hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-white/15 dark:text-[#A1A1AA]"
        >
          + {itemLabel}
        </button>
      )}
    </div>
  );
}

function ScalarField({ schema, value, onChange, path, label }: Props) {
  const id = useId();
  const { long, file } = describeOf(schema);
  const wrap = (control: ReactNode) => (
    <div data-path={path}>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      {control}
    </div>
  );

  if (schema instanceof z.ZodString && file) return <FileField id={id} label={label!} kind={file} value={String(value ?? '')} onChange={onChange} path={path} />;
  if (schema instanceof z.ZodString) {
    return wrap(
      long ? (
        <textarea id={id} rows={4} className={fieldClass} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} className={fieldClass} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
      ),
    );
  }
  if (schema instanceof z.ZodNumber) {
    return wrap(<input id={id} type="number" inputMode="decimal" className={fieldClass} value={Number(value ?? 0)} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />);
  }
  if (schema instanceof z.ZodBoolean) {
    return (
      <label data-path={path} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
        <input type="checkbox" className="size-5 accent-[var(--accent)]" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>
    );
  }
  const options: (string | number)[] =
    schema instanceof z.ZodEnum ? schema.options : schema instanceof z.ZodUnion ? schema.options.map((o: z.ZodLiteral<string | number>) => o.value) : [];
  return wrap(
    <select
      id={id}
      className={fieldClass}
      value={String(value ?? '')}
      onChange={(e) => {
        const raw = options.find((o) => String(o) === e.target.value);
        onChange(raw);
      }}
    >
      {options.map((o) => (
        <option key={String(o)} value={String(o)}>
          {ENUM_LABELS[String(o)] ?? String(o)}
        </option>
      ))}
    </select>,
  );
}
