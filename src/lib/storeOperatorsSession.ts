/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
const KEY = 'store-operators-session';

export function readStoreOperatorsSession(): string {
  if (typeof window === 'undefined') return '';
  return String(window.sessionStorage.getItem(KEY) || '').trim();
}

export function writeStoreOperatorsSession(token: string): void {
  if (typeof window === 'undefined') return;
  const value = String(token || '').trim();
  if (!value) {
    window.sessionStorage.removeItem(KEY);
    return;
  }
  window.sessionStorage.setItem(KEY, value);
}

export function clearStoreOperatorsSession(): void {
  writeStoreOperatorsSession('');
}
