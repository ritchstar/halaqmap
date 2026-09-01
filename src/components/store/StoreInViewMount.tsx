/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يركّب معاينة التشغيل عند دخولها الشاشة حتى لا تعمل مؤقتات الاستوديو من أول الرسم.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function StoreInViewMount({
  children,
  className,
  minHeightClass = 'min-h-[22rem]',
  rootMargin = '160px 0px',
}: {
  children: ReactNode;
  className?: string;
  minHeightClass?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown) return undefined;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setShown(true);
      },
      { rootMargin, threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown, rootMargin]);

  return (
    <div ref={ref} className={cn(!shown && minHeightClass, className)}>
      {shown ? children : <div className="store-preview-skeleton" aria-hidden />}
    </div>
  );
}
