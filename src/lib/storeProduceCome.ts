/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تذكرة تعال لخضارنا1 على المسار المتحرك: مسافة واقتراب وتنبيه المتصفح.
 */
import { STORE_PRODUCE_LIVE } from '@/config/storeProduceLive';

export const PRODUCE_COME_APPROACH_METERS = 250;

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  if (![lat1, lng1, lat2, lng2].every((n) => Number.isFinite(n)) || !lat1 || !lat2) return Number.POSITIVE_INFINITY;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isProduceComeApproaching(
  buyerLat: number,
  buyerLng: number,
  carLat: number,
  carLng: number,
  meters = PRODUCE_COME_APPROACH_METERS,
): boolean {
  return haversineMeters(buyerLat, buyerLng, carLat, carLng) <= meters;
}

export function parseMapsQueryCoords(raw: string): { lat: number; lng: number } | null {
  const value = String(raw || '').trim();
  if (!value) return null;
  const query = value.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  const at = value.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  const pair = value.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  const hit = query || at || pair;
  if (!hit) return null;
  const lat = Number(hit[1]);
  const lng = Number(hit[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }
  if (!lat || !lng) return null;
  return { lat, lng };
}

export async function requestProduceComeNotify(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

export async function showProduceComeApproachingNotice(shopName: string): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
  const title = shopName.trim() ? `${shopName.trim().slice(0, 40)} — تعال` : STORE_PRODUCE_LIVE.serviceComeAr;
  const body = STORE_PRODUCE_LIVE.comeApproachingAr;
  const opts: NotificationOptions = { body, tag: 'produce-come-approach', dir: 'rtl', lang: 'ar' };
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    if (reg && typeof reg.showNotification === 'function') {
      await reg.showNotification(title, opts);
      return;
    }
  } catch {
    /* fallback */
  }
  try {
    new Notification(title, opts);
  } catch {
    /* ignore */
  }
}
