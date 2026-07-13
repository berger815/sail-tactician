import { readFile } from 'node:fs/promises';

const [built, committed] = await Promise.all([
  readFile(new URL('../dist/tactician-core.iife.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/generated/tactician-core.js', import.meta.url), 'utf8'),
]);

if (built.trimEnd() !== committed.trimEnd()) {
  throw new Error('Generated browser core is stale. Rebuild and update src/generated/tactician-core.js.');
}

console.log('Browser core matches the tested source modules');
