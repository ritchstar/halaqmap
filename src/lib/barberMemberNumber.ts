/** رقم عضوية الحلاق على المنصة (عرض موحّد 6 أرقام، يدعم حتى 999999). */
export function formatBarberMemberNumber(n: number | null | undefined): string | null {
  if (n == null || !Number.isFinite(Number(n))) return null;
  const v = Math.floor(Number(n));
  if (v < 1 || v > 999999) return String(v);
  return String(v).padStart(6, '0');
}
