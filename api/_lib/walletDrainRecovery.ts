/**
 * كشف واسترداد «نزيف» محفظة المناوب — خصومات shift_reply بلا رد فعلي للعميل.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { DIGITAL_SHIFT_REPLY_COST_HALALAS } from './digitalShiftAssistant.js';
import { repliesFromHalalas } from './digitalShiftWalletTopup.js';

export const WALLET_DRAIN_RECOVERY_REASON_PREFIX = 'wallet_drain_recovery:';

export type WalletShiftDebitRow = {
  id: string;
  barber_id: string;
  amount_halalas: number;
  reason: string;
  created_at: string;
};

export type ParsedShiftDebitReason =
  | { kind: 'scoped'; conversationId: string; customerMessageAt: string; trigger: string | null }
  | { kind: 'legacy'; trigger: string }
  | { kind: 'unknown' };

export type WalletDrainOrphanDebit = WalletShiftDebitRow & {
  orphanReason: 'no_shift_reply' | 'duplicate_debit' | 'legacy_unmatched';
};

export type WalletDrainBarberAudit = {
  barberId: string;
  barberName: string | null;
  barberEmail: string | null;
  shiftDebitCount: number;
  shiftReplyCount: number;
  orphanDebits: WalletDrainOrphanDebit[];
  orphanTotalHalalas: number;
};

export type WalletDrainRecoveryResult = WalletDrainBarberAudit & {
  dryRun: boolean;
  recoveredCount: number;
  recoveredHalalas: number;
  balanceHalalasAfter: number | null;
  skippedAlreadyRecovered: number;
};

const SCOPED_SHIFT_DEBIT_WITH_TRIGGER_RE =
  /^shift_reply:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):(.+):(shop_closed|barber_delay)$/i;

/** الصيغة الحالية: shift_reply:{conversationId}:{customerMessageAt} */
const SCOPED_SHIFT_DEBIT_RE =
  /^shift_reply:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}):(.+)$/i;

const LEGACY_SHIFT_DEBIT_RE = /^shift_reply:(shop_closed|barber_delay)$/i;

export function walletDrainLookbackDays(): number {
  const raw = Number(process.env.WALLET_DRAIN_LOOKBACK_DAYS ?? 14);
  if (!Number.isFinite(raw) || raw < 1) return 14;
  return Math.min(90, Math.trunc(raw));
}

export function walletDrainAutoRecoverEnabled(): boolean {
  return process.env.WALLET_DRAIN_AUTO_RECOVER !== 'false';
}

export function parseShiftDebitReason(reason: string): ParsedShiftDebitReason {
  const r = reason.trim();
  const withTrigger = SCOPED_SHIFT_DEBIT_WITH_TRIGGER_RE.exec(r);
  if (withTrigger) {
    return {
      kind: 'scoped',
      conversationId: withTrigger[1],
      customerMessageAt: withTrigger[2],
      trigger: withTrigger[3],
    };
  }
  const scoped = SCOPED_SHIFT_DEBIT_RE.exec(r);
  if (scoped) {
    return {
      kind: 'scoped',
      conversationId: scoped[1],
      customerMessageAt: scoped[2],
      trigger: null,
    };
  }
  const legacy = LEGACY_SHIFT_DEBIT_RE.exec(r);
  if (legacy) {
    return { kind: 'legacy', trigger: legacy[1] };
  }
  return { kind: 'unknown' };
}

