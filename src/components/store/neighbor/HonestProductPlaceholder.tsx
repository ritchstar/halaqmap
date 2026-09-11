/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بديل صادق عند غياب صورة المنتج — بلا صور مخزنية مضللة.
 */
import { cn } from '@/lib/utils';

const CATEGORY_ICON: Record<string, string> = {
  'ألبان': '🥛',
  'أجبان': '🧀',
  'مخبوزات': '🍞',
  'مياه': '💧',
  'معلبات': '🥫',
  'أرز وحبوب': '🌾',
  'زيوت': '🫒',
  'مشروبات': '🥤',
  'شاي وقهوة': '☕',
  'حلويات': '🍫',
  'منظفات': '🧴',
  'عناية': '🧼',
  'مجمدات': '🧊',
  'لحوم': '🥩',
  'بيض': '🥚',
  'خضار': '🥬',
  'فواكه': '🍎',
};

function iconForCategory(category: string): string {
  const key = category.trim();
  return CATEGORY_ICON[key] || '🛒';
}

export function HonestProductPlaceholder({
  nameAr,
  category = '',
  className,
}: {
  nameAr: string;
  category?: string;
  className?: string;
}) {
  return (
    <div
      className={cn('neighbor-product-placeholder', className)}
      aria-hidden="true"
    >
      <span className="neighbor-product-placeholder__icon">{iconForCategory(category)}</span>
      <span className="neighbor-product-placeholder__name">{nameAr}</span>
    </div>
  );
}
