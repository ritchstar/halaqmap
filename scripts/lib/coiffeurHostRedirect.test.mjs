/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'lib', 'coiffeurHostRedirect.ts'),
  'utf8',
);

test('تحويل كوافير لا يسحب مظلة كوافير إلى إقلاع App', () => {
  assert.equal(/from ['"]@\/config\/coiffeurMapUmbrella['"]/.test(src), false);
  assert.equal(/from ['"]@\/config\/partnerLegal['"]/.test(src), false);
  assert.match(src, /coiffeur\.halaqmap\.com/);
});
