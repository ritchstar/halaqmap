import { timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

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
  via_qr_invite: boolean | null;
  is_public: boolean | null;
  is_highlighted: boolean | null;
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

function mapRow(row: ReviewRow): QrReviewDto {
  return {
    id: row.id,
    barberId: row.barber_id,
    customerName: row.customer_name,
    rating: row.rating,
    comment: row.comment?.trim() || '',
    date: row.created_at.slice(0, 10),
    verified: row.is_verified === true,
    viaQrInvite: row.via_qr_invite === true,
    isPublished: row.is_public !== false,
    isHighlighted: row.is_highlighted === true,
  };
}

export function isQrReviewsTier(tier: string | null | undefined): boolean {
  const t = String(tier ?? '').trim().toLowerCase();
  return t === 'gold' || t === 'diamond';
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

  if (!isQrReviewsTier(data.tier != null ? String(data.tier) : null)) {
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
  },
): Promise<{ ok: true; review: QrReviewDto } | { ok: false; error: string }> {
  const gate = await validateBarberRatingInviteToken(supabase, input.barberId, input.token);
  if (!gate.ok) return gate;

  const name = input.customerName.trim();
  if (name.length < 2) return { ok: false, error: 'invalid_name' };

  const rating = Math.round(Number(input.rating));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: 'invalid_rating' };
  }

  const comment = String(input.comment ?? '').trim().slice(0, 2000);

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      barber_id: input.barberId,
      customer_id: null,
      customer_name: name,
      rating,
      comment: comment || null,
      is_verified: true,
      via_qr_invite: true,
      is_public: true,
      is_highlighted: false,
    })
    .select(
      'id, barber_id, customer_name, rating, comment, is_verified, via_qr_invite, is_public, is_highlighted, created_at',
    )
    .single();

  if (error || !data) {
    return { ok: false, error: 'insert_failed' };
  }

  return { ok: true, review: mapRow(data as ReviewRow) };
}

export async function listBarberQrReviewsForManage(
  supabase: SupabaseClient,
  barberId: string,
): Promise<QrReviewDto[]> {
  if (!UUID_RE.test(barberId)) return [];

  const { data, error } = await supabase
    .from('reviews')
    .select(
      'id, barber_id, customer_name, rating, comment, is_verified, via_qr_invite, is_public, is_highlighted, created_at',
    )
    .eq('barber_id', barberId)
    .eq('via_qr_invite', true)
    .order('is_highlighted', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return (data as ReviewRow[]).map(mapRow);
}

export async function listPublicBarberQrReviews(
  supabase: SupabaseClient,
  barberId: string,
): Promise<QrReviewDto[]> {
  if (!UUID_RE.test(barberId)) return [];

  const { data, error } = await supabase
    .from('reviews')
    .select(
      'id, barber_id, customer_name, rating, comment, is_verified, via_qr_invite, is_public, is_highlighted, created_at',
    )
    .eq('barber_id', barberId)
    .eq('via_qr_invite', true)
    .eq('is_public', true)
    .order('is_highlighted', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return (data as ReviewRow[]).map(mapRow);
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

  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', reviewId)
    .eq('barber_id', barberId)
    .eq('via_qr_invite', true)
    .select(
      'id, barber_id, customer_name, rating, comment, is_verified, via_qr_invite, is_public, is_highlighted, created_at',
    )
    .maybeSingle();

  if (error || !data) return { ok: false, error: 'not_found' };
  return { ok: true, review: mapRow(data as ReviewRow) };
}
