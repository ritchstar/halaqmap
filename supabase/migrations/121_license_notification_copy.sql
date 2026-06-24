-- توحيد لغة الإشعارات: رخصة نفاذ بدل «اشتراك» في نقاط التواصل.

CREATE OR REPLACE FUNCTION public.create_subscription_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    INSERT INTO public.subscriptions (barber_id, tier, start_date, end_date, status, price)
    VALUES (
      NEW.barber_id,
      NEW.tier,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days',
      'active',
      CASE NEW.tier
        WHEN 'bronze' THEN 100
        WHEN 'gold' THEN 150
        WHEN 'diamond' THEN 200
      END
    );

    INSERT INTO public.notifications (user_id, type, title, message, link)
    SELECT
      b.user_id,
      'subscription',
      'تم تفعيل رخصتك',
      'تم الموافقة على طلب تفعيل رخصتك في باقة ' || NEW.tier,
      '/barber/subscription'
    FROM public.barbers b
    WHERE b.id = NEW.barber_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
