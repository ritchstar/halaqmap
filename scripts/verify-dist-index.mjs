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
if (!html.includes('name="domain-verification"')) {
  errors.push('missing meta domain-verification');
}
const dvMatch = html.match(/name="domain-verification"\s+content="([^"]+)"/);
if (!dvMatch?.[1]?.startsWith('05f735e4039c7d290a5f41d188fdc799')) {
  errors.push('domain-verification content mismatch');
}
const headOpen = html.indexOf('<head>');
const dvPos = html.indexOf('name="domain-verification"');
const buildPos = html.indexOf('name="halaqmap-build-commit"');
if (headOpen >= 0 && dvPos >= 0 && buildPos >= 0 && dvPos > buildPos) {
  errors.push('domain-verification must appear before halaqmap-build-commit in head');
}
if (!/\/assets\/[^"']+\.(js|css)\?v=/.test(html)) {
  errors.push('missing ?v= on /assets/*.js or *.css');
}
if (errors.length) {
  console.error('verify-dist-index failed:', errors.join('; '));
  process.exit(1);
}
console.log('verify-dist-index: ok');
