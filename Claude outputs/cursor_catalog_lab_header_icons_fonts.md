# تكليف كروسور — تطوير هيدر وأيقونات وخطوط صفحة الفهرس (`/store/catalog-lab`)

**إلى:** كروسور
**الصفحة:** `SolutionCatalogApp.tsx` (تُعرض على `https://store.halaqmap.com/#/store/catalog-lab`) — الفهرس الشامل لكل حلول خريطة الحل بتصميم "كتالوج" (بطاقات مرقّمة، خلفية ورقية). لسّه معاينة داخلية (`noindex`) بانتظار قرار التعميم — هذا التكليف تحسين تصميم فقط، لا يغيّر منطق الصفحة.

---

## المشكلة اللي اكتشفتها بالفحص المباشر

فحصت `src/styles/storeSolutionCatalog.css` ولقيت الصفحة **لا تستخدم إطلاقاً** خطوط العلامة التجارية الحقيقية لخريطة الحل رغم إنها محمّلة فعلياً وجاهزة على كل صفحات الموقع (شفتها في `index.html`):

```
Tajawal (400/500/700/800) — الخط العربي الأساسي للنصوص
El Messiri (600/700) — خط العناوين العربي
Syne (700/800) — خط لاتيني للعلامة
```

بدلها، الصفحة تستخدم خطوط نظام عامة: `Arial, 'Segoe UI', Tahoma` للنص العادي، و`Georgia, 'Times New Roman', serif` للعناوين (وهذا لا معنى له أصلاً على نص عربي — المتصفح يتجاهله ويرجع لخط النظام الافتراضي)، و`ui-monospace, Cascadia Code, Consolas` لأكواد المنتجات.

وفي الهيدر (`<header className="solution-catalog__header">`)، الشعار حالياً أيقونة `Compass` عامة من مكتبة lucide-react — مو الشعار الحقيقي لخريطة الحل. بينما يوجد مكوّن جاهز فعلياً (`StoreBrandMark` في `src/components/store/StoreBrandMark.tsx`) يُستخدم في كل صفحات الهبوط الأخرى (`StoreChrome.tsx`) ويعرض الشعار الحقيقي مع تأثير توهّج.

أيضاً تصنيفات الشريط الجانبي/الشريط العلوي (مهن وخدمات / طعام وضيافة / جار الحي / مناسبات / الفهرس الكامل) نص فقط بدون أي أيقونة تميّزها بصرياً.

---

## التعديلات المطلوبة

### 1) الخطوط — استبدال الخطوط العامة بخطوط العلامة الحقيقية

في `src/styles/storeSolutionCatalog.css`:

- `.solution-catalog` (القاعدة العامة): غيّر `font-family: Arial, 'Segoe UI', Tahoma, sans-serif;` إلى `font-family: 'Tajawal', system-ui, sans-serif;`
- كل عنصر عنوان يستخدم `Georgia, 'Times New Roman', serif` (`.solution-catalog__hero-title` والعناصر المشابهة لعناوين المنتج/الأقسام): غيّره إلى `font-family: 'El Messiri', 'Tajawal', system-ui, sans-serif;`
- `.solution-catalog__code` (أكواد مثل `A-01`): اختياري إبقاؤه بخط أرقام واضح، لكن استبدل الخط الحالي بـ`font-family: 'Tajawal', ui-monospace, monospace;` بحيث يبقى منسّقاً بدون كسر هوية الخط العربي في بقية الصفحة.

لا حاجة لإضافة أي `<link>` جديد للخطوط — كلها محمّلة مسبقاً من `index.html` على مستوى التطبيق كامل.

### 2) الهيدر — الشعار الحقيقي بدل أيقونة Compass

في `SolutionCatalogApp.tsx`، داخل `<header className="solution-catalog__header">`:

```tsx
// قبل
<Compass className="h-6 w-6" />
<span className="text-lg font-bold">{STORE_SOLUTION_CATALOG_COPY.brandAr}</span>

// بعد
<StoreBrandMark className="h-9 w-9" />
<span className="text-lg font-bold">{STORE_SOLUTION_CATALOG_COPY.brandAr}</span>
```

استورد `StoreBrandMark` من `@/components/store/StoreBrandMark`. تأكد بصرياً أن حجمها وتأثير التوهّج المدمج فيها يبدو متناسقاً على خلفية الهيدر الداكنة (`--sc-header: #1f2933`) — نفس المكوّن مستخدم بنجاح على خلفيات مشابهة في صفحات الهبوط الأخرى فلا يفترض فيه مشاكل، لكن تأكد بعينك بعد النشر.

يمكن حذف استيراد `Compass` من `lucide-react` بعدها إن لم يُستخدم في مكان آخر بالملف.

### 3) أيقونات التصنيفات — إضافة أيقونة لكل تصنيف

في الشريط الجانبي (`STORE_SOLUTION_CATALOG_CATEGORIES.map`)، كل تصنيف حالياً نص فقط. أضف أيقونة صغيرة قبل كل عنوان تصنيف (نفس مكتبة lucide-react المستخدمة أصلاً في الملف). اقتراحي حسب اسم كل تصنيف (لدّل حسب الأسماء الفعلية الكاملة في `STORE_SOLUTION_CATALOG_CATEGORIES`، هذي فقط أفكار توجيهية وليست ملزمة إن وجدت أنسب):

- "الفهرس الكامل" (all) → `LayoutGrid`
- "مهن وخدمات" → `Briefcase`
- "طعام وضيافة" → `UtensilsCrossed`
- "جار الحي" → `Store`
- "مناسبات و..." → `PartyPopper`

هذا يحتاج تعديل شكل بيانات `STORE_SOLUTION_CATALOG_CATEGORIES` في `src/config/storeSolutionCatalog.ts` لإضافة حقل أيقونة لكل عنصر (أو تعيين الأيقونة مباشرة في خريطة داخل `SolutionCatalogApp.tsx` بمفتاح `cat.id` — قرارك أيهما أنظف حسب بنية الملف الحالية).

---

## لا تلمس

- منطق الفلترة/البحث/الفتح عبر الهاش (`openProduct`, `parseSolutionCatalogProductHash`, إلخ) — تصميم بصري فقط.
- بيانات المنتجات نفسها (`STORE_SOLUTION_CATALOG_PRODUCTS`) وبطاقاتها (`SolutionCatalogProductCard.tsx`) — غير مطلوب لمسها في هذا التكليف، إلا إذا رأيت أنها بحاجة نفس معالجة الخط (افحصها بنفسك، إن كانت تستخدم نفس الخطوط العامة طبّق عليها نفس تصحيح الخط رقم 1).
- حالة `STORE_SOLUTION_CATALOG_LAB_ENABLED`/`noindex` — تبقى كما هي، هذا لسّه معاينة داخلية.

## بعد الدفع

أرسل لي وصف الملفات المتغيّرة، وسأتحقق كالعادة (سحب + `tsc` + مراجعة ديف + معاينة حية على `https://store.halaqmap.com/#/store/catalog-lab`).
