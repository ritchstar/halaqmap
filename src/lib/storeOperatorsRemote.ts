/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { StoreOperatorProductId } from '@/config/storeOperatorsDesk';
import {
  clearStoreOperatorsSession,
  readStoreOperatorsSession,
  writeStoreOperatorsSession,
} from '@/lib/storeOperatorsSession';

const PATH = '/api/public-store-operators';

export type StoreOperatorTile = {
  id: string;
  productId: StoreOperatorProductId;
  titleAr: string;
  nameAr: string;
  deskPath: string;
  operable: boolean;
};

function asTiles(value: unknown): StoreOperatorTile[] {
  if (!Array.isArray(value)) return [];
  return value.filter((row): row is StoreOperatorTile => {
    if (!row || typeof row !== 'object') return false;
    const item = row as StoreOperatorTile;
    return Boolean(item.id && item.deskPath && item.titleAr);
  });
}

async function postAction(
  body: Record<string, unknown>,
  sessionToken = '',
): Promise<{ ok: boolean; error?: string; message?: string; sessionToken?: string; tiles?: StoreOperatorTile[] }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
    const res = await fetch(PATH, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: unknown;
      message?: unknown;
      sessionToken?: unknown;
      tiles?: unknown;
    };
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'تعذر إكمال الطلب.' };
    }
    return {
      ok: true,
      message: typeof data.message === 'string' ? data.message : undefined,
      sessionToken: typeof data.sessionToken === 'string' ? data.sessionToken : undefined,
      tiles: asTiles(data.tiles),
    };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال. أعد المحاولة.' };
  }
}

export async function sendStoreOperatorCode(email: string) {
  return postAction({ action: 'send_code', email });
}

export async function verifyStoreOperatorCode(email: string, code: string) {
  const result = await postAction({ action: 'verify_code', email, code });
  if (result.ok && result.sessionToken) writeStoreOperatorsSession(result.sessionToken);
  return result;
}

export async function fetchStoreOperatorMe() {
  const session = readStoreOperatorsSession();
  if (!session) return { ok: false as const, error: 'انتهت الجلسة. أدخل البريد من جديد.' };
  const result = await postAction({ action: 'me' }, session);
  if (!result.ok) clearStoreOperatorsSession();
  return result;
}

export async function logoutStoreOperator() {
  const session = readStoreOperatorsSession();
  if (session) await postAction({ action: 'logout' }, session);
  clearStoreOperatorsSession();
}
