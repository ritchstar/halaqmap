-- =====================================================
-- تنبيهات تواصل الحلاق: اشتراكات Web Push (مرحلة 2)
-- الوصول عبر service role فقط — لا وصول مباشر من المتصفح
-- =====================================================

CREATE TABLE IF NOT EXISTS public.barber_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT barber_push_subscriptions_endpoint_unique UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS barber_push_subscriptions_barber_idx
  ON public.barber_push_subscriptions(barber_id)
  WHERE enabled IS TRUE;

COMMENT ON TABLE public.barber_push_subscriptions IS
  'اشتراكات Web Push للحلاق — يُدار عبر /api/barber-chat-push (service role).';

ALTER TABLE public.barber_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- لا سياسات للعموم — service role فقط عبر API
REVOKE ALL ON TABLE public.barber_push_subscriptions FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.barber_push_subscriptions TO service_role;

-- =====================================================
-- إعداد Webhook (يدوي في Supabase Dashboard):
-- Database Webhooks → INSERT على private_messages
-- URL: https://<vercel>/api/barber-chat-push-dispatch
-- Header: x-barber-chat-push-secret = BARBER_CHAT_PUSH_WEBHOOK_SECRET
-- =====================================================
