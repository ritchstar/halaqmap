/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import {
  isStoreShopPresenceLabToken,
  STORE_SHOP_PRESENCE_PING_MS,
  STORE_SHOP_PRESENCE_TTL_MS,
  type StoreShopPresenceTag,
} from '@/config/storeShopPresence';

const API_PATH = '/api/public-store-shop-presence';
const LIVE_API_HOSTS = new Set(['www.halaqmap.com', 'halaqmap.com', 'store.halaqmap.com']);
const VISITOR_RE = /^[a-z0-9]{16,40}$/;

function configuredApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || import.meta.env.VITE_API_BASE_URL || '')
    .trim()
    .replace(/\/$/, '')
    .replace(/\/api$/i, '');
}

export function storeShopPresenceEndpoint(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (LIVE_API_HOSTS.has(host)) return API_PATH;
  }
  const origin = configuredApiOrigin();
  if (origin && !/\.vercel\.app$/i.test(origin)) return `${origin}${API_PATH}`;
  return API_PATH;
}

export function prunePresenceMap(
  map: Record<string, number>,
  nowMs = Date.now(),
  ttlMs = STORE_SHOP_PRESENCE_TTL_MS,
): Record<string, number> {
  const next: Record<string, number> = {};
  for (const [key, seen] of Object.entries(map)) {
    if (!VISITOR_RE.test(key)) continue;
    if (nowMs - seen <= ttlMs) next[key] = seen;
  }
  return next;
}

export function countPresenceMap(
  map: Record<string, number>,
  nowMs = Date.now(),
  ttlMs = STORE_SHOP_PRESENCE_TTL_MS,
): number {
  return Object.keys(prunePresenceMap(map, nowMs, ttlMs)).length;
}

function visitorStorageKey(tag: StoreShopPresenceTag, token: string): string {
  return `hm.storeShopPresence.visitor.${tag}.${token}`;
}

function labMapKey(tag: StoreShopPresenceTag, token: string): string {
  return `hm.storeShopPresence.map.${tag}.${token}`;
}

function labChannelName(tag: StoreShopPresenceTag, token: string): string {
  return `hm-store-shop-presence:${tag}:${token}`;
}

export function newStoreShopVisitorKey(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function readStoreShopVisitorKey(tag: StoreShopPresenceTag, token: string): string {
  if (typeof sessionStorage === 'undefined') return newStoreShopVisitorKey();
  const key = visitorStorageKey(tag, token);
  const existing = sessionStorage.getItem(key) || '';
  if (VISITOR_RE.test(existing)) return existing;
  const next = newStoreShopVisitorKey();
  sessionStorage.setItem(key, next);
  return next;
}

function readLabMap(tag: StoreShopPresenceTag, token: string): Record<string, number> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = JSON.parse(localStorage.getItem(labMapKey(tag, token)) || '{}') as unknown;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const map: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      const n = Number(v);
      if (VISITOR_RE.test(k) && Number.isFinite(n)) map[k] = n;
    }
    return prunePresenceMap(map);
  } catch {
    return {};
  }
}

function writeLabMap(tag: StoreShopPresenceTag, token: string, map: Record<string, number>) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(labMapKey(tag, token), JSON.stringify(prunePresenceMap(map)));
}

export function labPresencePing(tag: StoreShopPresenceTag, token: string, visitorKey: string): number {
  const map = readLabMap(tag, token);
  map[visitorKey] = Date.now();
  writeLabMap(tag, token, map);
  try {
    const ch = new BroadcastChannel(labChannelName(tag, token));
    ch.postMessage({ t: Date.now() });
    ch.close();
  } catch {
    /* ignore */
  }
  return countPresenceMap(map);
}

export function labPresenceLeave(tag: StoreShopPresenceTag, token: string, visitorKey: string): number {
  const map = readLabMap(tag, token);
  delete map[visitorKey];
  writeLabMap(tag, token, map);
  try {
    const ch = new BroadcastChannel(labChannelName(tag, token));
    ch.postMessage({ t: Date.now() });
    ch.close();
  } catch {
    /* ignore */
  }
  return countPresenceMap(map);
}

export function labPresenceCount(tag: StoreShopPresenceTag, token: string): number {
  return countPresenceMap(readLabMap(tag, token));
}

export function subscribeLabPresence(
  tag: StoreShopPresenceTag,
  token: string,
  onChange: () => void,
): () => void {
  const refresh = () => onChange();
  const timer = window.setInterval(refresh, STORE_SHOP_PRESENCE_PING_MS);
  window.addEventListener('storage', refresh);
  let ch: BroadcastChannel | null = null;
  try {
    ch = new BroadcastChannel(labChannelName(tag, token));
    ch.onmessage = refresh;
  } catch {
    ch = null;
  }
  return () => {
    window.clearInterval(timer);
    window.removeEventListener('storage', refresh);
    ch?.close();
  };
}

async function postPresence(body: Record<string, unknown>): Promise<{ ok: boolean; count?: number }> {
  try {
    const res = await fetch(storeShopPresenceEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; count?: unknown };
    if (!res.ok || data.ok !== true) return { ok: false };
    const count = Number(data.count);
    return { ok: true, count: Number.isFinite(count) ? count : undefined };
  } catch {
    return { ok: false };
  }
}

export async function pingStoreShopPresence(
  tag: StoreShopPresenceTag,
  token: string,
  visitorKey: string,
): Promise<boolean> {
  if (isStoreShopPresenceLabToken(token)) {
    labPresencePing(tag, token, visitorKey);
    return true;
  }
  const result = await postPresence({ action: 'ping', productTag: tag, token, visitorKey });
  return result.ok;
}

export async function leaveStoreShopPresence(
  tag: StoreShopPresenceTag,
  token: string,
  visitorKey: string,
): Promise<void> {
  if (isStoreShopPresenceLabToken(token)) {
    labPresenceLeave(tag, token, visitorKey);
    return;
  }
  await postPresence({ action: 'leave', productTag: tag, token, visitorKey });
}

export async function countStoreShopPresence(tag: StoreShopPresenceTag, token: string): Promise<number> {
  if (isStoreShopPresenceLabToken(token)) return labPresenceCount(tag, token);
  const result = await postPresence({ action: 'count', productTag: tag, token });
  return result.ok && typeof result.count === 'number' ? result.count : 0;
}
