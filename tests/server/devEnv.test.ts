import fs from 'node:fs';
import path from 'node:path';
import { devEnv } from '../../server/devEnv';
import { tmpDir } from './helpers';

test('values with $ in .env reach the dev server as written (no $VAR expansion)', () => {
  const dir = tmpDir('env');
  const hash = 'scrypt$16384$8$1$c2FsdA==$aGFzaA==';
  fs.writeFileSync(path.join(dir, '.env'), `ADMIN_PASSWORD_HASH="${hash}"\nSMTP_PASS=pa$$word\nPORT="3000"\n`);
  const env = devEnv('development', dir);
  expect(env.ADMIN_PASSWORD_HASH).toBe(hash);
  expect(env.SMTP_PASS).toBe('pa$$word');
  expect(env.PORT).toBe('3000');
});

test('the real environment still wins over .env', () => {
  const dir = tmpDir('env');
  fs.writeFileSync(path.join(dir, '.env'), 'PORT="3000"\n');
  process.env.PORT_TEST_DEVENV = 'x';
  fs.appendFileSync(path.join(dir, '.env'), 'PORT_TEST_DEVENV="from-file"\n');
  expect(devEnv('development', dir).PORT_TEST_DEVENV).toBe('x');
  delete process.env.PORT_TEST_DEVENV;
});
