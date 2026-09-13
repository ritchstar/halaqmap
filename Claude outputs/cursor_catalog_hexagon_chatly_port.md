# نقل هيكلي دقيق لخريطة "حيّك في واجهة واحدة" التفاعلية من شاتلي إلى صفحة الفهرس الحقيقية

## 1) السياق والقرار

قسم "حيّك في واجهة واحدة" في صفحة فهرس خريطة الحل (`/store/catalog-lab`) حالياً **شبكة سداسية ثابتة** (SVG بلا حركة، كشف الوصف فقط بـ `:hover` عبر CSS، وعلى الجوال يتحول إلى شبكة ثابتة بعمودين). صاحبة الحساب راجعت تصميماً تفاعلياً جديداً بنيناه في أداة شاتلي (Chatly) لنفس الفكرة بالضبط — مركز "خريطة الحل" وحوله عقد المنتجات — لكن بحركة دخول تدريجية عند التمرير، توهج وإضاءة خط عند المرور، بطاقة وصف تظهر عند النقر، ونسخة جوال رأسية متكيفة بدل الشبكة المزدحمة.

**القرار المعتمد صراحة:** هذا **ليس** نسخاً حرفياً لكود شاتلي (فمشروع شاتلي منفصل تماماً، Next.js App Router، ببيانات ومكونات وهمية)، و**ليس** أيضاً اختراعاً من الصفر يشبه التصميم. المطلوب **نقل هيكلي دقيق مع استبدال طبقة البيانات فقط**:
- تُنقل شبه حرفياً: بنية JSX، أصناف Tailwind، منطق خطوط SVG الواصلة، حالات hover/click، الحركة التدريجية عند التمرير (IntersectionObserver + تأخير متدرج لكل عقدة)، والتخطيط المتجاوب للجوال.
- تُستبدل بالكامل: كل بيانات المنتجات الوهمية ومنطق Next.js — بمصدر البيانات الحقيقي الموجود فعلاً في المشروع (`STORE_SOLUTION_CATALOG_PRODUCTS`، `SOLUTION_CATALOG_HOOD_CODES`، `HOOD_NODE_LAYOUT`)، وبمكوّن الشعار الحقيقي `ProductMark` بدل أيقونات lucide الوهمية، وبآلية فتح المنتج الحقيقية (`onOpen` → `ProductModal`) بدل التنقل بـ `window.location.assign`.

**المرجع الوحيد والدقيق لهيكل التصميم الجديد هو كود شاتلي الخام المستخرج أدناه (القسم 2)** — اقرأه سطراً سطراً قبل البدء. **المرجع الوحيد والدقيق لطبقة البيانات والمنطق الحقيقيين هو الملفات القائمة في المشروع (القسم 3)** — لا تخترع حقولاً أو مساراً غير موجود فيها.

---

## 2) الكود الخام من شاتلي (مرجع البنية والحركة فقط — لا تُدرجه كما هو، طبقة بياناته وهمية بالكامل)

هذا هو الكود الفعلي الذي بنته شاتلي في معاينتها الداخلية (مشروع منفصل، Next.js) لنفس الفكرة. انقل منه المنطق والبنية والحركة حصراً كما هو موضح في القسم 4.

### أ) الإضافات الجديدة في `globals.css` الخاص بمشروع شاتلي (منطق الحركة فقط)

```css
@keyframes catalog-node-reveal {
  from {
    opacity: 0;
    filter: blur(5px);
    transform: translate(-50%, calc(-50% + 14px));
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform: translate(-50%, -50%);
  }
}

.node-reveal {
  animation: catalog-node-reveal 720ms var(--ease-out-expo) both;
  animation-delay: var(--node-delay);
}

.connector-line line {
  fill: none;
  stroke: var(--paper-line);
  stroke-width: 1.5;
  stroke-dasharray: 0.02 0.03;
  opacity: 0.75;
  transition: stroke 300ms var(--ease-out), opacity 300ms var(--ease-out), stroke-width 300ms var(--ease-out);
}

.connector-line circle {
  fill: var(--paper-line);
  opacity: 0.7;
  transition: fill 300ms var(--ease-out), opacity 300ms var(--ease-out), r 300ms var(--ease-out);
}

.connector-line-active line {
  stroke: var(--mustard);
  stroke-width: 3;
  opacity: 1;
}

.connector-line-active circle {
  fill: var(--mustard);
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .node-reveal {
    animation: none;
    opacity: 1;
    filter: none;
    transform: translate(-50%, -50%);
  }

  .connector-line line,
  .connector-line circle {
    transition: none;
  }
}
```

