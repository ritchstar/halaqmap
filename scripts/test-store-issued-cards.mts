/**
 * فحص مرجع البطاقات المدفوعة وبلاغات الوفاة: الأسعار، العزل، والسياسات.
 * تشغيل: npx tsx scripts/test-store-issued-cards.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_OCCASION_CARD_PRODUCT,
  STORE_PAID_INVITE_CHECKOUT_ENABLED,
  STORE_PAID_INVITE_COPY,
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
import {
  isAllowedMoyasarInvoiceUrl,
  isOccasionCardLivePaymentsEnabled,
  occasionCardInvoiceDescription,
  occasionCardInvoiceMetadata,
  occasionCardPaymentMatches,
  parseBereavementBody,
  parsePaidInviteBody,
  STORE_OCCASION_CARD_PRODUCT as apiProduct,
} from '../api/_lib/storeIssuedCards.ts';
import { maskSaudiMobileDisplay } from '../src/lib/maskSaudiMobileDisplay.ts';
import { STORE_LANDING_COPY } from '../src/config/storeFront.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const legalBlob = STORE_ISSUED_CARDS_LEGAL_SECTIONS.map((s) => `${s.title}\n${s.content}`).join('\n');

assert.match(STORE_PAID_INVITE_COPY.downloadCtaAr, /تحميل/);
assert.match(STORE_PAID_INVITE_COPY.copyLinkCtaAr, /رابط/);
assert.equal(STORE_PAID_INVITE_CHECKOUT_ENABLED, true);
assert.equal(STORE_OCCASION_CARD_PRODUCT, 'store_occasion_card');
assert.equal(apiProduct, STORE_OCCASION_CARD_PRODUCT);
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

assert.equal(
  occasionCardPaymentMatches({
    meta: { product: 'store_occasion_card', store_card_token: 'tok_a' },
    token: 'tok_a',
    amount: 1200,
  }),
  true,
);
assert.equal(
  occasionCardPaymentMatches({
    meta: { product: 'listing_license', store_card_token: 'tok_a' },
    token: 'tok_a',
    amount: 1200,
  }),
  false,
);
assert.equal(
  occasionCardPaymentMatches({
    meta: { product: 'store_occasion_card', store_card_token: 'tok_a' },
    token: 'tok_a',
    amount: 119900,
  }),
  false,
);

assert.equal(isAllowedMoyasarInvoiceUrl('https://checkout.moyasar.com/invoices/abc'), true);
assert.equal(isAllowedMoyasarInvoiceUrl('https://api.moyasar.com/v1/invoices/abc'), false);
assert.equal(occasionCardInvoiceDescription('quick'), 'halaqmap — بطاقة مناسبة — سريعة');
assert.equal(occasionCardInvoiceMetadata({ token: 'tok_a', tier: 'featured', templateId: 'personal-eid' }).product, 'store_occasion_card');
assert.equal(occasionCardInvoiceMetadata({ token: 'tok_a', tier: 'featured', templateId: 'personal-eid' }).tier, 'featured');

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

assert.match(legalBlob, /وضع المنصة المعتمد/);
assert.match(legalBlob, /يُربط بفاتورته/);
assert.match(STORE_LANDING_COPY.paidInvitesLeadAr, /12 و29 و59/);
assert.match(STORE_LANDING_COPY.bereavementTitleAr, /الوفاة/);

assert.match(app, /@\/pages\/store\/StoreIssuedCardsLegalHub/);
assert.match(app, /@\/pages\/store\/StoreBereavementCreatePage/);
assert.match(app, /@\/pages\/store\/StorePaidInviteStudioPage/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeIssuedCardsLegal['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeBereavementCopy['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeIssuedCardsCatalog['"]/);

const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
assert.match(indexHtml, /purpose === 'store_occasion_card'/);
assert.match(indexHtml, /\/pay\/occasion-card\//);
assert.match(indexHtml, /if \(purpose === 'store_occasion_card' && storeToken\)/);

assert.equal(isOccasionCardLivePaymentsEnabled(), false);

const payPage = readFileSync(join(root, 'src/pages/store/StorePaidInvitePayPage.tsx'), 'utf8');
assert.match(payPage, /store_card_token/);
assert.match(payPage, /STORE_OCCASION_CARD_PRODUCT/);
assert.match(payPage, /isOccasionCardPaymentReturn/);
assert.match(payPage, /تعذر التحقق من الدفع/);
assert.match(payPage, /activateOnceRef\.current = false/);
assert.match(payPage, /مفتاح ميسر الحيّ/);

const studio = readFileSync(join(root, 'src/pages/store/StorePaidInviteStudioPage.tsx'), 'utf8');
assert.match(studio, /invoiceUrl/);
assert.match(studio, /occasionCardLivePaymentsEnabled/);

const api = readFileSync(join(root, 'api/public-store-issued-cards.ts'), 'utf8');
assert.match(api, /createMoyasarInvoice/);
assert.match(api, /fetchMoyasarPaymentForOccasionCard/);
assert.match(api, /fetchMoyasarInvoiceForOccasionCard/);
assert.match(api, /action === 'sync_paid'/);

const moyasarClient = readFileSync(join(root, 'api/_lib/moyasarApiClient.ts'), 'utf8');
assert.match(moyasarClient, /fetchMoyasarPaymentForOccasionCard/);
assert.match(moyasarClient, /moyasar_unreachable/);
assert.match(moyasarClient, /sk_live_/);

const webhook = readFileSync(join(root, 'supabase/functions/moyasar-webhook/index.ts'), 'utf8');
assert.match(webhook, /skipped: "store_occasion_card"/);

const viewPage = readFileSync(join(root, 'src/pages/store/StorePaidInviteViewPage.tsx'), 'utf8');
assert.match(viewPage, /downloadCtaAr/);
assert.match(viewPage, /renderPaidInviteCardPng/);
assert.doesNotMatch(app, /from ['"]@\/lib\/storePaidInviteCard['"]/);

console.log('store-issued-cards: ok');
