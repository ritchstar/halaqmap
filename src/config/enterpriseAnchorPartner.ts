/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * برنامج الشريك المرجعي — بنية عامة.
 * شريك صالون العنوان (al_enwan) أُزيل نهائياً؛ لا بذرة ولا واجهة أدمن له.
 * انظر الهجرة 208_remove_al_enwan_anchor_partner.sql.
 */

/** مدة المنحة الافتراضية لكل فرع من تاريخ تفعيله (يوماً). */
export const ANCHOR_LISTING_DAYS = 180;

/** SKU الرخصة الماسية 180 يوماً في listing_license_products. */
export const ANCHOR_PRODUCT_SKU = 'diamond_180' as const;

/**
 * ائتمان تشغيلي لمحفظة المناوب عند تفعيل المقعد (هللات) — قيمة افتراضية للشركاء الجدد فقط.
 */
export const ANCHOR_WALLET_SEED_HALALAS = 5000;

/** تنبيه انتهاء قبل N يوماً. */
export const ANCHOR_EXPIRY_WARN_DAYS = 30;

export type AnchorWalletFundingPolicy = 'platform_seed_per_seat';
export type AnchorConversionPolicy = 'individual_or_bundle_offer_before_expiry';
export type AnchorGrantClock = 'from_each_seat_activation';

export const ANCHOR_COMMERCIAL = {
  walletFunding: 'platform_seed_per_seat' as AnchorWalletFundingPolicy,
  walletSeedHalalas: ANCHOR_WALLET_SEED_HALALAS,
  conversion: 'individual_or_bundle_offer_before_expiry' as AnchorConversionPolicy,
  grantClock: 'from_each_seat_activation' as AnchorGrantClock,
  marketingCaseStudyAllowedDefault: false,
  noSilentExtension: true,
  independentAccountsOnly: true,
  noSharedWallet: true,
  noCrossBranchCustomerData: true,
} as const;
