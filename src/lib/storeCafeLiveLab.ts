/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حالة معاينة مقهى الحي — محلية بلا خلط بمنتجات أخرى.
 */
import { STORE_CAFE_MENU, cafeMenuById, parseCafeListText } from '@/config/storeCafeMenu';
import {
  STORE_CAFE_LIVE_DEMO,
  cafeLiveEventById,
  type StoreCafeLiveEventId,
  type StoreCafeLivePackId,
} from '@/config/storeCafeLive';
import { DEFAULT_STORE_SHOP_HOURS, type StoreShopHoursState } from '@/config/storeShopHours';
import { compressImageFile, youtubeEmbedSrc } from '@/lib/storeWeddingLiveLab';

export { parseCafeListText, compressImageFile, youtubeEmbedSrc };

export type CafeShelfItem = {
  catalogId: string;
  nameAr: string;
  category: string;
  price: number;
  inStock: boolean;
  featured: boolean;
  photoSrc: string;
};

export type CafeOrderLine = {
  catalogId: string;
  nameAr: string;
  qty: number;
  price: number;
};

export type CafePayMethod = 'cash' | 'card';
export type CafeService = 'delivery' | 'pickup';

export type CafeOrder = {
  id: string;
  ticketNo: number;
  name: string;
  phone: string;
  place: string;
  note: string;
  service: CafeService;
  pay: CafePayMethod;
  lines: CafeOrderLine[];
  total: number;
  at: string;
  seen: boolean;
};

export type CafeBlessing = {
  id: string;
  name: string;
  cannedId: string;
  cannedText: string;
  extra: string;
  hidden: boolean;
  pending?: boolean;
  at: string;
};

export type CafeHostState = {
  shopName: string;
  hostName: string;
  blurbAr: string;
  customFields: string[];
  flashAr: string;
  packId: StoreCafeLivePackId;
  nextTicket: number;
  welcomeAr: string;
  youtubeUrl: string;
  youtubeHidden: boolean;
  announcement: string;
  photoSrc: string;
  panoramaSrc: string;
  guestPaused: boolean;
  reviewBeforeShow: boolean;
  activeEventId: StoreCafeLiveEventId;
  customEventTitle: string;
} & StoreShopHoursState;

export type CafeChatMsg = {
  id: string;
  from: 'buyer' | 'desk';
  name: string;
  text: string;
  at: string;
  hidden?: boolean;
};

export type CafeLabState = {
  host: CafeHostState;
  shelf: CafeShelfItem[];
  orders: CafeOrder[];
  chats: CafeChatMsg[];
  blessings: CafeBlessing[];
};

function storageKey(token: string): string {
  return `store-cafe-live:v1:${token.trim() || 'cafe-lab'}`;
}

export function cafeLabRaw(token: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(storageKey(token)) || '';
  } catch {
    return '';
  }
}

const DEMO_IDS = [
  'hot-qahwa',
  'hot-latte',
  'hot-karak',
  'cold-iced',
  'cold-spanish',
  'fresh-orange',
  'sweet-kunafa',
  'side-croissant',
  'today-board',
  'hot-tea',
  'cold-matcha',
  'fresh-lemon',
] as const;

export function defaultCafeLabState(): CafeLabState {
  const shelf = DEMO_IDS.map((id, index) => {
    const item = cafeMenuById(id) || STORE_CAFE_MENU[index];
    return {
      catalogId: item.id,
      nameAr: item.nameAr,
      category: item.category,
      price: item.defaultPrice,
      inStock: true,
      featured: index < 8,
      photoSrc: '',
    };
  });
  return {
    host: {
      shopName: STORE_CAFE_LIVE_DEMO.shopName,
      hostName: STORE_CAFE_LIVE_DEMO.hostName,
      blurbAr: STORE_CAFE_LIVE_DEMO.blurbAr,
      customFields: [...STORE_CAFE_LIVE_DEMO.customFields],
      flashAr: STORE_CAFE_LIVE_DEMO.flashAr,
      packId: 'm6',
      nextTicket: 1,
      welcomeAr: STORE_CAFE_LIVE_DEMO.welcomeAr,
      youtubeUrl: STORE_CAFE_LIVE_DEMO.youtubeUrl,
      youtubeHidden: STORE_CAFE_LIVE_DEMO.youtubeHidden,
      announcement: STORE_CAFE_LIVE_DEMO.announcement,
      photoSrc: STORE_CAFE_LIVE_DEMO.photoSrc,
      panoramaSrc: STORE_CAFE_LIVE_DEMO.panoramaSrc,
      guestPaused: STORE_CAFE_LIVE_DEMO.guestPaused,
      reviewBeforeShow: STORE_CAFE_LIVE_DEMO.reviewBeforeShow,
      activeEventId: STORE_CAFE_LIVE_DEMO.activeEventId,
      customEventTitle: STORE_CAFE_LIVE_DEMO.customEventTitle,
      ...DEFAULT_STORE_SHOP_HOURS,
    },
    shelf,
    orders: [],
    chats: [],
    blessings: [],
  };
}

