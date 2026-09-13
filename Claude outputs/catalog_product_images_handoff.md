# تسليم شاتلي: دعم صور/شعارات المنتجات في فهرس "خريطة الحل"

**التاريخ:** 2026-09-11
**الطلب:** تفعيل حقل `logoSrc` (موجود في البيانات، غير مستخدم في الواجهة) ضمن بطاقة صف المنتج ونافذة التفاصيل، مع بديل جمالي عند غياب الصورة، ومواصفات رفع موحّدة.

---

## ⚠️ ملاحظة مهمة جداً قبل التنفيذ (لكروسور)

شاتلي طوّر هذا الكود داخل بيئته الخاصة ("Imagine")، وهي مبنية على **Next.js** — الدليل: الكود المسلَّم يبدأ بـ:

```tsx
import Image from "next/image";
```

ويستخدم خصائص خاصة بمكوّن `next/image` مثل `fill` و`sizes`. **موقعنا الفعلي (`store.halaqmap.com`) مبني على Vite + React Router، وليس Next.js**، فهذا الاستيراد غير موجود أصلاً في مشروعنا ولن يعمل كما هو. عند النقل يجب:

- استبدال `import Image from "next/image"` بعنصر `<img>` عادي (أو أي نمط تحميل صور معتمد فعلاً في المشروع).
- استبدال `fill` + `sizes="64px"/"80px"` بتنسيق CSS مكافئ: على سبيل المثال `className="absolute inset-0 h-full w-full object-contain p-3"` بدل الاعتماد على خاصية `fill` الخاصة بـ Next.
- التأكد من أن `alt` و`loading="lazy"` (بديل معقول لتحسين الأداء بما أن `next/image` كان سيتكفل بالـ lazy loading تلقائياً) مضافة يدوياً.

كذلك، تصميم شاتلي في هذه الجولة عرض "شارة" (Badge) مربعة منفصلة بزاوية علوية فيها الكود وكلمة `mark`، بينما الكود الفعلي المتكامل حالياً في المشروع (`SolutionCatalogApp.tsx` + `storeSolutionCatalog.css`) يستخدم تخطيط صف بثلاثة أعمدة (`88px / المحتوى / الإجراء`) حيث العمود الأول يعرض كود المنتج نصياً فقط. الأنسب عملياً هو وضع مكوّن `ProductMark` (الموضح أدناه) داخل هذا العمود الأول (88px) بدل الكود النصي المجرد، وتكرار نفس الفكرة داخل `ProductModal`، حفاظاً على نفس شبكة العرض الحالية بدل استيراد تصميم شاتلي بالكامل حرفياً.

---

## الكود الكامل المسلَّم من شاتلي (مكوّن `ProductMark`)

> منسوخ كما ظهر في المحادثة؛ بعض قيم الـ hex في `accentStyles` جاءت مقصوصة بصرياً أثناء الالتقاط (تجاوز حافة الشاشة) — ألوان `brick`/`blue`/`yellow` نفسها موجودة أصلاً ومطابقة في `STORE_SOLUTION_CATALOG_COLORS` بالمشروع الفعلي (`#b84c3a`, `#1d4f69`, `#d1a728`)، فاستخدم تلك القيم كمرجع دقيق بدل القيم المقصوصة أدناه إن احتجت لإعادة بنائها.

```tsx
import Image from "next/image"; // ⚠️ استبدلها بـ <img> — راجع الملاحظة أعلاه

const accentStyles = {
  brick: {
    frame: "border-[#b84c3a] bg-[#fffaf4] text-[#b84c3a]", // القيمة الكاملة تقديرية، تحقق من التطابق
    rule: "bg-[#b84c3a]",
  },
  blue: {
    frame: "border-[#1d4f69] bg-[#f5f8f8] text-[#1d4f69]",
    rule: "bg-[#1d4f69]",
  },
  yellow: {
    frame: "border-[#d1a728] bg-[#fffdf2] text-[#8b6f1a]", // اللون الرابع تقديري (نص أغمق للتباين)
    rule: "bg-[#d1a728]",
  },
} as const;

type ProductMarkProps = {
  logoSrc: string | null;
  name: string;
  code: string;
  accent: keyof typeof accentStyles;
  compact?: boolean;
};

export function ProductMark({
  logoSrc,
  name,
  code,
  accent,
  compact = false,
}: ProductMarkProps) {
  const colors = accentStyles[accent];
  const firstCharacter = name.trim().charAt(0) || "؟";

  return (
    <div
      className={`relative isolate shrink-0 overflow-hidden border ${colors.frame} ${
        compact ? "size-16" : "size-20"
      }`}
      aria-label={
        logoSrc ? `شعار ${name}` : `علامة بديلة لـ ${name}`
      }
    >
      <span className="absolute inset-x-2 top-2 flex items-center justify-between text-[10px] font-bold opacity-70">
        <span>{code}</span>
        <span>mark</span>
      </span>

      {logoSrc ? (
        // ⚠️ استبدال next/image:
        // <img
        //   src={logoSrc}
        //   alt={`شعار ${name}`}
        //   loading="lazy"
        //   className="absolute inset-0 h-full w-full object-contain p-3"
        // />
        <Image
          src={logoSrc}
          alt={`شعار ${name}`}
          fill
          sizes={compact ? "64px" : "80px"}
          className="object-contain p-3"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">{firstCharacter}</span>
        </span>
      )}

      <span
        className={`absolute inset-x-0 bottom-0 h-1 ${colors.rule}`}
      />
    </div>
  );
}
```

