/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أرقام خليجية وعربية: الدولة أولاً ثم الرقم المحلي دون صفر البداية.
 */
export const ARAB_DIAL_CODES = [
  { iso: 'SA', dial: '966', nameAr: 'السعودية' },
  { iso: 'AE', dial: '971', nameAr: 'الإمارات' },
  { iso: 'KW', dial: '965', nameAr: 'الكويت' },
  { iso: 'QA', dial: '974', nameAr: 'قطر' },
  { iso: 'BH', dial: '973', nameAr: 'البحرين' },
  { iso: 'OM', dial: '968', nameAr: 'عُمان' },
  { iso: 'EG', dial: '20', nameAr: 'مصر' },
  { iso: 'JO', dial: '962', nameAr: 'الأردن' },
  { iso: 'IQ', dial: '964', nameAr: 'العراق' },
  { iso: 'YE', dial: '967', nameAr: 'اليمن' },
  { iso: 'PS', dial: '970', nameAr: 'فلسطين' },
  { iso: 'LB', dial: '961', nameAr: 'لبنان' },
  { iso: 'SY', dial: '963', nameAr: 'سوريا' },
  { iso: 'SD', dial: '249', nameAr: 'السودان' },
  { iso: 'MA', dial: '212', nameAr: 'المغرب' },
  { iso: 'DZ', dial: '213', nameAr: 'الجزائر' },
  { iso: 'TN', dial: '216', nameAr: 'تونس' },
  { iso: 'LY', dial: '218', nameAr: 'ليبيا' },
] as const;

export const DEFAULT_ARAB_DIAL = '966';

function toAsciiDigits(raw: string): string {
  return String(raw ?? '')
    .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (c) => String(c.charCodeAt(0) - 0x06f0));
}

export function digitsOnly(raw: string): string {
  return toAsciiDigits(raw).replace(/\D/g, '');
}

export function composeArabMobileDigits(dial: string, localRaw: string): string | null {
  const country = digitsOnly(dial);
  let local = digitsOnly(localRaw);
  if (!country) return null;
  if (local.startsWith('00')) local = local.slice(2);
  if (local.startsWith(country) && local.length > country.length + 6) {
    return local;
  }
  if (local.startsWith('0')) local = local.slice(1);
  if (local.length < 7 || local.length > 11) return null;
  const combined = `${country}${local}`;
  if (combined.length < 10 || combined.length > 15) return null;
  return combined;
}

/** يقبل +9665… أو 05xxxxxxxx أو دولة+محلي. يُرجع أرقاماً بلا +. */
export function normalizeArabMobileDigits(raw: string, dial = DEFAULT_ARAB_DIAL): string | null {
  let d = digitsOnly(raw);
  if (!d) return composeArabMobileDigits(dial, raw);
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('966') && d.length >= 12) return d.slice(0, 12);
  if (d.startsWith('05') && d.length >= 10) return composeArabMobileDigits('966', d);
  if (d.startsWith('5') && d.length === 9 && dial === '966') return `966${d}`;
  if (d.length >= 10 && d.length <= 15) return d;
  return composeArabMobileDigits(dial, raw);
}

export function maskArabMobileDisplay(digits: string): string {
  const n = digitsOnly(digits);
  if (n.length < 8) return '••• •••••';
  if (n.startsWith('966') && n.length >= 12) {
    const local = `0${n.slice(3, 12)}`;
    return `${local.slice(0, 2)}••• ••${local.slice(-3)}`;
  }
  return `${n.slice(0, 4)}•••${n.slice(-3)}`;
}
