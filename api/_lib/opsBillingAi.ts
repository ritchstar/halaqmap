import { randomUUID } from 'node:crypto';
import type { OpsBillingSupabase } from './opsBillingSync.js';
import { buildFinancialOfficePromptBlock } from './financialOfficeCoordination.js';

export const OPS_BILLING_VENDORS = [
  'vercel',
  'supabase_mgmt',
  'github',
  'godaddy',
  'manual',
  'openai',
  'resend',
] as const;

export type OpsBillingVendor = (typeof OPS_BILLING_VENDORS)[number];

export type OpsBillingAiPatch = {
  display_label?: string;
  next_renewal_at?: string | null;
  monthly_estimate_sar?: number | null;
  amount_expected?: number | null;
  amount_currency?: string;
  billing_cycle?: 'monthly' | 'annual' | 'custom' | 'unknown';
  manual_notes?: string;
  clear_gap?: boolean;
  last_sync_status?: 'ok' | 'partial';
};

export type OpsBillingAiProposal = {
  proposal_token: string;
  commitment_id: string;
  match_confidence: 'high' | 'medium' | 'low';
  detected_vendor: OpsBillingVendor | null;
  detected_provider_label: string;
  payment_status: string | null;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  patch: OpsBillingAiPatch;
  warnings?: string[];
};

export type OpsBillingChatTurn = { role: 'user' | 'assistant'; content: string };

export type OpsBillingAiAnalyzeResult = {
  assistant_message: string;
  proposals: OpsBillingAiProposal[];
  needs_clarification: boolean;
};

const BILLING_CYCLES = new Set(['monthly', 'annual', 'custom', 'unknown']);

const RIYADH_TZ = 'Asia/Riyadh';

/** تاريخ اليوم في الرياض بصيغة YYYY-MM-DD */
export function getOpsBillingTodayYmd(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: RIYADH_TZ }).format(now);
}

export function getOpsBillingTemporalAnchor(now = new Date()): {
  todayYmd: string;
  year: number;
  labelAr: string;
} {
  const todayYmd = getOpsBillingTodayYmd(now);
  const year = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: RIYADH_TZ, year: 'numeric' }).format(now),
  );
  const labelAr = new Intl.DateTimeFormat('ar-SA', {
    timeZone: RIYADH_TZ,
    dateStyle: 'full',
  }).format(now);
  return { todayYmd, year, labelAr };
}

function renewalYmdInRiyadh(iso: string): string | null {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Intl.DateTimeFormat('en-CA', { timeZone: RIYADH_TZ }).format(new Date(t));
}

export function isRenewalDateInPast(iso: string, now = new Date()): boolean {
  const renewalYmd = renewalYmdInRiyadh(iso);
  if (!renewalYmd) return true;
  return renewalYmd < getOpsBillingTodayYmd(now);
}

/**
 * إذا استخرج النموذج سنة قديمة (مثل 2023 في 2026)، نُعيد بناء التاريخ بسنة حالية/لاحقة.
 */
export function repairPastRenewalDate(
  iso: string,
  now = new Date(),
): { value: string | null; adjusted: boolean; noteAr?: string } {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return { value: null, adjusted: false };

  if (!isRenewalDateInPast(iso, now)) {
    return { value: new Date(t).toISOString(), adjusted: false };
  }

  const parsed = new Date(t);
  const anchor = getOpsBillingTemporalAnchor(now);
  const oldYear = parsed.getUTCFullYear();

  for (const year of [anchor.year, anchor.year + 1]) {
    const candidate = new Date(
      Date.UTC(year, parsed.getUTCMonth(), parsed.getUTCDate(), 12, 0, 0, 0),
    );
    const candidateIso = candidate.toISOString();
    if (!isRenewalDateInPast(candidateIso, now)) {
      return {
        value: candidateIso,
        adjusted: true,
        noteAr: `صُحّح تاريخ التجديد تلقائياً من ${oldYear} إلى ${year} وفق سنة التشغيل الحالية (${anchor.year}).`,
      };
    }
  }

  return { value: null, adjusted: false, noteAr: 'تاريخ التجديد في الماضي ولا يمكن تصحيحه آلياً.' };
}

