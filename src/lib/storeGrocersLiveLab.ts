/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حالة معاينة تموينات الحي — محلية بلا خلط بقاعات المناسبة.
 */
import { STORE_GROCERS_CATALOG, grocersCatalogById, parseGrocersListText } from '@/config/storeGrocersCatalog';

export { parseGrocersListText };
import { STORE_GROCERS_LIVE_DEMO, type StoreGrocersLivePackId } from '@/config/storeGrocersLive';
import { compressImageFile } from '@/lib/storeWeddingLiveLab';

export { compressImageFile };

export type GrocersShelfItem = {
  catalogId: string;
  nameAr: string;
  category: string;
  price: number;
  inStock: boolean;
  featured: boolean;
};

export type GrocersOrderLine = {
  catalogId: string;
  nameAr: string;
  qty: number;
  price: number;
};

export type GrocersPayMethod = 'cash' | 'card';

export type GrocersOrder = {
  id: string;
  name: string;
  phone: string;
  place: string;
  facadeSrc: string;
  pay: GrocersPayMethod;
  lines: GrocersOrderLine[];
  total: number;
  at: string;
  seen: boolean;
};

export type GrocersHostState = {
  shopName: string;
  hostName: string;
  blurbAr: string;
  customFields: string[];
  flashAr: string;
  packId: StoreGrocersLivePackId;
};

export type GrocersLabState = {
  host: GrocersHostState;
  shelf: GrocersShelfItem[];
  orders: GrocersOrder[];
};

function storageKey(token: string): string {
  return `store-grocers-live:v1:${token.trim() || 'grocers-lab'}`;
}

const DEMO_IDS = [
  'dairy-1',
  'dairy-6',
  'bread-1',
  'water-7',
  'cheese-1',
  'clean-1',
  'rice-1',
  'egg-1',
  'juice-1',
  'tea-1',
  'oil-1',
  'can-7',
  'snack-3',
  'fresh-2',
  'fresh-9',
] as const;

export function defaultGrocersLabState(): GrocersLabState {
  const shelf = DEMO_IDS.map((id, index) => {
    const item = grocersCatalogById(id) || STORE_GROCERS_CATALOG[index];
    return {
      catalogId: item.id,
      nameAr: item.nameAr,
      category: item.category,
      price: item.defaultPrice,
      inStock: true,
      featured: index < 10,
    };
  });
  return {
    host: {
      shopName: STORE_GROCERS_LIVE_DEMO.shopName,
      hostName: STORE_GROCERS_LIVE_DEMO.hostName,
      blurbAr: STORE_GROCERS_LIVE_DEMO.blurbAr,
      customFields: [...STORE_GROCERS_LIVE_DEMO.customFields],
      flashAr: STORE_GROCERS_LIVE_DEMO.flashAr,
      packId: 'm6',
    },
    shelf,
    orders: [],
  };
}

export function readGrocersLabState(token: string): GrocersLabState {
  const fallback = defaultGrocersLabState();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<GrocersLabState>;
    return {
      host: {
        ...fallback.host,
        ...(parsed.host || {}),
        customFields: Array.from({ length: 5 }, (_, i) => parsed.host?.customFields?.[i] || fallback.host.customFields[i] || ''),
      },
      shelf: Array.isArray(parsed.shelf) && parsed.shelf.length ? parsed.shelf : fallback.shelf,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    return fallback;
  }
}

export function writeGrocersLabState(token: string, state: GrocersLabState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(token), JSON.stringify(state));
  } catch {
    const slim = {
      ...state,
      orders: state.orders.map((order) => ({
        ...order,
        facadeSrc: order.facadeSrc.startsWith('data:') ? '' : order.facadeSrc,
      })),
    };
    window.localStorage.setItem(storageKey(token), JSON.stringify(slim));
  }
}

export function grocersCartTotal(lines: GrocersOrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty * line.price, 0);
}

export function activateCatalogItem(
  state: GrocersLabState,
  catalogId: string,
  price?: number,
): GrocersLabState {
  const catalog = grocersCatalogById(catalogId);
  if (!catalog) return state;
  const existing = state.shelf.find((item) => item.catalogId === catalogId);
  if (existing) {
    return {
      ...state,
      shelf: state.shelf.map((item) =>
        item.catalogId === catalogId
          ? { ...item, inStock: true, price: price ?? item.price }
          : item,
      ),
    };
  }
  const featuredCount = state.shelf.filter((item) => item.featured).length;
  return {
    ...state,
    shelf: [
      ...state.shelf,
      {
        catalogId: catalog.id,
        nameAr: catalog.nameAr,
        category: catalog.category,
        price: price ?? catalog.defaultPrice,
        inStock: true,
        featured: featuredCount < 10,
      },
    ],
  };
}

export function grocersWhatsAppText(order: GrocersOrder, shopName: string): string {
  const pay = order.pay === 'card' ? 'شبكة مع التوصيل' : 'نقداً عند الاستلام';
  const lines = order.lines.map((line) => `${line.nameAr} × ${line.qty} = ${line.price * line.qty} ر.س`).join('\n');
  const facade = order.facadeSrc ? 'صورة واجهة السكن محفوظة في المذكرة.' : 'بلا صورة واجهة.';
  return [
    `مذكرة توصيل — ${shopName}`,
    `الزبون: ${order.name}`,
    `الجوال: ${order.phone}`,
    `الموقع: ${order.place}`,
    facade,
    `الدفع: ${pay}`,
    lines,
    `الإجمالي: ${order.total} ر.س`,
  ].join('\n');
}

export function grocersArchiveJson(state: GrocersLabState): string {
  return JSON.stringify(
    {
      product: 'تموينات الحي',
      brand: 'halaqmap',
      shopName: state.host.shopName,
      orders: state.orders.map((order) => ({
        ...order,
        facadeSrc: order.facadeSrc.startsWith('data:') ? 'صورة محفوظة محلياً' : order.facadeSrc,
      })),
    },
    null,
    2,
  );
}

const BUYER_KEY = 'store-grocers-buyer:v1';

export type GrocersSavedBuyer = {
  name: string;
  phone: string;
  place: string;
};

export function readSavedGrocersBuyer(): GrocersSavedBuyer | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BUYER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GrocersSavedBuyer>;
    if (!parsed.name || !parsed.phone) return null;
    return { name: parsed.name, phone: parsed.phone, place: parsed.place || '' };
  } catch {
    return null;
  }
}

export function writeSavedGrocersBuyer(buyer: GrocersSavedBuyer | null): void {
  if (typeof window === 'undefined') return;
  if (!buyer) {
    window.localStorage.removeItem(BUYER_KEY);
    return;
  }
  window.localStorage.setItem(BUYER_KEY, JSON.stringify(buyer));
}

export function playGrocersBeep(): void {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 880;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  window.setTimeout(() => {
    osc.stop();
    void ctx.close();
  }, 180);
}
