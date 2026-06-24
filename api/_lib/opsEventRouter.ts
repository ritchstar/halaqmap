import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getFounderDigestRecipients } from './opsIntelligenceReport.js';
import { isCronAuthorized } from './cronAuth.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './supabaseUrl.js';

export const OPS_EVENT_ROUTER_SOURCE = 'ops_event_router' as const;
export const OPS_EVENT_SYSTEM_ROLE = 'SYSTEM' as const;
export const OPS_EVENT_REPORTER_EMAIL = 'ops-router@halaqmap.internal';

export type OpsEventType =
  | 'registration.new'
  | 'registration.stale'
  | 'barber.missing_user_id'
  | 'barber.missing_location'
  | 'barber.credentials_email_failed'
  | 'barber.provision_failed'
  | 'payment.failed'
  | 'chat.maintenance_failed'
  | 'push.unauthorized'
  | 'api.error'
  | 'health.scan';

export type OpsEventSeverity = 'info' | 'watch' | 'urgent';

export type OpsEventCategory =
  | 'field_issue'
  | 'partner_friction'
  | 'compliance'
  | 'billing_ops'
  | 'geo_presence'
  | 'other';

export type OpsEventInput = {
  type: OpsEventType;
  severity?: OpsEventSeverity;
  title: string;
  summary: string;
  clientId?: string;
  clientLabel?: string;
  category?: OpsEventCategory;
  detail?: Record<string, unknown>;
  /** يمنع تكرار نفس التنبيه خلال dedupeHours */
  dedupeKey?: string;
  dedupeHours?: number;
};

export type OpsEventDispatchResult = {
  type: OpsEventType;
  severity: OpsEventSeverity;
  skipped?: boolean;
  skipReason?: string;
  actions: {
    opsReport?: { ok: boolean; id?: string; error?: string; skipped?: boolean };
    slack?: { ok: boolean; skipped?: boolean; error?: string };
    email?: { ok: boolean; skipped?: boolean; error?: string };
  };
};

type RuleActions = {
  slack: boolean;
  email: boolean;
  opsReport: boolean;
};

const DEFAULT_SEVERITY: Record<OpsEventType, OpsEventSeverity> = {
  'registration.new': 'info',
  'registration.stale': 'watch',
  'barber.missing_user_id': 'urgent',
  'barber.missing_location': 'info',
  'barber.credentials_email_failed': 'watch',
  'barber.provision_failed': 'urgent',
  'payment.failed': 'watch',
  'chat.maintenance_failed': 'watch',
  'push.unauthorized': 'urgent',
  'api.error': 'watch',
  'health.scan': 'info',
};

const RULE_ACTIONS: Record<OpsEventType, RuleActions> = {
  'registration.new': { slack: true, email: false, opsReport: true },
  'registration.stale': { slack: true, email: true, opsReport: true },
  'barber.missing_user_id': { slack: true, email: true, opsReport: true },
  'barber.missing_location': { slack: false, email: false, opsReport: true },
  'barber.credentials_email_failed': { slack: true, email: false, opsReport: true },
  'barber.provision_failed': { slack: true, email: true, opsReport: true },
  'payment.failed': { slack: true, email: false, opsReport: true },
  'chat.maintenance_failed': { slack: true, email: false, opsReport: true },
  'push.unauthorized': { slack: true, email: true, opsReport: true },
  'api.error': { slack: true, email: false, opsReport: true },
  'health.scan': { slack: false, email: false, opsReport: true },
};

const DEFAULT_CATEGORY: Record<OpsEventType, OpsEventCategory> = {
  'registration.new': 'partner_friction',
  'registration.stale': 'partner_friction',
  'barber.missing_user_id': 'compliance',
  'barber.missing_location': 'geo_presence',
  'barber.credentials_email_failed': 'compliance',
  'barber.provision_failed': 'compliance',
  'payment.failed': 'billing_ops',
  'chat.maintenance_failed': 'field_issue',
  'push.unauthorized': 'billing_ops',
  'api.error': 'billing_ops',
  'health.scan': 'other',
};

