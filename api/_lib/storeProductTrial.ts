/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إصدار نماذج تجريبية لمتجر خريطة الحل. الساعة من أول دخول. لا كاردي8.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { newEventToken } from './storeEventLive.js';
import { sendEventLiveLinksEmail } from './storeEventLiveMail.js';
import { newGrocersToken } from './storeGrocersLive.js';
import { sendGrocersLiveLinksEmail } from './storeGrocersLiveMail.js';
import { newLoungeToken } from './storeLoungeLive.js';
import { sendLoungeLiveLinksEmail } from './storeLoungeLiveMail.js';
import { newRestaurantToken } from './storeRestaurantLive.js';
import { sendRestaurantLiveLinksEmail } from './storeRestaurantLiveMail.js';
import { newCafeToken } from './storeCafeLive.js';
import { sendCafeLiveLinksEmail } from './storeCafeLiveMail.js';
import { newProduceToken } from './storeProduceLive.js';
import { sendProduceLiveLinksEmail } from './storeProduceLiveMail.js';
import {
  DEFAULT_KITCHEN_PICKUP,
  newKitchenQrStamp,
  newKitchenToken,
} from './storeKitchenLive.js';
import { DEFAULT_STORE_SHOP_HOURS } from './storeShopHours.js';
import { sendKitchenLiveLinksEmail } from './storeKitchenLiveMail.js';
import { newWeddingToken } from './storeWeddingLive.js';
import { sendWeddingLiveLinksEmail } from './storeWeddingLiveMail.js';

export const STORE_PRODUCT_TRIAL_TABLE = 'store_product_trials' as const;
export const STORE_PRODUCT_TRIAL_DAYS = 60 as const;
export const STORE_PRODUCT_TRIAL_QUOTA = 5 as const;
export const STORE_PRODUCE_TRIAL_DAYS = 180 as const;
export const STORE_KITCHEN_TRIAL_DAYS = 180 as const;

export type StoreProductTrialKey =
  | 'wedding'
  | 'event'
  | 'lounge'
  | 'grocers'
  | 'restaurant'
  | 'cafe'
  | 'kitchen'
  | 'produce';

