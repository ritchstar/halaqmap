/** ZATCA / Zakat revenue thresholds (Saudi B2B voluntary & mandatory registration bands). */

export const ZATCA_VOLUNTARY_LIMIT_SAR = 187_500;
export const ZATCA_MANDATORY_LIMIT_SAR = 375_000;
export const ZATCA_SOFT_ALERT_FRACTION = 0.5;

export const ZATCA_VOLUNTARY_LIMIT_HALALAS = ZATCA_VOLUNTARY_LIMIT_SAR * 100;
export const ZATCA_MANDATORY_LIMIT_HALALAS = ZATCA_MANDATORY_LIMIT_SAR * 100;
export const ZATCA_SOFT_ALERT_HALALAS = Math.floor(ZATCA_VOLUNTARY_LIMIT_HALALAS * ZATCA_SOFT_ALERT_FRACTION);

export const ZATCA_PREPARED_VAT_RATE_PERCENT = 15;
export const ZATCA_RUN_RATE_HORIZON_DAYS = 30;

export const ZATCA_PLATFORM_STATE_ID = 'platform' as const;

export type ZatcaRevenueOrderSource = 'listing_license_order' | 'legacy_payment';

export type ZatcaRevenueOrderRow = {
  source: ZatcaRevenueOrderSource;
  id: string;
  amountHalalas: number;
  paidAt: string;
  metadata?: Record<string, unknown>;
};

export type ZatcaWarningLevel =
  | 'soft_voluntary_half'
  | 'voluntary_limit'
  | 'critical_run_rate'
  | 'mandatory_breached';

export type ZatcaEarlyWarningSignal = {
  level: ZatcaWarningLevel;
  triggeredAt: string;
  messageAr: string;
  totalRevenueHalalas: number;
  totalRevenueSar: number;
  dailyVelocityHalalas: number;
  dailyVelocitySar: number;
  projectedRevenue30dHalalas: number | null;
  daysToMandatoryLimit: number | null;
};

export type ZatcaRevenueAnalytics = {
  totalHistoricalHalalas: number;
  totalHistoricalSar: number;
  trailing30dHalalas: number;
  trailing7dHalalas: number;
  dailyVelocityHalalas: number;
  dailyVelocitySar: number;
  monthlyVelocityHalalas: number;
  monthlyVelocitySar: number;
  projectedRevenue30dHalalas: number;
  projectedRevenue30dSar: number;
  daysToMandatoryLimit: number | null;
  orderCount: number;
  listingLicenseOrderCount: number;
  legacyPaymentCount: number;
  computedAt: string;
};

export type ZatcaPreparedVatConfig = {
  ratePercent: number;
  rateBps: number;
  formula: string;
  subtotalToVatHalalas: string;
  subtotalToTotalHalalas: string;
  preparedAt: string;
  taxEnabledLive: false;
};

export type ZatcaFilteredRevenueLog = {
  filteredAt: string;
  totalPaidOrders: number;
  totalRevenueHalalas: number;
  listingLicenseSample: { id: string; amountHalalas: number; paidAt: string }[];
  legacyPaymentSample: { id: string; amountHalalas: number; paidAt: string }[];
};

export type ZatcaAdminActivationAlert = {
  priority: 'critical';
  agentId: 'zatca_tax_advisor';
  agentLabelAr: 'ط²ظ…ظٹظ„ ط®ط§ط²ظ†';
  titleAr: string;
  bodyAr: string;
  ctaLabelAr: string;
  ctaAction: 'activate_tax_live';
  glow: true;
  mandatoryBreachedAt: string;
  preparedVatRatePercent: number;
  totalRevenueSar: number;
};

export type ZatcaPlatformTaxStateRow = {
  id: string;
  tax_enabled: boolean;
  mandatory_breached_at: string | null;
  fulfillment_prepared_at: string | null;
  cached_vat_config: (ZatcaPreparedVatConfig & { externalIntel?: ZatcaExternalIntelBrief }) | Record<string, unknown>;
  cached_revenue_snapshot: (ZatcaRevenueAnalytics & { complianceReport?: ZatcaComplianceReport }) | Record<string, unknown>;
  active_warnings: ZatcaEarlyWarningSignal[];
  admin_activation_alert: ZatcaAdminActivationAlert | null;
  last_radar_run_at: string | null;
  updated_at: string;
};

export type ZatcaTaxLiveActivationResult = {
  ok: true;
  taxEnabled: true;
  vatRatePercent: number;
  activatedAt: string;
  activatedByEmail: string | null;
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

export type ZatcaTaxAdvisorRunResult = {
  ok: true;
  analytics: ZatcaRevenueAnalytics;
  warnings: ZatcaEarlyWarningSignal[];
  mandatoryBreached: boolean;
  fulfillmentPrepared: boolean;
  taxEnabledLive: boolean;
  adminActivationAlert: ZatcaAdminActivationAlert | null;
  preparedVatConfig: ZatcaPreparedVatConfig | null;
  complianceReport: ZatcaComplianceReport;
  externalIntel: ZatcaExternalIntelBrief;
};