function opsSlackWebhook(): string {
  return (
    process.env.OPS_EVENT_SLACK_WEBHOOK ||
    process.env.SECURITY_TRIAGE_SLACK_WEBHOOK ||
    ''
  ).trim();
}

function opsRouterSecret(): string {
  return (process.env.OPS_EVENT_ROUTER_SECRET || '').trim();
}

export function opsEventRouterDiagnostics() {
  const secret = opsRouterSecret();
  return {
    source: OPS_EVENT_ROUTER_SOURCE,
    hasSlackWebhook: Boolean(opsSlackWebhook()),
    hasResend: Boolean((process.env.RESEND_API_KEY || '').trim()),
    hasRouterSecret: Boolean(secret),
    hasSupabaseServiceRole: Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()),
  };
}

export function verifyOpsEventRouterRequest(request: Request): boolean {
  const expected = opsRouterSecret();
  if (expected) {
    const header = (request.headers.get('x-ops-event-secret') || '').trim();
    if (header === expected) return true;
  }
  if (isCronAuthorized(request)) return true;
  const auth = (request.headers.get('authorization') || '').trim();
  const cronSecret = (process.env.CRON_SECRET || '').trim();
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;
  return false;
}

export function createOpsServiceSupabase():
  | { ok: true; supabase: SupabaseClient }
  | { ok: false; error: string } {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return { ok: false, error: 'Server not configured' };
  }
  return {
    ok: true,
    supabase: createClient(url, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}

async function wasRecentlyDeduped(
  supabase: SupabaseClient,
  dedupeKey: string,
  dedupeHours: number,
): Promise<boolean> {
  const since = new Date(Date.now() - dedupeHours * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('platform_ops_controller_reports')
    .select('id')
    .gte('submitted_at', since)
    .contains('detail', { dedupe_key: dedupeKey })
    .limit(1);
  if (error) return false;
  return Array.isArray(data) && data.length > 0;
}

async function postSlack(text: string): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const webhook = opsSlackWebhook();
  if (!webhook) return { ok: false, skipped: true };
  try {
    const resp = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!resp.ok) {
      const raw = await resp.text().catch(() => '');
      return { ok: false, error: raw.slice(0, 300) || `HTTP ${resp.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'slack_fetch_failed' };
  }
}

async function sendOpsAlertEmail(input: {
  subject: string;
  title: string;
  summary: string;
  severity: OpsEventSeverity;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmail = (process.env.RESEND_FROM_EMAIL || 'noreply@halaqmap.com').trim();
  if (!apiKey) return { ok: false, skipped: true };

  const recipients = getFounderDigestRecipients();
  if (recipients.length === 0) return { ok: false, skipped: true };

  const severityLabel =
    input.severity === 'urgent' ? 'عاجل' : input.severity === 'watch' ? 'مراقبة' : 'معلومة';
  const subject = `[حلاق ماب · ${severityLabel}] ${input.subject}`;
  const text = `${input.title}\n\n${input.summary}\n\n— محرك التشغيل الخلفي (${OPS_EVENT_ROUTER_SOURCE})`;
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body style="font-family:Tahoma,Arial,sans-serif;line-height:1.8;padding:20px;background:#f8fafc"><h2 style="margin:0 0 8px">${input.title}</h2><p style="margin:0 0 16px;color:#334155">${input.summary}</p><p style="font-size:12px;color:#64748b">محرك التشغيل الخلفي · ${OPS_EVENT_ROUTER_SOURCE}</p></body></html>`;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
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
      const raw = await resp.text().catch(() => '');
      return { ok: false, error: raw.slice(0, 300) };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'resend_failed' };
  }
}

function slackLine(event: OpsEventInput, severity: OpsEventSeverity): string {
  const badge = severity === 'urgent' ? '🚨' : severity === 'watch' ? '⚠️' : 'ℹ️';
  const client = event.clientId ? ` · \`${event.clientId}\`` : '';
  return `${badge} *${event.title}*${client}\n${event.summary}`;
}

function normalizeIncomingEvent(raw: Record<string, unknown>): OpsEventInput | null {
  if (typeof raw.type === 'string' && typeof raw.title === 'string' && typeof raw.summary === 'string') {
    return {
      type: raw.type as OpsEventType,
      severity: raw.severity as OpsEventSeverity | undefined,
      title: String(raw.title).trim(),
      summary: String(raw.summary).trim(),
      clientId: raw.clientId != null ? String(raw.clientId).trim() : undefined,
      clientLabel: raw.clientLabel != null ? String(raw.clientLabel).trim() : undefined,
      category: raw.category as OpsEventCategory | undefined,
      detail:
        raw.detail && typeof raw.detail === 'object' && !Array.isArray(raw.detail)
          ? (raw.detail as Record<string, unknown>)
          : undefined,
      dedupeKey: raw.dedupeKey != null ? String(raw.dedupeKey).trim() : undefined,
      dedupeHours: raw.dedupeHours != null ? Number(raw.dedupeHours) : undefined,
    };
  }
  return null;
}

export function mapSupabaseWebhookToOpsEvent(body: Record<string, unknown>): OpsEventInput | null {
  const table = String(body.table ?? '').trim();
  const op = String(body.type ?? body.eventType ?? '').trim().toUpperCase();
  const record =
    (body.record && typeof body.record === 'object' ? body.record : null) ??
    (body.new && typeof body.new === 'object' ? body.new : null);

  if (!record || typeof record !== 'object') return null;
  const row = record as Record<string, unknown>;

  if (table === 'registration_submissions' && op === 'INSERT') {
    const orderId = String(row.id ?? '').trim();
    const payload =
      row.payload && typeof row.payload === 'object' && !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : {};
    const label = String(payload.shopName || payload.barberName || payload.email || orderId).slice(0, 120);
    return {
      type: 'registration.new',
      title: `طلب تسجيل جديد — ${orderId}`,
      summary: `وصل طلب تفعيل رخصة جديد من ${label}.`,
      clientId: orderId,
      clientLabel: label,
      detail: {
        source: 'supabase_webhook',
        table,
        tier: payload.tier ?? null,
      },
      dedupeKey: `registration.new:${orderId}`,
      dedupeHours: 12,
    };
  }

  if (table === 'payments' && op === 'INSERT') {
    const status = String(row.status ?? '').trim().toLowerCase();
    if (status !== 'failed') return null;
    const paymentId = String(row.id ?? '').trim();
    const barberId = String(row.barber_id ?? '').trim();
    return {
      type: 'payment.failed',
      severity: 'watch',
      title: 'فشل دفع مسجَّل',
      summary: `دفعة فاشلة${barberId ? ` للحلاق ${barberId}` : ''}.`,
      clientId: barberId || paymentId,
      category: 'billing_ops',
      detail: {
        source: 'supabase_webhook',
        payment_id: paymentId,
        notes: row.notes ?? null,
        transaction_id: row.transaction_id ?? null,
      },
      dedupeKey: `payment.failed:${paymentId}`,
      dedupeHours: 6,
    };
  }

  return null;
}

export async function routeOpsEvent(
  supabase: SupabaseClient,
  event: OpsEventInput,
): Promise<OpsEventDispatchResult> {
  const severity = event.severity ?? DEFAULT_SEVERITY[event.type] ?? 'info';
  const actionsPlan = RULE_ACTIONS[event.type] ?? { slack: true, email: false, opsReport: true };
  const category = event.category ?? DEFAULT_CATEGORY[event.type] ?? 'other';
  const clientId = (event.clientId || 'PLATFORM').trim();
  const dedupeKey = (event.dedupeKey || `${event.type}:${clientId}`).trim();
  const dedupeHours = Number.isFinite(event.dedupeHours) ? Math.max(1, event.dedupeHours!) : 6;

  if (await wasRecentlyDeduped(supabase, dedupeKey, dedupeHours)) {
    return {
      type: event.type,
      severity,
      skipped: true,
      skipReason: 'dedupe_window',
      actions: {},
    };
  }

  const submittedAt = new Date().toISOString();
  const detail = {
    source: OPS_EVENT_ROUTER_SOURCE,
    event_type: event.type,
    dedupe_key: dedupeKey,
    ...(event.detail ?? {}),
  };

  const result: OpsEventDispatchResult = {
    type: event.type,
    severity,
    actions: {},
  };

  if (actionsPlan.opsReport) {
    const { data, error } = await supabase
      .from('platform_ops_controller_reports')
      .insert({
        submitted_at: submittedAt,
        client_id: clientId,
        client_label: event.clientLabel || null,
        reporter_email: OPS_EVENT_REPORTER_EMAIL,
        reporter_role: OPS_EVENT_SYSTEM_ROLE,
        category,
        severity,
        title: event.title,
        summary: event.summary,
        detail,
      })
      .select('id')
      .single();

    result.actions.opsReport = error
      ? { ok: false, error: error.message }
      : { ok: true, id: data?.id ? String(data.id) : undefined };
  }

  if (actionsPlan.slack) {
    result.actions.slack = await postSlack(slackLine(event, severity));
  }

  const shouldEmail =
    actionsPlan.email || (severity === 'urgent' && Boolean((process.env.OPS_EVENT_EMAIL_ON_URGENT || 'true').trim() !== 'false'));

  if (shouldEmail && (actionsPlan.email || severity === 'urgent')) {
    result.actions.email = await sendOpsAlertEmail({
      subject: event.title,
      title: event.title,
      summary: event.summary,
      severity,
    });
  }

  return result;
}

/** استدعاء غير حاجب من مسارات API — يبتلع الأخطاء */
export function emitOpsEventFireAndForget(event: OpsEventInput): void {
  void (async () => {
    try {
      const base = createOpsServiceSupabase();
      if (base.ok === false) return;
      await routeOpsEvent(base.supabase, event);
    } catch {
      /* silent — لا نعطّل مسار المستخدم */
    }
  })();
}

export async function parseAndRouteOpsRequestBody(
  supabase: SupabaseClient,
  body: unknown,
): Promise<{ events: OpsEventInput[]; results: OpsEventDispatchResult[] }> {
  const payload = body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  const events: OpsEventInput[] = [];

  const direct = normalizeIncomingEvent(payload);
  if (direct) {
    events.push(direct);
  } else {
    const fromWebhook = mapSupabaseWebhookToOpsEvent(payload);
    if (fromWebhook) events.push(fromWebhook);
  }

  const batch = payload.events;
  if (Array.isArray(batch)) {
    for (const item of batch) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const ev = normalizeIncomingEvent(item as Record<string, unknown>);
        if (ev) events.push(ev);
      }
    }
  }

  const results: OpsEventDispatchResult[] = [];
  for (const event of events) {
    results.push(await routeOpsEvent(supabase, event));
  }
  return { events, results };
}

