export type ZatcaAdminActivationAlert = {
  priority: 'critical';
  agentId: 'zatca_tax_advisor';
  agentLabelAr: string;
  titleAr: string;
  bodyAr: string;
  ctaLabelAr: string;
  ctaAction: 'activate_tax_live';
  glow: boolean;
  mandatoryBreachedAt: string;
  preparedVatRatePercent: number;
  totalRevenueSar: number;
};

export type ZatcaEarlyWarningSignal = {
  level: string;
  triggeredAt: string;
  messageAr: string;
  totalRevenueSar: number;
  dailyVelocitySar: number;
  daysToMandatoryLimit: number | null;
};

export type ZatcaComplianceThresholdRow = {
  id: string;
  labelAr: string;
  limitSar: number;
  remainingSar: number;
  breached: boolean;
  actionAr: string;
};

export type ZatcaHypotheticalScenario = {
  kind: 'invoice' | 'annual_projection';
  labelAr: string;
  subtotalSar: number;
  vatRatePercent: number;
  vatSar: number;
  totalSar: number;
  noteAr: string;
};

export type ZatcaComplianceReport = {
  generatedAt: string;
  disclaimerAr: string;
  currentRevenueSar: number;
  dailyVelocitySar: number;
  projectedRevenue30dSar: number | null;
  daysToMandatoryLimit: number | null;
  thresholds: ZatcaComplianceThresholdRow[];
  vatActivationGuidance: {
    triggerSar: number;
    triggerLabelAr: string;
    recommendEnableUiVat: boolean;
    urgency: 'monitor' | 'prepare_soon' | 'prepare_now' | 'immediate';
    summaryAr: string;
    voluntaryLimitSar: number;
    mandatoryLimitSar: number;
    preparedVatRatePercent: number;
  };
  hypotheticalScenarios: ZatcaHypotheticalScenario[];
  monthlyRunRateSar: number | null;
  estimatedMonthsToMandatory: number | null;
};

export type ZatcaIntelSourceHit = {
  id: string;
  url: string;
  labelAr: string;
  orgAr: string;
  fetchedAt: string;
  ok: boolean;
  title?: string;
  snippetAr?: string;
  errorAr?: string;
};

export type ZatcaExternalIntelBrief = {
  fetchedAt: string;
  summaryAr: string;
  learningTopicsAr: string[];
  sources: ZatcaIntelSourceHit[];
};

export type ZatcaTaxAdvisorState = {
  id: string;
  tax_enabled: boolean;
  mandatory_breached_at: string | null;
  fulfillment_prepared_at: string | null;
  active_warnings: ZatcaEarlyWarningSignal[];
  admin_activation_alert: ZatcaAdminActivationAlert | null;
  last_radar_run_at: string | null;
};

export type ZatcaTaxAdvisorSnapshot = {
  state: ZatcaTaxAdvisorState | null;
  warnings: ZatcaEarlyWarningSignal[];
  /** true when migration not applied or no radar run yet (state row missing) */
  uninitialized?: boolean;
  analytics?: {
    totalHistoricalSar: number;
    dailyVelocitySar: number;
    projectedRevenue30dSar: number;
    daysToMandatoryLimit: number | null;
  };
  complianceReport?: ZatcaComplianceReport;
  externalIntel?: ZatcaExternalIntelBrief | null;
};
