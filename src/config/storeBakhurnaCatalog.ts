/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بنك أصناف بخورنا1 — مستقل عن بقية بنوك المنتجات. لا يُستورد من App.
 * بنية تحتية أولية قابلة للتقييم والتطوير — راجع docs/bakhurna1-backend-todo.md.
 */
export type StoreBakhurnaUnit = 'piece' | 'gram' | 'ml' | 'box' | 'tola';

export type StoreBakhurnaCatalogItem = {
  id: string;
  nameAr: string;
  category: string;
  unit: StoreBakhurnaUnit;
  defaultPrice: number;
};

type Seed = readonly [nameAr: string, unit: StoreBakhurnaUnit, price: number];

function expand(category: string, seeds: readonly Seed[], prefix: string): StoreBakhurnaCatalogItem[] {
  return seeds.map(([nameAr, unit, defaultPrice], index) => ({
    id: `${prefix}-${index + 1}`,
    nameAr,
    category,
    unit,
    defaultPrice,
  }));
}

export const STORE_BAKHURNA_UNIT_AR: Record<StoreBakhurnaUnit, string> = {
  piece: 'قطعة',
  gram: 'جرام',
  ml: 'مل',
  box: 'علبة',
  tola: 'تولة',
};

const CLASSIC: Seed[] = [
  ['معطر الورد', 'box', 28],
  ['معطر العنبر', 'box', 32],
  ['معطر المسك', 'box', 30],
  ['بخور الصندل', 'box', 26],
  ['بخور الياسمين', 'box', 27],
  ['بخور العود المخلوط', 'box', 40],
];

const PREMIUM: Seed[] = [
  ['كمبودي فاخر', 'box', 120],
  ['هندي أصلي', 'box', 95],
  ['تايلندي مميز', 'box', 85],
  ['معطر ملكي', 'box', 150],
];

const OUD_OILS: Seed[] = [
  ['دهن عود كمبودي', 'tola', 380],
  ['دهن عود هندي', 'tola', 260],
  ['دهن عود تايلندي', 'tola', 220],
  ['دهن عود مخلوط', 'tola', 140],
];

const ATTARS: Seed[] = [
  ['عطر مسك أبيض', 'ml', 45],
  ['عطر عنبر ملكي', 'ml', 55],
  ['معطر ورد طائفي', 'ml', 60],
  ['معطر صندل هندي', 'ml', 50],
];

const ACCESSORIES: Seed[] = [
  ['مبخرة كهربائية', 'piece', 55],
  ['مبخرة تقليدية', 'piece', 35],
  ['فحم سريع الاشتعال', 'piece', 15],
  ['ملقط تقديم', 'piece', 12],
];

const GIFT_SETS: Seed[] = [
  ['طقم هدية صغير', 'box', 70],
  ['طقم هدية فاخر', 'box', 180],
  ['طقم عروس', 'box', 220],
  ['سلة بخور وعطور', 'box', 160],
];

const BULK: Seed[] = [
  ['بخور بالجملة 100غ', 'gram', 35],
  ['بخور بالجملة 250غ', 'gram', 80],
  ['عبوة تعبئة منزلية', 'gram', 20],
];

export const STORE_BAKHURNA_CATALOG: readonly StoreBakhurnaCatalogItem[] = [
  ...expand('بخور كلاسيكي', CLASSIC, 'classic'),
  ...expand('بخور فاخر', PREMIUM, 'premium'),
  ...expand('دهن العود', OUD_OILS, 'oud'),
  ...expand('عطور ومعطرات', ATTARS, 'attar'),
  ...expand('مستلزمات التبخير', ACCESSORIES, 'acc'),
  ...expand('أطقم الهدايا', GIFT_SETS, 'gift'),
  ...expand('تعبئة بالجملة', BULK, 'bulk'),
];

export const STORE_BAKHURNA_CATEGORIES = Array.from(
  new Set(STORE_BAKHURNA_CATALOG.map((item) => item.category)),
);

export function bakhurnaCatalogById(id: string): StoreBakhurnaCatalogItem | undefined {
  return STORE_BAKHURNA_CATALOG.find((item) => item.id === id);
}

export function parseBakhurnaListText(raw: string): Array<{ nameAr: string; price: number }> {
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
