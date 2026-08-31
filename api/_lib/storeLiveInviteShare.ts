/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * وسم واتساب لروابط مدعوي افراحي1 واجواء1: كرت الدعوة في الصورة،
 * وشعار المتجر يبقى لوسم جذر store.halaqmap.com.
 */
export const STORE_LIVE_INVITE_ORIGIN = 'https://store.halaqmap.com';
export const STORE_LIVE_INVITE_SITE_NAME = 'halaqmap · خريطة الحل';
export const STORE_LIVE_INVITE_MARK =
  `${STORE_LIVE_INVITE_ORIGIN}/images/halaqmap-store-mark-radar-square-1200x1200.png`;
export const STORE_LIVE_INVITE_CARD_MEN =
  `${STORE_LIVE_INVITE_ORIGIN}/images/store/lab/lab-luxury-gold.jpg`;
export const STORE_LIVE_INVITE_CARD_WOMEN =
  `${STORE_LIVE_INVITE_ORIGIN}/images/store/lab/lab-luxury-rosegold.jpg`;

export type StoreLiveInviteKind = 'wedding' | 'event';

const LAB_TOKENS: Record<StoreLiveInviteKind, { men: string; women: string }> = {
  wedding: { men: 'lab', women: 'lab-women' },
  event: { men: 'event-lab', women: 'event-lab-women' },
};

const TOKEN_RE = /^[A-Za-z0-9_-]{3,64}$/;
const INVITE_RE = /^[A-Za-z0-9_-]{6,80}$/;

export function parseStoreLiveInviteKind(raw: unknown): StoreLiveInviteKind | null {
  const value = String(raw || '').trim();
  if (value === 'wedding' || value === 'event') return value;
  return null;
}

export function parseStoreLiveInviteToken(raw: unknown): string {
  const token = String(raw || '').trim();
  return TOKEN_RE.test(token) ? token : '';
}

export function parseStoreLiveInviteId(raw: unknown): string {
  const id = String(raw || '').trim();
  return INVITE_RE.test(id) ? id : '';
}

export function isStoreLiveInviteLabToken(kind: StoreLiveInviteKind, token: string): boolean {
  const lab = LAB_TOKENS[kind];
  return token === lab.men || token === lab.women;
}

export function storeLiveInviteVoice(kind: StoreLiveInviteKind, token: string, payloadVoice?: unknown): 'men' | 'women' {
  if (String(payloadVoice || '').trim() === 'women') return 'women';
  return token === LAB_TOKENS[kind].women ? 'women' : 'men';
}

export function storeLiveInvitePrefix(kind: StoreLiveInviteKind): '/w' | '/e' {
  return kind === 'wedding' ? '/w' : '/e';
}

export function storeLiveInviteProductAr(kind: StoreLiveInviteKind): string {
  return kind === 'wedding' ? 'افراحي1' : 'اجواء1';
}

export function storeLiveInviteGuestPath(kind: StoreLiveInviteKind, token: string, inviteId = ''): string {
  const path = `${storeLiveInvitePrefix(kind)}/${encodeURIComponent(token)}/guest`;
  return inviteId ? `${path}?invite=${encodeURIComponent(inviteId)}` : path;
}

export function storeLiveInviteShareHref(kind: StoreLiveInviteKind, token: string, inviteId = ''): string {
  return `${STORE_LIVE_INVITE_ORIGIN}${storeLiveInviteGuestPath(kind, token, inviteId)}`;
}

export function storeLiveInviteHashHref(kind: StoreLiveInviteKind, token: string, inviteId = ''): string {
  return `${STORE_LIVE_INVITE_ORIGIN}/#${storeLiveInviteGuestPath(kind, token, inviteId)}`;
}

export function storeLiveInviteCardImage(input: {
  kind: StoreLiveInviteKind;
  token: string;
  voice?: unknown;
  photoSrc?: unknown;
}): string {
  const voice = storeLiveInviteVoice(input.kind, input.token, input.voice);
  const fallback = voice === 'women' ? STORE_LIVE_INVITE_CARD_WOMEN : STORE_LIVE_INVITE_CARD_MEN;
  const src = String(input.photoSrc || '').trim().split('?')[0] || '';
  if (src.startsWith('/images/store/') && !src.includes('..')) {
    return `${STORE_LIVE_INVITE_ORIGIN}${src}`;
  }
  if (src.startsWith(`${STORE_LIVE_INVITE_ORIGIN}/images/store/`) && !src.includes('..')) {
    return src;
  }
  return fallback;
}

export function storeLiveInviteCopy(input: {
  kind: StoreLiveInviteKind;
  hostName?: unknown;
  occasionTitle?: unknown;
}): { title: string; description: string } {
  const product = storeLiveInviteProductAr(input.kind);
  const hostName = String(input.hostName || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  const occasion = String(input.occasionTitle || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  const title = hostName ? `دعوتكم الخاصة من ${hostName} — ${product}` : `دعوتكم الخاصة — ${product}`;
  const lead =
    input.kind === 'wedding'
      ? occasion || 'كرت دعوة زفاف يفتح إلى قاعة الحفل الحيّة.'
      : occasion || 'كرت دعوة يفتح إلى قاعة المناسبة الحيّة.';
  return {
    title,
    description: `${lead} ${STORE_LIVE_INVITE_SITE_NAME}`,
  };
}
