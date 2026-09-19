/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * علامة/أيقونة المنتج الرسمية — تُعرض بارزة أعلى صفحة كل منتج بنفس الحجم
 * تماماً في كل الصفحات (حجم ثابت واحد هنا يغذّي الجميع)، كعلامة تجارية
 * واضحة لا مجرد نص. المصدر: logoSrc في STORE_SOLUTION_CATALOG_PRODUCTS
 * (أو أي مسار صورة آخر يُمرَّر مباشرة، كما في صفحتي ساحة الشطرنج ومدرسته).
 */
import { sanitizeStoreProductImageSrc } from '@/lib/storeDisallowedImagery';
import { cn } from '@/lib/utils';

type StoreProductBrandMarkProps = {
  src: string | null | undefined;
  nameAr: string;
  className?: string;
};

/** حجم ثابت موحّد لكل الصفحات — لا تُخصّص هذا الحجم لمنتج بعينه. */
const BRAND_MARK_SIZE_CLASS = 'h-24 w-24 md:h-28 md:w-28';

export function StoreProductBrandMark({ src, nameAr, className }: StoreProductBrandMarkProps) {
  const safeSrc = sanitizeStoreProductImageSrc(src || '');
  if (!safeSrc) return null;

  return (
    <div className={cn('mb-4 flex justify-center lg:justify-start', className)}>
      <img
        src={safeSrc}
        alt={`العلامة الرسمية لـ ${nameAr}`}
        loading="eager"
        decoding="async"
        className={cn(
          BRAND_MARK_SIZE_CLASS,
          'rounded-2xl border border-white/15 bg-black/25 object-contain p-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)]',
        )}
      />
    </div>
  );
}