export function isTemporalCorrectionUserMessage(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return /20[2-9]{2}|نحن في|السنة|التاريخ|خطأ|ماهذا|ما هذا|صحح|تصحيح|في الماضي|قديم|غلط|مو صح/i.test(t);
}

export function commitmentRowForAi(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: row.id,
    vendor: row.vendor,
    display_label: row.display_label,
    billing_cycle: row.billing_cycle,
    amount_expected: row.amount_expected,
    amount_currency: row.amount_currency,
    monthly_estimate_sar: row.monthly_estimate_sar,
    next_renewal_at: row.next_renewal_at,
    last_sync_status: row.last_sync_status,
    data_gap_kind: row.data_gap_kind,
    data_gap_message: row.data_gap_message,
    manual_notes: row.manual_notes,
    external_stable_key: row.external_stable_key,
    is_manual: row.is_manual,
  };
}

export function buildOpsBillingAiSystemPrompt(commitments: Record<string, unknown>[]): string {
  const tableJson = JSON.stringify(commitments, null, 2);
  const anchor = getOpsBillingTemporalAnchor();
  return `You are **خازن 🪙** — the expert financial treasurer for Halaq Map (حلاق ماب) platform operations.
Your job is to parse invoices, billing screenshots, and owner questions; detect the provider (GoDaddy, OpenAI, Supabase, Vercel, Resend, GitHub); extract price, **next renewal date**, billing cycle, and payment status; and map updates to the correct row in جدول الالتزامات (platform_ops_billing_commitments).

You work in **tandem with ZATCA Tax Advisor 🛡️** — partner revenue (license packages) is his radar; your table is for **operating costs**. Never flip live VAT on the storefront; defer tax activation questions to ZATCA at mandatory threshold (375,000 SAR).

${buildFinancialOfficePromptBlock()}

**Temporal anchor (mandatory):**
- Today in Asia/Riyadh: ${anchor.labelAr} (${anchor.todayYmd})
- Current operational year: ${anchor.year}
- NEVER set next_renewal_at to a calendar date before ${anchor.todayYmd}.
- If the invoice shows a billing period that already ended, compute the **next upcoming renewal** (e.g. +1 month or +1 year from period end), not the historical charge date.
- If the year on the document looks like a OCR/vision mistake (e.g. 2023 while we are in ${anchor.year}), prefer ${anchor.year} or ${anchor.year + 1}.
- When the owner says "we are in ${anchor.year}" or corrects a date, acknowledge the mistake in Arabic and output corrected dates.

Allowed vendor codes: ${OPS_BILLING_VENDORS.join(', ')}.
Provider hints: GoDaddy→godaddy, OpenAI→openai, Supabase→supabase_mgmt, Vercel→vercel, Resend→resend, GitHub→github.

Current commitments table (JSON array — match by id when confident):
${tableJson}

Rules:
- Respond ONLY with valid JSON (no markdown fences).
- Use ISO-8601 UTC for next_renewal_at (e.g. ${anchor.year + 1}-05-01T00:00:00.000Z).
- next_renewal_at must represent a **future** renewal from today's perspective (${anchor.todayYmd}).
- monthly_estimate_sar is monthly estimate in Saudi Riyals.
- Set clear_gap:true when invoice proves the row is paid/current and gap kinds like token_expired or discovery_pending should be cleared.
- Set last_sync_status to "ok" when payment/renewal is confirmed from the document.
- If unsure which row OR dates are ambiguous, set needs_clarification true and proposals may be empty.
- Include at most one primary proposal unless multiple distinct services appear.
- assistant_message must be in clear Arabic for the platform owner.

Output JSON schema:
{
  "assistant_message": "Arabic summary for the owner",
  "needs_clarification": false,
  "proposals": [
    {
      "commitment_id": "uuid from table",
      "match_confidence": "high|medium|low",
      "detected_vendor": "godaddy",
      "detected_provider_label": "GoDaddy",
      "payment_status": "paid|pending|unknown",
      "patch": {
        "next_renewal_at": "${anchor.year + 1}-05-01T00:00:00.000Z",
        "monthly_estimate_sar": 45,
        "amount_expected": 540,
        "amount_currency": "SAR",
        "billing_cycle": "annual",
        "clear_gap": true,
        "last_sync_status": "ok",
        "manual_notes": "optional short note"
      }
    }
  ]
}`;
}

