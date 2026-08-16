/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * ترميز كرت تفضيلي في الرابط — بلا خادم في المرحلة المجانية.
 */
import { INQUIRER_PREFERENCE_CARD_CITIES } from '@/config/inquirerPreferenceCardCopy';
import {
  SEMAT_BEARD_STYLE_OPTIONS,
  SEMAT_HAIR_PRESET_OPTIONS,
} from '@/config/sematCardFormOptions';
import { buildAbsoluteHashRoute } from '@/config/siteOrigin';
import { ROUTE_PATHS } from '@/lib/routePaths';

export const INQUIRER_PREFERENCE_SHARE_VERSION = 1 as const;
export const INQUIRER_PREFERENCE_SHARE_PUBLIC_ID = 'p' as const;

const NAME_MAX = 40;
const DETAIL_MAX = 200;
const NOTES_MAX = 200;

export type InquirerPreferenceCard = {
  displayName: string;
  cityId: string;
  hairPreset: string;
  hairDetail: string;
  beardStyle: string;
  notes: string;
};

type WirePayload = {
  v: typeof INQUIRER_PREFERENCE_SHARE_VERSION;
  n: string;
  c: string;
  h: string;
  d?: string;
  b?: string;
  o?: string;
};

const HAIR_VALUES = new Set(SEMAT_HAIR_PRESET_OPTIONS.map((o) => o.value));
const BEARD_VALUES = new Set(SEMAT_BEARD_STYLE_OPTIONS.map((o) => o.value));
const CITY_VALUES = new Set(INQUIRER_PREFERENCE_CARD_CITIES.map((o) => o.id));

function clip(raw: string, max: number): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, max);
}

export function normalizeInquirerPreferenceCard(
  input: Partial<InquirerPreferenceCard>,
): InquirerPreferenceCard | null {
  const displayName = clip(String(input.displayName || ''), NAME_MAX);
  const cityId = String(input.cityId || '').trim();
  const hairPreset = String(input.hairPreset || '').trim();
  const hairDetail = clip(String(input.hairDetail || ''), DETAIL_MAX);
  const beardStyle = String(input.beardStyle || '').trim();
  const notes = clip(String(input.notes || ''), NOTES_MAX);

  if (!displayName || !CITY_VALUES.has(cityId) || !HAIR_VALUES.has(hairPreset)) return null;
  if (beardStyle && !BEARD_VALUES.has(beardStyle)) return null;

  return { displayName, cityId, hairPreset, hairDetail, beardStyle, notes };
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(raw: string): Uint8Array | null {
  const padded = raw.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  try {
    const bin = atob(padded + pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

export function encodeInquirerPreferenceCard(card: InquirerPreferenceCard): string | null {
  const normalized = normalizeInquirerPreferenceCard(card);
  if (!normalized) return null;
  const wire: WirePayload = {
    v: INQUIRER_PREFERENCE_SHARE_VERSION,
    n: normalized.displayName,
    c: normalized.cityId,
    h: normalized.hairPreset,
  };
  if (normalized.hairDetail) wire.d = normalized.hairDetail;
  if (normalized.beardStyle) wire.b = normalized.beardStyle;
  if (normalized.notes) wire.o = normalized.notes;
  return toBase64Url(new TextEncoder().encode(JSON.stringify(wire)));
}

export function decodeInquirerPreferenceCard(token: string): InquirerPreferenceCard | null {
  const compact = String(token || '').trim();
  if (!compact || compact.length > 1800) return null;
  const bytes = fromBase64Url(compact);
  if (!bytes) return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as WirePayload;
    if (parsed?.v !== INQUIRER_PREFERENCE_SHARE_VERSION) return null;
    return normalizeInquirerPreferenceCard({
      displayName: parsed.n,
      cityId: parsed.c,
      hairPreset: parsed.h,
      hairDetail: parsed.d,
      beardStyle: parsed.b,
      notes: parsed.o,
    });
  } catch {
    return null;
  }
}

export function buildInquirerPreferenceSharePath(token: string): string {
  return `${ROUTE_PATHS.SEMAT_SCAN.replace(':publicId', INQUIRER_PREFERENCE_SHARE_PUBLIC_ID)}?c=${encodeURIComponent(token)}`;
}

export function buildInquirerPreferenceShareUrl(card: InquirerPreferenceCard): string | null {
  const token = encodeInquirerPreferenceCard(card);
  if (!token) return null;
  return buildAbsoluteHashRoute(buildInquirerPreferenceSharePath(token));
}

export function buildInquirerPreferenceWhatsappText(input: {
  card: InquirerPreferenceCard;
  shareUrl: string;
  cityName: string;
  hairLabel: string;
  beardLabel?: string;
  salonName?: string;
}): string {
  const lines = [
    'السلام عليكم',
    'هذا كرت تفضيلي من حلاق ماب يوضح طريقة الحلاقة المطلوبة.',
    input.salonName ? `للصالون: ${input.salonName}` : '',
    `اللقب: ${input.card.displayName}`,
    `المدينة: ${input.cityName}`,
    `الشعر: ${[input.hairLabel, input.card.hairDetail].filter(Boolean).join(' · ')}`,
    input.beardLabel ? `اللحية: ${input.beardLabel}` : '',
    input.card.notes ? `ملاحظة: ${input.card.notes}` : '',
    `الرابط: ${input.shareUrl}`,
    'هذا توضيح للطلب — ليس حجزاً عبر المنصة.',
  ];
  return lines.filter(Boolean).join('\n');
}
