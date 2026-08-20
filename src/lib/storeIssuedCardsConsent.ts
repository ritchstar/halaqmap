/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import {
  STORE_ISSUED_CARDS_POLICY_VERSION,
  type StoreIssuedCardTrack,
  type StoreIssuedConsentCheckId,
} from '@/config/storeIssuedCardsLegal';

const STORAGE_KEY = 'halaqmap-store-issued-cards-legal';

export type StoreIssuedConsentRecord = {
  version: string;
  track: StoreIssuedCardTrack;
  acceptedAt: string;
  checks: Partial<Record<StoreIssuedConsentCheckId, boolean>>;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function keyFor(track: StoreIssuedCardTrack): string {
  return `${STORAGE_KEY}:${track}`;
}

export function readStoreIssuedConsent(track: StoreIssuedCardTrack): StoreIssuedConsentRecord | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(keyFor(track));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoreIssuedConsentRecord;
    if (parsed?.version !== STORE_ISSUED_CARDS_POLICY_VERSION) return null;
    if (parsed?.track !== track) return null;
    if (!parsed?.acceptedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasValidStoreIssuedConsent(track: StoreIssuedCardTrack): boolean {
  return readStoreIssuedConsent(track) !== null;
}

export function storeStoreIssuedConsent(
  track: StoreIssuedCardTrack,
  checks: Partial<Record<StoreIssuedConsentCheckId, boolean>>,
): StoreIssuedConsentRecord {
  const record: StoreIssuedConsentRecord = {
    version: STORE_ISSUED_CARDS_POLICY_VERSION,
    track,
    acceptedAt: new Date().toISOString(),
    checks,
  };
  if (isBrowser()) {
    window.sessionStorage.setItem(keyFor(track), JSON.stringify(record));
  }
  return record;
}
