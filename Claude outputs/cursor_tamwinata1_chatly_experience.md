# بناء تجربة "لوحة شاتلي" الكاملة لتمويناتا1 (Grocers) — متجر ولوحة تشغيل جديدين بالكامل

## 1) السياق والقرار

اليوم بنينا لخضارنا1 (Produce) تجربة عرض جديدة كلياً باسم "Chatly" — متجر زبون ولوحة تشغيل جديدين، بديلين للتصميم القديم، بنفس منطق الطلب والدفع الحقيقي بلا أي تغيير. صاحبة الحساب طلبت الآن تكرار نفس التجربة بالضبط على 5 منتجات أخرى، تدريجياً منتجاً بمنتج. هذا الملف هو أمر البناء الكامل للمنتج الأول في القائمة: **تمويناتا1 (Grocers)**.

بعد هذا المنتج ستُرسل أوامر منفصلة لبقية المنتجات (مطعمنا1، كافينا1، تمراتنا1، طبختنا1) بنفس الأسلوب — لا تنتظر طلباً إضافياً لتمويناتا1 نفسه بعد إتمامه والتحقق منه.

**مرجعك الوحيد والدقيق هو الكود الفعلي المبني اليوم لخضارنا1** — اقرأه سطراً سطراً قبل البدء:
- `src/components/store/produce/ProduceChatlyStorefront.tsx` (واجهة الزبون)
- `src/components/store/produce/ProduceChatlyDesk.tsx` (لوحة التشغيل)
- `src/components/store/produce/ProduceKhudaranaMark.tsx` (الدمغة الزخرفية)
- `src/lib/storeProduceChatlyUi.ts` (آلية التفعيل)
- `src/styles/produceChatly.css` (طبقة الأنماط)
- `src/pages/store/StoreProduceShopPage.tsx` (كيف يتم الاختيار بين القديم والجديد حسب الرمز)

المطلوب الآن هو **نفس البنية بالضبط**، بأسماء ومسارات موازية لتمويناتا1، مع تكييف الفروقات الحقيقية بين المنتجين المذكورة في القسم 4 أدناه — لا تُدخل أي خدمة أو حقل غير موجود أصلاً في منطق تمويناتا1 الحالي، ولا تحذف أي حقل موجود فيه.

## 2) الملفات الجديدة (لا تُعدَّل ملفات قديمة إلا المذكور في القسم 3)

### أ) `src/components/store/grocers/GrocersTamwinatMark.tsx`
دمغة زخرفية لتمويناتا1، بنفس بنية `ProduceKhudaranaMark.tsx` تماماً (نفس الـ props: `className`, `size: 'sm'|'md'|'lg'`, `inverse`, نفس أحجام `size-9/11/14`)، فقط:
- الأيقونة: استخدم `ShoppingBasket` من `lucide-react` بدل `Leaf` (تمثل التموينات/البقالة).
- الألوان: استخدم لون تمويناتا1 الفعلي `STORE_GROCERS_LIVE_ACCENT` (من `@/config/storeGrocersLive`) بدل الأخضر الثابت المكتوب يدوياً في نسخة الخضار — يعني اشتق ألوان الخلفية/الحدود من نفس النخبة اللونية للمنتج بدل تثبيتها، أو إن كان أسهل تقنياً أن تُبقي القيم الست عشرية كما فعلت نسخة الخضار (بما أن Produce ثبّت الألوان يدوياً هناك أيضاً) فاجعلها متجانسة مع لوحة ألوان `#8fbf7a` (لون تمويناتا1 الفعلي الظاهر في `StoreGrocersShop.tsx`/`StoreGrocersDesk.tsx` الحالية) بدل الأخضر الغامق الخاص بالخضار.
- الـ `aria-label`: "دمغة تمويناتا1".

### ب) `src/components/store/grocers/GrocersChatlyStorefront.tsx`
انسخ بنية `ProduceChatlyStorefront.tsx` بالكامل (نفس الأقسام: الهيدر، شريط الفلاش، بانر الساعات وبانر البائع المتجول، القسم البطولي Hero، شريط البحث والفئات اللاصق، شبكة المنتجات، قسم "المزايا"، قسم "متجر مستقل"، الفوتر، سلة عائمة أسفل الشاشة، ونوافذ Dialog: السلة، اختيار طريقة الاستلام، إتمام الطلب) لكن مبنية على منطق تمويناتا1 الحقيقي بدل الخضار:

