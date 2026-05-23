import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function getListingLicenseVoucherPepper(): string | null {
  const s = (process.env.LISTING_LICENSE_VOUCHER_PEPPER || '').trim();
  return s.length >= 16 ? s : null;
}

/** تنسيق: HM-LIC-XXXX-XXXX-XXXX (بدون أحرف مربكة) */
export function generateListingLicenseVoucherCode(): string {
  const seg = (n: number) => {
    const buf = randomBytes(n);
    let out = '';
    for (let i = 0; i < n; i += 1) {
      out += CODE_ALPHABET[buf[i]! % CODE_ALPHABET.length];
    }
    return out;
  };
  return `HM-LIC-${seg(4)}-${seg(4)}-${seg(4)}`;
}

export function normalizeVoucherCodeInput(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function fingerprintListingLicenseCode(code: string, pepper: string): string {
  return createHmac('sha256', pepper).update(normalizeVoucherCodeInput(code)).digest('hex');
}

export function verifyListingLicenseCodeFingerprint(
  code: string,
  pepper: string,
  storedFingerprint: string,
): boolean {
  const expected = fingerprintListingLicenseCode(code, pepper);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(storedFingerprint, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
