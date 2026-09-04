/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { cn } from '@/lib/utils';

export function ProductInterfaceFrame({
  src,
  alt,
  device = 'phone',
}: {
  src: string;
  alt: string;
  device?: 'phone' | 'tablet';
}) {
  return (
    <figure
      className={cn(
        'store-atlas__card overflow-hidden p-2',
        device === 'phone' ? 'mx-auto max-w-[18rem]' : 'w-full',
      )}
    >
      <div className="overflow-hidden rounded-[18px] bg-[var(--atlas-well)]">
        <img src={src} alt={alt} className="aspect-[9/16] w-full object-cover" />
      </div>
    </figure>
  );
}
