/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قياس مسار جار الحي — بلا PII ولا token خام.
 */
import { trackProductEvent } from '@/lib/analytics/productAnalytics';
import type { NeighborCartKind } from '@/lib/neighborCartStorage';

type NeighborAnalyticsBase = {
  kind: NeighborCartKind;
  tokenScope: 'lab' | 'live';
  entry?: 'qr' | 'share' | 'direct' | 'lab';
};

function tokenScope(token: string, isLab: boolean): 'lab' | 'live' {
  if (isLab) return 'lab';
  return 'live';
}

function resolveEntry(isLab: boolean): NeighborAnalyticsBase['entry'] {
  if (typeof window === 'undefined') return isLab ? 'lab' : 'direct';
  const params = new URLSearchParams(window.location.search);
  if (params.get('ref') === 'qr' || params.get('utm_source') === 'qr') return 'qr';
  if (params.get('share') === '1' || params.get('ref') === 'share') return 'share';
  if (isLab) return 'lab';
  return 'direct';
}

function baseProps(kind: NeighborCartKind, token: string, isLab: boolean): NeighborAnalyticsBase {
  return {
    kind,
    tokenScope: tokenScope(token, isLab),
    entry: resolveEntry(isLab),
  };
}

export const NeighborShopEvents = {
  viewStore(kind: NeighborCartKind, token: string, isLab: boolean) {
    trackProductEvent('neighbor_view_store', baseProps(kind, token, isLab));
  },
  searchProducts(kind: NeighborCartKind, token: string, isLab: boolean, queryLen: number) {
    trackProductEvent('neighbor_search_products', { ...baseProps(kind, token, isLab), query_len: queryLen });
  },
  applyCategory(kind: NeighborCartKind, token: string, isLab: boolean, category: string) {
    trackProductEvent('neighbor_apply_category', {
      ...baseProps(kind, token, isLab),
      category: category.slice(0, 40),
    });
  },
  addItem(kind: NeighborCartKind, token: string, isLab: boolean, catalogId: string) {
    trackProductEvent('neighbor_add_item', {
      ...baseProps(kind, token, isLab),
      catalog_id: catalogId.slice(0, 64),
    });
  },
  removeItem(kind: NeighborCartKind, token: string, isLab: boolean, catalogId: string) {
    trackProductEvent('neighbor_remove_item', {
      ...baseProps(kind, token, isLab),
      catalog_id: catalogId.slice(0, 64),
    });
  },
  viewCart(kind: NeighborCartKind, token: string, isLab: boolean, itemCount: number) {
    trackProductEvent('neighbor_view_cart', { ...baseProps(kind, token, isLab), item_count: itemCount });
  },
  beginCheckout(kind: NeighborCartKind, token: string, isLab: boolean) {
    trackProductEvent('neighbor_begin_checkout', baseProps(kind, token, isLab));
  },
  submitOrder(kind: NeighborCartKind, token: string, isLab: boolean, itemCount: number) {
    trackProductEvent('neighbor_submit_order', { ...baseProps(kind, token, isLab), item_count: itemCount });
  },
  orderSubmitted(kind: NeighborCartKind, token: string, isLab: boolean, itemCount: number) {
    trackProductEvent('neighbor_order_submitted', { ...baseProps(kind, token, isLab), item_count: itemCount });
  },
  orderFailed(kind: NeighborCartKind, token: string, isLab: boolean, reason: string) {
    trackProductEvent('neighbor_order_failed', {
      ...baseProps(kind, token, isLab),
      reason: reason.slice(0, 80),
    });
  },
  directPayInstructionsViewed(kind: NeighborCartKind, token: string, isLab: boolean) {
    trackProductEvent('neighbor_direct_pay_instructions_viewed', baseProps(kind, token, isLab));
  },
} as const;
