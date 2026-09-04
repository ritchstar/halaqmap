/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لقطة واجهة منتج داخل المعاينة. ليست صورة قطاعية.
 */
import type { StoreAtlasUiKind } from '@/config/storeAtlasTokens';
import { cn } from '@/lib/utils';

const PREVIEWS: Record<StoreAtlasUiKind, { titleAr: string; flashAr: string; rows: readonly [string, string][] }> = {
  produce: {
    titleAr: 'صندوق اليوم',
    flashAr: 'وصل اليوم: رمان وبطيخ',
    rows: [
      ['طماطم', '8 ر.س / كيلو'],
      ['خيار', '6 ر.س / كيلو'],
      ['رمان', '3 ر.س / حبة'],
    ],
  },
  grocers: {
    titleAr: 'تموينات الحي',
    flashAr: 'السلة تصل للكاشير',
    rows: [
      ['أرز بسمتي', '28 ر.س'],
      ['حليب', '8 ر.س'],
      ['خبز', '2 ر.س'],
    ],
  },
  kitchen: {
    titleAr: 'أصناف اليوم',
    flashAr: 'الحجز المسبق مفتوح',
    rows: [
      ['كبسة', 'عائلي'],
      ['محاشي', 'طبق'],
      ['لقيمات', 'علبة'],
    ],
  },
  restaurant: {
    titleAr: 'قائمة المطبخ',
    flashAr: 'طبق اليوم: مندي',
    rows: [
      ['مندي', 'ضيف الحي'],
      ['مشاوي', 'استلام'],
      ['سلطة', 'إضافة'],
    ],
  },
  cafe: {
    titleAr: 'مشروبات اليوم',
    flashAr: 'الشاشة ترحّب بالضيف',
    rows: [
      ['قهوة', 'حار'],
      ['آيس لاتيه', 'بارد'],
      ['كيك', 'عرض'],
    ],
  },
  lounge: {
    titleAr: 'شاشة اللاونج',
    flashAr: 'ترحيب من رابط الضيف',
    rows: [
      ['أهلاً بكم', 'على الشاشة'],
      ['فعالية الليلة', 'من المضيف'],
      ['رمز الدخول', 'QR'],
    ],
  },
  wedding: {
    titleAr: 'كرت الدعوة',
    flashAr: 'القاعة تفتح من الرابط',
    rows: [
      ['العريس والعروس', 'سرية'],
      ['قاعة حية', 'تهاني'],
      ['رابط المدعو', 'خاص'],
    ],
  },
  event: {
    titleAr: 'دعوة المناسبة',
    flashAr: 'شق رجالي أو نسائي',
    rows: [
      ['اسم المناسبة', 'يحدده صاحبها'],
      ['قاعة حية', 'تهاني'],
      ['رابط الشق', 'منفصل'],
    ],
  },
  card: {
    titleAr: 'البطاقة الحيّة',
    flashAr: 'شارك الرابط',
    rows: [
      ['المعاينة', 'مجانية'],
      ['ثلاث طبقات', 'واضحة'],
      ['تحميل الصورة', 'من الصفحة'],
    ],
  },
};

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
    <div className={cn('store-atlas__phone', compact ? 'max-w-[15rem]' : 'max-w-[17.5rem]')} dir="rtl">
      <div className="store-atlas__phone-bar" />
      <div className="px-3 py-3">
        <p className="store-atlas__meta font-extrabold text-[var(--atlas-ivory)]">{preview.titleAr}</p>
        <p className="mt-1 rounded-lg bg-[var(--atlas-teal)]/15 px-2 py-1 text-[0.75rem] font-bold text-[var(--atlas-teal)]">
          {preview.flashAr}
        </p>
        <ul className="mt-3 space-y-2">
          {preview.rows.map(([name, meta]) => (
            <li
              key={name}
              className="flex items-center justify-between rounded-xl border border-[var(--atlas-line)] px-2.5 py-2"
            >
              <span className="text-sm font-extrabold">{name}</span>
              <span className="store-atlas__meta text-[var(--atlas-muted)]">{meta}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-full bg-[var(--atlas-teal)] py-2 text-center text-xs font-extrabold text-[var(--atlas-ivory)]">
          {actionAr}
        </p>
      </div>
    </div>
  );
}
