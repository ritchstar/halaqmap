/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يكتب dist/coiffeur-index.html بوسم اسم موقع كوافير ماب بعد بناء Vite.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyCoiffeurSiteIdentity } from './lib/coiffeurSiteIdentity.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'dist', 'index.html');
const dest = join(root, 'dist', 'coiffeur-index.html');
const html = applyCoiffeurSiteIdentity(readFileSync(source, 'utf8'));
writeFileSync(dest, html, 'utf8');
console.log('[write-coiffeur-share-index] wrote dist/coiffeur-index.html');
