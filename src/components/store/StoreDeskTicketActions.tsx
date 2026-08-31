/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { STORE_DESK_ORDER_TICKET_COPY } from '@/config/storeDeskOrderTicket';
import { deskOrderPhase, type StoreDeskTicketBase } from '@/lib/storeDeskOrderTicket';

export function StoreDeskTicketActions({
  order,
  accent,
  onReceive,
  onFinish,
}: {
  order: StoreDeskTicketBase;
  accent: string;
  onReceive: () => void;
  onFinish: () => void;
}) {
  const phase = deskOrderPhase(order);
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {phase === 'new' ? (
        <button
          type="button"
          onClick={onReceive}
          className="rounded-full px-3 py-1.5 text-xs font-extrabold text-[#061018]"
          style={{ backgroundColor: accent }}
        >
          {STORE_DESK_ORDER_TICKET_COPY.receivedAr}
        </button>
      ) : null}
      {phase === 'received' ? (
        <button
          type="button"
          onClick={onFinish}
          className="rounded-full border px-3 py-1.5 text-xs font-extrabold"
          style={{ borderColor: `${accent}88`, color: accent }}
        >
          {STORE_DESK_ORDER_TICKET_COPY.finishAr}
        </button>
      ) : null}
    </div>
  );
}
