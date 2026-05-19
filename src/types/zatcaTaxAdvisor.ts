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
};
