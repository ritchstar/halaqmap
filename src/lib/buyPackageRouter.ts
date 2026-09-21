/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
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
import {
  isBarberLoggedIn,
  readBarberAuthSession,
} from '@/lib/barberPortalSession';

export type BuyPackageParams = {
  /** نوع الباقة */
  tier: 'bronze' | 'gold' | 'diamond';
  /** نوع الخطة */
  plan?: 'monthly' | 'annual';
  /** هل المناوب/المكتب الخاص مفعَّل (للماسي فقط) */
  digitalShiftAddon?: boolean;
  /** عدد أشهر الرخصة (يُمرَّر كـ qty في صفحة الدفع) */
  licenseMonths?: number;
  /** سطح كوافير ماب عند الشراء من مسار النساء */
  surface?: 'coiffeur';
};

export { isBarberLoggedIn };

function applyBuyPackageSearch(params: BuyPackageParams): URLSearchParams {
  const search = new URLSearchParams();
  search.set('tier', params.tier);
  search.set('plan', params.plan ?? 'monthly');
  if (params.digitalShiftAddon) search.set('aiAddon', '1');
  if (params.licenseMonths != null && params.licenseMonths > 0) {
    search.set('qty', String(params.licenseMonths));
  }
  if (params.surface === 'coiffeur') search.set('surface', 'coiffeur');
  return search;
}

/**
 * بناء URL الانتقال الصحيح
 *  - مسجَّل → /partners/payment?purpose=recharge&tier=...&plan=...
 *  - جديد  → /partners/register?tier=...&plan=...
 */
export function buildBuyPackageUrl(params: BuyPackageParams): string {
  const portalSession = readBarberAuthSession();
  const loggedIn = portalSession != null;
  const search = applyBuyPackageSearch(params);

  if (loggedIn) {
    search.set('purpose', 'recharge');
    if (portalSession.id) search.set('linkedBarberId', portalSession.id);
    if (portalSession.name) search.set('barberName', portalSession.name);
    return `${ROUTE_PATHS.PAYMENT}?${search.toString()}`;
  }

  // عميل جديد → تعبئة طلب التسجيل أولاً
  search.set('purpose', 'new');
  return `${ROUTE_PATHS.REGISTER}?${search.toString()}`;
}

/**
 * رابط أزرار مصفوفة الأسعار:
 * - بعد التسجيل (`requestId`) → الدفع مباشرة مع السياق.
 * - شحن صريح (`purpose=recharge` أو `linkedBarberId`) → الدفع.
 * - غير ذلك → `buildBuyPackageUrl` (تسجيل للجديد / شحن للمسجَّل).
 */
export function buildListingCheckoutUrl(
  params: BuyPackageParams,
  extra?: Record<string, string>,
): string {
  const requestId = extra?.requestId?.trim() ?? '';
  const purpose = (extra?.purpose ?? '').trim().toLowerCase();
  const linkedBarberId = extra?.linkedBarberId?.trim() ?? '';

  if (requestId || purpose === 'recharge' || linkedBarberId) {
    const search = applyBuyPackageSearch(params);
    for (const [key, value] of Object.entries(extra ?? {})) {
      const v = value?.trim();
      if (v && !search.has(key)) search.set(key, v);
    }
    if (requestId && !search.has('purpose')) search.set('purpose', 'new');
    if (!requestId && !search.has('purpose')) search.set('purpose', 'recharge');
    return `${ROUTE_PATHS.PAYMENT}?${search.toString()}`;
  }

  return buildBuyPackageUrl(params);
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
