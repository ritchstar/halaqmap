-- الجدول أُنشئ يدوياً على الإنتاج بدون GRANT — كان يسبب permission denied عند consume magic.
GRANT SELECT, INSERT ON TABLE public.barber_portal_magic_redemptions TO service_role;

NOTIFY pgrst, 'reload schema';
