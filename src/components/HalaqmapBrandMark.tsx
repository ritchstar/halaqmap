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
 * شعار حلاق ماب العام — أنيميشن CSS خفيف (نبض هادئ + لمعان) مع احترام prefers-reduced-motion.
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
        className={cn('relative z-[1] block h-full w-full object-cover', imgClassName)}
        decoding="async"
      />
    </span>
  );
}
