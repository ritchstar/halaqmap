/**
 * فحص خلفية كرت الدعوة: كل ستايل بصورته، بلا html2canvas وبلا كوافير ماب.
 * تشغيل: npx tsx scripts/test-invite-card-download.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_EVENT_LIVE_STYLES } from '../src/config/storeEventLive.ts';
import { STORE_WEDDING_LIVE_STYLES } from '../src/config/storeWeddingLive.ts';
import { inviteCardPhotoSrc } from '../src/lib/downloadInviteCardAsPng.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

assert.equal(
  inviteCardPhotoSrc('/images/store/lab/lab-luxury-rosegold.png', '/images/store/lab/lab-luxury-pearl.png'),
  '/images/store/lab/lab-luxury-pearl.png',
);
assert.equal(
  inviteCardPhotoSrc('data:image/png;base64,aaa', '/images/store/lab/lab-luxury-pearl.png'),
  'data:image/png;base64,aaa',
);

const pearl = STORE_EVENT_LIVE_STYLES.find((item) => item.id === 'pearl');
const rose = STORE_EVENT_LIVE_STYLES.find((item) => item.id === 'rosegold');
assert.equal(pearl?.image, '/images/store/lab/lab-luxury-pearl.jpg');
assert.equal(rose?.image, '/images/store/lab/lab-luxury-rosegold.jpg');
assert.equal(
  STORE_WEDDING_LIVE_STYLES.find((item) => item.id === 'pearl')?.image,
  pearl?.image,
);

const downloadLib = readFileSync(join(root, 'src/lib/downloadInviteCardAsPng.ts'), 'utf8');
assert.doesNotMatch(downloadLib, /from ['"]html2canvas['"]/);
assert.doesNotMatch(downloadLib, /كوافير|coiffeur/i);
assert.match(downloadLib, /from ['"]@\/lib\/savePngBlob['"]/);
assert.match(downloadLib, /loadSameOriginImage/);
assert.match(downloadLib, /8000/);
assert.doesNotMatch(downloadLib, /revokeObjectURL\(url\), 1500/);
assert.match(
  readFileSync(join(root, 'src/lib/storePaidInviteCard.ts'), 'utf8'),
  /from ['"]@\/lib\/savePngBlob['"]/,
);
assert.match(
  readFileSync(join(root, 'src/lib/storeGreetingCard.ts'), 'utf8'),
  /from ['"]@\/lib\/savePngBlob['"]/,
);
assert.match(
  readFileSync(join(root, 'src/lib/downloadElementAsPngCard.ts'), 'utf8'),
  /from ['"]@\/lib\/savePngBlob['"]/,
);

for (const file of [
  'src/components/store/StoreEventHostPanel.tsx',
  'src/components/store/StoreWeddingHostPanel.tsx',
]) {
  const src = readFileSync(join(root, file), 'utf8');
  assert.doesNotMatch(src, /stillRef|html2canvas|opacity-0/);
  assert.match(src, /photoSrc: style\.image/);
}

console.log('invite-card-download: ok');
