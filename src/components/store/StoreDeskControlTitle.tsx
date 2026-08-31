/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * عنوان لوحة الكاشير. لا يُستورد من App.
 */
import { STORE_DESK_ORDER_TICKET_COPY } from '@/config/storeDeskOrderTicket';

export function StoreDeskControlTitle({
  kitchen = false,
  trialNote = '',
}: {
  kitchen?: boolean;
  trialNote?: string;
}) {
  return (
    <section className="rounded-2xl border border-amber-300/25 bg-amber-400/8 px-4 py-3">
      <h1 className="text-base font-extrabold leading-7 text-amber-50">
        {kitchen ? STORE_DESK_ORDER_TICKET_COPY.kitchenTitleAr : STORE_DESK_ORDER_TICKET_COPY.deskTitleAr}
      </h1>
      {trialNote ? <p className="mt-2 text-sm leading-7 text-amber-50/80">{trialNote}</p> : null}
    </section>
  );
}
