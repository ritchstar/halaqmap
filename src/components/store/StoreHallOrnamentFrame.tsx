/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إطار صورة فوق الشاشة أو الحقل. المركز شفاف فلا يغطي النص.
 */
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export function StoreHallOrnamentFrame({
  src,
  className,
  style,
}: {
  src: string;
  className?: string;
  /** لتلوين الإطار بفلتر CSS (مثل hue-rotate) دون الحاجة لصورة جديدة. */
  style?: CSSProperties;
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
      style={style}
      loading="lazy"
      decoding="async"
    />
  );
}