**المصادر التي تستوردها (كلها موجودة فعلاً، لا تُنشئ أي شيء جديد منها):**
- `STORE_GROCERS_LIVE`, `STORE_GROCERS_LIVE_ACCENT`, `STORE_GROCERS_LIVE_LAB_TOKEN`, `grocersCatalogImage` من `@/config/storeGrocersLive`
- `GrocersLabState`, `GrocersOrderLine`, `GrocersPayMethod`, `grocersCartTotal`, `readSavedGrocersBuyer`, `writeSavedGrocersBuyer`, `compressImageFile` من `@/lib/storeGrocersLiveLab`
- `STORE_MOBILE_VENDOR`, `neighborVendorState`, `StoreMobileVendorBanner`, `StoreMobileVendorMark` — لعرض حالة "عربة متنقلة" (نفس ما تفعله `StoreGrocersShop.tsx` الحالية، القسم الخاص بـ `mobile`/`neighbor`/`StoreShopPlacePin`)
- `StoreShopHoursBanner`, `isShopClosedNow`, `STORE_SHOP_HOURS_COPY` — لمنطق الإغلاق والطلب المسبق `preorder`
- `StoreDirectPayGuest`, `StoreDirectPayPublicMount` — الدفع المباشر كما هو
- `StoreGrocersBuyerChat` من `@/components/store/StoreGrocersChat` — **ركّبه كما هو بلا أي تعديل**؛ هذا المكوّن يتولى داخلياً إظهار/إخفاء قناة الاستفسار حسب `state.chatAddon`، فلا حاجة لإعادة بناء منطق الدردشة
- `NeighborShopEvents`, `readNeighborCartQty`, `writeNeighborCartQty`, `clearNeighborCartQty` — نفس تتبع الأحداث المستخدم في خضارنا1 (بنفس النمط، استبدل `'produce'` بـ `'grocers'` في كل نداء)
- `GrocersTamwinatMark` بدل `ProduceKhudaranaMark`

**الفرق الجوهري الوحيد في منطق الطلب — اقرأ هذا جيداً:**
- تمويناتا1 **لا تملك خدمة "تعال إلي" (come)**. خدمتا الاستلام هما فقط: `delivery` (توصيل) و `pickup` (استلام من المحل) — بالضبط كما في `StoreGrocersShop.tsx` الحالية (`type GrocersService = 'delivery' | 'pickup'`). **لا تُضِف** أي منطق `come`/`comeHint`/`watchingCome`/`buyerLat`/`buyerLng`/`requestProduceComeNotify` من نسخة الخضار — هذا كله خاص بالبائع المتجول عند الخضار وغير موجود في منتج التموينات إطلاقاً.
- شارة "عربة متنقلة" (`StoreMobileVendorMark`/`StoreShopPlacePin`/`vendorMode==='mobile'`) **موجودة فعلاً في تمويناتا1** (نفس `vendorMode` من `ShopPickupPlace` المشترك) وتُستخدم فقط لعرض الحالة والموقع — انقلها كما هي من `StoreGrocersShop.tsx`، بلا خدمة "come" مرتبطة بها.
- عند إتمام الطلب: أضف حقل رفع صورة اختيارية لموضع التسليم (`facadeSrc`) بالضبط كما في `StoreGrocersShop.tsx` (الدالة `onFacade` + `compressImageFile(file, 900)`)، ويظهر فقط عندما تكون الخدمة `delivery` وليست معاينة مختبر (`!isLab && needsPlace`)، مع نص الحقل `STORE_GROCERS_LIVE.buyerFacadeLabelAr` و`buyerFacadeHintAr`.
- بيانات الطلب المُرسلة يجب أن تطابق شكل `GrocersOrder` تماماً (id, name, phone, place, facadeSrc, pay, service, lines, total, at, seen) — لا تُسقط `facadeSrc` ولا تُضِف حقولاً غير موجودة في النوع.

