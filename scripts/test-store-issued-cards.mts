/**
 * فحص مرجع البطاقات المدفوعة وبلاغات الوفاة: الأسعار، العزل، والسياسات.
 * تشغيل: npx tsx scripts/test-store-issued-cards.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_PAID_INVITE_CHECKOUT_ENABLED,
  STORE_PAID_INVITE_PRICES_SAR,
  STORE_PAID_INVITE_TEMPLATES,
  priceHalalasForTemplate,
  priceSarForTemplate,
} from '../src/config/storeIssuedCardsCatalog.ts';
import {
  STORE_ISSUED_CARDS_LEGAL_SECTIONS,
  STORE_ISSUED_CARDS_LEGAL_TITLE_AR,
  consentsForTrack,
} from '../src/config/storeIssuedCardsLegal.ts';
import { STORE_BEREAVEMENT_COPY, bereavementShareText } from '../src/config/storeBereavementCopy.ts';
import { parseBereavementBody, parsePaidInviteBody } from '../api/_lib/storeIssuedCards.ts';
import { maskSaudiMobileDisplay } from '../src/lib/maskSaudiMobileDisplay.ts';
import { STORE_LANDING_COPY } from '../src/config/storeFront.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const legalBlob = STORE_ISSUED_CARDS_LEGAL_SECTIONS.map((s) => `${s.title}\n${s.content}`).join('\n');

assert.equal(STORE_PAID_INVITE_CHECKOUT_ENABLED, false);
assert.equal(STORE_PAID_INVITE_TEMPLATES.length, 12);
assert.equal(STORE_PAID_INVITE_PRICES_SAR.quick, 12);
assert.equal(STORE_PAID_INVITE_PRICES_SAR.featured, 29);
assert.equal(STORE_PAID_INVITE_PRICES_SAR.luxury, 59);
assert.equal(priceSarForTemplate('luxury-wedding'), 59);
assert.equal(priceHalalasForTemplate('season-short'), 1200);
assert.equal(priceSarForTemplate('personal-birthday'), 29);

const paid = parsePaidInviteBody({
  templateId: 'luxury-wedding',
  hostName: 'عائلة أحمد',
  occasionLine: 'حفل قران',
});
assert.equal(paid.ok, true);
if (paid.ok) assert.equal(paid.priceHalalas, 5900);

const cheapWedding = parsePaidInviteBody({
  templateId: 'luxury-wedding',
  hostName: 'عائلة أحمد',
  priceHalalas: 1200,
});
assert.equal(cheapWedding.ok, true);
if (cheapWedding.ok) assert.equal(cheapWedding.priceHalalas, 5900);

const notice = parseBereavementBody({
  phone: '0559602685',
  gender: 'male',
  fullName: 'عبدالله بن محمد',
  mosqueName: 'جامع الراجحي',
  cemeteryName: 'مقبرة النسيم',
  prayerAt: 'بعد عصر الجمعة',
  attestorName: 'محمد',
  mosqueMapUrl: 'https://maps.google.com/?q=mosque',
});
assert.equal(notice.ok, true);

const homeMapsOk = parseBereavementBody({
  phone: '0559602685',
  gender: 'male',
  fullName: 'عبدالله بن محمد',
  mosqueName: 'جامع',
  cemeteryName: 'مقبرة',
  prayerAt: 'العصر',
  attestorName: 'محمد',
  mosqueMapUrl: 'javascript:alert(1)',
});
assert.equal(homeMapsOk.ok, false);

assert.match(STORE_ISSUED_CARDS_LEGAL_TITLE_AR, /شروط وأحكام وخصوصية/);
assert.match(legalBlob, /12/);
assert.match(legalBlob, /29/);
assert.match(legalBlob, /59/);
assert.match(legalBlob, /bereavement-notices/);
assert.match(legalBlob, /اسم المسجد/);
assert.match(legalBlob, /اسم المقبرة/);
assert.match(legalBlob, /ما لا نجمعه في النسخة الأولى/);
assert.match(legalBlob, /نظام حماية البيانات الشخصية/);
assert.match(legalBlob, /ميسر/);
assert.doesNotMatch(legalBlob, /المؤسس/);
assert.match(legalBlob, /الإدارة/);
assert.match(legalBlob, /لا يُكتب عنوان منزل/);
assert.equal(consentsForTrack('bereavement').some((c) => c.id === 'bereavementAttestation'), true);
assert.equal(consentsForTrack('paid').some((c) => c.id === 'paidNoRefund'), true);

assert.match(STORE_BEREAVEMENT_COPY.titleAr, /إعلان وفاة/);
assert.match(STORE_BEREAVEMENT_COPY.leadAr, /ليست مناسبة/);
assert.match(bereavementShareText('خالد', 'https://example.com'), /إنا لله/);
assert.doesNotMatch(bereavementShareText('خالد', 'https://example.com'), /أنشئ بطاقتك/);

assert.equal(maskSaudiMobileDisplay('0559602685'), '05••• ••685');

assert.match(legalBlob, /يُربط بفاتورته/);
assert.match(STORE_LANDING_COPY.paidInvitesLeadAr, /12 و29 و59/);
assert.match(STORE_LANDING_COPY.bereavementTitleAr, /الوفاة/);

assert.match(app, /@\/pages\/store\/StoreIssuedCardsLegalHub/);
assert.match(app, /@\/pages\/store\/StoreBereavementCreatePage/);
assert.match(app, /@\/pages\/store\/StorePaidInviteStudioPage/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeIssuedCardsLegal['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeBereavementCopy['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeIssuedCardsCatalog['"]/);

console.log('store-issued-cards: ok');