function sinceIsoFromLookback(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

async function loadRecoveredDebitIds(
  supabase: SupabaseClient,
  barberId: string,
): Promise<Set<string>> {
  const { data } = await supabase
    .from('barber_ai_wallet_transactions')
    .select('reason')
    .eq('barber_id', barberId)
    .eq('direction', 'credit')
    .like('reason', `${WALLET_DRAIN_RECOVERY_REASON_PREFIX}%`);

  const ids = new Set<string>();
  for (const row of data ?? []) {
    const reason = String(row.reason ?? '');
    if (reason.startsWith(WALLET_DRAIN_RECOVERY_REASON_PREFIX)) {
      ids.add(reason.slice(WALLET_DRAIN_RECOVERY_REASON_PREFIX.length));
    }
  }
  return ids;
}

async function hasShiftReplyAfterCustomerMessage(
  supabase: SupabaseClient,
  conversationId: string,
  customerMessageAt: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from('private_messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .eq('is_digital_shift_reply', true)
    .gte('created_at', customerMessageAt);
  if (error) return false;
  return (count ?? 0) > 0;
}

async function loadShiftReplyMessages(
  supabase: SupabaseClient,
  barberId: string,
  sinceIso: string,
): Promise<Array<{ id: string; created_at: string; conversation_id: string }>> {
  const { data: barberRow } = await supabase
    .from('barbers')
    .select('user_id')
    .eq('id', barberId)
    .maybeSingle();
  const barberUserId = String(barberRow?.user_id ?? '').trim();

  const convQueries = [supabase.from('private_conversations').select('id').eq('barber_id', barberId)];
  if (barberUserId) {
    convQueries.push(
      supabase.from('private_conversations').select('id').eq('barber_user_id', barberUserId),
    );
  }

  const convResults = await Promise.all(convQueries);
  const convIdSet = new Set<string>();
  for (const res of convResults) {
    for (const row of res.data ?? []) {
      convIdSet.add(String(row.id));
    }
  }
  const convIds = [...convIdSet];
  if (convIds.length === 0) return [];

  const { data: msgs } = await supabase
    .from('private_messages')
    .select('id, created_at, conversation_id')
    .in('conversation_id', convIds)
    .eq('is_digital_shift_reply', true)
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: true })
    .limit(5000);

  return (msgs ?? []) as Array<{ id: string; created_at: string; conversation_id: string }>;
}

/** يحدّد خصومات shift_reply التي لا يوجد لها رد مناوب مُسلَّم للعميل. */
export async function auditBarberWalletDrain(
  supabase: SupabaseClient,
  barberId: string,
  lookbackDays = walletDrainLookbackDays(),
): Promise<WalletDrainBarberAudit> {
  const id = barberId.trim();
  const sinceIso = sinceIsoFromLookback(lookbackDays);

  const [{ data: barberRow }, { data: debitRows }, shiftMessages, recoveredDebitIds] = await Promise.all([
    supabase.from('barbers').select('name, email').eq('id', id).maybeSingle(),
    supabase
      .from('barber_ai_wallet_transactions')
      .select('id, barber_id, amount_halalas, reason, created_at')
      .eq('barber_id', id)
      .eq('direction', 'debit')
      .like('reason', 'shift_reply:%')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true })
      .limit(5000),
    loadShiftReplyMessages(supabase, id, sinceIso),
    loadRecoveredDebitIds(supabase, id),
  ]);

  const debits = (debitRows ?? []) as WalletShiftDebitRow[];
  const orphans: WalletDrainOrphanDebit[] = [];
  const seenScopedReasons = new Set<string>();
  const claimedMessageIds = new Set<string>();

  for (const debit of debits) {
    if (recoveredDebitIds.has(debit.id)) continue;
    if (String(debit.reason).includes(':refund')) continue;

    const parsed = parseShiftDebitReason(debit.reason);

    if (parsed.kind === 'scoped') {
      if (seenScopedReasons.has(debit.reason)) {
        orphans.push({ ...debit, orphanReason: 'duplicate_debit' });
        continue;
      }
      seenScopedReasons.add(debit.reason);

      const hasReply = await hasShiftReplyAfterCustomerMessage(
        supabase,
        parsed.conversationId,
        parsed.customerMessageAt,
      );
      if (!hasReply) {
        orphans.push({ ...debit, orphanReason: 'no_shift_reply' });
      }
      continue;
    }

    if (parsed.kind === 'legacy') {
      const debitMs = new Date(debit.created_at).getTime();
      if (!Number.isFinite(debitMs)) {
        orphans.push({ ...debit, orphanReason: 'legacy_unmatched' });
        continue;
      }
      const candidate = shiftMessages.find((m) => {
        if (claimedMessageIds.has(m.id)) return false;
        const msgMs = new Date(m.created_at).getTime();
        return msgMs >= debitMs && msgMs <= debitMs + 180_000;
      });
      if (candidate) {
        claimedMessageIds.add(candidate.id);
      } else {
        orphans.push({ ...debit, orphanReason: 'legacy_unmatched' });
      }
      continue;
    }

    orphans.push({ ...debit, orphanReason: 'legacy_unmatched' });
  }

  return {
    barberId: id,
    barberName: barberRow?.name ? String(barberRow.name) : null,
    barberEmail: barberRow?.email ? String(barberRow.email) : null,
    shiftDebitCount: debits.length,
    shiftReplyCount: shiftMessages.length,
    orphanDebits: orphans,
    orphanTotalHalalas: orphans.reduce(
      (acc, row) => acc + Math.max(0, Number(row.amount_halalas ?? DIGITAL_SHIFT_REPLY_COST_HALALAS)),
      0,
    ),
  };
}

