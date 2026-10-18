import { BlockSchema } from '../../src/content/schema';
import { BLOCK_TYPES, emptyBlock } from '../../src/admin/structure/blockTemplates';

test('every block type has a label and a valid empty block', () => {
  const types = BlockSchema.options.map((o) => o.shape.type.value).sort();
  expect(BLOCK_TYPES.map((b) => b.type).sort()).toEqual(types);
  for (const { type } of BLOCK_TYPES) expect(() => BlockSchema.parse(emptyBlock(type))).not.toThrow();
  expect(BLOCK_TYPES.find((b) => b.type === 'compare')!.label).toBe('Avant / après');
});
