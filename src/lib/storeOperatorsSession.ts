/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رمز جلسة المشغّل يبقى بعد إغلاق الغلاف على أندرويد وآيفون، فالتخزين دائم.
 */
const KEY = 'store-operators-session';

function readFrom(store: Storage | undefined): string {
  try {
    return String(store?.getItem(KEY) || '').trim();
  } catch {
    return '';
  }
}

export function readStoreOperatorsSession(): string {
  if (typeof window === 'undefined') return '';
  const stored = readFrom(window.localStorage);
  if (stored) return stored;
  const legacy = readFrom(window.sessionStorage);
  if (!legacy) return '';
  writeStoreOperatorsSession(legacy);
  return legacy;
}

export function writeStoreOperatorsSession(token: string): void {
  if (typeof window === 'undefined') return;
  const value = String(token || '').trim();
  try {
    window.sessionStorage.removeItem(KEY);
    if (!value) {
      window.localStorage.removeItem(KEY);
      return;
    }
    window.localStorage.setItem(KEY, value);
  } catch {
    /* التخزين معطّل في المتصفح */
  }
}

export function clearStoreOperatorsSession(): void {
  writeStoreOperatorsSession('');
}
