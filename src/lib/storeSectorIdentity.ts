/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { CSSProperties } from 'react';
import {
  STORE_SECTOR_IDENTITY,
  type StoreLiveSectorId,
  type StoreSectorIdentity,
} from '@/config/storeSectorIdentity';
import { shopBackgroundStyle } from '@/lib/storeShopBackground';

export type StoreLiveSurface = 'workspace' | 'storefront';

export function storeSectorIdentity(sector: StoreLiveSectorId): StoreSectorIdentity {
  return STORE_SECTOR_IDENTITY[sector];
}

export function sectorIdentityCssVars(identity: StoreSectorIdentity): CSSProperties {
  return {
    '--sector-accent': identity.accent,
    '--sector-glow': identity.workspaceGlow,
    '--storefront-surface': identity.storefrontSurface,
    '--storefront-hero-veil': identity.storefrontHeroVeil,
  } as CSSProperties;
}

export function resolveStoreLivePageStyle(input: {
  sector?: StoreLiveSectorId;
  surface: StoreLiveSurface;
  operatorPageBg?: string;
}): CSSProperties {
  const identity = input.sector ? STORE_SECTOR_IDENTITY[input.sector] : null;
  if (input.surface === 'workspace') {
    return identity ? sectorIdentityCssVars(identity) : {};
  }
  const custom = String(input.operatorPageBg || '').trim();
  if (custom) return { ...shopBackgroundStyle(custom), ...(identity ? sectorIdentityCssVars(identity) : {}) };
  if (identity) {
    return {
      ...shopBackgroundStyle(identity.storefrontPageBg),
      ...sectorIdentityCssVars(identity),
    };
  }
  return shopBackgroundStyle('');
}
