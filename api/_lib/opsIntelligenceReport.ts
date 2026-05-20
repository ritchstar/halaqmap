import type { SupabaseClient } from '@supabase/supabase-js';
import { getOpsBillingTemporalAnchor } from './opsBillingAi.js';

export const OPS_INTELLIGENCE_DIGEST_SOURCE = 'ops_intelligence_digest' as const;
export const OPS_INTELLIGENCE_SYSTEM_ROLE = 'SYSTEM' as const;

export type OpsIntelligenceBucketKey = 'service_quality' | 'technical_issues' | 'geographical_coverage';

export const OPS_INTELLIGENCE_BUCKETS: Record<
  OpsIntelligenceBucketKey,
  { labelAr: string; categories: readonly string[] }
> = {
  service_quality: {
    labelAr: 'جودة الخدمة',
    categories: ['field_issue', 'partner_friction'],
  },
  technical_issues: {
    labelAr: 'مشكلات تقنية',
    categories: ['billing_ops', 'compliance'],
  },
  geographical_coverage: {
    labelAr: 'التغطية الجغرافية',
    categories: ['geo_presence'],
  },
};

type RawReport = {
  id: string;
  submitted_at: string;
  client_id: string;
  client_label: string | null;
  reporter_email: string;
  reporter_role: string;
  category: string;
  severity: string;
  title: string;
  summary: string;
  detail: Record<string, unknown> | null;
};

export type OpsIntelligenceRedFlag = {
  id: string;
  title: string;
  summary: string;
  clientId: string;
  category: string;
  submittedAt: string;
};

export type OpsIntelligencePattern = {
  kind: 'category_repeat' | 'client_repeat' | 'title_repeat';
  labelAr: string;
  count: number;
};

export type OpsIntelligenceBriefing = {
  digestYmd: string;
  labelAr: string;
  windowHours: number;
  totalReports: number;
  byBucket: Record<OpsIntelligenceBucketKey, RawReport[]>;
  redFlags: OpsIntelligenceRedFlag[];
  patterns: OpsIntelligencePattern[];
  summaryText: string;
  briefingText: string;
};

function normalizeEmail(v: string): string {
  return v.trim().toLowerCase();
}

function getServerBootstrapAdminEmail(): string {
  const fromEnv = (process.env.VITE_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim();
  if (fromEnv) return normalizeEmail(fromEnv);
  return 'ritchstar4@gmail.com';
}

export function getFounderDigestRecipients(): string[] {
  const explicit = (process.env.FOUNDER_OPS_DIGEST_EMAIL || process.env.FOUNDER_DIGEST_EMAIL || '')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);
  if (explicit.length > 0) return [...new Set(explicit)];

  const extraRaw = (process.env.VITE_EXTRA_BOOTSTRAP_ADMIN_EMAILS || process.env.EXTRA_BOOTSTRAP_ADMIN_EMAILS || '')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);

  return [...new Set([getServerBootstrapAdminEmail(), 'admin@halaqmap.com', ...extraRaw])];
}

function classifyBucket(category: string): OpsIntelligenceBucketKey {
  for (const [key, bucket] of Object.entries(OPS_INTELLIGENCE_BUCKETS) as [
    OpsIntelligenceBucketKey,
    (typeof OPS_INTELLIGENCE_BUCKETS)[OpsIntelligenceBucketKey],
  ][]) {
    if (bucket.categories.includes(category)) return key;
  }
  return 'service_quality';
}

function normalizeTitleKey(title: string): string {
  return title.trim().replace(/\s+/g, ' ').toLowerCase();
}

function isFieldReport(row: RawReport): boolean {
  if (row.reporter_role !== 'OPS_MANAGER') return false;
  const source = row.detail && typeof row.detail.source === 'string' ? row.detail.source : '';
  return source !== OPS_INTELLIGENCE_DIGEST_SOURCE;
}

function buildPatterns(reports: RawReport[]): OpsIntelligencePattern[] {
  const patterns: OpsIntelligencePattern[] = [];

  const byCategory = new Map<string, number>();
  for (const r of reports) {
    byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + 1);
  }
  for (const [category, count] of byCategory) {
    if (count >= 2) {
      const bucket = Object.values(OPS_INTELLIGENCE_BUCKETS).find((b) => b.categories.includes(category));
      patterns.push({
        kind: 'category_repeat',
        labelAr: `تكرار تقارير «${bucket?.labelAr ?? category}» (${count} مرات)`,
        count,
      });
    }
  }

  const byClient = new Map<string, number>();
  for (const r of reports) {
    byClient.set(r.client_id, (byClient.get(r.client_id) ?? 0) + 1);
  }
  for (const [clientId, count] of byClient) {
    if (count >= 2) {
      patterns.push({
        kind: 'client_repeat',
        labelAr: `العميل ${clientId}: ${count} تقارير خلال 24 ساعة`,
        count,
      });
    }
  }

  const byTitle = new Map<string, number>();
  for (const r of reports) {
    const key = normalizeTitleKey(r.title);
    if (key.length < 6) continue;
    byTitle.set(key, (byTitle.get(key) ?? 0) + 1);
  }
  for (const [, count] of byTitle) {
    if (count >= 2) {
      patterns.push({
        kind: 'title_repeat',
        labelAr: `عنوان متكرر في أكثر من تقرير (${count} مرات)`,
        count,
      });
    }
  }

  return patterns.slice(0, 6);
}