type RegPayload = { status?: string; barberName?: string; shopName?: string; email?: string };

export async function runOpsHealthScan(supabase: SupabaseClient): Promise<OpsEventDispatchResult[]> {
  const results: OpsEventDispatchResult[] = [];
  const staleCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [regRes, missingUserRes, missingLocRes, failedPayRes] = await Promise.all([
    supabase
      .from('registration_submissions')
      .select('id, created_at, payload')
      .lt('created_at', staleCutoff)
      .order('created_at', { ascending: true })
      .limit(200),
    supabase
      .from('barbers')
      .select('id, name, email, member_number')
      .eq('is_active', true)
      .is('user_id', null)
      .limit(100),
    supabase
      .from('barbers')
      .select('id, name, email, member_number')
      .eq('is_active', true)
      .is('latitude', null)
      .limit(100),
    supabase
      .from('payments')
      .select('id, barber_id, created_at, notes, transaction_id')
      .eq('status', 'failed')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const staleRows = (regRes.data ?? []) as { id: string; created_at: string; payload: unknown }[];
  const stalePending = staleRows.filter((row) => {
    const p = (row.payload && typeof row.payload === 'object' ? row.payload : {}) as RegPayload;
    const st = String(p.status ?? 'pending').toLowerCase();
    return st === 'pending';
  });

  if (stalePending.length > 0) {
    const sample = stalePending.slice(0, 8).map((r) => r.id).join('، ');
    results.push(
      await routeOpsEvent(supabase, {
        type: 'registration.stale',
        title: `${stalePending.length} طلب تسجيل معلّق > 24 س`,
        summary: `طلبات بانتظار المراجعة منذ أكثر من 24 ساعة. عيّنة: ${sample}`,
        clientId: 'REGISTRATION_QUEUE',
        detail: {
          count: stalePending.length,
          sample_ids: stalePending.slice(0, 12).map((r) => r.id),
        },
        dedupeKey: 'registration.stale:daily',
        dedupeHours: 24,
      }),
    );
  }

  const missingUser = (missingUserRes.data ?? []) as {
    id: string;
    name: string | null;
    email: string | null;
    member_number: string | null;
  }[];
  if (missingUser.length > 0) {
    const sample = missingUser
      .slice(0, 5)
      .map((b) => b.member_number || b.email || b.id)
      .join('، ');
    results.push(
      await routeOpsEvent(supabase, {
        type: 'barber.missing_user_id',
        severity: 'urgent',
        title: `${missingUser.length} حلاق نشط بدون ربط user_id`,
        summary: `Realtime والـ Push قد لا يعملان لهؤلاء. عيّنة: ${sample}`,
        clientId: 'BARBER_AUTH_LINK',
        detail: {
          count: missingUser.length,
          barber_ids: missingUser.slice(0, 20).map((b) => b.id),
        },
        dedupeKey: 'barber.missing_user_id:scan',
        dedupeHours: 6,
      }),
    );
  }

  const missingLoc = (missingLocRes.data ?? []) as { id: string }[];
  if (missingLoc.length > 0) {
    results.push(
      await routeOpsEvent(supabase, {
        type: 'barber.missing_location',
        title: `${missingLoc.length} حلاق نشط بدون إحداثيات`,
        summary: 'قد لا يظهرون بشكل صحيح على الخريطة حتى يُحدَّث الموقع.',
        clientId: 'BARBER_GEO',
        detail: { count: missingLoc.length, barber_ids: missingLoc.slice(0, 20).map((b) => b.id) },
        dedupeKey: 'barber.missing_location:scan',
        dedupeHours: 24,
      }),
    );
  }

  const failedPayments = (failedPayRes.data ?? []) as {
    id: string;
    barber_id: string;
    notes: string | null;
    transaction_id: string | null;
  }[];
  for (const pay of failedPayments) {
    results.push(
      await routeOpsEvent(supabase, {
        type: 'payment.failed',
        title: 'فشل دفع — آخر ساعة',
        summary: `دفعة فاشلة للحلاق ${pay.barber_id}.`,
        clientId: pay.barber_id || pay.id,
        detail: {
          payment_id: pay.id,
          notes: pay.notes,
          transaction_id: pay.transaction_id,
          source: 'health_scan',
        },
        dedupeKey: `payment.failed:${pay.id}`,
        dedupeHours: 6,
      }),
    );
  }

  results.push(
    await routeOpsEvent(supabase, {
      type: 'health.scan',
      title: 'فحص التشغيل الدوري',
      summary: `معلّق: ${stalePending.length} · بدون user_id: ${missingUser.length} · بدون موقع: ${missingLoc.length} · دفعات فاشلة (1س): ${failedPayments.length}`,
      clientId: 'PLATFORM',
      detail: {
        stale_pending: stalePending.length,
        missing_user_id: missingUser.length,
        missing_location: missingLoc.length,
        failed_payments_1h: failedPayments.length,
        scanned_at: new Date().toISOString(),
      },
      dedupeKey: `health.scan:${new Date().toISOString().slice(0, 13)}`,
      dedupeHours: 1,
    }),
  );

  return results;
}
