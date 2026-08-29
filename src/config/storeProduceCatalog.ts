/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بنك خضار وفواكه الحي — مستقل عن بنك تمويناتا1. لا يُستورد من App.
 */
export type StoreProduceUnit = 'piece' | 'kilo' | 'bunch' | 'crate';

export type StoreProduceCatalogItem = {
  id: string;
  nameAr: string;
  category: string;
  unit: StoreProduceUnit;
  defaultPrice: number;
};

type Seed = readonly [nameAr: string, unit: StoreProduceUnit, price: number];

function expand(category: string, seeds: readonly Seed[], prefix: string): StoreProduceCatalogItem[] {
  return seeds.map(([nameAr, unit, defaultPrice], index) => ({
    id: `${prefix}-${index + 1}`,
    nameAr,
    category,
    unit,
    defaultPrice,
  }));
}

export const STORE_PRODUCE_UNIT_AR: Record<StoreProduceUnit, string> = {
  piece: 'حبة',
  kilo: 'كيلو',
  bunch: 'حزمة',
  crate: 'صندوق',
};

const LEAF: Seed[] = [
  ['خس بلدي', 'piece', 3],
  ['جرجير', 'bunch', 2],
  ['سبانخ', 'bunch', 3],
  ['ملفوف أبيض', 'piece', 5],
  ['ملفوف أحمر', 'piece', 6],
  ['ملوخية ورق', 'bunch', 4],
];

const ROOT: Seed[] = [
  ['بطاطس', 'kilo', 4],
  ['بصل أحمر', 'kilo', 4],
  ['بصل أبيض', 'kilo', 4],
  ['ثوم بلدي', 'kilo', 12],
  ['جزر', 'kilo', 5],
  ['شمندر', 'kilo', 6],
  ['فجل', 'bunch', 2],
];

const FRUIT_VEG: Seed[] = [
  ['طماطم', 'kilo', 6],
  ['خيار', 'kilo', 5],
  ['كوسا', 'kilo', 6],
  ['باذنجان', 'kilo', 6],
  ['فلفل أخضر', 'kilo', 7],
  ['فلفل ملون', 'kilo', 10],
  ['بامية', 'kilo', 9],
  ['فاصوليا خضراء', 'kilo', 8],
];

const FRUIT: Seed[] = [
  ['تفاح أحمر', 'kilo', 9],
  ['تفاح أخضر', 'kilo', 9],
  ['موز', 'kilo', 7],
  ['برتقال', 'kilo', 8],
  ['ليمون', 'kilo', 6],
  ['عنب', 'kilo', 12],
  ['رمان', 'kilo', 11],
  ['بطيخ', 'piece', 18],
  ['شمام', 'piece', 14],
];

const HERBS: Seed[] = [
  ['بقدونس', 'bunch', 2],
  ['كزبرة ورق', 'bunch', 2],
  ['نعناع', 'bunch', 2],
  ['شبت', 'bunch', 2],
  ['بصل أخضر', 'bunch', 2],
];

const CRATES: Seed[] = [
  ['صندوق السلطة', 'crate', 25],
  ['صندوق البيت', 'crate', 35],
  ['صندوق العصير', 'crate', 28],
];

export const STORE_PRODUCE_CATALOG: readonly StoreProduceCatalogItem[] = [
  ...expand('خضار ورقية', LEAF, 'leaf'),
  ...expand('خضار جذرية', ROOT, 'root'),
  ...expand('خضار ثمرية', FRUIT_VEG, 'veg'),
  ...expand('فواكه', FRUIT, 'fruit'),
  ...expand('أعشاب وحزم', HERBS, 'herb'),
  ...expand('صناديق اليوم', CRATES, 'crate'),
];

export const STORE_PRODUCE_CATEGORIES = Array.from(
  new Set(STORE_PRODUCE_CATALOG.map((item) => item.category)),
);

export function produceCatalogById(id: string): StoreProduceCatalogItem | undefined {
  return STORE_PRODUCE_CATALOG.find((item) => item.id === id);
}

export function parseProduceListText(raw: string): Array<{ nameAr: string; price: number }> {
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
