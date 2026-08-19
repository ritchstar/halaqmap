/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { cn } from '@/lib/utils';

type StoreShotProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
};

export function StoreShot({ src, alt, className, imgClassName, eager = false }: StoreShotProps) {
  return (
    <div className={cn('overflow-hidden bg-black/40', className)}>
      <img
        src={src}
        alt={alt}
        className={cn('h-full w-full object-cover', imgClassName)}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}
