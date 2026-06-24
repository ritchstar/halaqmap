# ربط بنك الأول (SAB) — OPPWA / HyperPay

## نظرة عامة

مسار SAB يعتمد بوابة **OPPWA** (HyperPay) المعتادة لدى البنوك السعودية:

| المكوّن | المسار |
|---------|--------|
| إنشاء جلسة الدفع | `POST /api/sab-create-checkout` |
| التحقق بعد العودة | `GET /api/verify-sab-payment` |
| Webhook التفعيل | `POST /api/sab-webhook` |
| ودجت الواجهة | `src/lib/sabFormLoader.ts` + `Payment.tsx` |

نفس عمود `barber_subscriptions.moyasar_payment_id` يخزّن معرّف checkout SAB، مع `metadata.payment_gateway = SAB`.

## متغيرات البيئة (Vercel)

```env
PAYMENT_ENV=test   # أو live

# Sandbox
SAB_OPPWA_API_BASE_TEST=https://eu-test.oppwa.com/v1
SAB_ENTITY_ID_TEST=<entityId من البنك>
SAB_ACCESS_TOKEN_TEST=<Bearer token>
SAB_WEBHOOK_TEST_SECRET=<رمز عشوائي طويل>

# Live (من بنك الأول بعد الاعتماد)
SAB_OPPWA_API_BASE_LIVE=
SAB_ENTITY_ID_LIVE=
SAB_ACCESS_TOKEN_LIVE=
SAB_WEBHOOK_LIVE_SECRET=
```

أسماء بديلة مدعومة: `SAB_MERCHANT_ID_*`، `SAB_SECRET_*`.

## تفعيل في لوحة الإدارة

**لوحة إدارة المنصة → بوابات الدفع** → فعّل «مسار بنك الأول (SAB)».

## Webhook

سجّل لدى البنك:

```text
https://www.halaqmap.com/api/sab-webhook
```

جسم الطلب المتوقع (JSON):

```json
{
  "secret_token": "<SAB_WEBHOOK_*_SECRET>",
  "checkout_id": "<checkoutId>",
  "resource_path": "/v1/checkouts/<id>/payment",
  "event_id": "اختياري-للتكرار-الآمن"
}
```

الخادم يعيد جلب الحالة من OPPWA ثم يفعّل الاشتراك (provision + listing license + بريد ترحيب) مثل ميسر.

بديل Edge (بروكسي): `supabase functions deploy sab-webhook` مع `APP_PUBLIC_ORIGIN`.

## اختبار Sandbox

1. ضبط المفاتيح على Vercel وإعادة النشر.
2. تفعيل SAB من لوحة الإدارة.
3. فتح `/partners/payment` واختيار بنك الأول.
4. إتمام دفع اختباري عبر OPPWA.
5. التحقق من العودة بـ `?gateway=sab&id=...` وظهور شهادة التفعيل.
6. مراجعة `barber_subscriptions` وسجل webhook.

## ما يبقى من البنك

- `entityId` و`access token` للإنتاج.
- تسجيل نطاق الإنتاج (HTTPS).
- اعتماد webhook URL.
- بطاقات اختبار OPPWA حسب وثائق البنك.

## مراجع

- [HyperPay Widget Integration](https://hyperpay.docs.oppwa.com/integrations/widget)
- مسار ميسر المرجعي: `docs/MOYSAR_MYSR_MERCHANT_READINESS_AR.md`
