import type { SupabaseClient } from '@supabase/supabase-js';
import { buildZatcaComplianceReport } from './zatcaComplianceReport.js';
import { fetchZatcaExternalIntel } from './zatcaExternalIntel.js';
import {
  computeRevenueAnalytics,
  evaluateEarlyWarningSignals,
  isMandatoryLimitBreached,
  loadPlatformRevenueOrders,
} from './zatcaRevenueEngine.js';
import {
  ZATCA_PLATFORM_STATE_ID,
  ZATCA_PREPARED_VAT_RATE_PERCENT,
  type ZatcaAdminActivationAlert,
  type ZatcaComplianceReport,
  type ZatcaExternalIntelBrief,
  type ZatcaFilteredRevenueLog,
  type ZatcaPlatformTaxStateRow,
  type ZatcaPreparedVatConfig,
  type ZatcaRevenueAnalytics,
  type ZatcaRevenueOrderRow,
  type ZatcaTaxAdvisorRunResult,
  type ZatcaTaxLiveActivationResult,
} from './zatcaTaxTypes.js';

export type ZatcaTaxAdvisorSupabase = SupabaseClient;

function buildPreparedVatConfig(nowIso: string): ZatcaPreparedVatConfig {
  return {
    ratePercent: ZATCA_PREPARED_VAT_RATE_PERCENT,
    rateBps: ZATCA_PREPARED_VAT_RATE_PERCENT * 100,
    formula: 'vat_halalas = round(subtotal_halalas * rate_percent / 100)',
    subtotalToVatHalalas: `round(subtotal_halalas * ${ZATCA_PREPARED_VAT_RATE_PERCENT} / 100)`,
    subtotalToTotalHalalas: `subtotal_halalas + round(subtotal_halalas * ${ZATCA_PREPARED_VAT_RATE_PERCENT} / 100)`,
    preparedAt: nowIso,
    taxEnabledLive: false,
  };
}

function buildFilteredRevenueLog(
  orders: ZatcaRevenueOrderRow[],
  analytics: ZatcaRevenueAnalytics,
  nowIso: string,
): ZatcaFilteredRevenueLog {
  const listing = orders.filter((o) => o.source === 'listing_license_order');
  const legacy = orders.filter((o) => o.source === 'legacy_payment');

  return {
    filteredAt: nowIso,
    totalPaidOrders: orders.length,
    totalRevenueHalalas: analytics.totalHistoricalHalalas,
    listingLicenseSample: listing.slice(-40).map((o) => ({
      id: o.id,
      amountHalalas: o.amountHalalas,
      paidAt: o.paidAt,
    })),
    legacyPaymentSample: legacy.slice(-40).map((o) => ({
      id: o.id,
      amountHalalas: o.amountHalalas,
      paidAt: o.paidAt,
    })),
  };
}

function buildAdminActivationAlert(
  analytics: ZatcaRevenueAnalytics,
  mandatoryBreachedAt: string,
): ZatcaAdminActivationAlert {
  return {
    priority: 'critical',
    agentId: 'zatca_tax_advisor',
    agentLabelAr: 'خبير ZATCA 🛡️',
    titleAr: 'بلوغ الحد الإلزامي — تفعيل الضريبة جاهز',
    bodyAr:
      'خبير ZATCA: تم رصد بلوغ الحد الإلزامي لهيئة الزكاة والضريبة والجمارك. كافة الحسب والتقارير جاهزة بنسبة 15%. يرجى مراجعة شهادة التسجيل والضغط هنا للتفعيل الفوري الحي.',
    ctaLabelAr: 'التفعيل الفوري الحي',
    ctaAction: 'activate_tax_live',
    glow: true,
    mandatoryBreachedAt,
    preparedVatRatePercent: ZATCA_PREPARED_VAT_RATE_PERCENT,
    totalRevenueSar: analytics.totalHistoricalSar,
  };
}

