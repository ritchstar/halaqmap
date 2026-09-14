# بخورنا1 — بنية تحتية أولية: ما اكتمل وما تبقّى لكرسور

تاريخ الإنشاء: 2026-09-14
الحالة: **بنية تحتية أولية قابلة للتقييم والتطوير** — واجهة العميل ولوحة التشغيل تعملان فعلياً محلياً (بيانات المتصفح فقط)، بلا خادم أو بوابة دفع حقيقية بعد.

هذا المستند يشرح ما تم بناؤه فعلياً لمنتج **بخورنا1** (محل بخور وعود وعطور في الحي)، وما تبقّى من عمل خلفي (Supabase / Vercel API / Moyasar) لتفعيله كمنتج كامل يماثل باقي منتجات "منصة خريطة الحل" الحيّة (تمرتنا1، خضارنا1، تمويناتا1...).

## 1) ما تم بناؤه (يعمل فعلياً الآن)

جميع الملفات التالية جديدة، ومبنية بنفس نمط منتج **تمرتنا1 (Dates1)** الذي استُخدم قالباً:

### الإعداد والبيانات
- `src/config/storeBakhurnaCatalog.ts` — مكتبة أصناف جاهزة (29 صنفاً موزّعة على 7 فئات: بخور كلاسيكي، بخور فاخر، دهن العود، عطور ومعطرات، مستلزمات التبخير، أطقم الهدايا، تعبئة بالجملة). وحدات البيع: قطعة/جرام/مل/علبة/تولة.
- `src/config/storeBakhurnaLive.ts` — كل نصوص المنتج العربية (~90 مفتاحاً)، الألوان (`STORE_BAKHURNA_LIVE_ACCENT = #6E4A26`)، صور الغلاف، وأعلام التفعيل.
- `src/lib/storeBakhurnaLiveLab.ts` — طبقة الحالة الكاملة (المشغّل، الرف، الطلبات، الأرشيف، الدردشة) مخزّنة بالكامل في `localStorage` تحت المفتاح `store-bakhurna-live:v1:<token>`.
- `src/lib/storeBakhurnaCome.ts` — منطق ميزة "تعال" (تتبع اقتراب العربة المتحركة من موقع العميل + إشعار متصفح).

### الواجهات (تعمل بالكامل، بلا خادم)
- `src/components/store/bakhurna/BakhurnaMabkharaMark.tsx` — الدمغة البصرية (أيقونة مبخرة).
- `src/components/store/BakhurnaChat.tsx` — نافذة استفسار العميل + رد المشغّل.
- `src/components/store/BakhurnaIngest.tsx` — إدخال الأصناف (من المكتبة الجاهزة أو قائمة أسعار نصية/مصوّرة).
- `src/components/store/bakhurna/BakhurnaChatlyDesk.tsx` — **لوحة التشغيل الكاملة**: نظرة عامة، الطلبات، الأصناف والمخزون، الموقع وساعات العمل، الدفع المباشر، الإعدادات. طبق الأصل من هيكل تمرتنا1 (Chatly UI الفاتح).
- `src/components/store/bakhurna/BakhurnaChatlyStorefront.tsx` — **واجهة العميل الكاملة**: تصفح الأصناف، السلة، اختيار التوصيل/الاستلام/تعال، إتمام الطلب.
- `src/components/store/bakhurna/BakhurnaStudio.tsx` — معاينة حيّة مدمجة (تبديل بين واجهة العميل ولوحة التشغيل) لصفحة الهبوط.
- `src/styles/bakhurnaChatly.css` — طبقة الألوان البصرية المعزولة (متغيرات `--bc-*`)، مستوردة في `src/index.css`.

### الصفحات والتوجيه
- `src/pages/store/StoreBakhurnaLandingPage.tsx` — صفحة الهبوط (بلا دعوات تجربة أو دفع فعلية؛ تعرض المعاينة الحيّة مباشرة).
- `src/pages/store/StoreBakhurnaShopPage.tsx` — صفحة المتجر/اللوحة الموحّدة، **تعمل حصرياً عبر بيانات المتصفح (Lab state)** — لا استدعاء شبكة إطلاقاً.
- مسارات جديدة في `src/lib/routePaths.ts`: `STORE_BAKHURNA` (`/store/bakhurna`)، `STORE_BAKHURNA_VIEW` (`/b/:token`)، `STORE_BAKHURNA_DESK` (`/b/:token/desk`). حرف المسار `/b` تم التحقق أنه غير مستخدم من قبل.
- تسجيل في `src/App.tsx` (استيراد كسول + Route لكل مسار).
- بطاقة تصفح في صفحة الهبوط العامة `src/pages/store/StoreLanding.tsx`.