**نقاط تصميم أخرى يجب مطابقتها من نسخة الخضار:**
- نفس هيكل الفئات (`categories`) المبني من `item.category` — لاحظ أن `GrocersShelfItem` يملك `featured: boolean` بدل `arrivedToday`، فبدل فئة "وصل اليوم" اجعل فئة إضافية اختيارية "الأكثر طلباً" تعرض العناصر التي `featured === true` إن وُجدت، متسقة مع `STORE_GROCERS_LIVE.featuredTitleAr` الحالي.
- ألوان الواجهة: لا تنسخ لوحة ألوان الخضار الخضراء الداكنة حرفياً؛ استخدم نفس نمط الطبقة (خلفية فاتحة دافئة، بطاقات بيضاء، إلخ) لكن مع لون `STORE_GROCERS_LIVE_ACCENT`/`#8fbf7a` كلون تمييز أساسي بدل `#3f7440`، لتبقى هوية كل منتج مميزة بصرياً كما هي الحال بين المنتجات الأخرى في المشروع.
- لا `isLab` ولا نص `STORE_PRODUCE_LIVE.labDemoNameAr` — استخدم مرادفاتها في `STORE_GROCERS_LIVE` (`labDemoNameAr`, `labDemoPhoneAr`, `labDemoPlaceAr` — كلها موجودة فعلاً).

### ج) `src/components/store/grocers/GrocersChatlyDesk.tsx`
انسخ بنية `ProduceChatlyDesk.tsx` بالكامل (الشريط الجانبي `aside` بالتنقل بين الأقسام، الهيدر العلوي بنفس بنية `produce-chatly-desk-header__top/start/actions` **المُصلَحة اليوم** لمنع تراكب ملاحظة التجربة، وأقسام: نظرة عامة، الطلبات، المنتجات والمخزون، الموقع والساعات، الدفع المباشر، أدوات المشاركة).

**استبدل المصادر بمرادفاتها في تمويناتا1:**
- `STORE_GROCERS_LIVE`, `STORE_GROCERS_LIVE_ACCENT` بدل نظيرتهما
- `GrocersLabState`, `GrocersOrder`, `grocersWhatsAppText` من `@/lib/storeGrocersLiveLab`
- `StoreGrocersIngest` من `@/components/store/StoreGrocersIngest` بدل `StoreProduceIngest` — لتحديث السلع (تمويناتا1 لا تملك مفهوم "وصل اليوم"، فقسم "المنتجات والمخزون" يعرض فقط تفعيل/إيقاف التوفر `toggleStock`، بلا `toggleArrived`)
- `StoreGrocersDeskChat` من `@/components/store/StoreGrocersChat` بدل `StoreProduceDeskChat`
- `StoreGrocersBuyerChat`/`StoreGrocersDeskChat` تُدير داخلياً حالة `chatAddon` — لا تبني تبديلاً يدوياً لتفعيلها
- `GrocersTamwinatMark` بدل `ProduceKhudaranaMark`
- `STORE_GROCERS_SUPPORT` من `@/config/storeProductSupport` بدل `STORE_PRODUCE_SUPPORT`، و `ROUTE_PATHS.STORE_GROCERS_SUPPORT` بدل `ROUTE_PATHS.STORE_PRODUCE_SUPPORT`
- `STORE_PRODUCT_TRIAL_PRODUCTS.grocers.deskNoteAr` بدل `.produce`

**دعم `maskPii` — مهم، هذا خاص بتمويناتا1 وغير موجود في خضارنا1:**
انظر `StoreGrocersDesk.tsx` الحالي: يقبل `maskPii?: boolean` ويستخدمه في دوال `displayName`/`displayPhone`/`displayPlace` لإخفاء بيانات العميل الحقيقية عند العرض كمعاينة (تُستخدم من `StoreGrocersStudio.tsx`). أضف نفس الـ prop والدوال إلى `GrocersChatlyDesk` وطبّقها في بطاقات تذاكر الطلب (مكافئ `OrderTicketCard` في نسخة الخضار)، حتى لو لم يُستخدم فوراً — حافظ على توافق الواجهة البرمجية مع الاستخدام الحالي.

**قسم المنتجات والمخزون:** بما أن `GrocersShelfItem` لا يملك `arrivedToday`، لا تبني زر "وصل اليوم" في `GrocersChatlyDesk` — فقط زر تفعيل/إيقاف التوفر (`toggleStock`)، ويمكنك عرض شارة "الأكثر طلباً" (`featured`) بدل شارة "وصل اليوم" إن أردت إبراز شيء مشابه بصرياً.

