# Ops Controller, Radar & Intelligence

> Export group `GROUP-06-OPS-RADAR` · Commit `b0e9e73`

### `api/ops-controller.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  isBootstrapAdminEmail,
  safeHost,
  verifyPlatformAdminFromRequestAny,
} from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

const CATEGORIES = new Set([
  'field_issue',
  'partner_friction',
  'compliance',
  'billing_ops',
  'geo_presence',
  'other',
]);

const SEVERITIES = new Set(['info', 'watch', 'urgent']);

const OPS_MANAGER_ROLE = 'OPS_MANAGER';

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(data: unknown, status: number, request: Request): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      ...corsHeaders(request),
    },
  });
}

function getServiceEnv(): { url: string; serviceRole: string } | null {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) return null;
  return { url, serviceRole };
}

function mapRow(raw: Record<string, unknown>) {
  return {
    id: String(raw.id),
    submittedAt: String(raw.submitted_at ?? raw.created_at ?? ''),
    clientId: String(raw.client_id ?? ''),
    clientLabel: raw.client_label != null ? String(raw.client_label) : undefined,
    reporterEmail: String(raw.reporter_email ?? ''),
    reporterRole: OPS_MANAGER_ROLE,
    category: String(raw.category ?? 'other'),
    severity: String(raw.severity ?? 'info'),
    title: String(raw.title ?? ''),
    summary: String(raw.summary ?? ''),
    detail:
      raw.detail && typeof raw.detail === 'object' && !Array.isArray(raw.detail)
        ? (raw.detail as Record<string, unknown>)
        : undefined,
  };
}

async function actorCanViewAllReports(
  supabase: SupabaseClient,
  actorEmail: string,
): Promise<boolean> {
  if (isBootstrapAdminEmail(actorEmail)) return true;
  const { data } = await supabase
    .from('platform_admin_roles')
    .select('permissions')
    .eq('email', actorEmail)
    .maybeSingle();
  const perms =
    data?.permissions && typeof data.permissions === 'object'
      ? (data.permissions as Record<string, unknown>)
      : {};
  return Boolean(perms.view_ops_controller || perms.view_overview);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) {
    return json({ error: 'Server not configured', serverUrlHost: safeHost('') }, 503, request);
  }

  const gate = await verifyPlatformAdminFromRequestAny(request, env.url, env.serviceRole, [
    'view_ops_controller',
    'submit_ops_controller',
    'view_overview',
  ]);
  if (gate.ok === false) {
    return json(gate.json, gate.status, request);
  }

  const urlObj = new URL(request.url);
  const limitRaw = Number(urlObj.searchParams.get('limit') || '40');
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.floor(limitRaw), 1), 100) : 40;

  let query = gate.supabase
    .from('platform_ops_controller_reports')
    .select(
      'id, created_at, submitted_at, client_id, client_label, reporter_email, reporter_role, category, severity, title, summary, detail',
    )
    .order('submitted_at', { ascending: false })
    .limit(limit);

  const seeAll = await actorCanViewAllReports(gate.supabase, gate.actorEmail);
  if (!seeAll) {
    query = query.eq('reporter_email', gate.actorEmail);
  }

  const { data, error } = await query;
  if (error) {
    return json({ error: error.message || 'Feed query failed' }, 500, request);
  }

  const reports = (Array.isArray(data) ? data : []).map((row) =>
    mapRow(row as Record<string, unknown>),
  );

  return json({ reports }, 200, request);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) {
    return json({ error: 'Server not configured' }, 503, request);
  }

  const gate = await verifyPlatformAdminFromRequestAny(request, env.url, env.serviceRole, [
    'submit_ops_controller',
  ]);
  if (gate.ok === false) {
    return json(gate.json, gate.status, request);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, request);
  }

  const payload = body as Record<string, unknown>;
  const clientId = String(payload.clientId ?? '').trim();
  const clientLabel = String(payload.clientLabel ?? '').trim();
  const category = String(payload.category ?? '').trim();
  const severity = String(payload.severity ?? 'info').trim();
  const title = String(payload.title ?? '').trim();
  const summary = String(payload.summary ?? '').trim();

  if (!clientId) {
    return json({ error: 'clientId is required' }, 400, request);
  }
  if (!CATEGORIES.has(category)) {
    return json({ error: 'Invalid category', allowed: [...CATEGORIES] }, 400, request);
  }
  if (!SEVERITIES.has(severity)) {
    return json({ error: 'Invalid severity', allowed: [...SEVERITIES] }, 400, request);
  }
  if (title.length < 4) {
    return json({ error: 'title too short' }, 400, request);
  }
  if (summary.length < 12) {
    return json({ error: 'summary too short' }, 400, request);
  }

  const submittedAt = new Date().toISOString();
  const insertRow = {
    submitted_at: submittedAt,
    client_id: clientId,
    client_label: clientLabel || null,
    reporter_email: gate.actorEmail,
    reporter_role: OPS_MANAGER_ROLE,
    category,
    severity,
    title,
    summary,
    detail: {
      source: 'ops_controller_ui',
      submitted_at: submittedAt,
      client_id: clientId,
    },
  };

  const { data, error } = await gate.supabase
    .from('platform_ops_controller_reports')
    .insert(insertRow)
    .select(
      'id, created_at, submitted_at, client_id, client_label, reporter_email, reporter_role, category, severity, title, summary, detail',
    )
    .single();

  if (error || !data) {
    return json({ error: error?.message || 'Insert failed' }, 500, request);
  }

  return json({ ok: true, report: mapRow(data as Record<string, unknown>) }, 201, request);
}

