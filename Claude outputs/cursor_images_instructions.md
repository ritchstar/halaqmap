# تعليمات لكروسور — إضافة الصور الحقيقية لبطاقتي B-03/B-04

## الوضع

تم دفع commit `8b5c7111` بنجاح ويضيف مُدخلي B-03 (طبختنا1) وB-04 (حلانا1) للكتالوج، لكن بدون صور بعد (`logoSrc: null`, `cardImageSrc: ''`) — لهذا تظهران بحرف أول كبديل مؤقت في المعاينة.

بما أن نسختك من بطاقات الصور الكاملة (`8db3be49`) مبنية بشكل مستقل عن نسختي، لن أرسل لك commit جاهز للـ cherry-pick هذه المرة تجنبًا لأي تعارض. بدلًا من ذلك، هذه 4 ملفات صور جاهزة + تعديل نصي بسيط جدًا (سطرين فقط) تطبّقه يدويًا.

## مصدر الصور (للتوثيق فقط، لا حاجة لإعادة توليدها)

- **طبختنا1 (B-03)**: مُولّدة من صورة الـ hero الرسمية الموجودة أصلاً في `storeKitchenLive.heroImage` (`/images/store/kitchen-hero-marketing.jpg`).
- **حلانا1 (B-04)**: مُولّدة من صورة الـ hero الرسمية لحلانا1 (`/images/store/halana/halana-hero-table.jpg`).

## الملفات المرفقة (4 ملفات webp)

| الملف المرفق | ضعه في | الاستخدام |
|---|---|---|
| `halaqmap-b-03.webp` | `public/images/store/catalog/halaqmap-b-03.webp` | شارة الفهرس المربعة (logoSrc) لطبختنا1 |
| `halaqmap-b-04.webp` | `public/images/store/catalog/halaqmap-b-04.webp` | شارة الفهرس المربعة (logoSrc) لحلانا1 |
| `cards-b-03.webp` | `public/images/store/catalog/cards/b-03.webp` | صورة بطاقة الفهرس الكاملة (cardImageSrc) لطبختنا1 — نفس مقاس بقية البطاقات 1024×1024 |
| `cards-b-04.webp` | `public/images/store/catalog/cards/b-04.webp` | صورة بطاقة الفهرس الكاملة (cardImageSrc) لحلانا1 — نفس مقاس بقية البطاقات 1024×1024 |

**تنبيه على التسمية**: ملفي البطاقات مُسمّيان هنا `cards-b-03.webp` و`cards-b-04.webp` (بادئة cards- لتجنب تعارض الاسم مع ملف الشارة عند التنزيل)، لكن عند وضعهما في المشروع يجب أن يُعاد تسميتهما إلى `b-03.webp` و`b-04.webp` بالضبط (بدون بادئة) داخل مجلد `public/images/store/catalog/cards/`.

## التعديل النصي المطلوب في `src/config/storeSolutionCatalog.ts`

ابحث عن مُدخل B-03 وغيّر السطرين:
```ts
logoSrc: null,
cardImageSrc: '',
```
إلى:
```ts
logoSrc: solutionCatalogMarkSrc('B-03'),
cardImageSrc: solutionCatalogCardImageSrc('B-03'),
```

وبنفس الطريقة لمُدخل B-04:
```ts
logoSrc: solutionCatalogMarkSrc('B-04'),
cardImageSrc: solutionCatalogCardImageSrc('B-04'),
```

(هاتان الدالتان `solutionCatalogMarkSrc` و`solutionCatalogCardImageSrc` موجودتان أصلاً في أعلى نفس الملف لديك بما أن نسختك أيضًا تستخدم `cardImageSrc field + helper` — إن كانت بأسماء مختلفة لديك استخدم المكافئ عندك.)

## بعد التعديل

```bash
npx tsc --noEmit
git add public/images/store/catalog/halaqmap-b-03.webp public/images/store/catalog/halaqmap-b-04.webp public/images/store/catalog/cards/b-03.webp public/images/store/catalog/cards/b-04.webp src/config/storeSolutionCatalog.ts
git commit -m "Add real catalog images for tabkhatuna1 and halana1"
git push origin main
```
