/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حالة معاينة طبختنا1 — محلية بلا خلط بمنتجات أخرى.
 */
import { STORE_KITCHEN_MENU, kitchenDemoPhotoSrc, kitchenMenuById, parseKitchenListText } from '@/config/storeKitchenMenu';
import {
  STORE_KITCHEN_LIVE_DEMO,
  STORE_KITCHEN_LIVE_LAB_ITEM_CAP,
} from '@/config/storeKitchenLive';
import { DEFAULT_STORE_SHOP_HOURS, type StoreShopHoursState } from '@/config/storeShopHours';
import { compressImageFile } from '@/lib/storeWeddingLiveLab';

export { parseKitchenListText, compressImageFile };

export type KitchenShelfItem = {
  catalogId: string;
  nameAr: string;
  category: string;
  price: number;
  inStock: boolean;
  featured: boolean;
  photoSrc: string;
};

export type KitchenOrderLine = {
  catalogId: string;
  nameAr: string;
  qty: number;
  price: number;
};

export type KitchenPayMethod = 'cash' | 'card';
export type KitchenService = 'delivery' | 'pickup';

export type KitchenOrder = {
  id: string;
  ticketNo: number;
  idempotencyKey: string;
  name: string;
  phone: string;
  place: string;
  note: string;
  service: KitchenService;
  pay: KitchenPayMethod;
  lines: KitchenOrderLine[];
  deliveryFee: number;
  total: number;
  at: string;
  scheduledAt: string;
  deliveryPhotoSrc: string;
  seen: boolean;
};

export type KitchenHostState = {
  shopName: string;
  hostName: string;
  blurbAr: string;
  customFields: string[];
  flashAr: string;
  opsPhone: string;
  acceptingOrders: boolean;
  scheduleEnabled: boolean;
  deliveryFee: number;
  showSoldOut: boolean;
  qrStamp: string;
  qrActive: boolean;
  nextTicket: number;
} & StoreShopHoursState;

export type KitchenLabState = {
  host: KitchenHostState;
  shelf: KitchenShelfItem[];
  orders: KitchenOrder[];
};

function storageKey(token: string): string {
  return `store-kitchen-live:v1:${token.trim() || 'kitchen-lab'}`;
}

const DEMO_IDS = [
  'rice-home-kabsa',
  'rice-madghut',
  'pot-marqooq',
  'pot-salona',
  'roll-grape',
  'bake-samboosa',
  'sweet-luqaimat',
  'drink-laban',
  'drink-qahwa',
  'side-salad',
  'today-board',
  'pot-jareesh',
] as const;

