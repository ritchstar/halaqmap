/**
 * فحص كروت واجهة المتجر: المسميات، الترميز، وعزل App عن كتالوج الكروت.
 * تشغيل: npx tsx scripts/test-store-intro-card.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_INTRO_CARD_COPY,
  STORE_INTRO_CARD_ROLES,
  storeIntroCardCta,
  storeIntroCardPitch,
} from '../src/config/storeIntroCardCopy.ts';
import {
  decodeStoreIntroCardToken,
  encodeStoreIntroCardToken,
} from '../src/lib/storeIntroCardShare.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const studio = readFileSync(join(root, 'src/pages/store/StoreIntroCardStudioPage.tsx'), 'utf8');
const preview = readFileSync(join(root, 'src/components/store/StoreIntroCardPreview.tsx'), 'utf8');

assert.deepEqual(
  STORE_INTRO_CARD_ROLES.map((item) => item.labelAr),
  [
    'المالك',
    'المدير العام للتسويق والمبيعات',
    'رئيس مجموعة تسويقية',
    'رئيسة مجموعة تسويقية',
    'مسوق',
    'مسوقة',
    'عضوية فخرية',
  ],
);

const token = encodeStoreIntroCardToken('فهد العتيبي', 'المدير العام للتسويق والمبيعات');
assert.ok(token);
assert.match(token, /^[A-Za-z0-9_-]+$/);
assert.deepEqual(decodeStoreIntroCardToken(token), {
  name: 'فهد العتيبي',
  role: 'المدير العام للتسويق والمبيعات',
});
assert.equal(decodeStoreIntroCardToken('abc'), null);

assert.equal(storeIntroCardCta('مسوقة'), STORE_INTRO_CARD_COPY.ctaFemale);
assert.equal(storeIntroCardCta('المالك'), STORE_INTRO_CARD_COPY.cta);
assert.equal(storeIntroCardPitch('عضوية فخرية').kicker, 'عضوية فخرية');
assert.equal(storeIntroCardPitch('رئيس مجموعة تسويقية').kicker, 'المجموعة التسويقية');
assert.match(STORE_INTRO_CARD_COPY.headline, /واجهة المتجر/);
assert.doesNotMatch(JSON.stringify(STORE_INTRO_CARD_COPY), /store_occasion_card|كاردي8|كوافير ماب/);

assert.match(app, /@\/pages\/store\/StoreIntroCardStudioPage/);
assert.match(app, /@\/pages\/store\/StoreIntroCardViewPage/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeIntroCardCopy['"]/);
assert.doesNotMatch(app, /from ['"]@\/lib\/storeIntroCard['"]/);
assert.doesNotMatch(studio, /coiffeurIntroCard|CoiffeurIntroCard/);
assert.match(preview, /data-bidi="off"/);
assert.match(preview, /storeIntroCardCenteredNameClass/);

console.log('store-intro-card: ok');
