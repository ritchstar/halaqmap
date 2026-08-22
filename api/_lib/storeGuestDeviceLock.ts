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
};

export type GuestInviteRow = {
  id: string;
  n: number;
  sent: boolean;
  opened: boolean;
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
      return {
        id: String(row.id || '').trim(),
        n: Math.max(1, Number(row.n) || index + 1),
        exp: Number(row.exp) || 0,
        ...(usedBy ? { usedBy } : {}),
        ...(sentAt ? { sentAt } : {}),
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
  const kept = stamps.filter((item) => item.usedBy || item.sentAt || item.exp > now);
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
  if (!found || found.exp <= now) return { ok: false };
  const sentAt = found.sentAt || new Date(now).toISOString();
  const stamp = { ...found, sentAt };
  return {
    ok: true,
    stamp,
    stamps: stamps.map((item) => (item.id === id ? stamp : item)),
  };
}

export function nextReadyInvite(stamps: GuestInviteStamp[], now = Date.now()): GuestInviteStamp | null {
  return stamps.find((item) => !item.sentAt && !item.usedBy && item.exp > now) || null;
}

export function guestInviteStats(stamps: GuestInviteStamp[], now = Date.now()) {
  const live = stamps.filter((item) => item.exp > now || item.sentAt || item.usedBy);
  const ready = live.filter((item) => !item.sentAt && !item.usedBy && item.exp > now).length;
  const opened = live.filter((item) => Boolean(item.usedBy)).length;
  const sent = live.filter((item) => Boolean(item.sentAt) || Boolean(item.usedBy)).length;
  return {
    total: live.length,
    ready,
    sent,
    opened,
    remaining: ready,
    cap: 0,
  };
}

export function summarizeGuestInvites(stamps: GuestInviteStamp[], baseGuestUrl: string): GuestInviteRow[] {
  return stamps.map((item) => ({
    id: item.id,
    n: item.n,
    sent: Boolean(item.sentAt),
    opened: Boolean(item.usedBy),
    guestUrl: `${baseGuestUrl}?invite=${encodeURIComponent(item.id)}`,
  }));
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
  if (!stamp || stamp.exp <= now) return { ok: false, blocked: true };
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