ملاحظة: `--mustard` و `--paper-line` هما توكينات ألوان شاتلي الخاصة بها؛ في مشروعنا الحقيقي التوكينات المكافئة موجودة فعلاً في `storeSolutionCatalog.css` باسم `--sc-yellow` و `--sc-border` (انظر القسم 3-ج). استخدم توكينات مشروعنا الحقيقية، لا توكينات شاتلي.

### ب) `src/components/halaqmap-catalog-hexagon-preview.tsx` (المكوّن الكامل، مشروع شاتلي)

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Boxes,
  Check,
  Circle,
  Compass,
  ExternalLink,
  Layers3,
  MapPinned,
  Sparkles,
  Store,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductTone = "brick" | "teal" | "mustard";
type ProductIcon = typeof Store;

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  href: string;
  icon: ProductIcon;
  tone: ProductTone;
  position: { left: string; top: string };
};

const products: Product[] = [
  {
    id: "halana",
    name: "حلانا1",
    category: "طلبات مخصصة",
    description: "تطلبين فكرتك، وتصلين إلى عرض سعر واضح قبل اعتماد التنفيذ.",
    href: "/halana",
    icon: Sparkles,
    tone: "brick",
    position: { left: "15%", top: "25%" },
  },
  {
    id: "khudarana",
    name: "خضارنا1",
    category: "سوق الحي",
    description: "تصفحين رف الخضار وتحفظين سلتك أو تختارين التوصيل والاستلام.",
    href: "/khudarana",
    icon: Store,
    tone: "teal",
    position: { left: "25%", top: "76%" },
  },
  {
    id: "tamwinata",
    name: "تمويناتا1",
    category: "تموين يومي",
    description: "أساسيات البيت والمعلبات والمنظفات في سلة تموين واضحة.",
    href: "/tamwinata",
    icon: Boxes,
    tone: "mustard",
    position: { left: "85%", top: "25%" },
  },
  {
    id: "tabkhatna",
    name: "طبختنا1",
    category: "أطباق منزلية",
    description: "أطباق منزلية من طباخات الحي، مع طريقة طلب تناسب كل طبق.",
    href: "/tabkhatna",
    icon: Utensils,
    tone: "brick",
    position: { left: "75%", top: "76%" },
  },
  {
    id: "matamna",
    name: "مطعمنا1",
    category: "مطاعم محلية",
    description: "واجهة اكتشاف للمطاعم المحلية القريبة عندما يكتمل مسارها.",
    href: "/matamna",
    icon: Layers3,
    tone: "teal",
    position: { left: "91%", top: "51%" },
  },
];

const toneClasses: Record<ProductTone, string> = {
  brick: "bg-[var(--brick)] text-[var(--paper-ivory)]",
  teal: "bg-[var(--teal)] text-[var(--paper-ivory)]",
  mustard: "bg-[var(--mustard)] text-[var(--ink)]",
};

const toneTextClasses: Record<ProductTone, string> = {
  brick: "text-[var(--brick)]",
  teal: "text-[var(--teal)]",
  mustard: "text-[var(--mustard)]",
};

function HalaqmapMark() {
  return (
    <div className="flex min-w-0 items-center gap-3" dir="ltr">
      <span className="grid size-11 shrink-0 place-items-center rounded-full border-[var(--paper-line)]/70 bg-[var(--ink)] text-[var(--paper-ivory)] shadow-[0_12px_25px_rgba(31,41,51,0.18)]">
        <MapPinned size={21} strokeWidth={1.6} />
      </span>
      <span className="min-w-0 text-right" dir="rtl">
        <span className="block truncate text-base font-black tracking-[0.08em] text-[var(--ink)]">halaqmap</span>
        <span className="block text-[0.64rem] tracking-[0.04em] text-[var(--muted-ink)]">دليل المنتجات المحلية</span>
      </span>
    </div>
  );
}