export function readCafeLabState(token: string): CafeLabState {
  const fallback = defaultCafeLabState();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<CafeLabState>;
    return {
      host: {
        ...fallback.host,
        ...(parsed.host || {}),
        customFields: Array.from({ length: 5 }, (_, i) => parsed.host?.customFields?.[i] || fallback.host.customFields[i] || ''),
        nextTicket: Number(parsed.host?.nextTicket) > 0 ? Number(parsed.host?.nextTicket) : 1,
        guestPaused: parsed.host?.guestPaused === true,
        reviewBeforeShow: parsed.host?.reviewBeforeShow === true,
        youtubeHidden: parsed.host?.youtubeHidden !== false,
      },
      shelf: Array.isArray(parsed.shelf) && parsed.shelf.length
        ? parsed.shelf.map((item) => ({ ...item, photoSrc: item.photoSrc || '' }))
        : fallback.shelf,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
      blessings: Array.isArray(parsed.blessings) ? parsed.blessings : [],
    };
  } catch {
    return fallback;
  }
}

export function writeCafeLabState(token: string, state: CafeLabState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(token), JSON.stringify(state));
  } catch {
    const slim = {
      ...state,
      shelf: state.shelf.map((item) => ({
        ...item,
        photoSrc: item.photoSrc.startsWith('data:') ? '' : item.photoSrc,
      })),
      host: {
        ...state.host,
        photoSrc: state.host.photoSrc.startsWith('data:') ? '' : state.host.photoSrc,
        panoramaSrc: state.host.panoramaSrc.startsWith('data:') ? '' : state.host.panoramaSrc,
      },
    };
    window.localStorage.setItem(storageKey(token), JSON.stringify(slim));
  }
}

export function cafeCartTotal(lines: CafeOrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty * line.price, 0);
}

export function activateCafeDrink(state: CafeLabState, catalogId: string, price?: number): CafeLabState {
  const catalog = cafeMenuById(catalogId);
  if (!catalog) return state;
  const existing = state.shelf.find((item) => item.catalogId === catalogId);
  if (existing) {
    return {
      ...state,
      shelf: state.shelf.map((item) =>
        item.catalogId === catalogId ? { ...item, inStock: true, price: price ?? item.price } : item,
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
        featured: featuredCount < 8,
        photoSrc: '',
      },
    ],
  };
}

export function cafeWhatsAppText(order: CafeOrder, shopName: string): string {
  const pay = order.pay === 'card' ? 'شبكة عند التسليم' : 'نقداً عند الاستلام';
  const service = order.service === 'pickup' ? 'استلام من المحل' : 'توصيل في الحي';
  const lines = order.lines.map((line) => `${line.nameAr} × ${line.qty} = ${line.price * line.qty} ر.س`).join('\n');
  return [
    `تذكرة كافينا1 ${order.ticketNo} — ${shopName}`,
    `جار الحي: ${order.name}`,
    `الجوال: ${order.phone}`,
    `الخدمة: ${service}`,
    `الموقع: ${order.place || '—'}`,
    order.note ? `ملاحظة: ${order.note}` : '',
    `الدفع: ${pay}`,
    lines,
    `الإجمالي: ${order.total} ر.س`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function cafeArchiveJson(state: CafeLabState): string {
  return JSON.stringify(
    {
      product: 'كافينا1',
      brand: 'halaqmap',
      shopName: state.host.shopName,
      orders: state.orders,
    },
    null,
    2,
  );
}

const BUYER_KEY = 'store-cafe-buyer:v1';

export type CafeSavedBuyer = {
  name: string;
  phone: string;
  place: string;
};

export function readSavedCafeBuyer(): CafeSavedBuyer | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BUYER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CafeSavedBuyer>;
    if (!parsed.name || !parsed.phone) return null;
    return { name: parsed.name, phone: parsed.phone, place: parsed.place || '' };
  } catch {
    return null;
  }
}

export function writeSavedCafeBuyer(buyer: CafeSavedBuyer | null): void {
  if (typeof window === 'undefined') return;
  if (!buyer) {
    window.localStorage.removeItem(BUYER_KEY);
    return;
  }
  window.localStorage.setItem(BUYER_KEY, JSON.stringify(buyer));
}

export function playCafeBeep(): void {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 520;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  window.setTimeout(() => {
    osc.stop();
    void ctx.close();
  }, 180);
}

export function cafeBlessingOnScreen(item: CafeBlessing): boolean {
  return item.hidden !== true && item.pending !== true;
}

const ABUSE_RE = /قحب|شرمو|نيك|كس ام|كسم /i;

export function cafeTextBlocked(raw: unknown): boolean {
  return ABUSE_RE.test(String(raw || ''));
}

export function cafeBlessingDuplicate(
  list: CafeBlessing[],
  input: { cannedText: string; extra: string },
  withinMs = 45_000,
  now = Date.now(),
): boolean {
  const text = `${input.cannedText}|${input.extra}`.replace(/\s+/g, ' ').trim();
  return list.some((item) => {
    const other = `${item.cannedText}|${item.extra}`.replace(/\s+/g, ' ').trim();
    const at = Date.parse(item.at);
    return other === text && Number.isFinite(at) && now - at < withinMs;
  });
}

export function applyCafeEvent(host: CafeHostState, id: StoreCafeLiveEventId): CafeHostState {
  const event = cafeLiveEventById(id);
  return {
    ...host,
    activeEventId: event.id,
    welcomeAr: event.id === 'custom' && host.customEventTitle.trim()
      ? host.welcomeAr
      : event.welcomeAr,
  };
}

export function cafeScreenTitle(host: CafeHostState): string {
  if (host.activeEventId === 'custom' && host.customEventTitle.trim()) return host.customEventTitle.trim();
  return cafeLiveEventById(host.activeEventId).titleAr;
}
