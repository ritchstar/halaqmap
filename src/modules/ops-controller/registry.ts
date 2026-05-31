import type { OpsController, OpsReportCategory, OpsReportSeverity } from '@/modules/ops-controller/types';
import { OPS_MANAGER_ROLE } from '@/modules/ops-controller/types';

export const OPS_CONTROLLER_WORKSPACE_TITLE_AR = 'مراقب العمليات';
export const OPS_CONTROLLER_WORKSPACE_SUBTITLE_AR =
  'رفع تقارير تشغيلية موثّقة للمالك — كل تقرير يُوسَم بمعرّف العميل والوقت.';

export const OPS_CONTROLLER_DEF: OpsController = {
  id: 'operations_controller',
  role: OPS_MANAGER_ROLE,
  titleAr: OPS_CONTROLLER_WORKSPACE_TITLE_AR,
  subtitleAr: OPS_CONTROLLER_WORKSPACE_SUBTITLE_AR,
  requiredAny: ['view_ops_controller', 'submit_ops_controller'] as const,
};

export const OPS_REPORT_CATEGORY_OPTIONS: {
  value: OpsReportCategory;
  labelAr: string;
  hintAr: string;
}[] = [
  {
    value: 'field_issue',
    labelAr: 'مشكلة ميدانية',
    hintAr: 'تعطل، حضور، أو جودة خدمة في موقع الشريك',
  },
  {
    value: 'partner_friction',
    labelAr: 'احتكاك مع الشريك',
    hintAr: 'تواصل، شكاوى، أو مقاومة تشغيلية',
  },
  {
    value: 'compliance',
    labelAr: 'امتثال وخصوصية',
    hintAr: 'NDMO، سياسات، أو متطلبات تنظيمية',
  },
  {
    value: 'billing_ops',
    labelAr: 'تشغيل وفوترة',
    hintAr: 'حزمة رخصة، مدفوعات، أو تزامن فوترة',
  },
  {
    value: 'geo_presence',
    labelAr: 'تواجد جغرافي',
    hintAr: 'نظام الرصد الذكي، ظهور، أو بيانات موقع',
  },
  {
    value: 'other',
    labelAr: 'أخرى',
    hintAr: 'تقرير عام لا يندرج تحت التصنيفات أعلاه',
  },
];

export const OPS_REPORT_SEVERITY_OPTIONS: {
  value: OpsReportSeverity;
  labelAr: string;
}[] = [
  { value: 'info', labelAr: 'معلومة' },
  { value: 'watch', labelAr: 'متابعة' },
  { value: 'urgent', labelAr: 'عاجل' },
];

export function opsReportCategoryLabelAr(category: OpsReportCategory): string {
  return OPS_REPORT_CATEGORY_OPTIONS.find((o) => o.value === category)?.labelAr ?? category;
}

export function opsReportSeverityLabelAr(severity: OpsReportSeverity): string {
  return OPS_REPORT_SEVERITY_OPTIONS.find((o) => o.value === severity)?.labelAr ?? severity;
}