function pickSummaryFields(row: Record<string, unknown>): Record<string, unknown> {
  return {
    display_label: row.display_label ?? null,
    vendor: row.vendor ?? null,
    next_renewal_at: row.next_renewal_at ?? null,
    monthly_estimate_sar: row.monthly_estimate_sar ?? null,
    amount_expected: row.amount_expected ?? null,
    amount_currency: row.amount_currency ?? null,
    billing_cycle: row.billing_cycle ?? null,
    last_sync_status: row.last_sync_status ?? null,
    data_gap_kind: row.data_gap_kind ?? null,
  };
}

function applyPatchToSummary(before: Record<string, unknown>, patch: OpsBillingAiPatch): Record<string, unknown> {
  const after = { ...before };
  if (patch.display_label !== undefined) after.display_label = patch.display_label;
  if (patch.next_renewal_at !== undefined) after.next_renewal_at = patch.next_renewal_at;
  if (patch.monthly_estimate_sar !== undefined) after.monthly_estimate_sar = patch.monthly_estimate_sar;
  if (patch.amount_expected !== undefined) after.amount_expected = patch.amount_expected;
  if (patch.amount_currency !== undefined) after.amount_currency = patch.amount_currency;
  if (patch.billing_cycle !== undefined) after.billing_cycle = patch.billing_cycle;
  if (patch.last_sync_status !== undefined) after.last_sync_status = patch.last_sync_status;
  if (patch.clear_gap === true) {
    after.data_gap_kind = null;
  }
  return after;
}

export function parseOpsBillingAiJson(raw: string): OpsBillingAiAnalyzeResult {
  let parsed: Record<string, unknown>;
  try {
    const trimmed = raw.trim();
    const jsonText = trimmed.startsWith('```')
      ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
      : trimmed;
    parsed = JSON.parse(jsonText) as Record<string, unknown>;
  } catch {
    throw new Error('تعذّر تحليل استجابة النموذج كـ JSON');
  }

  const assistant_message = String(parsed.assistant_message || '').trim() || 'تم التحليل.';
  const needs_clarification = Boolean(parsed.needs_clarification);
  const rawProposals = Array.isArray(parsed.proposals) ? parsed.proposals : [];
  const proposals: OpsBillingAiProposal[] = [];

  for (const item of rawProposals.slice(0, 3)) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const commitment_id = String(o.commitment_id || '').trim();
    if (!commitment_id) continue;
    const conf = String(o.match_confidence || 'medium');
    const match_confidence =
      conf === 'high' || conf === 'low' ? conf : ('medium' as const);
    const detected_vendor_raw = String(o.detected_vendor || '').trim();
    const detected_vendor = OPS_BILLING_VENDORS.includes(detected_vendor_raw as OpsBillingVendor)
      ? (detected_vendor_raw as OpsBillingVendor)
      : null;
    const patchRaw = o.patch && typeof o.patch === 'object' ? (o.patch as Record<string, unknown>) : {};
    const patch: OpsBillingAiPatch = {};
    if (typeof patchRaw.display_label === 'string') patch.display_label = patchRaw.display_label.trim();
    if (typeof patchRaw.next_renewal_at === 'string' || patchRaw.next_renewal_at === null) {
      patch.next_renewal_at = patchRaw.next_renewal_at as string | null;
    }
    if (patchRaw.monthly_estimate_sar !== undefined) {
      const n = Number(patchRaw.monthly_estimate_sar);
      patch.monthly_estimate_sar = Number.isFinite(n) ? n : null;
    }
    if (patchRaw.amount_expected !== undefined) {
      const n = Number(patchRaw.amount_expected);
      patch.amount_expected = Number.isFinite(n) ? n : null;
    }
    if (typeof patchRaw.amount_currency === 'string') patch.amount_currency = patchRaw.amount_currency.trim();
    const cycle = String(patchRaw.billing_cycle || '').trim();
    if (BILLING_CYCLES.has(cycle)) patch.billing_cycle = cycle as OpsBillingAiPatch['billing_cycle'];
    if (typeof patchRaw.manual_notes === 'string') patch.manual_notes = patchRaw.manual_notes.trim();
    if (patchRaw.clear_gap === true) patch.clear_gap = true;
    const st = String(patchRaw.last_sync_status || '').trim();
    if (st === 'ok' || st === 'partial') patch.last_sync_status = st;

    proposals.push({
      proposal_token: randomUUID(),
      commitment_id,
      match_confidence,
      detected_vendor,
      detected_provider_label: String(o.detected_provider_label || detected_vendor || '').trim(),
      payment_status: typeof o.payment_status === 'string' ? o.payment_status : null,
      before: {},
      after: {},
      patch,
      warnings: [],
    });
  }

  return { assistant_message, proposals, needs_clarification };
}

