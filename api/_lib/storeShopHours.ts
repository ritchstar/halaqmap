/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحقق أوقات العمل على الخادم. يطابق منطق الواجهة.
 */
export type StoreShopHoursMode = 'single' | 'split';

export type StoreShopHoursState = {
  shopOpen: boolean;
  hoursEnabled: boolean;
  hoursMode: StoreShopHoursMode;
  hoursOpen: string;
  hoursClose: string;
  hoursMorningOpen: string;
  hoursMorningClose: string;
  hoursEveningOpen: string;
  hoursEveningClose: string;
};

export const DEFAULT_STORE_SHOP_HOURS: StoreShopHoursState = {
  shopOpen: true,
  hoursEnabled: false,
  hoursMode: 'single',
  hoursOpen: '09:00',
  hoursClose: '23:00',
  hoursMorningOpen: '08:00',
  hoursMorningClose: '12:00',
  hoursEveningOpen: '16:00',
  hoursEveningClose: '23:00',
};

const TIME = /^([01]?\d|2[0-3]):([0-5]\d)$/;

function parseHourClock(raw: unknown, fallback: string): string {
  const value = String(raw ?? '').trim();
  if (!TIME.test(value)) return fallback;
  const [h, m] = value.split(':');
  return `${h.padStart(2, '0')}:${m}`;
}

export function parseStoreShopHours(
  raw: Record<string, unknown> | StoreShopHoursState | null | undefined,
  fallback: StoreShopHoursState = DEFAULT_STORE_SHOP_HOURS,
): StoreShopHoursState {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const mode: StoreShopHoursMode =
    row.hoursMode === 'split' ? 'split' : row.hoursMode === 'single' ? 'single' : fallback.hoursMode;
  return {
    shopOpen: typeof row.shopOpen === 'boolean' ? row.shopOpen : fallback.shopOpen,
    hoursEnabled: typeof row.hoursEnabled === 'boolean' ? row.hoursEnabled : fallback.hoursEnabled,
    hoursMode: mode,
    hoursOpen: parseHourClock(row.hoursOpen, fallback.hoursOpen),
    hoursClose: parseHourClock(row.hoursClose, fallback.hoursClose),
    hoursMorningOpen: parseHourClock(row.hoursMorningOpen, fallback.hoursMorningOpen),
    hoursMorningClose: parseHourClock(row.hoursMorningClose, fallback.hoursMorningClose),
    hoursEveningOpen: parseHourClock(row.hoursEveningOpen, fallback.hoursEveningOpen),
    hoursEveningClose: parseHourClock(row.hoursEveningClose, fallback.hoursEveningClose),
  };
}