export async function creditWalletDrainRecovery(
  supabase: SupabaseClient,
  barberId: string,
  debit: WalletShiftDebitRow,
  metadata: Record<string, unknown> = {},
): Promise<{ ok: true; creditedHalalas: number; balanceHalalas: number } | { ok: false; error: string }> {
  const recoveryReason = `${WALLET_DRAIN_RECOVERY_REASON_PREFIX}${debit.id}`;
  const amount = Math.max(0, Math.trunc(Number(debit.amount_halalas ?? DIGITAL_SHIFT_REPLY_COST_HALALAS)));

  const { data: prior } = await supabase
    .from('barber_ai_wallet_transactions')
    .select('id')
    .eq('barber_id', barberId)
    .eq('direction', 'credit')
    .eq('reason', recoveryReason)
    .maybeSingle();
  if (prior?.id) {
    const { data: wallet } = await supabase
      .from('barber_ai_wallet')
      .select('balance_halalas')
      .eq('barber_id', barberId)
      .maybeSingle();
    return { ok: true, creditedHalalas: 0, balanceHalalas: wallet?.balance_halalas ?? 0 };
  }

  const { data: wallet, error: readErr } = await supabase
    .from('barber_ai_wallet')
    .select('balance_halalas, total_spent_halalas')
    .eq('barber_id', barberId)
    .maybeSingle();
  if (readErr || !wallet) return { ok: false, error: readErr?.message ?? 'wallet_not_found' };

  const nextBalance = wallet.balance_halalas + amount;
  const nextSpent = Math.max(0, wallet.total_spent_halalas - amount);

  const { error: updErr } = await supabase
    .from('barber_ai_wallet')
    .update({
      balance_halalas: nextBalance,
      total_spent_halalas: nextSpent,
      updated_at: new Date().toISOString(),
    })
    .eq('barber_id', barberId);
  if (updErr) return { ok: false, error: updErr.message };

  await supabase.from('barber_ai_wallet_transactions').insert({
    barber_id: barberId,
    amount_halalas: amount,
    direction: 'credit',
    reason: recoveryReason,
    metadata: {
      originalDebitId: debit.id,
      originalDebitReason: debit.reason,
      originalDebitAt: debit.created_at,
      ...metadata,
    },
  });

  return { ok: true, creditedHalalas: amount, balanceHalalas: nextBalance };
}

