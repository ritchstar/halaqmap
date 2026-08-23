/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const KEY = 'halaqmap-store-affiliate-session';

export function readStoreAffiliateSession(): string {
  if (typeof window === 'undefined') return '';
  return String(window.localStorage.getItem(KEY) || '').trim();
}

export function writeStoreAffiliateSession(token: string): void {
  if (typeof window === 'undefined') return;
  const value = String(token || '').trim();
  if (!value) {
    window.localStorage.removeItem(KEY);
    return;
  }
  window.localStorage.setItem(KEY, value);
}

export function clearStoreAffiliateSession(): void {
  writeStoreAffiliateSession('');
}