**عرض صورة واجهة التسليم في تذكرة الطلب:** كما في `StoreGrocersDesk.tsx` الحالي — إن وُجد `order.facadeSrc` (وليس `maskPii`)، اعرضه كصورة صغيرة داخل بطاقة التذكرة.

### د) `src/lib/storeGrocersChatlyUi.ts`
انسخ `storeProduceChatlyUi.ts` بالضبط، مع تغيير الاستيراد إلى `STORE_GROCERS_LIVE_LAB_TOKEN` من `@/config/storeGrocersLive`، ومتغيرات البيئة:
- `VITE_STORE_GROCERS_CHATLY_UI` (افتراضي معاينة المختبر فقط لو التعميم مطفأ)
- `VITE_STORE_GROCERS_CHATLY_UI_ALL` — **اجعله مفعّلاً افتراضياً (`true`)** مباشرة، أي طبّق مباشرة الحالة النهائية التي وصلنا إليها اليوم مع خضارنا1 بعد كل تجاربها (تفعيل Chatly لكل الرموز)، بدل المرور بمرحلة "معاينة المختبر فقط" ثم تفعيل لاحق — نحن نعرف الآن أن التصميم جاهز وصالح للنشر المباشر. أبقِ `VITE_STORE_GROCERS_CHATLY_UI_ALL=false` كخيار تراجع طارئ فقط عبر Vercel، تماماً كما هو موثّق في تعليق الكود الحالي لخضارنا1.
- دالة `isGrocersChatlyUi(token: string): boolean` بنفس منطق `isProduceChatlyUi`.

### هـ) `src/styles/grocersChatly.css`
انسخ `produceChatly.css` بالكامل، مع:
- تغيير كل بادئة صنف `.produce-chatly-*` إلى `.grocers-chatly-*` (الجذر، جذر اللوحة، الهيدر وأقسامه الفرعية، الأزرار).
- تغيير متغيرات الألوان (`--pc-accent` وما شابه، أو أعد تسميتها إلى `--gc-*` إن كان أوضح) لتعكس لون تمويناتا1 (`#8fbf7a` بدل `#3f7440`)، وبقية الدرجات المرتبطة به بما يحافظ على نفس مستوى التباين المستخدم في نسخة الخضار.
- **مهم:** طبّق مباشرة بنية الهيدر **المُصلَحة اليوم** (`__top`, `__start`, `__brand`, `__title-block`, `__actions`, `__trial-note` كصف منفصل تحت الهيدر) — لا تبدأ من النسخة القديمة قبل الإصلاح ثم تُصلحها لاحقاً؛ هذا هو الدرس المستفاد من اليوم وسبب طلب هذا التنفيذ الكامل من البداية.
- أضِف سطر الاستيراد `@import "./styles/grocersChatly.css";` في `src/index.css` بجانب سطر `produceChatly.css` الموجود (لا تحذف سطر الخضار).

## 3) التعديل الوحيد المطلوب على ملف قائم: `src/pages/store/StoreGrocersShopPage.tsx`

طبّق **بالضبط** نفس نمط التفريع الموجود الآن في `StoreProduceShopPage.tsx`:
1. استورد `GrocersChatlyDesk`, `GrocersChatlyStorefront`, و `isGrocersChatlyUi` من `@/lib/storeGrocersChatlyUi`.
2. أضف `const chatlyUi = isGrocersChatlyUi(safeToken);` بجانب تعريف `isLab`.
3. عرّف `chatlyStorefront = chatlyUi && !desk;` و `chatlyDesk = chatlyUi && desk;` بنفس الأسلوب.
4. مرّر `life={!chatlyStorefront}`, `showDevNotice={!chatlyStorefront}`, `showLiveMark={!chatlyStorefront}`, و`pageBg={chatlyStorefront || chatlyDesk ? undefined : state.host.shopPageBg}` إلى `StorePurchasedShell` — **لاحظ أن `StoreGrocersShopPage.tsx` الحالي يمرر `life` (بلا شرط) و`pageBg` دائماً**؛ عدّلها لتُصبح مشروطة تماماً كما في نسخة الخضار الآن.
5. أضف نفس أصناف `className` الشرطية على الحاوية (`chatlyDesk && '-mx-3 sm:-mx-4'`, `chatlyStorefront && '-mx-3 sm:-mx-4'`) ونفس رسائل التحميل/الخطأ الملوّنة بحسب `chatlyStorefront || chatlyDesk`.
6. داخل `gate === 'ok'`: فرّع مثل نسخة الخضار — إذا `desk` و`chatlyUi` اعرض `<GrocersChatlyDesk .../>` (بنفس props المُمرَّرة اليوم لـ `StoreGrocersDesk`: `state`, `onChange={commit}`, `shopUrl`, `token={safeToken}`, `showTrialNote={isTrial}`) وإلا اعرض `<StoreGrocersDesk .../>` القديمة كما هي بلا أي تغيير. وبالمثل للمتجر: `chatlyUi` يعرض `<GrocersChatlyStorefront state={state} onChange={commit} token={safeToken} />` وإلا يبقى مسار `StoreLiveActivityCartShop` + `StoreGrocersShop` القديم كما هو تماماً.

