-- =====================================================
-- 112 — Fleet demand intelligence (aggregated, no end-user PII)
-- قيادة الأسطول: عدّادات طلب مجمّعة + نبض كساد محلي B2B
-- =====================================================

ALTER TABLE public.barber_ai_recommendations
  DROP CONSTRAINT IF EXISTS barber_ai_recommendations_category_check;

ALTER TABLE public.barber_ai_recommendations
  ADD CONSTRAINT barber_ai_recommendations_category_check
  CHECK (category IN (
    'balance',
    'banner',
    'gallery',
    'shift_chat',
    'shift_report',
    'fleet_directive',
    'private_office_instruction',
    'market_stagnation'
  ));

CREATE TABLE IF NOT EXISTS public.fleet_demand_counters (
  bucket_hour TIMESTAMPTZ NOT NULL,
  city_ar TEXT NOT NULL,
  district_ar TEXT NOT NULL DEFAULT '',
  signal_type TEXT NOT NULL CHECK (
    signal_type IN (
      'intercept_shop_closed',
      'intercept_barber_delay',
      'conversation_started',
      'market_stagnation'
    )
  ),
  counter INT NOT NULL DEFAULT 0 CHECK (counter >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (bucket_hour, city_ar, district_ar, signal_type)
);

CREATE INDEX IF NOT EXISTS fleet_demand_counters_city_hour_idx
  ON public.fleet_demand_counters (city_ar, bucket_hour DESC);

COMMENT ON TABLE public.fleet_demand_counters IS
  'عدّادات طلب مجمّعة بالمدينة/الساعة — بدون هوية زبون أو GPS خام.';

CREATE TABLE IF NOT EXISTS public.fleet_salon_stagnation_pulse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  city_ar TEXT NOT NULL,
  bucket_day DATE NOT NULL DEFAULT (CURRENT_DATE),
  days_since_last_contact INT,
  conversations_7d INT NOT NULL DEFAULT 0 CHECK (conversations_7d >= 0),
  listing_days_remaining INT,
  shop_open BOOLEAN NOT NULL DEFAULT true,
  note_ar TEXT NOT NULL DEFAULT '',
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (barber_id, bucket_day)
);

CREATE INDEX IF NOT EXISTS fleet_salon_stagnation_pulse_city_day_idx
  ON public.fleet_salon_stagnation_pulse (city_ar, bucket_day DESC);

COMMENT ON TABLE public.fleet_salon_stagnation_pulse IS
  'نبض كساد محلي لصالون ماسي — بيانات B2B تشغيلية فقط، بدون بيانات زبون.';

ALTER TABLE public.fleet_demand_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_salon_stagnation_pulse ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.fleet_demand_counters FROM PUBLIC;
REVOKE ALL ON TABLE public.fleet_salon_stagnation_pulse FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE ON TABLE public.fleet_demand_counters TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.fleet_salon_stagnation_pulse TO service_role;

CREATE OR REPLACE FUNCTION public.increment_fleet_demand_counter(
  p_city_ar TEXT,
  p_signal_type TEXT,
  p_district_ar TEXT DEFAULT ''
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_city TEXT;
  v_district TEXT;
  v_signal TEXT;
  v_bucket TIMESTAMPTZ;
BEGIN
  v_city := left(btrim(coalesce(p_city_ar, '')), 120);
  IF v_city = '' THEN
    RETURN;
  END IF;

  v_district := left(btrim(coalesce(p_district_ar, '')), 120);
  v_signal := lower(btrim(coalesce(p_signal_type, '')));
  IF v_signal NOT IN (
    'intercept_shop_closed',
    'intercept_barber_delay',
    'conversation_started',
    'market_stagnation'
  ) THEN
    RAISE EXCEPTION 'invalid signal_type';
  END IF;

  v_bucket := date_trunc('hour', now());

  INSERT INTO public.fleet_demand_counters (
    bucket_hour,
    city_ar,
    district_ar,
    signal_type,
    counter,
    updated_at
  ) VALUES (
    v_bucket,
    v_city,
    coalesce(v_district, ''),
    v_signal,
    1,
    now()
  )
  ON CONFLICT (bucket_hour, city_ar, district_ar, signal_type)
  DO UPDATE SET
    counter = public.fleet_demand_counters.counter + 1,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.increment_fleet_demand_counter(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_fleet_demand_counter(TEXT, TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.fleet_demand_on_conversation_started()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_city TEXT;
BEGIN
  IF NEW.barber_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT left(btrim(coalesce(b.city, '')), 120)
  INTO v_city
  FROM public.barbers b
  WHERE b.id = NEW.barber_id;

  IF coalesce(v_city, '') = '' THEN
    RETURN NEW;
  END IF;

  PERFORM public.increment_fleet_demand_counter(v_city, 'conversation_started', '');

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'fleet_demand_on_conversation_started failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fleet_demand_conversation_started_trg ON public.private_conversations;
CREATE TRIGGER fleet_demand_conversation_started_trg
  AFTER INSERT ON public.private_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.fleet_demand_on_conversation_started();
