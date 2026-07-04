/**
 * حاسبة ض.ق.م + إعداد محلّي قديم (localStorage).
 *
 * تنبيه مهم — مصدر الحقيقة تغيّر:
 * لم يَعُد مفتاح localStorage `halaqmap_platform_vat_v1` مرجعاً رسمياً لعرض/فرض
 * ض.ق.م على العملاء. المصدر الوحيد الآن = علم ZATCA على الخادم
 * (`platform_zatca_tax_advisor_state.tax_enabled` + `cached_vat_config.ratePercent`)
 * المُعرَّض عبر `/api/public-payment-page-config` (`vatEnabled`/`vatPercent`)،
 * ويُقرأ على الواجهة عبر `usePlatformVatConfigRemote`.
 *
 * تبقى `getPlatformVatSettings`/`savePlatformVatSettings` للتوافق الرجعي فقط
 * (معاينة إدارية محلية ومرآة تفعيل ZATCA) ولا تحكم ما يراه/يدفعه العميل.
 * دالّتا الحساب `calcVatBreakdown`/`calcVatAmountSar` نقيّتان وتُغذّى بالعلم من القاعدة.
 *
 * الافتراضي: معطّلة (عمل حر / غير خاضع) — المبالغ المعروضة = قيمة حزمة الرخصة الرقمية فقط.
 */

const STORAGE_KEY = 'halaqmap_platform_vat_v1';

export type PlatformVatSettings = {
  enabled: boolean;
  /** نسبة مئوية، مثال 15 = 15% */
  ratePercent: number;
};

const DEFAULT_SETTINGS: PlatformVatSettings = {
  enabled: false,
  ratePercent: 15,
};

function clampRate(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 50) return 50;
  return Math.round(n * 100) / 100;
}

function parseStored(raw: string | null): PlatformVatSettings | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<PlatformVatSettings>;
    if (typeof o.enabled !== 'boolean') return null;
    return { enabled: o.enabled, ratePercent: clampRate(Number(o.ratePercent) || DEFAULT_SETTINGS.ratePercent) };
  } catch {
    return null;
  }
}

/** @deprecated معاينة محلية فقط — ليست مصدر حقيقة ض.ق.م. استخدم `usePlatformVatConfigRemote`. */
export function getPlatformVatSettings(): PlatformVatSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
  const fromStore = parseStored(localStorage.getItem(STORAGE_KEY));
  if (fromStore) return fromStore;

  const envEnabled = import.meta.env.VITE_PLATFORM_VAT_DEFAULT_ENABLED;
  const envRate = import.meta.env.VITE_PLATFORM_VAT_DEFAULT_PERCENT;
  if (envEnabled === 'true' || envEnabled === '1') {
    return {
      enabled: true,
      ratePercent: clampRate(Number(envRate) || DEFAULT_SETTINGS.ratePercent),
    };
  }
  return { ...DEFAULT_SETTINGS };
}

/** @deprecated مرآة محلية للتفعيل الإداري فقط — لا تُحدِّث ما يراه/يدفعه العميل (المصدر: علم ZATCA). */
export function savePlatformVatSettings(next: PlatformVatSettings): void {
  const normalized: PlatformVatSettings = {
    enabled: next.enabled,
    ratePercent: clampRate(next.ratePercent),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent('halaqmap-vat-settings'));
}

/** مبلغ الضريبة بالهللة تقريباً ثم تقريب لأقرب ريال (عرض بسيط) */
export function calcVatAmountSar(subtotalSar: number, settings: PlatformVatSettings): number {
  if (!settings.enabled || settings.ratePercent <= 0) return 0;
  const base = Math.max(0, subtotalSar);
  return Math.round((base * settings.ratePercent) / 100);
}

export function calcVatBreakdown(subtotalSar: number, settings: PlatformVatSettings) {
  const vat = calcVatAmountSar(subtotalSar, settings);
  return {
    subtotal: subtotalSar,
    vat,
    total: subtotalSar + vat,
  };
}

/** فقرة سياسة الأسعار للصفحة العامة */
export function getSubscriptionPricingVatClauseAr(settings: PlatformVatSettings): string {
  if (!settings.enabled) {
    return 'الأسعار المعروضة بالريال السعودي تمثل قيمة حزمة رخصة النفاذ الرقمية (نظام الاستجابة الذكية) فقط، دون ضريبة قيمة مضافة في الوقت الحالي.';
  }
  return `الأسعار المعروضة بالريال السعودي تمثل قيمة حزمة الرخصة الرقمية الأساسية؛ تُضاف ضريبة القيمة المضافة بنسبة ${settings.ratePercent}% على مبلغ الدفع عند إتمامه، وفق تفعيل الإدارة ويمكن تعديل النسبة لاحقاً بما يتوافق مع الأنظمة.`;
}
