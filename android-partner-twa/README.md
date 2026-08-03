# غلاف أندرويد — تطبيق الصالون (TWA)

غلاف خفيف من نوع **Trusted Web Activity** يعرض منصة حلاق ماب الحية (`www.halaqmap.com`) دون إعادة رفع نسخة لكل تحديث واجهة.

## المبدأ

- المحتوى = الموقع المنشور (تحديث فوري عبر Vercel).
- الدفع والرخص تُفتح في المتصفح الخارجي من داخل التطبيق (انظر `PartnerExternalCheckoutGate`).
- نقطة الدخول: `/#/partners/app`.

## حالة التوقيع (مكتمل)

| البند | القيمة |
|--------|--------|
| الملف | `android.keystore` (محلي فقط — **لا يُرفع إلى Git**) |
| Alias | `halaqmap-key` |
| الخوارزمية | RSA 2048-bit |
| الصلاحية | 10,000 يوم |
| DN | `CN=Halaq Map, OU=Partners, O=Halaq Map, L=Riyadh, ST=Riyadh, C=SA` |

احفظ كلمة مرور الـ keystore وكلمة مرور الـ alias في مكان آمن خارج المستودع (مدير كلمات مرور / Vercel env خاص بالبناء فقط).

### استخراج بصمة SHA-256 لـ Digital Asset Links

```bash
keytool -list -v -keystore android.keystore -alias halaqmap-key
```

البصمة الحالية (مثبّتة في `assetlinks.json` و`twa-manifest.json`):

`79:64:E5:1A:BF:5C:1E:9A:48:65:04:EF:E3:4E:C4:F7:47:E8:0C:13:CA:81:91:B4:91:1D:23:FC:31:86:5D:74`

بعد الدفع للإنتاج تحقق من:

`https://www.halaqmap.com/.well-known/assetlinks.json`

## الشعار وشاشة التشغيل

المصدر الرسمي: `public/images/halaqmap_logo_refined.png`  
بعد تحديث الشعار شغّل من جذر المستودع:

```bash
npm run pwa:icons
```

يحدّث أيقونات PWA + `splash.png` + `ic_launcher` + `store_icon.png`.  
ثم أعد بناء الحزمة (`bubblewrap build`) وارفع AAB جديداً حتى تظهر شاشة التشغيل الجديدة على الأجهزة المثبّتة.

## البناء عبر Bubblewrap

```bash
npm i -g @bubblewrap/cli
cd android-partner-twa
bubblewrap build
```

أو تهيئة جديدة من المانيفست الحي:

```bash
bubblewrap init --manifest=https://www.halaqmap.com/manifest-partner.json
```

تأكد أن `twa-manifest.json` يشير إلى:

```json
"signingKey": { "path": "./android.keystore", "alias": "halaqmap-key" }
```

## بعد النشر على Play

حدّث في المستودع:

```ts
// src/config/partnerAppShell.ts
export const PARTNER_ANDROID_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.halaqmap.partner';
```

