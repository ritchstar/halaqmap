# تكليف كروسور — ميزة "جاهز الآن" لحلانا1 (عرض جاهز مصوّر + تفعيل/إيقاف من لوحة المتخصصة)

**إلى:** كروسور
**المنتج:** حلانا1 فقط (لا يمس أي منتج آخر)
**الحالة:** ميزة جديدة موازية بالكامل — لا تمسّ نظام "الأعمال" (works) ولا مسار الطلب المسبق الحالي إطلاقاً.

---

## 1) السياق والقرار

صاحبة الحساب راجعت النظام الحالي لتبويب "جاهز للطلب" في `HalanaActivityShowcase.tsx` ووجدته نصياً بالكامل (`readyLines`: حقل نصي حر تُفصل أسطره بـ"—" إلى عنوان/تفاصيل، بلا صور، عبر `parseReadyLine` في `src/lib/storeHalanaActivityDraft.ts`). القرار: استبداله بنظام "جاهز الآن" مصوّر ومنظّم، تديره المتخصصة بنفسها من لوحتها، مع مفتاح تفعيل/إيقاف عام للقسم كله.

**المطلوب بالضبط:**
1. قسم جديد "جاهز الآن" في لوحة المتخصصة (`HalanaDeskStudio.tsx`) — ترفع فيه **صورة + نص** لكل عنصر، مع إمكانية إضافة حتى **15 حقلاً/عنصراً** (عنصر واحد أو أكثر).
2. مفتاح تفعيل/إيقاف مستقل (صلاحية المتخصصة): تُفعّل "جاهز الآن" أو تُعطّله بالكامل — عند التعطيل يختفي القسم/الأيقونة تماماً من صفحة العميلة.
3. عند التفعيل، تظهر **أيقونة "جاهز الآن" بارزة** لعميلات المتخصصة في صفحة العميلة (`HalanaActivityShowcase.tsx`).
4. **لا تغيير على مسار الطلب المسبق الحالي**: يبقى كما هو تماماً — يعتمد على اختيار العميلة عملاً من "أعمال المتخصصة" (تبويب `works` + `WorkSheet` + نموذج الطلب `/h/{token}/order`)، ثم تختار الإضافات/الخيارات، ويكتمل الإجراء بنفس الآلية المتبعة حالياً بدون أي تعديل على منطق الطلب أو الدفع.

---

## 2) البنية التقنية — مرآة تماماً لنظام المعرض (gallery) الموجود فعلاً

راجعنا الكود الفعلي؛ يوجد نظام مطابق تماماً لما نحتاجه بالفعل وهو نظام "معرض الأعمال" (`gallery`) في:
- `api/_lib/storeHalanaLive.ts` — جدول `STORE_HALANA_GALLERY_TABLE = 'store_halana_gallery'` (أعمدة: `id, copy_id, caption, image_src, item_kind, sort_order, created_at`)، ودوال `listHalanaGallery` / `addHalanaGallery` / `updateHalanaGalleryCaption` / `removeHalanaGallery`.
- `api/public-store-halana-live.ts` — أفعال (`action`) في نقطة `POST`: `add_gallery` / `update_gallery` / `remove_gallery`.
- `src/components/store/halana/HalanaDeskStudio.tsx` — `GalleryUploadButton` + `onUpload`/`onSaveCaption`/`onRemove` (رفع بضغط الصورة عبر `compressImageFile` من `@/lib/storeWeddingLiveLab`، وحد أقصى للحجم `STORE_HALANA_IMAGE_MAX_CHARS`).

**المطلوب: أنشئ نظاماً موازياً مطابقاً بنفس الأسلوب تماماً — جدول/أفعال/واجهة منفصلة، وليس إعادة استخدام جدول `gallery` نفسه** (حتى لا يختلط مصدر "جاهز الآن" بمصدر "الأعمال" المستخدم في الطلب المسبق):

### أ) قاعدة البيانات
- جدول جديد (اقترح `store_halana_ready_items`، عدّل الاسم إن رأيت تعارضاً) بنفس بنية `store_halana_gallery`: `id, copy_id, text, image_src, sort_order, created_at` (استخدم `text` بدل `caption` لأن هذا نص وصفي أساسي لا وصف ثانوي).
- عمود جديد على `store_halana_copies` (نفس جدول باقي حقول المضيف/host): `ready_enabled boolean default false` — بنفس نمط عمود `accepting_orders` الموجود بالضبط.
- طبّق نفس التسامح الدفاعي الموجود في `listHalanaGallery`/`addHalanaGallery` تجاه أعمدة قد تكون غير مهاجَرة بعد (نفس نمط `isHalanaSchemaColumnMissing`) إن كان ذلك مناسباً لطريقة الترحيل (migration) المتبعة لديك.

