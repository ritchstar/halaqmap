/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { cn } from '@/lib/utils';
import { IMAGES } from '@/assets/images';

type HalaqmapBrandMarkProps = {
  alt?: string;
  /** حاوية الشعار (حجم، حلقة، ظل) */
  className?: string;
  /** الصورة نفسها */
  imgClassName?: string;
};

/**
 * شعار حلاق ماب العام — زوايا ناعمة + لمعان زجاجي خفيف (مع احترام prefers-reduced-motion).
 */
export function HalaqmapBrandMark({
  alt = 'حلاق ماب',
  className,
  imgClassName,
}: HalaqmapBrandMarkProps) {
  return (
    <span className={cn('halaqmap-brand-mark', className)}>
      <img
        src={IMAGES.HALAQMAP_LOGO_20260409_073322_83}
        alt={alt}
        className={cn(
          'relative z-[1] block h-full w-full object-cover object-center',
          imgClassName,
        )}
        decoding="async"
      />
    </span>
  );
}
