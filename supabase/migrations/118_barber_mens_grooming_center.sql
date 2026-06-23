-- =====================================================
-- مراكز العناية بالرجل — ماسي + مكتب خاص
-- =====================================================

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS mens_grooming_center boolean NOT NULL DEFAULT false;

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS grooming_center_banner_lines jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.barbers.mens_grooming_center IS
  'مسار مركز العناية بالرجل — ماسي + مكتب خاص؛ يظهر في فلتر «مراكز العناية بالرجل».';

COMMENT ON COLUMN public.barbers.grooming_center_banner_lines IS
  'أسماء خدمات يختارها الشريك لعرضها على بنر البطاقة (حتى 8 أسطر).';
