/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يكتب dist/store-index.html بوسم مشاركة المتجر بعد بناء Vite.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyStoreShareMeta } from './lib/storeShareMeta.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'dist', 'index.html');
const dest = join(root, 'dist', 'store-index.html');
const html = applyStoreShareMeta(readFileSync(source, 'utf8'));
writeFileSync(dest, html, 'utf8');
console.log('[write-store-share-index] wrote dist/store-index.html');
