/**
 * شريط استنفار أمني مؤقت — يُخفى عند `VITE_PLATFORM_SECURITY_INCIDENT_BANNER_DISABLED=true`.
 */
export const PLATFORM_SECURITY_INCIDENT_BANNER_DISABLED =
  import.meta.env.VITE_PLATFORM_SECURITY_INCIDENT_BANNER_DISABLED === 'true';

export const PLATFORM_SECURITY_INCIDENT_BANNER_ENABLED = !PLATFORM_SECURITY_INCIDENT_BANNER_DISABLED;

export const PLATFORM_SECURITY_INCIDENT_MARQUEE_SEGMENTS = [
  'استنفار أمني — تم رصد نشاط آلائي مشبوه على المنصة وصدّه فوراً',
  'الخدمة مستمرة لجميع الشركاء والعملاء — لا تأثير على بياناتكم',
  'نُطبّق إجراءات صارمة ضد إساءة الاستخدام — حلاق ماب',
] as const;

export function shouldShowPlatformSecurityIncidentBanner(): boolean {
  return PLATFORM_SECURITY_INCIDENT_BANNER_ENABLED;
}
