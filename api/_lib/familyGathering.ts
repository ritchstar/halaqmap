/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تجمع عائلي مستقل — sa1 ونسخ مشابهة. بلا دفع وبلا مجتمع ماب.
 */
import { randomBytes } from 'node:crypto';

export const FAMILY_GATHERING_INSTANCES_TABLE = 'family_gathering_instances' as const;
export const FAMILY_GATHERING_HOSTS_TABLE = 'family_gathering_hosts' as const;
export const FAMILY_GATHERING_GREETINGS_TABLE = 'family_gathering_greetings' as const;

export const FAMILY_GATHERING_SA1_SLUG = 'sa1' as const;

export const FAMILY_GATHERING_DEFAULTS = {
  familyNameAr: 'عائلة السراء',
  titleAr: 'صباحكم عيد، يا آل السراء',
  welcomeAr:
    'كل عام وأنتم بخير، تقبل الله منا ومنكم صالح الأعمال. هذه لوحة تجمعنا صباح العيد — أرسل تهنئتك من جوالك لتظهر هنا فوراً أمام الجميع.',
  eventDateAr: 'صباح أول أيام عيد الفطر',
  eventTimeAr: 'بعد صلاة العيد',
  placeAr: 'مجلس العائلة',
} as const;

export const GREETING_NAME_MAX = 40;
export const GREETING_MESSAGE_MAX = 140;
export const GREETINGS_DISPLAY_LIMIT = 60;

export function newFamilyGatheringToken(): string {
  return randomBytes(24).toString('base64url');
}

export function clipGreetingName(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, GREETING_NAME_MAX);
}

export function clipGreetingMessage(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, GREETING_MESSAGE_MAX);
}

export function clipEmail(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .slice(0, 160);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 160;
}

export type FamilyGatheringPublic = {
  slug: string;
  familyNameAr: string;
  titleAr: string;
  welcomeAr: string;
  eventDateAr: string;
  eventTimeAr: string;
  placeAr: string;
  greetings: Array<{ id: string; nameAr: string; messageAr: string; createdAt: string }>;
};

export type FamilyGatheringHostView = FamilyGatheringPublic & {
  hosts: Array<{ id: string; email: string; labelAr: string; hostToken: string; createdAt: string }>;
};
