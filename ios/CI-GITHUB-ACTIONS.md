# أتمتة iOS على GitHub Actions (بدون Mac محلي)

Workflow: [`.github/workflows/ios-consumer-appstore.yml`](../.github/workflows/ios-consumer-appstore.yml)

يبني ويؤرشف `com.halaqmap.consumer` على **macOS runner** ويرفع الـ IPA إلى **App Store Connect / TestFlight** عبر **App Store Connect API Key** مع التوقيع التلقائي (`CODE_SIGN_STYLE=Automatic` + `-allowProvisioningUpdates`).

## دقائق GitHub المجانية (مهم)

| نوع المستودع | ملاحظة |
|--------------|--------|
| عام (public) | دقائق Actions مجانية؛ macOS مسموح ضمن سياسة GitHub |
| خاص (private) | الخطة المجانية تشمل دقائق محدودة، و**macOS يُحسب ≈ 10×** دقيقة Linux |

الـ workflow يعمل **يدوياً فقط** (`workflow_dispatch`) حتى لا يستهلك الدقائق مع كل push.

## إعداد لمرة واحدة في Apple

1. سجّل التطبيق في [App Store Connect](https://appstoreconnect.apple.com) بالمعرّف:
   - Bundle ID: `com.halaqmap.consumer`
   - الاسم: حلاق ماب
2. من [Apple Developer → Users and Access → Integrations → App Store Connect API](https://appstoreconnect.apple.com/access/integrations/api):
   - أنشئ مفتاحاً بصلاحية **Admin** أو **App Manager**
   - حمّل ملف `.p8` (يُعرض مرة واحدة)
   - احفظ: **Key ID** و **Issuer ID**
3. تأكد أن حساب الفريق يملك شهادات Distribution (التوقيع التلقائي ينشئ/يحدّث الـ profiles عند البناء).

## أسرار GitHub (Settings → Secrets and variables → Actions)

| Secret | المحتوى |
|--------|---------|
| `IOS_DEVELOPMENT_TEAM` | Team ID (10 أحرف) من عضوية Apple Developer |
| `APP_STORE_CONNECT_KEY_ID` | Key ID للمفتاح |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID |
| `APP_STORE_CONNECT_KEY_BASE64` | محتوى ملف `.p8` مرمّز base64 (سطر واحد) |

### ترميز ملف المفتاح (على جهازك)

```bash
# macOS / Linux
base64 -i AuthKey_XXXXXXXXXX.p8 | tr -d '\n' > asc-key.b64

# Windows (Git Bash)
base64 -w0 AuthKey_XXXXXXXXXX.p8 > asc-key.b64
```

الصق محتوى `asc-key.b64` في السر `APP_STORE_CONNECT_KEY_BASE64`.  
**لا ترفع** ملف `.p8` أو الـ base64 إلى Git.

## تشغيل البناء

1. GitHub → **Actions** → **iOS Consumer App Store** → **Run workflow**
2. خيارات:
   - `upload`: ارفعه إلى App Store Connect (افتراضي: نعم)
   - `marketing_version`: مثل `1.0.0` (اختياري)
   - `build_number`: اتركه فارغاً لاستخدام رقم تشغيل Actions
3. بعد النجاح:
   - Artifact: `halaqmap-consumer-ios-ipa`
   - في App Store Connect: البناء يظهر تحت TestFlight بعد المعالجة

## ماذا يفعل الـ workflow؟

1. `npm ci` + `npm run ios:sync` (Capacitor Live URL)
2. `xcodebuild archive` مع مصادقة API وتحديث provisioning تلقائي
3. `xcodebuild -exportArchive` → IPA
4. `xcrun altool --upload-app` إن كان `upload=true`

## استكشاف أخطاء شائعة

| العَرَض | السبب المحتمل |
|---------|----------------|
| Secret … is missing | لم تُضف الأسرار الأربعة |
| No profiles for team | Team ID خاطئ أو المفتاح بلا صلاحية كافية |
| Bundle identifier unavailable | لم يُنشأ `com.halaqmap.consumer` في Developer / App Store Connect |
| Authentication failed | Key ID / Issuer / محتوى `.p8` غير متطابق |
| Timeout / دقائق Neg | نفاد رصيد macOS — انتظر دورة الشهر أو قلّل التشغيلات |

## حدود الواقعية

- ما زلت تحتاج **حساب Apple Developer (≈99$/سنة)** — Actions لا تلغي ذلك.
- أول رفع يحتاج إكمال بيانات المتجر (خصوصية، لقطات، تصنيف) يدوياً في Console.
- Live URL يعني أن المحتوى يأتي من الإنتاج؛ رفع IPA مطلوب عند تغيير الغلاف الأصلي فقط (أيقونة، أذونات، نسخة Capacitor).

## المصادقة والترميز محلياً

```bash
node scripts/encode-asc-api-key.mjs /path/to/AuthKey_XXXXXXXXXX.p8
# الصق الناتج في GitHub Secret: APP_STORE_CONNECT_KEY_BASE64
```

إذا فشل التوقيع التلقائي رغم صحة المفتاح، غالباً يلزم إنشاء App ID + تفعيل Automatic Signing مرة من Xcode على أي Mac، أو إضافة شهادة Distribution يدوياً لاحقاً كمسار احتياطي.
