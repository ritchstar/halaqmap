/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حالة معاينة بخورنا1 — محلية بلا خلط بمنتجات أخرى.
 * بنية تحتية أولية: التخزين هنا محلي (localStorage) فقط، بلا مزامنة خادم بعد.
 */
import {
  STORE_BAKHURNA_CATALOG,
  STORE_BAKHURNA_UNIT_AR,
  parseBakhurnaListText,
  bakhurnaCatalogById,
  type StoreBakhurnaUnit,
} from '@/config/storeBakhurnaCatalog';
import { STORE_BAKHURNA_LIVE_DEMO, type StoreBakhurnaLivePackId } from '@/config/storeBakhurnaLive';
import { DEFAULT_STORE_SHOP_HOURS, type StoreShopHoursState } from '@/config/storeShopHours';
import { hydrateDeskTickets } from '@/lib/storeDeskOrderTicket';
import { parseShopLogoSrc } from '@/lib/storeShopLogo';
import { DEFAULT_SHOP_PICKUP, parseShopPickupPlace, type ShopPickupPlace } from '@/lib/storeShopPlace';
import { compressImageFile } from '@/lib/storeWeddingLiveLab';

export { parseBakhurnaListText, compressImageFile, STORE_BAKHURNA_UNIT_AR };

export type BakhurnaShelfItem = {
  catalogId: string;
  nameAr: string;
  category: string;
  unit: StoreBakhurnaUnit;
  price: number;
  inStock: boolean;
  arrivedToday: boolean;
  featured: boolean;
  photoSrc?: string;
};

export type BakhurnaOrderLine = {
  catalogId: string;
  nameAr: string;
  qty: number;
  price: number;
};

export type BakhurnaPayMethod = 'cash' | 'card';
export type BakhurnaService = 'delivery' | 'pickup' | 'come';

export type BakhurnaOrder = {
  id: string;
  name: string;
  phone: string;
  place: string;
  service: BakhurnaService;
  pay: BakhurnaPayMethod;
  lines: BakhurnaOrderLine[];
  total: number;
  at: string;
  seen: boolean;
  buyerLat?: number;
  buyerLng?: number;
  phase?: 'new' | 'received' | 'done';
  receivedAt?: string;
  doneAt?: string;
};

export type BakhurnaHostState = {
  shopName: string;
  logoSrc: string;
  hostName: string;
  blurbAr: string;
  customFields: string[];
  flashAr: string;
  acceptingOrders: boolean;
  packId: StoreBakhurnaLivePackId;
  shopHeaderBg: string;
  shopPageBg: string;
} & StoreShopHoursState & ShopPickupPlace;

export type BakhurnaChatMsg = {
  id: string;
  from: 'buyer' | 'desk';
  name: string;
  text: string;
  at: string;
  hidden?: boolean;
};

export type BakhurnaLabState = {
  host: BakhurnaHostState;
  shelf: BakhurnaShelfItem[];
  orders: BakhurnaOrder[];
  orderArchive: BakhurnaOrder[];
  chatIncluded: boolean;
  chats: BakhurnaChatMsg[];
};

function storageKey(token: string): string {
  return `store-bakhurna-live:v1:${token.trim() || 'bakhurna-lab'}`;
}

const DEMO_IDS = [
  'classic-1',
  'classic-3',
  'premium-1',
  'oud-1',
  'oud-2',
  'attar-1',
  'gift-1',
  'gift-2',
  'bulk-1',
  'classic-6',
] as const;