### ب) الدوال (في `api/_lib/storeHalanaLive.ts`)
أضف (بنفس التوقيع/الأسلوب تماماً):
- `listHalanaReadyItems(db, copyId)` — مرآة `listHalanaGallery`، بحد أقصى **15** عنصراً (`STORE_HALANA_READY_MAX = 15`، ثابت جديد بجانب `STORE_HALANA_GALLERY_MAX` في `src/config/storeHalanaLive.ts`).
- `addHalanaReadyItem(db, copyId, input)` — مرآة `addHalanaGallery` (يتحقق من الحد الأقصى 15، يطلب `imageSrc` صالحاً + `text`).
- `updateHalanaReadyItem(db, copyId, itemId, text)` — مرآة `updateHalanaGalleryCaption` (بدون `itemKind` — لا حاجة له هنا).
- `removeHalanaReadyItem(db, copyId, itemId)` — مرآة `removeHalanaGallery`.
- عدّل `publicCopyPayload` لإضافة: `readyItems: <نتيجة listHalanaReadyItems>` و `readyEnabled: row.ready_enabled === true` (افتراضي `false` — القسم مُعطّل حتى تُفعّله المتخصصة صراحة).
- عدّل `saveHalanaHost` لقبول `input.readyEnabled` بنفس أسلوب معالجة `input.acceptingOrders` تماماً (تحديث `ready_enabled` في نفس الاستدعاء، وأرجع `readyEnabledSaved` في نتيجة الحفظ مثل `acceptingOrdersSaved`).

### ج) نقطة الـ API (`api/public-store-halana-live.ts`)
أضف ثلاثة أفعال جديدة في `POST` بنفس نمط `add_gallery`/`update_gallery`/`remove_gallery` بالضبط:
- `add_ready_item` → `addHalanaReadyItem`
- `update_ready_item` → `updateHalanaReadyItem`
- `remove_ready_item` → `removeHalanaReadyItem`

وفي معالجة `save_host` الحالية، أضف `readyEnabledSaved: saved.readyEnabledSaved !== false` إلى الاستجابة (بجانب `acceptingOrdersSaved` الموجودة).

### د) `src/lib/storeHalanaLiveRemote.ts`
أضف دوال استدعاء مساعدة مطابقة لما هو موجود لإجراءات المعرض (إن وُجدت هناك دوال مخصصة تُغلّف `postHalanaAction` للمعرض؛ إن كانت `HalanaDeskStudio.tsx` تستدعي `postHalanaAction` مباشرة كما رأينا، فاتبع نفس الأسلوب المباشر لعناصر "جاهز الآن" أيضاً).

---

## 3) واجهة لوحة المتخصصة (`HalanaDeskStudio.tsx`)

### أ) قسم جديد "جاهز الآن" (بجانب/بعد قسم المعرض الحالي مباشرة، بنفس الأسلوب البصري)
- استنسخ نمط `GalleryUploadButton` + `onUpload` (نفس الضغط عبر `compressImageFile`، نفس حدود `STORE_HALANA_IMAGE_MAX_CHARS`) لكن استدعِ فعل `add_ready_item` بدل `add_gallery`.
- كل عنصر (بطاقة) يعرض: الصورة + حقل نص (`text`) قابل للتعديل والحفظ (زر حفظ يستدعي `update_ready_item`)، وزر حذف يستدعي `remove_ready_item`.
- عدّاد واضح: "كم عنصراً من أصل 15" (بنفس نمط `copy.galleryCountAr(gallery.length, STORE_HALANA_GALLERY_MAX)` الحالي — أضف نص مكافئ جديد في `STORE_HALANA_LIVE_COPY` أو ملف نصوص مناسب، مثل `readyItemsCountAr`).
- عند بلوغ 15 عنصراً، عطّل زر الإضافة مع رسالة واضحة (نفس نمط رسالة "بلغت الصور الحد الأعلى" الموجودة في `addHalanaGallery`).

### ب) مفتاح تفعيل/إيقاف "جاهز الآن"
- أضف تبديلاً (toggle) مستقلاً عن `acceptingOrders` — استنسخ **نفس** تصميم/سلوك مفتاح `onToggleAccepting`/`halana-desk-availability` الموجود في `HalanaDeskHeader` (نفس الألوان/الأنماط)، لكن كمفتاح ثانٍ خاص بـ"جاهز الآن" (ضعه داخل قسم "جاهز الآن" نفسه في الصفحة، وليس بالضرورة في الهيدر العلوي — القرار البصري لك، المهم نفس منطق زر/حالة `acceptingOrders`).
- عند التبديل: نداء `postHalanaAction({ action: 'save_host', token, readyEnabled: next })` (بنفس نمط `void saveHost({ acceptingOrders: next })` الحالي).
- نصوص عربية جديدة مطابقة النمط الحالي (`deskAcceptingOnAr`/`deskAcceptingOffAr`/`deskAcceptingHintAr`) — مثلاً: `deskReadyOnAr` ("جاهز الآن مفعّل ويظهر لعميلاتك")، `deskReadyOffAr` ("جاهز الآن غير مفعّل")، `deskReadyHintAr` (شرح مختصر).

