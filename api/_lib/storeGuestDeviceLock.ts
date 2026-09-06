/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * روابط مدعوي افراحي1 واجواء1: يصدرها المشتري من لوحته، لمرة واحدة وجهاز واحد.
 */
export type GuestDeviceSeat = {
  id: string;
  deviceHash: string;
  at: string;
};

export type GuestInviteStamp = {
  id: string;
  n: number;
  exp: number;
  usedBy?: string;
  sentAt?: string;
  revokedAt?: string;
  replacedBy?: string;
};

export type GuestInviteRow = {
  id: string;
  n: number;
  sent: boolean;
  opened: boolean;
  revoked: boolean;
  guestUrl: string;
};

export const GUEST_INVITE_BATCH_SIZE = 200;
export const MAX_GUEST_INVITES = GUEST_INVITE_BATCH_SIZE;
export const GUEST_INVITE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

function newInviteId(now: number): string {
  return `i${now.toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function parseGuestSeats(raw: unknown): GuestDeviceSeat[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return {
        id: String(row.id || '').trim(),
        deviceHash: String(row.deviceHash || '').trim(),
        at: String(row.at || ''),
      };
    })
    .filter((item) => item.id && item.deviceHash);
}

export function parseGuestInvites(raw: unknown): GuestInviteStamp[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      const usedBy = String(row.usedBy || '').trim();
      const sentAt = String(row.sentAt || '').trim();
      const revokedAt = String(row.revokedAt || '').trim();
      const replacedBy = String(row.replacedBy || '').trim();
      return {
        id: String(row.id || '').trim(),
        n: Math.max(1, Number(row.n) || index + 1),
        exp: Number(row.exp) || 0,
        ...(usedBy ? { usedBy } : {}),
        ...(sentAt ? { sentAt } : {}),
        ...(revokedAt ? { revokedAt } : {}),
        ...(replacedBy ? { replacedBy } : {}),
      };
    })
    .filter((item) => item.id && item.exp > 0);
}

export function mintGuestInviteBatch(
  stamps: GuestInviteStamp[],
  count = GUEST_INVITE_BATCH_SIZE,
  now = Date.now(),
): { created: GuestInviteStamp[]; stamps: GuestInviteStamp[] } {
  const add = Math.max(1, Math.min(GUEST_INVITE_BATCH_SIZE, Math.floor(Number(count) || 0)));
  const kept = stamps.filter((item) => item.usedBy || item.sentAt || item.revokedAt || item.exp > now);
  let nextN = kept.reduce((max, item) => Math.max(max, item.n || 0), 0);
  const created: GuestInviteStamp[] = [];
  for (let i = 0; i < add; i += 1) {
    nextN += 1;
    created.push({
      id: newInviteId(now + i),
      n: nextN,
      exp: now + GUEST_INVITE_TTL_MS,
    });
  }
  return { created, stamps: [...kept, ...created] };
}

export function mintGuestInvite(
  stamps: GuestInviteStamp[],
  now = Date.now(),
): { stamp: GuestInviteStamp; stamps: GuestInviteStamp[] } {
  const batch = mintGuestInviteBatch(stamps, 1, now);
  const stamp = batch.created[0] || batch.stamps[batch.stamps.length - 1];
  return { stamp, stamps: batch.stamps };
}

export function markGuestInviteSent(
  stamps: GuestInviteStamp[],
  inviteId: string,
  now = Date.now(),
): { ok: true; stamp: GuestInviteStamp; stamps: GuestInviteStamp[] } | { ok: false } {
  const id = String(inviteId || '').trim();
  const found = stamps.find((item) => item.id === id);
  if (!found || found.exp <= now || found.revokedAt) return { ok: false };
  const sentAt = found.sentAt || new Date(now).toISOString();
  const stamp = { ...found, sentAt };
  return {
    ok: true,
    stamp,
    stamps: stamps.map((item) => (item.id === id ? stamp : item)),
  };
}

export function markGuestInvitesSent(
  stamps: GuestInviteStamp[],
  inviteIds: unknown,
  now = Date.now(),
): { ok: true; stamps: GuestInviteStamp[]; marked: number } | { ok: false } {
  const ids = [...new Set(
    (Array.isArray(inviteIds) ? inviteIds : [inviteIds])
      .map((item) => String(item || '').trim())
      .filter(Boolean),
  )].slice(0, 100);
  if (!ids.length) return { ok: false };
  let next = stamps;
  let marked = 0;
  for (const id of ids) {
    const result = markGuestInviteSent(next, id, now);
    if (!result.ok) continue;
    next = result.stamps;
    marked += 1;
  }
  if (!marked) return { ok: false };
  return { ok: true, stamps: next, marked };
}

export function nextReadyInvite(stamps: GuestInviteStamp[], now = Date.now()): GuestInviteStamp | null {
  return stamps.find((item) => !item.sentAt && !item.usedBy && !item.revokedAt && item.exp > now) || null;
}

export function guestInviteStats(stamps: GuestInviteStamp[], now = Date.now()) {
  const live = stamps.filter((item) => item.exp > now || item.sentAt || item.usedBy || item.revokedAt);
  const ready = live.filter((item) => !item.sentAt && !item.usedBy && !item.revokedAt && item.exp > now).length;
  const opened = live.filter((item) => Boolean(item.usedBy) && !item.revokedAt).length;
  const sent = live.filter((item) => (Boolean(item.sentAt) || Boolean(item.usedBy)) && !item.revokedAt).length;
  const revoked = live.filter((item) => Boolean(item.revokedAt)).length;
  return {
    total: live.length,
    ready,
    sent,
    opened,
    remaining: ready,
    revoked,
    cap: 0,
  };
}

export function summarizeGuestInvites(stamps: GuestInviteStamp[], baseGuestUrl: string): GuestInviteRow[] {
  return stamps
    .filter((item) => item.exp > Date.now() || item.sentAt || item.usedBy || item.revokedAt)
    .map((item) => ({
      id: item.id,
      n: item.n,
      sent: Boolean(item.sentAt),
      opened: Boolean(item.usedBy),
      revoked: Boolean(item.revokedAt),
      guestUrl: item.revokedAt ? '' : `${baseGuestUrl}?invite=${encodeURIComponent(item.id)}`,
    }));
}

export function revokeGuestInvite(
  stamps: GuestInviteStamp[],
  inviteId: string,
  now = Date.now(),
): { ok: true; stamps: GuestInviteStamp[] } | { ok: false } {
  const id = String(inviteId || '').trim();
  const found = stamps.find((item) => item.id === id);
  if (!found || found.revokedAt) return { ok: false };
  const stamp = { ...found, revokedAt: new Date(now).toISOString() };
  return { ok: true, stamps: stamps.map((item) => (item.id === id ? stamp : item)) };
}

export function reissueGuestInvite(
  stamps: GuestInviteStamp[],
  inviteId: string,
  now = Date.now(),
): { ok: true; stamp: GuestInviteStamp; stamps: GuestInviteStamp[] } | { ok: false } {
  const id = String(inviteId || '').trim();
  const found = stamps.find((item) => item.id === id);
  if (!found) return { ok: false };
  const newStamp: GuestInviteStamp = {
    id: newInviteId(now),
    n: found.n,
    exp: now + GUEST_INVITE_TTL_MS,
  };
  const revokedOld = {
    ...found,
    revokedAt: found.revokedAt || new Date(now).toISOString(),
    replacedBy: newStamp.id,
  };
  return {
    ok: true,
    stamp: newStamp,
    stamps: [...stamps.map((item) => (item.id === id ? revokedOld : item)), newStamp],
  };
}

export function resetGuestInviteDevice(
  seats: GuestDeviceSeat[],
  stamps: GuestInviteStamp[],
  inviteId: string,
): { ok: true; seats: GuestDeviceSeat[]; stamps: GuestInviteStamp[]; stamp: GuestInviteStamp } | { ok: false } {
  const id = String(inviteId || '').trim();
  const found = stamps.find((item) => item.id === id);
  if (!found || found.revokedAt || !found.usedBy) return { ok: false };
  const deviceHash = found.usedBy;
  const stamp: GuestInviteStamp = { ...found, usedBy: undefined };
  return {
    ok: true,
    seats: seats.filter((item) => item.deviceHash !== deviceHash),
    stamps: stamps.map((item) => (item.id === id ? stamp : item)),
    stamp,
  };
}

export function claimGuestSeat(
  seats: GuestDeviceSeat[],
  stamps: GuestInviteStamp[],
  input: { seatId?: string; inviteId?: string; deviceHash: string },
  now = Date.now(),
):
  | { ok: true; seatId: string; seats: GuestDeviceSeat[]; stamps: GuestInviteStamp[] }
  | { ok: false; blocked: true } {
  const deviceHash = String(input.deviceHash || '').trim().slice(0, 80);
  if (!deviceHash) return { ok: false, blocked: true };
  const asked = String(input.seatId || '').trim();
  if (asked) {
    const found = seats.find((item) => item.id === asked);
    if (!found || found.deviceHash !== deviceHash) return { ok: false, blocked: true };
    return { ok: true, seatId: found.id, seats, stamps };
  }
  const mine = seats.find((item) => item.deviceHash === deviceHash);
  if (mine) return { ok: true, seatId: mine.id, seats, stamps };
  const inviteId = String(input.inviteId || '').trim();
  const stamp = stamps.find((item) => item.id === inviteId);
  if (!stamp || stamp.exp <= now || stamp.revokedAt) return { ok: false, blocked: true };
  if (stamp.usedBy && stamp.usedBy !== deviceHash) return { ok: false, blocked: true };
  const nextSeat: GuestDeviceSeat = {
    id: `s${now.toString(36)}${Math.random().toString(36).slice(2, 10)}`,
    deviceHash,
    at: new Date().toISOString(),
  };
  const nextStamps = stamps.map((item) => (
    item.id === stamp.id
      ? { ...item, usedBy: deviceHash, sentAt: item.sentAt || new Date(now).toISOString() }
      : item
  ));
  return {
    ok: true,
    seatId: nextSeat.id,
    seats: [...seats, nextSeat],
    stamps: nextStamps,
  };
}

export function guestSeatMatches(seats: GuestDeviceSeat[], seatId: string, deviceHash: string): boolean {
  const found = seats.find((item) => item.id === seatId);
  return Boolean(found && found.deviceHash === String(deviceHash || '').trim());
}