### منطق المكوّن بالعربي
- عند وجود `logoSrc`: تُعرض الصورة الفعلية داخل الإطار (`object-contain` حتى لا تتشوه الصورة).
- عند `logoSrc: null` (كل المنتجات العشرة حالياً): يظهر بديل ورقي — الحرف الأول من الاسم العربي بخط كبير (`text-4xl`) في منتصف إطار ملوّن حسب فئة المنتج (`brick`/`blue`/`yellow`)، مع كود المنتج بزاوية علوية وشريط لون سفلي — بدل ترك فراغ.
- `aria-label` يتغيّر تلقائياً بين "شعار [الاسم]" و"علامة بديلة لـ [الاسم]" لإمكانية الوصول.
- خاصية `compact` تتحكم بحجم الإطار (64px مقابل 80px) — مفيدة لو أردنا نسخة أصغر داخل الجوال لاحقاً.

---

## شكل بيانات المنتج (مثال A-01)

```ts
{
  code: "A-01",
  name: "حلاق ماب",
  latin: "HalaqMap",
  category: "مهن وخدمات",
  segment: "services",
  logoSrc: null,
  accent: "brick",
  summary: "حضور الصالون في خريطة الحل",
  description: "صفحة رقمية تساعد العميل على اكتشاف الصالون والوصول إليه، وتمنحك حضورًا واضحًا وأدوات تشغيل تناسب بحسب الخدمة المشتركة.",
  // ... tags / href كما هي موجودة أصلاً في storeSolutionCatalog.ts
}
```

هذا يطابق تماماً حقل `logoSrc: string | null` الموجود مسبقاً في `SolutionCatalogProduct` بالمشروع الفعلي — لا حاجة لتعديل بنية النوع، فقط ربط الحقل بالعرض كما هو موضح أعلاه.

---

## مواصفات الصور الموصى بها (لرفع الشعارات لاحقاً)

| المواصفة | القيمة |
|---|---|
| المقاس المثالي | 800 × 800px |
| نسبة العرض إلى الارتفاع | 1:1 (مربعة دائماً — تجنّب الصور الأفقية) |
| الصيغة للشعار الشفاف | PNG أو SVG (خلفية شفافة مفضّلة) |
| الصيغة للصور الملوّنة/الفوتوغرافية | WebP |
| الحجم المستهدف | أقل من 200KB |
| مساحة الشعار داخل الإطار | تقريباً 70%، مع حواف آمنة حول الشعار |
| تسمية الملف المقترحة | `halaqmap-a-01.webp` (نمط: `halaqmap-{code}.{ext}` بأحرف صغيرة) |

---

## أين يُستخدم المكوّن (حسب طلبنا لشاتلي)

1. **صف المنتج في الفهرس** — يستبدل عرض الكود النصي المجرد في العمود الأول (88px) بمكوّن `ProductMark` (نسخة `compact`).
2. **نافذة تفاصيل المنتج (`ProductModal`)** — يُضاف بجانب العنوان/الكود في أعلى النافذة (نسخة عادية غير compact).

---

## الخلاصة للمطوّر (كروسور)

1. أنشئ ملف مكوّن جديد (مثلاً `src/components/store/catalog/ProductMark.tsx`) بالكود أعلاه، **مع استبدال `next/image` بـ `<img>` عادي** كما هو موضح.
2. ادمج ألوان `accentStyles` مع `STORE_SOLUTION_CATALOG_COLORS` الموجودة فعلاً في `storeSolutionCatalog.ts` بدل تكرارها بقيم منفصلة — استخدم القيم الدقيقة الموجودة في الملف الفعلي.
3. في `SolutionCatalogApp.tsx`: استورد `ProductMark` واستخدمه بدل `<p className="solution-catalog__code">{product.code}</p>` في عمود الصف الأول (مرّر `logoSrc={product.logoSrc}` `accent={product.stripe}` كما هو مُعرّف أصلاً في بيانات المنتج).
4. كرر نفس الاستخدام داخل `ProductModal` بجانب `product.code`/`product.nameAr`.
5. لا حاجة لأي تعديل على `storeSolutionCatalog.ts` (الحقل موجود مسبقاً)، ولا على أي مسار (`href`) — هذا التعديل معزول بالكامل في طبقة العرض.
6. جميع المنتجات ستظهر بالبديل الورقي (الحرف الأول) حتى تُرفع شعارات فعلية بالمواصفات أعلاه ويُحدَّث `logoSrc` لكل منتج.

---

## ملاحظة على رابط المعاينة العام

عند التحقق من `https://halaqmap-store-management.imaginesites.app/` بعد هذا التسليم، لم يظهر مكوّن الشعار بعد على البطاقات (لا تزال البطاقة بدون أي إطار/شارة). هذا يعني على الأرجح أن هذا التحديث تحديداً لم يُنعكس بعد على رابط المشاركة العام (بخلاف الجولتين السابقتين اللتين ظهرتا فوراً) — يُفضّل التحقق مرة أخرى من الرابط بعد بضع دقائق، أو الاعتماد مباشرة على الكود المُسلَّم في هذا الملف دون انتظار المعاينة.
