/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * سعر مدرسة البلوت — دفعة واحدة، وصول دائم. لا يُستورد من App.
 */

/** وسم ميسر — مستقل تماماً عن كل منتجات المتجر ومدرسة الشطرنج ورخصة النفاذ. */
export const BALOOT_SCHOOL_PRODUCT = 'baloot_school';

export const BALOOT_SCHOOL_PRICE_SAR = 199;
export const BALOOT_SCHOOL_PRICE_HALALAS = 19_900;

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

/** التحصيل مفتوح افتراضياً. يُغلق مؤقتاً بـ VITE_BALOOT_SCHOOL_CHECKOUT_ENABLED=false. */
export const BALOOT_SCHOOL_CHECKOUT_ENABLED = envEnabled('VITE_BALOOT_SCHOOL_CHECKOUT_ENABLED', true);

export const BALOOT_SCHOOL_PAY_COPY = {
  titleAr: 'دفع مدرسة البلوت',
  priceLabelAr: '199 ر.س — دفعة واحدة، وصول دائم',
  checkoutClosedAr: 'التحصيل مغلق مؤقتاً. حاول لاحقاً أو تواصل معنا.',
  testCheckoutHintAr: 'هذه تجربة دفع تجريبية. لا يُخصم مبلغ حقيقي، وبطاقة الاختبار `4111 1111 1111 1111`.',
  activatingAr: 'جاري تفعيل حسابك بعد الدفع…',
  paidAr: 'تم الدفع بنجاح. حسابك في مدرسة البلوت مفعّل الآن.',
} as const;
