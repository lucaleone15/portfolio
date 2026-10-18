import fs from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { loadEnv } from 'vite';

/**
 * Environment for `npm run dev` / `vite preview`: every variable of the .env files (not only
 * VITE_*), then the real environment on top. Values are taken as written: Vite would expand
 * "$…" as variables, which breaks values containing "$" (the admin's password hash, a mail
 * password). The production server reads .env the same way (process.loadEnvFile).
 */
export function devEnv(mode: string, root: string): Record<string, string> {
  const fromVite = loadEnv(mode, root, '');
  const literal: Record<string, string> = {};
  for (const name of ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`]) {
    try {
      Object.assign(literal, parseEnv(fs.readFileSync(path.join(root, name), 'utf8')));
    } catch {
      // no such file
    }
  }
  return { ...fromVite, ...literal, ...(process.env as Record<string, string>) };
}