function buildRedFlags(reports: RawReport[]): OpsIntelligenceRedFlag[] {
  return reports
    .filter((r) => r.severity === 'urgent')
    .map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      clientId: r.client_id,
      category: r.category,
      submittedAt: r.submitted_at,
    }));
}

function bucketLines(reports: RawReport[], maxItems = 4): string[] {
  if (reports.length === 0) return ['— لا تقارير في هذه الفئة.'];
  return reports.slice(0, maxItems).map((r) => {
    const label = r.client_label ? `${r.client_id} (${r.client_label})` : r.client_id;
    return `• ${r.title} — ${label}`;
  });
}

export function synthesizeOpsIntelligenceBriefing(reports: RawReport[], now = new Date()): OpsIntelligenceBriefing {
  const anchor = getOpsBillingTemporalAnchor(now);
  const byBucket: Record<OpsIntelligenceBucketKey, RawReport[]> = {
    service_quality: [],
    technical_issues: [],
    geographical_coverage: [],
  };

  for (const report of reports) {
    byBucket[classifyBucket(report.category)].push(report);
  }

  const redFlags = buildRedFlags(reports);
  const patterns = buildPatterns(reports);

  const header = [
    `موجز المؤسس اليومي — ${anchor.labelAr}`,
    'Professional Sovereignty · Internal B2B',
    '',
    `فترة التجميع: آخر 24 ساعة · ${reports.length} تقرير ميداني من OPS_MANAGER`,
    '',
  ];

  const sections = (Object.keys(OPS_INTELLIGENCE_BUCKETS) as OpsIntelligenceBucketKey[]).flatMap((key) => {
    const bucket = OPS_INTELLIGENCE_BUCKETS[key];
    const items = byBucket[key];
    return [
      `【${bucket.labelAr}】 (${items.length})`,
      ...bucketLines(items),
      '',
    ];
  });

  const redFlagSection =
    redFlags.length > 0
      ? [
          '🚩 تنبيهات عاجلة (Red Flags)',
          ...redFlags.map((f) => `• [عاجل] ${f.title} — ${f.clientId}: ${f.summary.slice(0, 120)}`),
          '',
        ]
      : ['✓ لا توجد تنبيهات عاجلة في هذه الدورة.', ''];

  const patternSection =
    patterns.length > 0
      ? ['📊 أنماط متكررة (Patterns)', ...patterns.map((p) => `• ${p.labelAr}`), '']
      : ['📊 لا أنماط متكررة بارزة في هذه الدورة.', ''];

  const closing =
    reports.length === 0
      ? 'الخلاصة: لم تُرفع تقارير OPS_MANAGER خلال الـ24 ساعة الماضية. الوضع التشغيلي مستقر ضمن حدود الرصد الحالية — مع استمرار السيادة التشغيلية المهنية.'
      : redFlags.length > 0
        ? 'الخلاصة: تتطلب التنبيهات العاجلة متابعة فورية من قيادة المؤسسة. راجع التغذية التشغيلية للتفاصيل الكاملة.'
        : patterns.length > 0
          ? 'الخلاصة: رُصدت أنماط متكررة تستحق المتابعة الاستباقية — دون تصعيد عاجل حالياً.'
          : 'الخلاصة: دورة التقارير ضمن المعدل الطبيعي. استمر في الرصد بموجب السيادة التشغيلية المهنية.';

  const briefingText = [...header, ...sections, ...redFlagSection, ...patternSection, closing].join('\n');

  return {
    digestYmd: anchor.todayYmd,
    labelAr: anchor.labelAr,
    windowHours: 24,
    totalReports: reports.length,
    byBucket,
    redFlags,
    patterns,
    summaryText: closing,
    briefingText,
  };
}

