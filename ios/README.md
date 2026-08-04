# تطبيق المستخدم على iOS — Capacitor (Live URL)

غلاف أصلي خفيف لتطبيق **حلاق ماب** على آيفون للمستخدمين فقط.

| البند | القيمة |
|--------|--------|
| الحزمة | `com.halaqmap.consumer` |
| الاسم | حلاق ماب |
| المحتوى | `https://www.halaqmap.com` (Live URL — تحديث فوري من Vercel) |
| الدفع داخل التطبيق | **لا** (لا IAP) |
| الشريك / الدفع / الطاقم | تُفتح في Safari عبر `ConsumerNativeShellGate` |

## المتطلبات

1. حساب **Apple Developer** (حوالي 99$/سنة).
2. جهاز **macOS** مع Xcode (البناء والأرشفة لا يكتملان على Windows).
3. من جذر المستودع بعد أي تغيير في الإعدادات:

```bash
npm run ios:sync
npm run ios:open
```

على Mac داخل Xcode:

1. اختر Team التوقيع (Signing & Capabilities).
2. اضبط Deployment Target مناسباً (iOS 14+ مقبول).
3. Product → Archive → Distribute App → App Store Connect.

## أوامر مفيدة

```bash
# تحديث الأيقونة/الإقلاع + مزامنة Capacitor
npm run ios:sync

# فتح المشروع في Xcode (macOS)
npm run ios:open
```

## مراجعة App Store (ملخص)

- التطبيق مجاني، بدون مشتريات.
- وضّح في الوصف: اكتشاف صالونات وتواصل — لا حجز مدفوع داخل التطبيق.
- اربط سياسة الخصوصية: `https://www.halaqmap.com/privacy-policy`
- أذونات الموقع: نص الاستخدام موجود في `Info.plist` (`NSLocationWhenInUseUsageDescription`).
- Guideline 4.2: الغلاف يحمل شاشة إقلاع وأيقونة وتجربة مستخدم كاملة من المنصة الحيّة؛ مسارات B2B خارج Safari.

## بعد النشر

حدّث في المستودع:

```ts
// src/config/consumerAppShell.ts
export const CONSUMER_IOS_APP_STORE_URL = 'https://apps.apple.com/app/idXXXXXXXX';
```
