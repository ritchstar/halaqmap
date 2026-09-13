# تقرير تسليم: بطاقات فهرس "خريطة الحل" بصورة كاملة — لكروسور

**التاريخ:** 2026-09-11
**الحالة:** التعديل **منفَّذ فعليًا** (commit كامل جاهز في patch مرفق) — ينقصه فقط `git am` + `git push` من قِبل كروسور، لأنني لا أملك صلاحية الدفع على هذا المستودع.

---

## 1) الطلب الأصلي

استبدال بطاقات المنتجات العشرة في فهرس "خريطة الحل" (شارة/شعار صغير 64px + نص، الشكل القديم القائم على `ProductMark`) ببطاقة **صورة تعبيرية كاملة** لكل منتج تمثّل هويته/نشاطه الفعلي، مع اسم المنتج مركّبًا فوق الصورة بخط يمزج بين طابع كلاسيكي (الاسم العربي) وطابع حديث (الرقم اللاحق إن وُجد)، لكل المنتجات العشرة بنفس النمط.

هذا التسليم **يلغي ويحل محل** التسليم الأصغر السابق (`catalog_product_images_handoff.md` — مكوّن `ProductMark` بديل بصري صغير). ذلك المكوّن **لم يُحذف** لأنه لا يزال مستخدَمًا في مكان آخر (راجع القسم 3).

---

## 2) لماذا هذا يصل كـ patch لا كـ push مباشر

تحققت فعليًا (وليس افتراضًا) من عدم امتلاكي صلاحية الدفع:

```
$ git push origin main --dry-run
remote: access denied by the git proxy: ritchstar/halaqmap is not in this
        session's authorized repository set...
fatal: unable to access 'https://github.com/ritchstar/halaqmap.git/': 403
```

لذلك نفّذت كامل التعديل في نسخة محلية كاملة من المستودع (استنساخ حقيقي لـ `github.com/ritchstar/halaqmap`، فرع `main`)، عملت commit واحد نظيف، ثم صدّرته كملف patch ثنائي عبر `git format-patch --binary` — يتضمن **الكود والصور العشر معًا** داخل نفس الملف (base64 مضمّن، وليس نص diff فقط).

**تحقّق فعلي قبل التسليم:** طبّقت الـ patch على نسخة نظيفة منفصلة من نفس نقطة `main` (`git am --binary`)، ونجح التطبيق دون تعارضات، وتأكدت أن الصور الناتجة سليمة بايتًا-ببايت (WebP صحيح 1024×1024 لكل الملفات العشرة عبر أداة `file`). هذا ليس كودًا مقترحًا لم يُختبر — هو commit فعلي تم التحقق من قابليته للتطبيق.

**Base commit:** `56858c9bc1abe6ddeb2e29ba746ff7d2facd77a7` ("Update solution catalog hero headline to emphasize custom workflows.") — كان `HEAD` على `main` وقت إعداد هذا التسليم.

---

## 3) ماذا يغيّر الـ commit فعليًا (15 ملفًا، +264/-73 سطر)

