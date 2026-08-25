/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شبكة أيقونات روابط منتجات المتجر — نفس هوية إيميل المسوّقين.
 */
import { STORE_MAIL_PRODUCT_ICONS, type StoreMailProductId } from '@/config/storeMailIcons';

export function StoreProductLinkIconGrid({
  links,
  onPick,
}: {
  links: Record<StoreMailProductId, string>;
  onPick: (href: string, titleAr: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-5 py-2">
      {STORE_MAIL_PRODUCT_ICONS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onPick(links[item.id], item.titleAr)}
          className="group flex w-[5.5rem] flex-col items-center gap-2 text-center"
          aria-label={`نسخ رابط ${item.titleAr}`}
        >
          <span
            className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.4rem] text-2xl font-black shadow-[0_0_0_2px_rgba(255,255,255,0.08)] transition group-hover:scale-[1.04]"
            style={{
              background: item.accent,
              color: item.ink,
              boxShadow: `0 0 0 2px ${item.ring}`,
            }}
          >
            {item.markAr}
          </span>
          <span className="text-sm font-extrabold" style={{ color: item.accent }}>
            {item.titleAr}
          </span>
          <span className="text-[0.7rem] font-bold text-slate-400">نسخ الرابط</span>
        </button>
      ))}
    </div>
  );
}
