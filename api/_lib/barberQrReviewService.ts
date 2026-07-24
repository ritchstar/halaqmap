import { timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getBarberListingBalance } from './listingLicenseService.js';
import {
  checkQrReviewIpRateLimits,
  hasExistingQrReviewForClient,
  hashQrClientKey,
  hashQrSubmitterIp,
  isValidQrClientInstanceId,
} from './qrReviewAntiAbuse.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type QrReviewDto = {
  id: string;
  barberId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  viaQrInvite: boolean;
  isPublished: boolean;
  isHighlighted: boolean;
};

type ReviewRow = {
  id: string;
  barber_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  is_verified: boolean | null;
  via_qr_invite?: boolean | null;
  is_public?: boolean | null;
  is_highlighted?: boolean | null;
  created_at: string;
};

function safeEqualToken(a: string, b: string): boolean {
  const x = Buffer.from(a, 'utf8');
  const y = Buffer.from(b, 'utf8');
  if (x.length !== y.length) return false;
  try {
    return timingSafeEqual(x, y);
  } catch {
    return false;
  }
}

function mapRow(row: ReviewRow, assumeQrInvite = false): QrReviewDto {
  return {
    id: row.id,
    barberId: row.barber_id,
    customerName: row.customer_name,
    rating: row.rating,
    comment: row.comment?.trim() || '',
    date: row.created_at.slice(0, 10),
    verified: row.is_verified === true,
    viaQrInvite: row.via_qr_invite === true || (row.via_qr_invite == null && assumeQrInvite),
    isPublished: row.is_public !== false,
    isHighlighted: row.is_highlighted === true,
  };
}

export function isQrReviewsTier(tier: string | null | undefined): boolean {
  const t = String(tier ?? '').trim().toLowerCase();
  return t === 'gold' || t === 'diamond';
}

const QR_REVIEW_SELECT =
  'id, barber_id, customer_name, rating, comment, is_verified, via_qr_invite, is_public, is_highlighted, created_at';
const BASIC_REVIEW_SELECT =
  'id, barber_id, customer_name, rating, comment, is_verified, created_at';

function isMissingQrReviewColumnError(message: string): boolean {
  return /via_qr_invite|is_public|is_highlighted/i.test(message);
}

/** ذهبي/ماسي من صف الحلاق أو من نفاذ إدراج نشط — نفس منطق لوحة التحكم. */
export async function barberHasQrReviewsAccess(
  supabase: SupabaseClient,
  barber: { id: string; tier: string | null | undefined },
): Promise<boolean> {
  if (isQrReviewsTier(barber.tier != null ? String(barber.tier) : null)) return true;
  const balance = await getBarberListingBalance(supabase, String(barber.id));
  if (!balance.hasActiveListing) return false;
  return isQrReviewsTier(balance.activeTier);
}

export async function validateBarberRatingInviteToken(
  supabase: SupabaseClient,
  barberId: string,
  token: string,
): Promise<{ ok: true; name: string; tier: string } | { ok: false; error: string }> {
  if (!UUID_RE.test(barberId) || !token.trim()) {
    return { ok: false, error: 'invalid_params' };
  }

  const { data, error } = await supabase
    .from('barbers')
    .select('id, name, tier, rating_invite_token, is_active')
    .eq('id', barberId)
    .maybeSingle();

  if (error || !data) return { ok: false, error: 'not_found' };
  if (data.is_active === false) return { ok: false, error: 'inactive' };

  const stored = String(data.rating_invite_token ?? '').trim();
  if (!stored || !safeEqualToken(stored, token.trim())) {
    return { ok: false, error: 'invalid_token' };
  }

  const hasAccess = await barberHasQrReviewsAccess(supabase, {
    id: barberId,
    tier: data.tier != null ? String(data.tier) : null,
  });
  if (!hasAccess) {
    return { ok: false, error: 'tier_not_eligible' };
  }

  return {
    ok: true,
    name: String(data.name ?? '').trim() || 'صالون',
    tier: String(data.tier ?? '').toLowerCase(),
  };
}

