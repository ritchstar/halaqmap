# بناء تجربة "لوحة شاتلي" الكاملة لمطعمنا1 (Restaurant) — متجر ولوحة تشغيل جديدين بالكامل

## 1) السياق والقرار

بعد إتمام حلانا1، خضارنا1 (Produce)، وتمويناتا1 (Grocers) بنفس أسلوب "شاتلي" (متجر زبون ولوحة تشغيل جديدين، بديلين للتصميم القديم، بلا أي تغيير في منطق الطلب أو الدفع الحقيقي)، الدور الآن على **مطعمنا1 (Restaurant)** — الرابع في القائمة (يليه لاحقاً كافينا1، تمراتنا1، طبختنا1).

**مطعمنا1 مختلف بنيوياً عن الثلاثة السابقة** — قرأت الكود الحالي كاملاً (`StoreRestaurantShop.tsx`, `StoreRestaurantDesk.tsx`, `StoreRestaurantMenuBoard.tsx`, `StoreRestaurantChat.tsx`, `storeRestaurantLiveLab.ts`, `storeRestaurantLive.ts`) وهو يحمل مزيجاً من خاصيتين من المرجعين السابقين وخصائص جديدة تماماً غير موجودة في أي منهما. **اقرأ القسم 4 بعناية فائقة قبل البدء** — فيه كل فرق جوهري يجب الحفاظ عليه دون حذف أو اختراع.

**مرجعاك الرئيسيان هما الكود الفعلي المبني فعلياً لخضارنا1 وتمويناتا1** — اقرأهما سطراً سطراً قبل البدء:
- `src/components/store/produce/ProduceChatlyStorefront.tsx` و `ProduceChatlyDesk.tsx` (المرجع الأساسي لمنطق "المسار الثابت/المتحرك" وبانر البائع المتجول — مطعمنا1 يحتاج هذا الجزء بالضبط، بخلاف تمويناتا1 التي لا تملكه)
- `src/components/store/grocers/GrocersChatlyStorefront.tsx` و `GrocersChatlyDesk.tsx` (المرجع الأساسي لبنية الأقسام العامة وحقل `maskPii` وتنسيق الملفات)
- `src/lib/storeGrocersChatlyUi.ts` و `src/pages/store/StoreGrocersShopPage.tsx` (آلية التفعيل بالضبط — **انسخ منطق التبديل الشرطي فيها حرفياً**، فهي الأحدث والأدق)

المطلوب الآن هو **نفس البنية العامة**، بأسماء ومسارات موازية لمطعمنا1، مع تكييف الفروقات الحقيقية الموضحة في القسم 4 — لا تُدخل أي خدمة أو حقل غير موجود أصلاً في منطق مطعمنا1 الحالي، ولا تحذف أي حقل موجود فيه.

## 2) الملفات الجديدة (لا تُعدَّل ملفات قديمة إلا المذكور في القسم 3)

### أ) `src/components/store/restaurant/RestaurantMatamnaMark.tsx`
دمغة زخرفية لمطعمنا1، بنفس بنية `ProduceKhudaranaMark.tsx`/`GrocersTamwinatMark.tsx` تماماً (نفس الـ props: `className`, `size: 'sm'|'md'|'lg'`, `inverse`، نفس أحجام `size-9/11/14`)، فقط:
- الأيقونة: استخدم `UtensilsCrossed` أو `ChefHat` من `lucide-react` (تمثل المطعم/المطبخ — اختر الأنسب بصرياً).
- الألوان: استخدم لون مطعمنا1 الفعلي `STORE_RESTAURANT_LIVE_ACCENT` (من `@/config/storeRestaurantLive`، القيمة الفعلية `#e08a3c` — طوبي/برتقالي دافئ) بدل أي لون آخر مخترع.
- الـ `aria-label`: "دمغة مطعمنا1".

