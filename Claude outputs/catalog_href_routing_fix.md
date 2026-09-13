# تصحيح: ربط حلاق ماب وكوافير ماب بصفحاتهما الفعلية داخل الموقع

**الملف:** `src/config/storeSolutionCatalog.ts`
**السبب:** حالياً A-01 (حلاق ماب) وA-02 (كوافير ماب) هما المنتجان الوحيدان في الفهرس اللذان يحيلان إلى روابط خارجية (`external: true`)، بينما بقية المنتجات التسعة تحيل لصفحات عرض حقيقية داخل الموقع نفسه عبر `ROUTE_PATHS`. طلب الفريق تصحيح هذين المنتجين تحديداً ليتبعا نفس النمط.

## تحققت من الكود فعلياً قبل اقتراح الحل

- `ROUTE_PATHS.BARBERS_LANDING` يساوي `/partners`، ويُعرَض عبره مكوّن `PartnerMarketingPreview` (`src/pages/PartnerMarketingPreview.tsx`) — وتعليق الملف نفسه يقول صراحة: **"صفحة مسار الخدمات التسويقية للشركاء — حلاق ماب... مسار مُخصَّص للحلاقين والصالونات فقط"**. هذه هي صفحة حلاق ماب الفعلية داخل الموقع.
- `ROUTE_PATHS.COIFFEUR_LANDING` يساوي `/coiffeur`، ويُعرَض عبره مكوّن `CoiffeurLanding` (`src/pages/coiffeur/CoiffeurLanding.tsx`) — وهي "بوابة المستعلمة" التي يضغط منها العميل على زر الاستعلام (`goInquire`) لينتقل إلى `ROUTE_PATHS.COIFFEUR_INQUIRE` (`/coiffeur/need`) ويكمل طلبه هناك. أي أن `/coiffeur` هي فعلاً صفحة المنتج التي منها يبدأ العميل ويكمل طلبه، تماماً كما وُصف.

## التعديل المطلوب في `src/config/storeSolutionCatalog.ts`

**A-01 — حلاق ماب (السطر 105-106 حالياً):**
```ts
// قبل
href: 'https://www.halaqmap.com',
external: true,

// بعد
href: ROUTE_PATHS.BARBERS_LANDING,
```
(حذف سطر `external: true` بالكامل — الحقل اختياري وغيابه يعني `undefined`، فيستخدم الكود مسار `<Link>` الداخلي بدل `<a target="_blank">`)

**A-02 — كوافير ماب (السطر 121-122 حالياً):**
```ts
// قبل
href: 'https://coiffeur.halaqmap.com',
external: true,

// بعد
href: ROUTE_PATHS.COIFFEUR_LANDING,
```
(حذف سطر `external: true` بالكامل، لنفس السبب أعلاه)

`ROUTE_PATHS` مستورد بالفعل في أعلى الملف (`import { ROUTE_PATHS } from '@/lib/routePaths';`)، فلا حاجة لأي استيراد إضافي.

## الأثر على الكود

هذا التعديل يغيّر فقط حقلين من بيانات ثابتة (`href`, `external`) لمنتجين اثنين. `SolutionCatalogApp.tsx` يتعامل مع الفرق تلقائياً عبر الشرط الموجود مسبقاً:

```tsx
{product.external ? (
  <a href={product.href} target="_blank" rel="noreferrer">…</a>
) : (
  <Link to={product.href}>…</Link>
)}
```

بعد التعديل، سيفتح زر "أكمل التصفح" لكل من حلاق ماب وكوافير ماب صفحتهما الفعلية داخل نفس الموقع (`/partners` و`/coiffeur`) بدل التنقل لنطاق خارجي منفصل — بقية المنتجات التسعة لا تحتاج أي تعديل لأنها تحيل لصفحات عرض داخلية بالفعل.