export function newKitchenQrStamp(): string {
  return `k${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function newKitchenIdempotencyKey(): string {
  return `k-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function defaultKitchenLabState(): KitchenLabState {
  const shelf = DEMO_IDS.map((id, index) => {
    const item = kitchenMenuById(id) || STORE_KITCHEN_MENU[index];
    return {
      catalogId: item.id,
      nameAr: item.nameAr,
      category: item.category,
      price: item.defaultPrice,
      inStock: true,
      featured: index < 8,
      photoSrc: kitchenDemoPhotoSrc(item.id),
    };
  });
  return {
    host: {
      shopName: STORE_KITCHEN_LIVE_DEMO.shopName,
      hostName: STORE_KITCHEN_LIVE_DEMO.hostName,
      blurbAr: STORE_KITCHEN_LIVE_DEMO.blurbAr,
      customFields: [...STORE_KITCHEN_LIVE_DEMO.customFields],
      flashAr: STORE_KITCHEN_LIVE_DEMO.flashAr,
      opsPhone: '',
      acceptingOrders: true,
      scheduleEnabled: false,
      deliveryFee: 0,
      showSoldOut: false,
      qrStamp: newKitchenQrStamp(),
      qrActive: true,
      nextTicket: 1,
      ...DEFAULT_STORE_SHOP_HOURS,
    },
    shelf,
    orders: [],
  };
}

export function readKitchenLabState(token: string): KitchenLabState {
  const fallback = defaultKitchenLabState();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) {
      writeKitchenLabState(token, fallback);
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<KitchenLabState>;
    const qrStamp = String(parsed.host?.qrStamp || '').trim() || fallback.host.qrStamp;
    return {
      host: {
        ...fallback.host,
        ...(parsed.host || {}),
        customFields: Array.from({ length: 5 }, (_, i) => parsed.host?.customFields?.[i] || fallback.host.customFields[i] || ''),
        nextTicket: Number(parsed.host?.nextTicket) > 0 ? Number(parsed.host?.nextTicket) : 1,
        deliveryFee: Math.max(0, Number(parsed.host?.deliveryFee) || 0),
        acceptingOrders: parsed.host?.acceptingOrders !== false,
        scheduleEnabled: parsed.host?.scheduleEnabled === true,
        showSoldOut: parsed.host?.showSoldOut === true,
        qrActive: parsed.host?.qrActive !== false,
        qrStamp,
        opsPhone: String(parsed.host?.opsPhone || '').slice(0, 20),
      },
      shelf: Array.isArray(parsed.shelf) && parsed.shelf.length
        ? parsed.shelf.slice(0, STORE_KITCHEN_LIVE_LAB_ITEM_CAP).map((item) => ({
            ...item,
            photoSrc: item.photoSrc || kitchenDemoPhotoSrc(item.catalogId),
          }))
        : fallback.shelf,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    return fallback;
  }
}

export function writeKitchenLabState(token: string, state: KitchenLabState): void {
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
      orders: state.orders.map((order) => ({
        ...order,
        deliveryPhotoSrc: order.deliveryPhotoSrc.startsWith('data:') ? '' : order.deliveryPhotoSrc,
      })),
    };
    window.localStorage.setItem(storageKey(token), JSON.stringify(slim));
  }
}

export function kitchenCartTotal(lines: KitchenOrderLine[], service: KitchenService, deliveryFee: number): number {
  const items = lines.reduce((sum, line) => sum + line.qty * line.price, 0);
  const fee = service === 'delivery' ? Math.max(0, deliveryFee) : 0;
  return items + fee;
}

export function kitchenOrderExists(orders: KitchenOrder[], idempotencyKey: string): boolean {
  const key = String(idempotencyKey || '').trim();
  if (!key) return false;
  return orders.some((order) => order.idempotencyKey === key);
}

export function activateKitchenDish(
  state: KitchenLabState,
  catalogId: string,
  price?: number,
): KitchenLabState {
  const catalog = kitchenMenuById(catalogId);
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
  if (state.shelf.length >= STORE_KITCHEN_LIVE_LAB_ITEM_CAP) return state;
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
        photoSrc: kitchenDemoPhotoSrc(catalog.id),
      },
    ],
  };
}

export function appendKitchenCustomDish(
  state: KitchenLabState,
  nameAr: string,
  price: number,
): KitchenLabState {
  const safeName = nameAr.trim().slice(0, 40);
  if (!safeName) return state;
  if (state.shelf.length >= STORE_KITCHEN_LIVE_LAB_ITEM_CAP) return state;
  const catalogId = `custom-${safeName}`;
  if (state.shelf.some((item) => item.catalogId === catalogId || item.nameAr === safeName)) {
    return {
      ...state,
      shelf: state.shelf.map((item) =>
        item.catalogId === catalogId || item.nameAr === safeName
          ? { ...item, inStock: true, price: price || item.price }
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
        catalogId,
        nameAr: safeName,
        category: 'مخصص',
        price: price || 0,
        inStock: true,
        featured: featuredCount < 8,
        photoSrc: '',
      },
    ],
  };
}

