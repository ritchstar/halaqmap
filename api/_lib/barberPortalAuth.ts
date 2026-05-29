import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_PORTAL_SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

type BarberPortalSessionPayloadV1 = {
  v: 1;
  bid: string;
  email: string;
  jti: string;
  exp: number;
};

type BarberRowBase = {
  id: string;
  email: string;
  is_active: boolean | null;
  user_id?: string | null;
};

function normalizeEmail(rawEmail: string): string {
  return String(rawEmail || '').trim().toLowerCase();
}

function portalSessionTtlMs(): number {
  const raw = (process.env.BARBER_PORTAL_SESSION_TTL_MS || '').trim();
  const n = Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 5 * 60 * 1000 && n <= 45 * 24 * 60 * 60 * 1000) {
    return n;
  }
  return DEFAULT_PORTAL_SESSION_TTL_MS;
}

export function getBarberPortalSessionSecret(): string | null {
  const explicit = (process.env.BARBER_PORTAL_SESSION_SECRET || '').trim();
  if (explicit) return explicit;
  const portalPassword = (process.env.BARBER_PORTAL_PASSWORD || '').trim();
  if (portalPassword) return portalPassword;
  const magicSecret = (process.env.BARBER_PORTAL_MAGIC_SECRET || '').trim();
  if (magicSecret) return magicSecret;
  const fallback = (process.env.REGISTRATION_INTENT_SECRET || '').trim();
  return fallback || null;
}

export function mintBarberPortalSessionToken(
  barberId: string,
  email: string,
  secret: string,
  now = Date.now()
): string {
  const payload: BarberPortalSessionPayloadV1 = {
    v: 1,
    bid: String(barberId).trim(),
    email: normalizeEmail(email),
    jti: randomUUID(),
    exp: now + portalSessionTtlMs(),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

export type VerifiedBarberPortalSessionToken =
  | { ok: true; barberId: string; email: string; jti: string }
  | { ok: false; reason: string };

export function verifyBarberPortalSessionToken(
  token: string | null | undefined,
  secret: string
): VerifiedBarberPortalSessionToken {
  if (!token?.trim()) return { ok: false, reason: 'missing_token' };
  const parts = token.trim().split('.');
  if (parts.length !== 2) return { ok: false, reason: 'malformed' };
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return { ok: false, reason: 'malformed' };

  const expectedSig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: 'bad_signature' };

  let parsed: BarberPortalSessionPayloadV1;
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as BarberPortalSessionPayloadV1;
  } catch {
    return { ok: false, reason: 'bad_payload' };
  }
  if (parsed.v !== 1 || typeof parsed.bid !== 'string' || !parsed.bid.trim()) return { ok: false, reason: 'bad_payload' };
  if (typeof parsed.email !== 'string' || !normalizeEmail(parsed.email)) return { ok: false, reason: 'bad_payload' };
  if (typeof parsed.jti !== 'string' || !parsed.jti.trim()) return { ok: false, reason: 'bad_payload' };
  if (typeof parsed.exp !== 'number' || !Number.isFinite(parsed.exp) || Date.now() > parsed.exp) {
    return { ok: false, reason: 'expired' };
  }

  return {
    ok: true,
    barberId: parsed.bid.trim(),
    email: normalizeEmail(parsed.email),
    jti: parsed.jti.trim(),
  };
}

export function extractBarberPortalSessionToken(request: Request): string | null {
  const direct = request.headers.get('x-barber-portal-session')?.trim();
  if (direct) return direct;
  const authHeader = request.headers.get('authorization')?.trim() || '';
  if (authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice('Bearer '.length).trim();
    return bearer || null;
  }
  return null;
}

export function assertBarberPortalSessionFromRequest(
  request: Request,
  barberId: string,
  rawEmail: string
): { ok: true } | { ok: false; status: number; message: string } {
  const id = String(barberId || '').trim();
  const email = normalizeEmail(rawEmail);
  if (!id || !email) {
    return { ok: false, status: 400, message: 'Missing barberId or email' };
  }

  const secret = getBarberPortalSessionSecret();
  if (!secret) {
    return { ok: false, status: 503, message: 'Server not configured (missing barber portal session secret)' };
  }

  const token = extractBarberPortalSessionToken(request);
  const verified = verifyBarberPortalSessionToken(token, secret);
  if (!verified.ok) {
    return { ok: false, status: 401, message: 'Unauthorized barber portal session' };
  }

  if (verified.barberId !== id || verified.email !== email) {
    return { ok: false, status: 403, message: 'Session does not match this barber account' };
  }

  return { ok: true };
}

export async function assertBarberEmailOwnsRow<T extends BarberRowBase>(
  supabase: SupabaseClient,
  args: {
    barberId: string;
    rawEmail: string;
    select: string;
    requireUserId?: boolean;
  }
): Promise<
  | { ok: true; row: T }
  | { ok: false; status: number; message: string }
> {
  const barberId = String(args.barberId || '').trim();
  const emailNorm = normalizeEmail(args.rawEmail);
  if (!barberId || !emailNorm) {
    return { ok: false, status: 400, message: 'Missing barberId or email' };
  }

  const { data: row, error: selErr } = await supabase
    .from('barbers')
    .select(args.select)
    .eq('id', barberId)
    .maybeSingle();

  if (selErr) {
    return { ok: false, status: 500, message: selErr.message || 'Lookup failed' };
  }
  if (!row) {
    return { ok: false, status: 404, message: 'Barber not found' };
  }

  const b = row as T;
  const rowEmail = normalizeEmail(String(b.email ?? ''));
  if (!rowEmail || rowEmail !== emailNorm) {
    return { ok: false, status: 403, message: 'Email does not match this barber account' };
  }
  if (b.is_active === false) {
    return { ok: false, status: 403, message: 'Account is not active' };
  }
  if (args.requireUserId && !String((b as { user_id?: string | null }).user_id ?? '').trim()) {
    return { ok: false, status: 409, message: 'Barber profile is not linked to a user account yet' };
  }

  return { ok: true, row: b };
}