export async function submitBarberQrReview(
  supabase: SupabaseClient,
  input: {
    barberId: string;
    token: string;
    customerName: string;
    rating: number;
    comment?: string;
    clientInstanceId: string;
    clientIp?: string;
  },
): Promise<{ ok: true; review: QrReviewDto } | { ok: false; error: string }> {
  const gate = await validateBarberRatingInviteToken(supabase, input.barberId, input.token);
  if (!gate.ok) return gate;

  if (!isValidQrClientInstanceId(input.clientInstanceId)) {
    return { ok: false, error: 'invalid_client_key' };
  }

  const clientKeyHash = hashQrClientKey(input.barberId, input.clientInstanceId);
  if (await hasExistingQrReviewForClient(supabase, input.barberId, clientKeyHash)) {
    return { ok: false, error: 'already_submitted' };
  }

  const ipHash = hashQrSubmitterIp(input.clientIp || 'unknown');
  const ipGate = await checkQrReviewIpRateLimits(supabase, {
    barberId: input.barberId,
    ipHash,
  });
  if (!ipGate.ok) return { ok: false, error: ipGate.error };

  const name = input.customerName.trim();
  if (name.length < 2) return { ok: false, error: 'invalid_name' };

  const rating = Math.round(Number(input.rating));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: 'invalid_rating' };
  }

  const comment = String(input.comment ?? '').trim().slice(0, 2000);

  const baseInsert = {
    barber_id: input.barberId,
    customer_id: null,
    customer_name: name,
    rating,
    comment: comment || null,
    is_verified: true,
  };

  let data: ReviewRow | null = null;
  let error: { message?: string } | null = null;

  const withQr = await supabase
    .from('reviews')
    .insert({
      ...baseInsert,
      via_qr_invite: true,
      is_public: true,
      is_highlighted: false,
      qr_client_key_hash: clientKeyHash,
      qr_submitter_ip_hash: ipHash,
    })
    .select(QR_REVIEW_SELECT)
    .single();

  data = (withQr.data as ReviewRow | null) ?? null;
  error = withQr.error;

  if (error && /duplicate|unique|reviews_qr_one_per_client/i.test(String(error.message ?? ''))) {
    return { ok: false, error: 'already_submitted' };
  }

  if (error && /qr_client_key_hash|qr_submitter_ip_hash/i.test(String(error.message ?? ''))) {
    // أعمدة الترحيل 151 غير مطبّقة — لا نُدرج بدون حماية
    console.error('[submitBarberQrReview] anti_abuse_columns_missing', error.message);
    return { ok: false, error: 'anti_abuse_unavailable' };
  }

  // لا نُسقط عبر إدراج أساسي بدون بصمة الجهاز — الحماية إلزامية لتقييمات QR
  if (error && isMissingQrReviewColumnError(String(error.message ?? ''))) {
    console.error('[submitBarberQrReview] qr_review_columns_missing', error.message);
    return { ok: false, error: 'anti_abuse_unavailable' };
  }

  if (error || !data) {
    console.error('[submitBarberQrReview] insert failed', error?.message ?? 'unknown');
    return { ok: false, error: 'insert_failed' };
  }

  return { ok: true, review: mapRow(data, true) };
}

/** هل سبق لهذا المتصفح تقييم الصالون عبر QR؟ */
export async function checkBarberQrAlreadySubmitted(
  supabase: SupabaseClient,
  input: { barberId: string; token: string; clientInstanceId: string },
): Promise<{ ok: true; alreadySubmitted: boolean } | { ok: false; error: string }> {
  const gate = await validateBarberRatingInviteToken(supabase, input.barberId, input.token);
  if (!gate.ok) return gate;
  if (!isValidQrClientInstanceId(input.clientInstanceId)) {
    return { ok: true, alreadySubmitted: false };
  }
  const clientKeyHash = hashQrClientKey(input.barberId, input.clientInstanceId);
  const already = await hasExistingQrReviewForClient(supabase, input.barberId, clientKeyHash);
  return { ok: true, alreadySubmitted: already };
}

