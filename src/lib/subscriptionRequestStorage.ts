import type { SubscriptionRequest, SubscriptionTier } from '@/lib/index';

const STORAGE_KEY = 'halaqmap_subscription_requests_v1';

export function loadStoredSubscriptionRequests(): SubscriptionRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SubscriptionRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendSubscriptionRequest(request: SubscriptionRequest): void {
  const prev = loadStoredSubscriptionRequests();
  prev.unshift(request);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
  window.dispatchEvent(new Event('halaqmap-subscription-requests-changed'));
}

export function generateRegistrationOrderId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `HM-${y}${m}${day}-${rand}`;
}

export function formatSubmissionDateTimeAr(): string {
  return new Date().toLocaleString('ar-SA-u-ca-gregory', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function saPhoneToInternational(local: string): string {
  const s = local.trim().replace(/\s/g, '');
  if (s.startsWith('+')) return s;
  if (s.startsWith('05') && s.length === 10) return `+966${s.slice(1)}`;
  return s;
}

const LAST_ORDER_SESSION_KEY = 'halaqmap_register_last_order';

export interface RegisterOrderConfirmation {
  orderId: string;
  submittedAtLabel: string;
  submittedAtIso: string;
  email: string;
  shopName: string;
  tier: SubscriptionTier;
  paymentMethod: 'monthly' | 'bank_transfer';
  receiptFileName?: string;
  summaryForDownload: string;
  mailtoBodyShort: string;
}

export function saveLastOrderConfirmation(data: RegisterOrderConfirmation): void {
  sessionStorage.setItem(LAST_ORDER_SESSION_KEY, JSON.stringify(data));
}

export function loadLastOrderConfirmation(): RegisterOrderConfirmation | null {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RegisterOrderConfirmation;
  } catch {
    return null;
  }
}

export function clearLastOrderConfirmation(): void {
  sessionStorage.removeItem(LAST_ORDER_SESSION_KEY);
}
