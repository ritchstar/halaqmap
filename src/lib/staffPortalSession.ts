/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * جلسة بوابة الطاقم في sessionStorage — منفصلة عن barberAuth للمالك.
 */
const STORAGE_KEY = 'halaqmap_staff_session';

export type StaffPortalStoredSession = {
  accessToken: string;
  staffSessionToken: string;
  expiresAt: number;
  memberId: string;
  memberDisplayName: string;
  salonId: string;
  salonName: string;
  photoUrl: string | null;
};

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function readStaffPortalSession(accessToken?: string): StaffPortalStoredSession | null {
  if (!canUseSessionStorage()) return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StaffPortalStoredSession>;
    const staffSessionToken = String(parsed.staffSessionToken ?? '').trim();
    const storedAccess = String(parsed.accessToken ?? '').trim();
    const expiresAt = Number(parsed.expiresAt) || 0;
    const memberId = String(parsed.memberId ?? '').trim();
    const salonId = String(parsed.salonId ?? '').trim();
    if (!staffSessionToken || !storedAccess || !memberId || !salonId) return null;
    if (expiresAt > 0 && Date.now() > expiresAt - 30_000) {
      clearStaffPortalSession();
      return null;
    }
    if (accessToken && storedAccess !== accessToken.trim()) {
      return null;
    }
    return {
      accessToken: storedAccess,
      staffSessionToken,
      expiresAt,
      memberId,
      memberDisplayName: String(parsed.memberDisplayName ?? ''),
      salonId,
      salonName: String(parsed.salonName ?? ''),
      photoUrl: parsed.photoUrl == null ? null : String(parsed.photoUrl),
    };
  } catch {
    return null;
  }
}

export function writeStaffPortalSession(session: StaffPortalStoredSession): void {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore quota */
  }
}

export function clearStaffPortalSession(): void {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function readStaffSessionTokenHeader(accessToken?: string): string | null {
  const session = readStaffPortalSession(accessToken);
  const token = String(session?.staffSessionToken ?? '').trim();
  return token || null;
}
