import { z } from 'zod';
import { ImageSchema, TxtSchema } from '../../content/schema';

/**
 * Reading the content schema to build forms: what kind of field a schema is, its label, and an
 * empty value for a new item. Labels come from `.describe()`; a trailing "(long)" asks for a
 * multi-line field, "(image)", "(vidéo)" or "(pdf)" for a file picker.
 */

export type FileKind = 'image' | 'video' | 'pdf';

/** zod's .describe() makes a new schema object but keeps the shape function: compare that */
const sameObject = (s: z.ZodTypeAny, target: z.ZodObject<z.ZodRawShape>) => s instanceof z.ZodObject && s._def.shape === target._def.shape;
export const isTxtSchema = (s: z.ZodTypeAny) => sameObject(s, TxtSchema);
export const isImageSchema = (s: z.ZodTypeAny) => sameObject(s, ImageSchema as unknown as z.ZodObject<z.ZodRawShape>);

export function describeOf(s: z.ZodTypeAny): { label: string; long: boolean; file: FileKind | null } {
  const raw = s.description ?? (s instanceof z.ZodOptional ? s.unwrap().description : undefined) ?? '';
  const m = /\s*\((long|image|vidéo|pdf)\)$/.exec(raw);
  const token = m?.[1];
  return {
    label: m ? raw.slice(0, m.index) : raw,
    long: token === 'long',
    file: token === 'image' ? 'image' : token === 'vidéo' ? 'video' : token === 'pdf' ? 'pdf' : null,
  };
}

export function emptyOf(s: z.ZodTypeAny): unknown {
  if (isTxtSchema(s)) return { fr: '', en: '' };
  if (isImageSchema(s)) return { src: '', width: 1, height: 1, alt: { fr: '', en: '' } };
  if (s instanceof z.ZodOptional) return undefined;
  if (s instanceof z.ZodString) return '';
  // Sizes are positive: 1 until the real value is known
  if (s instanceof z.ZodNumber) return s._def.checks.some((c) => c.kind === 'min') ? 1 : 0;
  if (s instanceof z.ZodBoolean) return false;
  if (s instanceof z.ZodEnum) return s.options[0];
  if (s instanceof z.ZodLiteral) return s.value;
  if (s instanceof z.ZodUnion) return emptyOf(s.options[0]);
  if (s instanceof z.ZodArray) return [];
  if (s instanceof z.ZodTuple) return s.items.map((item: z.ZodTypeAny) => emptyOf(item));
  if (s instanceof z.ZodDiscriminatedUnion) return emptyOf(s.options[0]);
  if (s instanceof z.ZodObject) {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(s.shape as z.ZodRawShape)) {
      const v = emptyOf(child);
      if (v !== undefined) out[key] = v;
    }
    return out;
  }
  if (s instanceof z.ZodRecord) return {};
  return undefined;
}

/** Reads a dotted path ("study.sections.2.title") */
export function getAt(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}

/** Writes a dotted path in place (on a draft copy) */
export function setAt(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.');
  let o: Record<string, unknown> = obj;
  for (const k of keys.slice(0, -1)) o = o[k] as Record<string, unknown>;
  const last = keys[keys.length - 1];
  if (value === undefined && !Array.isArray(o)) delete o[last];
  else o[last] = value;
}
