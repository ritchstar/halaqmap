/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نموذج مصغّر لصفحة التنبيه عند فتح رابط حُوّل أو أُعيد إرساله.
 */
import { StoreGuestDeviceBlocked } from '@/components/store/StoreGuestDeviceBlocked';
import { cn } from '@/lib/utils';

export function StoreGuestResentLinkPreview({
  productAr,
  hostAr,
  kickerAr,
  captionAr,
  className,
}: {
  productAr: string;
  hostAr: 'المضيف' | 'المضيفة';
  kickerAr: string;
  captionAr: string;
  className?: string;
}) {
  return (
    <aside className={cn('mt-5 mb-16', className)} data-resent-preview="1" aria-label={captionAr}>
      <p className="text-sm font-bold tracking-wide text-[#d4a574]">{kickerAr}</p>
      <p className="mt-1 text-sm leading-7 text-white/70">{captionAr}</p>
      <div className="mt-3 mx-auto w-full max-w-[280px] rounded-[28px] border border-white/18 bg-black p-2 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.8)]">
        <div className="pointer-events-none select-none overflow-hidden rounded-[20px] border border-white/10">
          <StoreGuestDeviceBlocked productAr={productAr} hostAr={hostAr} compact />
        </div>
      </div>
    </aside>
  );
}