### ب) `src/components/store/restaurant/RestaurantChatlyStorefront.tsx`
انسخ بنية `GrocersChatlyStorefront.tsx`/`ProduceChatlyStorefront.tsx` (الهيدر، بانر الساعات وبانر البائع المتحرك، القسم البطولي، شريط البحث والفئات، شبكة المنتجات، قسم "المزايا"، الفوتر، سلة عائمة، ونوافذ Dialog: السلة، اختيار طريقة الاستلام، إتمام الطلب) لكن مبنية على منطق مطعمنا1 الحقيقي. **الهوية البصرية يجب أن تنتقل من الطابع الداكن الحالي (`#1a1008`) إلى نفس الطابع الورقي الدافئ الفاتح المعتمد في تجارب شاتلي السابقة (عاجي/كريمي، بطاقات بيضاء)، مع استخدام `#e08a3c` كلون تمييز أساسي بدل الأخضر أو الأصفر المستخدمين في المنتجات الأخرى** — لتبقى الهوية البصرية لكل منتج مميزة كما هو معمول به.

**المصادر التي تستوردها (كلها موجودة فعلاً، لا تُنشئ أي شيء جديد منها):**
- `STORE_RESTAURANT_LIVE`, `STORE_RESTAURANT_LIVE_ACCENT`, `STORE_RESTAURANT_LIVE_LAB_TOKEN` من `@/config/storeRestaurantLive`
- `RestaurantLabState`, `RestaurantOrderLine`, `RestaurantPayMethod`, `RestaurantService`, `restaurantCartTotal`, `readSavedRestaurantBuyer`, `writeSavedRestaurantBuyer` من `@/lib/storeRestaurantLiveLab`
- `STORE_MOBILE_VENDOR`, `neighborVendorState`, `StoreMobileVendorBanner`, `StoreMobileVendorMark` — لعرض حالة "عربة متنقلة" ومنطق `preorder` (**راجع القسم 4-ب — هذا الجزء يُنقل من خضارنا1 حرفياً، وليس من تمويناتا1**)
- `StoreShopHoursBanner`, `isShopClosedNow`, `STORE_SHOP_HOURS_COPY`
- `StoreBuyerLocateButtons` من `@/components/store/StoreBuyerLocateButtons` — **مكوّن جديد لم يظهر في المرجعين السابقين، راجع القسم 4-ج**
- `StoreShopPlacePin`, `StoreShopLogoMark`
- `StoreDirectPayGuest`, `StoreDirectPayPublicMount`
- `StoreRestaurantBuyerChat` من `@/components/store/StoreRestaurantChat` — **ركّبه كما هو بلا أي تعديل** ولا تبحث عن أي علم `chatAddon` (راجع القسم 4-هـ — صندوق المحادثة هنا مُدرج دائماً، غير قابل للتعطيل)
- `NeighborShopEvents`, `readNeighborCartQty`, `writeNeighborCartQty`, `clearNeighborCartQty` إن وُجدت مكافئات لمطعمنا1، وإلا فاستخدم نفس نمط الأحداث باستبدال `'produce'`/`'grocers'` بـ `'restaurant'`
- `RestaurantMatamnaMark` بدل `ProduceKhudaranaMark`/`GrocersTamwinatMark`

### ج) `src/components/store/restaurant/RestaurantChatlyDesk.tsx`
انسخ بنية `GrocersChatlyDesk.tsx`/`ProduceChatlyDesk.tsx` (الشريط الجانبي، الهيدر العلوي **المُصلَح** لمنع تراكب ملاحظة التجربة، وأقسام: نظرة عامة، الطلبات، المنتجات والمخزون، الموقع والساعات، الدفع المباشر، أدوات المشاركة).

