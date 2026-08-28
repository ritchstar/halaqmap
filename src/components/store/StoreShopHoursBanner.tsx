/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تنويه الزائر عند الإغلاق، مع أوقات العمل وبقاء التسوق مذكرة مسبقة.
 */
import { STORE_SHOP_HOURS_COPY as COPY, type StoreShopHoursState } from '@/config/storeShopHours';
import { isShopClosedNow, shopHoursLinesAr } from '@/lib/storeShopHours';

export function StoreShopHoursBanner({
  hours,
  accent,
}: {
  hours: StoreShopHoursState;
  accent: string;
}) {
  const closed = isShopClosedNow(hours);
  const lines = shopHoursLinesAr(hours);
  if (!closed && lines.length === 0) return null;
  return (
    <aside className="rounded-2xl border px-4 py-3" style={{ borderColor: `${accent}59`, background: `${accent}14` }}>
      {closed ? (
        <p className="text-sm font-extrabold leading-7" style={{ color: accent }}>
          {COPY.closedBannerAr}
        </p>
      ) : null}
      {lines.length ? (
        <div className={closed ? 'mt-2' : ''}>
          <p className="text-xs font-bold tracking-wide text-white/70">{COPY.hoursTitleAr}</p>
          <ul className="mt-1 space-y-1 text-sm leading-7 text-white/80">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
