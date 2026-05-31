import type { SupabaseClient } from '@supabase/supabase-js';
import { appendUniversalAgentDoctrines } from './platformManagementReferral.js';
import { getOpsBillingTemporalAnchor } from './opsBillingAi.js';
import { loadCrisisPlaybookMarkdown } from './systemCrisisAdvisorLab.js';
import {
  auditRegistrationPayload,
  repairRegistrationSubmissionsCompliance,
  type RegistrationCompliancePayload,
} from './registrationCompliance.js';

const PUBLIC_PROSECUTOR_DOCTRINE = [
  'صلاحية قراءة: مختبر ZATCA · مستشار الأزمات · المدير العام للمناوبين — دون تعديل سجلاتهم.',
  'Radar Sync: أي نمط «مفتش» (Inspector) في Platform Radar يستوجب تقريراً وقائياً في التغذية التشغيلية.',
  'Compliance Enforcement: تدقيق تلقائي لمسار ComplianceCheckbox في التسجيل B2B مقابل ميثاق الالتزام المهني.',
  'Crisis Watch: حضور إلزامي في خيوط Crisis Advisor — مقاطعة فورية إذا أُعطيت UX أولوية على Data Integrity.',
  'Professional Sovereignty: تنبيهات سيادة مهنية عند انحراف أي وكيل عن الحدود المؤسسية.',
  'اعتراض إلزامي: بعد أي تقييم صارم يرصد انحرافاً حرجاً، يجب إصدار «ورقة اعتراض» تشغيلية وتوثيقها قبل أي تنفيذ.',
] as const;

const PUBLIC_PROSECUTOR_LAB_AGENTS = [
  'zatca_tax_advisor',
  'system_crisis_advisor',
  'fleet_director_general',
] as const;

const PUBLIC_PROSECUTOR_WATCH_AGENT_LABELS: Record<(typeof PUBLIC_PROSECUTOR_LAB_AGENTS)[number], string> = {
  zatca_tax_advisor: 'ZATCA · زميل خازن',
  system_crisis_advisor: 'مستشار الأزمات',
  fleet_director_general: 'المدير العام للمناوبين',
};

const CRISIS_UX_DRIFT_TRIGGERS = [
  'تحسين الواجهة',
  'تجربة المستخدم',
  'ux',
  'تجميل',
  'ألوان',
  'animation',
  'microcopy',
] as const;

const DATA_INTEGRITY_P0_KEYWORDS = [
  'p0',
  'data integrity',
  'سلامة البيانات',
  'rls',
  'uptime',
  'service_role',
] as const;

export type PublicProsecutorLabChatTurn = { role: 'user' | 'assistant'; content: string };

export type PublicProsecutorLabContext = {
  anchorLabelAr: string;
  inspectorPulseCount24h: number;
  recentInspectorLabels: string[];
  complianceGaps: number;
  complianceGapSamples: string[];
  urgentOpsReports24h: number;
  failedPayments24h: number | null;
  crisisWatchActive: boolean;
  watchedAgents: string[];
  dataSource: 'live' | 'partial';
};

export type PublicProsecutorGovernanceAction = {
  type: 'interject' | 'sovereignty_alert' | 'preventive_report';
  severity: 'watch' | 'urgent';
  targetAgent?: string;
  headlineAr: string;
  directiveAr: string;
  p0RecoveryRequired?: boolean;
};

type RegistrationPayload = RegistrationCompliancePayload;

function isRegistrationPayloadCompliant(payload: RegistrationPayload): {
  ok: boolean;
  gaps: string[];
} {
  const audit = auditRegistrationPayload(payload);
  return { ok: audit.ok, gaps: audit.gaps };
}