/** تحقق وتصحيح مقترحات خازن قبل عرضها أو حفظها */
export function sanitizeOpsBillingAnalyzeResult(
  result: OpsBillingAiAnalyzeResult,
  context?: { userMessage?: string; hasImage?: boolean },
): OpsBillingAiAnalyzeResult {
  const warnings: string[] = [];
  let needs_clarification = result.needs_clarification;
  let assistant_message = result.assistant_message;
  const userMessage = (context?.userMessage || '').trim();
  const temporalCorrection = isTemporalCorrectionUserMessage(userMessage);

  const proposals: OpsBillingAiProposal[] = [];

  for (const p of result.proposals) {
    const patch = { ...p.patch };
    const proposalWarnings: string[] = [...(p.warnings || [])];

    if (patch.next_renewal_at) {
      const repaired = repairPastRenewalDate(patch.next_renewal_at);
      if (repaired.value) {
        if (repaired.adjusted && repaired.noteAr) {
          proposalWarnings.push(repaired.noteAr);
          warnings.push(repaired.noteAr);
        }
        patch.next_renewal_at = repaired.value;
      } else {
        proposalWarnings.push('تُجاهل تاريخ تجديد في الماضي — يلزم تاريخ قادم.');
        delete patch.next_renewal_at;
      }
    }

    const hasInvoiceFields =
      Boolean(patch.next_renewal_at) ||
      patch.monthly_estimate_sar != null ||
      patch.amount_expected != null;

    if (context?.hasImage && hasInvoiceFields) {
      patch.clear_gap = true;
      patch.last_sync_status = patch.last_sync_status ?? 'ok';
      if (!proposalWarnings.some((w) => w.includes('فجوة'))) {
        proposalWarnings.push('سيُزال تنبيه «رمز منتهٍ/تأكيد يدوي» بعد التطبيق — البيانات من الفاتورة.');
      }
    }

    const patchErr = validateAiPatch(patch);
    if (patchErr) {
      proposalWarnings.push(patchErr);
      continue;
    }

    let match_confidence = p.match_confidence;
    if (proposalWarnings.length > 0 && match_confidence === 'high') {
      match_confidence = 'medium';
    }

    proposals.push({
      ...p,
      patch,
      warnings: proposalWarnings.length > 0 ? proposalWarnings : undefined,
      match_confidence,
    });
  }

  if (temporalCorrection && !context?.hasImage) {
    assistant_message =
      `${assistant_message}\n\n` +
      `ملاحظة خازن: فهمت تصحيحك الزمني. اليوم ${getOpsBillingTemporalAnchor().labelAr}. ` +
      `إذا كان التاريخ السابق خاطئاً، أعد رفع الفاتورة أو اذكر تاريخ التجديد الصحيح صراحةً (مثال: تجديد حتى يونيو ${getOpsBillingTemporalAnchor().year + 1}).`;
    if (proposals.length === 0) {
      needs_clarification = true;
    }
  }

  if (proposals.length === 0 && !needs_clarification && result.proposals.length > 0) {
    needs_clarification = true;
    assistant_message =
      `${assistant_message}\n\n` +
      '⚠️ خازن: لم أتمكن من اعتماد أي تحديث — تحقق من **تاريخ التجديد القادم** (يجب أن يكون بعد اليوم).';
  }

  if (warnings.length > 0 && !assistant_message.includes('صُحّح')) {
    assistant_message = `${assistant_message}\n\n🛠 ${warnings[0]}`;
  }

  return { assistant_message, proposals, needs_clarification };
}