async function loadStateRow(supabase: ZatcaTaxAdvisorSupabase): Promise<ZatcaPlatformTaxStateRow | null> {
  const { data, error } = await supabase
    .from('platform_zatca_tax_advisor_state')
    .select('*')
    .eq('id', ZATCA_PLATFORM_STATE_ID)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return data as ZatcaPlatformTaxStateRow;
}

async function upsertStateRow(
  supabase: ZatcaTaxAdvisorSupabase,
  patch: Record<string, unknown>,
): Promise<ZatcaPlatformTaxStateRow> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('platform_zatca_tax_advisor_state')
    .upsert(
      {
        id: ZATCA_PLATFORM_STATE_ID,
        updated_at: nowIso,
        ...patch,
      },
      { onConflict: 'id' },
    )
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'state_upsert_failed');
  return data as ZatcaPlatformTaxStateRow;
}

/**
 * زميل لخازن — ZATCA financial agent: proactive revenue radar + non-blocking fulfillment prep.
 * Never flips `tax_enabled` to true without explicit admin activation at mandatory threshold.
 */
export class ZatcaTaxAdvisorAgent {
  constructor(private readonly supabase: ZatcaTaxAdvisorSupabase) {}

  async getState(): Promise<ZatcaPlatformTaxStateRow | null> {
    return loadStateRow(this.supabase);
  }

  /** تقرير استباقي + افتراضات — يعمل حتى بدون مسح رادار سابق */
  async getComplianceBrief(options?: { refreshIntel?: boolean }): Promise<{
    complianceReport: ZatcaComplianceReport;
    externalIntel: ZatcaExternalIntelBrief;
    analytics: ZatcaRevenueAnalytics | null;
  }> {
    const existing = await loadStateRow(this.supabase);
    const snap = existing?.cached_revenue_snapshot;
    const analytics =
      snap && typeof snap === 'object' && 'totalHistoricalSar' in snap
        ? (snap as ZatcaRevenueAnalytics)
        : null;

    const cachedIntel =
      existing?.cached_vat_config &&
      typeof existing.cached_vat_config === 'object' &&
      'externalIntel' in existing.cached_vat_config
        ? (existing.cached_vat_config as { externalIntel?: ZatcaExternalIntelBrief }).externalIntel
        : null;

    const complianceReport =
      snap && typeof snap === 'object' && 'complianceReport' in snap
        ? (snap as { complianceReport?: ZatcaComplianceReport }).complianceReport ?? buildZatcaComplianceReport(analytics)
        : buildZatcaComplianceReport(analytics);

    const externalIntel = await fetchZatcaExternalIntel(cachedIntel ?? null, {
      force: options?.refreshIntel === true,
    });

    if (options?.refreshIntel || !cachedIntel) {
      await upsertStateRow(this.supabase, {
        cached_vat_config: {
          ...(existing?.cached_vat_config && typeof existing.cached_vat_config === 'object'
            ? existing.cached_vat_config
            : {}),
          externalIntel,
        },
      });
    }

    return { complianceReport, externalIntel, analytics };
  }