**استبدل المصادر بمرادفاتها في مطعمنا1:**
- `STORE_RESTAURANT_LIVE`, `STORE_RESTAURANT_LIVE_ACCENT` بدل نظيرتهما
- `RestaurantLabState`, `RestaurantOrder`, `restaurantWhatsAppText` من `@/lib/storeRestaurantLiveLab`
- **قسم "الطلبات" يجب أن يعتمد بالكامل على دورة حياة التذاكر المشتركة** — راجع القسم 4-د، هذا يختلف جوهرياً عن فلترة الحالة البسيطة في خضارنا1/تمويناتا1
- **قسم "المنتجات والمخزون" يعتمد نموذج التوفر رباعي الحالات** — راجع القسم 4-و، لا تستخدم `toggleStock` بسيط
- ادمج `StoreRestaurantMenuBoard` الموجود فعلاً كما هو (لا تُعد بناءه من الصفر) داخل قسم "المنتجات والمخزون" الجديد، مع تحديث أصنافه البصرية فقط (الألوان/الخطوط) لتتماشى مع هوية شاتلي الفاتحة الجديدة إن لزم، بلا أي تغيير في منطقه (`activateRestaurantDish`, `parseRestaurantListText`, رفع الصور)
- `StoreRestaurantDeskChat` من `@/components/store/StoreRestaurantChat` بدل `StoreProduceDeskChat`/`StoreGrocersDeskChat`
- `RestaurantMatamnaMark` بدل نظيرتها
- `STORE_RESTAURANT_SUPPORT` من `@/config/storeProductSupport`، و `ROUTE_PATHS.STORE_RESTAURANT_SUPPORT`
- `STORE_PRODUCT_TRIAL_PRODUCTS.restaurant.deskNoteAr`

**دعم `maskPii` — بنفس نمط تمويناتا1 بالضبط:** الملف الحالي `StoreRestaurantDesk.tsx` يقبل بالفعل `maskPii?: boolean` (يُستخدم من `StoreRestaurantStudio.tsx` بالفعل بـ `maskPii={isLab}`) ويطبّقه عبر `maskName`/`maskPhone`/`maskPlace` باستخدام `STORE_RESTAURANT_LIVE.labDeskMaskedNameAr/labDeskMaskedPhoneAr/labDeskMaskedPlaceAr` — **انقل نفس الدوال الثلاث بنفس الأسماء والمنطق بلا تعديل** إلى `RestaurantChatlyDesk`، وطبّقها على بطاقات تذاكر المطبخ.

**زر "مذكرة واتساب للتوصيل":** انقل استخدام `restaurantWhatsAppText(order, state.host.shopName, state.host.vendorMode === 'mobile' ? state.host.pickupMapsUrl : '')` بالضبط كما هو — لاحظ تمرير رابط GPS الخاص بموقع العربة **فقط** عندما يكون النشاط متحركاً، وهذا مختلف عن أي شيء في المرجعين.

### د) `src/lib/storeRestaurantChatlyUi.ts`
انسخ `storeGrocersChatlyUi.ts` بالضبط، مع تغيير الاستيراد إلى `STORE_RESTAURANT_LIVE_LAB_TOKEN` من `@/config/storeRestaurantLive`، ومتغيرات البيئة:
- `VITE_STORE_RESTAURANT_CHATLY_UI` (افتراضي معاينة المختبر فقط لو التعميم مطفأ)
- `VITE_STORE_RESTAURANT_CHATLY_UI_ALL` — **مفعّل افتراضياً (`true`)** مباشرة، بنفس قرار تمويناتا1 (لا مرحلة وسيطة "معاينة مختبر فقط")، مع إبقاء `=false` كخيار تراجع طارئ عبر Vercel فقط.
- دالة `isRestaurantChatlyUi(token: string): boolean` بنفس منطق `isGrocersChatlyUi`.

### هـ) `src/styles/restaurantChatly.css`
انسخ `grocersChatly.css` بالكامل، مع:
- تغيير كل بادئة صنف `.grocers-chatly-*` إلى `.restaurant-chatly-*`.
- تغيير متغيرات الألوان لتعكس لون مطعمنا1 (`#e08a3c` بدل `#8fbf7a`)، مع الحفاظ على نفس مستوى التباين.

## 3) الملف الوحيد الذي يُعدَّل: `src/pages/store/StoreRestaurantShopPage.tsx`

