import { ROUTE_PATHS } from '@/lib/index';
import {
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  LEGAL_TRADE_NAME_AR,
  PARTNER_SUPPORT_EMAIL,
  PARTNER_SUPPORT_PHONE_E164,
} from '@/config/partnerLegal';
import { SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR } from '@/config/subscriptionPricing';

/** مسار سياسة الاسترداد — قسم داخل سياسة رخصة النفاذ */
export const REFUND_POLICY_PATH = `${ROUTE_PATHS.SUBSCRIPTION_POLICY}#refund-policy` as const;

/** مسار جدول الأسعار والخدمات */
export const PRICING_POLICY_PATH = `${ROUTE_PATHS.SUBSCRIPTION_POLICY}#pricing` as const;

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