  /** Run predictive radar, persist warnings, and prepare fulfillment when mandatory limit is breached. */
  async runRevenueRadar(options?: { refreshIntel?: boolean }): Promise<ZatcaTaxAdvisorRunResult> {
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const orders = await loadPlatformRevenueOrders(this.supabase);
    const analytics = computeRevenueAnalytics(orders, nowMs);
    const warnings = evaluateEarlyWarningSignals(analytics, nowMs);
    const mandatoryBreached = isMandatoryLimitBreached(analytics);

    const existing = await loadStateRow(this.supabase);
    const taxEnabledLive = existing?.tax_enabled === true;

    let preparedVatConfig: ZatcaPreparedVatConfig | null = null;
    let adminActivationAlert: ZatcaAdminActivationAlert | null = null;
    let fulfillmentPrepared = false;

    const complianceReport = buildZatcaComplianceReport(analytics);
    const cachedIntel =
      existing?.cached_vat_config &&
      typeof existing.cached_vat_config === 'object' &&
      'externalIntel' in existing.cached_vat_config
        ? (existing.cached_vat_config as { externalIntel?: ZatcaExternalIntelBrief }).externalIntel
        : null;
    const externalIntel = await fetchZatcaExternalIntel(cachedIntel ?? null, {
      force: options?.refreshIntel === true,
    });

    const statePatch: Record<string, unknown> = {
      last_radar_run_at: nowIso,
      cached_revenue_snapshot: { ...analytics, complianceReport },
      active_warnings: warnings,
      cached_vat_config: {
        ...(existing?.cached_vat_config && typeof existing.cached_vat_config === 'object'
          ? existing.cached_vat_config
          : preparedVatConfig ?? {}),
        externalIntel,
      },
    };

    if (mandatoryBreached && !taxEnabledLive) {
      preparedVatConfig = buildPreparedVatConfig(nowIso);
      const filteredLog = buildFilteredRevenueLog(orders, analytics, nowIso);
      adminActivationAlert = buildAdminActivationAlert(analytics, nowIso);
      fulfillmentPrepared = true;

      statePatch.mandatory_breached_at = existing?.mandatory_breached_at ?? nowIso;
      statePatch.fulfillment_prepared_at = nowIso;
      statePatch.cached_vat_config = { ...preparedVatConfig, externalIntel };
      statePatch.admin_activation_alert = adminActivationAlert;
      statePatch.cached_revenue_snapshot = {
        ...analytics,
        complianceReport,
        filteredRevenueLog: filteredLog,
      };
    } else if (!mandatoryBreached) {
      statePatch.admin_activation_alert = null;
    }

    await upsertStateRow(this.supabase, statePatch);

    return {
      ok: true,
      analytics,
      warnings,
      mandatoryBreached,
      fulfillmentPrepared,
      taxEnabledLive,
      adminActivationAlert,
      preparedVatConfig,
      complianceReport,
      externalIntel,
    };
  }

  /**
   * Explicit live activation — sets `tax_enabled` true when mandatory threshold is met.
   * Requires `activate_zatca_tax_live` or `manage_platform_commerce_rules`.
   */
  async activateTaxLive(actorEmail: string | null): Promise<ZatcaTaxLiveActivationResult> {
    const nowIso = new Date().toISOString();
    const existing = await loadStateRow(this.supabase);

    if (existing?.tax_enabled === true) {
      throw new Error('tax_already_enabled');
    }

    const snap = existing?.cached_revenue_snapshot;
    const analytics =
      snap && typeof snap === 'object' && 'totalHistoricalHalalas' in snap
        ? (snap as ZatcaRevenueAnalytics)
        : null;
    const mandatoryBreached = analytics ? isMandatoryLimitBreached(analytics) : false;
    const hasActivationAlert = existing?.admin_activation_alert != null;
    const hasMandatoryTimestamp = existing?.mandatory_breached_at != null;

    if (!mandatoryBreached && !hasActivationAlert && !hasMandatoryTimestamp) {
      throw new Error('activation_not_ready');
    }

    const prepared =
      existing?.cached_vat_config && typeof existing.cached_vat_config === 'object'
        ? (existing.cached_vat_config as ZatcaPreparedVatConfig)
        : buildPreparedVatConfig(nowIso);

    await upsertStateRow(this.supabase, {
      tax_enabled: true,
      cached_vat_config: {
        ...prepared,
        taxEnabledLive: true,
        activatedAt: nowIso,
        activatedByEmail: actorEmail,
      },
      admin_activation_alert: null,
    });

    return {
      ok: true,
      taxEnabled: true,
      vatRatePercent: ZATCA_PREPARED_VAT_RATE_PERCENT,
      activatedAt: nowIso,
      activatedByEmail: actorEmail,
    };
  }
}

export async function runZatcaTaxAdvisorRadar(
  supabase: ZatcaTaxAdvisorSupabase,
): Promise<ZatcaTaxAdvisorRunResult> {
  const agent = new ZatcaTaxAdvisorAgent(supabase);
  return agent.runRevenueRadar();
}
