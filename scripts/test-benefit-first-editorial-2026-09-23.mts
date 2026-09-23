/**
 * تذكرة A — تحديث تحريري «الفائدة أولاً» (2026-09-23).
 * يثبت النصوص المعتمدة حرفياً، وبقاء وجهة الأزرار، وغياب خطوات التسجيل المرفوضة.
 *
 * تشغيل: node --experimental-strip-types scripts/test-benefit-first-editorial-2026-09-23.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

const pathContent = read('src/config/storeProductPathContent.ts');
const catalog = read('src/config/storeSolutionCatalog.ts');
const adapter = read('src/lib/storeProductPathAdapter.ts');
const partners = read('src/pages/PartnersB2BLanding.tsx');
const partnerCopy = read('src/config/partnerMallNarrativeCopy.ts');
const coiffeurCopy = read('src/config/coiffeurMapUmbrella.ts');
const coiffeurPage = read('src/pages/coiffeur/CoiffeurPartnersLanding.tsx');
const registration = read('src/components/RegistrationForm.tsx');

assert.match(pathContent, /headlineAr: 'حوّل رسائل الحي إلى طلبات أوضح'/);
assert.match(pathContent, /ctaLabelAr: 'شغّل تموينات الحي'/);
assert.match(pathContent, /اعرض السلع المتاحة في صفحة واحدة/);
assert.match(pathContent, /حدّث ما تريد إظهاره لعملاء الحي/);
assert.match(pathContent, /اجعل وصول الطلب ومراجعته أكثر ترتيباً من الرسائل المتفرقة/);
assert.match(pathContent, /headlineAr: 'حوّل دعوتك إلى تجربة يعيشها ضيوفك'/);
assert.match(pathContent, /ctaLabelAr: 'افتح تجربة حفلك'/);
assert.match(pathContent, /اجمع تفاصيل المناسبة في وجهة واحدة/);
assert.match(pathContent, /اعرض رسائل الضيوف على شاشة القاعة وفق ما يتاح في إعدادات الحفل/);
assert.doesNotMatch(pathContent, /تشغيل الشاشات|إدارة محتوى الشاشة/);
assert.match(pathContent, /هل المنتج وسيط على مبيعاتي؟/);
assert.match(pathContent, /لا نقتطع عمولة من مهنتك أو من بيعك/);
assert.match(pathContent, /ليست عمولة لخريطة الحل على المبيعات/);
assert.doesNotMatch(pathContent, /دون رسوم|مدفوعات مجانية/);
assert.match(pathContent, /faq: faqFor\('B-01'\)/);
assert.match(pathContent, /faq: faqFor\('B-02'\)/);
assert.match(pathContent, /faq: faqFor\('C-01'\)/);
assert.match(pathContent, /faq: faqFor\('B-06'\)/);
assert.match(pathContent, /faq: faqFor\('C-02'\)/);
assert.doesNotMatch(pathContent, /faq: faqFor\('D-01'\)|faq: faqFor\('D-02'\)|faq: faqFor\('D-03'\)|faq: faqFor\('E-01'\)|faq: faqFor\('A-01'\)/);

const grocersBlock = catalog.slice(catalog.indexOf("code: 'B-02'"), catalog.indexOf("code: 'B-03'"));
assert.match(grocersBlock, /حوّل رسائل الحي إلى طلبات أوضح/);
assert.doesNotMatch(grocersBlock, /سلة|كاشير|مفتوح الآن/);
assert.match(grocersBlock, /STORE_GROCERS/);

const weddingBlock = catalog.slice(catalog.indexOf("code: 'D-02'"), catalog.indexOf("code: 'D-03'"));
assert.match(weddingBlock, /حوّل دعوتك إلى تجربة يعيشها ضيوفك/);
assert.match(weddingBlock, /STORE_WEDDING/);
assert.doesNotMatch(weddingBlock, /تشغيل الشاشات|إدارة محتوى الشاشة/);

assert.match(adapter, /editorial\.headlineAr \?\? `مسار \$\{product\.nameAr\}`/);
assert.match(adapter, /ctaLabelFor\(product, editorial\.ctaLabelAr\)/);
assert.match(adapter, /path\.titleAr/);

assert.match(partnerCopy, /ليصل عميلك إلى صالونك وهو يعرف أين يذهب/);
assert.match(partnerCopy, /ابدأ طلب الشراكة/);
assert.match(partnerCopy, /شاهد ما يحصل عليه الصالون/);
assert.match(partnerCopy, /حضور أوضح للعميل/);
assert.match(partnerCopy, /ولا يضمن حجوزات أو مبيعات أو ترتيباً في البحث/);
assert.match(partners, /to=\{ROUTE_PATHS\.REGISTER\}/);
assert.match(partners, /PARTNER_MALL_HERO_CTA_PRIMARY_AR/);
assert.match(partners, /getElementById\('benefits'\)/);
assert.doesNotMatch(partners, /href=["']#["']/);
assert.match(partners, /PARTNER_MALL_BOUNDARY_AR/);
assert.doesNotMatch(partners, /مراجعة الجاهزية|استلام مسار التفعيل/);

assert.match(coiffeurCopy, /ليصل إلى صالونك من تبحث عن خدمتك بوضوح/);
assert.match(coiffeurCopy, /registerCta: 'ابدئي طلب الانضمام'/);
assert.match(coiffeurCopy, /secondaryCta: 'شاهدي ما تحصل عليه الشريكة'/);
assert.match(coiffeurCopy, /قدّمي نشاطك بوضوح/);
assert.match(coiffeurCopy, /اجعلي الوصول أسهل/);
assert.match(coiffeurCopy, /حافظي على حضورك/);
assert.match(coiffeurCopy, /ولا يعد بنتيجة أو حجز مضمون/);
assert.match(coiffeurPage, /to=\{ROUTE_PATHS\.COIFFEUR_REGISTER\}/);
assert.match(coiffeurPage, /to=\{ROUTE_PATHS\.COIFFEUR_MARKETING\}/);
assert.match(coiffeurPage, /COIFFEUR_PARTNERS_COPY\.boundary/);
assert.doesNotMatch(coiffeurCopy, /مراجعة الجاهزية|استلام مسار التفعيل/);

assert.doesNotMatch(registration, /مراجعة الجاهزية|استلام مسار التفعيل/);
assert.doesNotMatch(`${pathContent}\n${partnerCopy}\n${coiffeurCopy}`, /نضمن|منافس/);

const intro = read('src/components/store/paths/PathsPlatformIntro.tsx');
const card = read('src/components/store/paths/ProductPathCard.tsx');
const benefit = read('src/config/storePathBenefitUse.ts');
const features = read('src/components/partner/PartnerB2BVisualFeatureCards.tsx');
assert.match(intro, /أنت تقود المنتج/);
assert.match(intro, /المنتج لا يتحرك من تلقاء نفسه؛ أنت من يقوده/);
assert.match(intro, /منتجاتنا لا تتحرك من تلقاء نفسها/);
assert.match(intro, /خريطة الحل لا تبيع نتائج جاهزة/);
assert.match(intro, /صفحة تحمل اسم نشاطك/);
assert.match(card, /نشاطك هو الوجهة، والمنتج هو الطريق/);
assert.doesNotMatch(card, /ليست بطاقة داخل قائمة عامة/);
assert.match(benefit, /شارك الرابط والرمز مع عملائك/);
assert.match(benefit, /شارك رابط الدعوة، وستظهر تهاني ضيوفك على شاشة القاعة/);
assert.match(benefit, /فعّل شاشات اللاونج وأدر محتواها لضيوفك/);
assert.match(benefit, /شارك بطاقتك عبر رابط مباشر لمن تريد تهنئته/);
assert.match(benefit, /تظهر لعميلك عند استعلامه القريب، ويصله إليك مباشرة/);
assert.match(benefit, /تسهيل عودة العميل/);
assert.doesNotMatch(benefit, /عميل دائم|رابط على التغليف|إعادة الطلب/);
assert.match(features, /id="benefits"/);
assert.doesNotMatch(read('src/components/store/paths/PathStartGainsSection.tsx'), /تطبيق/);

console.log('benefit-first editorial: ok');
