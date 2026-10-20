import { renderToString } from 'react-dom/server';
import { AboutSection } from '../../src/components/AboutSection';
import { EditProvider } from '../../src/content/edit';

test('company / school and place each have their own path in the admin', () => {
  const html = renderToString(
    <EditProvider value={{ onInsert: () => {} }}>
      <AboutSection />
    </EditProvider>,
  );
  expect(html).toContain('data-edit="about.experience.0.company"');
  expect(html).toContain('data-edit="about.experience.0.location"');
  expect(html).toContain('data-edit="about.education.0.institution"');
  expect(html).toContain('data-edit="about.education.0.location"');
});

test('on the public site that line is unchanged (no extra elements)', () => {
  const html = renderToString(<AboutSection />);
  expect(html).not.toContain('data-edit');
  expect(html).toContain('Groupe AFH Automobile<!-- --> <!-- -->· Yverdon-les-Bains');
});
