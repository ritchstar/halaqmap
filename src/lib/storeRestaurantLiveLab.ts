/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حالة معاينة مطعم الحي — محلية بلا خلط بمنتجات أخرى.
 */
import { STORE_RESTAURANT_MENU, restaurantMenuById, parseRestaurantListText } from '@/config/storeRestaurantMenu';
import { STORE_RESTAURANT_LIVE_DEMO, type StoreRestaurantLivePackId } from '@/config/storeRestaurantLive';
import { DEFAULT_STORE_SHOP_HOURS, type StoreShopHoursState } from '@/config/storeShopHours';
import { DEFAULT_SHOP_PICKUP, parseShopPickupPlace, type ShopPickupPlace } from '@/lib/storeShopPlace';
import { hydrateDeskTickets } from '@/lib/storeDeskOrderTicket';
import { compressImageFile } from '@/lib/storeWeddingLiveLab';

export { parseRestaurantListText, compressImageFile };

export type RestaurantShelfItem = {
  catalogId: string;
  nameAr: string;
  category: string;
  price: number;
  inStock: boolean;
  featured: boolean;
  photoSrc: string;
};

export type RestaurantOrderLine = {
  catalogId: string;
  nameAr: string;
  qty: number;
  price: number;
};

export type RestaurantPayMethod = 'cash' | 'card';
export type RestaurantService = 'delivery' | 'pickup';

export type RestaurantOrder = {
  id: string;
  ticketNo: number;
  name: string;
  phone: string;
  place: string;
  note: string;
  service: RestaurantService;
  pay: RestaurantPayMethod;
  lines: RestaurantOrderLine[];
  total: number;
  at: string;
  seen: boolean;
  phase?: 'new' | 'received' | 'done';
  receivedAt?: string;
  doneAt?: string;
};

export type RestaurantHostState = {
  shopName: string;
  logoSrc: string;
  hostName: string;
  blurbAr: string;
  customFields: string[];
  flashAr: string;
  packId: StoreRestaurantLivePackId;
  nextTicket: number;
} & StoreShopHoursState & ShopPickupPlace;

export type RestaurantChatMsg = {
  id: string;
  from: 'buyer' | 'desk';
  name: string;
  text: string;
  at: string;
  hidden?: boolean;
};

export type RestaurantLabState = {
  host: RestaurantHostState;
  shelf: RestaurantShelfItem[];
  orders: RestaurantOrder[];
  orderArchive: RestaurantOrder[];
  chats: RestaurantChatMsg[];
};

function storageKey(token: string): string {
  return `store-restaurant-live:v1:${token.trim() || 'restaurant-lab'}`;
}

const DEMO_IDS = [
  'rice-kabsa',
  'rice-mandi',
  'grill-mix',
  'wrap-shawarma',
  'break-foul',
  'side-salad',
  'drink-laban',
  'drink-qahwa',
  'sweet-luqaimat',
  'today-board',
  'grill-tikka',
  'wrap-mutabbaq',
] as const;

export function defaultRestaurantLabState(): RestaurantLabState {
  const shelf = DEMO_IDS.map((id, index) => {
    const item = restaurantMenuById(id) || STORE_RESTAURANT_MENU[index];
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
      shopName: STORE_RESTAURANT_LIVE_DEMO.shopName,
      logoSrc: '',
      hostName: STORE_RESTAURANT_LIVE_DEMO.hostName,
      blurbAr: STORE_RESTAURANT_LIVE_DEMO.blurbAr,
      customFields: [...STORE_RESTAURANT_LIVE_DEMO.customFields],
      flashAr: STORE_RESTAURANT_LIVE_DEMO.flashAr,
      packId: 'm6',
      nextTicket: 1,
      ...DEFAULT_SHOP_PICKUP,
      ...DEFAULT_STORE_SHOP_HOURS,
    },
    shelf,
    orders: [],
    orderArchive: [],
    chats: [],
  };
}

export function readRestaurantLabState(token: string): RestaurantLabState {
  const fallback = defaultRestaurantLabState();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<RestaurantLabState>;
    return {
      host: {
        ...fallback.host,
        ...(parsed.host || {}),
        customFields: Array.from({ length: 5 }, (_, i) => parsed.host?.customFields?.[i] || fallback.host.customFields[i] || ''),
        nextTicket: Number(parsed.host?.nextTicket) > 0 ? Number(parsed.host?.nextTicket) : 1,
        ...parseShopPickupPlace(parsed.host, fallback.host),
      },
      shelf: Array.isArray(parsed.shelf) && parsed.shelf.length
        ? parsed.shelf.map((item) => ({ ...item, photoSrc: item.photoSrc || '' }))
        : fallback.shelf,
      ...hydrateDeskTickets<RestaurantOrder>(parsed.orders, parsed.orderArchive),
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
    };
  } catch {
    return fallback;
  }
}

export function writeRestaurantLabState(token: string, state: RestaurantLabState): void {
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
    };
    window.localStorage.setItem(storageKey(token), JSON.stringify(slim));
  }
}

export function restaurantCartTotal(lines: RestaurantOrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty * line.price, 0);
}

export function activateRestaurantDish(
  state: RestaurantLabState,
  catalogId: string,
  price?: number,
): RestaurantLabState {
  const catalog = restaurantMenuById(catalogId);
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

export function restaurantWhatsAppText(order: RestaurantOrder, shopName: string, mapsUrl = ''): string {
  const pay = order.pay === 'card' ? 'شبكة عند التسليم' : 'نقداً عند الاستلام';
  const service = order.service === 'pickup' ? 'استلام من المطعم' : 'توصيل للبيت';
  const lines = order.lines.map((line) => `${line.nameAr} × ${line.qty} = ${line.price * line.qty} ر.س`).join('\n');
  return [
    `تذكرة مطبخ ${order.ticketNo} — ${shopName}`,
    `الضيف: ${order.name}`,
    `الجوال: ${order.phone}`,
    `الخدمة: ${service}`,
    `الموقع: ${order.place || '—'}`,
    mapsUrl ? `موقع العربة: ${mapsUrl}` : '',
    order.note ? `ملاحظة: ${order.note}` : '',
    `الدفع: ${pay}`,
    lines,
    `الإجمالي: ${order.total} ر.س`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function restaurantArchiveJson(state: RestaurantLabState): string {
  return JSON.stringify(
    {
      product: 'مطعمنا1',
      brand: 'halaqmap',
      shopName: state.host.shopName,
      orders: state.orders,
      orderArchive: state.orderArchive,
    },
    null,
    2,
  );
}

const BUYER_KEY = 'store-restaurant-buyer:v1';

export type RestaurantSavedBuyer = {
  name: string;
  phone: string;
  place: string;
};

export function readSavedRestaurantBuyer(): RestaurantSavedBuyer | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BUYER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RestaurantSavedBuyer>;
    if (!parsed.name || !parsed.phone) return null;
    return { name: parsed.name, phone: parsed.phone, place: parsed.place || '' };
  } catch {
    return null;
  }
}

export function writeSavedRestaurantBuyer(buyer: RestaurantSavedBuyer | null): void {
  if (typeof window === 'undefined') return;
  if (!buyer) {
    window.localStorage.removeItem(BUYER_KEY);
    return;
  }
  window.localStorage.setItem(BUYER_KEY, JSON.stringify(buyer));
}

export function playRestaurantBeep(): void {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 660;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  window.setTimeout(() => {
    osc.stop();
    void ctx.close();
  }, 180);
}