**لا تُعدّل أي سطر آخر في هذا الملف** — كل منطق التحميل (`payloadToState`, `fetchGrocersLivePublic`, `saveGrocersLiveHost`, الطلبات، الدردشة) يبقى كما هو بلا أي مساس.

## 4) قواعد التمديد الآمن (إلزامية)

- **لا تُعدّل** `StoreGrocersDesk.tsx` ولا `StoreGrocersShop.tsx` القديمتين بأي شكل — تبقيان كما هما تماماً، لأنهما تُستخدمان الآن كخيار تراجع طارئ عبر `VITE_STORE_GROCERS_CHATLY_UI_ALL=false`.
- **لا تلمس** `StoreGrocersStudio.tsx` (المعاينة الحية داخل صفحة الهبوط التسويقية) — هذه بقيت بلا تغيير أيضاً عند بناء Chatly لخضارنا1 (لم تُمس `StoreProduceStudio.tsx`)، فطبّق نفس القرار هنا: تجربة Chatly الجديدة خاصة بالمتجر الحقيقي (`/v/:token` و`/v/:token/desk`) فقط، وليست بصفحة الهبوط التجريبية.
- **لا تلمس** أي منتج آخر (خضارنا1 نفسه، مطعمنا1، كافينا1، تمراتنا1، طبختنا1، حلانا1) ولا أي مكوّن مشترك (`StoreDeskControlTitle`, `StoreBrandMark`, `StoreShopIdentityDesk`, إلخ) — الاستخدام هنا هو استيراد وقراءة فقط، بلا أي تعديل على تلك الملفات.
- **لا تُغيّر** منطق الطلب أو الدفع أو حفظ البيانات في `api/` أو `src/lib/storeGrocersLiveRemote.ts` أو `src/lib/storeGrocersLiveLab.ts` — هذا العمل بصري/هيكلي بحت (واجهة جديدة فوق نفس المنطق الحقيقي)، بالضبط كما وُصف تعليق الكود لخضارنا1: "هيكل Chatly مع منطق halaqmap الحقيقي".
- إن احتجت أي حقل أو دالة غير موجودة حالياً في `storeGrocersLiveLab.ts` لإتمام التصميم، **لا تُضِفها بنفسك بتغيير الملف** — إن كانت حقاً ضرورية أبلغ عنها في ملاحظاتك بدل تنفيذها، لأن كل الحقول المطلوبة لتطابق تصميم خضارنا1 موجودة فعلاً في تمويناتا1 كما وثّقنا أعلاه.

## 5) بعد التنفيذ

1. تأكد أن `npm run build` أو `tsc` يمر بلا أخطاء.
2. ادفع (commit + push) برسالة commit واضحة تصف البناء (بالإنجليزية، بنفس أسلوب رسائل commit اليوم لخضارنا1، مثل: "Add Chatly storefront and operations desk for tamwinata1 grocers").
3. أخبرني بأي ملاحظة فنية أو قرار اتخذته أثناء التنفيذ يستحق المراجعة (خصوصاً أي مكان اضطررت فيه للانحراف عن التطابق الحرفي مع نسخة خضارنا1)، حتى أراجعه وأتحقق منه بنفسي قبل الانتقال للمنتج التالي (مطعمنا1).
