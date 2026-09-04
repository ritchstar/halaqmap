/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نموذج توضيحي للوحة الصندوق بعد وصول الطلب. ليس لقطة إنتاج.
 */
import { STORE_ATLAS_COPY } from '@/config/storeAtlasTokens';

const LINES = [
  { itemAr: 'طماطم', qtyAr: '1 كيلو', priceAr: '8 ر.س' },
  { itemAr: 'رمان', qtyAr: '2 حبة', priceAr: '6 ر.س' },
] as const;

export function ProduceDeskPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className="store-atlas__phone w-full max-w-none rounded-[18px]" dir="rtl">
      <div className="store-atlas__phone-bar" />
      <div className={compact ? 'px-3 py-3' : 'px-4 py-4'}>
        <p className="store-atlas__meta font-extrabold text-[var(--atlas-teal)]">لوحة الصندوق</p>
        <p className="store-atlas__card-title mt-1">وصل طلب جديد</p>
        <div className="mt-3 rounded-xl border border-[var(--atlas-line)] bg-[#061018] p-3">
          <p className="text-sm font-extrabold">جار الحي</p>
          <p className="store-atlas__meta mt-1 text-[var(--atlas-muted)]">
            توصيل للبيت ·{' '}
            <span className="store-atlas__num" dir="ltr">
              05xxxxxxxx
            </span>
          </p>
          <div className="store-atlas__order mt-3">
            <div className="store-atlas__order-head store-atlas__meta font-bold">
              <span>{STORE_ATLAS_COPY.orderColItemAr}</span>
              <span>{STORE_ATLAS_COPY.orderColQtyAr}</span>
              <span>{STORE_ATLAS_COPY.orderColPriceAr}</span>
            </div>
            <ul className="space-y-1.5">
              {LINES.map((row) => (
                <li key={row.itemAr} className="store-atlas__order-row">
                  <span className="text-sm font-extrabold">{row.itemAr}</span>
                  <span className="store-atlas__meta text-[var(--atlas-muted)]">
                    <span className="store-atlas__num" dir="ltr">
                      {row.qtyAr.split(' ')[0]}
                    </span>{' '}
                    {row.qtyAr.split(' ').slice(1).join(' ')}
                  </span>
                  <span className="store-atlas__meta text-[var(--atlas-muted)]">
                    <span className="store-atlas__num" dir="ltr">
                      {row.priceAr.split(' ')[0]}
                    </span>{' '}
                    ر.س
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-sm font-extrabold text-[var(--atlas-teal)]">الإجمالي يظهر عند الصندوق</p>
        </div>
        <p className="mt-2 text-center text-[0.7rem] text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.mockCaptionAr}</p>
      </div>
    </div>
  );
}
