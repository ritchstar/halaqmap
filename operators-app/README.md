# غلاف iOS — لوحة مشغّلي خريطة الحل

مشروع Capacitor مستقل تماماً عن غلاف المستخدم في `ios/`، ولا يشترك معه في `capacitor.config.ts` ولا في ثوابت `consumerAppShell`.

**بيانات الحزمة**

- `Bundle ID`: `com.halaqmap.operators`
- `Team ID`: `682KF3CDQM`
- الاسم الظاهر: لوحة مشغّلي خريطة الحل
- الإصدار: `1.0` بناء `1`
- اللغة الأساسية: العربية
- نقطة الدخول: `https://store.halaqmap.com/#/store/operators`

المصدر الوحيد لهذه القيم: `src/config/operatorsAppShell.ts`.

**بنية المجلد**

- `capacitor.config.ts`: إعداد الغلاف. تُشغَّل أوامر Capacitor من داخل هذا المجلد وحده.
- `web/`: صفحتان محليتان داخل الحزمة فقط. `index.html` تحويل إلى اللوحة الحيّة، و`offline.html` شاشة انقطاع الاتصال المربوطة بـ `server.errorPath`.
- `ios/App/`: مشروع Xcode المولّد.
- `generate-ios-assets.mjs`: توليد الأيقونة وشاشة الإقلاع عبر Chrome بلا واجهة.
- `patch-xcode-project.mjs`: تثبيت `DEVELOPMENT_TEAM` و`CODE_SIGN_ENTITLEMENTS` بعد أي إعادة توليد للمشروع.

**قبل أول بناء على جهاز macOS**

```bash
npm install
npm install @capacitor/push-notifications
cd operators-app
npx cap sync ios
npx cap open ios
```

حزمة الإشعارات غير مثبّتة في `package.json` بعد؛ تُثبَّت على جهاز البناء ثم يُعاد `cap sync` حتى تدخل قائمة الإضافات في `Package.swift`.

**ما هو مضبوط سلفاً**

- `PRODUCT_BUNDLE_IDENTIFIER` و`DEVELOPMENT_TEAM` في هيئتي `Debug` و`Release`.
- `App/App.entitlements` مع `aps-environment`، وXcode يرفعه إلى `production` عند الأرشفة.
- `UIBackgroundModes` بقيمة `remote-notification`، و`ITSAppUsesNonExemptEncryption` بقيمة `false`، و`CFBundleDevelopmentRegion` بالعربية.
- تسليم رمز جهاز الإشعارات إلى Capacitor داخل `AppDelegate.swift`.
- شاشة إقلاع أصلية بهوية خريطة الحل، وشاشة انقطاع اتصال عربية بدل صفحة WebView فارغة.

**حساب المراجعة**

بريد المراجعة ورمزه يأتيان من متغيّري البيئة `STORE_OPERATORS_REVIEW_EMAIL` و`STORE_OPERATORS_REVIEW_CODE` على Vercel، ولا يُكتبان في هذا المستودع. يُدرج الرمز في `App Store Connect ← Review Notes` عند الإرسال.

**يُرفض داخل الغلاف**

شراء أو سعر أو ميسر أو تجربة، وأي بوابة دفع. إعادة الشراء من واجهة المتجر في المتصفح فقط.
