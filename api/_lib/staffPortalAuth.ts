/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * جلسة بوابة الطاقم (staff) — HMAC قصيرة العمر مربوطة بـ team_member_id.
 * منفصلة تمامًا عن جلسة مالك الصالون (barber portal).
 */
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const DEFAULT_STAFF_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type StaffPortalSessionPayloadV1 = {
  v: 1;
  role: 'staff';
  mid: string;
  bid: string;
  jti: string;
  exp: number;
};

export type VerifiedStaffPortalSession =
  | { ok: true; teamMemberId: string; barberId: string; jti: string; exp: number }
  | { ok: false; reason: string };

function staffSessionTtlMs(): number {
  const raw = (process.env.STAFF_PORTAL_SESSION_TTL_MS || '').trim();
  const n = Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 15 * 60 * 1000 && n <= 7 * 24 * 60 * 60 * 1000) {
    return n;
  }
  return DEFAULT_STAFF_SESSION_TTL_MS;
}

export function getStaffPortalSessionSecret(): string | null {
  const explicit = (process.env.STAFF_PORTAL_SESSION_SECRET || '').trim();
  if (explicit) return explicit;
  const barberPortal = (process.env.BARBER_PORTAL_SESSION_SECRET || '').trim();
  if (barberPortal) return `staff:${barberPortal}`;
  const portalPassword = (process.env.BARBER_PORTAL_PASSWORD || '').trim();
  if (portalPassword) return `staff:${portalPassword}`;
  const magicSecret = (process.env.BARBER_PORTAL_MAGIC_SECRET || '').trim();
  if (magicSecret) return `staff:${magicSecret}`;
  const fallback = (process.env.REGISTRATION_INTENT_SECRET || '').trim();
  return fallback ? `staff:${fallback}` : null;
}

export function mintStaffPortalSessionToken(
  input: { teamMemberId: string; barberId: string },
  secret: string,
  now = Date.now(),
): { token: string; exp: number } {
  const mid = String(input.teamMemberId || '').trim();
  const bid = String(input.barberId || '').trim();
  if (!UUID_RE.test(mid) || !UUID_RE.test(bid)) {
    throw new Error('invalid_staff_session_ids');
  }
  const exp = now + staffSessionTtlMs();
  const payload: StaffPortalSessionPayloadV1 = {
    v: 1,
    role: 'staff',
    mid,
    bid,
    jti: randomUUID(),
    exp,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return { token: `${payloadB64}.${sig}`, exp };
}

export function verifyStaffPortalSessionToken(
  token: string | null | undefined,
  secret: string,
): VerifiedStaffPortalSession {
  if (!token?.trim()) return { ok: false, reason: 'missing_token' };
  const parts = token.trim().split('.');
  if (parts.length !== 2) return { ok: false, reason: 'malformed' };
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return { ok: false, reason: 'malformed' };

  const expectedSig = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: 'bad_signature' };

  let parsed: StaffPortalSessionPayloadV1;
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as StaffPortalSessionPayloadV1;
  } catch {
    return { ok: false, reason: 'bad_payload' };
  }
  if (parsed.v !== 1 || parsed.role !== 'staff') return { ok: false, reason: 'bad_payload' };
  if (typeof parsed.mid !== 'string' || !UUID_RE.test(parsed.mid.trim())) {
    return { ok: false, reason: 'bad_payload' };
  }
  if (typeof parsed.bid !== 'string' || !UUID_RE.test(parsed.bid.trim())) {
    return { ok: false, reason: 'bad_payload' };
  }
  if (typeof parsed.jti !== 'string' || !parsed.jti.trim()) return { ok: false, reason: 'bad_payload' };
  if (typeof parsed.exp !== 'number' || !Number.isFinite(parsed.exp) || Date.now() > parsed.exp) {
    return { ok: false, reason: 'expired' };
  }

  return {
    ok: true,
    teamMemberId: parsed.mid.trim(),
    barberId: parsed.bid.trim(),
    jti: parsed.jti.trim(),
    exp: parsed.exp,
  };
}

export function extractStaffPortalSessionToken(request: Request): string | null {
  const direct = request.headers.get('x-staff-portal-session')?.trim();
  if (direct) return direct;
  return null;
}

export function assertStaffPortalSessionFromRequest(
  request: Request,
):
  | { ok: true; teamMemberId: string; barberId: string; jti: string; exp: number }
  | { ok: false; status: number; message: string; reason: string } {
  const secret = getStaffPortalSessionSecret();
  if (!secret) {
    return {
      ok: false,
      status: 503,
      message: 'Server not configured (missing staff portal session secret)',
      reason: 'no_secret',
    };
  }
  const token = extractStaffPortalSessionToken(request);
  const verified = verifyStaffPortalSessionToken(token, secret);
  if (!verified.ok) {
    return {
      ok: false,
      status: 401,
      message: 'Unauthorized staff portal session',
      reason: verified.reason,
    };
  }
  return {
    ok: true,
    teamMemberId: verified.teamMemberId,
    barberId: verified.barberId,
    jti: verified.jti,
    exp: verified.exp,
  };
}
