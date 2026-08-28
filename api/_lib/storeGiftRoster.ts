/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قراءة قائمة مشاركات الهدايا للإدارة. لا وصول عام.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  giftProductLabelAr,
  STORE_GIFT_CONFIRM_HOURS,
  STORE_GIFT_CYCLES_TABLE,
  STORE_GIFT_ENTRIES_TABLE,
} from './storeGiftCampaign.js';
import {
  STORE_KITCHEN_GIFT_CONFIRM_HOURS,
  STORE_KITCHEN_GIFT_CYCLES_TABLE,
  STORE_KITCHEN_GIFT_ENTRIES_TABLE,
  STORE_KITCHEN_GIFT_PRODUCT_LABEL_AR,
} from './storeKitchenGiftCampaign.js';

export type StoreGiftRosterCampaign = 'occasion' | 'kitchen';
export type StoreGiftRosterMailState = 'pending' | 'active' | 'expired_link';

export type StoreGiftRosterRow = {
  id: string;
  campaign: StoreGiftRosterCampaign;
  campaignLabelAr: string;
  productLabelAr: string;
  givenName: string;
  email: string;
  city: string;
  source: string;
  occasionDate: string;
  slotNo: number;
  mailState: StoreGiftRosterMailState;
  emailVerifiedAt: string | null;
  createdAt: string;
  linkDeadlineAt: string;
};

function tableMissing(error: { message?: string } | null | undefined): boolean {
  const msg = String(error?.message || '').toLowerCase();
  return msg.includes('does not exist') || msg.includes('schema cache');
}

function deadlineIso(createdAt: string, hours: number): string {
  const t = Date.parse(createdAt);
  if (!Number.isFinite(t)) return createdAt;
  return new Date(t + hours * 3600 * 1000).toISOString();
}

function mailState(verifiedAt: string | null, deadlineAt: string): StoreGiftRosterMailState {
  if (verifiedAt) return 'active';
  const due = Date.parse(deadlineAt);
  if (Number.isFinite(due) && due <= Date.now()) return 'expired_link';
  return 'pending';
}

async function loadOccasion(db: SupabaseClient): Promise<StoreGiftRosterRow[]> {
  const { data, error } = await db
    .from(STORE_GIFT_ENTRIES_TABLE)
    .select(
      'id, cycle_id, given_name, email, city, source_channel, occasion_date, product_choice, event_voice, email_verified_at, created_at, updated_at',
    )
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) {
    if (tableMissing(error)) return [];
    throw error;
  }
  const cycleIds = [...new Set((data || []).map((row) => String(row.cycle_id || '')).filter(Boolean))];
  const slots = new Map<string, number>();
  if (cycleIds.length) {
    const { data: cycles } = await db.from(STORE_GIFT_CYCLES_TABLE).select('id, slot_no').in('id', cycleIds);
    for (const cycle of cycles || []) {
      slots.set(String(cycle.id), Number(cycle.slot_no) || 0);
    }
  }
  return (data || []).map((row) => {
    const createdAt = String(row.created_at || '');
    const linkDeadlineAt = deadlineIso(String(row.updated_at || createdAt), STORE_GIFT_CONFIRM_HOURS);
    const emailVerifiedAt = row.email_verified_at ? String(row.email_verified_at) : null;
    return {
      id: String(row.id),
      campaign: 'occasion' as const,
      campaignLabelAr: 'هدية خريطة الحل',
      productLabelAr: giftProductLabelAr(
        row.product_choice as 'wedding_men' | 'wedding_women' | 'event',
        (row.event_voice as 'men' | 'women' | null) || null,
      ),
      givenName: String(row.given_name || ''),
      email: String(row.email || ''),
      city: String(row.city || ''),
      source: String(row.source_channel || ''),
      occasionDate: String(row.occasion_date || ''),
      slotNo: slots.get(String(row.cycle_id)) || 0,
      mailState: mailState(emailVerifiedAt, linkDeadlineAt),
      emailVerifiedAt,
      createdAt,
      linkDeadlineAt,
    };
  });
}

async function loadKitchen(db: SupabaseClient): Promise<StoreGiftRosterRow[]> {
  const { data, error } = await db
    .from(STORE_KITCHEN_GIFT_ENTRIES_TABLE)
    .select('id, cycle_id, given_name, email, city, source_channel, email_verified_at, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) {
    if (tableMissing(error)) return [];
    throw error;
  }
  const cycleIds = [...new Set((data || []).map((row) => String(row.cycle_id || '')).filter(Boolean))];
  const slots = new Map<string, number>();
  if (cycleIds.length) {
    const { data: cycles } = await db.from(STORE_KITCHEN_GIFT_CYCLES_TABLE).select('id, slot_no').in('id', cycleIds);
    for (const cycle of cycles || []) {
      slots.set(String(cycle.id), Number(cycle.slot_no) || 0);
    }
  }
  return (data || []).map((row) => {
    const createdAt = String(row.created_at || '');
    const linkDeadlineAt = deadlineIso(String(row.updated_at || createdAt), STORE_KITCHEN_GIFT_CONFIRM_HOURS);
    const emailVerifiedAt = row.email_verified_at ? String(row.email_verified_at) : null;
    return {
      id: String(row.id),
      campaign: 'kitchen' as const,
      campaignLabelAr: 'هدية طبختنا1',
      productLabelAr: STORE_KITCHEN_GIFT_PRODUCT_LABEL_AR,
      givenName: String(row.given_name || ''),
      email: String(row.email || ''),
      city: String(row.city || ''),
      source: String(row.source_channel || ''),
      occasionDate: '',
      slotNo: slots.get(String(row.cycle_id)) || 0,
      mailState: mailState(emailVerifiedAt, linkDeadlineAt),
      emailVerifiedAt,
      createdAt,
      linkDeadlineAt,
    };
  });
}

export async function listStoreGiftRoster(db: SupabaseClient): Promise<StoreGiftRosterRow[]> {
  const [occasion, kitchen] = await Promise.all([loadOccasion(db), loadKitchen(db)]);
  return [...occasion, ...kitchen].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
