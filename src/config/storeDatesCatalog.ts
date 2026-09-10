/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بنك أصناف التمر — مستقل عن بنك خضار وفواكه خضارنا1 وبنك تمويناتا1. لا يُستورد من App.
 */
export type StoreDatesUnit = 'kilo' | 'box' | 'bag' | 'piece';

export type StoreDatesCatalogItem = {
  id: string;
  nameAr: string;
  category: string;
  unit: StoreDatesUnit;
  defaultPrice: number;
};

type Seed = readonly [nameAr: string, unit: StoreDatesUnit, price: number];

function expand(category: string, seeds: readonly Seed[], prefix: string): StoreDatesCatalogItem[] {
  return seeds.map(([nameAr, unit, defaultPrice], index) => ({
    id: `${prefix}-${index + 1}`,
    nameAr,
    category,
    unit,
    defaultPrice,
  }));
}

export const STORE_DATES_UNIT_AR: Record<StoreDatesUnit, string> = {
  kilo: 'كيلو',
  box: 'صندوق',
  bag: 'كيس',
  piece: 'علبة',
};

const CLASSIC: Seed[] = [
  ['سكري', 'kilo', 45],
  ['خلاص', 'kilo', 35],
  ['عجوة المدينة', 'kilo', 60],
  ['صفري', 'kilo', 30],
  ['برحي', 'kilo', 40],
  ['مجدول', 'kilo', 70],
];

const PREMIUM: Seed[] = [
  ['عجوة درجة أولى', 'kilo', 90],
  ['صفاوي فاخر', 'kilo', 55],
  ['أنبر', 'kilo', 65],
  ['خضري', 'kilo', 38],
];

const STUFFED: Seed[] = [
  ['تمر محشو لوز', 'box', 40],
  ['تمر محشو جوز', 'box', 42],
  ['تمر مغطى بالشوكولاتة', 'box', 45],
  ['تمر بالسمسم', 'box', 35],
];

const BYPRODUCTS: Seed[] = [
  ['دبس تمر', 'piece', 25],
  ['معجون تمر', 'piece', 22],
  ['تمر مفروم للحشو', 'kilo', 32],
  ['خل تمر', 'piece', 20],
];

const GIFT_BOXES: Seed[] = [
  ['صندوق هدية صغير', 'box', 60],
  ['صندوق هدية فاخر', 'box', 120],
  ['طبق تقديم رمضاني', 'box', 90],
  ['سلة تمر وقهوة', 'box', 150],
];

const BULK: Seed[] = [
  ['كرتون تمر 5 كيلو', 'bag', 180],
  ['كرتون تمر 10 كيلو', 'bag', 340],
  ['كيس تعبئة منزلية', 'bag', 20],
];

export const STORE_DATES_CATALOG: readonly StoreDatesCatalogItem[] = [
  ...expand('تمور كلاسيكية', CLASSIC, 'classic'),
  ...expand('تمور فاخرة', PREMIUM, 'premium'),
  ...expand('تمر محشو ومغطى', STUFFED, 'stuffed'),
  ...expand('منتجات التمر', BYPRODUCTS, 'byp'),
  ...expand('صناديق الهدايا', GIFT_BOXES, 'gift'),
  ...expand('تعبئة بالجملة', BULK, 'bulk'),
];

export const STORE_DATES_CATEGORIES = Array.from(
  new Set(STORE_DATES_CATALOG.map((item) => item.category)),
);

export function datesCatalogById(id: string): StoreDatesCatalogItem | undefined {
  return STORE_DATES_CATALOG.find((item) => item.id === id);
}

export function parseDatesListText(raw: string): Array<{ nameAr: string; price: number }> {
  return String(raw || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.*?)[\s:—-]+(\d+(?:\.\d{1,2})?)\s*$/);
      if (!match) return { nameAr: line.slice(0, 80), price: 0 };
      return { nameAr: match[1].trim().slice(0, 80), price: Number(match[2]) };
    })
    .filter((row) => row.nameAr.length >= 2);
}