function ProductNode({ product, active, hovered, revealed, onSelect, onHoverChange }: { product: Product; active: boolean; hovered: boolean; revealed: boolean; onSelect: () => void; onHoverChange: (hovered: boolean) => void }) {
  const Icon = product.icon;

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`عرض تفاصيل ${product.name}`}
      onClick={onSelect}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      style={{ "--node-delay": `${products.findIndex((item) => item.id === product.id) * 90}ms`, left: product.position.left, top: product.position.top } as React.CSSProperties}
      className={cn(
        "group absolute z-20 flex min-w-0 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border-[var(--paper-ivory)] bg-[var(--paper-card)] p-1.5 text-right shadow-[0_12px_24px_rgba(31,41,51,0.16)] transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:scale-[1.06] hover:border-[var(--mustard)] hover:shadow-[0_16px_30px_rgba(31,41,51,0.23)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mustard)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper-card)]",
        revealed ? "node-reveal" : "opacity-0",
        (active || hovered) && "scale-[1.06] border-[var(--mustard)] shadow-[0_18px_35px_rgba(31,41,51,0.24)] ring-2 ring-[var(--mustard)]/40",
      )}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", toneClasses[product.tone])}>
        <Icon size={18} strokeWidth={1.7} />
      </span>
      <span className="hidden min-w-0 pr-1 sm:block">
        <span className="block max-w-28 truncate text-xs font-black text-[var(--ink)]">{product.name}</span>
        <span className="block max-w-28 truncate text-[0.63rem] text-[var(--muted-ink)]">{product.category}</span>
      </span>
      <Circle size={7} className={cn("mr-0.5 sm:hidden", toneTextClasses[product.tone])} fill="currentColor" />
    </button>
  );
}

function ConnectorLines({ activeId, hoveredId }: { activeId: string | null; hoveredId: string | null }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 1000 600" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full sm:block">
      {products.map((product) => {
        const isActive = activeId === product.id || hoveredId === product.id;
        const x = Number.parseFloat(product.position.left) * 10;
        const y = Number.parseFloat(product.position.top) * 6;
        return (
          <g key={product.id} className={cn("connector-line", isActive && "connector-line-active")}>
            <line x1="500" y1="300" x2={x} y2={y} pathLength="1" />
            <circle cx={x} cy={y} r={isActive ? 5 : 3} />
          </g>
        );
      })}
    </svg>
  );
}

function CentralNode() {
  return (
    <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
      <div className="relative grid size-32 place-items-center rounded-full border-[7px] border-[var(--paper-card)] bg-[var(--ink)] text-center text-[var(--paper-ivory)] shadow-[0_20px_38px_rgba(31,41,51,0.22)] sm:size-40">
        <span className="absolute inset-2 rounded-full border-[var(--mustard)]/55" />
        <span className="relative flex-col items-center gap-2">
          <MapPinned size={27} strokeWidth={1.5} className="text-[var(--mustard)]" />
          <span className="text-lg font-black tracking-[0.04em]">halaqmap</span>
          <span className="text-[0.65rem] text-[var(--paper-ivory)]/75">خريطة الحل</span>
        </span>
      </div>
      <span className="mt-3 rounded-full border-[var(--paper-line)] bg-[var(--paper-ivory)] px-3 py-1 text-[0.65rem] font-bold text-[var(--teal)] shadow-sm">كل ما يخص حيك</span>
    </div>
  );
}

function MobileProductList({ activeId, onSelect, revealed }: { activeId: string | null; onSelect: (id: string) => void; revealed: boolean }) {
  return (
    <div className="relative mt-5 space-y-2 pr-4 sm:hidden">
      <div className="absolute bottom-5 right-[1.1rem] top-5 w-px bg-[var(--paper-line)]" />
      {products.map((product, index) => {
        const Icon = product.icon;
        return (
          <button
            key={product.id}
            type="button"
            aria-pressed={activeId === product.id}
            onClick={() => onSelect(product.id)}
            style={{ "--node-delay": `${index * 90}ms` } as React.CSSProperties}
            className={cn("relative flex w-full min-w-0 items-center gap-3 rounded-2xl border-[var(--paper-line)] bg-[var(--paper-ivory)] p-3 text-right shadow-[0_8px_18px_rgba(94,75,60,0.08)] transition-[transform,box-shadow,border-color] duration-300 ease-out-expo", revealed ? "node-reveal" : "opacity-0", activeId === product.id && "border-[var(--mustard)] shadow-[0_12px_22px_rgba(94,75,60,0.14)]")}
          >
            <span className={cn("relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-4 border-[var(--paper-ivory)]", toneClasses[product.tone])}><Icon size={16} strokeWidth={1.7} /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-black text-[var(--ink)]">{product.name}</span><span className="mt-0.5 block truncate text-xs text-[var(--muted-ink)]">{product.category}</span></span>
            <ArrowLeft size={15} className="shrink-0 text-[var(--muted-ink)]" />
          </button>
        );
      })}
    </div>
  );
}