طابق **بالضبط** التعديل الذي جرى على `StoreGrocersShopPage.tsx` (هو المرجع الحرفي لهذه الخطوة، وليس تمويناتا1 لأنه لم يُعدَّل توجيهه بعد بنفس الطريقة الكاملة — راجع الكود الحالي لـ `StoreGrocersShopPage.tsx` في المستودع، هو الأحدث والأدق):
- استورد `isRestaurantChatlyUi` من `@/lib/storeRestaurantChatlyUi`، و`RestaurantChatlyDesk`/`RestaurantChatlyStorefront` من `@/components/store/restaurant/*`.
- أضف `const chatlyUi = isRestaurantChatlyUi(safeToken);` و`const chatlyStorefront = chatlyUi && !desk;` و`const chatlyDesk = chatlyUi && desk;`.
- في `StorePurchasedShell`: مرّر `life={!chatlyStorefront}`, `showDevNotice={!chatlyStorefront}`, `showLiveMark={!chatlyStorefront}`, `pageBg={chatlyStorefront || chatlyDesk ? undefined : state.host.shopPageBg}` — طابق هذا حرفياً كما في `StoreGrocersShopPage.tsx`.
- استبدل شرط العرض النهائي: عند `desk` اختر `chatlyUi ? <RestaurantChatlyDesk .../> : <StoreRestaurantDesk .../>`، وعند الواجهة العامة اختر `chatlyUi ? <RestaurantChatlyStorefront state={state} onChange={commit} token={safeToken} /> : (‎<StoreLiveActivityCartShop›...‎</StoreLiveActivityCartShop>)` — أي أن `RestaurantChatlyStorefront` **مكوّن مستقل بذاته لا يُغلَّف بـ `StoreLiveActivityCartShop`**، تماماً كما فعلت `GrocersChatlyStorefront`.
- لا تُغيّر أي شيء آخر في هذا الملف (منطق `payloadToState`, `commit`, الـ `useEffect` الخاص بالمزامنة يبقى كما هو تماماً بلا لمس).

## 4) الفروقات الجوهرية لمطعمنا1 — اقرأها جميعاً قبل الكتابة

### أ) لا توجد خدمة "تعال إلي" (come) إطلاقاً
خلافاً لخضارنا1 (التي تملك تبويب خدمة ثالث "come" مع زر تفعيل GPS وإشعار اقتراب)، مطعمنا1 يملك **فقط** `RestaurantService = 'delivery' | 'pickup'` — بالضبط كتمويناتا1. **لا تُضِف** أي `comeHint`/`watchingCome`/`comeApproachingAr`/زر "تعال إلي" — هذه غير موجودة إطلاقاً في `storeRestaurantLiveLab.ts` ولا في `storeRestaurantLive.ts`.

### ب) لكن منطق "المسار الثابت/المتحرك" موجود بالكامل — انقله من خضارنا1
مطعمنا1 يدعم `state.host.vendorMode === 'mobile'` (عربة متحركة) بنفس آلية خضارنا1: `neighborVendorState({ ...state.host, closed })`، وشرط `preorder = closed || (mobile && neighbor !== 'at_pin')`، وعرض `StoreMobileVendorBanner`/`StoreMobileVendorMark` في الهيدر. **الفرق الوحيد عن خضارنا1:** لا يوجد تبويب خدمة "come" منفصل مرتبط بهذا — بدل ذلك، عندما يكون النشاط متحركاً تُفرض خدمة `pickup` تلقائياً وتُخفى أزرار اختيار الخدمة بالكامل (كما في الكود الحالي: `const serviceKind = mobile ? 'pickup' : service;` ثم في الواجهة `{mobile ? <p>...استلام من العربة...</p> : <div>أزرار توصيل/استلام</div>}`) — انقل هذا الشرط البسيط حرفياً، لا تخترع تبويباً ثالثاً.

