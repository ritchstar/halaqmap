/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رسائل فشل جلب بيانات لوحة الإدارة — بدون إزعاج toast متكرر عند 429.
 */
import { toast } from '@/components/ui/sonner';

const RATE_LIMIT_TOAST_COOLDOWN_MS = 20_000;
let lastRateLimitToastAt = 0;

export function isAdminRateLimitedMessage(error: string): boolean {
  const normalized = error.trim().toLowerCase();
  return (
    normalized.includes('429') ||
    normalized.includes('too many requests') ||
    normalized.includes('rate limit')
  );
}

export function formatAdminFetchError(error: string): string {
  if (isAdminRateLimitedMessage(error)) {
    return 'طلبات كثيرة على الخادم — انتظر نحو 30 ثانية ثم حدّث الصفحة.';
  }
  if (/^http \d{3}$/i.test(error.trim())) {
    return `تعذر الاتصال بالخادم (${error.trim().toUpperCase()}).`;
  }
  return error;
}

export type AdminPanelFetchFailureOptions = {
  /** تحميل تلقائي عند فتح اللوحة أو polling — لا toast */
  background?: boolean;
  /** المستخدم ضغط زر تحديث/تنفيذ */
  userInitiated?: boolean;
};

export function reportAdminPanelFetchFailure(
  error: string,
  options: AdminPanelFetchFailureOptions = {},
): string {
  const message = formatAdminFetchError(error);
  const background = options.background && !options.userInitiated;

  if (background) {
    return message;
  }

  if (isAdminRateLimitedMessage(error)) {
    const now = Date.now();
    if (now - lastRateLimitToastAt < RATE_LIMIT_TOAST_COOLDOWN_MS) {
      return message;
    }
    lastRateLimitToastAt = now;
  }

  toast.error(message);
  return message;
}

/** تأخير بسيط لتوزيع طلبات overview على دفعات */
export function adminOverviewBootDelayMs(index: number): number {
  return Math.max(0, index) * 350;
}
