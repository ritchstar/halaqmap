/**
 * Post-build guard: Vercel (and CI) must ship dist/index.html with build markers
 * and asset query strings from vite.config.ts — catches mis-ordered plugins or stale configs.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'dist', 'index.html'), 'utf8');
const errors = [];
if (!html.includes('name="halaqmap-build-commit"')) {
  errors.push('missing meta halaqmap-build-commit');
}
if (!/\/assets\/[^"']+\.(js|css)\?v=/.test(html)) {
  errors.push('missing ?v= on /assets/*.js or *.css');
}
if (errors.length) {
  console.error('verify-dist-index failed:', errors.join('; '));
  process.exit(1);
}
console.log('verify-dist-index: ok');
