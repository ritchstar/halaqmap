/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * منطق ثابت لصيغ التاريخ والأرقام في المنصة:
 * - العربية واجهةً واتجاهاً
 * - التقويم الميلادي (Gregorian)
 * - الأرقام اللاتينية 0–9 فقط (لا أرقام هندية عربية ٠–٩)
 */
/** لغة العرض المعتمدة للمنصة — عربي + ميلادي + أرقام لاتينية */
export const PLATFORM_AR_LOCALE = 'ar-SA-u-ca-gregory-nu-latn' as const;

/** قيمة lang لعناصر النموذج الأصلية (تاريخ/وقت/رقم) */
export const PLATFORM_FORM_LANG = PLATFORM_AR_LOCALE;

const ARABIC_INDIC = /[\u0660-\u0669]/g;
const EXTENDED_ARABIC_INDIC = /[\u06f0-\u06f9]/g;

/** يحوّل أي أرقام عربية-هندية أو فارسية إلى 0–9 */
export function toWesternDigits(raw: string | number | null | undefined): string {
  return String(raw ?? '')
    .replace(ARABIC_INDIC, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(EXTENDED_ARABIC_INDIC, (c) => String(c.charCodeAt(0) - 0x06f0));
}

/**
 * تنسيق رقم للعرض — دائماً 0–9 حتى لو تجاهل المتصفح/الخط nu-latn.
 * نستخدم en-US للأرقام الصرفة ثم نمرّر toWesternDigits احتياطاً.
 */
export function formatPlatformNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  if (!Number.isFinite(value)) return '—';
  return toWesternDigits(new Intl.NumberFormat('en-US', options).format(value));
}

/** مبلغ ر.س بمنزلتين عشريتين وأرقام لاتينية */
export function formatPlatformMoney(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return '—';
  return toWesternDigits(value.toFixed(fractionDigits));
}

export function formatPlatformDate(
  value: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (value == null || value === '') return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(d.getTime())) return '—';
  // أسماء الأشهر عربية + أرقام لاتينية مفروضة بعد التنسيق
  return toWesternDigits(new Intl.DateTimeFormat(PLATFORM_AR_LOCALE, options).format(d));
}

export function formatPlatformDateTime(
  value: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  return formatPlatformDate(value, {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  });
}

export function formatPlatformTime(
  value: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  return formatPlatformDate(value, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  });
}

/** يطبّع أي نص معروض (ردود المناوب، الشارات، …) ليبقى بأرقام 0–9 */
export function withWesternDigits(value: string | number | null | undefined): string {
  return toWesternDigits(value);
}

/** يضبط lang على جذر المستند ليطابق سياسة الأرقام الميلادية للمنصة */
export function applyPlatformDocumentLocale(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (root.getAttribute('lang') !== PLATFORM_AR_LOCALE) {
    root.setAttribute('lang', PLATFORM_AR_LOCALE);
  }
  if (root.getAttribute('dir') !== 'rtl') {
    root.setAttribute('dir', 'rtl');
  }
}
