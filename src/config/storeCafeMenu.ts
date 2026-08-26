/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بنك مشروبات مقهى الحي — لا يُستورد من App. لا أطباق مطاعم ولا سلع تموينات.
 */
export type StoreCafeMenuItem = {
  id: string;
  nameAr: string;
  category: string;
  defaultPrice: number;
};

export const STORE_CAFE_MENU: readonly StoreCafeMenuItem[] = [
  { id: 'hot-qahwa', nameAr: 'قهوة عربية', category: 'حار', defaultPrice: 8 },
  { id: 'hot-espresso', nameAr: 'إسبريسو', category: 'حار', defaultPrice: 10 },
  { id: 'hot-latte', nameAr: 'لاتيه', category: 'حار', defaultPrice: 14 },
  { id: 'hot-cappuccino', nameAr: 'كابتشينو', category: 'حار', defaultPrice: 14 },
  { id: 'hot-tea', nameAr: 'شاي أحمر', category: 'حار', defaultPrice: 6 },
  { id: 'hot-karak', nameAr: 'كرك', category: 'حار', defaultPrice: 8 },
  { id: 'cold-iced', nameAr: 'قهوة مثلجة', category: 'بارد', defaultPrice: 16 },
  { id: 'cold-spanish', nameAr: 'سبانش لاتيه', category: 'بارد', defaultPrice: 18 },
  { id: 'cold-mocha', nameAr: 'موكا مثلجة', category: 'بارد', defaultPrice: 18 },
  { id: 'cold-matcha', nameAr: 'ماتشا مثلجة', category: 'بارد', defaultPrice: 20 },
  { id: 'fresh-orange', nameAr: 'برتقال طازج', category: 'عصير', defaultPrice: 12 },
  { id: 'fresh-lemon', nameAr: 'ليمون نعناع', category: 'عصير', defaultPrice: 12 },
  { id: 'fresh-avocado', nameAr: 'أفوكادو', category: 'عصير', defaultPrice: 16 },
  { id: 'sweet-kunafa', nameAr: 'كنافة كوب', category: 'حلويات', defaultPrice: 14 },
  { id: 'sweet-cheesecake', nameAr: 'تشيز كيك', category: 'حلويات', defaultPrice: 16 },
  { id: 'sweet-cookie', nameAr: 'كوكيز', category: 'حلويات', defaultPrice: 8 },
  { id: 'side-water', nameAr: 'ماء', category: 'إضافات', defaultPrice: 2 },
  { id: 'side-croissant', nameAr: 'كرواسون', category: 'إضافات', defaultPrice: 10 },
  { id: 'today-board', nameAr: 'عرض اليوم', category: 'اليوم', defaultPrice: 15 },
];

export const STORE_CAFE_CATEGORIES = Array.from(new Set(STORE_CAFE_MENU.map((item) => item.category)));

export function cafeMenuById(id: string): StoreCafeMenuItem | undefined {
  return STORE_CAFE_MENU.find((item) => item.id === id);
}

export function parseCafeListText(raw: string): Array<{ nameAr: string; price: number }> {
  return String(raw || '')
    .split(/\n+/)
    .map((line) => line.replace(/[|،,-]+/g, ' ').trim())
    .filter(Boolean)
    .map((line) => {
      const priceMatch = line.match(/(\d+(?:\.\d+)?)/);
      const price = priceMatch ? Math.max(1, Math.round(Number(priceMatch[1]))) : 10;
      const nameAr = line.replace(priceMatch?.[0] || '', '').replace(/\s+/g, ' ').trim() || 'مشروب';
      return { nameAr: nameAr.slice(0, 40), price };
    })
    .slice(0, 80);
}
