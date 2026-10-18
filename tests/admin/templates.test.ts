import { StoredProjectSchema } from '../../src/content/schema';
import { newProject } from '../../src/admin/templates';
import { realContent } from '../content/fixtures';

test('a new project is valid and has the sections every case study shares', () => {
  const p = newProject('test', 'Test', realContent());
  expect(() => StoredProjectSchema.parse(p)).not.toThrow();
  expect(p.study.sections.map((s) => s.id)).toEqual(['idee', 'resultats', 'retenu']);
  expect(p.number).toBe('07');
  expect(p.study.meta.map((m) => m.label.fr)).toEqual(['Contexte', 'Année', 'Durée', 'Mon rôle']);
  expect(p.study.brief.map((b) => b.label.fr)).toEqual(['Le problème', 'Ma réponse', 'Le résultat']);
});
test('fixed labels are not flagged as English to review', async () => { const { englishTodo } = await import('../../src/content/txt'); const p = newProject('test', 'Test', realContent()); expect(englishTodo([{ ref: 'project:test', data: p }]).stale).toEqual([]); });
