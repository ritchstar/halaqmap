# تعليمات لكروسور — دفع تعديلات كتالوج المنتجات (halaqmap)

## السياق

مشروع "جار الحي" لإعادة تصميم صفحات حلانا1، خضارنا1، تمويناتا1، طبختنا1 (عبر Chatly) انتهى بالكامل من ناحية التصميم. بالتوازي، تم اكتشاف وإصلاح فجوة في **الكود الحقيقي** لموقع halaqmap.com: طبختنا1 وحلانا1 كانا غائبين تمامًا عن كتالوج المنتجات الظاهر (`src/config/storeSolutionCatalog.ts`)، رغم أنهما منتجان فعليان يعملان.

هذا الإصلاح تم في جلسة Claude سحابية منفصلة عن جهازك، وأصبح لديها الآن **commit محليان غير مدفوعين** لأن تلك الجلسة لا تملك صلاحية push على مستودع `ritchstar/halaqmap` (يظهر خطأ 403 من الـ git proxy الخاص بها). الحل: تطبيق نفس التعديلين على نسختك المحلية (كروسور) التي تملك صلاحية الدفع، ثم دفعهما من هناك.

## الملف المرفق

`halaqmap-catalog-updates.bundle` — حزمة git (git bundle) تحتوي **كلا الـ commitين غير المدفوعين** بالكامل (بما فيها الصور الثنائية webp)، جاهزة للاستيراد المباشر بدون الحاجة لإعادة كتابة أي diff يدويًا.

القاعدة الأساسية (base) التي بُني عليها البندل هي:
```
56858c9 Update solution catalog hero headline to emphasize custom workflows.
```
وهذا هو نفس commit الموجود حاليًا على origin/main وقت إنشاء البندل — إن كانت نسختك المحلية محدّثة (`git pull` حديث) فستُطبَّق الحزمة عليها بلا أي تعارض.

## الخطوات المطلوبة منك (كروسور)

1. احفظ الملف المرفق `halaqmap-catalog-updates.bundle` في مكان تصل إليه، ثم داخل مجلد مشروع halaqmap المحلي:

```bash
cd /path/to/local/halaqmap   # مجلد المشروع لديك
git fetch /path/to/halaqmap-catalog-updates.bundle HEAD:incoming-catalog-updates
```

2. تحقق أن الفرع الجديد يحتوي الـ commitين المتوقعين:

```bash
git log --oneline incoming-catalog-updates -3
```
يجب أن تشاهد بالترتيب من الأحدث:
```
8e04f2f Generate real catalog marks and cards for tabkhatuna1 and halana1
8f31fa8 Add tabkhatuna1 and halana1 to the solution catalog
5524351 Replace solution catalog rows with full-image product cards
56858c9 Update solution catalog hero headline to emphasize custom workflows.   <- القاعدة المشتركة
```

3. **مهم جدًا قبل الدمج**: تحقق إن كان عندك محليًا بالفعل تعديل مشابه لـ commit `5524351` (بطاقات صور كاملة للكتالوج) — سبق أن قيل إنك نفّذته بنفسك مباشرة في وقت سابق. إن كان موجودًا لديك فعلاً بشكل مكافئ:
   - لا تدمج `5524351` (قد يسبب تعارضًا أو ازدواجية)، بل استخرج الـ commitين الآخرين فقط (وهما الإصلاح الفعلي: إضافة طبختنا1 وحلانا1 للكتالوج + صورهما الحقيقية) عبر:
     ```bash
     git cherry-pick 8f31fa8 8e04f2f
     ```
   إن لم يكن `5524351` موجودًا لديك إطلاقًا:
   - ادمج الثلاثة بالترتيب:
     ```bash
     git checkout main
     git merge incoming-catalog-updates
     ```

4. راجع الفرق نهائيًا:
```bash
git diff main origin/main -- src/config/storeSolutionCatalog.ts
```

5. تأكد أن فحص الأنواع نظيف (تم التحقق منه مسبقًا في الجلسة السحابية ومرّ بلا أخطاء، لكن يُفضّل إعادة التأكد محليًا):
```bash
npx tsc --noEmit
```

6. ادفع:
```bash
git push origin main
```

7. احذف الفرع المؤقت إن رغبت:
```bash
git branch -D incoming-catalog-updates
```

## ملخص ما يضيفه commit 8f31fa8 (الإصلاح الأساسي)

في `src/config/storeSolutionCatalog.ts`:
- إضافة **B-03 طبختنا1**: فئة "جار الحي"، نموذج قائمة + تذكرة طلب، دفع بلا عمولة عند الاستلام، رابطها `ROUTE_PATHS.STORE_KITCHEN` (`/store/kitchen`).
- إضافة **B-04 حلانا1**: فئة "جار الحي"، نموذج معرض أعمال + طلب مخصص بعرض سعر، رابطها `ROUTE_PATHS.STORE_HALANA` (`/store/halana`).
- تحديث نص العداد في رأس الصفحة من "10 منتجات" إلى "12 منتجًا".

## ملخص ما يضيفه commit 8e04f2f (صور حقيقية بدل البديل المؤقت)

الـ commit الأول ترك `logoSrc: null` و`cardImageSrc: ''` لكلا المنتجين (بطاقة بحرف أول كبديل مؤقت). هذا الـ commit يستبدلها بصور حقيقية:
- أضاف B-03 وB-04 إلى `scripts/build-store-solution-catalog-marks.mjs` باستخدام صورتي hero الرسميتين الموجودتين أصلاً في الكود (`storeKitchenLive.heroImage` لطبختنا1، و`storeHalanaLive` hero لحلانا1).
- ولّد شارتي الفهرس المربعتين: `public/images/store/catalog/halaqmap-b-03.webp` و`halaqmap-b-04.webp`.
- ولّد صورتي بطاقة 1024×1024 بنفس مقاس بقية المنتجات: `public/images/store/catalog/cards/b-03.webp` و`b-04.webp`.
- ربط الحقلين `logoSrc`/`cardImageSrc` في الكتالوج بالصور الجديدة.

لا تعديل على حلاق ماب أو كوافير ماب — هذان المنتجان خارج نطاق هذا العمل تمامًا.

## ملاحظة عن فحصي للفجوات الأخرى

راجعت أيضًا بشكل موسّع بقية "قوائم المنتجات" في الكود (توجيه المسارات في App.tsx، لوحة التشغيل، سجل شهادات الملكية الفكرية SAIP، خلفيات "سماء المتجر" الزمنية، مختبر الأنماط الداخلي) للتأكد من عدم وجود فجوات مشابهة أخرى لطبختنا1 وحلانا1. لم أجد أي فجوة حقيقية إضافية: كل استثناء آخر لحلانا1 كان موثّقًا ومقصودًا في تعليقات الكود نفسها (مثل: حلانا1 غير مسجّلة في سجل SAIP العلني لأنها فعليًا بلا شهادة تسجيل مصنف، وملف "سماء المتجر" مخصص فقط لأدوات السلة الثلاث). فجوة الكتالوج كانت الفجوة الحقيقية الوحيدة، وقد أُصلحت بالكامل الآن.