export async function listBarberQrReviewsForManage(
  supabase: SupabaseClient,
  barberId: string,
): Promise<{ reviews: QrReviewDto[]; queryError: string | null }> {
  if (!UUID_RE.test(barberId)) return { reviews: [], queryError: 'invalid_barber_id' };

  const primary = await supabase
    .from('reviews')
    .select(QR_REVIEW_SELECT)
    .eq('barber_id', barberId)
    .order('created_at', { ascending: false });

  if (!primary.error && primary.data) {
    const rows = (primary.data as ReviewRow[]).slice();
    rows.sort((a, b) => {
      const ah = a.is_highlighted ? 1 : 0;
      const bh = b.is_highlighted ? 1 : 0;
      if (bh !== ah) return bh - ah;
      return String(b.created_at).localeCompare(String(a.created_at));
    });
    return { reviews: rows.map((row) => mapRow(row, true)), queryError: null };
  }

  const primaryMsg = String(primary.error?.message ?? '');
  if (!isMissingQrReviewColumnError(primaryMsg)) {
    return { reviews: [], queryError: primaryMsg || 'reviews_query_failed' };
  }

  const basic = await supabase
    .from('reviews')
    .select(BASIC_REVIEW_SELECT)
    .eq('barber_id', barberId)
    .order('created_at', { ascending: false });

  if (basic.error || !basic.data) {
    return { reviews: [], queryError: String(basic.error?.message ?? 'reviews_query_failed') };
  }

  return {
    reviews: (basic.data as ReviewRow[]).map((row) => mapRow(row, true)),
    queryError: null,
  };
}

export async function listPublicBarberQrReviews(
  supabase: SupabaseClient,
  barberId: string,
): Promise<QrReviewDto[]> {
  if (!UUID_RE.test(barberId)) return [];

  let data: ReviewRow[] | null = null;
  let error: { message?: string } | null = null;

  const withQr = await supabase
    .from('reviews')
    .select(QR_REVIEW_SELECT)
    .eq('barber_id', barberId)
    .eq('via_qr_invite', true)
    .eq('is_public', true)
    .order('is_highlighted', { ascending: false })
    .order('created_at', { ascending: false });

  data = (withQr.data as ReviewRow[] | null) ?? null;
  error = withQr.error;

  if (error && isMissingQrReviewColumnError(String(error.message ?? ''))) {
    const basic = await supabase
      .from('reviews')
      .select(BASIC_REVIEW_SELECT)
      .eq('barber_id', barberId)
      .order('created_at', { ascending: false });
    data = (basic.data as ReviewRow[] | null) ?? null;
    error = basic.error;
  }

  if (error || !data) return [];
  return data
    .filter((row) => row.is_public !== false)
    .map((row) => mapRow(row, true));
}

export async function updateBarberQrReviewVisibility(
  supabase: SupabaseClient,
  barberId: string,
  reviewId: string,
  patch: { isPublished?: boolean; isHighlighted?: boolean },
): Promise<{ ok: true; review: QrReviewDto } | { ok: false; error: string }> {
  if (!UUID_RE.test(barberId) || !UUID_RE.test(reviewId)) {
    return { ok: false, error: 'invalid_params' };
  }

  const updates: Record<string, boolean> = {};
  if (patch.isPublished !== undefined) updates.is_public = patch.isPublished;
  if (patch.isHighlighted !== undefined) updates.is_highlighted = patch.isHighlighted;
  if (Object.keys(updates).length === 0) return { ok: false, error: 'empty_patch' };

  let data: ReviewRow | null = null;
  let error: { message?: string } | null = null;

  const withQr = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .eq('barber_id', barberId)
    .select(QR_REVIEW_SELECT)
    .maybeSingle();

  data = (withQr.data as ReviewRow | null) ?? null;
  error = withQr.error;

  if ((error || !data) && isMissingQrReviewColumnError(String(error?.message ?? ''))) {
    return { ok: false, error: 'qr_columns_missing' };
  }

  if (error || !data) return { ok: false, error: 'not_found' };
  return { ok: true, review: mapRow(data, true) };
}
