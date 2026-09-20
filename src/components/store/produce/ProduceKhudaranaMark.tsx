/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دمغة خضارنا1 — أيقونة العلامة الرسمية (نفس أيقونة فهرس المتجر
 * halaqmap-b-01.webp)، بدل شارة الورقة العامة (Leaf) القديمة.
 */
import { solutionCatalogMarkSrc } from '@/config/storeSolutionCatalog';
import { cn } from '@/lib/utils';

type ProduceKhudaranaMarkProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** @deprecated الأيقونة الرسمية تحمل خلفيتها الداكنة وحدودها الذهبية دائماً — لم تعد بحاجة لنسخة معكوسة. */
  inverse?: boolean;
};

const sizeClasses = {
  sm: 'size-9 rounded-lg',
  md: 'size-11 rounded-xl',
  lg: 'size-14 rounded-2xl',
};

const KHUDARANA_MARK_SRC = solutionCatalogMarkSrc('B-01');

export function ProduceKhudaranaMark({ className, size = 'md' }: ProduceKhudaranaMarkProps) {
  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center overflow-hidden shadow-sm', sizeClasses[size], className)}
    >
      <img
        src={KHUDARANA_MARK_SRC}
        alt="دمغة خضارنا1"
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