```

### `api/ops-intelligence-report.ts`

```typescript
/**
 * Operations Intelligence Report — daily founder briefing from OPS_MANAGER field reports.
 * Cron: GET ?cron=1 at 05:00 UTC (08:00 Asia/Riyadh) via vercel.json
 */
import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { isCronAuthorized } from './_lib/cronAuth.js';
import { runOpsIntelligenceReport } from './_lib/opsIntelligenceReport.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 60 };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

async function getServiceSupabase() {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return { ok: false as const, status: 503, body: { error: 'Server not configured' } };
  }
  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { ok: true as const, supabase, url };
}

export async function GET(request: Request): Promise<Response> {
  const base = await getServiceSupabase();
  if (base.ok === false) return json(base.body, base.status);

  const urlObj = new URL(request.url);
  const isCron = urlObj.searchParams.get('cron') === '1';
  const force = urlObj.searchParams.get('force') === '1';

  if (isCron) {
    if (!isCronAuthorized(request)) {
      return json({ error: 'Unauthorized cron' }, 401);
    }
  } else {
    const gate = await verifyPlatformAdminFromRequestAny(
      request,
      base.url,
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      ['view_overview', 'view_ops_controller'],
    );
    if (gate.ok === false) {
      return json(gate.json, gate.status);
    }
    if (!gate.actorEmail) {
      return json({ error: 'Unauthorized' }, 401);
    }
  }

  try {
    const result = await runOpsIntelligenceReport(base.supabase, { force: force || isCron });
    return json({
      ok: true,
      route: 'ops-intelligence-report',
      skipped: result.skipped ?? false,
      reason: result.reason,
      reportId: result.reportId,
      digestYmd: result.briefing.digestYmd,
      totalFieldReports: result.briefing.totalReports,
      redFlags: result.briefing.redFlags.length,
      patterns: result.briefing.patterns.length,
      email: result.email,
      summary: result.briefing.summaryText,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Report generation failed';
    return json({ error: message }, 500);
  }
}

```

### `api/_lib/opsIntelligenceReport.ts`

```typescript
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

```

### `api/_lib/platformRadarBroadcastServer.ts`

```typescript
/**
 * Server-side fallback broadcast for Platform Radar (when DB trigger is unavailable).
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type PlatformRadarBroadcastPayload = {
  id: string;
  kind: 'user_search';
  lat: number;
  lng: number;
  createdAt: string;
  label?: string;
  suspicious?: boolean;
  scopeType?: string;
};

const CHANNEL = 'platform_radar_channel';
const EVENT = 'user_search';

export function isKsaGeoPulse(lat: number, lng: number): boolean {
  return lat >= 16 && lat <= 33.5 && lng >= 34 && lng <= 56.5;
}

export async function broadcastPlatformRadarUserSearchServer(
  supabase: SupabaseClient,
  payload: PlatformRadarBroadcastPayload,
  authToken?: string,
): Promise<void> {
  try {
    const token = authToken?.trim();
    if (token) {
      await supabase.realtime.setAuth(token);
    }

    const channel = supabase.channel(CHANNEL, {
      config: { private: true, broadcast: { self: false, ack: false } },
    });

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        void supabase.removeChannel(channel);
        reject(new Error('radar broadcast timeout'));
      }, 3500);

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.send({
              type: 'broadcast',
              event: EVENT,
              payload,
            });
            clearTimeout(timeout);
            await supabase.removeChannel(channel);
            resolve();
          } catch (e) {
            clearTimeout(timeout);
            await supabase.removeChannel(channel);
            reject(e);
          }
          return;
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timeout);
          void supabase.removeChannel(channel);
          reject(new Error(`radar broadcast ${status}`));
        }
      });
    });
  } catch {
    // DB trigger or polling may still deliver the pulse
  }
}

```

### `api/admin-radar-pulses.ts`

```typescript
/**
 * GET /api/admin-radar-pulses
 * Live geo pulses for Platform Radar tactical map (search activity + security events).
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

type UserSearchRow = {
  id: string;
  created_at: string;
  search_log_id: string | null;
  user_lat: number;
  user_lng: number;
  district_name: string | null;
  city_name: string | null;
  scope_type: string;
  suspicious: boolean;
};

type SearchRow = {
  id: string;
  created_at: string;
  user_lat: number | null;
  user_lng: number | null;
  district_name: string | null;
  city_name: string | null;
  scope_type: string;
  result_count: number | null;
  rpc_result_count: number | null;
  location_sharing: boolean;
};

type SecurityRow = {
  id: string;
  created_at: string;
  severity: string;
  event_code: string;
  message: string | null;
  barber_id: string | null;
};

type BarberCoordRow = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
};

function isInKsa(lat: number, lng: number): boolean {
  return lat >= 16 && lat <= 33.5 && lng >= 34 && lng <= 56.5;
}

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)}|${lng.toFixed(3)}`;
}

function markSuspiciousSearchRows(rows: SearchRow[]): Map<string, boolean> {
  const freq = new Map<string, number>();
  for (const r of rows) {
    const lat = r.user_lat;
    const lng = r.user_lng;
    if (lat == null || lng == null) continue;
    const k = coordKey(lat, lng);
    freq.set(k, (freq.get(k) ?? 0) + 1);
  }

  const out = new Map<string, boolean>();
  for (const r of rows) {
    const lat = r.user_lat;
    const lng = r.user_lng;
    if (lat == null || lng == null) {
      out.set(r.id, false);
      continue;
    }
    const zeroResults =
      (r.result_count != null && r.result_count === 0) ||
      (r.rpc_result_count != null && r.rpc_result_count === 0);
    const rapidCluster = (freq.get(coordKey(lat, lng)) ?? 0) >= 3;
    const probeScope = r.scope_type === 'filter' || r.scope_type === 'composite';
    out.set(r.id, zeroResults || rapidCluster || probeScope);
  }
  return out;
}

export async function OPTIONS(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const headers = corsHeaders(request);
  const serverUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!serverUrl || !isLikelyHttpUrl(serverUrl) || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'view_command_center',
    'view_overview',
  ]);
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }

  const urlObj = new URL(request.url);
  const minutesRaw = Number(urlObj.searchParams.get('minutes') ?? 120);
  const minutes = Number.isFinite(minutesRaw) ? Math.min(360, Math.max(15, minutesRaw)) : 120;
  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const sinceSecurity = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const supabase = adminAuth.supabase;

  const [searchRes, userSearchRes, securityRes] = await Promise.all([
    supabase
      .from('search_activity_logs')
      .select(
        'id, created_at, user_lat, user_lng, district_name, city_name, scope_type, result_count, rpc_result_count, location_sharing',
      )
      .gte('created_at', since)
      .not('user_lat', 'is', null)
      .not('user_lng', 'is', null)
      .order('created_at', { ascending: false })
      .limit(400),
    supabase
      .from('user_searches')
      .select('id, created_at, search_log_id, user_lat, user_lng, district_name, city_name, scope_type, suspicious')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(400),
    supabase
      .from('platform_booking_security_log')
      .select('id, created_at, severity, event_code, message, barber_id')
      .gte('created_at', sinceSecurity)
      .order('created_at', { ascending: false })
      .limit(120),
  ]);

  if (searchRes.error) {
    return Response.json({ error: searchRes.error.message || 'Search pulse query failed' }, { status: 500, headers });
  }
  if (securityRes.error) {
    return Response.json({ error: securityRes.error.message || 'Security pulse query failed' }, { status: 500, headers });
  }

  const searchRows = (searchRes.data ?? []) as SearchRow[];
  const userSearchRows = userSearchRes.error ? [] : ((userSearchRes.data ?? []) as UserSearchRow[]);
  const suspiciousMap = markSuspiciousSearchRows(searchRows);

  const securityRows = (securityRes.data ?? []) as SecurityRow[];
  const barberIds = [
    ...new Set(securityRows.map((r) => r.barber_id).filter((id): id is string => Boolean(id))),
  ];

  const barberCoordById = new Map<string, BarberCoordRow>();
  if (barberIds.length > 0) {
    const barbersRes = await supabase
      .from('barbers')
      .select('id, latitude, longitude, city')
      .in('id', barberIds);
    if (!barbersRes.error) {
      for (const row of (barbersRes.data ?? []) as BarberCoordRow[]) {
        barberCoordById.set(row.id, row);
      }
    }
  }

  const userPulsesFromLogs = searchRows
    .filter((r) => {
      const lat = r.user_lat;
      const lng = r.user_lng;
      return lat != null && lng != null && isInKsa(lat, lng);
    })
    .map((r) => ({
      id: r.id,
      kind: 'user_search' as const,
      lat: r.user_lat as number,
      lng: r.user_lng as number,
      createdAt: r.created_at,
      label: [r.district_name, r.city_name].filter(Boolean).join(' · ') || r.scope_type,
      suspicious: suspiciousMap.get(r.id) ?? false,
      scopeType: r.scope_type,
    }));

  const userPulsesFromRadar = userSearchRows
    .filter((r) => isInKsa(r.user_lat, r.user_lng))
    .map((r) => ({
      id: r.id,
      kind: 'user_search' as const,
      lat: r.user_lat,
      lng: r.user_lng,
      createdAt: r.created_at,
      label: [r.district_name, r.city_name].filter(Boolean).join(' · ') || r.scope_type,
      suspicious: r.suspicious,
      scopeType: r.scope_type,
    }));

  const userPulseById = new Map<string, (typeof userPulsesFromRadar)[number]>();
  for (const p of userPulsesFromLogs) userPulseById.set(p.id, p);
  for (const p of userPulsesFromRadar) userPulseById.set(p.id, p);
  const userPulses = [...userPulseById.values()];

  const securityPulses = securityRows
    .map((r) => {
      const barber = r.barber_id ? barberCoordById.get(r.barber_id) : undefined;
      const lat = barber?.latitude;
      const lng = barber?.longitude;
      if (lat == null || lng == null || !isInKsa(lat, lng)) return null;
      return {
        id: r.id,
        kind: 'security' as const,
        lat,
        lng,
        createdAt: r.created_at,
        label: r.message || r.event_code,
        suspicious: true,
        severity: r.severity,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p != null);

  const pulses = [...userPulses, ...securityPulses].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );

  return Response.json(
    {
      ok: true,
      generatedAt: new Date().toISOString(),
      windowMinutes: minutes,
      userPulseCount: userPulses.length,
      suspiciousCount: pulses.filter((p) => p.suspicious).length,
      pulses,
    },
    { status: 200, headers: { ...headers, 'Cache-Control': 'private, no-store, max-age=0' } },
  );
}

```

### `src/lib/opsControllerRemote.ts`

```typescript
import { getSupabaseClient } from '@/integrations/supabase/client';
import type {
  OpsControllerFeedResponse,
  OpsControllerReportInput,
  OpsControllerSubmitResponse,
} from '@/modules/ops-controller/types';

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token?.trim()) return null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token.trim()}`,
  };
  const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (url) headers['x-client-supabase-url'] = url;
  return headers;
}

export async function fetchOpsControllerFeed(limit = 40): Promise<
  { ok: true; body: OpsControllerFeedResponse } | { ok: false; error: string; status?: number }
> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا توجد جلسة إدارة.' };
  try {
    const res = await fetch(`/api/ops-controller?limit=${encodeURIComponent(String(limit))}`, {
      method: 'GET',
      headers,
    });
    const body = (await res.json().catch(() => ({}))) as OpsControllerFeedResponse & { error?: string };
    if (!res.ok) return { ok: false, error: body.error || `HTTP ${res.status}`, status: res.status };
    return { ok: true, body: { reports: Array.isArray(body.reports) ? body.reports : [] } };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function submitOpsControllerReport(
  input: OpsControllerReportInput,
): Promise<{ ok: true; body: OpsControllerSubmitResponse } | { ok: false; error: string; status?: number }> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: 'لا توجد جلسة إدارة.' };
  try {
    const res = await fetch('/api/ops-controller', {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
    const body = (await res.json().catch(() => ({}))) as OpsControllerSubmitResponse & { error?: string };
    if (!res.ok) return { ok: false, error: body.error || `HTTP ${res.status}`, status: res.status };
    if (!body.report?.id) return { ok: false, error: 'استجابة غير متوقعة من الخادم.' };
    return { ok: true, body: body as OpsControllerSubmitResponse };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

```

### `src/lib/engineeringCouncilRemote.ts`

```typescript
import { getSupabaseClient } from '@/integrations/supabase/client';
import type { AgentCouncilMessage, EngineeringExecution } from '@/modules/ai-staff/types';

const COUNCIL_API = '/api/admin-engineering-council';

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function formatError(json: Record<string, unknown>, status: number): string {
  return typeof json.error === 'string' ? json.error : `HTTP ${status}`;
}

export async function fetchEngineeringCouncil(threadId?: string): Promise<
  | {
      ok: true;
      messages: AgentCouncilMessage[];
      executions: EngineeringExecution[];
      pendingApprovals: EngineeringExecution[];
      cursorConfigured: boolean;
    }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const qs = threadId ? `?threadId=${encodeURIComponent(threadId)}` : '';
  const res = await fetch(`${COUNCIL_API}${qs}`, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false, error: formatError(json, res.status) };

  return {
    ok: true,
    messages: Array.isArray(json.messages) ? (json.messages as AgentCouncilMessage[]) : [],
    executions: Array.isArray(json.executions) ? (json.executions as EngineeringExecution[]) : [],
    pendingApprovals: Array.isArray(json.pendingApprovals)
      ? (json.pendingApprovals as EngineeringExecution[])
      : [],
    cursorConfigured: Boolean((json.cursor as { cursorApiKeyConfigured?: boolean })?.cursorApiKeyConfigured),
  };
}

export async function proposeEngineeringTask(input: {
  title: string;
  taskDescription: string;
}): Promise<
  | { ok: true; execution: EngineeringExecution; messages: AgentCouncilMessage[] }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(COUNCIL_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'propose_task', ...input }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false, error: formatError(json, res.status) };

  return {
    ok: true,
    execution: json.execution as EngineeringExecution,
    messages: Array.isArray(json.messages) ? (json.messages as AgentCouncilMessage[]) : [],
  };
}

export async function proposeProsecutorDrivenRefactor(): Promise<
  | { ok: true; suggestion: string; execution?: EngineeringExecution }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(COUNCIL_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'prosecutor_refactor' }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false, error: formatError(json, res.status) };

  return {
    ok: true,
    suggestion: String(json.suggestion ?? ''),
    execution: json.execution as EngineeringExecution | undefined,
  };
}

export async function approveEngineeringExecutionRemote(executionId: string): Promise<
  | { ok: true; execution: EngineeringExecution; messageAr: string }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(COUNCIL_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'approve_execution', executionId }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false, error: formatError(json, res.status) };

  const cursorResult = json.cursorResult as { messageAr?: string } | undefined;
  return {
    ok: true,
    execution: json.execution as EngineeringExecution,
    messageAr: cursorResult?.messageAr ?? 'تمت الموافقة على التنفيذ.',
  };
}

export async function rejectEngineeringExecutionRemote(
  executionId: string,
  reason?: string,
): Promise<{ ok: true; execution: EngineeringExecution } | { ok: false; error: string }> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(COUNCIL_API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ action: 'reject_execution', executionId, reason }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) return { ok: false, error: formatError(json, res.status) };

  return { ok: true, execution: json.execution as EngineeringExecution };
}

export async function fetchPendingEngineeringApprovals(): Promise<
  | { ok: true; pendingApprovals: EngineeringExecution[] }
  | { ok: false; error: string }
> {
  const result = await fetchEngineeringCouncil();
  if (!result.ok) return result;
  return { ok: true, pendingApprovals: result.pendingApprovals };
}

```

### `src/lib/engineeringHandshakeRemote.ts`

```typescript
import { getSupabaseClient } from '@/integrations/supabase/client';

const HANDSHAKE_API = '/api/admin-engineering-handshake';

export type HandshakeServicePing = {
  id: 'supabase' | 'vercel' | 'github';
  label: string;
  ok: boolean;
  latencyMs: number;
  message: string;
  detail?: Record<string, unknown>;
};

export type EngineeringHandshakeSnapshot = {
  status: 'ok' | 'fail' | 'pending';
  handshakeAt: string | null;
  services: HandshakeServicePing[];
  vercelDeploymentUrl: string | null;
  vercelDeploymentId: string | null;
  opsControllerEnabled: boolean;
  updatedAt: string | null;
  systemStatus: 'OK' | 'FAIL' | 'PENDING';
  secretIssues: string[];
};

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchEngineeringHandshakeStatus(): Promise<
  | { ok: true; snapshot: EngineeringHandshakeSnapshot; diagnostics: Record<string, unknown> }
  | { ok: false; error: string }
> {
  try {
    const h = await authHeaders();
    if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

    const res = await fetch(HANDSHAKE_API, {
      method: 'GET',
      headers: h,
      credentials: 'include',
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      stored?: {
        status?: string;
        handshakeAt?: string | null;
        services?: HandshakeServicePing[];
        vercelDeploymentUrl?: string | null;
        vercelDeploymentId?: string | null;
        opsControllerEnabled?: boolean;
        updatedAt?: string | null;
      } | null;
      diagnostics?: { secretIssues?: string[] };
    };

    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error || `HTTP ${res.status}` };
    }

    const stored = json.stored;
    const status = (stored?.status as EngineeringHandshakeSnapshot['status']) || 'pending';
    const systemStatus: EngineeringHandshakeSnapshot['systemStatus'] =
      status === 'ok' ? 'OK' : status === 'fail' ? 'FAIL' : 'PENDING';

    return {
      ok: true,
      diagnostics: (json.diagnostics as Record<string, unknown>) || {},
      snapshot: {
        status,
        handshakeAt: stored?.handshakeAt ?? null,
        services: Array.isArray(stored?.services) ? stored.services : [],
        vercelDeploymentUrl: stored?.vercelDeploymentUrl ?? null,
        vercelDeploymentId: stored?.vercelDeploymentId ?? null,
        opsControllerEnabled: Boolean(stored?.opsControllerEnabled),
        updatedAt: stored?.updatedAt ?? null,
        systemStatus,
        secretIssues: Array.isArray(json.diagnostics?.secretIssues)
          ? (json.diagnostics?.secretIssues as string[])
          : [],
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Handshake fetch failed' };
  }
}

export async function runEngineeringHandshakeRemote(): Promise<
  | {
      ok: true;
      systemStatus: 'OK' | 'FAIL';
      opsControllerEnabled: boolean;
      vercelDeploymentUrl: string | null;
      snapshot: EngineeringHandshakeSnapshot;
    }
  | { ok: false; error: string }
> {
  try {
    const h = await authHeaders();
    if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

    const res = await fetch(HANDSHAKE_API, {
      method: 'POST',
      headers: h,
      credentials: 'include',
      body: JSON.stringify({ action: 'handshake' }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      messageAr?: string;
      systemStatus?: 'OK' | 'FAIL';
      opsControllerEnabled?: boolean;
      vercelDeploymentUrl?: string | null;
      result?: {
        status?: 'ok' | 'fail';
        checkedAt?: string;
        secretIssues?: string[];
        services?: HandshakeServicePing[];
        vercelDeploymentUrl?: string | null;
        vercelDeploymentId?: string | null;
        opsControllerEnabled?: boolean;
      };
    };

    if (!res.ok || !json.ok) {
      return { ok: false, error: json.messageAr || json.error || `HTTP ${res.status}` };
    }

    const result = json.result;
    const status = result?.status ?? 'fail';
    return {
      ok: true,
      systemStatus: json.systemStatus ?? (status === 'ok' ? 'OK' : 'FAIL'),
      opsControllerEnabled: Boolean(json.opsControllerEnabled),
      vercelDeploymentUrl: json.vercelDeploymentUrl ?? result?.vercelDeploymentUrl ?? null,
      snapshot: {
        status,
        handshakeAt: result?.checkedAt ?? new Date().toISOString(),
        services: result?.services ?? [],
        vercelDeploymentUrl: result?.vercelDeploymentUrl ?? null,
        vercelDeploymentId: result?.vercelDeploymentId ?? null,
        opsControllerEnabled: Boolean(result?.opsControllerEnabled),
        updatedAt: result?.checkedAt ?? null,
        systemStatus: json.systemStatus ?? (status === 'ok' ? 'OK' : 'FAIL'),
        secretIssues: result?.secretIssues ?? [],
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Handshake failed' };
  }
}

```

### `src/lib/superIntelligenceFeedRemote.ts`

```typescript
import { getSupabaseClient } from '@/integrations/supabase/client';

const FEED_API = '/api/admin-super-intelligence-feed';

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export type SuperIntelligenceFeedSnapshot = {
  baseline: {
    complianceGaps: number;
    inspectorPulseCount24h: number;
    urgentOpsReports24h: number;
    pendingEngineeringApprovals: number;
    handshakeOk: boolean;
    crisisWatchActive: boolean;
  };
  councilMessages: Array<{
    id: string;
    created_at: string;
    from_agent: string;
    to_agent: string;
    message_type: string;
    severity: string;
    title: string;
    body: string;
  }>;
  executions: Array<{
    id: string;
    title: string;
    status: string;
    updated_at: string;
    detail?: Record<string, unknown>;
  }>;
  doctrineMode: string;
};

export async function fetchSuperIntelligenceFeed(): Promise<
  { ok: true; snapshot: SuperIntelligenceFeedSnapshot } | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(FEED_API, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    snapshot?: SuperIntelligenceFeedSnapshot;
  };
  if (!res.ok || !json.ok || !json.snapshot) {
    return { ok: false, error: json.error || `HTTP ${res.status}` };
  }
  return { ok: true, snapshot: json.snapshot };
}

```
