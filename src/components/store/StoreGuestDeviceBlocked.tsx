/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة حظر رابط الضيف إن لم يصدر من لوحة المضيف أو أُعيد استخدامه.
 */
import { cn } from '@/lib/utils';

export function StoreGuestDeviceBlocked({
  productAr,
  hostAr = 'المضيف',
  compact = false,
}: {
  productAr: string;
  hostAr?: string;
  compact?: boolean;
}) {
  const askAr =
    hostAr === 'المضيفة'
      ? 'يرجى التواصل مع صاحبة الدعوة للحصول على رابط خاص بك.'
      : 'يرجى التواصل مع صاحب الدعوة للحصول على رابط خاص بك.';

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-[#050308] text-[#f4efe4]',
        compact ? 'px-3 py-5' : 'min-h-[100svh] px-5',
      )}
    >
      <div
        className={cn(
          'rounded-2xl border border-white/15 bg-[#0b0a12]',
          compact ? 'p-4' : 'max-w-md p-6',
        )}
      >
        <p className={cn('font-bold tracking-wide text-[#d4a574]', compact ? 'text-xs' : 'text-sm')}>
          {productAr}
        </p>
        <h1 className={cn('mt-2 font-extrabold', compact ? 'text-base leading-7' : 'text-2xl')}>
          هذه الدعوة مخصصة للاستخدام الشخصي فقط
        </h1>
        <p className={cn('mt-3 leading-7 text-white/75', compact ? 'text-xs' : 'mt-4 text-sm leading-8')}>
          تم استخدام هذا الرابط مسبقاً من جهاز آخر. حفاظاً على خصوصية الحفل وحماية بيانات الدعوة، تم إيقاف الرابط.
        </p>
        <p className={cn('mt-3 leading-7 text-white/75', compact ? 'text-xs' : 'text-sm leading-8')}>{askAr}</p>
        <p className={cn('mt-2 leading-7 text-white/60', compact ? 'text-xs' : 'mt-3 text-sm leading-8')}>
          <code dir="ltr">halaqmap</code> خريطة الحل
        </p>
      </div>
    </div>
  );
}
