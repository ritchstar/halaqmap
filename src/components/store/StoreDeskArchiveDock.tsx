/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * عدّاد أرشيف التذاكر المنفّذة وتحميله أسفل لوحة الكاشير.
 */
import {
  STORE_DESK_ORDER_ARCHIVE_CAP,
  STORE_DESK_ORDER_TICKET_COPY,
} from '@/config/storeDeskOrderTicket';
import { downloadDeskTicketsFile } from '@/lib/storeDeskOrderTicket';

export function StoreDeskArchiveDock({
  tickets,
  accent,
  filename,
  onClear,
  clearLabelAr,
}: {
  tickets: unknown[];
  accent: string;
  filename: string;
  onClear?: () => void;
  clearLabelAr?: string;
}) {
  const copy = STORE_DESK_ORDER_TICKET_COPY;
  const count = tickets.length;
  const full = count >= STORE_DESK_ORDER_ARCHIVE_CAP;

  return (
    <section className="rounded-2xl border border-white/12 bg-black/25 p-4" aria-label={copy.archiveTitleAr}>
      <h2 className="text-base font-extrabold" style={{ color: accent }}>
        {copy.archiveTitleAr}
      </h2>
      <p className="mt-1 text-sm text-white/70">
        {copy.archiveCountAr} {count} / {STORE_DESK_ORDER_ARCHIVE_CAP}
      </p>
      <p className="mt-1 text-[0.75rem] leading-6 text-white/45">{copy.archiveHintAr}</p>
      {full ? <p className="mt-2 text-sm leading-6 text-amber-100">{copy.archiveFullAr}</p> : null}
      {count === 0 ? <p className="mt-2 text-sm text-white/50">{copy.archiveEmptyAr}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={count === 0}
          onClick={() => downloadDeskTicketsFile(tickets, filename)}
          className="rounded-full px-4 py-2 text-sm font-extrabold text-[#061018] disabled:opacity-40"
          style={{ backgroundColor: accent }}
        >
          {copy.archiveDownloadAr}
        </button>
        {onClear && clearLabelAr ? (
          <button
            type="button"
            disabled={count === 0}
            onClick={onClear}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white/80 disabled:opacity-40"
          >
            {clearLabelAr}
          </button>
        ) : null}
      </div>
    </section>
  );
}
