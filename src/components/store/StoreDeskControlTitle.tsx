/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * عنوان لوحة الكاشير. لا يُستورد من App.
 */
import { STORE_DESK_ORDER_TICKET_COPY } from '@/config/storeDeskOrderTicket';

export function StoreDeskControlTitle({
  kitchen = false,
  trialNote = '',
  titleAr,
}: {
  kitchen?: boolean;
  trialNote?: string;
  titleAr?: string;
}) {
  return (
    <section className="store-desk-control-title rounded-2xl border px-4 py-3">
      <h1 className="text-base font-extrabold leading-7">
        {titleAr || (kitchen ? STORE_DESK_ORDER_TICKET_COPY.kitchenTitleAr : STORE_DESK_ORDER_TICKET_COPY.deskTitleAr)}
      </h1>
      {trialNote ? <p className="mt-2 text-sm leading-7 opacity-80">{trialNote}</p> : null}
    </section>
  );
}
