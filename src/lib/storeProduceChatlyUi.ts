/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تفعيل واجهة Chatly الهندسية لخضارنا1 — بلا تغيير منطق الطلب أو الدفع.
 */
import { STORE_PRODUCE_LIVE_LAB_TOKEN } from '@/config/storeProduceLive';

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

/** عند تعطيل التعميم: معاينة المختبر فقط إن كان `VITE_STORE_PRODUCE_CHATLY_UI` مفعّلاً. */
export const STORE_PRODUCE_CHATLY_UI_LAB_DEFAULT = envEnabled('VITE_STORE_PRODUCE_CHATLY_UI', true);

/** افتراضياً: كل رموز خضارنا1. `VITE_STORE_PRODUCE_CHATLY_UI_ALL=false` للرجوع الطارئ. */
export const STORE_PRODUCE_CHATLY_UI_ALL = envEnabled('VITE_STORE_PRODUCE_CHATLY_UI_ALL', true);

export function isProduceChatlyUi(token: string): boolean {
  if (STORE_PRODUCE_CHATLY_UI_ALL) return true;
  if (!STORE_PRODUCE_CHATLY_UI_LAB_DEFAULT) return false;
  return token.trim() === STORE_PRODUCE_LIVE_LAB_TOKEN;
}
