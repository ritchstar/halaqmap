import type { AdminPermissionKey } from '@/lib/adminPermissions';

/** Administrative boundary — strict separation of internal vs field vs covert ops. */
export type AiStaffBoundaryId =
  | 'internal_governance'
  | 'external_partner_ops'
  | 'covert_sovereign';

export type AiStaffAgentId =
  | 'billing_treasurer'
  | 'zatca_tax_advisor'
  | 'digital_shift_field'
  | 'partner_relations_liaison'
  | 'fleet_director_general'
  | 'system_crisis_advisor'
  | 'public_prosecutor';

export type AiStaffAgentIconKind =
  | 'treasurer'
  | 'zatca_shield'
  | 'digital_shift'
  | 'partner_liaison'
  | 'fleet_director'
  | 'crisis_advisor'
  | 'public_prosecutor';

export type AiStaffWorkspaceKind =
  | 'billing_dialog'
  | 'zatca_settings'
  | 'digital_shift_oversight'
  | 'partner_analytics'
  | 'fleet_intelligence'
  | 'crisis_playbook'
  | 'prosecutor_governance';

/** Links scattered product code into one registry row (no hardcoded card copy in components). */
export type AiStaffProductRef = {
  configModule?: string;
  migrationId?: string;
  apiRoutes?: string[];
  systemPromptBuilder?: string;
};

export type AiStaffAgentDef = {
  id: AiStaffAgentId;
  boundary: AiStaffBoundaryId;
  shortName: string;
  title?: string;
  roleDescription: string;
  statusBadgeAr?: string;
  ctaLabelAr?: string;
  iconKind?: AiStaffAgentIconKind;
  accentClass: string;
  requiredAny: AdminPermissionKey[];
  /** When true, agent card is shown; covert agents may still require elite visibility. */
  available: boolean;
  comingSoonLabel?: string;
  workspaceKind: AiStaffWorkspaceKind;
  /** Core doctrine / operational constraints surfaced in workspace. */
  doctrineNotes?: string[];
  productRef?: AiStaffProductRef;
  classification?: 'standard' | 'elite_covert';
};

export type AiStaffBoundaryDef = {
  id: AiStaffBoundaryId;
  titleAr: string;
  subtitleAr: string;
  /** Tailwind grid classes for agent cards in this row. */
  gridClassName: string;
  covert?: boolean;
};

export type PartnerLiaisonChatMetric = {
  id: string;
  salonLabel: string;
  handledAt: string;
  sentiment: 'positive' | 'neutral' | 'friction';
  summaryAr: string;
};

export type PartnerLiaisonAnalyticsSnapshot = {
  chatsHandled7d: number;
  avgSentimentScore: number;
  frictionReports7d: number;
  topFrictionThemes: { themeAr: string; count: number }[];
  recentChats: PartnerLiaisonChatMetric[];
};

export type ProsecutorWorkingPaperKind =
  | 'radar_inspector'
  | 'compliance_deviation'
  | 'crisis_watch'
  | 'sovereignty_alert'
  | 'proactive_audit';

export type ProsecutorWorkingPaper = {
  id: string;
  kind: ProsecutorWorkingPaperKind;
  severity: 'info' | 'watch' | 'urgent';
  titleAr: string;
  summaryAr: string;
  issuedAt: string;
  targetAgent?: PublicProsecutorWatchAgentId;
  recommendedActionAr?: string;
};

export type PublicProsecutorGovernanceAction = {
  type: 'interject' | 'sovereignty_alert' | 'preventive_report';
  severity: 'watch' | 'urgent';
  targetAgent?: string;
  headlineAr: string;
  directiveAr: string;
  p0RecoveryRequired?: boolean;
};

export type PublicProsecutorInterject = {
  active: boolean;
  severity: 'watch' | 'urgent';
  targetAgent: PublicProsecutorWatchAgentId | 'founder';
  headlineAr: string;
  directiveAr: string;
  p0RecoveryRequired: boolean;
};

export type PublicProsecutorWatchAgentId =
  | 'zatca_tax_advisor'
  | 'system_crisis_advisor'
  | 'fleet_director_general';

export type PublicProsecutorDashboardSnapshot = {
  anchorLabelAr: string;
  workingPapers: ProsecutorWorkingPaper[];
  sovereigntyAlerts: number;
  inspectorPulseCount24h: number;
  complianceGaps: number;
  crisisWatchActive: boolean;
  lastSyncedAt: string | null;
};

export type FleetIntelligencePing = {
  id: string;
  timestamp: string;
  severity: 'info' | 'watch' | 'secure';
  messageAr: string;
};
