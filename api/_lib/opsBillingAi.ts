import { randomUUID } from 'node:crypto';
import type { OpsBillingSupabase } from './opsBillingSync.js';

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
};

export type OpsBillingAiAnalyzeResult = {
  assistant_message: string;
  proposals: OpsBillingAiProposal[];
  needs_clarification: boolean;
};

const BILLING_CYCLES = new Set(['monthly', 'annual', 'custom', 'unknown']);

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
  return `You are an expert systems administrator for Halaq Map (حلاق ماب).
Your job is to parse invoices, billing screenshots, and owner questions; detect the provider (e.g. GoDaddy, OpenAI, Supabase, Vercel, Resend, GitHub); extract price, renewal date, billing cycle, and payment status; and map updates to the correct row in جدول الالتزامات (platform_ops_billing_commitments).

Allowed vendor codes: ${OPS_BILLING_VENDORS.join(', ')}.
Provider hints: GoDaddy→godaddy, OpenAI→openai, Supabase→supabase_mgmt, Vercel→vercel, Resend→resend, GitHub→github.

Current commitments table (JSON array — match by id when confident):
${tableJson}

Rules:
- Respond ONLY with valid JSON (no markdown fences).
- Use ISO-8601 UTC for next_renewal_at when possible (e.g. 2027-05-01T00:00:00.000Z).
- monthly_estimate_sar is monthly estimate in Saudi Riyals.
- Set clear_gap:true when invoice proves the row is paid/current and gap kinds like token_expired or discovery_pending should be cleared.
- Set last_sync_status to "ok" when payment/renewal is confirmed from the document.
- If unsure which row, set needs_clarification true and proposals may be empty.
- Include at most one primary proposal unless multiple distinct services appear.

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
        "next_renewal_at": "2027-05-01T00:00:00.000Z",
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
    });
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

export async function applyOpsBillingAiPatch(
  supabase: OpsBillingSupabase,
  commitmentId: string,
  patch: OpsBillingAiPatch,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const err = validateAiPatch(patch);
  if (err) return { ok: false, error: err };

  const { data: existing, error: loadErr } = await supabase
    .from('platform_ops_billing_commitments')
    .select('id')
    .eq('id', commitmentId)
    .maybeSingle();
  if (loadErr) return { ok: false, error: loadErr.message };
  if (!existing?.id) return { ok: false, error: 'صف الالتزام غير موجود' };

  const dbPatch: Record<string, unknown> = {
    last_synced_at: new Date().toISOString(),
  };
  if (typeof patch.display_label === 'string') dbPatch.display_label = patch.display_label;
  if (patch.next_renewal_at !== undefined) dbPatch.next_renewal_at = patch.next_renewal_at;
  if (patch.monthly_estimate_sar !== undefined) dbPatch.monthly_estimate_sar = patch.monthly_estimate_sar;
  if (patch.amount_expected !== undefined) dbPatch.amount_expected = patch.amount_expected;
  if (typeof patch.amount_currency === 'string') dbPatch.amount_currency = patch.amount_currency;
  if (patch.billing_cycle) dbPatch.billing_cycle = patch.billing_cycle;
  if (typeof patch.manual_notes === 'string') dbPatch.manual_notes = patch.manual_notes;
  if (patch.clear_gap === true) {
    dbPatch.data_gap_kind = null;
    dbPatch.data_gap_message = null;
  }
  if (patch.last_sync_status) {
    dbPatch.last_sync_status = patch.last_sync_status;
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