export default function HalaqmapCatalogHexagonPreview() {
  const [activeId, setActiveId] = useState<string>(products[0].id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const activeProduct = useMemo(() => products.find((product) => product.id === activeId) ?? products[0], [activeId]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.24 });
    observer.observe(scene);
    return () => observer.disconnect();
  }, []);

  return (
    <main dir="rtl" className="min-h-dvh bg-[var(--paper-ground)] px-4 py-8 text-[var(--ink)] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex-col gap-6 border-b border-[var(--paper-line)] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 border-b border-[var(--mustard)] pb-1 text-xs font-bold text-[var(--teal)]"><Compass size={14} /> معاينة فهرس خريطة الحل</div>
            <h1 className="text-3xl font-black leading-[1.15] tracking-[-0.04em] sm:text-5xl">حيّك في واجهة واحدة.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted-ink)]">خريطة سداسية حيّة تربط كل نشاط بمركز واحد؛ مرّري على العقدة أو اختاريها لتظهر قصتها من دون مغادرة الفهرس.</p>
          </div>
          <HalaqmapMark />
        </header>

        <section className="rounded-[1.9rem] border-[var(--paper-line)] bg-[var(--paper-card)] p-3 shadow-[0_14px_45px_rgba(94,75,60,0.08)] sm:p-5">
          <div className="mb-5 flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between sm:px-3">
            <div><h2 className="text-lg font-black">شبكة الحي المتصلة</h2><p className="mt-1 text-sm leading-6 text-[var(--muted-ink)]">المركز ثابت، والأنشطة حوله قابلة للزيادة من مصفوفة واحدة.</p></div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border-[var(--paper-line)] bg-[var(--paper-ivory)] px-3 py-1.5 text-xs font-bold text-[var(--teal)]"><span className="size-2 rounded-full bg-[var(--mustard)]" /> {products.length} عقد مرتبطة</span>
          </div>

          <div ref={sceneRef} className="relative isolate hidden aspect-[16/9] overflow-hidden rounded-[1.5rem] border-[var(--paper-line)] bg-[var(--paper-ivory)] sm:block">
            <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(var(--paper-line)_1px,transparent_1px),linear-gradient(90deg,var(--paper-line)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
            <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-4 p-4 sm:p-6"><span className="rounded-full border-[var(--paper-line)] bg-[var(--paper-card)]/90 px-3 py-1.5 text-[0.65rem] font-bold text-[var(--teal)] shadow-sm">المركز + العقد المرتبطة</span><span className="rounded-full border-[var(--ink)]/15 bg-[var(--ink)] px-3 py-1.5 text-[0.65rem] font-semibold text-[var(--paper-ivory)]">تفاعل مباشر · ٠١</span></div>
            <ConnectorLines activeId={activeId} hoveredId={hoveredId} />
            {products.map((product) => <ProductNode key={product.id} product={product} active={activeId === product.id} hovered={hoveredId === product.id} revealed={revealed} onSelect={() => setActiveId(product.id)} onHoverChange={(hovered) => setHoveredId(hovered ? product.id : null)} />)}
            <CentralNode />
          </div>

          <div className="sm:hidden">
            <div className="relative flex-col items-center rounded-[1.5rem] border-[var(--paper-line)] bg-[var(--paper-ivory)] px-5 py-6">
              <CentralNode />
              <div className="h-44 w-px bg-[var(--paper-line)]" />
              <p className="max-w-[18rem] text-center text-xs leading-6 text-[var(--muted-ink)]">اختاري أي نشاط من المسار، وستظهر تفاصيله أسفل الخريطة دون انتقال.</p>
            </div>
            <MobileProductList activeId={activeId} onSelect={setActiveId} revealed={revealed} />
          </div>

          <div className="mt-5 grid gap-5 border-t border-[var(--paper-line)] px-2 pt-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-3">
            <div className="min-w-0"><div className="flex items-center gap-2 text-sm font-black"><span className={cn("size-2 rounded-full", activeProduct.tone === "brick" ? "bg-[var(--brick)]" : activeProduct.tone === "teal" ? "bg-[var(--teal)]" : "bg-[var(--mustard)]")} />{activeProduct.name} <span className="font-normal text-[var(--muted-ink)]">— {activeProduct.category}</span></div><p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted-ink)]">{activeProduct.description}</p></div>
            {activeProduct.id === "matamna" ? <Button type="button" disabled className="h-10 rounded-full bg-[var(--secondary)] px-5 text-xs font-black text-[var(--muted-ink)]">قريباً <ExternalLink size={15} /></Button> : <Button type="button" onClick={() => window.location.assign(activeProduct.href)} className="h-10 rounded-full bg-[var(--ink)] px-5 text-xs font-black text-[var(--paper-ivory)] hover:bg-[var(--teal)]">فتح صفحة {activeProduct.name} <ArrowLeft size={15} /></Button>}
          </div>
        </section>

        <footer className="mt-6 flex-col gap-3 rounded-2xl border-[var(--paper-line)] bg-[var(--paper-ivory)]/80 p-4 text-xs text-[var(--muted-ink)] sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><Check size={15} className="text-[var(--teal)]" /> كل عقدة تُضاف من مصفوفة المنتجات نفسها.</div><div className="flex items-center gap-2"><ArrowLeft size={15} className="text-[var(--brick)]" /> معاينة داخلية مستقلة</div></footer>
        </div>
    </main>
  );
}
```

---

## 3) ملفات المشروع الحقيقي التي يجب قراءتها والبناء عليها (طبقة البيانات والمنطق الحقيقيان)

اقرأ هذه الملفات كاملة قبل البدء — هي المصدر الوحيد الصحيح للبيانات والمنطق:

### أ) `src/components/store/catalog/SolutionCatalogHoodScene.tsx` (الملف المطلوب إعادة بنائه)
المكوّن الحالي بسيط وثابت. الـ props التي يستقبلها لا تتغيّر:
```ts
{ products: readonly SolutionCatalogProduct[]; onOpen: (product: SolutionCatalogProduct) => void }
```
`onOpen` تفتح فعلياً نافذة `ProductModal` الكاملة (تفاصيل، مسار الخدمة، زر بدء الطلب) — هذه أغنى من أي بطاقة وصف مصغّرة، فيجب الإبقاء عليها كإجراء "التوسع/الفتح الكامل"، وليس استبدالها بـ `window.location.assign` كما فعلت شاتلي (شاتلي فعلت ذلك فقط لأن مشروعها لا يملك نافذة منتج حقيقية).

`SOLUTION_CATALOG_HOOD_CODES` مُصدّرة من نفس الملف حالياً كمصفوفة ثابتة بخمسة رموز — أبقِ هذا التصدير (يُستخدم في `SolutionCatalogApp.tsx` للتحقق من اكتمال القائمة قبل العرض)، ولا تُغيّر توقيعه.

### ب) `src/config/storeSolutionCatalog.ts` (مصدر البيانات الحقيقي)
يحوي فعلياً كل شيء تحتاجه: `STORE_SOLUTION_CATALOG_PRODUCTS` (النوع الكامل `SolutionCatalogProduct` بحقول `code, nameAr, nameEn, categoryAr, summaryAr, descriptionAr, tags, stripe, logoSrc, cardImageSrc, href, pathItems`)، وقيم الألوان الفعلية في `STORE_SOLUTION_CATALOG_COLORS`. **لا تُنشئ مصفوفة منتجات جديدة ولا تُكرر البيانات** — استهلك هذه المصفوفة كما هي عبر الـ `products` prop الممرّرة فعلاً من `SolutionCatalogApp.tsx` (وهي بالفعل الرموز الخمسة: B-01 خضارنا1، B-02 تمويناتا1، B-03 طبختنا1، B-04 حلانا1، C-01 مطعمنا1 — **جميعها لديها مسارات حقيقية عاملة بالفعل**، بخلاف نسخة شاتلي التي أظهرت مطعمنا1 كـ"قريباً" لأن مشروعها الوهمي لا يملك صفحته؛ في مشروعنا الحقيقي **لا داعي لأي حالة "قريباً"** — كل الأزرار الخمسة تعمل).

الإحداثيات الحالية `HOOD_NODE_LAYOUT` (بالنسب المئوية `x/y`) موجودة داخل `SolutionCatalogHoodScene.tsx` نفسه — أبقِها كما هي (هي التي تحدد مواقع العقد حول المركز)، ولا تستبدلها بإحداثيات شاتلي (`left/top` بصيغة نسبة مئوية أيضاً لكن بقيم مختلفة تماماً وغير مطابقة لتوزيع مشروعنا الحالي). إن رغبت بتحسين توزيعها بصرياً بما يخدم الحركة الجديدة فهذا مقبول، لكن حافظ على نفس فكرة "توزيع حول مركز بنسب مئوية لكل رمز منتج".

### ج) `src/styles/storeSolutionCatalog.css` (توكينات الألوان الحقيقية — استخدمها بدل توكينات شاتلي)
هذه هي التوكينات الفعلية المعرّفة على `.solution-catalog` والمكافئة لتوكينات شاتلي المذكورة في الكود أعلاه:

| توكن شاتلي (وهمي) | التوكن الحقيقي في مشروعنا |
|---|---|
| `--paper-ground` (خلفية الصفحة) | `--sc-bg` |
| `--paper-card` (سطح البطاقات) | `--sc-surface` أو `--sc-card` (بحسب الطبقة) |
| `--paper-ivory` | `--sc-card` |
| `--paper-line` (الحدود/الخطوط) | `--sc-border` |
| `--ink` (الكحلي الهادئ) | `--sc-ink` / `--sc-header` |
| `--muted-ink` | `--sc-muted` |
| `--teal` (تركوازي داكن) | `--sc-blue` |
| `--brick` (طوبي) | `--sc-brick` |
| `--mustard` (خردلي) | `--sc-yellow` |

لا تُدخل أي متغير `--paper-*`/`--ink`/`--teal`/`--brick`/`--mustard` جديد إلى ملفات CSS الحقيقية — استبدل كل استخدام في الكود المنقول بمكافئه من الجدول أعلاه مباشرة (إما كـ `var(--sc-yellow)` داخل `style`/Tailwind العشوائي `[...]`، أو أضِف القواعد الجديدة داخل نطاق `.solution-catalog` في `storeSolutionCatalog.css` حيث تكون هذه المتغيرات معرّفة أصلاً).

### د) `src/components/store/catalog/ProductMark.tsx` (الشعار الحقيقي — بدل أيقونات lucide الوهمية)
كل عقدة في شاتلي تعرض أيقونة lucide عامة (`Sparkles`, `Store`, `Boxes`, إلخ) لأن شاتلي لا تملك شعارات حقيقية. **مشروعنا يملك فعلاً** مكوّن `ProductMark` الذي يعرض شعار المنتج الحقيقي (`logoSrc`) أو حرفاً بديلاً، بإطار ملوّن حسب `stripe`. النسخة المنقولة **يجب أن تستخدم `<ProductMark logoSrc={product.logoSrc} name={product.nameAr} code={product.code} accent={product.stripe} compact />` بدل أي أيقونة lucide عامة** — هذا استبدال في طبقة المحتوى وليس مجرد بيانات، لكنه مطلوب لأن الشعارات الحقيقية موجودة فعلاً ولا معنى لاستبدالها بأيقونات عامة.

### هـ) `STORE_SOLUTION_CATALOG_COPY` (نفس الملف، للنصوص الثابتة)
عنوان القسم موجود فعلاً حرفياً: `"حيّك في واجهة واحدة"` (مستخدم حالياً كـ `<h2>` في المكوّن) — أبقِه كما هو حرفياً، لا تستبدله بعنوان شاتلي `"حيّك في واجهة واحدة."` (لاحظ شاتلي أضافت نقطة في نهايته — لا داعي لهذه النقطة، طابق النص الحالي حرفاً بحرف).

---

## 4) خريطة الاستبدال الدقيقة (هيكل شاتلي ← تطبيق حقيقي)

نفّذ هذه الاستبدالات أثناء نقل بنية شاتلي إلى `SolutionCatalogHoodScene.tsx` (أو مكوّن جديد يستدعيه إن فضّلت فصل المكوّن الداخلي عن غلاف الصفحة — القرار تقني بحت، لكن الملف المُصدَّر ونقطة الاستدعاء من `SolutionCatalogApp.tsx` يجب ألا يتغيرا):

1. **مصفوفة `products` الوهمية بالكامل ← احذفها.** استقبل `products: readonly SolutionCatalogProduct[]` و `onOpen` كـ props تماماً كما هو الحال الآن (لا تُغيّر توقيع المكوّن المُصدَّر ولا نقطة استدعائه في `SolutionCatalogApp.tsx`).
2. **`product.icon` (مكوّن lucide) ← `<ProductMark logoSrc={product.logoSrc} name={product.nameAr} code={product.code} accent={product.stripe} compact />`** داخل كل من `ProductNode` و `MobileProductList` (بدل `<Icon />`).
3. **`product.tone` ("brick"|"teal"|"mustard") ← `product.stripe` ("brick"|"blue"|"yellow")** — بدّل كل استخدام لـ `toneClasses`/`toneTextClasses` ليعتمد على `stripe` بدل `tone` مع نفس المفهوم (لون تمييز لكل عقدة)، مع تعديل الخريطة نفسها: `brick → var(--sc-brick)`, `blue → var(--sc-blue)`, `yellow → var(--sc-yellow)`.
4. **`product.href` + `window.location.assign` ← `onOpen(product)`.** زر "فتح صفحة {اسم المنتج}" في أسفل البطاقة يجب أن يستدعي `onOpen(activeProduct)` (يفتح `ProductModal` الحقيقية) بدل الانتقال المباشر بالرابط — هذا يحافظ على تجربة المستخدم الحالية الأغنى (تفاصيل + مسار + CTA داخل نافذة) بدل قفزها المباشرة لصفحة المنتج.
5. **حالة "قريباً" الخاصة بـ `matamna` ← احذفها بالكامل.** كل المنتجات الخمسة الحقيقية لها صفحات عاملة؛ لا حاجة لأي زر معطّل.
6. **`HalaqmapMark` (شعار halaqmap العلوي في معاينة شاتلي) ← لا يُنقل.** هذا كان جزءاً من هيدر معاينة شاتلي المستقلة فقط؛ صفحة الفهرس الحقيقية لديها هيدرها الخاص بالفعل (`StoreBrandMark` في `.solution-catalog__header`). لا تُضِف هيدراً ثانياً — انقل فقط ما بداخل `<section>` (الخريطة نفسها) ليحل محل محتوى `SolutionCatalogHoodScene` الحالي، مع إبقاء `<h2 id="catalog-hood-title">حيّك في واجهة واحدة</h2>` كما هو تماماً في مكانه الحالي (أعلى القسم).
7. **`CentralNode` (المركز) ← استبدل شارة "halaqmap" النصية بمكوّن `StoreBrandMark` الحقيقي** (تماماً كما يفعل الكود الحالي في `.solution-catalog__hood-center`)، مع الاحتفاظ بحلقة `--sc-yellow` حوله وتسمية "خريطة الحل" أسفله (هذه موجودة فعلاً في الكود الحالي، فقط أضِف طبقة الحركة/الظل الجديدة من تصميم شاتلي فوقها).
8. **إحداثيات `position: {left, top}` في شاتلي ← استخدم `HOOD_NODE_LAYOUT[product.code]` الحالية** (نفس المفهوم، مصدر بيانات مختلف — إحداثيات موجودة فعلاً بدل معرّفة داخل مصفوفة المنتجات نفسها).
9. **خطوط `ConnectorLines` (SVG) ← طابق منطق `hoodLineColor(product.stripe)` الحالي** بدل اللون الثابت `var(--paper-line)`/`var(--mustard)`: الخط في حالته العادية يأخذ لون الشريحة (`brick`/`blue`/`yellow`) بشفافية منخفضة كما هو الحال الآن (`opacity="0.42"`)، وفي حالة `hover`/`active` يرتفع إلى شفافية كاملة وسماكة أكبر بنفس لون الشريحة (وليس خردلياً موحداً كما في شاتلي) — هذا أدق بصرياً لأن كل عقدة عندنا لها لون مائز أصلاً (كما يظهر في `hoodLineColor`).
10. **الحركة التدريجية عند الظهور (`node-reveal` + `IntersectionObserver`) ← تُنقل كما هي بالضبط**، لكن أضِف قواعد `@keyframes catalog-node-reveal` و`.node-reveal` (القسم 2-أ أعلاه) داخل `storeSolutionCatalog.css` (وليس ملف عام منفصل)، باستخدام `var(--sc-yellow)`/`var(--sc-border)` بدل `var(--mustard)`/`var(--paper-line)`. طبّق نفس معالجة `prefers-reduced-motion: reduce` الموجودة في كود شاتلي.
11. **نسخة الجوال ← استبدال جذري مطلوب.** التصميم الحالي على الجوال شبكة ثابتة بعمودين (`grid-template-columns: repeat(2, ...)`) — هذا **بالضبط ما طلبت صاحبة الحساب تجنبه** ("لا تتحول إلى مربعات مزدحمة"). انقل بنية `MobileProductList` من شاتلي (قائمة رأسية متصلة بخط جانبي، كل عنصر بترتيب دخول متدرج) لتحل محل الشبكة الثنائية الحالية بالكامل تحت `@media (max-width: 640px)` في `storeSolutionCatalog.css`، مع إبقاء `CentralNode`/الشعار أعلى القائمة كما في شاتلي.
12. **بطاقة الوصف عند النقر ← طابق تصميم شاتلي (شريط أسفل الخريطة يعرض اسم المنتج + الفئة + الوصف + زر فتح)** بدل تعديل الوصف الظاهر بـ `:hover` فقط (`.solution-catalog__hood-node-summary` الحالي). اجعل النقر على أي عقدة (سطح المكتب أو الجوال) يحدّث حالة `activeId` داخل المكوّن نفسه (state محلي جديد، لا حاجة لأي تعديل خارج هذا المكوّن) وتُعرض تفاصيل المنتج المختار في الشريط أسفل الخريطة كما في شاتلي — مع تفعيل `onOpen(product)` من زر "فتح صفحة {المنتج}" داخل هذا الشريط تحديداً (وليس عند مجرد النقر على العقدة نفسها، حفاظاً على تجربة "استكشاف سريع بلا مغادرة" التي طلبتها صاحبة الحساب).
13. **حالة hover لخط الاتصال قبل النقر ← مطلوبة صراحة**، تماماً كما في شاتلي (لاحظ آخر تعديل فعلي فعلته شاتلي بنفسها: "إضاءة الخط يجب أن تعمل مع المرور قبل النقر أيضاً، لا مع العقدة المختارة فقط") — نفّذ نفس المنطق: `isActive = activeId === product.id || hoveredId === product.id`.
14. **عدد العقد القابل للتوسعة حتى 7 ← لا تُقفل المنطق على 5.** لا تكتب أي شرط أو تنسيق يفترض عدداً ثابتاً من العقد (لا `grid-cols` ثابتة، لا تموضع يدوي خارج `HOOD_NODE_LAYOUT`)؛ إن أُضيف مستقبلاً رمز سادس/سابع إلى `SOLUTION_CATALOG_HOOD_CODES` و`HOOD_NODE_LAYOUT` في نفس الملف، يجب أن تعمل الخريطة والقائمة الجوالة والحركة المتدرجة بلا أي تعديل إضافي في منطق العرض.

---

## 5) لا تلمس هذه الملفات

- `src/components/store/catalog/SolutionCatalogApp.tsx` — نقطة الاستدعاء (`<SolutionCatalogHoodScene products={hoodProducts} onOpen={openProduct} />`) لا تتغيّر، ولا الشرط `hoodProducts.length === SOLUTION_CATALOG_HOOD_CODES.length` من حولها.
- `src/config/storeSolutionCatalog.ts` — لا تُضِف حقولاً جديدة إلى `SolutionCatalogProduct` (لا `icon`, لا `tone`) إلا إذا تعذّر تقنياً الاستغناء عنها؛ الأفضلية القصوى لاشتقاق كل شيء من `stripe`/`logoSrc`/`code` الموجودين فعلاً.
- `src/components/store/catalog/ProductMark.tsx`، `src/components/store/StoreBrandMark.tsx` — تُستهلكان كما هما بلا تعديل.

## 6) التحقق قبل التسليم

- تشغيل فحص الأنواع/البناء (`type-check` أو ما يعادله في هذا المشروع) والتأكد من خروجه نظيفاً.
- فتح `/store/catalog-lab` والتمرير حتى قسم "حيّك في واجهة واحدة": التحقق من ظهور العقد الخمس بترتيب متدرج عند الوصول إليه (وليس دفعة واحدة)، وأن التمرير السابق لهذا القسم ثم الرجوع إليه لا يُعيد تشغيل الحركة أكثر من مرة (نفس منطق شاتلي: `observer.disconnect()` بعد أول ظهور).
- التحقق من أن المرور بالماوس على أي عقدة يضيء خط الاتصال بلون شريحتها (`brick`/`blue`/`yellow`) قبل أي نقر.
- التحقق من أن النقر على عقدة يحدّث شريط الوصف أسفل الخريطة فوراً بلا أي انتقال صفحة، وأن زر "فتح صفحة {المنتج}" داخل هذا الشريط يفتح فعلياً `ProductModal` الحقيقية (وليس رابطاً خارجياً أو `window.location.assign`).
- التحقق على عرض جوال (< 640px) من أن القسم يعرض قائمة رأسية متصلة بخط جانبي بدل شبكة عمودين، وأن كل عنصر بها نفس تأثير الحركة التدريجية.
- التحقق البصري من أن الألوان المستخدمة كلها من توكينات `.solution-catalog` الحقيقية (`--sc-*`) ولا يوجد أي تسريب لتوكينات شاتلي (`--paper-*`, `--ink`, `--teal`, `--brick`, `--mustard`) في الكود النهائي.
