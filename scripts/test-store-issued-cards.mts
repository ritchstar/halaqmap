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
  STORE_ISSUED_CARDS_LEGAL_FOLD_TRIGGER_AR,
  STORE_ISSUED_CARDS_LEGAL_SECTIONS,
  STORE_ISSUED_CARDS_LEGAL_TITLE_AR,
  acceptedChecksForTrack,
  consentsForTrack,
  unifiedConsentLabelForTrack,
} from '../src/config/storeIssuedCardsLegal.ts';
import { STORE_BEREAVEMENT_COPY, STORE_BEREAVEMENT_PUBLIC_ENABLED, bereavementShareText } from '../src/config/storeBereavementCopy.ts';
import {
  isAllowedMoyasarInvoiceUrl,
  isOccasionCardLivePaymentsEnabled,
  occasionCardInvoiceAuthorizesPayment,
  occasionCardInvoiceDescription,
  occasionCardInvoiceMetadata,
  occasionCardPaymentMatches,
  parseBereavementBody,
  parsePaidInviteBody,
  STORE_OCCASION_CARD_PRODUCT as apiProduct,
} from '../api/_lib/storeIssuedCards.ts';
import { maskSaudiMobileDisplay } from '../src/lib/maskSaudiMobileDisplay.ts';
import { occasionCardShareHref } from '../src/lib/storeHostRedirect.ts';
import { buildOccasionCardShareCaption } from '../src/lib/storeOccasionCardShare.ts';
import {
  otpDispatchErrorAr,
  extractTwilioErrorCode,
  smsFromLooksLikeWhatsAppSandbox,
  storeIssuedTwilioErrorAr,
  normalizeSmsFrom,
  normalizeWhatsAppFrom,
  resolveWhatsAppFrom,
  resolveWhatsAppOtpContentSid,
  storeIssuedDeliveryProbe,
  storeIssuedOtpBody,
  storeIssuedOtpContentVariables,
  TWILIO_SANDBOX_WHATSAPP_CONTENT_SID,
} from '../api/_lib/storeIssuedWhatsApp.ts';
import { hijriFromIsoDate } from '../api/_lib/gregorianHijri.ts';
import { composeArabMobileDigits } from '../api/_lib/arabMobileDial.ts';
import { eventSignatureSeed, fnv1a } from '../src/lib/storeEventSignature.ts';
import { STORE_OCCASION_CARD_LAB_ENABLED } from '../src/config/storeOccasionCardLab.ts';
import { STORE_LANDING_COPY } from '../src/config/storeFront.ts';
import {
  STORE_WEDDING_LIVE,
  STORE_WEDDING_LIVE_PRICE_SAR,
  STORE_WEDDING_LIVE_PRODUCT,
  STORE_WEDDING_LIVE_PUBLIC_ENABLED,
} from '../src/config/storeWeddingLive.ts';
import { parseYoutubeVideoId, safeMapsHref, weddingCoupleLine, weddingHostInviteLine } from '../src/lib/storeWeddingLiveLab.ts';
import {
  STORE_WEDDING_LIVE_PRICE_HALALAS,
  STORE_WEDDING_LIVE_PRODUCT as apiWeddingProduct,
  weddingLivePaymentMatches,
} from '../api/_lib/storeWeddingLive.ts';

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
assert.equal(
  occasionCardPaymentMatches({
    meta: {},
    token: 'tok_a',
    amount: 1200,
  }),
  false,
);
assert.equal(
  occasionCardInvoiceAuthorizesPayment({
    token: 'tok_a',
    invoiceId: 'inv_1',
    invoiceMeta: { product: 'store_occasion_card', store_card_token: 'tok_a' },
    invoiceAmount: 1200,
    invoicePayments: [{ id: 'pay_1' }],
    paymentId: 'pay_1',
  }),
  true,
);
assert.equal(
  occasionCardInvoiceAuthorizesPayment({
    token: 'tok_a',
    invoiceId: 'inv_1',
    invoiceMeta: { product: 'store_occasion_card', store_card_token: 'tok_a' },
    invoiceAmount: 1200,
    paymentId: 'pay_1',
    paymentInvoiceId: 'inv_1',
  }),
  true,
);
assert.equal(
  occasionCardInvoiceAuthorizesPayment({
    token: 'tok_a',
    invoiceId: 'inv_1',
    invoiceMeta: { product: 'listing_license', store_card_token: 'tok_a' },
    invoiceAmount: 1200,
    invoicePayments: [{ id: 'pay_1' }],
    paymentId: 'pay_1',
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
if (notice.ok) {
  assert.equal(notice.payload.condolenceMode, 'phone');
  assert.deepEqual(notice.payload.condolenceModes, ['phone']);
}

const atHomeNotice = parseBereavementBody({
  phone: '0559602685',
  gender: 'male',
  fullName: 'عبدالله بن محمد',
  mosqueName: 'جامع الراجحي',
  cemeteryName: 'مقبرة النسيم',
  prayerAt: 'بعد عصر الجمعة',
  attestorName: 'محمد',
  mosqueMapUrl: 'https://maps.google.com/?q=mosque',
  cemeteryMapUrl: 'https://maps.google.com/?q=cemetery',
  condolenceMode: 'at_home',
});
assert.equal(atHomeNotice.ok, true);
if (atHomeNotice.ok) {
  assert.equal(atHomeNotice.payload.condolenceMode, 'at_home');
  assert.deepEqual(atHomeNotice.payload.condolenceModes, ['at_home']);
}

const multiNotice = parseBereavementBody({
  phone: '0559602685',
  gender: 'male',
  fullName: 'عبدالله بن محمد',
  mosqueName: 'جامع الراجحي',
  cemeteryName: 'مقبرة النسيم',
  prayerAt: 'بعد عصر الجمعة',
  attestorName: 'محمد',
  condolenceModes: ['phone', 'at_home'],
  deathDate: '2026-08-21',
  kin: [{ name: 'أحمد', relation: 'brother', phone: '0559602685' }],
});
assert.equal(multiNotice.ok, true);
if (multiNotice.ok) {
  assert.deepEqual(multiNotice.payload.condolenceModes, ['phone', 'at_home']);
  assert.equal(multiNotice.payload.kin.length, 1);
  assert.ok(multiNotice.payload.deathDateHijri.length > 0);
}

assert.equal(composeArabMobileDigits('966', '0559602685'), '966559602685');
assert.ok(hijriFromIsoDate('2026-08-21').length > 0);

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
assert.equal(acceptedChecksForTrack('paid').termsRead, true);
assert.equal(acceptedChecksForTrack('paid').paidNoRefund, true);
assert.equal(acceptedChecksForTrack('bereavement').bereavementAttestation, true);
assert.match(unifiedConsentLabelForTrack('paid'), /موافقة|أوافق/);
assert.match(unifiedConsentLabelForTrack('bereavement'), /ذوي المتوفى/);
assert.match(STORE_ISSUED_CARDS_LEGAL_FOLD_TRIGGER_AR, /الشروط والأحكام والتعهدات/);

assert.match(STORE_BEREAVEMENT_COPY.titleAr, /إعلان وفاة/);
assert.match(STORE_BEREAVEMENT_COPY.leadAr, /ليست مناسبة/);
assert.match(STORE_BEREAVEMENT_COPY.condolenceAtHomeAr, /العزاء في المنزل/);
assert.match(bereavementShareText('خالد', 'https://example.com'), /إنا لله/);
assert.doesNotMatch(bereavementShareText('خالد', 'https://example.com'), /أنشئ بطاقتك/);

assert.equal(maskSaudiMobileDisplay('0559602685'), '05••• ••685');

assert.match(legalBlob, /وضع المنصة المعتمد/);
assert.match(legalBlob, /يُربط بفاتورته/);
assert.match(STORE_LANDING_COPY.paidInvitesLeadAr, /12 و29 و59/);
assert.match(STORE_LANDING_COPY.bereavementTitleAr, /الوفاة/);
assert.match(STORE_LANDING_COPY.bereavementFootnoteAr, /بلاغ وفاة/);
assert.equal(STORE_BEREAVEMENT_PUBLIC_ENABLED, false);

const landing = readFileSync(join(root, 'src/pages/store/StoreLanding.tsx'), 'utf8');
assert.match(landing, /paidInvitesTitleAr/);
assert.doesNotMatch(landing, /bereavementFootnoteAr/);

const chrome = readFileSync(join(root, 'src/components/store/StoreChrome.tsx'), 'utf8');
assert.doesNotMatch(chrome, /STORE_BEREAVEMENT/);
assert.doesNotMatch(chrome, /bereavementFootnoteAr/);

const legalHub = readFileSync(join(root, 'src/pages/store/StoreIssuedCardsLegalHub.tsx'), 'utf8');
assert.match(legalHub, /issued-unified-consent/);
assert.match(legalHub, /Collapsible/);
assert.doesNotMatch(legalHub, /issued-\$\{item\.id\}/);
assert.doesNotMatch(legalHub, /track=bereavement/);

assert.match(app, /@\/pages\/store\/StoreIssuedCardsLegalHub/);
assert.match(app, /@\/pages\/store\/StoreBereavementCreatePage/);
assert.match(app, /@\/pages\/store\/StorePaidInviteStudioPage/);
assert.match(app, /path="\/oc\/:token"/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeIssuedCardsLegal['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeBereavementCopy['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeIssuedCardsCatalog['"]/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeOccasionCardLab['"]/);
assert.match(app, /StoreOccasionCardLabPage/);
assert.match(app, /\/store\/invites\/lab/);
assert.equal(STORE_OCCASION_CARD_LAB_ENABLED, true);
assert.equal(
  eventSignatureSeed({ occasion: 'قران', initials: 'ع·ف', dateIso: '2026-09-04', paletteId: 'gold', templateId: 'luxury-classic' }),
  eventSignatureSeed({ occasion: 'قران', initials: 'ع·ف', dateIso: '2026-09-04', paletteId: 'gold', templateId: 'luxury-classic' }),
);
assert.equal(fnv1a('same'), fnv1a('same'));

const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
assert.match(indexHtml, /purpose === 'store_occasion_card'/);
assert.match(indexHtml, /\/pay\/occasion-card\//);
assert.match(indexHtml, /\/oc\//);
assert.match(indexHtml, /store\/invites\/v\//);
assert.match(indexHtml, /if \(purpose === 'store_occasion_card' && storeToken\)/);
assert.match(indexHtml, /store_wedding_live/);
assert.match(indexHtml, /\/pay\/wedding\//);

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
assert.match(api, /occasionCardInvoiceAuthorizesPayment/);
assert.match(api, /action === 'sync_paid'/);
assert.match(api, /sendStoreIssuedOtp/);
assert.match(api, /otp_channel_unconfigured/);
assert.equal(extractTwilioErrorCode('{"code":63015,"message":"not in sandbox"}'), 63015);
assert.equal(extractTwilioErrorCode('prefix {"code": 20003, "status": 401}'), 20003);
assert.match(String(storeIssuedTwilioErrorAr(63015)), /انضمام/);
assert.match(otpDispatchErrorAr(20003), /Twilio/);
assert.match(otpDispatchErrorAr(77777), /77777/);
assert.equal(smsFromLooksLikeWhatsAppSandbox('whatsapp:+14155238886'), true);
assert.equal(smsFromLooksLikeWhatsAppSandbox('+966559602685'), false);
assert.equal(resolveWhatsAppFrom(''), 'whatsapp:+14155238886');
assert.equal(resolveWhatsAppFrom('not-a-phone'), 'whatsapp:+14155238886');
assert.equal(resolveWhatsAppFrom('whatsapp:+14155238886'), 'whatsapp:+14155238886');
assert.equal(normalizeWhatsAppFrom('+14155238886'), 'whatsapp:+14155238886');
assert.equal(normalizeWhatsAppFrom('whatsapp:+14155238886'), 'whatsapp:+14155238886');
assert.equal(normalizeSmsFrom('whatsapp:+14155238886'), '+14155238886');
assert.match(storeIssuedOtpBody('123456'), /123456/);
{
  const prev = process.env.TWILIO_WHATSAPP_OTP_CONTENT_SID;
  delete process.env.TWILIO_WHATSAPP_OTP_CONTENT_SID;
  assert.equal(resolveWhatsAppOtpContentSid(), TWILIO_SANDBOX_WHATSAPP_CONTENT_SID);
  if (prev !== undefined) process.env.TWILIO_WHATSAPP_OTP_CONTENT_SID = prev;
}
assert.match(storeIssuedOtpContentVariables('123456'), /"1":"123456"/);
assert.match(storeIssuedOtpContentVariables('123456'), /"2":"123456"/);
{
  const probe = storeIssuedDeliveryProbe();
  assert.equal(typeof probe.hasSid, 'boolean');
  assert.equal(typeof probe.hasWhatsAppFrom, 'boolean');
  assert.ok(Array.isArray(probe.missing));
}

const moyasarClient = readFileSync(join(root, 'api/_lib/moyasarApiClient.ts'), 'utf8');
assert.match(moyasarClient, /fetchMoyasarPaymentForOccasionCard/);
assert.match(moyasarClient, /moyasar_unreachable/);
assert.match(moyasarClient, /sk_live_/);

const webhook = readFileSync(join(root, 'supabase/functions/moyasar-webhook/index.ts'), 'utf8');
assert.match(webhook, /skipped: "store_occasion_card"/);
assert.match(webhook, /skipped: "store_wedding_live"/);
assert.match(webhook, /store_wedding_live_orders/);

const viewPage = readFileSync(join(root, 'src/pages/store/StorePaidInviteViewPage.tsx'), 'utf8');
assert.match(viewPage, /downloadCtaAr/);
assert.match(viewPage, /whatsappCtaAr/);
assert.match(viewPage, /renderPaidInviteCardPng/);
assert.match(viewPage, /occasionCardShareUrlFromToken/);
assert.doesNotMatch(app, /from ['"]@\/lib\/storePaidInviteCard['"]/);
assert.doesNotMatch(app, /from ['"]@\/lib\/storeOccasionCardShare['"]/);

const shareUrl = occasionCardShareHref('tok_share_example_token12');
assert.match(shareUrl, /^https:\/\/store\.halaqmap\.com\/oc\//);
assert.doesNotMatch(shareUrl, /#/);
const caption = buildOccasionCardShareCaption({
  hostName: 'عبدالله فهد',
  occasionLine: 'جمعة مباركة',
  placeText: 'الرياض',
  shareUrl,
});
assert.match(caption, /جمعة مباركة/);
assert.match(caption, /عبدالله فهد/);
assert.match(caption, /\/oc\//);
assert.doesNotMatch(caption, /#\/store\/invites/);

assert.equal(STORE_WEDDING_LIVE_PUBLIC_ENABLED, true);
assert.equal(STORE_WEDDING_LIVE_PRODUCT, 'store_wedding_live');
assert.equal(STORE_WEDDING_LIVE_PRICE_SAR, 899);
assert.match(STORE_LANDING_COPY.weddingLiveTitleAr, /دعوة زواج/);
assert.match(STORE_LANDING_COPY.weddingLiveLeadAr, /899/);
assert.doesNotMatch(STORE_LANDING_COPY.weddingLiveLeadAr, /12 و29 و59/);
assert.doesNotMatch(STORE_LANDING_COPY.weddingLiveLeadAr, /الوفاة/);
assert.doesNotMatch(STORE_WEDDING_LIVE.leadAr, /12 و29 و59/);
assert.doesNotMatch(STORE_WEDDING_LIVE.leadAr, /store_occasion_card/);
assert.doesNotMatch(STORE_WEDDING_LIVE.kickerAr, /بلا دفع/);
assert.doesNotMatch(STORE_WEDDING_LIVE.leadAr, /لاحقاً/);
assert.match(STORE_WEDDING_LIVE.termsFoldTriggerAr, /شروط/);
assert.match(STORE_WEDDING_LIVE.priceLineAr, /899/);
assert.match(landing, /weddingLiveTitleAr/);
const weddingLanding = readFileSync(join(root, 'src/pages/store/StoreWeddingLandingPage.tsx'), 'utf8');
assert.match(weddingLanding, /live-preview/);
assert.match(weddingLanding, /StoreWeddingLiveStudio/);
assert.match(weddingLanding, /termsFoldTriggerAr/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeWeddingLive['"]/);
assert.match(app, /StoreWeddingLandingPage/);
assert.match(app, /StoreWeddingLabPage/);
assert.match(app, /StoreWeddingHallPage/);
assert.match(app, /\/store\/wedding\/lab/);
assert.match(app, /\/w\/:token\/guest/);
assert.match(app, /StoreWeddingPayPage/);
assert.match(app, /\/pay\/wedding\/:token/);
assert.doesNotMatch(app, /from ['"]@\/lib\/storeWeddingLiveRemote['"]/);
assert.equal(apiWeddingProduct, STORE_WEDDING_LIVE_PRODUCT);
assert.equal(STORE_WEDDING_LIVE_PRICE_HALALAS, 89900);
assert.equal(STORE_WEDDING_LIVE_PRICE_SAR * 100, STORE_WEDDING_LIVE_PRICE_HALALAS);
assert.equal(
  weddingLivePaymentMatches({
    meta: { product: 'store_wedding_live', store_wedding_token: 'tok_w' },
    token: 'tok_w',
    amount: 89900,
  }),
  true,
);
assert.equal(
  weddingLivePaymentMatches({
    meta: { product: 'store_occasion_card', store_wedding_token: 'tok_w' },
    token: 'tok_w',
    amount: 89900,
  }),
  false,
);
assert.equal(
  weddingLivePaymentMatches({
    meta: { product: 'store_wedding_live', store_wedding_token: 'tok_w' },
    token: 'tok_w',
    amount: 5900,
  }),
  false,
);
assert.match(weddingLanding, /StoreWeddingOrderForm/);
assert.equal(parseYoutubeVideoId('https://www.youtube.com/watch?v=aqz-KE-bpKQ'), 'aqz-KE-bpKQ');
assert.ok(safeMapsHref('https://maps.google.com/?q=riyadh'));
assert.equal(safeMapsHref('javascript:alert(1)'), null);
assert.match(weddingCoupleLine({
  hostRole: 'self',
  hostName: 'عائلة الفلان',
  groomName: 'عبدالله',
  brideName: 'كريمة فهد',
  eventDate: '',
  eventTime: '',
  venueName: '',
  venueMapsUrl: '',
  welcomeAr: '',
  youtubeUrl: '',
  youtubeHidden: false,
  announcement: '',
  audioClipId: 'none',
  photoSrc: '',
  panoramaSrc: '',
  cardStyleId: 'gold',
}), /عبدالله وكريمة فهد/);
assert.equal(weddingHostInviteLine({ hostRole: 'self', hostName: 'أحمد' }), 'الداعي أحمد');
assert.equal(weddingHostInviteLine({ hostRole: 'groom_father', hostName: 'أحمد' }), 'والد العريس أحمد');
assert.equal(weddingHostInviteLine({ hostRole: 'bride_father', hostName: 'فهد' }), 'والد العروس فهد');

const vercel = readFileSync(join(root, 'vercel.json'), 'utf8');
assert.match(vercel, /\/oc\/:token/);
assert.match(vercel, /public-store-occasion-card/);

const shareApi = readFileSync(join(root, 'api/public-store-occasion-card.ts'), 'utf8');
assert.match(shareApi, /og:title/);
assert.match(shareApi, /whatsapp/);
assert.match(shareApi, /STORE_ISSUED_CARDS_TABLE/);

console.log('store-issued-cards: ok');
