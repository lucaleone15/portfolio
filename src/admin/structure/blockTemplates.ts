import { BlockSchema, type Block } from '../../content/schema';
import { describeOf, emptyOf } from '../fields/schemaWalk';

/** The blocks a section can hold, in the menu's order, with their names in the editor */
export const BLOCK_TYPES: { type: Block['type']; label: string }[] = BlockSchema.options.map((o) => ({
  type: o.shape.type.value as Block['type'],
  label: describeOf(o).label,
}));

export const blockSchemaOf = (type: Block['type']) => BlockSchema.optionsMap.get(type)!;

export const emptyBlock = (type: Block['type']): Block => emptyOf(blockSchemaOf(type)) as Block;

/** A block in one line for the plan: its first French text, or how many items it holds */
export function blockSummary(block: Block): string {
  let text = '';
  const find = (v: unknown) => {
    if (text || !v || typeof v !== 'object') return;
    if ('fr' in v && typeof (v as { fr: unknown }).fr === 'string' && (v as { fr: string }).fr.trim()) text = (v as { fr: string }).fr;
    else Object.values(v).forEach(find);
  };
  find(block);
  if (!text && 'items' in block && Array.isArray(block.items)) text = `${block.items.length} élément(s)`;
  return text || 'Vide';
}
