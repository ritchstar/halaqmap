-- =====================================================
-- حماية باقة الحلاق من التخفيض الأعمى عند إدراج صلاحية جديدة
--  · المشكلة: التريغر السابق كان يضبط barbers.tier = tier آخر صلاحية مُدرَجة
--    (حتى لو كانت أدنى)، فأي صلاحية برونزي — بما فيها الناتجة عن خطأ في
--    توجيه الدفع — تخفّض حلاقاً ذهبياً/ماسياً.
--  · الإصلاح: تُضبط الباقة على "أعلى" صلاحية إدراج سارية فعلياً (غير ملغاة
--    وصالحة زمنياً). لا تخفيض ما دامت هناك صلاحية أعلى سارية.
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_barber_tier_on_listing_entitlement()
RETURNS TRIGGER AS $$
DECLARE
  highest_tier TEXT;
BEGIN
  IF NEW.revoked_at IS NULL AND NEW.valid_until > NOW() THEN
    -- أعلى باقة بين جميع الصلاحيات السارية للحلاق (يشمل الصف الجديد المُدرَج)
    SELECT e.tier
      INTO highest_tier
      FROM public.barber_listing_entitlements e
      WHERE e.barber_id = NEW.barber_id
        AND e.revoked_at IS NULL
        AND e.valid_until > NOW()
      ORDER BY
        CASE e.tier WHEN 'diamond' THEN 3 WHEN 'gold' THEN 2 ELSE 1 END DESC,
        e.valid_until DESC
      LIMIT 1;

    IF highest_tier IS NOT NULL THEN
      UPDATE public.barbers
      SET tier = highest_tier
      WHERE id = NEW.barber_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_barber_tier_on_listing_entitlement() IS
  'يزامن barbers.tier مع أعلى صلاحية إدراج سارية (لا تخفيض أعمى عند إدراج صلاحية أدنى).';
