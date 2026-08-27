/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قراءة قيد مبيعات المتجر للإدارة. بلا رموز سرية في الاستجابة.
 */
export const STORE_SALES_LEDGER_PRODUCTS = [
  'wedding',
  'wedding-women',
  'event',
  'grocers',
  'restaurant',
  'cafe',
  'lounge',
] as const;

export type StoreSalesLedgerProduct = (typeof STORE_SALES_LEDGER_PRODUCTS)[number];

const TITLES: Record<StoreSalesLedgerProduct, string> = {
  wedding: 'افراحي1 رجالي',
  'wedding-women': 'افراحي1 نسائي',
  event: 'اجواء1',
  grocers: 'تمويناتا1',
  restaurant: 'مطعمنا1',
  cafe: 'كافينا1',
  lounge: 'لاونجا1',
};

export const STORE_SALES_TABLE: Record<
  StoreSalesLedgerProduct,
  | 'store_wedding_live_orders'
  | 'store_event_live_orders'
  | 'store_grocers_live_orders'
  | 'store_restaurant_live_orders'
  | 'store_cafe_live_orders'
  | 'store_lounge_live_orders'
> = {
  wedding: 'store_wedding_live_orders',
  'wedding-women': 'store_wedding_live_orders',
  event: 'store_event_live_orders',
  grocers: 'store_grocers_live_orders',
  restaurant: 'store_restaurant_live_orders',
  cafe: 'store_cafe_live_orders',
  lounge: 'store_lounge_live_orders',
};

export type StoreSalesLedgerRow = {
  id: string;
  product: StoreSalesLedgerProduct;
  titleAr: string;
  buyerName: string;
  buyerEmail: string;
  subjectAr: string;
  packAr: string;
  voice: string;
  amountSar: number;
  status: string;
  paymentId: string;
  createdAt: string;
};

export function isStoreSalesLedgerProduct(raw: string): raw is StoreSalesLedgerProduct {
  return (STORE_SALES_LEDGER_PRODUCTS as readonly string[]).includes(raw);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function clip(value: unknown, max = 120): string {
  return String(value ?? '').trim().slice(0, max);
}

function voiceOf(payload: Record<string, unknown>): string {
  const voice = clip(payload.voice, 12);
  if (voice === 'women') return 'women';
  if (voice === 'men') return 'men';
  return '';
}

function grocersPackAr(payload: Record<string, unknown>, amountSar: number): string {
  const pack = clip(payload.packId, 8) === 'm12' || amountSar >= 899 ? 'اثنا عشر شهراً' : 'ستة أشهر';
  const chat = payload.chatAddon === true || amountSar === 898 || amountSar === 1398;
  return chat ? `${pack} + صندوق محادثة` : pack;
}

function shopTermPackAr(payload: Record<string, unknown>, amountSar: number, twelveSar: number): string {
  return clip(payload.packId, 8) === 'm12' || amountSar >= twelveSar ? 'اثنا عشر شهراً' : 'ستة أشهر';
}

export function mapStoreSalesRow(
  product: StoreSalesLedgerProduct,
  row: Record<string, unknown>,
): StoreSalesLedgerRow | null {
  const payload = asRecord(row.payload);
  const voice = voiceOf(payload);
  if (product === 'wedding' && voice === 'women') return null;
  if (product === 'wedding-women' && voice !== 'women') return null;
  const amountSar = Math.round((Number(row.price_halalas) || 0) / 100);
  let subjectAr = '—';
  let packAr = '';
  if (product === 'wedding' || product === 'wedding-women') {
    const host = clip(payload.hostName, 80);
    const groom = clip(payload.groomName, 80);
    const bride = clip(payload.brideName, 80);
    subjectAr = [host, groom && bride ? `${groom} و${bride}` : ''].filter(Boolean).join(' · ') || '—';
    packAr = 'مرة واحدة';
  } else if (product === 'event') {
    subjectAr = clip(payload.occasionTitle, 80) || clip(payload.hostName, 80) || '—';
    packAr = 'مرة واحدة';
  } else if (product === 'grocers') {
    subjectAr = clip(payload.shopName, 80) || '—';
    packAr = grocersPackAr(payload, amountSar);
  } else if (product === 'restaurant') {
    subjectAr = clip(payload.shopName, 80) || '—';
    packAr = shopTermPackAr(payload, amountSar, 999);
  } else if (product === 'cafe') {
    subjectAr = clip(payload.shopName, 80) || '—';
    packAr = shopTermPackAr(payload, amountSar, 2099);
  } else {
    subjectAr = clip(payload.loungeName, 80) || '—';
    packAr = 'ثلاثة أشهر';
  }
  return {
    id: clip(row.id, 80),
    product,
    titleAr: TITLES[product],
    buyerName: clip(row.buyer_name, 80) || '—',
    buyerEmail: clip(row.buyer_email, 180).toLowerCase(),
    subjectAr,
    packAr,
    voice,
    amountSar,
    status: clip(row.status, 32),
    paymentId: clip(row.moyasar_payment_id, 80),
    createdAt: clip(row.created_at, 40),
  };
}

export function summarizeStoreSales(product: StoreSalesLedgerProduct, rows: StoreSalesLedgerRow[]) {
  const paid = rows.filter((item) => item.status === 'live' || Boolean(item.paymentId));
  return {
    id: product,
    titleAr: TITLES[product],
    liveCount: rows.filter((item) => item.status === 'live').length,
    paidCount: paid.length,
    totalSar: paid.reduce((sum, item) => sum + item.amountSar, 0),
  };
}