---

## 4) واجهة صفحة العميلة (`HalanaActivityShowcase.tsx`)

### أ) الأيقونة/الشارة البارزة
- عندما `readyEnabled === true` **و** يوجد عنصر واحد على الأقل في `readyItems`: أظهر شارة/أيقونة بارزة "جاهز الآن" — مكان مقترح: أعلى الصفحة قرب اسم المتجر/الشعار (منطقة الهيدر العلوي لصفحة العميلة)، بلون/نمط مميز يلفت الانتباه (يمكنك الاستلهام من أسلوب `STORE_HALANA_LIVE_ACCENT` الموجود إن كان مناسباً لونياً). عند الضغط عليها تنتقل مباشرة لتبويب "جاهز الآن" (انظر البند التالي).
- عندما `readyEnabled === false` أو لا توجد عناصر: لا تظهر الشارة إطلاقاً، ولا تظهر أي أثر لقسم "جاهز الآن" — الصفحة تبدو تماماً كما هي الآن.

### ب) تبويب "جاهز الآن" (`tab === 'ready'`)
- استبدل عرض `ready.map(parseReadyLine)` النصي الحالي بعرض `readyItems` (صورة + نص) — بطاقة لكل عنصر تشبه بصرياً بطاقات `WorkThumb`/معرض الأعمال (صورة بارزة + نص تحتها)، وليس بالضرورة نفس بطاقة `halana-activity-ready-card` النصية الحالية.
- **أبقِ** زر "اطلبي هذا الخيار" يعمل بنفس الآلية الحالية تماماً (ينتقل إلى `/h/{token}/order` عبر `saveHalanaActivityDraft` بنفس أسلوب الكود الحالي في هذا التبويب، مع تمرير نص العنصر كسياق) — **لا تُنشئ مسار دفع/تأكيد فوري جديداً**؛ هذا خارج نطاق هذا التكليف تماماً. الهدف الآن هو العرض والإدارة فقط، وليس تغيير آلية إتمام الطلب.
- إن كان `readyEnabled === false`، أخفِ التبويب نفسه من شريط التبويبات (`nav`) بالكامل — لا داعي لعرض تبويب فارغ أو معطّل.

### ج) لا تلمس إطلاقاً
- تبويب `works` وكل منطق `WorkSheet`/`filteredWorks`/`filterGallery`/معرض "من التنفيذ" — هذا هو مصدر الطلب المسبق ويبقى كما هو 100%.
- حقل `readyLines` النصي القديم وحقل `readyPreorderAr`/`readyPricingAr` — لا تحذفها من الكود إن كانت لا تزال مستخدمة في مكان آخر؛ فقط لم نعد نعرضها في تبويب "جاهز الآن" الجديد. إن تأكدت أنها غير مستخدمة في أي مكان آخر، اسألني قبل حذفها.
- منطق الدفع/التأكيد/`postHalanaAction` الخاص بالطلبات نفسها (`add_request`, `save_pay`, إلخ).

---

## 5) قيود عامة

- المقاس والضغط لصور "جاهز الآن": استخدم نفس حدود/أسلوب ضغط صور المعرض تماماً (`compressImageFile`, `STORE_HALANA_IMAGE_MAX_CHARS`) — لا تُدخل مكتبة أو آلية ضغط جديدة.
- لا تُعدّل أي شيء في منتجات أخرى (خضارنا1، تمويناتا1، طبختنا1، إلخ) — هذا التكليف خاص بحلانا1 حصراً.
- الحالة الافتراضية لكل نسخ حلانا1 الحالية: `ready_enabled = false` — لا يظهر شيء لأي متخصصة حالية حتى تُفعّله بنفسها بوعي.
- إن كان تصميم قاعدة البيانات (Supabase) يتطلب خطوة SQL/migration يدوية من جهتك خارج الكود (إنشاء الجدول الجديد + العمود الجديد)، وضّح لي ذلك صراحة في ردك بعد الدفع حتى أتابعه معك، فهذا الجزء الوحيد الذي لا يمكنني التحقق منه بنفسي عبر الكود فقط.

---

## 6) بعد الدفع

أرسل لي وصف الملفات المتغيّرة (وأي خطوة SQL/migration يدوية مطلوبة منك أو مني)، وسأتحقق كالعادة: سحب + `tsc` + مراجعة ديف + معاينة حية على لوحة متخصصة حلانا1 تجريبية (رفع عنصر بصورة، تفعيل/تعطيل الحقل، التأكد من ظهور/اختفاء الأيقونة والتبويب في صفحة العميلة تبعاً لذلك) — على سطح مكتب وهاتف.
