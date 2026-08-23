/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة تنويه الشاشة — داخل التدفق حتى لا تغطي عنوان الدعوة.
 */
import { cn } from '@/lib/utils';

export function StoreHallNoticePlaque({
  text,
  accent,
  kickerAr = 'تنويه المضيف',
  className,
}: {
  text: string;
  accent: string;
  kickerAr?: string;
  className?: string;
}) {
  return (
    <div
      key={text}
      className={cn('hall-notice-plaque hall-notice-pulse', className)}
      style={{ borderColor: accent, color: accent }}
    >
      <span className="hall-notice-corner hall-notice-corner--tl" aria-hidden />
      <span className="hall-notice-corner hall-notice-corner--tr" aria-hidden />
      <span className="hall-notice-corner hall-notice-corner--bl" aria-hidden />
      <span className="hall-notice-corner hall-notice-corner--br" aria-hidden />
      <p className="hall-notice-kicker" style={{ color: accent }}>
        {kickerAr}
      </p>
      <span className="hall-ornament-rule" style={{ ['--hall-ornament' as string]: accent }} aria-hidden />
      <p dir="rtl" className="hall-notice-pulse__text chat-arabic-text" style={{ color: accent }}>
        {text}
      </p>
    </div>
  );
}
