/**
 * buyPackageRouter — منطق موحَّد لتوجيه شراء الحزم
 *
 * يفرّق بين:
 *  · العميل الجديد (غير مسجَّل) → نموذج التسجيل أولاً → الدفع لاحقاً
 *  · الحلاق المسجَّل (شحن رصيد) → صفحة الدفع مباشرة
 *
 * يُستخدم من كل بطاقات شراء الباقات في الصفحات التسويقية.
 */

import { ROUTE_PATHS } from '@/lib/index';

export type BuyPackageParams = {
  /** نوع الباقة */
  tier: 'bronze' | 'gold' | 'diamond';
  /** نوع الخطة */
  plan?: 'monthly' | 'annual';
  /** هل المناوب/المكتب الخاص مفعَّل (للماسي فقط) */
  digitalShiftAddon?: boolean;
};

/**
 * فحص حالة تسجيل الحلاق (محلياً)
 */
export function isBarberLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const auth = localStorage.getItem('barberAuth');
    if (!auth) return false;
    // فحص بسيط للتأكد أن الجلسة ليست منتهية
    const parsed = JSON.parse(auth);
    return Boolean(parsed && (parsed.email || parsed.id));
  } catch { return false; }
}

/**
 * بناء URL الانتقال الصحيح
 *  - مسجَّل → /partners/payment?purpose=recharge&tier=...&plan=...
 *  - جديد  → /partners/register?tier=...&plan=...
 */
export function buildBuyPackageUrl(params: BuyPackageParams): string {
  const tier = params.tier;
  const plan = params.plan ?? 'annual'; // افتراضي: سنوي
  const isLoggedIn = isBarberLoggedIn();

  const search = new URLSearchParams();
  search.set('tier', tier);
  search.set('plan', plan);
  if (params.digitalShiftAddon) search.set('addon', 'office');

  if (isLoggedIn) {
    // حلاق مسجَّل → شحن حزمة جديدة لحسابه
    search.set('purpose', 'recharge');
    return `${ROUTE_PATHS.PAYMENT}?${search.toString()}`;
  }

  // عميل جديد → تعبئة طلب التسجيل أولاً
  search.set('purpose', 'new');
  return `${ROUTE_PATHS.REGISTER}?${search.toString()}`;
}

/**
 * تنفيذ التوجيه — يستقبل navigate من react-router
 */
export function routeToBuyPackage(
  navigate: (to: string) => void,
  params: BuyPackageParams,
): { destination: 'register' | 'payment' } {
  const url = buildBuyPackageUrl(params);
  navigate(url);
  return { destination: isBarberLoggedIn() ? 'payment' : 'register' };
}