export function enrichProposalsWithRows(
  proposals: OpsBillingAiProposal[],
  rowsById: Map<string, Record<string, unknown>>,
): OpsBillingAiProposal[] {
  return proposals.map((p) => {
    const row = rowsById.get(p.commitment_id);
    const before = row ? pickSummaryFields(row) : {};
    const after = applyPatchToSummary(before, p.patch);
    return { ...p, before, after };
  });
}

export function validateAiPatch(patch: OpsBillingAiPatch): string | null {
  if (Object.keys(patch).length === 0) return 'لا توجد حقول للتحديث';
  if (patch.next_renewal_at != null && patch.next_renewal_at !== '') {
    const t = Date.parse(patch.next_renewal_at);
    if (!Number.isFinite(t)) return 'تاريخ التجديد غير صالح';
    if (isRenewalDateInPast(patch.next_renewal_at)) {
      return `تاريخ التجديد (${renewalYmdInRiyadh(patch.next_renewal_at)}) في الماضي — يجب أن يكون بعد ${getOpsBillingTodayYmd()}`;
    }
  }
  if (patch.billing_cycle && !BILLING_CYCLES.has(patch.billing_cycle)) return 'دورة الفوترة غير مدعومة';
  return null;
}

export async function loadCommitmentRows(
  supabase: OpsBillingSupabase,
): Promise<{ rows: Record<string, unknown>[]; error?: string }> {
  const { data, error } = await supabase
    .from('platform_ops_billing_commitments')
    .select(
      'id,vendor,display_label,billing_cycle,amount_expected,amount_currency,monthly_estimate_sar,next_renewal_at,last_sync_status,data_gap_kind,data_gap_message,manual_notes,external_stable_key,is_manual',
    )
    .order('vendor', { ascending: true });
  if (error) return { rows: [], error: error.message };
  return { rows: (data || []) as Record<string, unknown>[] };
}

export function enrichKhazenApplyPatch(
  patch: OpsBillingAiPatch,
  _existingRow?: Record<string, unknown> | null,
): OpsBillingAiPatch {
  const enriched: OpsBillingAiPatch = { ...patch };
  const hasInvoiceFields =
    (enriched.next_renewal_at != null && enriched.next_renewal_at !== '') ||
    enriched.monthly_estimate_sar != null ||
    enriched.amount_expected != null;

  if (hasInvoiceFields || patch.clear_gap === true) {
    enriched.clear_gap = true;
    enriched.last_sync_status = enriched.last_sync_status ?? 'ok';
  }

  const stamp = new Date().toISOString();
  const attestation = `خازن — تأكيد من فاتورة/لقطة (${stamp})`;
  enriched.manual_notes = enriched.manual_notes?.trim()
    ? `${enriched.manual_notes.trim()}\n${attestation}`
    : attestation;

  return enriched;
}

