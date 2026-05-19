import type { OpsBillingCommitmentRow, OpsBillingSummary } from '@/lib/opsBillingMonitorRemote';

export type OpsBillingDisplayRow = OpsBillingCommitmentRow & {
  /** Stable key used for consolidation identity */
  displayKey: string;
  consolidated?: boolean;
  consolidatedChildCount?: number;
};

const GODADDY_STABLE_KEYS = new Set([
  'godaddy:subscriptions_portal',
  'godaddy:m365-email-essentials',
  'godaddy:domain-halaqmap-protection',
  'godaddy:website-marketing-free',
  'godaddy:domain-and-essentials',
]);

const OPENAI_STABLE_KEYS = new Set(['openai:billing_overview', 'openai:payg-credit-snapshot', 'openai:payg-consolidated']);

const RESEND_STABLE_KEYS = new Set([
  'resend:billing_portal',
  'resend:plan-transactional-free',
  'resend:plan-marketing-free',
  'resend:infrastructure',
]);

/** Legacy keys superseded by consolidated rows — hidden from table when group merges. */
export const DEPRECATED_OPS_BILLING_STABLE_KEYS = new Set([
  'godaddy:subscriptions_portal',
  'godaddy:m365-email-essentials',
  'godaddy:domain-halaqmap-protection',
  'godaddy:website-marketing-free',
  'openai:billing_overview',
  'openai:payg-credit-snapshot',
  'resend:billing_portal',
  'resend:plan-transactional-free',
  'resend:plan-marketing-free',
]);

function stableKey(row: OpsBillingCommitmentRow): string {
  return String(row.external_stable_key ?? '');
}

function vendorOf(row: OpsBillingCommitmentRow): string {
  return String(row.vendor ?? '').toLowerCase();
}

export function monthlyEstimateSarToNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function portalUrlFromRow(r: OpsBillingCommitmentRow): string | null {
  const raw = r.external_ref;
  if (!raw || typeof raw !== 'object') return null;
  const u = (raw as { portal_url?: unknown }).portal_url;
  return typeof u === 'string' && u.startsWith('http') ? u : null;
}

function pickEarliestRenewal(rows: OpsBillingCommitmentRow[]): string | null {
  let nearest: string | null = null;
  for (const r of rows) {
    const nr = r.next_renewal_at;
    if (typeof nr !== 'string' || !nr) continue;
    if (!nearest || new Date(nr).getTime() < new Date(nearest).getTime()) nearest = nr;
  }
  return nearest;
}

function pickWorstGap(rows: OpsBillingCommitmentRow[]): {
  kind: string | null;
  message: string | null;
} {
  const withGap = rows.filter((r) => r.data_gap_kind);
  if (withGap.length === 0) return { kind: null, message: null };
  const priority = ['token_expired', 'missing_api_key', 'vendor_api_changed', 'discovery_pending', 'missing_price'];
  for (const p of priority) {
    const hit = withGap.find((r) => String(r.data_gap_kind) === p);
    if (hit) {
      return {
        kind: String(hit.data_gap_kind),
        message: typeof hit.data_gap_message === 'string' ? hit.data_gap_message : null,
      };
    }
  }
  const first = withGap[0];
  return {
    kind: String(first.data_gap_kind),
    message: typeof first.data_gap_message === 'string' ? first.data_gap_message : null,
  };
}

function pickLatestSync(rows: OpsBillingCommitmentRow[]): string | null {
  let latest: string | null = null;
  for (const r of rows) {
    const ls = r.last_synced_at;
    if (typeof ls !== 'string' || !ls) continue;
    if (!latest || new Date(ls).getTime() > new Date(latest).getTime()) latest = ls;
  }
  return latest;
}

