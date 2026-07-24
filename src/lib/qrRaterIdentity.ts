/**
 * معرّف ثابت لكل متصفح لتقييمات QR — يمنع إعادة التقييم من نفس الجهاز لنفس الصالون.
 * لا يُرسل كبيانات شخصية؛ يُجزَّأ على الخادم (HMAC).
 */

const INSTANCE_KEY = 'halaqmap.qrRater.instanceId.v1';

function ratedKey(barberId: string): string {
  return `halaqmap.qrRater.submitted.v1:${barberId}`;
}

function newUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateQrRaterInstanceId(): string {
  if (typeof localStorage === 'undefined') return newUuid();
  try {
    const existing = localStorage.getItem(INSTANCE_KEY)?.trim() || '';
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        existing,
      )
    ) {
      return existing.toLowerCase();
    }
    const next = newUuid().toLowerCase();
    localStorage.setItem(INSTANCE_KEY, next);
    return next;
  } catch {
    return newUuid().toLowerCase();
  }
}

export function hasLocalQrRatedMark(barberId: string): boolean {
  if (typeof localStorage === 'undefined' || !barberId) return false;
  try {
    return localStorage.getItem(ratedKey(barberId)) === '1';
  } catch {
    return false;
  }
}

export function markLocalQrRated(barberId: string): void {
  if (typeof localStorage === 'undefined' || !barberId) return;
  try {
    localStorage.setItem(ratedKey(barberId), '1');
  } catch {
    /* private mode */
  }
}
