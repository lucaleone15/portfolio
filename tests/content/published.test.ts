import { allPages, pageData } from '../../src/content/pages';
import { englishTodo } from '../../src/content/txt';
import { realContent } from './fixtures';

test('the published content has no English to review or write', () => {
  const c = realContent();
  const { stale, missingEn } = englishTodo(allPages(c).map((ref) => ({ ref, data: pageData(c, ref) })));
  expect(stale).toEqual([]);
  expect(missingEn).toEqual([]);
});
