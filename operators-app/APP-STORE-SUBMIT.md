# رفع غلاف iOS — لوحة مشغّلي خريطة الحل

دليل تنفيذ على **macOS** فقط. Windows/Cursor لا يوقّع ولا يرفع إلى App Store Connect.

## بيانات ثابتة

| الحقل | القيمة |
| --- | --- |
| Bundle ID | `com.halaqmap.operators` |
| Team ID | `682KF3CDQM` |
| App Store Connect | لوحة مشغّلي خريطة الحل — iOS 1.0 |
| نقطة الدخول | `https://store.halaqmap.com/#/store/operators` |

## 1. التحضير (مرة واحدة)

```bash
git clone https://github.com/ritchstar/halaqmap.git
cd halaqmap/operators-app
npm install
npm run prepare:ios
npm run open
```

`prepare:ios` يثبّت فريق التوقيع وملف الاستحقاقات ثم يُزامِن إضافة `@capacitor/push-notifications` في `Package.swift`.

## 2. داخل Xcode

1. Target **App** → **Signing & Capabilities**
   - Team: حساب Halaq Map (`682KF3CDQM`)
   - Bundle Identifier: `com.halaqmap.operators`
   - Signing: Automatic
2. تأكد أن **Push Notifications** ظاهرة تحت Capabilities (مفعّلة مسبقاً في App ID).
3. **General** → Version `1.0`، Build `1` (زِد Build عند كل رفع).
4. اختر جهاز **Any iOS Device (arm64)** — لا Simulator للأرشفة.

## 3. الأرشفة والرفع

1. **Product → Archive**
2. **Distribute App → App Store Connect → Upload**
3. انتظر المعالجة في App Store Connect (عادة 15–30 دقيقة).

## 4. App Store Connect — مراجعة آبل

**Review Notes** (انسخ كما هو، مع الرمز من Vercel):

```text
حساب تجريبي للمراجعة:
البريد: appreview@halaqmap.com
الرمز: [STORE_OPERATORS_REVIEW_CODE من Vercel — مثلاً 883528]

بعد تسجيل الدخول تظهر «طبختنا1 — مطبخ تجريبي للمراجعة».
اضغط «افتح لوحة النشاط» لرؤية تذاكر الطلب وبنك الأصناف والإعدادات.
لا يوجد شراء داخل التطبيق؛ المحتوى حي من store.halaqmap.com.
```

**Privacy:** لا جمع بيانات حساسة في الغلاف؛ الجلسة محلية والمحتوى من الخادم.

**Encryption:** `ITSAppUsesNonExemptEncryption = false` — اختر «No» لاستخدام التشفير المعياري.

## 5. الإشعارات (اختياري لـ v1.0)

الغلاف **مهيّأ** لاستقبال رمز الجهاز (`AppDelegate` + `App.entitlements`).

إرسال push فعلي يحتاج لاحقاً:

- مفتاح APNs (.p8) في متغيّرات Vercel
- endpoint يسجّل `device token` ويرسل تنبيهات تشغيلية

يمكن إرسال v1.0 للمراجعة بدون push حي إن قبلت آبل الغلاف الوظيفي؛ أو تنفيذ APNs قبل Submit إن طُلب صراحة.

## 6. تحقق سريع قبل Submit

- [ ] تسجيل دخول `appreview@halaqmap.com` + الرمز من Vercel
- [ ] ظهور «طبختنا1 — مطبخ تجريبي للمراجعة»
- [ ] فتح لوحة النشاط بلا شاشة فارغة
- [ ] انقطاع Wi‑Fi يُظهر شاشة «لا يوجد اتصال» العربية
- [ ] Review Notes تحتوي البريد والرمز

## مرجع

- ثوابت الغلاف: `../src/config/operatorsAppShell.ts`
- إعداد Capacitor: `capacitor.config.ts`
- README عام: `README.md`
