import type { PlatformDisplayVariant } from '@/lib/platformImageTransform';
import { platformDisplayImageClass } from '@/lib/platformImageTransform';
import { cn } from '@/lib/utils';

type Props = {
  src: string;
  alt: string;
  variant: PlatformDisplayVariant;
  className?: string;
  /** أول صورة بطاقة في القائمة — تحميل أسرع */
  priority?: boolean;
};

const INTRINSIC_SIZE: Partial<Record<PlatformDisplayVariant, { width: number; height: number }>> = {
  banner_card: { width: 960, height: 384 },
  banner_detail: { width: 1200, height: 480 },
  gallery_tile: { width: 400, height: 400 },
};

export function PlatformDisplayImage({ src, alt, variant, className, priority = false }: Props) {
  const size = INTRINSIC_SIZE[variant];
  return (
    <img
      src={src}
      alt={alt}
      width={size?.width}
      height={size?.height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={cn(platformDisplayImageClass(variant), className)}
    />
  );
}
