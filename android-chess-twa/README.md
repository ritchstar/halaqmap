# غلاف أندرويد — شطرنج حلاق ماب (TWA)

غلاف خفيف من نوع **Trusted Web Activity** يعرض صفحة الشطرنج الحية (`www.halaqmap.com/#/chess`) دون إعادة رفع نسخة لكل تحديث واجهة.

## المبدأ

- المحتوى = صفحة `/#/chess` المنشورة فعلياً (تحديث فوري عبر Vercel، بلا رفع نسخة جديدة إلا عند تغيير الغلاف نفسه).
- بلا إشعارات (`enableNotifications: false`) — لعبة بلا حساب، لا حاجة لخدمة تفويض إشعارات.
- بلا اختصارات (shortcuts) في الإصدار الأول — نقطة دخول واحدة مباشرة للعبة.
- نقطة الدخول: `/#/chess`.

## حالة التوقيع (مكتمل — تم توليده تلقائياً)

| البند | القيمة |
|--------|--------|
| الملف | `android.keystore` (محلي فقط — **لا يُرفع إلى Git**) |
| Alias | `halaqmap-chess-key` |
| الخوارزمية | RSA 2048-bit |
| الصلاحية | 10,000 يوم |
| DN | `CN=Halaq Map, OU=Chess, O=Halaq Map, L=Riyadh, ST=Riyadh, C=SA` |

كلمة مرور الـ keystore وكلمة مرور الـ alias سُلّمتا في المحادثة عند التوليد — احفظهما فوراً في مدير كلمات مرور. **فقدان هذا الملف أو كلمة مروره يعني عدم القدرة على رفع أي تحديث مستقبلي لنفس التطبيق على Google Play.**

لبناء **AAB موقّع** عبر Gradle (مطلوب لـ Play Console):

1. انسخ `android-keys.env.example` → `android-keys.env`
2. املأ `STORE_PASSWORD` و `KEY_PASSWORD` بالقيمتين المُسلَّمتين
3. من مجلد المشروع:

```bash
./gradlew bundleRelease
```

الملف الناتج: `app/build/outputs/bundle/release/app-release.aab`
إن ظهرت رسالة Play «All uploaded bundles must be signed» فالحزمة المرفوعة غير موقّعة — أعد البناء بعد ضبط `android-keys.env`.

### استخراج بصمة SHA-256 لـ Digital Asset Links (لإعادة التحقق عند الحاجة)

```bash
keytool -list -v -keystore android.keystore -alias halaqmap-chess-key
```

البصمة الحالية (مثبّتة في `assetlinks.json` و`twa-manifest.json`):

`76:1C:9C:D3:AB:7D:F1:04:20:56:4E:F4:3C:18:0B:34:0F:58:F4:4F:87:99:16:CE:DF:E8:98:05:3E:7A:A7:B3`

بعد الرفع للإنتاج تحقق من:

`https://www.halaqmap.com/.well-known/assetlinks.json`

يجب أن يحتوي على عنصر بحزمة `com.halaqmap.chess` وهذه البصمة تحديداً — وإلا سيظهر التطبيق بشريط عنوان متصفح (فشل التحقق الرقمي).

## الشعار وشاشة التشغيل

المصدر: `public/images/chess/chess-knight-brand-mark.webp` (نفس الأيقونة الظاهرة حالياً في صفحة `/chess`).
النُسخ المولَّدة منه لأغراض الغلاف والمتجر:

- `public/images/chess/chess-app-icon-512.png` — أيقونة عادية (حواف كاملة، كما تظهر في المتصفح)
- `public/images/chess/chess-app-icon-512-maskable.png` — نسخة بهامش أمان 28% لقصّ أنظمة أندرويد (دائرة/مربع مقوّس) دون قصّ الشعار
- `store_icon.png` (داخل هذا المجلد) — لقائمة Play Store

لو تغيّر الشعار مستقبلاً، أعد توليد الأحجام الثلاثة من المصدر الجديد ثم أعد البناء ورفع AAB جديد حتى تظهر الأيقونة الجديدة على الأجهزة المثبّتة.

## البناء عبر Bubblewrap

```bash
npm i -g @bubblewrap/cli
cd android-chess-twa
bubblewrap build
```

أو تهيئة جديدة من المانيفست الحي (بعد نشر `manifest-chess.json` على الموقع):

```bash
bubblewrap init --manifest=https://www.halaqmap.com/manifest-chess.json
```

تأكد أن `twa-manifest.json` يشير إلى:

```json
"signingKey": { "path": "./android.keystore", "alias": "halaqmap-chess-key" }
```

## بعد النشر على Play

حدّث رابط المتجر في المستودع أينما يُعرض للمستخدمين (مثال: بطاقة داخل صفحة `/chess` أو `/partners/marketing` إن أضيفت لاحقاً):

```
https://play.google.com/store/apps/details?id=com.halaqmap.chess
```
