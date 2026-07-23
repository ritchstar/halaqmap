/**
 * تطبيع رقم جوال سعودي لروابط واتساب `wa.me`.
 * wa.me يرفض الصيغة المحلية `05xxxxxxxx` ويظهر «الرقم لا يستخدم واتساب».
 */

function toAsciiDigits(raw: string): string {
  return String(raw ?? '')
    .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (c) => String(c.charCodeAt(0) - 0x06f0));
}

/** أرقام فقط بعد تحويل الأرقام العربية/الفارسية. */
export function extractPhoneDigits(raw: string): string {
  return toAsciiDigits(raw).replace(/\D/g, '');
}

/**
 * يعيد `9665xxxxxxxx` (12 رقماً) أو null إن تعذّر التطبيع الآمن.
 */
export function normalizeSaudiMobileForWa(raw: string): string | null {
  let d = extractPhoneDigits(raw);
  if (!d) return null;

  // 009665... → 9665...
  if (d.startsWith('00')) d = d.slice(2);

  // خطأ شائع: 96605xxxxxxxx (صفر بعد رمز الدولة)
  if (d.startsWith('9660') && d.length >= 13 && d.charAt(4) === '5') {
    d = `966${d.slice(4)}`;
  }

  // 9665xxxxxxxx…
  if (d.startsWith('966')) {
    const national = d.slice(3);
    if (national.startsWith('5') && national.length >= 9) {
      return `966${national.slice(0, 9)}`;
    }
    return null;
  }

  // 05xxxxxxxx
  if (d.startsWith('05') && d.length >= 10) {
    const national = d.slice(1, 10);
    if (national.startsWith('5') && national.length === 9) return `966${national}`;
    return null;
  }

  // 5xxxxxxxx (بدون صفر)
  if (d.startsWith('5') && d.length >= 9) {
    return `966${d.slice(0, 9)}`;
  }

  return null;
}

export function isValidSaudiWhatsAppMobile(raw: string): boolean {
  return normalizeSaudiMobileForWa(raw) != null;
}

/** رابط محادثة واتساب — null إن الرقم غير صالح. */
export function buildWhatsAppChatHref(phone: string, prefillText?: string): string | null {
  const n = normalizeSaudiMobileForWa(phone);
  if (!n) return null;
  const base = `https://wa.me/${n}`;
  const text = prefillText?.trim();
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

/** لعرض/تخزين E.164 مع +. */
export function toSaudiE164Plus(raw: string): string | null {
  const n = normalizeSaudiMobileForWa(raw);
  return n ? `+${n}` : null;
}
