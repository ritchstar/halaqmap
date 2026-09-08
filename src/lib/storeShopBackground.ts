/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * خلفيات صفحة الزبون — هيدر وصفحة. يختارها المشغّل من اللوحة.
 */
import type { CSSProperties } from 'react';
import type { StoreEventLiveVoice } from '@/config/storeEventLive';
import type { StoreWeddingLiveVoice } from '@/config/storeWeddingLive';

export type ShopBackgroundFields = {
  shopHeaderBg: string;
  shopPageBg: string;
};

export const EMPTY_SHOP_BACKGROUND: ShopBackgroundFields = {
  shopHeaderBg: '',
  shopPageBg: '',
};

export const STORE_WEDDING_SPECIALTY_PAGE_BG: Record<StoreWeddingLiveVoice, string> = {
  men: 'linear-gradient(165deg, #2a1f0a 0%, #1a1208 42%, #050308 100%)',
  women: 'linear-gradient(165deg, #2a1420 0%, #1a1014 42%, #050308 100%)',
};

export const STORE_WEDDING_SPECIALTY_HEADER_BG: Record<StoreWeddingLiveVoice, string> = {
  men: 'linear-gradient(180deg, rgba(232,197,71,0.22) 0%, rgba(26,18,8,0) 72%)',
  women: 'linear-gradient(180deg, rgba(228,183,197,0.24) 0%, rgba(26,16,20,0) 72%)',
};

export const STORE_EVENT_SPECIALTY_PAGE_BG: Record<StoreEventLiveVoice, string> = {
  men: 'linear-gradient(165deg, #0a2824 0%, #06201e 42%, #050308 100%)',
  women: 'linear-gradient(165deg, #1a1428 0%, #120a18 42%, #050308 100%)',
};

export const STORE_EVENT_SPECIALTY_HEADER_BG: Record<StoreEventLiveVoice, string> = {
  men: 'linear-gradient(180deg, rgba(20,184,166,0.2) 0%, rgba(6,32,30,0) 72%)',
  women: 'linear-gradient(180deg, rgba(180,140,200,0.22) 0%, rgba(18,10,24,0) 72%)',
};

export function sanitizeShopBackground(raw: unknown, maxLen = 2400): string {
  const v = String(raw ?? '').trim().slice(0, maxLen);
  if (!v) return '';
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v;
  if (v.startsWith('linear-gradient(') || v.startsWith('radial-gradient(')) return v.slice(0, 600);
  if (v.startsWith('data:image/')) return v.slice(0, maxLen);
  if (v.startsWith('https://')) return v.slice(0, 500);
  return '';
}

export function parseShopBackgroundFields(
  payload: Record<string, unknown> | null | undefined,
  fallback: ShopBackgroundFields = EMPTY_SHOP_BACKGROUND,
): ShopBackgroundFields {
  const base = payload && typeof payload === 'object' ? payload : {};
  return {
    shopHeaderBg: sanitizeShopBackground(base.shopHeaderBg ?? fallback.shopHeaderBg),
    shopPageBg: sanitizeShopBackground(base.shopPageBg ?? fallback.shopPageBg),
  };
}

export function shopBackgroundStyle(bg: string): CSSProperties | undefined {
  const safe = sanitizeShopBackground(bg);
  if (!safe) return undefined;
  if (safe.startsWith('linear-gradient(') || safe.startsWith('radial-gradient(')) {
    return { background: safe };
  }
  if (safe.startsWith('#')) return { backgroundColor: safe };
  return {
    backgroundImage: `url(${safe})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  };
}

export function resolveShopHeaderCover(headerBg: string, fallbackCover?: string): string | undefined {
  const safe = sanitizeShopBackground(headerBg);
  if (safe) {
    if (safe.startsWith('#') || safe.startsWith('linear-gradient') || safe.startsWith('radial-gradient')) {
      return undefined;
    }
    return safe;
  }
  return fallbackCover?.trim() || undefined;
}

export function resolveShopHeaderCoverStyle(headerBg: string): CSSProperties | undefined {
  const safe = sanitizeShopBackground(headerBg);
  if (!safe) return undefined;
  if (safe.startsWith('#') || safe.startsWith('linear-gradient(') || safe.startsWith('radial-gradient(')) {
    return shopBackgroundStyle(safe);
  }
  return undefined;
}

export function shopBackgroundUsesImage(bg: string): boolean {
  const safe = sanitizeShopBackground(bg);
  return Boolean(safe && !safe.startsWith('#') && !safe.startsWith('linear-gradient') && !safe.startsWith('radial-gradient'));
}
