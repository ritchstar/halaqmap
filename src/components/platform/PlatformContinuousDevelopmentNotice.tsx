/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تنويه تشغيلي — تطوير مستمر لمنتجات خريطة الحل.
 */
import { PLATFORM_CONTINUOUS_DEVELOPMENT_COPY } from '@/config/platformContinuousDevelopment';
import { cn } from '@/lib/utils';

export function PlatformContinuousDevelopmentNotice({
  variant = 'platform',
  className,
}: {
  variant?: 'platform' | 'store' | 'shop' | 'desk' | 'partner';
  className?: string;
}) {
  return (
    <p
      role="note"
      className={cn('platform-continuous-dev-notice', `platform-continuous-dev-notice--${variant}`, className)}
    >
      {PLATFORM_CONTINUOUS_DEVELOPMENT_COPY.noticeAr}
    </p>
  );
}
