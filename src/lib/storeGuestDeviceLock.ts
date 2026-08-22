/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * روابط مدعوي افراحي1 واجواء1: يصدرها المشتري من لوحته، لمرة واحدة وجهاز واحد.
 */
import { readHashQueryParam } from '@/lib/hashQueryParams';

export type GuestLockKind = 'wedding' | 'event';

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

const DEVICE_KEY = 'hm-guest-device-id';
export const GUEST_INVITE_BATCH_SIZE = 200;
export const MAX_GUEST_INVITES = GUEST_INVITE_BATCH_SIZE;
export const GUEST_INVITE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export function readOrCreateGuestDeviceId(): string {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(DEVICE_KEY)?.trim();
  if (existing) return existing;
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `d${Date.now()}`;
  window.localStorage.setItem(DEVICE_KEY, id);
  return id;
}

export function guestDeviceHash(deviceId: string): string {
  return String(deviceId || '').trim().slice(0, 80);
}

function seatsKey(kind: GuestLockKind, token: string): string {
  return `hm-guest-seats:${kind}:${token}`;
}

function invitesKey(kind: GuestLockKind, token: string): string {
  return `hm-guest-invites:${kind}:${token}`;
}

function ownSeatKey(kind: GuestLockKind, token: string): string {
  return `hm-guest-own:${kind}:${token}`;
}

export function readLocalGuestSeats(kind: GuestLockKind, token: string): GuestDeviceSeat[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(seatsKey(kind, token));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestDeviceSeat[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalGuestSeats(kind: GuestLockKind, token: string, seats: GuestDeviceSeat[]): void {
  window.localStorage.setItem(seatsKey(kind, token), JSON.stringify(seats));
}

export function readLocalGuestInvites(kind: GuestLockKind, token: string): GuestInviteStamp[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(invitesKey(kind, token));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestInviteStamp[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalGuestInvites(kind: GuestLockKind, token: string, stamps: GuestInviteStamp[]): void {
  window.localStorage.setItem(invitesKey(kind, token), JSON.stringify(stamps));
}

export function readOwnGuestSeatId(kind: GuestLockKind, token: string): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(ownSeatKey(kind, token))?.trim() || '';
}

export function writeOwnGuestSeatId(kind: GuestLockKind, token: string, seatId: string): void {
  window.localStorage.setItem(ownSeatKey(kind, token), seatId);
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
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? `i${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
        : `i${(now + i).toString(36)}${Math.random().toString(36).slice(2, 8)}`,
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

export function mintLocalGuestInviteBatch(kind: GuestLockKind, token: string, count = GUEST_INVITE_BATCH_SIZE) {
  const minted = mintGuestInviteBatch(readLocalGuestInvites(kind, token), count);
  writeLocalGuestInvites(kind, token, minted.stamps);
  return minted;
}

export function markLocalGuestInviteSent(kind: GuestLockKind, token: string, inviteId: string) {
  const stamps = readLocalGuestInvites(kind, token);
  const id = String(inviteId || '').trim();
  const found = stamps.find((item) => item.id === id);
  if (!found) return { ok: false as const };
  const stamp = { ...found, sentAt: found.sentAt || new Date().toISOString() };
  writeLocalGuestInvites(kind, token, stamps.map((item) => (item.id === id ? stamp : item)));
  return { ok: true as const, stamp };
}

export function guestInviteStats(stamps: GuestInviteStamp[], now = Date.now()) {
  const live = stamps.filter((item) => item.exp > now || item.sentAt || item.usedBy);
  const ready = live.filter((item) => !item.sentAt && !item.usedBy && item.exp > now).length;
  return {
    total: live.length,
    ready,
    sent: live.filter((item) => Boolean(item.sentAt) || Boolean(item.usedBy)).length,
    opened: live.filter((item) => Boolean(item.usedBy)).length,
    remaining: ready,
    cap: 0,
  };
}

export function summarizeLocalGuestInvites(kind: GuestLockKind, token: string, pathPrefix: '/w' | '/e'): GuestInviteRow[] {
  return readLocalGuestInvites(kind, token).map((item) => ({
    id: item.id,
    n: item.n,
    sent: Boolean(item.sentAt),
    opened: Boolean(item.usedBy),
    guestUrl: guestInviteHref(pathPrefix, token, item.id),
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
  const deviceHash = guestDeviceHash(input.deviceHash);
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
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `s${now}`,
    deviceHash,
    at: new Date().toISOString(),
  };
  return {
    ok: true,
    seatId: nextSeat.id,
    seats: [...seats, nextSeat],
    stamps: stamps.map((item) => (
      item.id === stamp.id
        ? { ...item, usedBy: deviceHash, sentAt: item.sentAt || new Date(now).toISOString() }
        : item
    )),
  };
}

export function claimLocalGuestSeat(
  kind: GuestLockKind,
  token: string,
  input: { seatId?: string; inviteId?: string; deviceHash: string },
) {
  const result = claimGuestSeat(
    readLocalGuestSeats(kind, token),
    readLocalGuestInvites(kind, token),
    input,
  );
  if (result.ok) {
    writeLocalGuestSeats(kind, token, result.seats);
    writeLocalGuestInvites(kind, token, result.stamps);
    writeOwnGuestSeatId(kind, token, result.seatId);
  }
  return result;
}

export function readGuestSeatFromUrl(): string {
  return readHashQueryParam('seat') || '';
}

export function readGuestInviteFromUrl(): string {
  return readHashQueryParam('invite') || '';
}

export function replaceGuestSeatInUrl(seatId: string): void {
  if (typeof window === 'undefined' || !seatId) return;
  const hash = window.location.hash || '';
  const path = hash.replace(/^#/, '').split('?')[0] || '';
  const query = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : window.location.search.replace(/^\?/, '');
  const params = new URLSearchParams(query);
  params.delete('invite');
  if (params.get('seat') === seatId && !query.includes('invite=')) return;
  params.set('seat', seatId);
  const next = `${window.location.pathname}${window.location.search.split('#')[0] || ''}#${path}?${params.toString()}`;
  window.history.replaceState(null, '', next);
}

export function guestInviteHref(pathPrefix: '/w' | '/e', token: string, inviteId: string): string {
  const path = `${pathPrefix}/${encodeURIComponent(token)}/guest?invite=${encodeURIComponent(inviteId)}`;
  if (typeof window === 'undefined') return `https://store.halaqmap.com/#${path}`;
  return `${window.location.origin}/#${path}`;
}
