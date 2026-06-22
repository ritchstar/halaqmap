import { ISIC_ACTIVITY_CODE, ISIC_MOC_ACTIVITY_NAME_AR } from '@/config/geospatialLicenseDoctrine';

export type LicensedCommercialActivity = {
  code: string;
  label: string;
  /** النشاط الرسمي المعتمد لمنصة حلاق ماب */
  primary: boolean;
};

/** الأنشطة كما في السجل التجاري — مصدر واحد للعرض العام */
export const LICENSED_COMMERCIAL_ACTIVITIES: readonly LicensedCommercialActivity[] = [
  { code: ISIC_ACTIVITY_CODE, label: ISIC_MOC_ACTIVITY_NAME_AR, primary: true },
  { code: '620101', label: 'تكامل الأنظمة', primary: false },
  { code: '620102', label: 'تصميم وبرمجة البرمجيات الخاصة', primary: false },
  { code: '620111', label: 'تطوير التطبيقات', primary: false },
  { code: '731013', label: 'تقديم خدمات تسويقية نيابة عن الغير', primary: false },
  { code: '731011', label: 'مؤسسات ووكالات الدعاية والاعلان', primary: false },
  { code: '631121', label: 'خدمات الاستضافة للمواقع والتطبيقات', primary: false },
] as const;

/** للنصوص في API / chat — بدون النشاط الأساسي */
export const LICENSED_COMMERCIAL_ACTIVITIES_SECONDARY_AR =
  LICENSED_COMMERCIAL_ACTIVITIES.filter((a) => !a.primary)
    .map((a) => `${a.code} ${a.label}`)
    .join('، ');

/** الأنشطة البارزة في الرد النظامي — النشاط الأساسي + داعمان */
export const REGULATORY_FRAMEWORK_HIGHLIGHT_ACTIVITIES_AR =
  LICENSED_COMMERCIAL_ACTIVITIES.filter(
    (a) => a.primary || a.code === '620102' || a.code === '731011',
  )
    .map((a) => `${a.code} ${a.label}${a.primary ? ' (النشاط المعتمد للمنصة)' : ''}`)
    .join(' · ');
