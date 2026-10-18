import { fireEvent, render, screen } from '@testing-library/react';
import { PageView } from '../../src/admin/page/PageView';
import { realContent } from '../content/fixtures';

const setup = (lang: 'fr' | 'en', tweak?: (c: ReturnType<typeof realContent>) => void) => {
  const content = realContent();
  tweak?.(content);
  const edits: [string, any][] = [];
  const opened: string[] = [];
  const view = render(
    <PageView
      project={content.projects.hug}
      content={content}
      lang={lang}
      preview={(s) => s}
      onEdit={(path, value) => edits.push([path, value])}
      onOpen={(path) => opened.push(path)}
      onInsert={() => {}}
    />,
  );
  return { view, edits, opened, content };
};

test('clicking the title opens an editor on it; typing edits the French', () => {
  const { view, edits, content } = setup('fr');
  fireEvent.click(view.container.querySelector('[data-edit="study.title"]')!);
  const box = screen.getByRole('textbox', { name: 'Modifier le texte' }) as HTMLTextAreaElement;
  expect(box.value).toBe(content.projects.hug.study.title.fr);
  fireEvent.change(box, { target: { value: box.value + 'X' } });
  expect(edits.at(-1)![0]).toBe('study.title');
  expect(edits.at(-1)![1].fr).toBe(content.projects.hug.study.title.fr + 'X');
  expect(edits.at(-1)![1].enOf).toBe(content.projects.hug.study.title.enOf);
});

test('clicking a block that is not plain text opens its form', () => {
  const { view, opened } = setup('fr');
  fireEvent.click(view.container.querySelector('[data-edit="study.sections.0.content.1"]')!);
  expect(opened).toEqual(['study.sections.0.content.1']);
});

test('in English, a block without its English shows the French marked "to translate"', () => {
  const { view } = setup('en', (c) => {
    const block = c.projects.hug.study.sections[0].content[0];
    if (block.type === 'text') block.text.en = '';
  });
  expect(view.container.textContent).toContain('⟨à traduire⟩');
});
