import { EventEmitter } from 'node:events';
import { readBody } from '../../server/admin/handler';

test('a body far past the limit is cut and the read fails with 413 (it never hangs)', async () => {
  const req = Object.assign(new EventEmitter(), { destroy: () => req.emit('close') });
  const reading = readBody(req as never, 10);
  for (let i = 0; i < 11; i++) req.emit('data', Buffer.alloc(100_000));
  await expect(reading).rejects.toMatchObject({ status: 413 });
});