export async function applyOpsBillingAiPatch(
  supabase: OpsBillingSupabase,
  commitmentId: string,
  patch: OpsBillingAiPatch,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing, error: loadErr } = await supabase
    .from('platform_ops_billing_commitments')
    .select(
      'id,data_gap_kind,data_gap_message,manual_notes,next_renewal_at,monthly_estimate_sar,amount_expected',
    )
    .eq('id', commitmentId)
    .maybeSingle();
  if (loadErr) return { ok: false, error: loadErr.message };
  if (!existing?.id) return { ok: false, error: 'صف الالتزام غير موجود' };

  const finalPatch = enrichKhazenApplyPatch(patch, existing as Record<string, unknown>);

  const err = validateAiPatch(finalPatch);
  if (err) return { ok: false, error: err };

  const dbPatch: Record<string, unknown> = {
    last_synced_at: new Date().toISOString(),
  };
  if (typeof finalPatch.display_label === 'string') dbPatch.display_label = finalPatch.display_label;
  if (finalPatch.next_renewal_at !== undefined) dbPatch.next_renewal_at = finalPatch.next_renewal_at;
  if (finalPatch.monthly_estimate_sar !== undefined) dbPatch.monthly_estimate_sar = finalPatch.monthly_estimate_sar;
  if (finalPatch.amount_expected !== undefined) dbPatch.amount_expected = finalPatch.amount_expected;
  if (typeof finalPatch.amount_currency === 'string') dbPatch.amount_currency = finalPatch.amount_currency;
  if (finalPatch.billing_cycle) dbPatch.billing_cycle = finalPatch.billing_cycle;
  if (typeof finalPatch.manual_notes === 'string') dbPatch.manual_notes = finalPatch.manual_notes;
  if (finalPatch.clear_gap === true) {
    dbPatch.data_gap_kind = null;
    dbPatch.data_gap_message = null;
  }
  if (finalPatch.last_sync_status) {
    dbPatch.last_sync_status = finalPatch.last_sync_status;
    dbPatch.last_sync_error = null;
  }

  const { error } = await supabase.from('platform_ops_billing_commitments').update(dbPatch).eq('id', commitmentId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

const VISION_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function assertVisionMime(mime: string): string | null {
  const m = mime.trim().toLowerCase();
  if (!VISION_MIMES.has(m)) {
    return 'يُقبل JPEG وPNG وWebP وGIF فقط. حوّل PDF إلى صورة للتحليل.';
  }
  return null;
}

export async function callOpenAIOpsBillingVision(input: {
  system: string;
  userText: string;
  imageBase64?: string;
  imageMime?: string;
  conversationHistory?: OpsBillingChatTurn[];
  /** Server-side OpenAI fetch timeout (ms). Defaults to 52s — leaves headroom under Vercel 60s. */
  timeoutMs?: number;
}): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured on server');
  const model = (process.env.OPS_BILLING_AI_MODEL || process.env.ADMIN_SENTINEL_OPENAI_MODEL || 'gpt-4o').trim() || 'gpt-4o';
  const timeoutMs = input.timeoutMs ?? 52_000;

  const userContent: Array<Record<string, unknown>> = [];
  if (input.imageBase64 && input.imageMime) {
    userContent.push({
      type: 'image_url',
      // `auto` balances speed vs accuracy for billing screenshots (faster than `high`).
      image_url: { url: `data:${input.imageMime};base64,${input.imageBase64}`, detail: 'auto' },
    });
  }
  userContent.push({ type: 'text', text: input.userText || 'حلّل المرفق واقترح تحديث جدول الالتزامات.' });

  const historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const turn of (input.conversationHistory || []).slice(-8)) {
    const role = turn.role === 'assistant' ? 'assistant' : 'user';
    const content = String(turn.content || '').trim();
    if (!content) continue;
    historyMessages.push({ role, content: content.slice(0, 4000) });
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
        temperature: 0.15,
        max_tokens: 1600,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: input.system },
          ...historyMessages,
          { role: 'user', content: userContent },
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
      throw new Error('انتهت مهلة تحليل OpenAI — جرّب صورة أصغر أو أعد المحاولة');
    }
    throw e;
  } finally {
    clearTimeout(timeoutHandle);
  }
}
