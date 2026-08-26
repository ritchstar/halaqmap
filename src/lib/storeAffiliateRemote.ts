/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { clearStoreAffiliateSession, readStoreAffiliateSession, writeStoreAffiliateSession } from '@/lib/storeAffiliateSession';

const PATH = '/api/public-store-affiliate';

export type StoreAffiliateLedgerRow = {
  id: string;
  productTag: string;
  lineId: string;
  priceSar: number;
  commissionSar: number;
  netSar: number;
  at: string;
};

export type StoreAffiliateMarketer = {
  email: string;
  displayName: string;
  code: string;
  commissionSar: number;
  links: {
    wedding: string;
    event: string;
    lounge: string;
    grocers: string;
    restaurant: string;
  };
  ledger: StoreAffiliateLedgerRow[];
};

async function postAction(
  body: Record<string, unknown>,
  sessionToken = '',
): Promise<{ ok: boolean; error?: string; [k: string]: unknown }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
    const res = await fetch(PATH, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: unknown };
    if (!res.ok || data.ok !== true) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'تعذر إكمال الطلب.' };
    }
    return { ok: true, ...data };
  } catch {
    return { ok: false, error: 'تعذّر الاتصال. أعد المحاولة.' };
  }
}

export async function applyStoreAffiliate(input: {
  displayName: string;
  email: string;
  phone: string;
  city: string;
  channelPlan: string;
  experience: string;
  acceptedRules: boolean;
}) {
  return postAction({ action: 'apply', ...input });
}

export async function sendStoreAffiliateMagic(email: string) {
  return postAction({ action: 'send_magic', email });
}

export async function redeemStoreAffiliateMagic(token: string) {
  const result = await postAction({ action: 'redeem_magic', token });
  if (result.ok && typeof result.sessionToken === 'string') {
    writeStoreAffiliateSession(result.sessionToken);
  }
  return result;
}

export async function fetchStoreAffiliateMe() {
  const session = readStoreAffiliateSession();
  if (!session) return { ok: false as const, error: 'يلزم رابط دخول جديد' };
  const result = await postAction({ action: 'me' }, session);
  if (!result.ok) clearStoreAffiliateSession();
  return result;
}

export async function logoutStoreAffiliate() {
  const session = readStoreAffiliateSession();
  if (session) await postAction({ action: 'logout' }, session);
  clearStoreAffiliateSession();
}

export type StoreAffiliateTrialRow = {
  id: string;
  product_key: string;
  beneficiary_email: string;
  status: string;
  issuer_kind: string;
  issued_by_label: string;
  first_opened_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
};

export async function requestStoreAffiliateTrial(productKey: string, email: string) {
  const session = readStoreAffiliateSession();
  if (!session) return { ok: false as const, error: 'يلزم رابط دخول جديد' };
  return postAction({ action: 'request_trial', productKey, email }, session);
}

export async function listStoreAffiliateTrials() {
  const session = readStoreAffiliateSession();
  if (!session) return { ok: false as const, error: 'يلزم رابط دخول جديد' };
  return postAction({ action: 'list_trials' }, session);
}