export type StoreProductTrialRow = {
  id: string;
  product_key: StoreProductTrialKey;
  beneficiary_email: string;
  status: string;
  issuer_kind: string;
  marketer_id: string | null;
  issued_by_label: string;
  order_id: string | null;
  first_opened_at: string | null;
  trial_ends_at: string | null;
  review_note: string;
  reviewed_by: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

type Db = SupabaseClient;

const PRODUCT_TAG: Record<StoreProductTrialKey, string> = {
  wedding: 'store_wedding_live',
  event: 'store_event_live',
  lounge: 'store_lounge_live',
  grocers: 'store_grocers_live',
  restaurant: 'store_restaurant_live',
  cafe: 'store_cafe_live',
  kitchen: 'store_kitchen_live',
  produce: 'store_produce_live',
};

const ORDER_TABLE: Record<StoreProductTrialKey, string> = {
  wedding: 'store_wedding_live_orders',
  event: 'store_event_live_orders',
  lounge: 'store_lounge_live_orders',
  grocers: 'store_grocers_live_orders',
  restaurant: 'store_restaurant_live_orders',
  cafe: 'store_cafe_live_orders',
  kitchen: 'store_kitchen_live_orders',
  produce: 'store_produce_live_orders',
};

const GIFT_KEYS = new Set<StoreProductTrialKey>(['wedding', 'event']);

export function isStoreProductTrialKey(raw: unknown): raw is StoreProductTrialKey {
  return (
    raw === 'wedding' ||
    raw === 'event' ||
    raw === 'lounge' ||
    raw === 'grocers' ||
    raw === 'restaurant' ||
    raw === 'cafe' ||
    raw === 'kitchen' ||
    raw === 'produce'
  );
}

export function trialDaysFor(key: StoreProductTrialKey): number {
  return key === 'produce' || key === 'kitchen' ? STORE_PRODUCE_TRIAL_DAYS : STORE_PRODUCT_TRIAL_DAYS;
}

export function isGiftTrialProduct(key: StoreProductTrialKey): boolean {
  return GIFT_KEYS.has(key);
}

export function normalizeTrialEmail(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .slice(0, 180);
}

export function isTrialEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

export function trialEndsAtIso(fromMs = Date.now(), days: number = STORE_PRODUCT_TRIAL_DAYS): string {
  return new Date(fromMs + days * 24 * 60 * 60 * 1000).toISOString();
}

function storeOrigin(): string {
  return 'https://store.halaqmap.com';
}

function productLinks(key: StoreProductTrialKey, tokens: Record<string, string>): { a: string; b: string; c?: string } {
  if (key === 'cafe') {
    return {
      a: `${storeOrigin()}/#/c/${encodeURIComponent(tokens.shop)}`,
      b: `${storeOrigin()}/#/c/${encodeURIComponent(tokens.desk)}/desk`,
      c: `${storeOrigin()}/#/c/${encodeURIComponent(tokens.display)}`,
    };
  }
  if (key === 'grocers') {
    return {
      a: `${storeOrigin()}/#/g/${encodeURIComponent(tokens.shop)}`,
      b: `${storeOrigin()}/#/g/${encodeURIComponent(tokens.desk)}/desk`,
    };
  }
  if (key === 'restaurant') {
    return {
      a: `${storeOrigin()}/#/r/${encodeURIComponent(tokens.shop)}`,
      b: `${storeOrigin()}/#/r/${encodeURIComponent(tokens.desk)}/desk`,
    };
  }
  if (key === 'produce') {
    return {
      a: `${storeOrigin()}/#/v/${encodeURIComponent(tokens.shop)}`,
      b: `${storeOrigin()}/#/v/${encodeURIComponent(tokens.desk)}/desk`,
    };
  }
  if (key === 'kitchen') {
    return {
      a: `${storeOrigin()}/#/k/${encodeURIComponent(tokens.shop)}`,
      b: `${storeOrigin()}/#/k/${encodeURIComponent(tokens.desk)}/desk`,
    };
  }
  if (key === 'event') {
    return {
      a: `${storeOrigin()}/#/e/${encodeURIComponent(tokens.display)}`,
      b: `${storeOrigin()}/#/e/${encodeURIComponent(tokens.host)}/host`,
      c: `${storeOrigin()}/e/${encodeURIComponent(tokens.guest)}/guest`,
    };
  }
  if (key === 'lounge') {
    return {
      a: `${storeOrigin()}/#/l/${encodeURIComponent(tokens.display)}`,
      b: `${storeOrigin()}/#/l/${encodeURIComponent(tokens.host)}/host`,
      c: `${storeOrigin()}/l/${encodeURIComponent(tokens.guest)}/guest`,
    };
  }
  return {
    a: `${storeOrigin()}/#/w/${encodeURIComponent(tokens.display)}`,
    b: `${storeOrigin()}/#/w/${encodeURIComponent(tokens.host)}/host`,
    c: `${storeOrigin()}/w/${encodeURIComponent(tokens.guest)}/guest`,
  };
}

export function publicTrialHrefs(
  key: StoreProductTrialKey,
  tokens: Record<string, string>,
): { titleAr: string; href: string }[] {
  const links = productLinks(key, tokens);
  if (key === 'cafe') {
    return [
      { titleAr: 'جار الحي', href: links.a },
      { titleAr: 'الكاشير', href: links.b },
      { titleAr: 'الشاشة', href: links.c || '' },
    ];
  }
  if (key === 'grocers') {
    return [
      { titleAr: 'المتجر', href: links.a },
      { titleAr: 'الكاشير', href: links.b },
    ];
  }
  if (key === 'restaurant') {
    return [
      { titleAr: 'ضيف الحي', href: links.a },
      { titleAr: 'المطبخ', href: links.b },
    ];
  }
  if (key === 'produce') {
    return [
      { titleAr: 'جار الحي', href: links.a },
      { titleAr: 'الصندوق', href: links.b },
    ];
  }
  if (key === 'kitchen') {
    return [
      { titleAr: 'الزبون', href: links.a },
      { titleAr: 'النشاط', href: links.b },
    ];
  }
  return [
    { titleAr: 'الشاشة', href: links.a },
    { titleAr: 'المضيف', href: links.b },
    ...(links.c ? [{ titleAr: 'الضيف', href: links.c }] : []),
  ];
}

function trialPayload(
  key: StoreProductTrialKey,
  email: string,
  opts?: { voice?: 'men' | 'women'; hostName?: string },
): Record<string, unknown> {
  const voice = opts?.voice === 'women' ? 'women' : 'men';
  const hostName = String(opts?.hostName || '').trim();
  if (key === 'cafe') {
    return {
      packId: 'm6',
      shopName: 'تجربة كافينا1',
      hostName: 'الكاشير',
      blurbAr: 'نموذج تجريبي لمقهى الحي.',
      customFields: ['', '', '', '', ''],
      flashAr: '',
      shelf: [],
      orders: [],
      chatIncluded: true,
      chats: [],
      nextTicket: 1,
      welcomeAr: 'أهلاً بكم في شاشة التجربة.',
      youtubeUrl: '',
      youtubeHidden: true,
      announcement: '',
      photoSrc: '',
      panoramaSrc: '',
      guestPaused: false,
      reviewBeforeShow: false,
      activeEventId: 'welcome',
      customEventTitle: '',
      blessings: [],
    };
  }
  if (key === 'grocers') {
    return {
      packId: 'm6',
      shopName: 'تجربة تمويناتا1',
      hostName: 'الكاشير',
      blurbAr: 'نموذج تجريبي لتموينات الحي.',
      customFields: ['', '', '', '', ''],
      flashAr: '',
      shelf: [],
      orders: [],
      chatAddon: true,
      chats: [],
    };
  }
  if (key === 'restaurant') {
    return {
      packId: 'm6',
      shopName: 'تجربة مطعمنا1',
      hostName: 'المطبخ',
      blurbAr: 'نموذج تجريبي لمطعم الحي.',
      customFields: ['', '', '', '', ''],
      flashAr: '',
      shelf: [],
      orders: [],
      chatIncluded: true,
      chats: [],
      nextTicket: 1,
    };
  }
  if (key === 'produce') {
    return {
      packId: 'm6',
      shopName: 'تجربة خضارنا1',
      hostName: 'الصندوق',
      blurbAr: 'نموذج تجريبي لصندوق الخضار في الحي.',
      customFields: ['', '', '', '', ''],
      flashAr: '',
      shelf: [],
      orders: [],
      chatIncluded: true,
      chats: [],
    };
  }
  if (key === 'kitchen') {
    return {
      packId: 'm6',
      shopName: 'تجربة طبختنا1',
      hostName: 'النشاط',
      blurbAr: 'نموذج تجريبي لنشاط أسرة منتجة.',
      customFields: ['', '', '', '', ''],
      flashAr: '',
      opsPhone: '',
      acceptingOrders: true,
      scheduleEnabled: false,
      deliveryFee: 0,
      showSoldOut: false,
      qrStamp: newKitchenQrStamp(),
      qrActive: true,
      shelf: [],
      orders: [],
      nextTicket: 1,
      ...DEFAULT_KITCHEN_PICKUP,
      ...DEFAULT_STORE_SHOP_HOURS,
    };
  }
  if (key === 'lounge') {
    return {
      packId: 'm3',
      loungeName: 'تجربة لاونجا1',
      hostName: 'المضيف',
      activeEventId: 'welcome',
      customEventTitle: '',
      welcomeAr: 'أهلاً بكم في شاشة التجربة.',
      youtubeUrl: '',
      youtubeHidden: true,
      announcement: '',
      photoSrc: '',
      panoramaSrc: '',
      guestPaused: false,
      reviewBeforeShow: false,
      blessings: [],
    };
  }
  if (key === 'event') {
    return {
      voice,
      hostRole: 'self',
      hostName: hostName || 'تجربة اجواء1',
      occasionTitle: 'مناسبة تجريبية',
      eventDate: '',
      eventTime: '',
      venueKind: 'hall',
      venueName: '',
      venueMapsUrl: '',
      welcomeAr: 'أهلاً بكم في قاعة التجربة.',
      youtubeUrl: '',
      youtubeHidden: true,
      announcement: '',
      photoSrc: '/images/store/lab/lab-luxury-gold.png',
      panoramaSrc: '/images/store/lab/lab-wedding-panorama.png',
      blessings: [],
    };
  }
  void email;
  return {
    voice,
    hostRole: voice === 'women' ? 'groom_mother' : 'self',
    hostName: hostName || 'تجربة افراحي1',
    offspringKind: 'son',
    groomName: 'العريس',
    brideName: 'العروس',
    eventDate: '',
    eventDateEn: '',
    eventTime: '',
    venueKind: 'hall',
    venueName: '',
    venueMapsUrl: '',
    welcomeAr: 'أهلاً بكم في قاعة التجربة.',
    welcomeSetIndex: 0,
    youtubeUrl: '',
    youtubeHidden: true,
    announcement: '',
    photoSrc: '/images/store/lab/lab-luxury-gold.png',
    panoramaSrc: '/images/store/lab/lab-wedding-panorama.png',
    blessings: [],
  };
}

export async function countMarketerTrials(
  db: Db,
  marketerId: string,
  productKey: StoreProductTrialKey,
): Promise<number> {
  const { count } = await db
    .from(STORE_PRODUCT_TRIAL_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('marketer_id', marketerId)
    .eq('product_key', productKey)
    .neq('status', 'declined');
  return count || 0;
}

export async function findBlockingTrial(
  db: Db,
  productKey: StoreProductTrialKey,
  email: string,
): Promise<StoreProductTrialRow | null> {
  const { data } = await db
    .from(STORE_PRODUCT_TRIAL_TABLE)
    .select('*')
    .eq('product_key', productKey)
    .eq('beneficiary_email', email)
    .neq('status', 'declined')
    .maybeSingle();
  return (data as StoreProductTrialRow | null) || null;
}

async function sendIssuedMail(key: StoreProductTrialKey, email: string, tokens: Record<string, string>): Promise<void> {
  const links = productLinks(key, tokens);
  const expiresLabel =
    trialDaysFor(key) === STORE_PRODUCE_TRIAL_DAYS
      ? 'مئة وثمانون يوماً من أول دخول للرابط'
      : 'ستون يوماً من أول دخول للرابط';
  if (key === 'cafe') {
    await sendCafeLiveLinksEmail({
      to: email,
      shopUrl: links.a,
      deskUrl: links.b,
      displayUrl: links.c || links.a,
      quietUrl: `${storeOrigin()}/#/c/${encodeURIComponent(tokens.display)}/quiet`,
      menuUrl: `${storeOrigin()}/#/c/${encodeURIComponent(tokens.display)}/menu`,
      guestUrl: `${storeOrigin()}/#/c/${encodeURIComponent(tokens.guest)}/guest`,
      hostUrl: `${storeOrigin()}/#/c/${encodeURIComponent(tokens.desk)}/host`,
      expiresLabel,
    });
    return;
  }
  if (key === 'grocers') {
    await sendGrocersLiveLinksEmail({ to: email, shopUrl: links.a, deskUrl: links.b, expiresLabel });
    return;
  }
  if (key === 'restaurant') {
    await sendRestaurantLiveLinksEmail({ to: email, shopUrl: links.a, deskUrl: links.b, expiresLabel });
    return;
  }
  if (key === 'produce') {
    await sendProduceLiveLinksEmail({ to: email, shopUrl: links.a, deskUrl: links.b, expiresLabel });
    return;
  }
  if (key === 'kitchen') {
    await sendKitchenLiveLinksEmail({ to: email, shopUrl: links.a, deskUrl: links.b, expiresLabel });
    return;
  }
  if (key === 'event') {
    await sendEventLiveLinksEmail({
      to: email,
      displayUrl: links.a,
      hostUrl: links.b,
      guestUrl: links.c || '',
      expiresLabel,
    });
    return;
  }
  if (key === 'lounge') {
    await sendLoungeLiveLinksEmail({
      to: email,
      displayUrl: links.a,
      hostUrl: links.b,
      guestUrl: links.c || '',
      expiresLabel,
    });
    return;
  }
  await sendWeddingLiveLinksEmail({
    to: email,
    displayUrl: links.a,
    hostUrl: links.b,
    guestUrl: links.c || '',
    expiresLabel,
  });
}

async function insertLiveOrder(
  db: Db,
  key: StoreProductTrialKey,
  email: string,
  trialId: string,
  opts?: { voice?: 'men' | 'women'; hostName?: string },
): Promise<{ orderId: string; tokens: Record<string, string> } | { error: string }> {
  const table = ORDER_TABLE[key];
  const payload = trialPayload(key, email, opts);
  const now = new Date().toISOString();
  if (key === 'cafe') {
    const shop = newCafeToken();
    const desk = newCafeToken();
    const display = newCafeToken();
    const guest = newCafeToken();
    const { data, error } = await db
      .from(table)
      .insert({
        status: 'live',
        display_token: display,
        guest_token: guest,
        shop_token: shop,
        desk_token: desk,
        buyer_email: email,
        buyer_name: 'تجربة كافينا1',
        price_halalas: 0,
        payload,
        policy_version: 'trial-60',
        is_trial: true,
        trial_id: trialId,
        expires_at: null,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .maybeSingle();
    if (error || !data) return { error: 'تعذر إنشاء صفحة المقهى التجريبية.' };
    return { orderId: String(data.id), tokens: { shop, desk, display, guest } };
  }
  if (key === 'grocers') {
    const shop = newGrocersToken();
    const desk = newGrocersToken();
    const { data, error } = await db
      .from(table)
      .insert({
        status: 'live',
        shop_token: shop,
        desk_token: desk,
        buyer_email: email,
        buyer_name: 'تجربة تمويناتا1',
        price_halalas: 0,
        payload,
        policy_version: 'trial-60',
        is_trial: true,
        trial_id: trialId,
        expires_at: null,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .maybeSingle();
    if (error || !data) return { error: 'تعذر إنشاء صفحة التموينات التجريبية.' };
    return { orderId: String(data.id), tokens: { shop, desk } };
  }
  if (key === 'restaurant') {
    const shop = newRestaurantToken();
    const desk = newRestaurantToken();
    const { data, error } = await db
      .from(table)
      .insert({
        status: 'live',
        shop_token: shop,
        desk_token: desk,
        buyer_email: email,
        buyer_name: 'تجربة مطعمنا1',
        price_halalas: 0,
        payload,
        policy_version: 'trial-60',
        is_trial: true,
        trial_id: trialId,
        expires_at: null,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .maybeSingle();
    if (error || !data) return { error: 'تعذر إنشاء صفحة المطعم التجريبية.' };
    return { orderId: String(data.id), tokens: { shop, desk } };
  }
  if (key === 'produce') {
    const shop = newProduceToken();
    const desk = newProduceToken();
    const { data, error } = await db
      .from(table)
      .insert({
        status: 'live',
        shop_token: shop,
        desk_token: desk,
        buyer_email: email,
        buyer_name: 'تجربة خضارنا1',
        price_halalas: 0,
        payload,
        policy_version: 'trial-180',
        is_trial: true,
        trial_id: trialId,
        expires_at: null,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .maybeSingle();
    if (error || !data) return { error: 'تعذر إنشاء صفحة الصندوق التجريبية.' };
    return { orderId: String(data.id), tokens: { shop, desk } };
  }
  if (key === 'kitchen') {
    const shop = newKitchenToken();
    const desk = newKitchenToken();
    const { data, error } = await db
      .from(table)
      .insert({
        status: 'live',
        shop_token: shop,
        desk_token: desk,
        buyer_email: email,
        buyer_name: 'تجربة طبختنا1',
        price_halalas: 0,
        payload,
        policy_version: 'trial-180',
        is_trial: true,
        trial_id: trialId,
        expires_at: null,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .maybeSingle();
    if (error || !data) return { error: 'تعذر إنشاء صفحة النشاط التجريبية.' };
    return { orderId: String(data.id), tokens: { shop, desk } };
  }
  const display = key === 'event' ? newEventToken() : key === 'lounge' ? newLoungeToken() : newWeddingToken();
  const guest = key === 'event' ? newEventToken() : key === 'lounge' ? newLoungeToken() : newWeddingToken();
  const host = key === 'event' ? newEventToken() : key === 'lounge' ? newLoungeToken() : newWeddingToken();
  const { data, error } = await db
    .from(table)
    .insert({
      status: 'live',
      display_token: display,
      guest_token: guest,
      host_token: host,
      buyer_email: email,
      buyer_name: payload.hostName || payload.loungeName || 'تجربة',
      price_halalas: 0,
      payload,
      policy_version: 'trial-60',
      is_trial: true,
      trial_id: trialId,
      expires_at: null,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .maybeSingle();
  if (error || !data) return { error: 'تعذر إنشاء النموذج التجريبي.' };
  return { orderId: String(data.id), tokens: { display, guest, host } };
}

export async function requestStoreProductTrial(
  db: Db,
  input: {
    productKey: StoreProductTrialKey;
    email: string;
    marketerId: string;
    marketerLabel: string;
  },
): Promise<{ ok: true; trialId: string } | { ok: false; error: string }> {
  const email = normalizeTrialEmail(input.email);
  if (!isTrialEmail(email)) return { ok: false, error: 'أدخل إيميلاً صالحاً للمستفيد المستهدف.' };
  const blocking = await findBlockingTrial(db, input.productKey, email);
  if (blocking) {
    return {
      ok: false,
      error: 'هذا الإيميل مرتبط بنموذج لنفس المنتج. يُطلب الدخول بالإيميل المسجَّل.',
    };
  }
  const used = await countMarketerTrials(db, input.marketerId, input.productKey);
  if (used >= STORE_PRODUCT_TRIAL_QUOTA) {
    return { ok: false, error: 'بلغت خمسة نماذج لهذا المنتج.' };
  }
  const { data, error } = await db
    .from(STORE_PRODUCT_TRIAL_TABLE)
    .insert({
      product_key: input.productKey,
      beneficiary_email: email,
      status: 'pending_review',
      issuer_kind: 'marketer',
      marketer_id: input.marketerId,
      issued_by_label: input.marketerLabel,
    })
    .select('id')
    .maybeSingle();
  if (error || !data) {
    if (String(error?.message || '').includes('store_product_trials_email_product_uidx')) {
      return { ok: false, error: 'هذا الإيميل مرتبط بنموذج لنفس المنتج. يُطلب الدخول بالإيميل المسجَّل.' };
    }
    return { ok: false, error: 'تعذر حفظ طلب التجربة.' };
  }
  return { ok: true, trialId: String(data.id) };
}

export async function issueStoreProductTrial(
  db: Db,
  input: {
    productKey: StoreProductTrialKey;
    email: string;
    issuerKind: 'admin' | 'marketer';
    marketerId?: string | null;
    issuedByLabel: string;
    reviewer?: string;
    existingTrialId?: string;
    voice?: 'men' | 'women';
    hostName?: string;
  },
): Promise<{ ok: true; trialId: string } | { ok: false; error: string }> {
  const email = normalizeTrialEmail(input.email);
  if (!isTrialEmail(email)) return { ok: false, error: 'أدخل إيميلاً صالحاً للمستفيد المستهدف.' };

  let trialId = String(input.existingTrialId || '').trim();
  const blocking = await findBlockingTrial(db, input.productKey, email);
  if (blocking && (!trialId || blocking.id !== trialId)) {
    return { ok: false, error: 'هذا الإيميل مرتبط بنموذج لنفس المنتج. يُطلب الدخول بالإيميل المسجَّل.' };
  }
  if (!trialId) {
    if (input.issuerKind === 'marketer' && input.marketerId) {
      const used = await countMarketerTrials(db, input.marketerId, input.productKey);
      if (used >= STORE_PRODUCT_TRIAL_QUOTA) {
        return { ok: false, error: 'بلغت خمسة نماذج لهذا المنتج.' };
      }
    }
    const { data, error } = await db
      .from(STORE_PRODUCT_TRIAL_TABLE)
      .insert({
        product_key: input.productKey,
        beneficiary_email: email,
        status: 'issued',
        issuer_kind: input.issuerKind,
        marketer_id: input.marketerId || null,
        issued_by_label: input.issuedByLabel,
        reviewed_by: input.reviewer || '',
        reviewed_at: new Date().toISOString(),
      })
      .select('id')
      .maybeSingle();
    if (error || !data) return { ok: false, error: 'تعذر إصدار النموذج.' };
    trialId = String(data.id);
  }

  const created = await insertLiveOrder(db, input.productKey, email, trialId, {
    voice: input.voice,
    hostName: input.hostName,
  });
  if ('error' in created) return { ok: false, error: created.error };

  const now = new Date().toISOString();
  await db
    .from(STORE_PRODUCT_TRIAL_TABLE)
    .update({
      status: 'issued',
      order_id: created.orderId,
      beneficiary_email: email,
      issued_by_label: input.issuedByLabel,
      reviewed_by: input.reviewer || '',
      reviewed_at: now,
      updated_at: now,
    })
    .eq('id', trialId);

  void sendIssuedMail(input.productKey, email, created.tokens);
  return { ok: true, trialId };
}

export async function applyStoreTrialClock(
  db: Db,
  row: {
    id?: string;
    is_trial?: boolean | null;
    trial_id?: string | null;
    status?: string;
    expires_at?: string | null;
  },
  table: string,
): Promise<{ expired: boolean; giftEnded: boolean; expiresAt: string | null; isTrial: boolean }> {
  const isTrial = row.is_trial === true;
  if (!isTrial) {
    return { expired: false, giftEnded: false, expiresAt: row.expires_at || null, isTrial: false };
  }
  const trialId = String(row.trial_id || '').trim();
  const now = Date.now();
  let trial: StoreProductTrialRow | null = null;
  if (trialId) {
    const { data } = await db.from(STORE_PRODUCT_TRIAL_TABLE).select('*').eq('id', trialId).maybeSingle();
    trial = (data as StoreProductTrialRow | null) || null;
  }
  const productKey = (trial?.product_key || '') as StoreProductTrialKey;
  const gift = isStoreProductTrialKey(productKey) && isGiftTrialProduct(productKey);

  if (trial && !trial.first_opened_at && trial.status === 'issued') {
    const ends = trialEndsAtIso(now, isStoreProductTrialKey(productKey) ? trialDaysFor(productKey) : STORE_PRODUCT_TRIAL_DAYS);
    const stamp = new Date(now).toISOString();
    await db
      .from(STORE_PRODUCT_TRIAL_TABLE)
      .update({
        status: 'activated',
        first_opened_at: stamp,
        trial_ends_at: ends,
        updated_at: stamp,
      })
      .eq('id', trial.id);
    if (row.id) {
      await db.from(table).update({ expires_at: ends, updated_at: stamp }).eq('id', row.id);
    }
    return { expired: false, giftEnded: false, expiresAt: ends, isTrial: true };
  }

  const endMs = trial?.trial_ends_at ? Date.parse(trial.trial_ends_at) : row.expires_at ? Date.parse(row.expires_at) : NaN;
  if (Number.isFinite(endMs) && endMs <= now) {
    const stamp = new Date(now).toISOString();
    if (trial && trial.status !== 'converted' && trial.status !== 'expired') {
      await db
        .from(STORE_PRODUCT_TRIAL_TABLE)
        .update({ status: 'expired', updated_at: stamp })
        .eq('id', trial.id);
    }
    if (row.id && row.status === 'live') {
      await db
        .from(table)
        .update({
          status: gift ? 'expired' : 'pending_renewal',
          updated_at: stamp,
        })
        .eq('id', row.id);
    }
    return { expired: true, giftEnded: gift, expiresAt: trial?.trial_ends_at || row.expires_at || null, isTrial: true };
  }

  if (trial?.status === 'expired' || trial?.status === 'converted') {
    return {
      expired: trial.status === 'expired',
      giftEnded: trial.status === 'expired' && gift,
      expiresAt: trial.trial_ends_at,
      isTrial: true,
    };
  }

  return { expired: false, giftEnded: false, expiresAt: trial?.trial_ends_at || row.expires_at || null, isTrial: true };
}

export async function markStoreTrialConverted(db: Db, orderId: string): Promise<void> {
  const now = new Date().toISOString();
  await db
    .from(STORE_PRODUCT_TRIAL_TABLE)
    .update({ status: 'converted', updated_at: now })
    .eq('order_id', orderId)
    .in('status', ['issued', 'activated', 'expired']);
}

export function trialProductTag(key: StoreProductTrialKey): string {
  return PRODUCT_TAG[key];
}

export function trialOrderTable(key: StoreProductTrialKey): string {
  return ORDER_TABLE[key];
}
