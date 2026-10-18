import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MediaContext } from '../../src/admin/fields/FieldEditor';
import { FileField } from '../../src/admin/fields/ImageField';

test('a video over the limit is refused before uploading, with its size limit', async () => {
  const upload = vi.fn();
  const { container } = render(
    <MediaContext.Provider value={{ preview: (s) => s, upload }}>
      <FileField id="v" label="Vidéo" kind="video" value="" onChange={() => {}} path="video" />
    </MediaContext.Provider>,
  );
  const file = new File(['x'], 'clip.mov', { type: 'video/mp4' });
  Object.defineProperty(file, 'size', { value: 200 * 1024 * 1024 });
  fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [file] } });
  expect(await screen.findByText('Fichier trop lourd : 60 Mo au maximum.')).toBeTruthy();
  expect(upload).not.toHaveBeenCalled();
});