| الملف | التغيير |
|---|---|
| `src/config/storeSolutionCatalog.ts` | إضافة حقل `cardImageSrc: string` إلى نوع `SolutionCatalogProduct`، ودالة `solutionCatalogCardImageSrc(code)` (تُرجع `/images/store/catalog/cards/{code}.webp`)، مربوطة بكل المنتجات العشرة (`cardImageSrc: solutionCatalogCardImageSrc('A-01')` وهكذا) |
| `src/components/store/catalog/SolutionCatalogProductCard.tsx` **(ملف جديد)** | بطاقة صورة كاملة: صورة خلفية + تدرّج داكن (`wash`) لوضوح النص + اسم المنتج (Georgia/Times للعربي، خط حديث بارز بلون التمييز للرقم اللاحق) + بديل ورقي (الحرف الأول على خلفية ملوّنة حسب `stripe`) عند تعذّر الصورة عبر `sanitizeStoreProductImageSrc` الموجودة أصلاً في المشروع. الضغط على كامل البطاقة يستدعي `onOpen(product)` — نفس سلوك زر "افتح بطاقة المنتج" القديم بالضبط، فقط بدون الحاجة لزر منفصل |
| `src/components/store/catalog/SolutionCatalogApp.tsx` | استبدال حلقة `<article className="solution-catalog__row...">` (التي كانت تعرض `ProductMark` + نص + زر) بشبكة `<div className="solution-catalog__grid">` من `<SolutionCatalogProductCard>`. **`ProductMark` لم يُحذف من المشروع** — استيراده باقٍ ولا يزال يُستخدم داخل `ProductModal` كشارة صغيرة بجانب عنوان المنتج في نافذة التفاصيل |
| `src/styles/storeSolutionCatalog.css` | إضافة كل أنماط الشبكة والبطاقة الجديدة (`.solution-catalog__grid`, `.solution-catalog__card*`)، وحذف أنماط `.solution-catalog__row*` القديمة الثلاثة (لم تعد مستخدمة بعد هذا التعديل — تحققت أنه لا استخدام آخر لها في المشروع قبل حذفها) |
| `public/images/store/catalog/cards/{a-01,a-02,b-01,b-02,c-01,c-02,d-01,d-02,d-03,e-01}.webp` | الصور العشر، 1024×1024، WebP، توليد أصلي (AI) بأسلوب تعبيري موحّد يعكس نشاط كل منتج فعليًا (صالون حلاقة، صالون نسائي، خضار، بقالة، مطعم، كافيه، لاونج، أفراح، أجواء عامة، بطاقات معايدة) |

**ملاحظة تصميم مهمة:** مسار الصور الجديدة (`/images/store/catalog/cards/`) **منفصل تمامًا** عن مسار الشعارات الصغيرة القديمة (`/images/store/catalog/halaqmap-{code}.webp` التي لا تزال تُستخدم في `ProductMark`/نافذة التفاصيل) — لا تعارض ولا استبدال لملفات موجودة.

---

## 4) خطوات التطبيق والدفع (لكروسور)

```bash
cd halaqmap
git fetch origin
git checkout main
git pull --ff-only origin main

# إن كان main لا يزال عند 56858c9 (أو لم تتغيّر نفس الملفات)، طبّق مباشرة:
git am --binary /path/to/0001-Replace-solution-catalog-rows-with-full-image-produc.patch

# فحص سريع قبل الدفع
npm install
npm run build

git push origin main
```

إن تقدّم `main` عن `56858c9` وظهر تعارض عند `git am`، الأفضل `git am --abort` وتطبيق التعديل يدويًا بالاعتماد على وصف القسم 3 أعلاه بدل محاولة حل تعارض على ملفات صور ثنائية.

**الملفان المرفقان** (تم تسليمهما في رسالة سابقة، ولا حاجة لإعادة إرسالهما إن كانا محفوظين لدى كروسور بالفعل):
- `0001-Replace-solution-catalog-rows-with-full-image-produc.patch`
- `تعليمات_التطبيق_لكروسور.md`

---

## 5) التحقق بعد الدفع

- افتح مسار الفهرس (`STORE_SOLUTION_CATALOG_LAB_PATH` = `/store/catalog-lab`) وتأكد أن كل بطاقة من العشرة تعرض صورتها الصحيحة مطابقة للجدول في القسم 3.
- تأكد أن الضغط على أي بطاقة يفتح نافذة التفاصيل بنفس السلوك السابق (لا تغيير في منطق التنقل/الروابط — هذا التسليم معزول بالكامل في طبقة العرض).
- تأكد أن نافذة التفاصيل (`ProductModal`) لا تزال تعرض شارة `ProductMark` الصغيرة بجانب العنوان كما كانت.
