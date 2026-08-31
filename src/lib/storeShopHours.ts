/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إشارة مفتوح/مغلق من زر اللوحة. الجدول للعرض وفق توقيت المملكة.
 * بلا خلط بمنتجات المناسبات.
 */
import {
  DEFAULT_STORE_SHOP_HOURS,
  STORE_SHOP_HOURS_COPY,
  type StoreShopHoursMode,
  type StoreShopHoursState,
} from '@/config/storeShopHours';

const TIME = /^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/;

export function parseHourClock(raw: unknown, fallback: string): string {
  const value = String(raw ?? '').trim();
  const match = TIME.exec(value);
  if (!match) return fallback;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export function parseShopFlag(raw: unknown, fallback: boolean): boolean {
  if (typeof raw === 'boolean') return raw;
  if (raw === 1 || raw === '1' || raw === 'true' || raw === 'TRUE') return true;
  if (raw === 0 || raw === '0' || raw === 'false' || raw === 'FALSE') return false;
  return fallback;
}

export function parseStoreShopHours(
  raw: Record<string, unknown> | StoreShopHoursState | null | undefined,
  fallback: StoreShopHoursState = DEFAULT_STORE_SHOP_HOURS,
): StoreShopHoursState {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const mode: StoreShopHoursMode =
    row.hoursMode === 'split' ? 'split' : row.hoursMode === 'single' ? 'single' : fallback.hoursMode;
  return {
    shopOpen: parseShopFlag(row.shopOpen, fallback.shopOpen),
    hoursEnabled: parseShopFlag(row.hoursEnabled, fallback.hoursEnabled),
    hoursMode: mode,
    hoursOpen: parseHourClock(row.hoursOpen, fallback.hoursOpen),
    hoursClose: parseHourClock(row.hoursClose, fallback.hoursClose),
    hoursMorningOpen: parseHourClock(row.hoursMorningOpen, fallback.hoursMorningOpen),
    hoursMorningClose: parseHourClock(row.hoursMorningClose, fallback.hoursMorningClose),
    hoursEveningOpen: parseHourClock(row.hoursEveningOpen, fallback.hoursEveningOpen),
    hoursEveningClose: parseHourClock(row.hoursEveningClose, fallback.hoursEveningClose),
  };
}

function clockToMinutes(clock: string): number | null {
  const match = TIME.exec(clock);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function inWindow(now: number, startClock: string, endClock: string): boolean {
  const start = clockToMinutes(startClock);
  const end = clockToMinutes(endClock);
  if (start == null || end == null) return true;
  if (start === end) return true;
  if (start < end) return now >= start && now < end;
  return now >= start || now < end;
}

export function riyadhMinutesNow(at = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Riyadh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  }).formatToParts(at);
  let hour = Number(parts.find((part) => part.type === 'hour')?.value || '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || '0');
  if (hour === 24) hour = 0;
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) hour = 0;
  if (!Number.isFinite(minute) || minute < 0 || minute > 59) return hour * 60;
  return hour * 60 + minute;
}

export function isWithinShopHours(hours: StoreShopHoursState, at = new Date()): boolean {
  if (!hours.hoursEnabled) return true;
  const now = riyadhMinutesNow(at);
  if (hours.hoursMode === 'split') {
    return (
      inWindow(now, hours.hoursMorningOpen, hours.hoursMorningClose) ||
      inWindow(now, hours.hoursEveningOpen, hours.hoursEveningClose)
    );
  }
  return inWindow(now, hours.hoursOpen, hours.hoursClose);
}

/** إشارة الزائر من زر اللوحة فقط. الجدول لا يقلبها. */
export function isShopClosedNow(hours: StoreShopHoursState, _at = new Date()): boolean {
  return hours.shopOpen === false;
}

export function shopHoursLinesAr(hours: StoreShopHoursState): string[] {
  if (!hours.hoursEnabled) return [];
  if (hours.hoursMode === 'split') {
    return [
      STORE_SHOP_HOURS_COPY.morningLineAr(hours.hoursMorningOpen, hours.hoursMorningClose),
      STORE_SHOP_HOURS_COPY.eveningLineAr(hours.hoursEveningOpen, hours.hoursEveningClose),
    ];
  }
  return [STORE_SHOP_HOURS_COPY.singleLineAr(hours.hoursOpen, hours.hoursClose)];
}
