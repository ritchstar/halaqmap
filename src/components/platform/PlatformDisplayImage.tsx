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

export function PlatformDisplayImage({ src, alt, variant, className, priority = false }: Props) {
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      className={cn(platformDisplayImageClass(variant), className)}
    />
  );
}