### ج) الموقع الدقيق (إحداثيات GPS) بدل صورة واجهة التسليم
مطعمنا1 **لا يملك** `facadeSrc` (صورة واجهة تسليم مرفوعة) كتمويناتا1. بدلاً من ذلك، عند اختيار خدمة `delivery`:
1. حقل نصي عادي لوصف العنوان (`placeDesc` → `buyerPlaceLabelAr`).
2. حقل GPS للقراءة فقط (`placeCoords`، للقراءة فقط `readOnly`) يُعبّأ عبر مكوّن `StoreBuyerLocateButtons` (يستقبل `value`, `accent`, `copy` وهو كائن `STORE_RESTAURANT_LIVE` نفسه لأنه يحوي كل نصوص `locateMeAr`/`locatingAr`/`locateFailAr`/`locateDeniedAr`/`locateSavedAr`/`confirmPlaceAr`/`adoptPlaceAr`، و`onLocated`/`onAdopted`).
3. **خطوة اعتماد إلزامية:** بعد التقاط الإحداثيات، يجب أن يضغط الضيف على "اعتماد الموقع" (`adoptPlaceAr`) — حالة `placeAdopted` تبدأ `false` عند كل التقاط جديد للإحداثيات، وتصبح `true` فقط بعد اعتماد صريح. **الإرسال يُمنع** إن كانت الخدمة `delivery` ولم يُعتمد الموقع بعد (`if (!isLab && !placeAdopted) return;`) — طابق هذا الشرط حرفياً، فهو حماية مهمة ضد إرسال طلب بموقع غير مؤكد.
4. عند الإرسال، يُدمَج الوصف النصي مع رابط الإحداثيات في حقل `place` واحد مفصول بـ ` · ` (نقطة مع مسافتين): `[orderPlaceDesc, orderCoords].filter(Boolean).join(' · ')` — لا تُنشئ حقلاً منفصلاً للإحداثيات في نوع `RestaurantOrder` (هو `place: string` واحد فقط فعلاً).

### د) دورة حياة التذكرة: new → received → done (وليس فلترة حالة بسيطة)
خلافاً لخضارنا1/تمويناتا1 (فلاتر حالة مباشرة على الطلب)، مطعمنا1 يستخدم النظام المشترك في `src/lib/storeDeskOrderTicket.ts`:
- `isLiveDeskTicket(order)` لتصفية التذاكر الحية (غير المؤرشفة).
- `deskOrderPhase(order)` تُرجع `'new' | 'received' | 'done'`.
- اللوحة تعرض التذاكر في مسارين: **"جديد"** (`fresh`, النصوص من `STORE_DESK_ORDER_TICKET_COPY.newLaneAr`) و**"قيد التجهيز"** (`working`, `STORE_DESK_ORDER_TICKET_COPY.receivedLaneAr`) — التذاكر المُنجزة (`done`) تنتقل تلقائياً للأرشيف عبر `applyDeskFinish`.
- زر واحد لكل مرحلة عبر مكوّن `StoreDeskTicketActions` الجاهز (`onReceive`/`onFinish`) — **لا تبني أزرار حالة مخصصة**، استخدم هذا المكوّن كما هو، ومرّر له `order` و`accent="#e08a3c"`.
- `RestaurantOrder` يحمل `ticketNo` (رقم تسلسلي معروض للضيف وفي تذكرة المطبخ) — احرص أن يظهر "تذكرة {ticketNo}" في كل مكان يعرض الطلب، تماماً كالكود الحالي.
- تنبيه صوتي/بصري عند وصول تذكرة جديدة عبر `StoreDeskOrderAlert` الجاهز (`product="restaurant"`, `orderIds={fresh.map(o => o.id)}`, `unreadCount={fresh.length}`) — استخدمه كما هو، لا تُعد بناء منطق التنبيه.

### هـ) صندوق المحادثة مُدرج دائماً — لا يوجد `chatAddon`
خلافاً لخضارنا1 حيث `chatAddon: boolean` حقل في الحالة يتحكم بإظهار/إخفاء صندوق المحادثة، **مطعمنا1 لا يملك هذا الحقل إطلاقاً** — `StoreRestaurantBuyerChat`/`StoreRestaurantDeskChat` يظهران دائماً وبلا شرط. لا تُضِف حقل `chatAddon` إلى `RestaurantLabState` ولا أي تبديل لإظهاره.

