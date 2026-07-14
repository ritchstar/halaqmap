/**
 * طلبات انضمام السفراء — تقديم عام + مراجعة أدمن (قبول → تفعيل مؤقت / رفض).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';

export type AmbassadorApplicationRow = {
  id: string;
  code: string;
  display_name: string;
  phone: string;
  email: string | null;
  account_status: string;
  coverage_area: string | null;
  sales_experience: string | null;
  social_proof_url: string | null;
  social_proof_path: string | null;
  application_submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by_admin_email: string | null;
  reject_reason: string | null;
  rules_version_accepted: string | null;
  rules_accepted_at: string | null;
  first_barber_close_at: string | null;
  created_at: string;
  status: string;
};

function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-()]/g, '').trim();
}

function generateAmbassadorCode(): string {
  const hex = randomBytes(4).toString('hex').toUpperCase();
  return `HM-AMB-${hex}`;
}

export async function submitAmbassadorApplicationRemote(
  supabase: SupabaseClient,
  input: {
    displayName: string;
    phone: string;
    email?: string | null;
    coverageArea: string;
    salesExperience: string;
    socialProofUrl?: string | null;
    socialProofPath?: string | null;
    rulesVersion: string;
  },
): Promise<
  | { ok: true; id: string; code: string; accountStatus: 'pending_review' }
  | { ok: false; error: string; status?: number }
> {
  const displayName = String(input.displayName ?? '').trim();
  const phone = normalizePhone(String(input.phone ?? ''));
  const coverageArea = String(input.coverageArea ?? '').trim();
  const salesExperience = String(input.salesExperience ?? '').trim();
  const email = String(input.email ?? '')
    .trim()
    .toLowerCase();
  const socialProofUrl = String(input.socialProofUrl ?? '').trim() || null;
  const socialProofPath = String(input.socialProofPath ?? '').trim() || null;
  const rulesVersion = String(input.rulesVersion ?? '').trim();

  if (displayName.length < 2 || displayName.length > 80) {
    return { ok: false, error: 'invalid_display_name', status: 400 };
  }
  if (phone.length < 9 || phone.length > 20) {
    return { ok: false, error: 'invalid_phone', status: 400 };
  }
  if (coverageArea.length < 8) {
    return { ok: false, error: 'invalid_coverage', status: 400 };
  }
  if (salesExperience.length < 20) {
    return { ok: false, error: 'invalid_experience', status: 400 };
  }
  if (!rulesVersion) {
    return { ok: false, error: 'rules_not_accepted', status: 400 };
  }

  const { data: existingPhone } = await supabase
    .from('ambassadors')
    .select('id, account_status')
    .eq('phone', phone)
    .in('account_status', ['pending_review', 'provisional', 'active'])
    .maybeSingle();
  if (existingPhone?.id) {
    return { ok: false, error: 'phone_already_applied', status: 409 };
  }

  const now = new Date().toISOString();
  let code = generateAmbassadorCode();
  for (let i = 0; i < 5; i += 1) {
    const { data: clash } = await supabase.from('ambassadors').select('id').eq('code', code).maybeSingle();
    if (!clash?.id) break;
    code = generateAmbassadorCode();
  }

  const { data, error } = await supabase
    .from('ambassadors')
    .insert({
      code,
      display_name: displayName,
      phone,
      email: email || null,
      status: 'active',
      account_status: 'pending_review',
      coverage_area: coverageArea,
      sales_experience: salesExperience,
      social_proof_url: socialProofUrl,
      social_proof_path: socialProofPath,
      application_submitted_at: now,
      rules_version_accepted: rulesVersion,
      rules_accepted_at: now,
      marketing_locked: false,
    })
    .select('id, code')
    .single();

  if (error || !data?.id) {
    return { ok: false, error: error?.message || 'insert_failed', status: 500 };
  }

  return { ok: true, id: data.id, code: data.code, accountStatus: 'pending_review' };
}

export async function listAmbassadorApplications(
  supabase: SupabaseClient,
  status?: string,
): Promise<{ ok: true; rows: AmbassadorApplicationRow[] } | { ok: false; error: string }> {
  let q = supabase
    .from('ambassadors')
    .select(
      'id, code, display_name, phone, email, account_status, coverage_area, sales_experience, social_proof_url, social_proof_path, application_submitted_at, reviewed_at, reviewed_by_admin_email, reject_reason, rules_version_accepted, rules_accepted_at, first_barber_close_at, created_at, status',
    )
    .not('application_submitted_at', 'is', null)
    .order('application_submitted_at', { ascending: false })
    .limit(100);

  if (status) q = q.eq('account_status', status);

  const { data, error } = await q;
  if (error) return { ok: false, error: error.message };
  return { ok: true, rows: (data ?? []) as AmbassadorApplicationRow[] };
}

export async function approveAmbassadorApplication(
  supabase: SupabaseClient,
  input: { id: string; adminEmail: string },
): Promise<{ ok: true; row: AmbassadorApplicationRow } | { ok: false; error: string }> {
  const { data: row, error } = await supabase
    .from('ambassadors')
    .select('*')
    .eq('id', input.id)
    .maybeSingle();
  if (error || !row) return { ok: false, error: error?.message || 'not_found' };
  if (row.account_status !== 'pending_review') {
    return { ok: false, error: 'not_pending_review' };
  }

  const now = new Date().toISOString();
  const { data: updated, error: updErr } = await supabase
    .from('ambassadors')
    .update({
      account_status: 'provisional',
      reviewed_at: now,
      reviewed_by_admin_email: input.adminEmail,
      reject_reason: null,
      updated_at: now,
    })
    .eq('id', input.id)
    .eq('account_status', 'pending_review')
    .select(
      'id, code, display_name, phone, email, account_status, coverage_area, sales_experience, social_proof_url, social_proof_path, application_submitted_at, reviewed_at, reviewed_by_admin_email, reject_reason, rules_version_accepted, rules_accepted_at, first_barber_close_at, created_at, status',
    )
    .single();

  if (updErr || !updated) return { ok: false, error: updErr?.message || 'approve_failed' };
  return { ok: true, row: updated as AmbassadorApplicationRow };
}

export async function rejectAmbassadorApplicationRemote(
  supabase: SupabaseClient,
  input: { id: string; adminEmail: string; reason: string },
): Promise<{ ok: true; row: AmbassadorApplicationRow } | { ok: false; error: string }> {
  const reason = String(input.reason ?? '').trim();
  if (reason.length < 4) return { ok: false, error: 'reject_reason_required' };

  const { data: row, error } = await supabase
    .from('ambassadors')
    .select('id, account_status')
    .eq('id', input.id)
    .maybeSingle();
  if (error || !row) return { ok: false, error: error?.message || 'not_found' };
  if (row.account_status !== 'pending_review') {
    return { ok: false, error: 'not_pending_review' };
  }

  const now = new Date().toISOString();
  const { data: updated, error: updErr } = await supabase
    .from('ambassadors')
    .update({
      account_status: 'rejected',
      reviewed_at: now,
      reviewed_by_admin_email: input.adminEmail,
      reject_reason: reason.slice(0, 500),
      updated_at: now,
    })
    .eq('id', input.id)
    .eq('account_status', 'pending_review')
    .select(
      'id, code, display_name, phone, email, account_status, coverage_area, sales_experience, social_proof_url, social_proof_path, application_submitted_at, reviewed_at, reviewed_by_admin_email, reject_reason, rules_version_accepted, rules_accepted_at, first_barber_close_at, created_at, status',
    )
    .single();

  if (updErr || !updated) return { ok: false, error: updErr?.message || 'reject_failed' };
  return { ok: true, row: updated as AmbassadorApplicationRow };
}

/** بصمة اختيارية لملف إثبات اجتماعي (اسم الملف فقط إن لم يُرفع). */
export function fingerprintSocialLabel(label: string): string {
  const t = label.trim();
  if (!t) return '';
  return createHash('sha256').update(t).digest('hex').slice(0, 16);
}
