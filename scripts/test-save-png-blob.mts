/**
 * فحص مسار حفظ PNG: آيفون يفتح الصورة، وسطح المكتب ينزّل.
 * تشغيل: npx tsx scripts/test-save-png-blob.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  isIosLikeUserAgent,
  pngSaveStrategy,
  safePngFileName,
} from '../src/lib/savePngBlob.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const saver = readFileSync(join(root, 'src/lib/savePngBlob.ts'), 'utf8');

assert.equal(isIosLikeUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'), true);
assert.equal(isIosLikeUserAgent('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)'), true);
assert.equal(isIosLikeUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel', 5), true);
assert.equal(isIosLikeUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Win32', 0), false);
assert.equal(isIosLikeUserAgent('Mozilla/5.0 (Linux; Android 14)', 'Linux armv8l', 5), false);

assert.equal(
  pngSaveStrategy({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    preferShare: false,
  }),
  'open',
);
assert.equal(
  pngSaveStrategy({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    preferShare: false,
  }),
  'download',
);
assert.equal(
  pngSaveStrategy({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    preferShare: true,
  }),
  'share',
);

assert.equal(safePngFileName('afrahi-pearl.png'), 'afrahi-pearl.png');
assert.equal(safePngFileName('كرت افراحي'), 'halaqmap-card.png');
assert.match(safePngFileName(''), /halaqmap-card\.png/);

assert.match(saver, /hm-png-save-overlay/);
assert.match(saver, /اضغط الصورة مطولاً ثم احفظها في الجهاز/);
assert.doesNotMatch(saver, /revokeObjectURL\(url\), 1500/);
assert.doesNotMatch(app, /from ['"]@\/lib\/savePngBlob['"]/);
assert.doesNotMatch(app, /from ['"]@\/lib\/storeIntroCard['"]/);
assert.doesNotMatch(app, /from ['"]@\/lib\/downloadInviteCardAsPng['"]/);

console.log('save-png-blob: ok');
