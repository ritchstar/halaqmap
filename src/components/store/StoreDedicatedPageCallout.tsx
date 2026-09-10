/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * توضيح أن صفحة النشاط الحيّة مخصصة لمشترٍ واحد.
 */
import {
  STORE_DEDICATED_PAGE_COPY,
  storeDedicatedGuestLine,
  type StoreDedicatedGuestAudience,
} from '@/config/storeDedicatedPageCopy';
import { cn } from '@/lib/utils';

export function StoreDedicatedPageCallout({
  audience,
  leadAr,
  accentClass = 'text-[#e8c547]',
  borderClass = 'border-[#e8c547]/35',
  bgClass = 'bg-[#e8c547]/8',
  className,
  compact = false,
  showClosing = !compact,
}: {
  audience?: StoreDedicatedGuestAudience;
  leadAr?: string;
  accentClass?: string;
  borderClass?: string;
  bgClass?: string;
  className?: string;
  compact?: boolean;
  showClosing?: boolean;
}) {
  const guestLine =
    leadAr ?? (audience ? storeDedicatedGuestLine(audience) : STORE_DEDICATED_PAGE_COPY.leadAr);

  return (
    <aside
      className={cn(
        'rounded-2xl border px-4 py-4',
        borderClass,
        bgClass,
        compact ? 'mx-auto max-w-3xl text-center' : 'max-w-xl',
        className,
      )}
    >
      <p className={cn('text-base font-extrabold leading-8', accentClass)}>{STORE_DEDICATED_PAGE_COPY.titleAr}</p>
      <p className={cn('mt-2 text-sm leading-7 text-white/78', compact && 'md:text-base md:leading-8')}>
        {guestLine}
      </p>
      {showClosing ? (
        <p className="mt-2 text-sm font-bold leading-7 text-white/88">{STORE_DEDICATED_PAGE_COPY.closingLineAr}</p>
      ) : null}
    </aside>
  );
}

export function StoreDedicatedPageReelCaption() {
  return (
    <>
      <p className="mt-2 text-sm font-bold leading-7 text-white/82">{STORE_DEDICATED_PAGE_COPY.reelOverlayDedicatedAr}</p>
      <p className="mt-1 text-sm leading-7 text-white/65">{STORE_DEDICATED_PAGE_COPY.reelOverlayBrowseAr}</p>
    </>
  );
}
