-- تسجيل معاينات المسؤول لرمز التحقق النظامي (طلبات التسجيل) في سجل الأمان — دون تخزين محتوى الرمز.

CREATE OR REPLACE FUNCTION public.log_admin_regulatory_preview_event(
  p_registration_order_id text,
  p_preview_at_iso text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.jwt_platform_admin_has_permission('review_requests')
    OR public.jwt_platform_admin_has_permission('manage_barbers')
  ) THEN
    RAISE EXCEPTION 'not_allowed' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.platform_booking_security_log (severity, event_code, message, barber_id, detail)
  VALUES (
    'info',
    'admin_regulatory_qr_preview',
    'معاينة نظامية لطلب تسجيل — يُسجَّل وقت المعاينة ورقم الطلب فقط دون محتوى الرمز أو الوثيقة.',
    NULL,
    jsonb_strip_nulls(
      jsonb_build_object(
        'registration_order_id',
        NULLIF(btrim(p_registration_order_id), ''),
        'preview_at',
        NULLIF(btrim(p_preview_at_iso), '')
      )
    )
  );
END;
$$;

COMMENT ON FUNCTION public.log_admin_regulatory_preview_event(text, text) IS
  'يُسجّل أن مسؤولاً عاين مسار التحقق لطلب اشتراك؛ لا يُخزّن محتوى الرمز.';

REVOKE ALL ON FUNCTION public.log_admin_regulatory_preview_event(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_admin_regulatory_preview_event(text, text) TO authenticated;
