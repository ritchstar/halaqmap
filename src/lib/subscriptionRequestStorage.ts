import type { SubscriptionRequest, SubscriptionTier } from '@/lib/index';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import {
  fetchRegistrationSubmissionsFromRemote,
  insertRegistrationSubmissionRemote,
} from '@/lib/registrationSubmissionsRemote';

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

export function removeStoredSubscriptionRequest(rowId: string): void {
  try {
    const prev = loadStoredSubscriptionRequests();
    const next = prev.filter((r) => r.id !== rowId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('halaqmap-subscription-requests-changed'));
  } catch {
    /* ignore local storage failures */
  }
}

/** دمج الطلبات من السحابة (إن وُجدت) ثم المحلية دون تكرار id (السحابة أولاً). */
export async function loadMergedSubscriptionRequests(): Promise<SubscriptionRequest[]> {
  const remote = await fetchRegistrationSubmissionsFromRemote();
  const local = loadStoredSubscriptionRequests();
  const seen = new Set(remote.map((r) => r.id));
  const out = [...remote];
  for (const r of local) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      out.push(r);
    }
  }
  return out;
}

/**
 * عند تهيئة Supabase: يجب نجاح الإدراج في قاعدة البيانات قبل النسخ المحلي أو اعتبار الطلب مكتملاً.
 * بدون تهيئة: يُحفظ محلياً فقط (بيئة تطوير أو نشر بدون متغيرات).
 */
export async function appendSubscriptionRequest(
  request: SubscriptionRequest
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (isSupabaseConfigured()) {
    const remote = await insertRegistrationSubmissionRemote(request);
    if (!remote.ok) {
      return remote;
    }
  }

  try {
    const prev = loadStoredSubscriptionRequests();
    prev.unshift(request);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
    window.dispatchEvent(new Event('halaqmap-subscription-requests-changed'));
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[halaqmap] فشل النسخ المحلي بعد نجاح السيرفر:', e);
    }
    /* لا نُرجع فشلاً إن كان السيرفر قد قبل الطلب */
  }

  return { ok: true };
}

export function generateRegistrationOrderId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const datePart = `${y}${m}${day}`;
  /** يجب أن يطابق سياسة التخزين في 17_registration_uploads_storage.sql: 6 أحرف من [A-Z0-9] */
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `HM-${datePart}-${suffix}`;
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
