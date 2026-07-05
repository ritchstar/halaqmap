/**
 * فحص محفظة المناوب — رصيد، خصومات، ويتامى.
 * Usage: npx tsx scripts/audit-shift-wallet.mts [barberIdOrNameFragment]
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { auditBarberWalletDrain } from '../api/_lib/walletDrainRecovery.js';
import { DIGITAL_SHIFT_REPLY_COST_HALALAS } from '../api/_lib/digitalShiftAssistant.js';
import { repliesFromHalalas } from '../api/_lib/digitalShiftWalletTopup.js';

function loadEnv(): void {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i <= 0) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* no .env */
  }
}

loadEnv();

const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const needle = (process.argv[2] || 'الماسي').trim();

if (!url || !key) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: barbers } = await supabase
  .from('barbers')
  .select('id, name, email, tier')
  .or(`name.ilike.%${needle}%,email.ilike.%${needle}%`)
  .limit(10);

if (!barbers?.length) {
  console.error('No barber matched:', needle);
  process.exit(1);
}

for (const barber of barbers) {
  const barberId = String(barber.id);
  const [{ data: wallet }, { data: txs }, audit] = await Promise.all([
    supabase
      .from('barber_ai_wallet')
      .select('balance_halalas, total_spent_halalas, updated_at')
      .eq('barber_id', barberId)
      .maybeSingle(),
    supabase
      .from('barber_ai_wallet_transactions')
      .select('id, direction, amount_halalas, reason, created_at')
      .eq('barber_id', barberId)
      .order('created_at', { ascending: false })
      .limit(30),
    auditBarberWalletDrain(supabase, barberId, 14),
  ]);

  const balance = wallet?.balance_halalas ?? 0;
  const spent = wallet?.total_spent_halalas ?? 0;
  const recentDebits = (txs ?? []).filter((t) => t.direction === 'debit');
  const recentCredits = (txs ?? []).filter((t) => t.direction === 'credit');
  const shiftDebitsToday = (txs ?? []).filter(
    (t) => t.direction === 'debit' && String(t.reason).startsWith('shift_reply:'),
  );

  console.log('\n══════════════════════════════════════');
  console.log(`صالون: ${barber.name} (${barber.email})`);
  console.log(`barberId: ${barberId} · tier: ${barber.tier}`);
  console.log('──────────────────────────────────────');
  console.log(`الرصيد: ${(balance / 100).toFixed(2)} ر.س (${balance} هللة) ≈ ${repliesFromHalalas(balance)} رد`);
  console.log(`المصروف التراكمي: ${(spent / 100).toFixed(2)} ر.س (${spent} هللة)`);
  console.log(`تكلفة الرد: ${(DIGITAL_SHIFT_REPLY_COST_HALALAS / 100).toFixed(2)} ر.س`);
  console.log('──────────────────────────────────────');
  console.log(`خصومات shift (14 يوم): ${audit.shiftDebitCount} · ردود فعلية: ${audit.shiftReplyCount}`);
  console.log(`يتامى (بلا رد): ${audit.orphanDebits.length} = ${(audit.orphanTotalHalalas / 100).toFixed(2)} ر.س`);
  if (audit.orphanDebits.length > 0) {
    for (const o of audit.orphanDebits.slice(0, 5)) {
      console.log(`  · ${o.created_at} ${(o.amount_halalas / 100).toFixed(2)} ر.س — ${o.orphanReason}`);
    }
    if (audit.orphanDebits.length > 5) console.log(`  … +${audit.orphanDebits.length - 5} أخرى`);
  }
  console.log('──────────────────────────────────────');
  console.log(`آخر ${shiftDebitsToday.length} خصم shift_reply (من آخر 30 معاملة):`);
  for (const d of shiftDebitsToday.slice(0, 8)) {
    console.log(`  ↓ ${d.created_at} ${(d.amount_halalas / 100).toFixed(2)} ر.س — ${String(d.reason).slice(0, 80)}`);
  }
  console.log(`آخر ${recentCredits.length} إضافات/استرداد:`);
  for (const c of recentCredits.slice(0, 5)) {
    console.log(`  ↑ ${c.created_at} ${(c.amount_halalas / 100).toFixed(2)} ر.س — ${String(c.reason).slice(0, 60)}`);
  }
}
