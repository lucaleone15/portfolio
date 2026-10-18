import { countWord, fillTemplate, llmsProjectsBlock } from '../../src/content/derived';
import { realContent } from './fixtures';

test('counts are written in words', () => {
  expect(countWord(6, 'fr')).toBe('six');
  expect(countWord(7, 'en', true)).toBe('Seven');
  expect(countWord(13, 'fr')).toBe('13');
});

test('templates count only the visible projects', () => {
  const c = realContent();
  expect(fillTemplate('{N} projets de Luca Leone', c, 'fr')).toBe('Six projets de Luca Leone');
  c.index.order.push('extra');
  c.projects.extra = { ...structuredClone(c.projects.hug), id: 'extra', name: 'Extra' };
  c.index.hidden = ['extra'];
  expect(fillTemplate('{n} études de cas ({names})', c, 'fr')).toBe(
    "six études de cas (HUG, Karting de Vuiteboeuf, OceanSight, Étoile Blanche, DriveGear, F1 PitWall)",
  );
});

test('llms.txt block: numbered entries, written ones kept, others built from the card', () => {
  const c = realContent();
  c.projects.hug.seo.llms = undefined;
  const block = llmsProjectsBlock(c);
  expect(block).toMatch(/^1\. \*\*\[HUG\]\(https:\/\/luca-leone\.ch\/projets\/hug\)\*\* \(2026\) :\n   - \*Type\* : /);
  expect(block).toContain('\n\n2. **[Karting de Vuiteboeuf](https://luca-leone.ch/projets/karting-vuiteboeuf)** (depuis mai 2026, en cours) :');
  expect(block.match(/^\d+\. /gm)).toHaveLength(6);
});

test('names written into a JSON file are escaped (quotes, backslashes)', async () => {
  const { fillDerivedFile } = await import('../../src/content/derived');
  const c = realContent();
  c.projects.hug.name = 'HUG "Sang" \\ test';
  const out = fillDerivedFile('ai-catalog.json', '{"description": "{n} études ({names})"}', c);
  expect(JSON.parse(out).description).toContain('HUG "Sang" \\ test');
});
