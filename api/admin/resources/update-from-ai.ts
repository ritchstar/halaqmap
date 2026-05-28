import { authorizeOpsBillingWrite } from '../../_lib/opsBillingAuth.js';
import {
  applyOpsBillingAiPatch,
  createOpsBillingAiCommitment,
  enrichKhazenApplyPatch,
  enrichProposalsWithRows,
  loadCommitmentRows,
  type OpsBillingAiPatch,
  type OpsBillingVendor,
  validateAiPatch,
  OPS_BILLING_VENDORS,
} from '../../_lib/opsBillingAi.js';

export const config = { maxDuration: 30 };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

function parsePatch(raw: unknown): OpsBillingAiPatch | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const patch: OpsBillingAiPatch = {};
  if (typeof o.display_label === 'string') patch.display_label = o.display_label.trim();
  if (typeof o.next_renewal_at === 'string' || o.next_renewal_at === null) {
    patch.next_renewal_at = o.next_renewal_at as string | null;
  }
  if (o.monthly_estimate_sar !== undefined) {
    const n = Number(o.monthly_estimate_sar);
    patch.monthly_estimate_sar = Number.isFinite(n) ? n : null;
  }
  if (o.amount_expected !== undefined) {
    const n = Number(o.amount_expected);
    patch.amount_expected = Number.isFinite(n) ? n : null;
  }
  if (typeof o.amount_currency === 'string') patch.amount_currency = o.amount_currency.trim();
  const cycle = String(o.billing_cycle || '').trim();
  if (cycle === 'monthly' || cycle === 'annual' || cycle === 'custom' || cycle === 'unknown') {
    patch.billing_cycle = cycle;
  }
  if (typeof o.manual_notes === 'string') patch.manual_notes = o.manual_notes.trim();
  if (o.clear_gap === true) patch.clear_gap = true;
  const st = String(o.last_sync_status || '').trim();
  if (st === 'ok' || st === 'partial') patch.last_sync_status = st;
  return patch;
}

export async function POST(request: Request): Promise<Response> {
  const auth = await authorizeOpsBillingWrite(request);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (body.confirm !== true) {
    return json({ error: 'يجب إرسال confirm: true لتطبيق التحديث' }, 400);
  }

  const actionRaw = String(body.action || '').trim().toLowerCase();
  const action = actionRaw === 'create' ? 'create' : 'update';
  const commitmentId = String(body.commitment_id || body.commitmentId || '').trim() || null;
  const proposalToken = String(body.proposal_token || body.proposalToken || '').trim();
  const patch = parsePatch(body.patch);
  const detectedVendorRaw = String(body.detected_vendor || body.detectedVendor || '').trim();
  const detected_vendor = OPS_BILLING_VENDORS.includes(detectedVendorRaw as OpsBillingVendor)
    ? (detectedVendorRaw as OpsBillingVendor)
    : 'manual';
  const externalStableKey =
    typeof body.external_stable_key === 'string' ? body.external_stable_key.trim() : null;
  const displayLabel = typeof patch?.display_label === 'string' ? patch.display_label.trim() : '';

  if (!proposalToken) return json({ error: 'proposal_token required' }, 400);
  if (!patch) return json({ error: 'patch object required' }, 400);

  const { rows, error: loadErr } = await loadCommitmentRows(auth.supabase);
  if (loadErr) return json({ error: loadErr }, 500);

  const rowsById = new Map(rows.map((r) => [String(r.id), r]));

  if (action === 'create') {
    const label = displayLabel || String(body.detected_provider_label || '').trim();
    if (!label) return json({ error: 'display_label required for create' }, 400);

    const enrichedPatch = enrichKhazenApplyPatch({ ...patch, display_label: label }, null);
    const patchErr = validateAiPatch(enrichedPatch);
    if (patchErr) return json({ error: patchErr }, 400);

    const created = await createOpsBillingAiCommitment(auth.supabase, {
      vendor: detected_vendor,
      display_label: label,
      external_stable_key: externalStableKey,
      patch: enrichedPatch,
    });
    if (created.ok === false) return json({ error: created.error }, 500);

    const { rows: rowsAfter } = await loadCommitmentRows(auth.supabase);
    const afterMap = new Map(rowsAfter.map((r) => [String(r.id), r]));
    const after = afterMap.has(created.id)
      ? enrichProposalsWithRows(
          [
            {
              proposal_token: proposalToken,
              action: 'create',
              commitment_id: null,
              match_confidence: 'high',
              detected_vendor,
              detected_provider_label: label,
              payment_status: null,
              before: {},
              after: {},
              patch: enrichedPatch,
            },
          ],
          afterMap,
        )[0]!.before
      : {};

    return json({
      ok: true,
      action: 'create',
      commitment_id: created.id,
      proposal_token: proposalToken,
      before: {},
      after,
      updatedBy: auth.actorEmail,
    });
  }

  if (!commitmentId) return json({ error: 'commitment_id required for update' }, 400);
  if (!rowsById.has(commitmentId)) {
    return json({ error: 'صف الالتزام غير موجود في الجدول' }, 404);
  }

  const existingRow = rowsById.get(commitmentId)!;
  const enrichedPatch = enrichKhazenApplyPatch(patch, existingRow);
  const patchErr = validateAiPatch(enrichedPatch);
  if (patchErr) return json({ error: patchErr }, 400);

  const before = enrichProposalsWithRows(
    [
      {
        proposal_token: proposalToken,
        action: 'update',
        commitment_id: commitmentId,
        match_confidence: 'high',
        detected_vendor: null,
        detected_provider_label: '',
        payment_status: null,
        before: {},
        after: {},
        patch,
      },
    ],
    rowsById,
  )[0]!.before;

  const applied = await applyOpsBillingAiPatch(auth.supabase, commitmentId, patch);
  if (applied.ok === false) return json({ error: applied.error }, 500);

  const { rows: rowsAfter } = await loadCommitmentRows(auth.supabase);
  const afterMap = new Map(rowsAfter.map((r) => [String(r.id), r]));
  const after = afterMap.has(commitmentId)
    ? enrichProposalsWithRows(
        [
          {
            proposal_token: proposalToken,
            action: 'update',
            commitment_id: commitmentId,
            match_confidence: 'high',
            detected_vendor: null,
            detected_provider_label: '',
            payment_status: null,
            before: {},
            after: {},
            patch: {},
          },
        ],
        afterMap,
      )[0]!.before
    : {};

  return json({
    ok: true,
    action: 'update',
    commitment_id: commitmentId,
    proposal_token: proposalToken,
    before,
    after,
    updatedBy: auth.actorEmail,
  });
}
