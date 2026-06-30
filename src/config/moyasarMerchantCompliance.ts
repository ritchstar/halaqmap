import { ROUTE_PATHS } from '@/lib/index';
import {
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  LEGAL_TRADE_NAME_AR,
  PARTNER_SUPPORT_EMAIL,
  PARTNER_SUPPORT_PHONE_E164,
} from '@/config/partnerLegal';
import { SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR } from '@/config/subscriptionPricing';

/** معرّفات الأقسام داخل صفحة سياسة الرخصة */
export const REFUND_POLICY_SECTION_ID = 'refund-policy' as const;
export const PRICING_POLICY_SECTION_ID = 'pricing' as const;

/**
 * روابط قصيرة متوافقة مع HashRouter — لا تستخدم `#` داخل المسار (يُرمَّز إلى %23 ويسبب 404).
 * المسارات القصيرة تُعاد توجيهها في App.tsx إلى `?section=`.
 */
export const REFUND_POLICY_PATH = '/partners/refund-policy' as const;
export const PRICING_POLICY_PATH = '/partners/pricing' as const;

export const REFUND_POLICY_CANONICAL_SEARCH = `?section=${REFUND_POLICY_SECTION_ID}` as const;
export const PRICING_POLICY_CANONICAL_SEARCH = `?section=${PRICING_POLICY_SECTION_ID}` as const;

export function subscriptionPolicySectionPath(sectionId: string): string {
  return `${ROUTE_PATHS.SUBSCRIPTION_POLICY}?section=${encodeURIComponent(sectionId)}`;
}

export const MOYASAR_COMPLAINT_RESPONSE_DAYS_AR = '3 أيام عمل' as const;

export const MOYASAR_DIGITAL_DELIVERY_AR =
  'تسليم رقمي فوري: تفعيل حزمة رخصة النفاذ وكود التفعيل بعد التحقق من نجاح الدفع (عادةً خلال دقائق)' as const;

export const MOYASAR_MERCHANT_IDENTITY_LINES_AR = [
  LEGAL_TRADE_NAME_AR,
  `الرقم الوطني الموحد: ${LEGAL_NATIONAL_UNIFIED_NUMBER}`,
  `البريد: ${PARTNER_SUPPORT_EMAIL}`,
  `الهاتف: +${PARTNER_SUPPORT_PHONE_E164}`,
] as const;

export const MOYASAR_PRODUCT_SUMMARY_AR =
  `المنتج المباع: ${SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR} — برمجيات B2B مسبقة الدفع (30 يوماً لكل حزمة).`;
