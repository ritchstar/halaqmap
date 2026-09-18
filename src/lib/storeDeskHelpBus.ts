/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إشارة بسيطة لفتح لوحة المساعدة العائمة (StoreDeskHelpSupport) من مكوّن آخر
 * في نفس صفحة اللوحة (مثل بطاقة «دليل القيادة» بعد اكتمال التفعيل)، دون ربط
 * حالة (state) بين المكوّنين. لا تخزين، لا علم اكتمال — مجرد حدث نافذة عابر.
 */
const OPEN_EVENT = 'store-desk-help:open';

export function openStoreDeskHelp(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onStoreDeskHelpOpenRequest(handler: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
