-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- منع إعادة استخدام دفعة ميسر لأكثر من بطاقة مناسبة.

CREATE UNIQUE INDEX IF NOT EXISTS store_issued_cards_moyasar_payment_uidx
  ON public.store_issued_cards (moyasar_payment_id)
  WHERE moyasar_payment_id IS NOT NULL;
