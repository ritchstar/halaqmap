/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { cn } from '@/lib/utils';
import { IMAGES } from '@/assets/images';
import { PLATFORM_SHORT_NAME_EN } from '@/config/geospatialLicenseDoctrine';

type HalaqmapBrandMarkProps = {
  alt?: string;
  /** حاوية الشعار (حجم، حلقة، ظل) — تُطبَّق على مربع الشعار فقط */
  className?: string;
  /** الصورة نفسها */
  imgClassName?: string;
  /**
   * إظهار اختصار `HMap` تحت الشعار بهوية التيل/الذهب.
   * الافتراضي: مفعّل — عطّله للأيقونات الصغيرة جداً (≤ 1.5rem).
   */
  showShortName?: boolean;
  /** تنسيق إضافي لسطر الاختصار */
  shortNameClassName?: string;
};

/**
 * شعار حلاق ماب العام — زوايا ناعمة + لمعان زجاجي + اختصار HMap تحت الشعار.
 */
export function HalaqmapBrandMark({
  alt = 'حلاق ماب',
  className,
  imgClassName,
  showShortName = true,
  shortNameClassName,
}: HalaqmapBrandMarkProps) {
  return (
    <span
      className={cn(
        'halaqmap-brand-lockup inline-flex flex-col items-center justify-center',
        showShortName && 'gap-[0.12rem]',
      )}
    >
      <span className={cn('halaqmap-brand-mark', className)}>
        <img
          src={IMAGES.HALAQMAP_LOGO_20260409_073322_83}
          srcSet="/images/halaqmap-logo-mark-128.webp 128w, /images/halaqmap-logo-mark-256.webp 256w"
          sizes="56px"
          alt={alt}
          width={56}
          height={56}
          className={cn(
            'relative z-[1] block h-full w-full object-cover object-center',
            imgClassName,
          )}
          decoding="async"
        />
      </span>
      {showShortName ? (
        <span
          className={cn('halaqmap-brand-shortname', shortNameClassName)}
          dir="ltr"
          aria-hidden
        >
          {PLATFORM_SHORT_NAME_EN}
        </span>
      ) : null}
    </span>
  );
}