### تكاملات النظام المشتركة (تمت إضافة "بخورنا"/"bakhurna" لكل قائمة نوع مطلوبة)
- `StoreProductId` في `src/config/storeProductThemes.ts` + لوحة ألوان مخصصة (Operator/Storefront).
- `StoreShopPresenceTag` في `src/config/storeShopPresence.ts` (عدّاد "المتواجدون الآن").
- `StoreLiveShopShareKind` + `LIVE_SHOP_SHARE_PREFIX` في `src/lib/storeHostRedirect.ts` (حرف المسار `/b`).
- `STORE_LIVE_SHOP_SHARE_COPY` / `CAPTION_LINES` في `src/config/storeLiveShopShare.ts`.
- `StoreProductPassKind` + `STORE_PRODUCT_PASS_META` في `src/config/storeProductPass.ts` (بطاقة QR الجوال).
- `STORE_DIRECT_PAY_PRODUCTS` و`STORE_DIRECT_PAY_GUEST_PRODUCTS` في `src/config/storeDirectPay.ts`.
- `StoreMarketingReelId` + شريط صور تسويقي (`STORE_BAKHURNA_MARKETING_FRAMES`) في `src/config/storeMarketingReels.ts`.
- `STORE_LIVE_ACTIVITY` (نوع `LiveActivityKind`) في `src/config/storeLiveActivity.ts` — مُضاف فقط لاكتمال النوع البرمجي؛ **بخورنا1 لا يستخدم فعلياً واجهة `StoreLiveActivityCartShop` القديمة** (راجع قسم 3).
- `STORE_LANDING_COPY` (`bakhurnaLiveTitleAr` وما شابه) في `src/config/storeFront.ts`.

### الصور
- `public/images/store/bakhurna-hero-marketing.jpg` — صورة غلاف تجريدية (تدرّج كهرماني/عودي + خطوط دخان)، بلا نص عربي (لا توجد خطوط عربية في بيئة البناء الحالية).
- `public/images/store/bakhurna/bakhurna-01.jpg` … `bakhurna-04.jpg` — صور بديلة لبطاقات الأصناف.
- **يُنصح باستبدال هذه الصور بصور حقيقية أو مولّدة بجودة أعلى قبل الإطلاق الفعلي.**

## 2) كيف تُعاين المنتج الآن

- واجهة العميل: `/#/store/bakhurna` (تعرض المعاينة الحيّة مباشرة داخل الصفحة)، أو مباشرة `/#/b/bakhurna-lab`.
- لوحة التشغيل: `/#/b/bakhurna-lab/desk`.
- كل التعديلات (أصناف، طلبات، إعدادات) تُخزَّن في `localStorage` على جهازك فقط تحت المفتاح `store-bakhurna-live:v1:bakhurna-lab` — لا تنتقل بين الأجهزة ولا تُحفظ على خادم.

## 3) ما تبقّى لتفعيله كمنتج حقيقي (مهمة Cursor / المطوّر الخلفي)

هذا القسم يسرد الفجوة بين "بنية تحتية أولية تعمل محلياً" و"منتج مباع بالكامل" مثل تمرتنا1 الحالي:

### أ) الخادم وقاعدة البيانات (Supabase)
1. إنشاء جداول Supabase لـ `store_bakhurna_live` تماثل بنية `store_dates_live` (host, shelf, orders, orderArchive, chats)، مع صلاحيات RLS مناسبة.
2. كتابة `src/lib/storeBakhurnaLiveRemote.ts` مطابق لـ `src/lib/storeDatesLiveRemote.ts` (`fetchBakhurnaLivePublic`, `addBakhurnaLiveOrder`, `addBakhurnaLiveChat`, `saveBakhurnaLiveHost`).
3. إضافة نقاط `/api/store-bakhurna-live/...` في Vercel (أو التوسعة على نقاط `store-dates-live` الحالية بشكل عام إن كانت قابلة للتعميم).

