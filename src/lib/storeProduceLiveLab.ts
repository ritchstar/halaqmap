/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حالة معاينة خضارنا1 — محلية بلا خلط بتمويناتا1.
 */
import {
  STORE_PRODUCE_CATALOG,
  STORE_PRODUCE_UNIT_AR,
  parseProduceListText,
  produceCatalogById,
  type StoreProduceUnit,
} from '@/config/storeProduceCatalog';
import { STORE_PRODUCE_LIVE_DEMO, type StoreProduceLivePackId } from '@/config/storeProduceLive';
import { DEFAULT_STORE_SHOP_HOURS, type StoreShopHoursState } from '@/config/storeShopHours';
import { DEFAULT_SHOP_PICKUP, parseShopPickupPlace, type ShopPickupPlace } from '@/lib/storeShopPlace';
import { compressImageFile } from '@/lib/storeWeddingLiveLab';

export { parseProduceListText, compressImageFile, STORE_PRODUCE_UNIT_AR };

export type ProduceShelfItem = {
  catalogId: string;
  nameAr: string;
  category: string;
  unit: StoreProduceUnit;
  price: number;
  inStock: boolean;
  arrivedToday: boolean;
  featured: boolean;
};

export type ProduceOrderLine = {
  catalogId: string;
  nameAr: string;
  qty: number;
  price: number;
};

export type ProducePayMethod = 'cash' | 'card';
export type ProduceService = 'delivery' | 'pickup';

export type ProduceOrder = {
  id: string;
  name: string;
  phone: string;
  place: string;
  service: ProduceService;
  pay: ProducePayMethod;
  lines: ProduceOrderLine[];
  total: number;
  at: string;
  seen: boolean;
};

export type ProduceHostState = {
  shopName: string;
  hostName: string;
  blurbAr: string;
  customFields: string[];
  flashAr: string;
  packId: StoreProduceLivePackId;
} & StoreShopHoursState & ShopPickupPlace;

export type ProduceChatMsg = {
  id: string;
  from: 'buyer' | 'desk';
  name: string;
  text: string;
  at: string;
  hidden?: boolean;
};

export type ProduceLabState = {
  host: ProduceHostState;
  shelf: ProduceShelfItem[];
  orders: ProduceOrder[];
  chatIncluded: boolean;
  chats: ProduceChatMsg[];
};

function storageKey(token: string): string {
  return `store-produce-live:v1:${token.trim() || 'produce-lab'}`;
}

const DEMO_IDS = [
  'veg-1',
  'veg-2',
  'fruit-1',
  'fruit-4',
  'fruit-8',
  'leaf-1',
  'root-1',
  'herb-1',
  'herb-2',
  'crate-1',
] as const;

export function defaultProduceLabState(): ProduceLabState {
  const shelf = DEMO_IDS.map((id, index) => {
    const item = produceCatalogById(id) || STORE_PRODUCE_CATALOG[index];
    return {
      catalogId: item.id,
      nameAr: item.nameAr,
      category: item.category,
      unit: item.unit,
      price: item.defaultPrice,
      inStock: true,
      arrivedToday: index < 5,
      featured: index < 6,
    };
  });
  return {
    host: {
      shopName: STORE_PRODUCE_LIVE_DEMO.shopName,
      hostName: STORE_PRODUCE_LIVE_DEMO.hostName,
      blurbAr: STORE_PRODUCE_LIVE_DEMO.blurbAr,
      customFields: [...STORE_PRODUCE_LIVE_DEMO.customFields],
      flashAr: STORE_PRODUCE_LIVE_DEMO.flashAr,
      packId: 'm6',
      ...DEFAULT_SHOP_PICKUP,
      ...DEFAULT_STORE_SHOP_HOURS,
    },
    shelf,
    orders: [],
    chatIncluded: true,
    chats: [],
  };
}

export function readProduceLabState(token: string): ProduceLabState {
  const fallback = defaultProduceLabState();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<ProduceLabState>;
    return {
      host: {
        ...fallback.host,
        ...(parsed.host || {}),
        customFields: Array.from({ length: 5 }, (_, i) => parsed.host?.customFields?.[i] || fallback.host.customFields[i] || ''),
        ...parseShopPickupPlace(parsed.host, fallback.host),
      },
      shelf: Array.isArray(parsed.shelf) && parsed.shelf.length ? parsed.shelf : fallback.shelf,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      chatIncluded: parsed.chatIncluded !== false,
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
    };
  } catch {
    return fallback;
  }
}

export function writeProduceLabState(token: string, state: ProduceLabState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(token), JSON.stringify(state));
  } catch {
    window.localStorage.setItem(storageKey(token), JSON.stringify({ ...state, orders: state.orders.slice(0, 20) }));
  }
}

export function produceCartTotal(lines: ProduceOrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty * line.price, 0);
}

export function activateProduceCatalogItem(
  state: ProduceLabState,
  catalogId: string,
  price?: number,
): ProduceLabState {
  const catalog = produceCatalogById(catalogId);
  if (!catalog) return state;
  const existing = state.shelf.find((item) => item.catalogId === catalogId);
  if (existing) {
    return {
      ...state,
      shelf: state.shelf.map((item) =>
        item.catalogId === catalogId
          ? { ...item, inStock: true, arrivedToday: true, price: price ?? item.price }
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
        unit: catalog.unit,
        price: price ?? catalog.defaultPrice,
        inStock: true,
        arrivedToday: true,
        featured: featuredCount < 8,
      },
    ],
  };
}

export function produceWhatsAppText(order: ProduceOrder, shopName: string, mapsUrl = ''): string {
  const pay = order.pay === 'card' ? 'شبكة عند التسليم' : 'نقداً عند التسليم';
  const service = order.service === 'pickup' ? 'استلام من الصندوق' : 'توصيل في الحي';
  const lines = order.lines.map((line) => `${line.nameAr} × ${line.qty} = ${line.price * line.qty} ر.س`).join('\n');
  return [
    `مذكرة صندوق — ${shopName}`,
    `الزبون: ${order.name}`,
    `الجوال: ${order.phone}`,
    `التسليم: ${service}`,
    `الموقع: ${order.place}`,
    mapsUrl ? `موقع الصندوق: ${mapsUrl}` : '',
    `الدفع: ${pay}`,
    lines,
    `الإجمالي: ${order.total} ر.س`,
  ].filter(Boolean).join('\n');
}

export function produceArchiveJson(state: ProduceLabState): string {
  return JSON.stringify(
    {
      product: 'خضارنا1',
      brand: 'halaqmap',
      shopName: state.host.shopName,
      orders: state.orders,
    },
    null,
    2,
  );
}

const BUYER_KEY = 'store-produce-buyer:v1';

export type ProduceSavedBuyer = {
  name: string;
  phone: string;
  place: string;
};

export function readSavedProduceBuyer(): ProduceSavedBuyer | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BUYER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProduceSavedBuyer>;
    if (!parsed.name || !parsed.phone) return null;
    return { name: parsed.name, phone: parsed.phone, place: parsed.place || '' };
  } catch {
    return null;
  }
}

export function writeSavedProduceBuyer(buyer: ProduceSavedBuyer | null): void {
  if (typeof window === 'undefined') return;
  if (!buyer) {
    window.localStorage.removeItem(BUYER_KEY);
    return;
  }
  window.localStorage.setItem(BUYER_KEY, JSON.stringify(buyer));
}

export function playProduceBeep(): void {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 760;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  window.setTimeout(() => {
    osc.stop();
    void ctx.close();
  }, 180);
}
