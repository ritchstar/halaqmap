# غلاف أندرويد — لوحة مشغّلي خريطة الحل (TWA)

غلاف خفيف من نوع **Trusted Web Activity** يعرض لوحة المشغّلين الحية على `store.halaqmap.com` دون إعادة رفع نسخة لكل تحديث واجهة.

هذا الغلاف مستقل عن تطبيق الصالون `com.halaqmap.partner`. لا ترفع حزمة حلاق ماب إلى هذا التطبيق.

## المبدأ

- المحتوى = الموقع المنشور على نطاق المتجر (تحديث فوري عبر Vercel).
- نقطة الدخول: `/#/store/operators`.
- الحزمة: `com.halaqmap.operators`.
- اللقب الظاهر: **لوحة مشغّلي خريطة الحل**.
- بلا شراء وبلا أسعار وبلا تجربة داخل الغلاف.

## حالة التوقيع

| البند | القيمة |
|--------|--------|
| الملف | `android.keystore` (محلي فقط — **لا يُرفع إلى Git**) |
| Alias | `halaqmap-operators-key` |
| الخوارزمية | RSA 2048-bit |
| DN | `CN=Halaq Map, OU=Operators, O=Halaq Map, L=Riyadh, ST=Riyadh, C=SA` |

احفظ كلمة مرور الـ keystore وكلمة مرور الـ alias في مكان آمن خارج المستودع.

لبناء **AAB موقّع** عبر Gradle:

1. انسخ `android-keys.env.example` → `android-keys.env`
2. املأ `STORE_PASSWORD` و `KEY_PASSWORD`
3. من مجلد الغلاف:

```bash
./gradlew.bat bundleRelease
```

الملف الناتج: `app/build/outputs/bundle/release/app-release.aab`

### استخراج بصمة SHA-256 لـ Digital Asset Links

```bash
keytool -list -v -keystore android.keystore -alias halaqmap-operators-key
```

البصمة الحالية لمفتاح الرفع (مثبّتة في `assetlinks.json` و`twa-manifest.json`):

`2B:CF:4F:45:F3:7C:40:BF:83:EF:E0:D4:19:AA:82:18:83:1A:B1:D5:4E:0F:45:B8:B9:72:D5:36:51:32:A4:87`

بعد أول رفع إلى Play فعّل **Play App Signing** ثم أضف بصمة مفتاح التوقيع من الكونسول إلى `public/.well-known/assetlinks.json` إن اختلفت عن بصمة مفتاح الرفع.

بعد الدفع للإنتاج تحقق من:

`https://store.halaqmap.com/.well-known/assetlinks.json`

## الشعار وشاشة التشغيل

المصدر: `public/images/halaqmap-store-mark-radar-square-1200x1200.png`  
بعد تحديث العلامة شغّل من جذر المستودع:

```bash
npm run pwa:icons
```

## بعد النشر على Play

حدّث في المستودع إن تغيّر الرابط:

```ts
// src/config/storeOperatorsAppShell.ts
export const STORE_OPERATORS_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.halaqmap.operators';
```
