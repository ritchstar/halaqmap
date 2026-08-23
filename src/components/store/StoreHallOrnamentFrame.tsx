/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إطار صورة فوق الشاشة أو الحقل. المركز شفاف فلا يغطي النص.
 */
import { cn } from '@/lib/utils';

export function StoreHallOrnamentFrame({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 z-[3] h-full w-full object-fill select-none',
        className,
      )}
      loading="lazy"
      decoding="async"
    />
  );
}
