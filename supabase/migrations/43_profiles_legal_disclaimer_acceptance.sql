-- تعهد صاحب المحل القانوني (ترخيص المنشأة — مسؤولية كاملة — إخلاء مسؤولية المنصة)
-- يُحدَّث من واجهة التسجيل (payload) وعند اعتماد الطلب عبر /api/approve-barber عند وجود صف profile مطابق للبريد.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS legal_disclaimer_accepted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS acceptance_timestamp TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.profiles.legal_disclaimer_accepted IS
  'Whether the shop owner accepted the mandatory legal disclaimer at registration.';
COMMENT ON COLUMN public.profiles.acceptance_timestamp IS
  'UTC timestamp when legal_disclaimer_accepted was recorded.';
