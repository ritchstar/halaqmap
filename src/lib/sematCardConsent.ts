import {
  SEMAT_CARD_POLICY_VERSION,
  type SematConsentCheckId,
} from '@/config/sematCardLegalPolicy';

const STORAGE_KEY = 'halaqmap-semat-legal-consent';

export type SematConsentRecord = {
  version: string;
  acceptedAt: string;
  checks: Record<SematConsentCheckId, boolean>;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function readSematConsent(): SematConsentRecord | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SematConsentRecord;
    if (parsed?.version !== SEMAT_CARD_POLICY_VERSION) return null;
    if (!parsed?.acceptedAt || typeof parsed.checks !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasValidSematConsent(): boolean {
  return readSematConsent() !== null;
}

export function storeSematConsent(checks: Record<SematConsentCheckId, boolean>): SematConsentRecord {
  const record: SematConsentRecord = {
    version: SEMAT_CARD_POLICY_VERSION,
    acceptedAt: new Date().toISOString(),
    checks,
  };
  if (isBrowser()) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  }
  return record;
}

export function clearSematConsent(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
