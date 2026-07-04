/**
 * كتالوج شحن محفظة المناوب الرقمي — واجهة العميل (لوحة الحلاق وصفحة الدفع).
 *
 * يطابق api/_lib/digitalShiftWalletTopup.ts (الضريبة فوق السعر ومحكومة بعلم ZATCA):
 *  · القيمة الأساسية (baseSar) هي ما يُضاف للرصيد كاملاً — ثابتة.
 *  · عند تفعيل ض.ق.م يدفع الحلاق الأساسي + النسبة فوقه؛ وإلا يدفع الأساسي فقط.
 *  · مصدر حالة الضريبة على الواجهة = `/api/public-payment-page-config` (vatEnabled/vatPercent).
 */

import { DIGITAL_SHIFT_REPLY_COST_HALALAS } from '@/config/digitalShiftAssistant';

/** النسبة المُجهَّزة المرجعية (canonical) — تطابق ZATCA_PREPARED_VAT_RATE_PERCENT. */
export const WALLET_TOPUP_VAT_PERCENT = 15;

/** إعداد الضريبة المشتق من القاعدة على الواجهة. */
export type WalletVatConfig = { enabled: boolean; percent: number };

/** الرصيد الترحيبي (هللات) لأي محفظة جديدة — 15 ر.س ≈ 10 ردود. */
export const DIGITAL_SHIFT_WALLET_SEED_HALALAS = 1500;

export type WalletTopupPackageId = 'wallet_topup_25' | 'wallet_topup_50' | 'wallet_topup_100';

export type WalletTopupPackage = {
  sku: WalletTopupPackageId;
  /** القيمة الأساسية بالريال (تُضاف للرصيد كاملة، قبل الضريبة). */
  baseSar: number;
  /** القيمة الأساسية بالهللات (تُضاف للرصيد كاملة). */
  baseHalalas: number;
  /** المبلغ المدفوع فعلياً عبر ميسر بالهللات = الأساسي + 15% ضريبة. */
  chargedHalalas: number;
  labelAr: string;
  /** شارة اختيارية (مثل «الأكثر توفيراً»). */
  badgeAr?: string;
};

export const WALLET_TOPUP_PACKAGES: readonly WalletTopupPackage[] = [
  { sku: 'wallet_topup_25', baseSar: 25, baseHalalas: 2500, chargedHalalas: 2875, labelAr: 'باقة 25 ر.س' },
  { sku: 'wallet_topup_50', baseSar: 50, baseHalalas: 5000, chargedHalalas: 5750, labelAr: 'باقة 50 ر.س', badgeAr: 'الأكثر اختياراً' },
  { sku: 'wallet_topup_100', baseSar: 100, baseHalalas: 10000, chargedHalalas: 11500, labelAr: 'باقة 100 ر.س', badgeAr: 'الأوفر' },
] as const;

/** الرصيد الصافي المُضاف (هللات) = الأساسي، بعد فصل الضريبة عن المبلغ المدفوع (المدفوع ÷ 1.15). */
export function netCreditHalalasFromCharged(chargedHalalas: number): number {
  const gross = Math.trunc(chargedHalalas);
  if (!Number.isFinite(gross) || gross <= 0) return 0;
  return Math.round(gross / (1 + WALLET_TOPUP_VAT_PERCENT / 100));
}

/**
 * المبلغ المدفوع فعلياً (هللات) وفق إعداد الضريبة الحيّ:
 * مُفعّلة ← الأساسي + النسبة فوقه؛ مطفأة ← الأساسي كما هو.
 */
export function chargedHalalasForVat(baseHalalas: number, cfg: WalletVatConfig | null | undefined): number {
  const base = Math.trunc(baseHalalas);
  if (!Number.isFinite(base) || base <= 0) return 0;
  if (!cfg || !cfg.enabled || cfg.percent <= 0) return base;
  return Math.round(base * (1 + cfg.percent / 100));
}

/** عدد الردود التقريبي من رصيد بالهللات. */
export function repliesFromHalalas(balanceHalalas: number): number {
  const b = Math.trunc(balanceHalalas);
  if (!Number.isFinite(b) || b <= 0) return 0;
  return Math.floor(b / DIGITAL_SHIFT_REPLY_COST_HALALAS);
}

/** إيجاد الباقة عبر SKU. */
export function walletTopupPackageBySku(sku: string): WalletTopupPackage | null {
  const s = String(sku ?? '').trim().toLowerCase();
  return WALLET_TOPUP_PACKAGES.find((p) => p.sku === s) ?? null;
}
