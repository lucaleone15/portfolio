import { renderToString } from 'react-dom/server';
import { CaseStudy } from '../../src/components/CaseStudy';
import { EditProvider } from '../../src/content/edit';
import { toCaseStudy, toProject } from '../../src/content/localize';
import { realContent } from './fixtures';

const hug = realContent().projects.hug;
const page = () => <CaseStudy project={toProject(hug, 'fr')} study={toCaseStudy(hug, 'fr')!} />;

test('on the public site the case study carries no edit hooks', () => {
  const html = renderToString(page());
  expect(html).not.toContain('data-edit');
  expect(html).not.toContain('data-slot');
});

test('in the admin every text has its path and every gap between blocks a "+"', () => {
  const html = renderToString(<EditProvider value={{ onInsert: () => {} }}>{page()}</EditProvider>);
  expect(html).toContain('data-edit="study.title"');
  expect(html).toContain('data-edit="study.meta.0.value"');
  expect(html).toContain('data-edit="study.sections.0.title"');
  expect(html).toContain('data-edit="study.sections.0.content.0.text"');
  expect(html).toContain('data-edit="study.sections.0.content.1"');
  const slots = hug.study.sections.reduce((n, s) => n + s.content.length + 1, 0);
  expect(html.match(/data-slot=""/g)).toHaveLength(slots);
});

test('texts inside blocks have their own paths (figure labels, captions, quotes, team roles…)', () => {
  const html = renderToString(<EditProvider value={{ onInsert: () => {} }}>{page()}</EditProvider>);
  expect(html).toContain('data-edit="study.sections.0.content.1.items.0.label"');
  expect(html).toContain('data-edit="study.sections.2.content.1.items.0.caption"');
  expect(html).toContain('data-edit="study.sections.3.content.0.beforeLabel"');
  expect(html).toContain('data-edit="study.sections.3.content.1.steps.0.text"');
  expect(html).toMatch(/data-edit="study\.sections\.\d+\.content\.\d+\.text"[^>]*>(?:<span[^>]*>«)/);
  expect(html).toContain('data-edit="kind"');
});
