-- منع ردّين مكرّرين من المناوب على نفس رسالة العميل (سباق طلبات intercept متوازية)

CREATE TABLE IF NOT EXISTS public.digital_shift_intercept_claims (
  conversation_id UUID NOT NULL REFERENCES public.private_conversations(id) ON DELETE CASCADE,
  customer_message_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, customer_message_at)
);

COMMENT ON TABLE public.digital_shift_intercept_claims IS
  'قفل اعتراض المناوب — رسالة عميل واحدة = رد مناوب واحد كحد أقصى.';

ALTER TABLE public.digital_shift_intercept_claims ENABLE ROW LEVEL SECURITY;
