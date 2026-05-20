/** Platform role identifier for operations report authors. */
export const OPS_MANAGER_ROLE = 'OPS_MANAGER' as const;

export type OpsManagerRole = typeof OPS_MANAGER_ROLE;

export type OpsReportCategory =
  | 'field_issue'
  | 'partner_friction'
  | 'compliance'
  | 'billing_ops'
  | 'geo_presence'
  | 'other';

export type OpsReportSeverity = 'info' | 'watch' | 'urgent';

/** Registry definition for the Operations Controller workspace persona. */
export interface OpsController {
  id: 'operations_controller';
  role: OpsManagerRole;
  titleAr: string;
  subtitleAr: string;
  /** Permission keys required to open the workspace tab. */
  requiredAny: readonly ['view_ops_controller', 'submit_ops_controller'];
}

/** Persisted operational report — surfaced on the founder operational feed. */
export interface OpsControllerReport {
  id: string;
  submittedAt: string;
  clientId: string;
  clientLabel?: string;
  reporterEmail: string;
  reporterRole: OpsManagerRole;
  category: OpsReportCategory;
  severity: OpsReportSeverity;
  title: string;
  summary: string;
  detail?: Record<string, unknown>;
}

export type OpsControllerReportInput = {
  clientId: string;
  clientLabel?: string;
  category: OpsReportCategory;
  severity: OpsReportSeverity;
  title: string;
  summary: string;
};

export type OpsControllerFeedResponse = {
  reports: OpsControllerReport[];
};

export type OpsControllerSubmitResponse = {
  ok: true;
  report: OpsControllerReport;
};