### و) توفر الأطباق رباعي الحالات (available / limited / paused / out)
خلافاً لـ `toggleStock` البسيط في خضارنا1/تمويناتا1، مطعمنا1 يستخدم `cycleAvailability(catalogId)` التي تنقل الصنف عبر `STORE_RESTAURANT_AVAILABILITY_ORDER` (ترتيب: `available → limited → paused → out → available`)، وتُشتق `inStock` تلقائياً (`next === 'available' || next === 'limited'`). في واجهة اللوحة، زر واحد يدور بين الحالات الأربع بنص من `restaurantAvailabilityLabel(status)` — انقل هذا حرفياً، لا تبسّطه إلى تفعيل/إيقاف ثنائي.

### ز) طبق اليوم (`today-board`) منفصل عن "الأكثر طلباً" (`featured`)
الرف يحتوي صنفاً بمعرف ثابت `today-board` (يُعرض في قسم "طبق اليوم" المستقل أعلى الصفحة إن وُجد ومرئياً)، بمعزل عن علم `featured` (الذي يغذّي قسم "الأكثر طلباً"، بحد أقصى 8 عناصر). لا تدمج المفهومين — طابق منطق `const today = visible.find((item) => item.catalogId === 'today-board') || featured[0];` كما هو.

### ح) شريط "طبق اليوم" النصي المتحرك (`flashAr`)
منفصل تماماً عن مفهوم "طبق اليوم" في الرف (البند السابق) — هذا شريط نصي حر يُعرض أعلى صفحة الضيف (`state.host.flashAr`)، يُحرَّر من اللوحة عبر حقل `flashLabelAr`. انقله كعنصر واجهة مستقل كما في خضارنا1/تمويناتا1 (كلاهما يملك حقلاً مشابهاً).

## 5) لا تلمس هذه الملفات

- `src/components/store/StoreRestaurantShop.tsx`, `StoreRestaurantDesk.tsx`, `StoreRestaurantMenuBoard.tsx`, `StoreRestaurantChat.tsx` — تبقى كما هي بلا أي تعديل (النسخة القديمة تظل تعمل للرموز التي لا تملك `chatlyUi`)؛ `StoreRestaurantMenuBoard` تحديداً **يُستهلك** داخل `RestaurantChatlyDesk` الجديد كما هو، لا يُعاد بناؤه.
- `src/components/store/StoreRestaurantStudio.tsx` — لا تلمسه (هو مسار معاينة منفصل يستخدم النسخة القديمة).
- `src/lib/storeRestaurantLiveLab.ts`, `src/config/storeRestaurantLive.ts`, `src/config/storeRestaurantMenu.ts` — لا تُضِف حقولاً جديدة إليها إلا إذا تعذّر تقنياً الاستغناء عنها.
- `src/lib/storeDeskOrderTicket.ts` — يُستهلك كما هو، لا يُعدَّل.

## 6) التحقق قبل التسليم

- تشغيل فحص الأنواع/البناء والتأكد من خروجه نظيفاً.
- فتح صفحة الضيف (`/store/restaurant/lab` أو ما يعادل رمز المختبر) والتأكد من: عرض التصميم الجديد بالهوية الفاتحة ولون `#e08a3c`، غياب أي زر "come"، ظهور بانر البائع المتحرك عند `vendorMode === 'mobile'` فقط، ومنع الإرسال عند اختيار توصيل بلا اعتماد موقع.
- فتح لوحة التشغيل والتأكد من: مساري "جديد"/"قيد التجهيز" يعملان عبر `StoreDeskTicketActions`، زر توفر الطبق يدور بين 4 حالات بالترتيب الصحيح، وزر "مذكرة واتساب للتوصيل" يُدرج رابط GPS فقط عند النشاط المتحرك.
- التأكد من أن صندوق المحادثة يظهر دائماً في كلا الجانبين بلا أي علم تفعيل.
- التأكد من أن `maskPii` يعمل بنفس الطريقة المستخدمة في `StoreRestaurantStudio.tsx` الحالية.
- بعد التحقق والدفع، أخبرني لأراجع الفرع فوراً كالمعتاد، ثم ننتقل لكافينا1.