export function defaultBakhurnaLabState(): BakhurnaLabState {
  const shelf = DEMO_IDS.map((id, index) => {
    const item = bakhurnaCatalogById(id) || STORE_BAKHURNA_CATALOG[index];
    const galleryN = String(index + 1).padStart(2, '0');
    return {
      catalogId: item.id,
      nameAr: item.nameAr,
      category: item.category,
      unit: item.unit,
      price: item.defaultPrice,
      inStock: true,
      arrivedToday: index < 4,
      featured: index === 4 || index === 5,
      photoSrc: `/images/store/bakhurna/gallery/${galleryN}.jpg`,
    };
  });
  return {
    host: {
      shopName: STORE_BAKHURNA_LIVE_DEMO.shopName,
      logoSrc: '',
      hostName: STORE_BAKHURNA_LIVE_DEMO.hostName,
      blurbAr: STORE_BAKHURNA_LIVE_DEMO.blurbAr,
      customFields: [...STORE_BAKHURNA_LIVE_DEMO.customFields],
      flashAr: STORE_BAKHURNA_LIVE_DEMO.flashAr,
      acceptingOrders: true,
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

export function readBakhurnaLabState(token: string): BakhurnaLabState {
  const fallback = defaultBakhurnaLabState();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<BakhurnaLabState>;
    return {
      host: {
        ...fallback.host,
        ...(parsed.host || {}),
        customFields: Array.from({ length: 5 }, (_, i) => parsed.host?.customFields?.[i] || fallback.host.customFields[i] || ''),
        logoSrc: parseShopLogoSrc(parsed.host?.logoSrc, fallback.host.logoSrc),
        acceptingOrders: parsed.host?.acceptingOrders !== false,
        ...parseShopPickupPlace(parsed.host, fallback.host),
      },
      shelf: Array.isArray(parsed.shelf) && parsed.shelf.length
        ? parsed.shelf.map((item) => ({ ...item, photoSrc: item.photoSrc || '' }))
        : fallback.shelf,
      ...hydrateDeskTickets<BakhurnaOrder>(parsed.orders, parsed.orderArchive),
      chatIncluded: parsed.chatIncluded !== false,
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
    };
  } catch {
    return fallback;
  }
}

export function writeBakhurnaLabState(token: string, state: BakhurnaLabState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(token), JSON.stringify(state));
  } catch {
    window.localStorage.setItem(storageKey(token), JSON.stringify({ ...state, orders: state.orders.slice(0, 20) }));
  }
}

export function bakhurnaCartTotal(lines: BakhurnaOrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty * line.price, 0);
}

export function activateBakhurnaCatalogItem(
  state: BakhurnaLabState,
  catalogId: string,
  price?: number,
): BakhurnaLabState {
  const catalog = bakhurnaCatalogById(catalogId);
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
        photoSrc: '',
      },
    ],
  };
}

export function bakhurnaServiceLabelAr(service: BakhurnaService): string {
  if (service === 'come') return 'تعال إلى الموقع';
  if (service === 'pickup') return 'استلام من الموقع';
  return 'توصيل داخل النطاق';
}

export function bakhurnaWhatsAppText(order: BakhurnaOrder, shopName: string, mapsUrl = ''): string {
  const pay = order.pay === 'card' ? 'شبكة عند الاستلام' : 'نقداً عند الاستلام';
  const lines = order.lines.map((line) => `${line.nameAr} × ${line.qty} = ${line.price * line.qty} ر.س`).join('\n');
  return [
    `ملخص الطلب — ${shopName}`,
    `الزبون: ${order.name}`,
    `الجوال: ${order.phone}`,
    `التسليم: ${bakhurnaServiceLabelAr(order.service)}`,
    `الموقع: ${order.place}`,
    mapsUrl ? `موقع المحل: ${mapsUrl}` : '',
    `الدفع: ${pay}`,
    lines,
    order.service === 'come' && !lines ? 'تسوق حر من المحل' : '',
    `الإجمالي: ${order.total} ر.س`,
  ].filter(Boolean).join('\n');
}

export function bakhurnaArchiveJson(state: BakhurnaLabState): string {
  return JSON.stringify(
    {
      product: 'بخورنا1',
      brand: 'halaqmap',
      shopName: state.host.shopName,
      orders: state.orders,
    },
    null,
    2,
  );
}

const BUYER_KEY = 'store-bakhurna-buyer:v1';

export type BakhurnaSavedBuyer = {
  name: string;
  phone: string;
  place: string;
};

export function readSavedBakhurnaBuyer(): BakhurnaSavedBuyer | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BUYER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BakhurnaSavedBuyer>;
    if (!parsed.name || !parsed.phone) return null;
    return { name: parsed.name, phone: parsed.phone, place: parsed.place || '' };
  } catch {
    return null;
  }
}

export function writeSavedBakhurnaBuyer(buyer: BakhurnaSavedBuyer | null): void {
  if (typeof window === 'undefined') return;
  if (!buyer) {
    window.localStorage.removeItem(BUYER_KEY);
    return;
  }
  window.localStorage.setItem(BUYER_KEY, JSON.stringify(buyer));
}

export function playBakhurnaBeep(): void {
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
