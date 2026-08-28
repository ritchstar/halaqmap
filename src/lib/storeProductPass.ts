/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسارات بطاقة كيو آر المنتج على الجوال. لا كاردي8 ولا افراحي1.
 */
import {
  STORE_PRODUCT_PASS_KINDS,
  STORE_PRODUCT_PASS_META,
  STORE_PRODUCT_PASS_ROLES,
  type StoreProductPassKind,
  type StoreProductPassRoleId,
} from '@/config/storeProductPass';
import { ROUTE_PATHS } from '@/lib/routePaths';

export type StoreProductPassCard = {
  kind: StoreProductPassKind;
  token: string;
  name: string;
  role: StoreProductPassRoleId;
  shopName: string;
  qrStamp: string;
};

const NAME_MAX = 40;

export function isStoreProductPassKind(raw: string | undefined): raw is StoreProductPassKind {
  return STORE_PRODUCT_PASS_KINDS.includes(raw as StoreProductPassKind);
}

export function parsePassToken(raw: string | undefined): string {
  return String(raw || '')
    .trim()
    .slice(0, 80)
    .replace(/[^a-zA-Z0-9_-]/g, '');
}

export function parsePassName(raw: unknown): string | null {
  const name = String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_MAX);
  if (name.length < 2) return null;
  if (/https?:\/\//i.test(name)) return null;
  return name;
}

export function parsePassRole(raw: unknown): StoreProductPassRoleId | null {
  const id = String(raw ?? '').trim();
  return STORE_PRODUCT_PASS_ROLES.some((item) => item.id === id) ? (id as StoreProductPassRoleId) : null;
}

export function passRoleLabelAr(role: StoreProductPassRoleId): string {
  return STORE_PRODUCT_PASS_ROLES.find((item) => item.id === role)?.labelAr || '';
}

export function passShopHashPath(kind: StoreProductPassKind, token: string, qrStamp = ''): string {
  const path = STORE_PRODUCT_PASS_META[kind].shopPath.replace(':token', encodeURIComponent(token));
  if (kind === 'kitchen' && qrStamp) return `${path}?qr=${encodeURIComponent(qrStamp)}`;
  return path;
}

export function passShopUrl(kind: StoreProductPassKind, token: string, qrStamp = ''): string {
  const hashPath = passShopHashPath(kind, token, qrStamp);
  if (typeof window === 'undefined') return `/#${hashPath}`;
  return `${window.location.origin}/#${hashPath}`;
}

export function passIssuerPath(input: {
  kind: StoreProductPassKind;
  token: string;
  shopName?: string;
  qrStamp?: string;
}): string {
  const base = ROUTE_PATHS.STORE_PRODUCT_PASS.replace(':kind', input.kind).replace(':token', encodeURIComponent(input.token));
  const qs = new URLSearchParams();
  const shopName = parsePassName(input.shopName || '') || '';
  if (shopName) qs.set('s', shopName);
  const stamp = String(input.qrStamp || '').trim().slice(0, 40);
  if (stamp) qs.set('qr', stamp);
  const query = qs.toString();
  return query ? `${base}?${query}` : base;
}

export function passCardPath(card: StoreProductPassCard): string {
  const base = ROUTE_PATHS.STORE_PRODUCT_PASS.replace(':kind', card.kind).replace(':token', encodeURIComponent(card.token));
  const qs = new URLSearchParams();
  qs.set('n', card.name);
  qs.set('r', card.role);
  if (card.shopName) qs.set('s', card.shopName);
  if (card.qrStamp) qs.set('qr', card.qrStamp);
  return `${base}?${qs.toString()}`;
}

export function passCardAbsoluteUrl(card: StoreProductPassCard): string {
  const path = passCardPath(card);
  if (typeof window === 'undefined') return `/#${path}`;
  return `${window.location.origin}/#${path}`;
}
