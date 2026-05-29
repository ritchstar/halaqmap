/** Normalize Saudi mobile to 9665xxxxxxxx (12 digits). Mirrors api/_lib/partnerProspectScan. */
export function normalizePartnerProspectPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('966') && digits.length >= 12) return digits.slice(0, 12);
  if (digits.startsWith('05') && digits.length >= 10) return `966${digits.slice(1, 10)}`;
  if (digits.startsWith('5') && digits.length >= 9) return `966${digits.slice(0, 9)}`;
  if (digits.length >= 10) return digits;
  return null;
}