function mergeRowBase(
  rows: OpsBillingCommitmentRow[],
  overrides: Partial<OpsBillingDisplayRow>,
): OpsBillingDisplayRow {
  const gap = pickWorstGap(rows);
  const primary = rows.find((r) => portalUrlFromRow(r)) ?? rows[0];
  return {
    ...primary,
    ...overrides,
    displayKey: String(overrides.displayKey ?? stableKey(primary)),
    consolidated: true,
    consolidatedChildCount: rows.length,
    next_renewal_at: overrides.next_renewal_at ?? pickEarliestRenewal(rows),
    last_synced_at: overrides.last_synced_at ?? pickLatestSync(rows),
    data_gap_kind: overrides.data_gap_kind !== undefined ? overrides.data_gap_kind : gap.kind,
    data_gap_message: overrides.data_gap_message !== undefined ? overrides.data_gap_message : gap.message,
    external_ref: (overrides.external_ref as Record<string, unknown> | undefined) ?? primary.external_ref,
  };
}

function consolidateGodaddyRows(rows: OpsBillingCommitmentRow[]): OpsBillingDisplayRow | null {
  const group = rows.filter(
    (r) => vendorOf(r) === 'godaddy' && GODADDY_STABLE_KEYS.has(stableKey(r)),
  );
  if (group.length === 0) return null;

  const monthlyTotal = group.reduce(
    (sum, r) => sum + (monthlyEstimateSarToNumber(r.monthly_estimate_sar) ?? 0),
    0,
  );
  const portal = group.map(portalUrlFromRow).find(Boolean);

  return mergeRowBase(group, {
    id: `display:godaddy:consolidated`,
    displayKey: 'godaddy:consolidated',
    vendor: 'godaddy',
    display_label: 'GoDaddy — halaqmap.com (Domain & Essentials)',
    external_stable_key: 'godaddy:domain-and-essentials',
    monthly_estimate_sar: monthlyTotal > 0 ? Math.round(monthlyTotal * 100) / 100 : null,
    external_ref: portal ? { portal_url: portal } : group[0].external_ref,
    last_sync_status: group.some((r) => r.last_sync_status === 'ok') ? 'ok' : 'partial',
    data_gap_kind: group.some((r) => !r.data_gap_kind) ? null : pickWorstGap(group).kind,
  });
}

function consolidateOpenAiRows(rows: OpsBillingCommitmentRow[]): OpsBillingDisplayRow | null {
  const group = rows.filter(
    (r) => vendorOf(r) === 'openai' && OPENAI_STABLE_KEYS.has(stableKey(r)),
  );
  if (group.length === 0) return null;

  const payg =
    group.find((r) => stableKey(r) === 'openai:payg-credit-snapshot' || stableKey(r) === 'openai:payg-consolidated') ??
    group[0];
  const payload = payg.vendor_payload as Record<string, unknown> | undefined;
  const ref = payg.external_ref as Record<string, unknown> | undefined;
  const last31d =
    payload?.api_costs_last_31d_usd ?? ref?.api_costs_last_31d_usd ?? payg.amount_expected;

  return mergeRowBase(group, {
    id: 'display:openai:consolidated',
    displayKey: 'openai:consolidated',
    vendor: 'openai',
    display_label: 'OpenAI API — Pay As You Go',
    external_stable_key: 'openai:payg-consolidated',
    amount_expected: typeof last31d === 'number' ? last31d : payg.amount_expected ?? null,
    amount_currency: 'USD',
    monthly_estimate_sar: null,
    external_ref: payg.external_ref,
    vendor_payload: payg.vendor_payload,
    last_sync_status: group.some((r) => r.last_sync_status === 'ok') ? 'ok' : 'partial',
    billing_cycle: 'custom',
  });
}

function consolidateResendRows(rows: OpsBillingCommitmentRow[]): OpsBillingDisplayRow | null {
  const group = rows.filter(
    (r) => vendorOf(r) === 'resend' && RESEND_STABLE_KEYS.has(stableKey(r)),
  );
  if (group.length === 0) return null;

  const portal = group.map(portalUrlFromRow).find(Boolean);

  return mergeRowBase(group, {
    id: 'display:resend:consolidated',
    displayKey: 'resend:consolidated',
    vendor: 'resend',
    display_label: 'Resend — Transactional & Marketing Email Infrastructure',
    external_stable_key: 'resend:infrastructure',
    monthly_estimate_sar: 0,
    amount_expected: 0,
    amount_currency: 'USD',
    external_ref: portal ? { portal_url: portal } : group[0].external_ref,
    last_sync_status: 'ok',
    data_gap_kind: null,
    data_gap_message: null,
  });
}

