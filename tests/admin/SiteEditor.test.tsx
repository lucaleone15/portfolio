import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SiteEditorView, type SiteTab } from '../../src/admin/pages/SiteEditor';
import { MediaContext } from '../../src/admin/fields/FieldEditor';
import { realContent } from '../content/fixtures';

function Harness({ tab, onSite }: { tab: SiteTab; onSite: (s: any) => void }) {
  const content = realContent();
  const [site, setSite] = useState(content.site);
  return (
    <MediaContext.Provider value={{ preview: (s) => s, upload: async () => ({ src: '/pdf/cv-2027-1a2b3c4d.pdf' }) }}>
      <SiteEditorView
        tab={tab}
        mode="structure"
        lang="fr"
        content={{ ...content, site }}
        onChange={(key, value) => {
          const next = { ...site, [key]: value };
          setSite(next);
          onSite(next);
        }}
      />
    </MediaContext.Provider>
  );
}

test('hero: the five rotating words are listed and a sixth can be added', () => {
  let site: any;
  render(<Harness tab="hero" onSite={(s) => (site = s)} />);
  expect(screen.getAllByText(/^Mot \d$/)).toHaveLength(5);
  fireEvent.click(screen.getByRole('button', { name: '+ Mot' }));
  expect(site.hero.outcomes).toHaveLength(6);
});

test('contact: replacing the CV updates contact.cv', async () => {
  let site: any;
  const { container } = render(<Harness tab="contact" onSite={(s) => (site = s)} />);
  const input = container.querySelector('input[type=file]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(['%PDF-1.7'], 'cv.pdf', { type: 'application/pdf' })] } });
  await waitFor(() => expect(site?.contact.cv).toBe('/pdf/cv-2027-1a2b3c4d.pdf'));
});

test('SEO: the {N} placeholder is explained with its current value', () => {
  render(<Harness tab="seo" onSite={() => {}} />);
  expect(screen.getByText(/Six projets de Luca Leone/)).toBeTruthy();
});
