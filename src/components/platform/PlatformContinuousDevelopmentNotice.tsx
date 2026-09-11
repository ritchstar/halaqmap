/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تنويه تشغيلي — تطوير مستمر لمنتجات خريطة الحل.
 */
import { PLATFORM_CONTINUOUS_DEVELOPMENT_COPY } from '@/config/platformContinuousDevelopment';
import { cn } from '@/lib/utils';

export function PlatformContinuousDevelopmentNotice({
  variant = 'platform',
  placement = 'banner',
  className,
}: {
  variant?: 'platform' | 'store' | 'shop' | 'desk' | 'partner';
  /** banner: أعلى الصفحة (قديم). footer: أسفل الفوتر بخط صغير. */
  placement?: 'banner' | 'footer';
  className?: string;
}) {
  return (
    <p
      role="note"
      className={cn(
        'platform-continuous-dev-notice',
        `platform-continuous-dev-notice--${variant}`,
        placement === 'footer' && 'platform-continuous-dev-notice--footer',
        className,
      )}
    >
      {PLATFORM_CONTINUOUS_DEVELOPMENT_COPY.noticeAr}
    </p>
  );
}
