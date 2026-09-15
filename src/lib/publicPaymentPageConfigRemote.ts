/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { paymentPageHttpErrorAr } from '@/lib/paymentPageHttpError';

const API = '/api/public-payment-page-config';
const SESSION_CACHE_KEY = 'hm-public-payment-page-config-v1';
const SESSION_CACHE_TTL_MS = 90_000;

export type PublicPaymentPageConfig = {
  ok: boolean;
  preferredGateway: 'MOYASAR' | 'SAB';
  displayPaymentMode: 'test' | 'live';
  enableMoyasarCard: boolean;
  enableSabGateway: boolean;
  /** علم ض.ق.م الحيّ (مصدر الحقيقة: حالة ZATCA) — مطفأ افتراضياً. */
  vatEnabled: boolean;
  /** النسبة المئوية المعتمدة للضريبة (مثال 15). */
  vatPercent: number;
  /** commit النشر الحيّ على الخادم — لمقارنة كاش PWA على صفحة الدفع. */
  buildCommit?: string | null;
  error?: string;
};

/** النسبة المُجهَّزة الافتراضية عند تعذّر القراءة (canonical). */
const DEFAULT_VAT_PERCENT = 15;

function parseVatPercent(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number.parseFloat(String(raw ?? ''));
  if (!Number.isFinite(n) || n < 0) return DEFAULT_VAT_PERCENT;
  if (n > 50) return 50;
  return Math.round(n * 100) / 100;
}

type CachedPayload = { at: number; config: PublicPaymentPageConfig };

function readSessionCache(maxAgeMs = SESSION_CACHE_TTL_MS): PublicPaymentPageConfig | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (!parsed?.config?.ok || Date.now() - parsed.at > maxAgeMs) return null;
    return parsed.config;
  } catch {
    return null;
  }
}

function writeSessionCache(config: PublicPaymentPageConfig): void {
  if (typeof sessionStorage === 'undefined' || !config.ok) return;
  try {
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({ at: Date.now(), config }));
  } catch {
    /* ignore */
  }
}

function normalizeFetchError(status: number, json: Record<string, unknown>): string {
  const fromJson = typeof json.error === 'string' ? json.error.trim() : '';
  const code = fromJson || `HTTP ${status}`;
  return paymentPageHttpErrorAr(code) || paymentPageHttpErrorAr(String(status)) || code;
}

function parseSuccessJson(json: Record<string, unknown>): PublicPaymentPageConfig {
  const gw = String(json.preferredGateway || 'MOYASAR').toUpperCase() === 'SAB' ? 'SAB' : 'MOYASAR';
  const mode = String(json.displayPaymentMode || 'test').toLowerCase() === 'live' ? 'live' : 'test';
  return {
    ok: true,
    preferredGateway: gw,
    displayPaymentMode: mode,
    enableMoyasarCard: json.enableMoyasarCard !== false,
    enableSabGateway: json.enableSabGateway === true,
    vatEnabled: json.vatEnabled === true,
    vatPercent: parseVatPercent(json.vatPercent),
    buildCommit: typeof json.buildCommit === 'string' ? json.buildCommit.trim() || null : null,
  };
}

async function fetchOnce(): Promise<{ res: Response; json: Record<string, unknown> }> {
  const res = await fetch(API, { method: 'GET', cache: 'no-store' });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { res, json };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** إعدادات الدفع الظاهرة للعامة — بدون مصادقة؛ تعود للقيم الافتراضية عند فشل الشبكة. */
export async function fetchPublicPaymentPageConfig(): Promise<PublicPaymentPageConfig> {
  const cached = readSessionCache();
  if (cached) return cached;

  let lastError = 'network_error';

  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (attempt > 0) {
        await sleep(attempt === 1 ? 800 : 1800);
      }

      const { res, json } = await fetchOnce();
      if (res.ok && json.ok === true) {
        const config = parseSuccessJson(json);
        writeSessionCache(config);
        return config;
      }

      lastError = normalizeFetchError(res.status, json);
      if (res.status !== 429 && res.status !== 503) {
        break;
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'network_error';
    lastError = paymentPageHttpErrorAr(msg) || msg;
  }

  const stale = readSessionCache(10 * 60_000);
  if (stale) return stale;
  return fallbackConfig(lastError);
}

function fallbackConfig(error: string): PublicPaymentPageConfig {
  return {
    ok: false,
    preferredGateway: 'MOYASAR',
    displayPaymentMode: 'test',
    enableMoyasarCard: true,
    enableSabGateway: false,
    vatEnabled: false,
    vatPercent: DEFAULT_VAT_PERCENT,
    error,
  };
}