async function digestAlreadySent(
  supabase: SupabaseClient,
  digestYmd: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('platform_ops_controller_reports')
    .select('id')
    .filter('detail->>source', 'eq', OPS_INTELLIGENCE_DIGEST_SOURCE)
    .filter('detail->>digest_ymd', 'eq', digestYmd)
    .limit(1);
  if (error) return false;
  return Array.isArray(data) && data.length > 0;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendOpsIntelligenceDigestEmail(
  briefing: OpsIntelligenceBriefing,
  recipients: string[],
): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  if (recipients.length === 0) {
    return { ok: false, error: 'no_recipients', skipped: true };
  }

  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmail = (process.env.RESEND_FROM_EMAIL || '').trim();
  if (!resendApiKey || !fromEmail) {
    return { ok: false, error: 'email_service_unavailable', skipped: true };
  }

  const subject = `حلاق ماب · ملخص تشغيلي داخلي — ${briefing.digestYmd}`;
  const text = briefing.briefingText;
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:24px;background:#0f172a;color:#e2e8f0">
<p style="font-size:12px;color:#94a3b8;letter-spacing:0.04em">Professional Sovereignty · Internal B2B · System Summary</p>
<h2 style="color:#f8fafc;margin:0 0 12px">موجز المؤسس اليومي</h2>
<p style="color:#cbd5e1">${escapeHtml(briefing.labelAr)}</p>
<pre style="white-space:pre-wrap;font-family:Tahoma,Arial,sans-serif;font-size:14px;background:#1e293b;border:1px solid #334155;border-radius:12px;padding:16px;color:#e2e8f0">${escapeHtml(briefing.briefingText)}</pre>
<p style="font-size:12px;color:#64748b">— نظام تقارير العمليات · حلاق ماب</p>
</body></html>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipients,
      subject,
      text,
      html,
    }),
  });

  if (!resp.ok) {
    const raw = await resp.text();
    return { ok: false, error: raw.slice(0, 400) };
  }
  return { ok: true };
}

export async function runOpsIntelligenceReport(
  supabase: SupabaseClient,
  options: { force?: boolean } = {},
): Promise<{
  ok: true;
  skipped?: boolean;
  reason?: string;
  briefing: OpsIntelligenceBriefing;
  reportId?: string;
  email?: { ok: boolean; error?: string; skipped?: boolean };
}> {
  const anchor = getOpsBillingTemporalAnchor();
  if (!options.force && (await digestAlreadySent(supabase, anchor.todayYmd))) {
    return {
      ok: true,
      skipped: true,
      reason: 'digest_already_sent_today',
      briefing: synthesizeOpsIntelligenceBriefing([]),
    };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('platform_ops_controller_reports')
    .select(
      'id, submitted_at, client_id, client_label, reporter_email, reporter_role, category, severity, title, summary, detail',
    )
    .gte('submitted_at', since)
    .eq('reporter_role', 'OPS_MANAGER')
    .order('submitted_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Feed query failed');
  }

  const rows = (Array.isArray(data) ? data : []) as RawReport[];
  const fieldReports = rows.filter(isFieldReport);
  const briefing = synthesizeOpsIntelligenceBriefing(fieldReports);

  const submittedAt = new Date().toISOString();
  const severity = briefing.redFlags.length > 0 ? 'urgent' : briefing.patterns.length > 0 ? 'watch' : 'info';

  const insertRow = {
    submitted_at: submittedAt,
    client_id: 'PLATFORM',
    client_label: 'Operations Intelligence',
    reporter_email: 'system@halaqmap.internal',
    reporter_role: OPS_INTELLIGENCE_SYSTEM_ROLE,
    category: 'other',
    severity,
    title: `موجز المؤسس اليومي — ${briefing.digestYmd}`,
    summary: briefing.summaryText,
    detail: {
      source: OPS_INTELLIGENCE_DIGEST_SOURCE,
      digest_ymd: briefing.digestYmd,
      window_hours: briefing.windowHours,
      total_field_reports: briefing.totalReports,
      red_flags: briefing.redFlags,
      patterns: briefing.patterns,
      by_bucket: {
        service_quality: briefing.byBucket.service_quality.length,
        technical_issues: briefing.byBucket.technical_issues.length,
        geographical_coverage: briefing.byBucket.geographical_coverage.length,
      },
      briefing_text: briefing.briefingText,
    },
  };

  const { data: inserted, error: insertErr } = await supabase
    .from('platform_ops_controller_reports')
    .insert(insertRow)
    .select('id')
    .single();

  if (insertErr || !inserted?.id) {
    throw new Error(insertErr?.message || 'Digest insert failed');
  }

  const email = await sendOpsIntelligenceDigestEmail(briefing, getFounderDigestRecipients());

  return {
    ok: true,
    briefing,
    reportId: String(inserted.id),
    email,
  };
}