async function countInspectorPulses(
  supabase: SupabaseClient,
  since: string,
): Promise<{ count: number; labels: string[] }> {
  const labels: string[] = [];
  let count = 0;

  try {
    const { data: userRows } = await supabase
      .from('user_searches')
      .select('id, district_name, city_name, scope_type, suspicious, created_at')
      .gte('created_at', since)
      .eq('suspicious', true)
      .order('created_at', { ascending: false })
      .limit(40);

    for (const row of userRows ?? []) {
      count += 1;
      const label = [row.district_name, row.city_name, row.scope_type].filter(Boolean).join(' · ');
      if (label) labels.push(label.slice(0, 80));
    }
  } catch {
    // partial
  }

  if (count === 0) {
    try {
      const { data: searchRows } = await supabase
        .from('search_activity_logs')
        .select(
          'id, user_lat, user_lng, district_name, city_name, scope_type, result_count, rpc_result_count, created_at',
        )
        .gte('created_at', since)
        .not('user_lat', 'is', null)
        .not('user_lng', 'is', null)
        .order('created_at', { ascending: false })
        .limit(200);

      const freq = new Map<string, number>();
      for (const r of searchRows ?? []) {
        const lat = r.user_lat as number;
        const lng = r.user_lng as number;
        freq.set(coordKey(lat, lng), (freq.get(coordKey(lat, lng)) ?? 0) + 1);
      }

      for (const r of searchRows ?? []) {
        const lat = r.user_lat as number;
        const lng = r.user_lng as number;
        const zeroResults =
          (r.result_count != null && r.result_count === 0) ||
          (r.rpc_result_count != null && r.rpc_result_count === 0);
        const rapidCluster = (freq.get(coordKey(lat, lng)) ?? 0) >= 3;
        const probeScope = r.scope_type === 'filter' || r.scope_type === 'composite';
        if (zeroResults || rapidCluster || probeScope) {
          count += 1;
          const label = [r.district_name, r.city_name, r.scope_type].filter(Boolean).join(' · ');
          if (label) labels.push(label.slice(0, 80));
        }
      }
    } catch {
      // partial
    }
  }

  return { count, labels: labels.slice(0, 6) };
}

async function auditRegistrationCompliance(
  supabase: SupabaseClient,
): Promise<{ gaps: number; samples: string[] }> {
  const samples: string[] = [];
  let gaps = 0;

  try {
    const { data } = await supabase
      .from('registration_submissions')
      .select('id, payload, created_at')
      .order('created_at', { ascending: false })
      .limit(60);

    for (const row of data ?? []) {
      const payload = (row.payload ?? {}) as RegistrationPayload;
      const audit = isRegistrationPayloadCompliant(payload);
      if (!audit.ok) {
        gaps += 1;
        samples.push(`${String(row.id)}: ${audit.gaps.join('؛ ')}`.slice(0, 160));
      }
    }
  } catch {
    // partial
  }

  return { gaps, samples: samples.slice(0, 8) };
}

