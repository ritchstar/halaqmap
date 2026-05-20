import { getSupabaseClient } from '@/integrations/supabase/client';
import type { ZatcaComplianceReport, ZatcaExternalIntelBrief, ZatcaTaxAdvisorSnapshot } from '@/types/zatcaTaxAdvisor';

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('يجب تسجيل الدخول كمشرف');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

type ApiSnapshot = {
  ok?: boolean;
  state?: ZatcaTaxAdvisorSnapshot['state'];
  warnings?: ZatcaTaxAdvisorSnapshot['warnings'];
  uninitialized?: boolean;
  analytics?: ZatcaTaxAdvisorSnapshot['analytics'];
  complianceReport?: ZatcaComplianceReport;
  externalIntel?: ZatcaExternalIntelBrief | null;
  error?: string;
};

function mapSnapshot(json: ApiSnapshot): ZatcaTaxAdvisorSnapshot {
  return {
    state: json.state ?? null,
    warnings: json.warnings ?? json.state?.active_warnings ?? [],
    uninitialized: json.uninitialized ?? json.state == null,
    analytics: json.analytics,
    complianceReport: json.complianceReport,
    externalIntel: json.externalIntel ?? null,
  };
}

export async function fetchZatcaTaxAdvisorStateRemote(): Promise<ZatcaTaxAdvisorSnapshot> {
  const headers = await authHeaders();
  const res = await fetch('/api/admin-zatca-tax-advisor', { method: 'GET', headers });
  const json = (await res.json().catch(() => ({}))) as ApiSnapshot;
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return mapSnapshot(json);
}

export async function runZatcaTaxRadarRemote(options?: { refreshIntel?: boolean }): Promise<ZatcaTaxAdvisorSnapshot> {
  const headers = await authHeaders();
  const qs = new URLSearchParams({ run: '1' });
  if (options?.refreshIntel) qs.set('intel', '1');
  const res = await fetch(`/api/admin-zatca-tax-advisor?${qs.toString()}`, { method: 'GET', headers });
  const json = (await res.json().catch(() => ({}))) as ApiSnapshot;
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return mapSnapshot(json);
}

export async function refreshZatcaExternalIntelRemote(): Promise<ZatcaTaxAdvisorSnapshot> {
  const headers = await authHeaders();
  const res = await fetch('/api/admin-zatca-tax-advisor?brief=1&intel=1', { method: 'GET', headers });
  const json = (await res.json().catch(() => ({}))) as ApiSnapshot;
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return mapSnapshot(json);
}

export async function activateZatcaTaxLiveRemote(): Promise<{
  vatRatePercent: number;
  uiVatSettings: { enabled: boolean; ratePercent: number };
}> {
  const headers = await authHeaders();
  const res = await fetch('/api/admin-zatca-tax-advisor', {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'activate_tax_live' }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    uiVatSettings?: { enabled: boolean; ratePercent: number };
    vatRatePercent?: number;
    error?: string;
  };
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return {
    vatRatePercent: json.vatRatePercent ?? 15,
    uiVatSettings: json.uiVatSettings ?? { enabled: true, ratePercent: 15 },
  };
}

/** تقرير افتراضي للعرض قبل أول مسح رادار */
export function defaultZatcaComplianceReportFallback(): ZatcaComplianceReport {
  return {
    generatedAt: new Date().toISOString(),
    disclaimerAr:
      'تقديرات تشغيلية — ليست استشارة قانونية. شغّل رادار الإيرادات لربط الأرقام ببيانات المنصة الفعلية.',
    currentRevenueSar: 0,
    dailyVelocitySar: 0,
    projectedRevenue30dSar: null,
    daysToMandatoryLimit: null,
    thresholds: [
      {
        id: 'voluntary',
        labelAr: 'حد التسجيل الاختياري',
        limitSar: 187_500,
        remainingSar: 187_500,
        breached: false,
        actionAr: 'مراجعة متطلبات ZATCA',
      },
      {
        id: 'mandatory',
        labelAr: 'حد التسجيل الإلزامي',
        limitSar: 375_000,
        remainingSar: 375_000,
        breached: false,
        actionAr: 'تفعيل ض.ق.م 15% على الواجهة',
      },
    ],
    vatActivationGuidance: {
      triggerSar: 375_000,
      triggerLabelAr: 'تفعيل عرض ض.ق.م على واجهات الدفع',
      recommendEnableUiVat: false,
      urgency: 'monitor',
      summaryAr:
        'الرقم المرجعي لتفعيل ضريبة القيمة المضافة على منصة حلاق ماب: 375,000 ر.س إيرادات مُرصَدة (أو عند التسجيل الضريبي الإلزامي).',
      voluntaryLimitSar: 187_500,
      mandatoryLimitSar: 375_000,
      preparedVatRatePercent: 15,
    },
    hypotheticalScenarios: [
      { kind: 'invoice', labelAr: 'حزمة ماسية (200 ر.س)', subtotalSar: 200, vatRatePercent: 15, vatSar: 30, totalSar: 230, noteAr: '' },
      { kind: 'invoice', labelAr: 'حزمة ماسية + المناوب (225 ر.س)', subtotalSar: 225, vatRatePercent: 15, vatSar: 33.75, totalSar: 258.75, noteAr: '' },
    ],
    monthlyRunRateSar: null,
    estimatedMonthsToMandatory: null,
  };
}
