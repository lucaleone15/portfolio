import { createMessageStore } from '../../server/messages';
import { createContactHandler } from '../../server/contact';
import { serve, tmpDir } from './helpers';

const sample = { name: 'Camille', email: 'camille@example.com', subject: 'Projet', message: 'Bonjour, un projet à vous proposer.', lang: 'fr', page: '/contact', elapsed: 20_000 };

async function setup() {
  const messages = createMessageStore(tmpDir('msg'));
  const srv = await serve(createContactHandler({}, { messages }) as never);
  const post = (body: object) => fetch(`${srv.base}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { messages, srv, post };
}

test('sent less than 3 seconds after the form appeared: a robot, quietly dropped', async () => {
  const { messages, srv, post } = await setup();
  const res = await post({ ...sample, elapsed: 900 });
  expect(res.status).toBe(200);
  expect(messages.list()).toEqual([]);
  await post({ ...sample, elapsed: undefined }); // an old page without the timer still works
  expect(messages.list()).toHaveLength(1);
  await srv.close();
});

test('a message full of links goes to "spam probable", not to the inbox', async () => {
  const { messages, srv, post } = await setup();
  await post({ ...sample, message: 'Buy now http://a.com http://b.com https://c.com www.d.com' });
  expect(messages.list()[0].status).toBe('spam');
  expect(messages.unread()).toBe(0);
  await srv.close();
});

test('the same message sent twice from the same address: the copy is spam', async () => {
  const { messages, srv, post } = await setup();
  await post(sample);
  await post(sample);
  expect(messages.list().map((m) => m.status).sort()).toEqual(['new', 'spam']);
  await srv.close();
});

test('one address can send at most 3 messages in 10 minutes', async () => {
  const { srv, post } = await setup();
  for (let i = 0; i < 3; i++) expect((await post({ ...sample, message: `Message ${i}`, email: 'x@example.com' })).status).toBe(200);
  expect((await post({ ...sample, message: 'Encore', email: 'X@example.com' })).status).toBe(429);
  await srv.close();
});
