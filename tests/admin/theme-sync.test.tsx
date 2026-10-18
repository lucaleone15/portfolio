import { act, render, screen } from '@testing-library/react';
import { useTheme } from '../../src/admin/theme';

function Button({ label }: { label: string }) {
  const [theme, next] = useTheme();
  return (
    <button type="button" onClick={next}>
      {label}:{theme}
    </button>
  );
}

test('every theme button shows and keeps the same choice', () => {
  localStorage.clear();
  render(
    <>
      <Button label="a" />
      <Button label="b" />
    </>,
  );
  act(() => screen.getByText('a:system').click());
  expect(screen.getByText('b:light')).toBeTruthy();
  expect(document.documentElement.classList.contains('dark')).toBe(false);
});
