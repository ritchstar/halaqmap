import type { Review } from '@/lib/index';
import { readBarberAuthSession } from '@/lib/barberPortalSession';

const SUBMIT_ENDPOINT = '/api/submit-barber-qr-review';
const PORTAL_ENDPOINT = '/api/barber-portal-qr-reviews';
const PUBLIC_ENDPOINT = '/api/public-barber-qr-reviews';

export type RemoteQrReview = Review;

function publicHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

function portalHeaders(): Record<string, string> {
  const headers = publicHeaders();
  try {
    const raw = localStorage.getItem('barberAuth');
    if (raw) {
      const parsed = JSON.parse(raw) as { barberSessionToken?: unknown };
      const token = String(parsed.barberSessionToken ?? '').trim();
      if (token) headers['x-barber-portal-session'] = token;
    }
  } catch {
    /* ignore */
  }
  return headers;
}

function portalCredentials(): { barberId: string; email: string } | null {
  const session = readBarberAuthSession();
  const barberId = String(session?.id ?? '').trim();
  const email = String(session?.email ?? '').trim();
  if (!barberId || !email.includes('@')) return null;
  return { barberId, email };
}

function mapReview(row: RemoteQrReview): Review {
  return {
    id: row.id,
    barberId: row.barberId,
    customerName: row.customerName,
    rating: row.rating,
    comment: row.comment ?? '',
    date: row.date,
    verified: row.verified === true,
    viaQrInvite: row.viaQrInvite === true,
    isPublished: row.isPublished !== false,
    isHighlighted: row.isHighlighted === true,
  };
}

export async function submitBarberQrReviewRemote(input: {
  barberId: string;
  token: string;
  customerName: string;
  rating: number;
  comment?: string;
}): Promise<{ ok: true; review: Review } | { ok: false; error: string }> {
  try {
    const res = await fetch(SUBMIT_ENDPOINT, {
      method: 'POST',
      headers: publicHeaders(),
      body: JSON.stringify(input),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      review?: RemoteQrReview;
      error?: string;
    };
    if (!res.ok || !data.ok || !data.review) {
      return { ok: false, error: data.error || `http_${res.status}` };
    }
    return { ok: true, review: mapReview(data.review) };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export async function fetchBarberPortalQrReviewsRemote(): Promise<
  { ok: true; reviews: Review[] } | { ok: false; error: string }
> {
  const creds = portalCredentials();
  if (!creds) return { ok: false, error: 'missing_session' };

  try {
    const q = new URLSearchParams({
      barberId: creds.barberId,
      email: creds.email,
    });
    const res = await fetch(`${PORTAL_ENDPOINT}?${q.toString()}`, {
      method: 'GET',
      headers: portalHeaders(),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      reviews?: RemoteQrReview[];
      error?: string;
    };
    if (!res.ok || !data.ok || !Array.isArray(data.reviews)) {
      return { ok: false, error: data.error || `http_${res.status}` };
    }
    return { ok: true, reviews: data.reviews.map(mapReview) };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export async function patchBarberPortalQrReviewRemote(input: {
  reviewId: string;
  isPublished?: boolean;
  isHighlighted?: boolean;
}): Promise<{ ok: true; review: Review } | { ok: false; error: string }> {
  const creds = portalCredentials();
  if (!creds) return { ok: false, error: 'missing_session' };

  try {
    const res = await fetch(PORTAL_ENDPOINT, {
      method: 'PATCH',
      headers: portalHeaders(),
      body: JSON.stringify({
        barberId: creds.barberId,
        email: creds.email,
        reviewId: input.reviewId,
        ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
        ...(input.isHighlighted !== undefined ? { isHighlighted: input.isHighlighted } : {}),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      review?: RemoteQrReview;
      error?: string;
    };
    if (!res.ok || !data.ok || !data.review) {
      return { ok: false, error: data.error || `http_${res.status}` };
    }
    return { ok: true, review: mapReview(data.review) };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export async function fetchPublicBarberQrReviewsRemote(
  barberId: string,
): Promise<{ ok: true; reviews: Review[] } | { ok: false; error: string }> {
  try {
    const q = new URLSearchParams({ barberId });
    const res = await fetch(`${PUBLIC_ENDPOINT}?${q.toString()}`, {
      method: 'GET',
      headers: publicHeaders(),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      reviews?: RemoteQrReview[];
      error?: string;
    };
    if (!res.ok || !data.ok || !Array.isArray(data.reviews)) {
      return { ok: false, error: data.error || `http_${res.status}` };
    }
    return { ok: true, reviews: data.reviews.map(mapReview) };
  } catch {
    return { ok: false, error: 'network' };
  }
}
