/** Autonomous Engineering Wing — council protocol & agent routing */

export const ENGINEERING_COUNCIL_TITLE_AR = 'المجلس الهندسي الذاتي';
export const ENGINEERING_COUNCIL_SUBTITLE_AR =
  'Technical Consultant · Agent-to-Agent Consultation · Draft Branch · Pending Founder Approval';

export const SELF_DEVELOPMENT_PROTOCOL_STEPS = [
  'propose_plan',
  'consult_prosecutor',
  'draft_branch',
  'unit_tests',
  'pending_approval',
] as const;

export type SelfDevelopmentProtocolStep = (typeof SELF_DEVELOPMENT_PROTOCOL_STEPS)[number];

export const SELF_DEVELOPMENT_PROTOCOL_LABELS_AR: Record<SelfDevelopmentProtocolStep, string> = {
  propose_plan: '١ — اقتراح الخطة',
  consult_prosecutor: '٢ — استشارة المدعي العام',
  draft_branch: '٣ — فرع Draft',
  unit_tests: '٤ — اختبارات الوحدة',
  pending_approval: '٥ — بانتظار موافقة المؤسس',
};

export const ENGINEERING_COUNCIL_DOCTRINE: string[] = [
  'Agent-to-Agent: Technical Consultant ↔ Public Prosecutor ↔ Crisis Advisor (read/consult only).',
  'Self-Development Protocol إلزامي — لا تنفيذ على main دون موافقة المؤسس.',
  'Draft Branch أولاً — كل refactor يُحتجز في فرع معلّق حتى Approve Execution.',
  'Unit tests مطلوبة — الوكيل يDocument اختباراته قبل Pending Approval.',
  'Cursor/CLI bridge — التنفيذ الفعلي يُفعَّل فقط بعد موافقة المؤسس (CURSOR_API_KEY).',
];

export const COUNCIL_AGENT_LABELS: Record<string, string> = {
  technical_consultant_engineering: 'Technical Consultant · Engineering Wing',
  public_prosecutor: 'المدعي العام الرقمي',
  system_crisis_advisor: 'مستشار الأزمات التقني',
  zatca_tax_advisor: 'ZATCA · زميل خازن',
  fleet_director_general: 'المدير العام للمناوبين',
};
