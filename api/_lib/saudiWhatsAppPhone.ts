/**
 * تطبيع رقم جوال سعودي لروابط واتساب — مطابق لـ src/lib/saudiWhatsAppPhone.ts
 */

function toAsciiDigits(raw: string): string {
  return String(raw ?? '')
    .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (c) => String(c.charCodeAt(0) - 0x06f0));
}

export function normalizeSaudiMobileForWa(raw: string): string | null {
  let d = toAsciiDigits(raw).replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('9660') && d.length >= 13 && d.charAt(4) === '5') {
    d = `966${d.slice(4)}`;
  }
  if (d.startsWith('966')) {
    const national = d.slice(3);
    if (national.startsWith('5') && national.length >= 9) {
      return `966${national.slice(0, 9)}`;
    }
    return null;
  }
  if (d.startsWith('05') && d.length >= 10) {
    const national = d.slice(1, 10);
    if (national.startsWith('5') && national.length === 9) return `966${national}`;
    return null;
  }
  if (d.startsWith('5') && d.length >= 9) {
    return `966${d.slice(0, 9)}`;
  }
  return null;
}
