import fs from 'node:fs';
import path from 'node:path';
import { ContentSchema, type Content } from '../../src/content/schema';

/** The real published content, read from disk (a fresh copy each call) */
export function realContent(): Content {
  const dir = path.join(process.cwd(), 'content');
  const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const projects = Object.fromEntries(
    fs.readdirSync(path.join(dir, 'projects')).map((f) => {
      const p = read(path.join('projects', f));
      return [p.id, p];
    }),
  );
  return ContentSchema.parse({ site: read('site.json'), index: read('projects.json'), projects });
}

/** drivegear hidden, oceansight without English */
export function testContent(): Content {
  const c = realContent();
  c.index.hidden = ['drivegear'];
  c.projects.oceansight.study.title.en = '';
  return c;
}
