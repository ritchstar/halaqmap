/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نموذج توضيحي لواجهة المنتج داخل المعاينة. ليس لقطة إنتاج.
 */
import { STORE_ATLAS_COPY, type StoreAtlasUiKind } from '@/config/storeAtlasTokens';
import { cn } from '@/lib/utils';

type PreviewRow = { itemAr: string; qtyAr: string; priceAr: string };

const PREVIEWS: Record<StoreAtlasUiKind, { titleAr: string; flashAr: string; rows: readonly PreviewRow[] }> = {
  produce: {
    titleAr: 'صندوق اليوم',
    flashAr: 'وصل اليوم: رمان وبطيخ',
    rows: [
      { itemAr: 'طماطم', qtyAr: '1 كيلو', priceAr: '8 ر.س' },
      { itemAr: 'خيار', qtyAr: '1 كيلو', priceAr: '6 ر.س' },
      { itemAr: 'رمان', qtyAr: '2 حبة', priceAr: '3 ر.س' },
    ],
  },
  grocers: {
    titleAr: 'تموينات الحي',
    flashAr: 'السلة تصل للكاشير',
    rows: [
      { itemAr: 'أرز بسمتي', qtyAr: '1 كيس', priceAr: '28 ر.س' },
      { itemAr: 'حليب', qtyAr: '2 علبة', priceAr: '8 ر.س' },
      { itemAr: 'خبز', qtyAr: '3 أرغفة', priceAr: '2 ر.س' },
    ],
  },
  kitchen: {
    titleAr: 'أصناف اليوم',
    flashAr: 'الحجز المسبق مفتوح',
    rows: [
      { itemAr: 'كبسة', qtyAr: '1 عائلي', priceAr: '—' },
      { itemAr: 'محاشي', qtyAr: '1 طبق', priceAr: '—' },
      { itemAr: 'لقيمات', qtyAr: '1 علبة', priceAr: '—' },
    ],
  },
  restaurant: {
    titleAr: 'قائمة المطبخ',
    flashAr: 'طبق اليوم: مندي',
    rows: [
      { itemAr: 'مندي', qtyAr: '1 طبق', priceAr: '—' },
      { itemAr: 'مشاوي', qtyAr: '1 طبق', priceAr: '—' },
      { itemAr: 'سلطة', qtyAr: '1 إضافة', priceAr: '—' },
    ],
  },
  cafe: {
    titleAr: 'مشروبات اليوم',
    flashAr: 'الشاشة ترحّب بالضيف',
    rows: [
      { itemAr: 'قهوة', qtyAr: '1 كاس', priceAr: '—' },
      { itemAr: 'آيس لاتيه', qtyAr: '1 كاس', priceAr: '—' },
      { itemAr: 'كيك', qtyAr: '1 قطعة', priceAr: '—' },
    ],
  },
  lounge: {
    titleAr: 'شاشة اللاونج',
    flashAr: 'ترحيب من رابط الضيف',
    rows: [
      { itemAr: 'أهلاً بكم', qtyAr: 'على الشاشة', priceAr: '—' },
      { itemAr: 'فعالية الليلة', qtyAr: 'من المضيف', priceAr: '—' },
      { itemAr: 'رمز الدخول', qtyAr: 'QR', priceAr: '—' },
    ],
  },
  wedding: {
    titleAr: 'كرت الدعوة',
    flashAr: 'القاعة تفتح من الرابط',
    rows: [
      { itemAr: 'العريس والعروس', qtyAr: 'سرية', priceAr: '—' },
      { itemAr: 'قاعة حية', qtyAr: 'تهاني', priceAr: '—' },
      { itemAr: 'رابط المدعو', qtyAr: 'خاص', priceAr: '—' },
    ],
  },
  event: {
    titleAr: 'دعوة المناسبة',
    flashAr: 'شق رجالي أو نسائي',
    rows: [
      { itemAr: 'اسم المناسبة', qtyAr: 'يحدده صاحبها', priceAr: '—' },
      { itemAr: 'قاعة حية', qtyAr: 'تهاني', priceAr: '—' },
      { itemAr: 'رابط الشق', qtyAr: 'منفصل', priceAr: '—' },
    ],
  },
  card: {
    titleAr: 'البطاقة الحيّة',
    flashAr: 'شارك الرابط',
    rows: [
      { itemAr: 'المعاينة', qtyAr: 'مجانية', priceAr: '—' },
      { itemAr: 'ثلاث طبقات', qtyAr: 'واضحة', priceAr: '—' },
      { itemAr: 'تحميل الصورة', qtyAr: 'من الصفحة', priceAr: '—' },
    ],
  },
};

function IsolatedQty({ value }: { value: string }) {
  const match = value.match(/^(\d+)\s*(.*)$/);
  if (!match) return <span>{value}</span>;
  return (
    <span>
      <span className="store-atlas__num" dir="ltr">
        {match[1]}
      </span>
      {match[2] ? ` ${match[2]}` : ''}
    </span>
  );
}

function IsolatedPrice({ value }: { value: string }) {
  if (value === '—') return <span>{value}</span>;
  const match = value.match(/^(\d+)\s*(.*)$/);
  if (!match) return <span>{value}</span>;
  return (
    <span>
      <span className="store-atlas__num" dir="ltr">
        {match[1]}
      </span>
      {match[2] ? ` ${match[2]}` : ''}
    </span>
  );
}

export function ProductUiPreview({
  kind,
  compact = false,
  actionAr = 'أرسل الطلب',
}: {
  kind: StoreAtlasUiKind;
  compact?: boolean;
  actionAr?: string;
}) {
  const preview = PREVIEWS[kind];
  return (
    <div className={cn('store-atlas__phone', compact ? 'max-w-[16.5rem]' : 'max-w-[18.5rem]')} dir="rtl">
      <div className="store-atlas__phone-bar" />
      <div className="px-3 py-3">
        <p className="store-atlas__meta font-extrabold text-[var(--atlas-ivory)]">{preview.titleAr}</p>
        <p className="mt-1 rounded-lg bg-[var(--atlas-teal)]/15 px-2 py-1 text-[0.75rem] font-bold text-[var(--atlas-teal)]">
          {preview.flashAr}
        </p>
        <div className="store-atlas__order mt-3">
          <div className="store-atlas__order-head store-atlas__meta font-bold">
            <span>{STORE_ATLAS_COPY.orderColItemAr}</span>
            <span>{STORE_ATLAS_COPY.orderColQtyAr}</span>
            <span>{STORE_ATLAS_COPY.orderColPriceAr}</span>
          </div>
          <ul className="space-y-1.5">
            {preview.rows.map((row) => (
              <li key={row.itemAr} className="store-atlas__order-row">
                <span className="text-sm font-extrabold">{row.itemAr}</span>
                <span className="store-atlas__meta text-[var(--atlas-muted)]">
                  <IsolatedQty value={row.qtyAr} />
                </span>
                <span className="store-atlas__meta text-[var(--atlas-muted)]">
                  <IsolatedPrice value={row.priceAr} />
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="store-atlas__action-pill mt-3 rounded-full py-2 text-center text-xs font-extrabold">
          {actionAr}
        </p>
        <p className="mt-2 text-center text-[0.7rem] text-[var(--atlas-muted)]">{STORE_ATLAS_COPY.mockCaptionAr}</p>
      </div>
    </div>
  );
}
