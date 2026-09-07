-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- حلانا1 — شعار النشاط بجوار الاسم في صفحة العميلات (مثل طبختنا1).

ALTER TABLE public.store_halana_copies
  ADD COLUMN IF NOT EXISTS logo_src text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.store_halana_copies.logo_src IS
  'شعار المتخصصة — بيانات صورة مضغوطة base64 فقط، تظهر بجوار اسم النشاط في المعرض.';
