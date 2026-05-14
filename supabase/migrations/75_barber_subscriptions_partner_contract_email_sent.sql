-- تتبع إرسال بريد PDF العقد الموحّد لمنع التكرار بين مسار الإدارة وـ Database Webhook (subscriptions.active).

ALTER TABLE public.barber_subscriptions
  ADD COLUMN IF NOT EXISTS partner_unified_contract_email_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.barber_subscriptions.partner_unified_contract_email_sent_at IS
  'وقت نجاح إرسال بريد PDF العقد الموحّد للشريك؛ يُضبط بعد نجاح Resend ويُفرّغ عند فشل الإرسال لإعادة المحاولة.';
