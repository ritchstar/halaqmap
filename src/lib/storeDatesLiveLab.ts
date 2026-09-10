/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حالة معاينة تمرتنا1 — محلية بلا خلط بخضارنا1 أو تمويناتا1.
 */
import {
  STORE_DATES_CATALOG,
  STORE_DATES_UNIT_AR,
  parseDatesListText,
  datesCatalogById,
  type StoreDatesUnit,
} from '@/config/storeDatesCatalog';
import { STORE_DATES_LIVE_DEMO, type StoreDatesLivePackId } from '@/config/storeDatesLive';
import { DEFAULT_STORE_SHOP_HOURS, type StoreShopHoursState } from '@/config/storeShopHours';
import { hydrateDeskTickets } from '@/lib/storeDeskOrderTicket';
import { parseShopLogoSrc } from '@/lib/storeShopLogo';
import { DEFAULT_SHOP_PICKUP, parseShopPickupPlace, type ShopPickupPlace } from '@/lib/storeShopPlace';
import { compressImageFile } from '@/lib/storeWeddingLiveLab';

export { parseDatesListText, compressImageFile, STORE_DATES_UNIT_AR };

export type DatesShelfItem = {
  catalogId: string;
  nameAr: string;
  category: string;
  unit: StoreDatesUnit;
  price: number;
  inStock: boolean;
  arrivedToday: boolean;
  featured: boolean;
};

export type DatesOrderLine = {
  catalogId: string;
  nameAr: string;
  qty: number;
  price: number;
};

export type DatesPayMethod = 'cash' | 'card';
export type DatesService = 'delivery' | 'pickup' | 'come';

export type DatesOrder = {
  id: string;
  name: string;
  phone: string;
  place: string;
  service: DatesService;
  pay: DatesPayMethod;
  lines: DatesOrderLine[];
  total: number;
  at: string;
  seen: boolean;
  buyerLat?: number;
  buyerLng?: number;
  phase?: 'new' | 'received' | 'done';
  receivedAt?: string;
  doneAt?: string;
};

export type DatesHostState = {
  shopName: string;
  logoSrc: string;
  hostName: string;
  blurbAr: string;
  customFields: string[];
  flashAr: string;
  packId: StoreDatesLivePackId;
  shopHeaderBg: string;
  shopPageBg: string;
} & StoreShopHoursState & ShopPickupPlace;

export type DatesChatMsg = {
  id: string;
  from: 'buyer' | 'desk';
  name: string;
  text: string;
  at: string;
  hidden?: boolean;
};

export type DatesLabState = {
  host: DatesHostState;
  shelf: DatesShelfItem[];
  orders: DatesOrder[];
  orderArchive: DatesOrder[];
  chatIncluded: boolean;
  chats: DatesChatMsg[];
};

function storageKey(token: string): string {
  return `store-dates-live:v1:${token.trim() || 'dates-lab'}`;
}

const DEMO_IDS = [
  'classic-1',
  'classic-3',
  'premium-1',
  'stuffed-1',
  'stuffed-3',
  'byp-1',
  'gift-1',
  'gift-2',
  'bulk-1',
  'classic-6',
] as const;

export function defaultDatesLabState(): DatesLabState {
  const shelf = DEMO_IDS.map((id, index) => {
    const item = datesCatalogById(id) || STORE_DATES_CATALOG[index];
    return {
      catalogId: item.id,
      nameAr: item.nameAr,
      category: item.category,
      unit: item.unit,
      price: item.defaultPrice,
      inStock: true,
      arrivedToday: index < 4,
      featured: index === 4 || index === 5,
    };
  });
  return {
    host: {
      shopName: STORE_DATES_LIVE_DEMO.shopName,
      logoSrc: '',
      hostName: STORE_DATES_LIVE_DEMO.hostName,
      blurbAr: STORE_DATES_LIVE_DEMO.blurbAr,
      customFields: [...STORE_DATES_LIVE_DEMO.customFields],
      flashAr: STORE_DATES_LIVE_DEMO.flashAr,
      packId: 'm6',
      shopHeaderBg: '',
      shopPageBg: '',
      ...DEFAULT_SHOP_PICKUP,
      ...DEFAULT_STORE_SHOP_HOURS,
    },
    shelf,
    orders: [],
    orderArchive: [],
    chatIncluded: true,
    chats: [],
  };
}

