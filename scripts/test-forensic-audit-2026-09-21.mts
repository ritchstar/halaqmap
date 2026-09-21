/**
 * فحص جنائي شامل لمنصة حلاق ماب (٢٠٢٦-٠٩-٢١) — تحقّق من مجموعة إصلاحات
 * اكتُشفت عبر مراجعة موازية شاملة للكود (٦ أوجه: React Hooks، الأمان،
 * الدفع/البلوت، SEO/الإتاحة/الأداء، نظافة الكود، صحة CI/TypeScript).
 *
 * هذا الملف يغطي فقط الإصلاحات القابلة للتحقق بلا حزم npm خارجية (قراءة
 * نصية أو استيراد ملفات تكوين نقية). الإصلاحات داخل ملفات .tsx تُفحص عبر
 * قراءة المصدر والتأكد من النمط الصحيح، لا عبر التنفيذ الفعلي (React غير
 * مثبَّت في هذه البيئة).
 *
 * تشغيل: npx tsx scripts/test-forensic-audit-2026-09-21.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isStoreProductLandingPath } from '../src/lib/storeHmTube.ts';
import { STORE_SHOP_HOURS_COPY } from '../src/config/storeShopHours.ts';
import { STORE_GROCERS_LIVE } from '../src/config/storeGrocersLive.ts';
import { STORE_RESTAURANT_LIVE } from '../src/config/storeRestaurantLive.ts';
import { STORE_MAIL_PRODUCT_ICONS } from '../src/config/storeMailIcons.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ١) حلانا1 وبخورنا1 كانا مفقودين من PRODUCT_LANDING_ROOTS رغم كونهما صفحتي
//    منتج فعليتين — يخفي علامة "مشاهدة المتجر" ويُبقي تخطيط الجوال الكامل
//    بدل المضغوط في StoreVisitorEngage على هاتين الصفحتين تحديداً.
assert.equal(isStoreProductLandingPath('/store/halana'), true, 'حلانا1 يجب أن تُعامَل كصفحة منتج');
assert.equal(isStoreProductLandingPath('/store/bakhurna'), true, 'بخورنا1 يجب أن تُعامَل كصفحة منتج');
assert.equal(isStoreProductLandingPath('/store/halana/anything'), true);
assert.equal(isStoreProductLandingPath('/store/bakhurna/anything'), true);

// ٢) بنر "الاستقبال متوقف" كان يعرض مربعاً فارغاً بلا نص (مفتاح غير موجود)
//    في ٧ واجهات متجر (بخورنا1/طبختنا1/خضارنا1/تمويناتا1/مطعمنا1/كافينا1/تمرتنا1).
assert.equal(
  typeof STORE_SHOP_HOURS_COPY.pauseVisitorAr,
  'string',
  'يجب أن يوجد نص pauseVisitorAr — كان غائباً فيظهر مربع تنبيه فارغ بلا رسالة',
);
assert.ok(STORE_SHOP_HOURS_COPY.pauseVisitorAr.length > 0);

// ٣) ملاحظة "السعر تقديري" كانت غائبة في ٨ مواضع عبر صفحتي تمويناتا1
//    ومطعمنا1 تحديداً (بخلاف بقية منتجات الحي التي تملكها أصلاً).
assert.equal(typeof STORE_GROCERS_LIVE.priceEstimateNoteAr, 'string');
assert.equal(typeof STORE_RESTAURANT_LIVE.priceEstimateNoteAr, 'string');

// ٤) بخورنا1 كان غائباً كلياً من شبكة أيقونات روابط المسوّقين (لا أيقونة،
//    لا رابط) رغم كونه منتجاً فعلياً له صفحة وسعر واشتراك.
assert.ok(
  STORE_MAIL_PRODUCT_ICONS.some((item) => item.id === 'bakhurna'),
  'يجب أن تملك بخورنا1 أيقونة في شبكة روابط المسوّقين مثل بقية المنتجات',
);

// ٥) AdminDashboard.tsx كان يستورد SubscriptionTier مرتين (من @/lib و
//    @/lib/index — نفس الوحدة) — خطأ "Duplicate identifier" حقيقي يفشل به
//    بناء الإنتاج فعلياً (وليس فقط فحص أنماط).
const adminDashboardSrc = readFileSync(join(root, 'src/pages/AdminDashboard.tsx'), 'utf8');
const subscriptionTierImportCount = (adminDashboardSrc.match(/^import\s*\{[^}]*\bSubscriptionTier\b[^}]*\}\s*from/gm) || []).length;
assert.equal(
  subscriptionTierImportCount,
  1,
  'SubscriptionTier يجب أن يُستورد مرة واحدة فقط في AdminDashboard.tsx',
);
assert.doesNotMatch(adminDashboardSrc, /from ['"]@\/lib\/index['"]/, 'لا حاجة لاستيراد من @/lib/index بعد الآن');

// ٦) storeShopPlace.ts كان يستورد النوع StoreVendorMode من @/lib/storeMobileVendor
//    رغم أن هذه الوحدة لا تُصدِّره (تستورده فقط داخلياً من @/config/storeMobileVendor)
//    — خطأ TS2459 حقيقي (Module declares X locally, but it is not exported).
const storeShopPlaceSrc = readFileSync(join(root, 'src/lib/storeShopPlace.ts'), 'utf8');
assert.doesNotMatch(
  storeShopPlaceSrc,
  /type StoreVendorMode[^}]*\}\s*from ['"]@\/lib\/storeMobileVendor['"]/s,
  'StoreVendorMode لا يُصدَّر من lib/storeMobileVendor — يجب استيراده من config/storeMobileVendor',
);
assert.match(storeShopPlaceSrc, /import type \{ StoreVendorMode \} from ['"]@\/config\/storeMobileVendor['"]/);

// ٧) نفس النمط في StoreLiveActivityCartShop.tsx مع StoreShopHoursState.
const cartShopSrc = readFileSync(
  join(root, 'src/components/store/live/StoreLiveActivityCartShop.tsx'),
  'utf8',
);
assert.doesNotMatch(
  cartShopSrc,
  /type StoreShopHoursState[^}]*\}\s*from ['"]@\/lib\/storeShopHours['"]/s,
);
assert.match(cartShopSrc, /import type \{ StoreShopHoursState \} from ['"]@\/config\/storeShopHours['"]/);

// ٨) صور بطاقة "أضف للسلة" في واجهات الحي كانت alt="" رغم توفر اسم المنتج
//    فوراً — فجوة إتاحة حقيقية أثناء التسوق (قارئ الشاشة لا يصف الصورة).
const quickAddSrc = readFileSync(
  join(root, 'src/components/store/neighbor/QuickAddProductCard.tsx'),
  'utf8',
);
assert.doesNotMatch(quickAddSrc, /alt=""/, 'صور المنتج يجب أن تحمل alt يصف المنتج لا alt فارغاً');
assert.match(quickAddSrc, /alt=\{item\.nameAr\}/);

// ٩) زرّا "إضافة تعليمة"/"إضافة مهمة" في مكتب المناوب الرقمي كانا أيقونة فقط
//    بلا aria-label — غير قابلين للاستخدام عبر قارئ الشاشة.
const digitalShiftSrc = readFileSync(
  join(root, 'src/components/barber/DigitalShiftPrivateOffice.tsx'),
  'utf8',
);
assert.match(digitalShiftSrc, /onClick=\{addInstruction\} aria-label="إضافة تعليمة"/);
assert.match(digitalShiftSrc, /onClick=\{addTask\} aria-label="إضافة مهمة"/);

// ١٠) صفحتا الشراكة عالية الزيارة (/partners و/partners/why) كانتا بلا
//     document.title إطلاقاً — بما أن الموقع HashRouter بلا إعادة تحميل،
//     فعنوان التبويب/المشاركة يبقى عنوان الصفحة السابقة التي جاء منها الزائر.
const partnerPreviewSrc = readFileSync(join(root, 'src/pages/PartnerMarketingPreview.tsx'), 'utf8');
assert.match(partnerPreviewSrc, /useDocumentTitle\(/, '/partners يجب أن يضبط عنوان الصفحة');
const partnerWhySrc = readFileSync(join(root, 'src/pages/PartnerWhyPage.tsx'), 'utf8');
assert.match(partnerWhySrc, /useDocumentTitle\(/, '/partners/why يجب أن يضبط عنوان الصفحة');

// ١١) جسر التنقّل عبر postMessage (RouterBridge) كان يطبع ٩ رسائل console.log/
//     error/warn غير محمية في كونسول الإنتاج — تُسرّب تفاصيل تكامل الإطار
//     الأب لأي زائر يفتح أدوات المطوّر. يجب أن تمر جميعها عبر مساعدات محمية
//     بـ NODE_ENV.
const routerProxySrc = readFileSync(join(root, 'src/lib/react-router-dom-proxy.tsx'), 'utf8');
const rawConsoleInBridge = routerProxySrc
  .split('function onMessage')[1]
  ?.split('window.addEventListener("message"')[0] ?? '';
assert.doesNotMatch(
  rawConsoleInBridge,
  /\bconsole\.(log|warn|error)\(/,
  'كل استدعاءات التسجيل داخل onMessage يجب أن تمر عبر routeBridgeDebug* المحمية بـ NODE_ENV',
);
assert.match(routerProxySrc, /function routeBridgeDebugLog/);

// ١٢) StoreDatesAuctionPage: useEffect لا يجب أن يعتمد على shopName بعد الآن
//     (كان يعتمد على الحالة التي يكتبها بنفسه، فيُعيد ضبط الاستطلاع بالكامل
//     في كل مرة يصل فيها اسم المتجر من الخادم).
const datesAuctionSrc = readFileSync(join(root, 'src/pages/store/StoreDatesAuctionPage.tsx'), 'utf8');
assert.match(datesAuctionSrc, /\}, \[safeToken, isLab, phone\]\);/);
assert.doesNotMatch(datesAuctionSrc, /\[safeToken, isLab, phone, shopName\]/);

console.log('✅ كل إصلاحات الفحص الجنائي (٢٠٢٦-٠٩-٢١) موجودة ومُتحقَّق منها — 12/12 فحصاً ناجحاً.');
