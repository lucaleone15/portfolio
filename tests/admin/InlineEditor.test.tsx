import { render } from '@testing-library/react';
import { InlineEditor } from '../../src/admin/page/InlineEditor';

test('when the element it covers is re-rendered, the editor follows the new one', () => {
  const old = document.createElement('dt');
  old.dataset.edit = 'study.meta.0.label';
  document.body.append(old);
  const { rerender, getByRole } = render(<InlineEditor target={old} path="study.meta.0.label" value={{ fr: 'Année', en: 'Year' }} lang="fr" onChange={() => {}} onClose={() => {}} />);
  old.remove();
  const fresh = document.createElement('dt');
  fresh.dataset.edit = 'study.meta.0.label';
  fresh.getBoundingClientRect = () => ({ top: 123, left: 40, width: 200, height: 20, right: 240, bottom: 143, x: 40, y: 123, toJSON() {} });
  document.body.append(fresh);
  rerender(<InlineEditor target={old} path="study.meta.0.label" value={{ fr: 'Années', en: 'Year' }} lang="fr" onChange={() => {}} onClose={() => {}} />);
  expect((getByRole('textbox') as HTMLTextAreaElement).style.top).toBe('117px');
});
