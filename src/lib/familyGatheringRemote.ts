/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { FAMILY_GATHERING_SA1_SLUG } from '@/config/familyGathering';

const API_PATH = '/api/public-family-gathering';
const LIVE_API_HOSTS = new Set(['www.halaqmap.com', 'halaqmap.com', 'store.halaqmap.com', 'community.nota-council.com']);

function configuredApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || import.meta.env.VITE_API_BASE_URL || '')
    .trim()
    .replace(/\/$/, '')
    .replace(/\/api$/i, '');
}

export function familyGatheringEndpoint(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (LIVE_API_HOSTS.has(host)) return API_PATH;
  }
  const origin = configuredApiOrigin();
  if (origin && !/\.vercel\.app$/i.test(origin)) return `${origin}${API_PATH}`;
  return API_PATH;
}

export type FamilyGreeting = {
  id: string;
  nameAr: string;
  messageAr: string;
  createdAt: string;
  isHidden?: boolean;
};

export type FamilyGatheringPublic = {
  ok: boolean;
  slug?: string;
  familyNameAr?: string;
  titleAr?: string;
  welcomeAr?: string;
  eventDateAr?: string;
  eventTimeAr?: string;
  placeAr?: string;
  greetings?: FamilyGreeting[];
  error?: string;
};

async function postJson(body: Record<string, unknown>, bearer?: string) {
  const res = await fetch(familyGatheringEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok && data.ok === true, status: res.status, data };
}

export async function fetchFamilyGatheringPublic(slug = FAMILY_GATHERING_SA1_SLUG): Promise<FamilyGatheringPublic> {
  const url = `${familyGatheringEndpoint()}?action=get_public&slug=${encodeURIComponent(slug)}`;
  const res = await fetch(url, { method: 'GET' });
  const data = (await res.json().catch(() => ({}))) as FamilyGatheringPublic;
  return { ...data, ok: res.ok && data.ok === true };
}

export async function addFamilyGreeting(input: {
  nameAr: string;
  messageAr: string;
  slug?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const result = await postJson({
    action: 'add_greeting',
    slug: input.slug || FAMILY_GATHERING_SA1_SLUG,
    nameAr: input.nameAr,
    messageAr: input.messageAr,
  });
  return { ok: result.ok, error: result.ok ? undefined : String(result.data.error || 'تعذّر الإرسال') };
}

export async function fetchFamilyGatheringHost(hostToken: string) {
  const url = `${familyGatheringEndpoint()}?action=get_host&host_token=${encodeURIComponent(hostToken)}`;
  const res = await fetch(url, { method: 'GET' });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok && data.ok === true, data };
}

export async function saveFamilyGatheringHost(hostToken: string, patch: Record<string, string>) {
  return postJson({ action: 'save_host', host_token: hostToken, ...patch });
}

export async function hideFamilyGreeting(hostToken: string, greetingId: string, hidden = true) {
  return postJson({ action: 'hide_greeting', host_token: hostToken, greetingId, hidden });
}

export async function adminEnsureFamilyGathering(bearer: string) {
  return postJson({ action: 'admin_ensure' }, bearer);
}

export async function adminMintFamilyHost(bearer: string, email: string, labelAr?: string) {
  return postJson({ action: 'admin_mint_host', email, labelAr }, bearer);
}
