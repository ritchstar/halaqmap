/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يرمّز ملف App Store Connect API Key (.p8) إلى base64 لـ GitHub Secret.
 * Usage: node scripts/encode-asc-api-key.mjs path/to/AuthKey_XXX.p8
 *
 * لا تطبع المخرجات في سجلات عامة إن أمكن — الصق الناتج في Secret فقط.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/encode-asc-api-key.mjs AuthKey_XXXXXXXXXX.p8');
  process.exit(1);
}

const abs = resolve(input);
const buf = readFileSync(abs);
const b64 = buf.toString('base64');
process.stdout.write(b64);
process.stderr.write(
  `\n\n[ok] ${buf.length} bytes → base64 (${b64.length} chars). Paste into APP_STORE_CONNECT_KEY_BASE64.\n`,
);