/**
 * Collapse duplicate vendor rows for display; passthrough all other commitments unchanged.
 */
export function consolidateOpsBillingRows(rows: OpsBillingCommitmentRow[]): OpsBillingDisplayRow[] {
  const consolidated: OpsBillingDisplayRow[] = [];
  const godaddy = consolidateGodaddyRows(rows);
  const openai = consolidateOpenAiRows(rows);
  const resend = consolidateResendRows(rows);
  if (godaddy) consolidated.push(godaddy);
  if (openai) consolidated.push(openai);
  if (resend) consolidated.push(resend);

  const passthrough = rows
    .filter((r) => !DEPRECATED_OPS_BILLING_STABLE_KEYS.has(stableKey(r)))
    .filter((r) => {
      const sk = stableKey(r);
      const v = vendorOf(r);
      if (godaddy && v === 'godaddy' && GODADDY_STABLE_KEYS.has(sk)) return false;
      if (openai && v === 'openai' && OPENAI_STABLE_KEYS.has(sk)) return false;
      if (resend && v === 'resend' && RESEND_STABLE_KEYS.has(sk)) return false;
      return true;
    })
    .map((r) => ({
      ...r,
      displayKey: stableKey(r) || String(r.id),
      consolidated: false,
    }));

  const merged = [...consolidated, ...passthrough];

  const vendorOrder = ['vercel', 'supabase_mgmt', 'godaddy', 'openai', 'resend', 'github', 'manual'];
  merged.sort((a, b) => {
    const va = vendorOrder.indexOf(vendorOf(a));
    const vb = vendorOrder.indexOf(vendorOf(b));
    const oa = va === -1 ? 99 : va;
    const ob = vb === -1 ? 99 : vb;
    if (oa !== ob) return oa - ob;
    return String(a.display_label).localeCompare(String(b.display_label), 'ar');
  });

  return merged;
}

export function summarizeDisplayRows(rows: OpsBillingDisplayRow[]): OpsBillingSummary {
  let nearest: string | null = null;
  let monthlySum = 0;
  for (const r of rows) {
    const mNum = monthlyEstimateSarToNumber(r.monthly_estimate_sar);
    if (mNum !== null) monthlySum += mNum;
    const nr = r.next_renewal_at;
    if (typeof nr === 'string' && nr) {
      if (!nearest || new Date(nr).getTime() < new Date(nearest).getTime()) nearest = nr;
    }
  }
  const now = Date.now();
  const countdownMs = nearest ? Math.max(0, new Date(nearest).getTime() - now) : null;
  return { nearestRenewalAt: nearest, monthlyEstimateSarTotal: monthlySum, countdownMs };
}

export type BillingCellTone = 'default' | 'muted' | 'amber' | 'cached';

export function formatRenewalDisplay(row: OpsBillingCommitmentRow): {
  text: string;
  tone: BillingCellTone;
} {
  const nr = row.next_renewal_at;
  if (typeof nr === 'string' && nr.trim()) {
    return { text: new Date(nr).toLocaleDateString('ar-SA'), tone: 'default' };
  }

  const gap = String(row.data_gap_kind ?? '');
  if (gap === 'token_expired') return { text: 'يتطلب تحديث الرمز', tone: 'amber' };
  if (gap === 'missing_api_key') return { text: 'يتطلب مفتاح API', tone: 'amber' };
  if (gap === 'discovery_pending' || gap === 'missing_price') {
    return { text: 'تأكيد يدوي', tone: 'muted' };
  }

  const cycle = String(row.billing_cycle ?? '');
  if (cycle === 'custom' || vendorOf(row) === 'openai') {
    return { text: 'حسب الاستخدام', tone: 'muted' };
  }

  return { text: 'غير محدد', tone: 'muted' };
}