export function readDatesLabState(token: string): DatesLabState {
  const fallback = defaultDatesLabState();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<DatesLabState>;
    return {
      host: {
        ...fallback.host,
        ...(parsed.host || {}),
        customFields: Array.from({ length: 5 }, (_, i) => parsed.host?.customFields?.[i] || fallback.host.customFields[i] || ''),
        logoSrc: parseShopLogoSrc(parsed.host?.logoSrc, fallback.host.logoSrc),
        ...parseShopPickupPlace(parsed.host, fallback.host),
      },
      shelf: Array.isArray(parsed.shelf) && parsed.shelf.length ? parsed.shelf : fallback.shelf,
      ...hydrateDeskTickets<DatesOrder>(parsed.orders, parsed.orderArchive),
      chatIncluded: parsed.chatIncluded !== false,
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
    };
  } catch {
    return fallback;
  }
}

export function writeDatesLabState(token: string, state: DatesLabState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(token), JSON.stringify(state));
  } catch {
    window.localStorage.setItem(storageKey(token), JSON.stringify({ ...state, orders: state.orders.slice(0, 20) }));
  }
}

export function datesCartTotal(lines: DatesOrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty * line.price, 0);
}

export function activateDatesCatalogItem(
  state: DatesLabState,
  catalogId: string,
  price?: number,
): DatesLabState {
  const catalog = datesCatalogById(catalogId);
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

export function datesServiceLabelAr(service: DatesService): string {
  if (service === 'come') return 'تعال إلى الموقع';
  if (service === 'pickup') return 'استلام من الموقع';
  return 'توصيل داخل النطاق';
}

export function datesWhatsAppText(order: DatesOrder, shopName: string, mapsUrl = ''): string {
  const pay = order.pay === 'card' ? 'شبكة عند الاستلام' : 'نقداً عند الاستلام';
  const lines = order.lines.map((line) => `${line.nameAr} × ${line.qty} = ${line.price * line.qty} ر.س`).join('\n');
  return [
    `ملخص الطلب — ${shopName}`,
    `الزبون: ${order.name}`,
    `الجوال: ${order.phone}`,
    `التسليم: ${datesServiceLabelAr(order.service)}`,
    `الموقع: ${order.place}`,
    mapsUrl ? `موقع الصندوق: ${mapsUrl}` : '',
    `الدفع: ${pay}`,
    lines,
    order.service === 'come' && !lines ? 'تسوق حر من الصندوق' : '',
    `الإجمالي: ${order.total} ر.س`,
  ].filter(Boolean).join('\n');
}

export function datesArchiveJson(state: DatesLabState): string {
  return JSON.stringify(
    {
      product: 'تمرتنا1',
      brand: 'halaqmap',
      shopName: state.host.shopName,
      orders: state.orders,
    },
    null,
    2,
  );
}

const BUYER_KEY = 'store-dates-buyer:v1';

export type DatesSavedBuyer = {
  name: string;
  phone: string;
  place: string;
};

export function readSavedDatesBuyer(): DatesSavedBuyer | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BUYER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DatesSavedBuyer>;
    if (!parsed.name || !parsed.phone) return null;
    return { name: parsed.name, phone: parsed.phone, place: parsed.place || '' };
  } catch {
    return null;
  }
}

export function writeSavedDatesBuyer(buyer: DatesSavedBuyer | null): void {
  if (typeof window === 'undefined') return;
  if (!buyer) {
    window.localStorage.removeItem(BUYER_KEY);
    return;
  }
  window.localStorage.setItem(BUYER_KEY, JSON.stringify(buyer));
}

export function playDatesBeep(): void {
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
