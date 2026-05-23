/** Central Governance — Public Prosecutor Agent (المدعي العام الرقمي) */

export const PUBLIC_PROSECUTOR_TITLE_AR = 'المدعي العام الرقمي';
export const PUBLIC_PROSECUTOR_ROLE_AR =
  'ضابط الامتثال والحوكمة الاستراتيجية — مراقبة صامتة لسجلات المختبرات، إنفاذ السيادة المهنية، وسلطة المقاطعة عند تجاوز العتبات.';

export const PUBLIC_PROSECUTOR_DOCTRINE: string[] = [
  'صلاحية قراءة: مختبر ZATCA · مستشار الأزمات · المدير العام للمناوبين — دون تعديل سجلاتهم.',
  'Radar Sync: أي نمط «مفتش» (Inspector) في Platform Radar يستوجب تقريراً وقائياً في التغذية التشغيلية.',
  'Compliance Enforcement: تدقيق تلقائي لمسار ComplianceCheckbox في التسجيل B2B مقابل ميثاق الالتزام المهني.',
  'Crisis Watch: حضور إلزامي في خيوط Crisis Advisor — مقاطعة فورية إذا أُعطيت UX أولوية على Data Integrity.',
  'Professional Sovereignty: تنبيهات سيادة مهنية عند انحراف أي وكيل عن الحدود المؤسسية.',
];

export const PUBLIC_PROSECUTOR_LAB_AGENTS = [
  'zatca_tax_advisor',
  'system_crisis_advisor',
  'fleet_director_general',
] as const;

export type PublicProsecutorWatchAgentId = (typeof PUBLIC_PROSECUTOR_LAB_AGENTS)[number];

export const PUBLIC_PROSECUTOR_WATCH_AGENT_LABELS: Record<PublicProsecutorWatchAgentId, string> = {
  zatca_tax_advisor: 'ZATCA · زميل خازن',
  system_crisis_advisor: 'مستشار الأزمات',
  fleet_director_general: 'المدير العام للمناوبين',
};

/** UX-over-integrity phrases that trigger P0 interject in crisis threads */
export const CRISIS_UX_DRIFT_TRIGGERS = [
  'تحسين الواجهة',
  'تجربة المستخدم',
  'UX',
  'تجميل',
  'ألوان',
  'animation',
  'microcopy',
] as const;

export const DATA_INTEGRITY_P0_KEYWORDS = [
  'P0',
  'data integrity',
  'سلامة البيانات',
  'RLS',
  'uptime',
  'service_role',
] as const;
