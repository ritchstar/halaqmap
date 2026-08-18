/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * مكتب تشغيل كوافير ماب — اسم داخلي متفرع من لوحة المؤسس.
 * لا يُعرض في القوائم العامة. لا تستورد هذا الملف من App.tsx.
 */
import { COIFFEUR_HALAQMAP_ORIGIN, COIFFEUR_SATELLITE_HOST } from '@/config/coiffeurMapUmbrella';
import { COIFFEUR_LISTING_SECTOR } from '@/config/coiffeurPartnerSector';
import { ROUTE_PATHS } from '@/lib/routePaths';

export const COIFFEUR_OPS_DESK_INTERNAL_NAME_AR = 'مكتب تشغيل كوافير ماب' as const;
export const COIFFEUR_OPS_DESK_INTERNAL_CODE = 'coiffeur-ops-desk' as const;
export const COIFFEUR_OPS_DESK_PARENT_AR = 'لوحة التحكم الرئيسية للمؤسس' as const;

export const COIFFEUR_TRIAL_SALON = {
  name: 'مشغل تجريبي كوافير ماب',
  email: 'coiffeur.trial@halaqmap.internal',
  phone: '0500000096',
  city: 'الرياض',
  address: 'الرياض — إدراج تجريبي لكوافير ماب',
  latitude: 24.7136,
  longitude: 46.6753,
  specialties: ['كوافير نسائي', 'مشغل تجميل'] as const,
  listingSector: COIFFEUR_LISTING_SECTOR,
  tier: 'bronze' as const,
} as const;

export function coiffeurRegisterTrialUrl(): string {
  return `${COIFFEUR_HALAQMAP_ORIGIN}/#${ROUTE_PATHS.REGISTER}?surface=coiffeur&tier=bronze`;
}

export function coiffeurInquiryPublicUrl(): string {
  return `https://${COIFFEUR_SATELLITE_HOST}/#${ROUTE_PATHS.COIFFEUR_INQUIRE}`;
}

export function coiffeurPartnersPublicUrl(): string {
  return `https://${COIFFEUR_SATELLITE_HOST}/#${ROUTE_PATHS.COIFFEUR_PARTNERS}`;
}

export const COIFFEUR_OPS_TRIAL_STEPS_AR = [
  'افتحي نموذج الاشتراك بسطح كوافير (رخصة برمجية كوافير ماب).',
  'أكملي طلب مشغل نسائي تجريبي ثم عودي لهذه اللوحة.',
  'اعتمدي الطلب من تبويب طلبات الاشتراك — يُحفظ القطاع coiffeur_women.',
  'تحققي من ظهور المشغل في استعلام كوافير ماب، لا في بحث الرجال.',
] as const;
