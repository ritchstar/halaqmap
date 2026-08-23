/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بنك أطباق مطعم الحي — لا يُستورد من App. لا سلع تموينات.
 */
export type StoreRestaurantMenuItem = {
  id: string;
  nameAr: string;
  category: string;
  defaultPrice: number;
};

export const STORE_RESTAURANT_MENU: readonly StoreRestaurantMenuItem[] = [
  { id: 'rice-kabsa', nameAr: 'كبسة دجاج', category: 'أرز', defaultPrice: 28 },
  { id: 'rice-mandi', nameAr: 'مندي لحم', category: 'أرز', defaultPrice: 42 },
  { id: 'rice-maklouba', nameAr: 'مقلوبة', category: 'أرز', defaultPrice: 30 },
  { id: 'grill-mix', nameAr: 'مشويات مشكلة', category: 'مشويات', defaultPrice: 48 },
  { id: 'grill-tikka', nameAr: 'تكة دجاج', category: 'مشويات', defaultPrice: 26 },
  { id: 'grill-kofta', nameAr: 'كفتة مشوية', category: 'مشويات', defaultPrice: 24 },
  { id: 'wrap-shawarma', nameAr: 'شاورما عربي', category: 'سندويش', defaultPrice: 14 },
  { id: 'wrap-falafal', nameAr: 'فلافل', category: 'سندويش', defaultPrice: 8 },
  { id: 'wrap-mutabbaq', nameAr: 'مطبق لحم', category: 'سندويش', defaultPrice: 12 },
  { id: 'break-foul', nameAr: 'فول بالزيت', category: 'فطور', defaultPrice: 10 },
  { id: 'break-eggs', nameAr: 'بيض بالمطاعم', category: 'فطور', defaultPrice: 12 },
  { id: 'break-tamriya', nameAr: 'تمريّة', category: 'فطور', defaultPrice: 8 },
  { id: 'side-salad', nameAr: 'سلطة الموسم', category: 'مقبلات', defaultPrice: 10 },
  { id: 'side-soup', nameAr: 'شوربة اليوم', category: 'مقبلات', defaultPrice: 9 },
  { id: 'side-humus', nameAr: 'حمص', category: 'مقبلات', defaultPrice: 8 },
  { id: 'drink-laban', nameAr: 'لبن', category: 'مشروبات', defaultPrice: 4 },
  { id: 'drink-tea', nameAr: 'شاي أحمر', category: 'مشروبات', defaultPrice: 3 },
  { id: 'drink-qahwa', nameAr: 'قهوة عربية', category: 'مشروبات', defaultPrice: 5 },
  { id: 'sweet-aseeda', nameAr: 'عصيدة', category: 'حلويات', defaultPrice: 12 },
  { id: 'sweet-luqaimat', nameAr: 'لقيمات', category: 'حلويات', defaultPrice: 10 },
  { id: 'kids-nugget', nameAr: 'قطع دجاج للصغار', category: 'صغار', defaultPrice: 16 },
  { id: 'today-board', nameAr: 'طبق اليوم', category: 'اليوم', defaultPrice: 22 },
];

export const STORE_RESTAURANT_CATEGORIES = Array.from(
  new Set(STORE_RESTAURANT_MENU.map((item) => item.category)),
);

export function restaurantMenuById(id: string): StoreRestaurantMenuItem | undefined {
  return STORE_RESTAURANT_MENU.find((item) => item.id === id);
}

export function parseRestaurantListText(raw: string): Array<{ nameAr: string; price: number }> {
  return String(raw || '')
    .split(/\n+/)
    .map((line) => line.replace(/[|،,-]+/g, ' ').trim())
    .filter(Boolean)
    .map((line) => {
      const priceMatch = line.match(/(\d+(?:\.\d+)?)/);
      const price = priceMatch ? Math.max(1, Math.round(Number(priceMatch[1]))) : 10;
      const nameAr = line.replace(priceMatch?.[0] || '', '').replace(/\s+/g, ' ').trim() || 'طبق';
      return { nameAr: nameAr.slice(0, 40), price };
    })
    .slice(0, 80);
}