export { repairRegistrationSubmissionsCompliance };

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)}|${lng.toFixed(3)}`;
}

export async function loadPublicProsecutorLabContext(
  supabase: SupabaseClient,
): Promise<PublicProsecutorLabContext> {
  const anchor = getOpsBillingTemporalAnchor();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [radar, compliance, urgentOps, failedPayments] = await Promise.all([
    countInspectorPulses(supabase, since),
    auditRegistrationCompliance(supabase),
    supabase
      .from('platform_ops_controller_reports')
      .select('title, severity, detail')
      .gte('submitted_at', since)
      .eq('severity', 'urgent')
      .limit(12),
    supabase
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since)
      .eq('status', 'failed'),
  ]);

  let urgentOpsReports24h = 0;
  for (const row of urgentOps.data ?? []) {
    const detail = row.detail as Record<string, unknown> | null;
    if (detail?.source === 'ops_intelligence_digest') continue;
    urgentOpsReports24h += 1;
  }

  const failedPayments24h =
    typeof failedPayments.count === 'number' ? failedPayments.count : null;

  return {
    anchorLabelAr: anchor.labelAr,
    inspectorPulseCount24h: radar.count,
    recentInspectorLabels: radar.labels,
    complianceGaps: compliance.gaps,
    complianceGapSamples: compliance.samples,
    urgentOpsReports24h,
    failedPayments24h,
    crisisWatchActive:
      urgentOpsReports24h > 0 || (failedPayments24h !== null && failedPayments24h > 0),
    watchedAgents: PUBLIC_PROSECUTOR_LAB_AGENTS.map((id) => PUBLIC_PROSECUTOR_WATCH_AGENT_LABELS[id]),
    dataSource:
      radar.count > 0 || compliance.gaps > 0 || urgentOpsReports24h > 0 ? 'live' : 'partial',
  };
}

export function evaluateProsecutorInterject(input: {
  userMessage: string;
  assistantSnippet?: string;
  watchAgent?: string;
  crisisMode?: boolean;
}): PublicProsecutorGovernanceAction | null {
  const combined = `${input.userMessage}\n${input.assistantSnippet ?? ''}`.toLowerCase();
  const hasUxDrift = CRISIS_UX_DRIFT_TRIGGERS.some((t) => combined.includes(t.toLowerCase()));
  const hasIntegrityFocus = DATA_INTEGRITY_P0_KEYWORDS.some((t) =>
    combined.includes(t.toLowerCase()),
  );

  if (
    (input.watchAgent === 'system_crisis_advisor' || input.crisisMode) &&
    hasUxDrift &&
    !hasIntegrityFocus
  ) {
    return {
      type: 'interject',
      severity: 'urgent',
      targetAgent: 'system_crisis_advisor',
      headlineAr: 'مقاطعة — انحراف عن بروtokol P0',
      directiveAr:
        'يُحظر إعطاء UX أو تحسينات واجهة أولوية على سلامة البيانات. فعّل فوراً بروtokol P0: Uptime → Data Integrity → RLS → مدفوعات.',
      p0RecoveryRequired: true,
    };
  }

  if (combined.includes('service_role') && combined.includes('تسريب')) {
    return {
      type: 'sovereignty_alert',
      severity: 'urgent',
      headlineAr: 'تنبيه سيادة مهنية — تسريب محتمل',
      directiveAr:
        'أوقف أي نشر. راجع RLS وسجلات service_role. لا تتابع مع وكلاء ميدانيين قبل احتواء الحادث.',
      p0RecoveryRequired: true,
    };
  }

  return null;
}

export function buildWorkingPapersFromContext(ctx: PublicProsecutorLabContext) {
  const now = new Date().toISOString();
  const papers: Array<{
    id: string;
    kind: string;
    severity: 'info' | 'watch' | 'urgent';
    titleAr: string;
    summaryAr: string;
    issuedAt: string;
    targetAgent?: string;
    recommendedActionAr?: string;
  }> = [];

  if (ctx.inspectorPulseCount24h > 0) {
    papers.push({
      id: `radar-${now}`,
      kind: 'radar_inspector',
      severity: ctx.inspectorPulseCount24h >= 5 ? 'urgent' : 'watch',
      titleAr: 'Radar Sync — نمط Inspector',
      summaryAr: `${ctx.inspectorPulseCount24h} نبضة مشبوهة خلال 24س${ctx.recentInspectorLabels.length ? ` — ${ctx.recentInspectorLabels.join(' | ')}` : ''}`,
      issuedAt: now,
      recommendedActionAr: 'إعداد تقرير وقائي في التغذية التشغيلية ومراقبة Platform Radar.',
    });
  }

  if (ctx.complianceGaps > 0) {
    papers.push({
      id: `compliance-${now}`,
      kind: 'compliance_deviation',
      severity: 'urgent',
      titleAr: 'Compliance Enforcement — فجوات تسجيل B2B',
      summaryAr: `${ctx.complianceGaps} طلب(ات) بفجوات امتثال${ctx.complianceGapSamples.length ? `: ${ctx.complianceGapSamples[0]}` : ''}`,
      issuedAt: now,
      recommendedActionAr:
        'مراجعة registration_submissions ورفض أي طلب ناقص التزام مهني أو تعهد قانوني.',
    });
  }

  const strictEvaluationDetected =
    ctx.complianceGaps > 0 ||
    ctx.inspectorPulseCount24h >= 5 ||
    ctx.urgentOpsReports24h > 0 ||
    (ctx.failedPayments24h ?? 0) > 0;

  if (strictEvaluationDetected) {
    papers.push({
      id: `objection-${now}`,
      kind: 'objection_paper',
      severity: 'urgent',
      titleAr: 'ورقة اعتراض — إلزام ما بعد التقييم الصارم',
      summaryAr:
        'رُصد انحراف تشغيلي/امتثالي يستوجب الاعتراض الرسمي. لا انتقال إلى التنفيذ حتى معالجة أسباب الاعتراض واعتماد الإغلاق.',
      issuedAt: now,
      targetAgent: 'system_crisis_advisor',
      recommendedActionAr:
        'تجميد التنفيذ، فتح مسار تصحيح إلزامي، وتوثيق قرار رفع الاعتراض في غرفة القيادة قبل أي GO.',
    });
  }

  if (ctx.crisisWatchActive) {
    papers.push({
      id: `crisis-${now}`,
      kind: 'crisis_watch',
      severity: 'watch',
      titleAr: 'Crisis Watch — مراقبة نشطة',
      summaryAr: `تقارير عاجلة OPS: ${ctx.urgentOpsReports24h} · مدفوعات فاشلة: ${ctx.failedPayments24h ?? '—'}`,
      issuedAt: now,
      targetAgent: 'system_crisis_advisor',
      recommendedActionAr: 'الحضور في خيوط Crisis Advisor — مقاطعة فورية عند UX-over-integrity.',
    });
  }

  if (papers.length === 0) {
    papers.push({
      id: `audit-${now}`,
      kind: 'proactive_audit',
      severity: 'info',
      titleAr: 'تدقيق استباقي — لا انحرافات حرجة',
      summaryAr: 'لم تُرصد أنماط Inspector حرجة ولا فجوات امتثال في آخر دفعة تسجيل.',
      issuedAt: now,
      recommendedActionAr: 'استمر في المراقبة الصامتة لمختبرات ZATCA · Crisis · Fleet.',
    });
  }

  return papers;
}

export async function draftPreventiveRadarReport(
  supabase: SupabaseClient,
  actorEmail: string,
  ctx: PublicProsecutorLabContext,
): Promise<{ drafted: boolean; reportId?: string; reason?: string }> {
  if (ctx.inspectorPulseCount24h === 0) {
    return { drafted: false, reason: 'no_inspector_pattern' };
  }

  const dedupKey = `prosecutor_radar_${new Date().toISOString().slice(0, 13)}`;
  const { data: existing } = await supabase
    .from('platform_ops_controller_reports')
    .select('id')
    .contains('detail', { dedupKey })
    .limit(1);

  if ((existing ?? []).length > 0) {
    return { drafted: false, reason: 'already_drafted_this_hour' };
  }

  const submittedAt = new Date().toISOString();
  const title = 'Prosecutor Radar Sync — نمط Inspector';
  const summary =
    `المدعي العام: ${ctx.inspectorPulseCount24h} نبضة مشبوهة (24س). ` +
    `مواقع: ${ctx.recentInspectorLabels.slice(0, 3).join(' · ') || '—'}. تقرير وقائي — لا إجراء تلقائي على الشركاء.`;

  const { data, error } = await supabase
    .from('platform_ops_controller_reports')
    .insert({
      submitted_at: submittedAt,
      client_id: 'public_prosecutor',
      client_label: 'المدعي العام الرقمي',
      reporter_email: actorEmail,
      reporter_role: 'OPS_MANAGER',
      category: 'compliance',
      severity: ctx.inspectorPulseCount24h >= 5 ? 'urgent' : 'watch',
      title,
      summary,
      detail: {
        source: 'public_prosecutor_radar_watch',
        dedupKey,
        inspectorPulseCount24h: ctx.inspectorPulseCount24h,
        labels: ctx.recentInspectorLabels,
      },
    })
    .select('id')
    .single();

  if (error || !data) {
    return { drafted: false, reason: error?.message || 'insert_failed' };
  }

  return { drafted: true, reportId: String(data.id) };
}

export function buildPublicProsecutorLabSystemPrompt(ctx: PublicProsecutorLabContext): string {
  const playbook = loadCrisisPlaybookMarkdown().slice(0, 6000);

  return appendUniversalAgentDoctrines(
    [
    'أنت **المدعي العام الرقمي (Public Prosecutor Agent)** — ضابط الامتثال والحوكمة الاستراتيجية في **حلاق ماب**.',
    '',
    '## الهوية والسلطة',
    '- **الدور:** Strategic Compliance & Governance Officer.',
    '- **النبرة:** رسمية جداً، قانونية، سلطوية — بلا مجاملة ولا تسويق.',
    '- **الصلاحية:** قراءة سجلات مختبرات ZATCA · Crisis Advisor · Fleet Director — دون تعديلها.',
    '- **سلطة المقاطعة (Interject):** عند رصد خطأ إجرائي، أصدر توجيهاً صريحاً بصيغة **«مقاطعة — …»** وحدّد الوكيل المستهدف.',
    '',
    '## Central Governance — 3-in-1',
    '1. **Radar Sync:** راقب نبضات Platform Radar؛ نمط Inspector يستوجب تقريراً وقائياً.',
    '2. **Compliance Enforcement:** تدقيق ComplianceCheckbox + ميثاق الالتزام المهني في التسجيل B2B.',
    '3. **Crisis Watch:** في خيوط Crisis Advisor — إذا أُعطيت UX أولوية على Data Integrity، قاطع وفرض P0.',
    '',
    '## Professional Sovereignty',
    '- أصدر تنبيهات «سيادة مهنية» عند تجاوز حدود B2B أو تسريب service_role أو Honor Board على مسارات B2C.',
    '',
    '## لقطة حوكمة حية',
    `- التاريخ (الرياض): ${ctx.anchorLabelAr}`,
    `- نبضات Inspector (24س): ${ctx.inspectorPulseCount24h}${ctx.recentInspectorLabels.length ? ` — ${ctx.recentInspectorLabels.join(' | ')}` : ''}`,
    `- فجوات امتثال تسجيل: ${ctx.complianceGaps}${ctx.complianceGapSamples.length ? ` — ${ctx.complianceGapSamples.join(' | ')}` : ''}`,
    `- تقارير OPS عاجلة (24س): ${ctx.urgentOpsReports24h}`,
    `- مدفوعات فاشلة (24س): ${ctx.failedPayments24h ?? 'غير متاح'}`,
    `- وكلاء تحت المراقبة: ${ctx.watchedAgents.join(' · ')}`,
    `- مصدر البيانات: ${ctx.dataSource}`,
    '',
    '## مبادئ الحوكمة',
    ...PUBLIC_PROSECUTOR_DOCTRINE.map((d) => `- ${d}`),
    '',
    '## Crisis Playbook (مرجع P0 — read-only)',
    playbook || '(غير متاح)',
    '',
    '## تنسيق كل رد',
    '1. **تقييم امتثال** (جملة واحدة — شدة الانحراف).',
    '2. **توجيهات إلزامية** (numbered list).',
    '3. **مقاطعة** (إن لزم — صراحةً مع اسم الوكيل).',
    '4. **ورقة اعتراض** (إلزامية بعد التقييم الصارم إذا رُصد انحراف حرج).',
    '5. **ما يُحظر** على القيادة الآن.',
    '',
    '## قيود',
    '- لا تنفّذ أوامر على الإنتاج — وجّه المؤسس فقط.',
    '- العربية رسمية؛ المصطلحات القانونية والتقنية بالإنجليزية عند الحاجة.',
  ].join('\n'),
    'public_prosecutor',
  );
}

export async function callPublicProsecutorLabChat(input: {
  system: string;
  userText: string;
  conversationHistory?: PublicProsecutorLabChatTurn[];
  timeoutMs?: number;
}): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured on server');

  const model =
    (process.env.PUBLIC_PROSECUTOR_OPENAI_MODEL ||
      process.env.ADMIN_SENTINEL_OPENAI_MODEL ||
      'gpt-4o').trim() || 'gpt-4o';

  const timeoutMs = input.timeoutMs ?? 58_000;
  const historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const turn of (input.conversationHistory || []).slice(-10)) {
    const role = turn.role === 'assistant' ? 'assistant' : 'user';
    const content = String(turn.content || '').trim();
    if (!content) continue;
    historyMessages.push({ role, content: content.slice(0, 8000) });
  }

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.18,
        max_tokens: 2400,
        messages: [
          { role: 'system', content: input.system },
          ...historyMessages,
          { role: 'user', content: input.userText.slice(0, 12_000) },
        ],
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
      choices?: { message?: { content?: string } }[];
    };
    if (!res.ok) throw new Error(json.error?.message || `OpenAI HTTP ${res.status}`);
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty model response');
    return text;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('انتهت مهلة الرد — ركّز السؤال على انحراف واحد');
    }
    throw e;
  } finally {
    clearTimeout(timeoutHandle);
  }
}
