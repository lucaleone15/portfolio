import { ContentSchema } from './schema';
import { CONTENT } from './load';

/** Build time: a content file that doesn't match the schema stops the build, with the reasons */
export function checkContent() {
  const result = ContentSchema.safeParse(CONTENT);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    throw new Error(`content/ does not match src/content/schema.ts:\n${lines.join('\n')}`);
  }
}
