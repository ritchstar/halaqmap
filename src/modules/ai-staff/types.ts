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
  | 'fleet_director_general';

export type AiStaffAgentIconKind =
  | 'treasurer'
  | 'zatca_shield'
  | 'digital_shift'
  | 'partner_liaison'
  | 'fleet_director';

export type AiStaffWorkspaceKind =
  | 'billing_dialog'
  | 'zatca_settings'
  | 'digital_shift_oversight'
  | 'partner_analytics'
  | 'fleet_intelligence';

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

export type FleetIntelligencePing = {
  id: string;
  timestamp: string;
  severity: 'info' | 'watch' | 'secure';
  messageAr: string;
};
