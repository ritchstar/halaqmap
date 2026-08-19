-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- مكتب طلبات متجر halaqmap: حالة الدراسة، مسودة الرد، محضر اجتماع الوكلاء.

ALTER TABLE public.store_service_requests
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

ALTER TABLE public.store_service_requests
  DROP CONSTRAINT IF EXISTS store_service_requests_status_chk;

ALTER TABLE public.store_service_requests
  ADD CONSTRAINT store_service_requests_status_chk
  CHECK (status IN ('new', 'studying', 'offered', 'closed'));

ALTER TABLE public.store_service_requests
  ADD COLUMN IF NOT EXISTS reply_draft text;

ALTER TABLE public.store_service_requests
  ADD COLUMN IF NOT EXISTS council_transcript text;

ALTER TABLE public.store_service_requests
  ADD COLUMN IF NOT EXISTS admin_notes text;

ALTER TABLE public.store_service_requests
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS store_service_requests_status_idx
  ON public.store_service_requests (status, created_at DESC);

COMMENT ON COLUMN public.store_service_requests.status IS
  'new=وارد، studying=تحت الدراسة، offered=عُرض، closed=مغلق.';
COMMENT ON COLUMN public.store_service_requests.reply_draft IS
  'مسودة رد الإدارة للعميل — لا تُرسل تلقائياً.';
COMMENT ON COLUMN public.store_service_requests.council_transcript IS
  'محضر اجتماع الوكلاء المختصين حول الطلب.';

-- الترحيل 163 منح SELECT/INSERT فقط. المكتب يحفظ المسودة والمحضر عبر service_role.
GRANT SELECT, INSERT, UPDATE ON TABLE public.store_service_requests TO service_role;
