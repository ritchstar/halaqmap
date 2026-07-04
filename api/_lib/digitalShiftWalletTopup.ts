/**
 * كتالوج شحن محفظة المناوب الرقمي (Digital Shift Wallet Top-up) — مصدر الحقيقة على الخادم.
 *
 * القاعدة المعتمدة (الضريبة فوق السعر — VAT exclusive):
 *  · القيمة الأساسية (baseHalalas) هي ما يُضاف للرصيد كاملاً.
 *  · تُضاف ضريبة القيمة المضافة 15% فوق الأساسي، فيدفع الحلاق chargedHalalas = الأساسي × 1.15.
 *  · العميل يتحمّل الضريبة؛ إيراد المنصّة الصافي = الأساسي، وتُورَّد الضريبة لهيئة الزكاة والضريبة.
 *  · كل رد آلي يخصم DIGITAL_SHIFT_REPLY_COST_HALALAS (150 هللة).
 *  · الرصيد الترحيبي للتفعيلات الجديدة = DIGITAL_SHIFT_WALLET_SEED_HALALAS (هدية بلا ضريبة).
 */

/** تكلفة الرد الآلي الواحد (هللات) — يجب أن تطابق DIGITAL_SHIFT_REPLY_COST_HALALAS. */
export const WALLET_TOPUP_REPLY_COST_HALALAS = 150;

/** نسبة ضريبة القيمة المضافة المعتمدة (%). */
export const WALLET_TOPUP_VAT_PERCENT = 15;

/** الرصيد الترحيبي (هللات) لأي محفظة جديدة — 15 ر.س ≈ 10 ردود (هدية بلا ضريبة). */
export const DIGITAL_SHIFT_WALLET_SEED_HALALAS = 1500;

export type WalletTopupPackage = {
  /** رمز الباقة — يُخزَّن في metadata.wallet_sku ويُدرج كـ SKU مرجعي. */
  sku: 'wallet_topup_25' | 'wallet_topup_50' | 'wallet_topup_100';
  /** القيمة الأساسية بالهللات — تُضاف للرصيد كاملة (قبل الضريبة). */
  baseHalalas: number;
  /** المبلغ المدفوع فعلياً عبر ميسر بالهللات = الأساسي + 15% ضريبة. */
  chargedHalalas: number;
  /** تسمية عربية مختصرة. */
  labelAr: string;
};

/** الباقات المعتمدة — الحلاق يدفع chargedHalalas (أساسي + ضريبة) ويُضاف الأساسي كاملاً للرصيد. */
export const WALLET_TOPUP_PACKAGES: readonly WalletTopupPackage[] = [
  { sku: 'wallet_topup_25', baseHalalas: 2500, chargedHalalas: 2875, labelAr: 'باقة شحن 25 ر.س' },
  { sku: 'wallet_topup_50', baseHalalas: 5000, chargedHalalas: 5750, labelAr: 'باقة شحن 50 ر.س' },
  { sku: 'wallet_topup_100', baseHalalas: 10000, chargedHalalas: 11500, labelAr: 'باقة شحن 100 ر.س' },
] as const;

/** الرصيد الصافي المُضاف (هللات) = الأساسي، بعد فصل الضريبة عن المبلغ المدفوع (المدفوع ÷ 1.15). */
export function netCreditHalalasFromCharged(chargedHalalas: number): number {
  const gross = Math.trunc(chargedHalalas);
  if (!Number.isFinite(gross) || gross <= 0) return 0;
  const divisor = 1 + WALLET_TOPUP_VAT_PERCENT / 100;
  return Math.round(gross / divisor);
}

/** عدد الردود التقريبي من رصيد بالهللات. */
export function repliesFromHalalas(balanceHalalas: number): number {
  const b = Math.trunc(balanceHalalas);
  if (!Number.isFinite(b) || b <= 0) return 0;
  return Math.floor(b / WALLET_TOPUP_REPLY_COST_HALALAS);
}

/** إيجاد الباقة عبر SKU. */
export function walletTopupPackageBySku(sku: string): WalletTopupPackage | null {
  const s = String(sku ?? '').trim().toLowerCase();
  return WALLET_TOPUP_PACKAGES.find((p) => p.sku === s) ?? null;
}

/** إيجاد الباقة عبر المبلغ المدفوع (هللات) — للتحقق من الـ webhook. */
export function walletTopupPackageByChargedHalalas(chargedHalalas: number): WalletTopupPackage | null {
  const amount = Math.trunc(chargedHalalas);
  return WALLET_TOPUP_PACKAGES.find((p) => p.chargedHalalas === amount) ?? null;
}