export function formatMonthlyDisplay(row: OpsBillingCommitmentRow): {
  text: string;
  tone: BillingCellTone;
  hint?: string;
} {
  const sar = monthlyEstimateSarToNumber(row.monthly_estimate_sar);
  if (sar !== null) {
    return { text: sar.toFixed(2), tone: sar === 0 ? 'muted' : 'default' };
  }

  const payload = row.vendor_payload as Record<string, unknown> | undefined;
  const ref = row.external_ref as Record<string, unknown> | undefined;

  const last31d = payload?.api_costs_last_31d_usd ?? ref?.api_costs_last_31d_usd;
  if (typeof last31d === 'number' && Number.isFinite(last31d)) {
    return {
      text: `$${last31d.toFixed(2)}`,
      tone: 'cached',
      hint: 'استهلاك API · 31 يوماً',
    };
  }

  const credit = ref?.credit_balance_usd ?? payload?.credit_balance_usd;
  if (typeof credit === 'number' && Number.isFinite(credit)) {
    return { text: `$${credit.toFixed(2)}`, tone: 'cached', hint: 'آخر رصيد محفوظ' };
  }

  const amt = row.amount_expected;
  if (typeof amt === 'number' && Number.isFinite(amt)) {
    const cur = String(row.amount_currency ?? 'USD');
    return { text: `${amt.toFixed(2)} ${cur}`, tone: 'cached', hint: 'آخر لقطة' };
  }

  const gap = String(row.data_gap_kind ?? '');
  if (gap === 'token_expired') return { text: 'يتطلب تحديث الرمز', tone: 'amber' };
  if (gap === 'discovery_pending' || gap === 'missing_price' || gap === 'missing_api_key') {
    return { text: 'تأكيد يدوي', tone: 'muted' };
  }

  if (vendorOf(row) === 'resend') return { text: '0.00', tone: 'muted', hint: 'خطة مجانية' };

  return { text: 'تأكيد يدوي', tone: 'muted' };
}

export function formatLastSyncDisplay(row: OpsBillingCommitmentRow): string {
  const ls = row.last_synced_at;
  if (typeof ls === 'string' && ls.trim()) {
    return new Date(ls).toLocaleString('ar-SA');
  }
  const gap = String(row.data_gap_kind ?? '');
  if (gap === 'token_expired') return 'يتطلب تحديث الرمز';
  if (gap) return 'تأكيد يدوي';
  return '—';
}

export type BillingStatusBadge = {
  label: string;
  tone: 'ok' | 'amber' | 'neutral';
  title?: string;
};

export function formatStatusBadge(row: OpsBillingCommitmentRow): BillingStatusBadge {
  const gap = String(row.data_gap_kind ?? '');
  const gapMsg = typeof row.data_gap_message === 'string' ? row.data_gap_message : undefined;

  if (gap === 'token_expired') {
    return { label: 'رمز منتهٍ', tone: 'amber', title: gapMsg };
  }
  if (gap === 'discovery_pending') {
    return { label: 'تأكيد يدوي', tone: 'amber', title: gapMsg };
  }
  if (gap === 'missing_api_key') {
    return { label: 'مفتاح API مطلوب', tone: 'amber', title: gapMsg };
  }
  if (gap === 'missing_price') {
    return { label: 'سعر غير مكتمل', tone: 'neutral', title: gapMsg };
  }
  if (gap) {
    return { label: gap.replace(/_/g, ' '), tone: 'amber', title: gapMsg };
  }

  const status = String(row.last_sync_status ?? 'ok');
  if (status === 'ok') return { label: 'متزامن', tone: 'ok' };
  if (status === 'partial') return { label: 'جزئي', tone: 'neutral' };
  if (status === 'auth_error') return { label: 'خطأ مصادقة', tone: 'amber' };
  return { label: status, tone: 'neutral' };
}

export function consolidateOpsBillingGaps(rows: OpsBillingDisplayRow[]): OpsBillingDisplayRow[] {
  return rows.filter((r) => Boolean(r.data_gap_kind));
}
