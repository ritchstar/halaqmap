-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- ربط كل بطاقة مناسبة بفاتورة ميسر مستقلة عن رخصة النفاذ.

ALTER TABLE public.store_issued_cards
  ADD COLUMN IF NOT EXISTS moyasar_invoice_id text;

CREATE UNIQUE INDEX IF NOT EXISTS store_issued_cards_moyasar_invoice_uidx
  ON public.store_issued_cards (moyasar_invoice_id)
  WHERE moyasar_invoice_id IS NOT NULL;