export function addKitchenOrder(state: KitchenLabState, order: KitchenOrder): KitchenLabState {
  if (kitchenOrderExists(state.orders, order.idempotencyKey)) return state;
  return {
    ...state,
    host: { ...state.host, nextTicket: order.ticketNo + 1 },
    orders: [order, ...state.orders].slice(0, 200),
  };
}

export function kitchenShopHashPath(token: string, qrStamp: string): string {
  const path = `/k/${encodeURIComponent(token)}`;
  return qrStamp ? `${path}?qr=${encodeURIComponent(qrStamp)}` : path;
}

export function kitchenShopUrl(token: string, qrStamp: string): string {
  const hashPath = kitchenShopHashPath(token, qrStamp);
  if (typeof window === 'undefined') return `/#${hashPath}`;
  return `${window.location.origin}/#${hashPath}`;
}

export function kitchenQrMatches(host: KitchenHostState, qrParam: string): boolean {
  if (!host.qrActive) return false;
  const stamp = String(host.qrStamp || '').trim();
  if (!stamp) return true;
  return String(qrParam || '').trim() === stamp;
}

export function kitchenWhatsAppText(order: KitchenOrder, shopName: string): string {
  const pay = order.pay === 'card' ? 'شبكة عند التسليم' : 'نقداً عند التسليم';
  const service = order.service === 'pickup' ? 'استلام من النشاط' : 'توصيل';
  const lines = order.lines.map((line) => `${line.nameAr} × ${line.qty} = ${line.price * line.qty} ر.س`).join('\n');
  const fee = order.service === 'delivery' && order.deliveryFee > 0 ? `رسوم التوصيل: ${order.deliveryFee} ر.س` : '';
  return [
    `تذكرة ${order.ticketNo} — ${shopName}`,
    `الزبون: ${order.name}`,
    `الجوال: ${order.phone}`,
    `الخدمة: ${service}`,
    `الموقع: ${order.place || '—'}`,
    order.scheduledAt ? `الموعد: ${order.scheduledAt}` : '',
    order.note ? `ملاحظة: ${order.note}` : '',
    `الدفع: ${pay}`,
    lines,
    fee,
    `الإجمالي: ${order.total} ر.س`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function kitchenWhatsAppHref(order: KitchenOrder, shopName: string, opsPhone: string): string {
  const text = encodeURIComponent(kitchenWhatsAppText(order, shopName));
  const digits = opsPhone.replace(/\D/g, '');
  if (digits.length >= 9) {
    const intl = digits.startsWith('0') ? `966${digits.slice(1)}` : digits;
    return `https://wa.me/${intl}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

export function kitchenArchiveJson(state: KitchenLabState): string {
  return JSON.stringify(
    {
      product: 'طبختنا1',
      brand: 'halaqmap',
      shopName: state.host.shopName,
      orders: state.orders.map((order) => ({
        ...order,
        deliveryPhotoSrc: order.deliveryPhotoSrc.startsWith('data:') ? '' : order.deliveryPhotoSrc,
      })),
    },
    null,
    2,
  );
}

const BUYER_KEY = 'store-kitchen-buyer:v1';

export type KitchenSavedBuyer = {
  name: string;
  phone: string;
  place: string;
};

export function readSavedKitchenBuyer(): KitchenSavedBuyer | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BUYER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<KitchenSavedBuyer>;
    if (!parsed.name || !parsed.phone) return null;
    return { name: parsed.name, phone: parsed.phone, place: parsed.place || '' };
  } catch {
    return null;
  }
}

export function writeSavedKitchenBuyer(buyer: KitchenSavedBuyer | null): void {
  if (typeof window === 'undefined') return;
  if (!buyer) {
    window.localStorage.removeItem(BUYER_KEY);
    return;
  }
  window.localStorage.setItem(BUYER_KEY, JSON.stringify(buyer));
}

export function playKitchenBeep(): void {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 620;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  window.setTimeout(() => {
    osc.stop();
    void ctx.close();
  }, 180);
}