export async function recoverBarberWalletDrain(
  supabase: SupabaseClient,
  barberId: string,
  options: { dryRun?: boolean; lookbackDays?: number } = {},
): Promise<WalletDrainRecoveryResult> {
  const audit = await auditBarberWalletDrain(supabase, barberId, options.lookbackDays);
  const dryRun = options.dryRun === true;

  if (dryRun || audit.orphanDebits.length === 0) {
    return {
      ...audit,
      dryRun,
      recoveredCount: 0,
      recoveredHalalas: 0,
      balanceHalalasAfter: null,
      skippedAlreadyRecovered: 0,
    };
  }

  let recoveredCount = 0;
  let recoveredHalalas = 0;
  let balanceHalalasAfter: number | null = null;

  for (const orphan of audit.orphanDebits) {
    const credit = await creditWalletDrainRecovery(supabase, barberId, orphan, {
      orphanReason: orphan.orphanReason,
      source: 'wallet_drain_recovery',
    });
    if (credit.ok && credit.creditedHalalas > 0) {
      recoveredCount += 1;
      recoveredHalalas += credit.creditedHalalas;
      balanceHalalasAfter = credit.balanceHalalas;
    }
  }

  return {
    ...audit,
    dryRun: false,
    recoveredCount,
    recoveredHalalas,
    balanceHalalasAfter,
    skippedAlreadyRecovered: 0,
  };
}

export async function scanWalletDrainRecovery(
  supabase: SupabaseClient,
  options: { barberId?: string; dryRun?: boolean; lookbackDays?: number } = {},
): Promise<{
  dryRun: boolean;
  barbersScanned: number;
  barbersWithOrphans: number;
  totalOrphanHalalas: number;
  totalRecoveredHalalas: number;
  results: WalletDrainRecoveryResult[];
}> {
  const dryRun = options.dryRun === true || !walletDrainAutoRecoverEnabled();
  const lookbackDays = options.lookbackDays ?? walletDrainLookbackDays();
  const sinceIso = sinceIsoFromLookback(lookbackDays);

  let barberIds: string[] = [];
  if (options.barberId?.trim()) {
    barberIds = [options.barberId.trim()];
  } else {
    const { data: debitBarbers } = await supabase
      .from('barber_ai_wallet_transactions')
      .select('barber_id')
      .eq('direction', 'debit')
      .like('reason', 'shift_reply:%')
      .gte('created_at', sinceIso);
    barberIds = [...new Set((debitBarbers ?? []).map((r) => String(r.barber_id)).filter(Boolean))];
  }

  const results: WalletDrainRecoveryResult[] = [];
  for (const barberId of barberIds) {
    results.push(await recoverBarberWalletDrain(supabase, barberId, { dryRun, lookbackDays }));
  }

  const barbersWithOrphans = results.filter((r) => r.orphanDebits.length > 0).length;
  const totalOrphanHalalas = results.reduce((acc, r) => acc + r.orphanTotalHalalas, 0);
  const totalRecoveredHalalas = results.reduce((acc, r) => acc + r.recoveredHalalas, 0);

  return {
    dryRun,
    barbersScanned: barberIds.length,
    barbersWithOrphans,
    totalOrphanHalalas,
    totalRecoveredHalalas,
    results: results.filter((r) => r.orphanDebits.length > 0 || r.recoveredHalalas > 0),
  };
}

export function formatWalletDrainSummaryAr(result: WalletDrainRecoveryResult): string {
  const sar = (result.recoveredHalalas / 100).toFixed(2);
  const orphanSar = (result.orphanTotalHalalas / 100).toFixed(2);
  const replies = repliesFromHalalas(result.recoveredHalalas);
  const name = result.barberName?.trim() || result.barberId;
  if (result.dryRun) {
    return `فحص ${name}: ${result.orphanDebits.length} خصم يتيم (${orphanSar} ر.س) — dry-run`;
  }
  if (result.recoveredHalalas <= 0) {
    return `لا استرداد لـ ${name}`;
  }
  return `استرداد ${sar} ر.س (${replies} رد) لـ ${name} — ${result.recoveredCount} خصم`;
}
