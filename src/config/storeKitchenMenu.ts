/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بنك أصناف الأسرة المنتجة — لا يُستورد من App. لا أطباق مطاعم ولا مشروبات مقاهي.
 */
export type StoreKitchenMenuItem = {
  id: string;
  nameAr: string;
  category: string;
  defaultPrice: number;
};

export const STORE_KITCHEN_STILLS = {
  hero: '/images/store/kitchen-hero-marketing.jpg',
  kabsa: '/images/store/kitchen/kitchen-01.jpg',
  pot: '/images/store/kitchen/kitchen-02.jpg',
  grape: '/images/store/kitchen/kitchen-03.jpg',
  luqaimat: '/images/store/kitchen/kitchen-04.jpg',
  samboosa: '/images/store/kitchen/kitchen-05.jpg',
  qahwa: '/images/store/kitchen/kitchen-06.jpg',
} as const;

export function kitchenDemoPhotoSrc(catalogId: string): string {
  switch (catalogId) {
    case 'rice-home-kabsa':
    case 'rice-madghut':
    case 'today-board':
      return STORE_KITCHEN_STILLS.kabsa;
    case 'pot-marqooq':
    case 'pot-jareesh':
    case 'pot-salona':
      return STORE_KITCHEN_STILLS.pot;
    case 'roll-grape':
    case 'side-salad':
      return STORE_KITCHEN_STILLS.grape;
    case 'sweet-luqaimat':
      return STORE_KITCHEN_STILLS.luqaimat;
    case 'bake-samboosa':
      return STORE_KITCHEN_STILLS.samboosa;
    case 'drink-qahwa':
    case 'drink-laban':
      return STORE_KITCHEN_STILLS.qahwa;
    default:
      return '';
  }
}

export const STORE_KITCHEN_MENU: readonly StoreKitchenMenuItem[] = [
  { id: 'rice-home-kabsa', nameAr: 'كبسة البيت', category: 'أرز', defaultPrice: 25 },
  { id: 'rice-madghut', nameAr: 'مضغوط لحم', category: 'أرز', defaultPrice: 35 },
  { id: 'pot-marqooq', nameAr: 'مرقوق', category: 'قدور', defaultPrice: 22 },
  { id: 'pot-qursan', nameAr: 'قرصان', category: 'قدور', defaultPrice: 22 },
  { id: 'pot-matazeez', nameAr: 'مطازيز', category: 'قدور', defaultPrice: 24 },
  { id: 'pot-jareesh', nameAr: 'جريش', category: 'قدور', defaultPrice: 18 },
  { id: 'pot-harees', nameAr: 'هريس', category: 'قدور', defaultPrice: 18 },
  { id: 'pot-salona', nameAr: 'صالونة دجاج', category: 'قدور', defaultPrice: 20 },
  { id: 'pot-bamia', nameAr: 'بامية', category: 'قدور', defaultPrice: 18 },
  { id: 'pot-mulukhiya', nameAr: 'ملوخية', category: 'قدور', defaultPrice: 18 },
  { id: 'roll-grape', nameAr: 'ورق عنب', category: 'محاشي', defaultPrice: 20 },
  { id: 'roll-mahshi', nameAr: 'محاشي كوسا', category: 'محاشي', defaultPrice: 22 },
  { id: 'bake-samboosa', nameAr: 'سمبوسة', category: 'معجنات', defaultPrice: 12 },
  { id: 'bake-fatayer', nameAr: 'فطائر سبانخ', category: 'معجنات', defaultPrice: 14 },
  { id: 'wrap-home', nameAr: 'شاورما البيت', category: 'معجنات', defaultPrice: 12 },
  { id: 'sweet-kunafa', nameAr: 'كنافة', category: 'حلويات', defaultPrice: 15 },
  { id: 'sweet-luqaimat', nameAr: 'لقيمات البيت', category: 'حلويات', defaultPrice: 10 },
  { id: 'sweet-areeka', nameAr: 'عريكة', category: 'حلويات', defaultPrice: 16 },
  { id: 'sweet-maamoul', nameAr: 'معمول', category: 'حلويات', defaultPrice: 12 },
  { id: 'drink-laban', nameAr: 'لبن', category: 'مشروبات', defaultPrice: 3 },
  { id: 'drink-tea', nameAr: 'شاي أحمر', category: 'مشروبات', defaultPrice: 2 },
  { id: 'drink-qahwa', nameAr: 'قهوة عربية', category: 'مشروبات', defaultPrice: 4 },
  { id: 'drink-lemon', nameAr: 'ليمون نعناع', category: 'مشروبات', defaultPrice: 6 },
  { id: 'side-salad', nameAr: 'سلطة البيت', category: 'مقبلات', defaultPrice: 8 },
  { id: 'side-dates', nameAr: 'تمر بالسمن', category: 'مقبلات', defaultPrice: 10 },
  { id: 'today-board', nameAr: 'طبق اليوم', category: 'اليوم', defaultPrice: 20 },
];

export const STORE_KITCHEN_CATEGORIES = Array.from(
  new Set(STORE_KITCHEN_MENU.map((item) => item.category)),
);

export function kitchenMenuById(id: string): StoreKitchenMenuItem | undefined {
  return STORE_KITCHEN_MENU.find((item) => item.id === id);
}

export function parseKitchenListText(raw: string): Array<{ nameAr: string; price: number }> {
  return String(raw || '')
    .split(/\n+/)
    .map((line) => line.replace(/[|،,-]+/g, ' ').trim())
    .filter(Boolean)
    .map((line) => {
      const priceMatch = line.match(/(\d+(?:\.\d+)?)/);
      const price = priceMatch ? Math.max(1, Math.round(Number(priceMatch[1]))) : 10;
      const nameAr = line.replace(priceMatch?.[0] || '', '').replace(/\s+/g, ' ').trim() || 'صنف';
      return { nameAr: nameAr.slice(0, 40), price };
    })
    .slice(0, 40);
}