### ب) دمج الخادم في صفحة المتجر
4. تعديل `src/pages/store/StoreBakhurnaShopPage.tsx` ليماثل منطق `StoreDatesShopPage.tsx` الكامل: حالة `gate` (loading/ok/expired/missing)، `useStoreLiveDeskSync`، `scheduleVisiblePoll`، والتفريق بين "الرمز التجريبي bakhurna-lab" (محلي دائماً) و"الرموز الحقيقية" (عبر الخادم). حالياً الصفحة **تعمل بالوضع المحلي فقط لكل الرموز** — يجب تفعيل الفرع البعيد.
5. ربط `deskSync.scheduleSave` بحفظ لوحة التشغيل على الخادم (مثل `saveDatesLiveHost`).

### ج) نظام التجربة والتمديد المدفوع
6. إضافة `bakhurna` إلى `STORE_PRODUCT_TRIAL_PRODUCTS` (`src/config/storeProductTrial.ts`) إن رُغب بتفعيل تجربة 60 يوماً مثل باقي المنتجات (المرجع `STORE_BAKHURNA_TRIAL_DAYS = 60` معرّف مسبقاً في `storeBakhurnaLive.ts`).
7. بناء `StoreBakhurnaOrderForm.tsx` (مطابق لـ `StoreDatesOrderForm.tsx`) لتمديد الاشتراك بعد التجربة، وربطه بصفحة الهبوط.
8. بناء `StoreBakhurnaPayPage.tsx` + مسار `STORE_BAKHURNA_PAY` (`/pay/bakhurna/:token`) وربط Moyasar، على غرار `StoreDatesPayPage.tsx`.
9. تفعيل `STORE_BAKHURNA_LIVE_CHECKOUT_ENABLED` (حالياً `false` بشكل افتراضي عبر متغير البيئة `VITE_STORE_BAKHURNA_LIVE_CHECKOUT_ENABLED`) بعد اكتمال بوابة الدفع.

### د) صفحات مساعدة تم تخطّيها عمداً (لتقليل نطاق هذه الدفعة)
لم تُبنَ الصفحات/المكوّنات التالية بعد — قرار واعٍ لإبقاء الدفعة الأولى مُدارة، وليست عيباً:
10. `/store/bakhurna/read` و`/store/bakhurna/support` (أدلة تشغيل وتسويق — قارن `STORE_DATES_SUPPORT` في `storeProductSupport.ts`).
11. `StoreDeskOrderAlert` (تنبيه صوتي بطلب جديد في اللوحة) — لم يُدمج في `BakhurnaChatlyDesk.tsx`؛ زر الجرس حالياً ينقل فقط إلى قسم "الطلبات".
12. `StoreDeskHelpSupport` / `StoreDeskGuideLink` (روابط الدعم أسفل اللوحة) — غير مدرجة.
13. `/store/bakhurna/ops-plan-preview` (معاينة خطة تشغيل بلا فهرسة).
14. تفعيل `bakhurna` في نظام "الطلب العام" العام (Enterprise Direct) إن لزم تخصيص إضافي — حالياً يستخدم البريد العام بنجاح.

### هـ) الصور والمحتوى التسويقي
15. استبدال الصور التجريدية المولّدة (`bakhurna-hero-marketing.jpg`, `bakhurna-01..04.jpg`) بصور حقيقية بجودة إنتاجية.
16. مراجعة نصوص `STORE_BAKHURNA_LIVE` (خصوصاً الأسعار الافتراضية للأصناف في `storeBakhurnaCatalog.ts`) مقابل أسعار السوق الفعلية.

### و) اختبار الطرف إلى طرف
17. بعد تفعيل (أ) و(ب)، اختبار رحلة كاملة: عميل حقيقي → طلب → إشعار اللوحة → استلام → إنهاء → أرشفة، على رمز غير `bakhurna-lab`.
18. مراجعة قانونية/امتثال (السجل التجاري، الهيئة السعودية للملكية الفكرية) قبل الإطلاق العلني — بخورنا1 حالياً **منتج غير مسجّل لدى SAIP** (ملاحظة موجودة في كود المصدر).

## 4) ملخص الحالة الحالية بجملة واحدة

**الواجهة الأمامية لبخورنا1 (عميل + لوحة تشغيل) جاهزة وتعمل بالكامل كمعاينة محلية تفاعلية؛ المتبقي هو الربط الخلفي (قاعدة بيانات، تجربة مدفوعة، بوابة دفع) لتحويلها من "بنية تحتية قابلة للتقييم" إلى "منتج مباع فعلياً" بنفس مستوى تمرتنا1.**
