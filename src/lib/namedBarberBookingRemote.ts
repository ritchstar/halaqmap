/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { readBarberAuthSession } from '@/lib/barberPortalSession';
import {
  clearStaffPortalSession,
  readStaffPortalSession,
  readStaffSessionTokenHeader,
  writeStaffPortalSession,
  type StaffPortalStoredSession,
} from '@/lib/staffPortalSession';

const TEAM_ENDPOINT = '/api/barber-team-members';
const PUBLIC_ENDPOINT = '/api/named-barber-booking';
const BOOKING_ENDPOINT = '/api/diamond-appointment-booking';
const STAFF_BOOKINGS_ENDPOINT = '/api/staff-team-bookings';

export type ContactMode = 'classic' | 'booking_only';

export type CardCtaFlags = {
  showPhone: boolean;
  showWhatsApp: boolean;
  showChat: boolean;
  showBooking: boolean;
};

export const DEFAULT_CARD_CTA: CardCtaFlags = {
  showPhone: true,
  showWhatsApp: true,
  showChat: true,
  showBooking: false,
};

export type TeamMemberRemote = {
  id: string;
  barber_id: string;
  display_name: string;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
  default_duration_minutes: number;
  internal_notes: string | null;
  return_to_work_date?: string | null;
  staff_access_token?: string | null;
  notify_phone?: string | null;
};

export type StaffTeamBookingRemote = {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
};

export type StaffTeamBookingsPayload = {
  member: {
    id: string;
    displayName: string;
    photoUrl: string | null;
    isActive: boolean;
  };
  salon: {
    id: string;
    name: string;
  };
  bookings: StaffTeamBookingRemote[];
  pendingCount: number;
};

export type PublicBookingTeamMember = {
  id: string;
  displayName: string;
  photoUrl: string | null;
  defaultDurationMinutes: number;
};

export type PublicBookingContext = {
  salon: {
    id: string;
    name: string;
    contactMode: ContactMode;
    cardCta?: CardCtaFlags;
    address: string | null;
    tier: string | null;
  };
  team: PublicBookingTeamMember[];
};

function publicHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

function barberHeaders(): Record<string, string> {
  const headers = publicHeaders();
  try {
    const raw = localStorage.getItem('barberAuth');
    if (raw) {
      const parsed = JSON.parse(raw) as { barberSessionToken?: unknown };
      const token = String(parsed.barberSessionToken ?? '').trim();
      if (token) headers['x-barber-portal-session'] = token;
    }
  } catch {
    /* ignore */
  }
  return headers;
}

function portalCreds(): { barberId: string; email: string } | null {
  const session = readBarberAuthSession();
  const barberId = String(session?.id ?? '').trim();
  const email = String(session?.email ?? '').trim();
  if (!barberId || !email.includes('@')) return null;
  return { barberId, email };
}

function normalizeError(message: string): string {
  const raw = String(message || '').trim();
  const m = raw.toLowerCase();
  if (raw.includes('الطاقم') || m.includes('staff')) {
    return raw || 'انتهت جلسة الطاقم. أعد فتح الرابط.';
  }
  if (m.includes('جلسة') || m.includes('session') || m.includes('missing_token')) {
    return 'انتهت جلسة لوحة التحكم. أعد تسجيل الدخول.';
  }
  if (m.includes('diamond')) return 'هذه الميزة متاحة لباقة ماسي فقط.';
  if (m.includes('slot overlaps')) return 'هذا الوقت محجوز مسبقاً. اختر وقتاً آخر.';
  if (m.includes('invalid saudi')) return 'أدخل رقم جوال سعودي صحيح يبدأ بـ 05 (10 أرقام).';
  return raw || 'تعذّر تنفيذ العملية.';
}

function staffHeaders(accessToken?: string): Record<string, string> {
  const headers = publicHeaders();
  const sessionToken = readStaffSessionTokenHeader(accessToken);
  if (sessionToken) headers['x-staff-portal-session'] = sessionToken;
  return headers;
}

async function postJson<T>(
  endpoint: string,
  payload: Record<string, unknown>,
  auth: 'public' | 'barber' | 'staff',
  accessTokenForStaff?: string,
): Promise<{ ok: true; json: T } | { ok: false; error: string }> {
  try {
    const headers =
      auth === 'barber'
        ? barberHeaders()
        : auth === 'staff'
          ? staffHeaders(accessTokenForStaff)
          : publicHeaders();
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as T & { error?: string; ok?: boolean };
    if (!res.ok) {
      return { ok: false, error: normalizeError(json.error || `HTTP ${res.status}`) };
    }
    return { ok: true, json };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export function resolveCardCta(barber: {
  cardCta?: CardCtaFlags | null;
  contactMode?: ContactMode | string | null;
}): CardCtaFlags {
  if (barber.cardCta) return barber.cardCta;
  if (String(barber.contactMode ?? '') === 'booking_only') {
    return { showPhone: false, showWhatsApp: false, showChat: true, showBooking: true };
  }
  return { ...DEFAULT_CARD_CTA };
}

/** @deprecated استخدم resolveCardCta */
export function isBookingOnlyContact(barber: {
  contactMode?: ContactMode | string | null;
  cardCta?: CardCtaFlags | null;
}): boolean {
  const cta = resolveCardCta(barber);
  return cta.showBooking && !cta.showPhone && !cta.showWhatsApp;
}

export function bookBarberPath(barberId: string): string {
  return `/book/${encodeURIComponent(barberId.trim())}`;
}

export function staffBookingsPath(token: string): string {
  return `/staff-bookings/${encodeURIComponent(token.trim())}`;
}

export function staffBookingsAbsoluteUrl(token: string): string {
  const path = staffBookingsPath(token);
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}/#${path}`;
}

export async function fetchPublicBookingContextRemote(
  barberId: string,
): Promise<{ ok: true; context: PublicBookingContext } | { ok: false; error: string }> {
  const ep = `${PUBLIC_ENDPOINT}?action=context&barberId=${encodeURIComponent(barberId.trim())}`;
  try {
    const res = await fetch(ep, { headers: publicHeaders() });
    const json = (await res.json().catch(() => ({}))) as {
      error?: string;
      salon?: PublicBookingContext['salon'];
      team?: PublicBookingContext['team'];
    };
    if (!res.ok || !json.salon) {
      return { ok: false, error: normalizeError(json.error || `HTTP ${res.status}`) };
    }
    return {
      ok: true,
      context: {
        salon: json.salon,
        team: Array.isArray(json.team) ? json.team : [],
      },
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function fetchAvailableSlotsRemote(input: {
  barberId: string;
  bookingDate: string;
  teamMemberId?: string | null;
  durationMinutes?: number;
}): Promise<{ ok: true; slots: string[] } | { ok: false; error: string }> {
  const res = await postJson<{ slots?: string[] }>(
    PUBLIC_ENDPOINT,
    {
      action: 'slots',
      barberId: input.barberId.trim(),
      bookingDate: input.bookingDate.trim(),
      teamMemberId: input.teamMemberId || null,
      durationMinutes: input.durationMinutes,
    },
    'public',
  );
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, slots: Array.isArray(res.json.slots) ? res.json.slots : [] };
}

export async function createNamedBookingRemote(input: {
  barberId: string;
  bookingDate: string;
  bookingTime: string;
  customerPhone: string;
  teamMemberId?: string | null;
  durationMinutes?: number;
}): Promise<{ ok: true; bookingId: string } | { ok: false; error: string }> {
  const res = await postJson<{ bookingId?: string }>(
    BOOKING_ENDPOINT,
    {
      action: 'create',
      barberId: input.barberId.trim(),
      bookingDate: input.bookingDate.trim(),
      bookingTime: input.bookingTime.trim(),
      customerPhone: input.customerPhone.trim(),
      teamMemberId: input.teamMemberId || null,
      durationMinutes: input.durationMinutes,
    },
    'public',
  );
  if (!res.ok) return { ok: false, error: res.error };
  const bookingId = String(res.json.bookingId ?? '').trim();
  if (!bookingId) return { ok: false, error: 'تعذّر إنشاء طلب الحجز.' };
  return { ok: true, bookingId };
}

export async function listTeamMembersRemote(): Promise<
  | {
      ok: true;
      members: TeamMemberRemote[];
      cardCta: CardCtaFlags;
      contactMode: ContactMode;
      photoCount: number;
      maxPhotos: number;
    }
  | { ok: false; error: string }
> {
  const creds = portalCreds();
  if (!creds) return { ok: false, error: 'انتهت جلسة لوحة التحكم. أعد تسجيل الدخول.' };
  const res = await postJson<{
    members?: TeamMemberRemote[];
    cardCta?: CardCtaFlags;
    contactMode?: ContactMode;
    photoCount?: number;
    maxPhotos?: number;
  }>(TEAM_ENDPOINT, { action: 'list', barberId: creds.barberId, email: creds.email }, 'barber');
  if (!res.ok) return { ok: false, error: res.error };
  const cardCta = res.json.cardCta ?? DEFAULT_CARD_CTA;
  return {
    ok: true,
    members: Array.isArray(res.json.members) ? res.json.members : [],
    cardCta,
    contactMode: res.json.contactMode === 'booking_only' ? 'booking_only' : 'classic',
    photoCount: Number(res.json.photoCount) || 0,
    maxPhotos: Number(res.json.maxPhotos) || 10,
  };
}

export async function upsertTeamMemberRemote(input: {
  memberId?: string;
  displayName: string;
  photoUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  defaultDurationMinutes?: number;
  internalNotes?: string | null;
  returnToWorkDate?: string | null;
  notifyPhone?: string | null;
}): Promise<{ ok: true; member: TeamMemberRemote } | { ok: false; error: string }> {
  const creds = portalCreds();
  if (!creds) return { ok: false, error: 'انتهت جلسة لوحة التحكم. أعد تسجيل الدخول.' };
  const res = await postJson<{ member?: TeamMemberRemote }>(
    TEAM_ENDPOINT,
    {
      action: 'upsert',
      barberId: creds.barberId,
      email: creds.email,
      ...input,
    },
    'barber',
  );
  if (!res.ok) return { ok: false, error: res.error };
  if (!res.json.member) return { ok: false, error: 'تعذّر حفظ الحلاق.' };
  return { ok: true, member: res.json.member };
}

export async function rotateStaffAccessTokenRemote(
  memberId: string,
): Promise<{ ok: true; member: TeamMemberRemote } | { ok: false; error: string }> {
  const creds = portalCreds();
  if (!creds) return { ok: false, error: 'انتهت جلسة لوحة التحكم. أعد تسجيل الدخول.' };
  const res = await postJson<{ member?: TeamMemberRemote }>(
    TEAM_ENDPOINT,
    {
      action: 'rotate_staff_token',
      barberId: creds.barberId,
      email: creds.email,
      memberId: memberId.trim(),
    },
    'barber',
  );
  if (!res.ok) return { ok: false, error: res.error };
  if (!res.json.member) return { ok: false, error: 'تعذّر إعادة إصدار الرابط.' };
  return { ok: true, member: res.json.member };
}

export type StaffSessionExchangeResult = {
  session: StaffPortalStoredSession;
  member: StaffTeamBookingsPayload['member'];
  salon: StaffTeamBookingsPayload['salon'];
};

/** استبدال رابط الطاقم السري بجلسة staff قصيرة العمر في sessionStorage. */
export async function exchangeStaffPortalSessionRemote(
  token: string,
): Promise<{ ok: true; data: StaffSessionExchangeResult } | { ok: false; error: string }> {
  const accessToken = token.trim();
  if (!accessToken) return { ok: false, error: 'رابط المتابعة غير صالح.' };

  const existing = readStaffPortalSession(accessToken);
  if (existing) {
    return {
      ok: true,
      data: {
        session: existing,
        member: {
          id: existing.memberId,
          displayName: existing.memberDisplayName,
          photoUrl: existing.photoUrl,
          isActive: true,
        },
        salon: { id: existing.salonId, name: existing.salonName },
      },
    };
  }

  const res = await postJson<{
    staffSessionToken?: string;
    expiresAt?: number;
    member?: StaffTeamBookingsPayload['member'];
    salon?: StaffTeamBookingsPayload['salon'];
    error?: string;
  }>(STAFF_BOOKINGS_ENDPOINT, { action: 'exchange', token: accessToken }, 'public');
  if (!res.ok) return { ok: false, error: res.error };
  const staffSessionToken = String(res.json.staffSessionToken ?? '').trim();
  if (!staffSessionToken || !res.json.member || !res.json.salon) {
    return { ok: false, error: normalizeError(res.json.error || 'تعذّر فتح جلسة الطاقم.') };
  }
  const session: StaffPortalStoredSession = {
    accessToken,
    staffSessionToken,
    expiresAt: Number(res.json.expiresAt) || Date.now() + 12 * 60 * 60 * 1000,
    memberId: res.json.member.id,
    memberDisplayName: res.json.member.displayName,
    salonId: res.json.salon.id,
    salonName: res.json.salon.name,
    photoUrl: res.json.member.photoUrl,
  };
  writeStaffPortalSession(session);
  return {
    ok: true,
    data: {
      session,
      member: res.json.member,
      salon: res.json.salon,
    },
  };
}

export async function fetchStaffTeamBookingsRemote(
  token: string,
): Promise<{ ok: true; data: StaffTeamBookingsPayload } | { ok: false; error: string }> {
  const accessToken = token.trim();
  if (!accessToken) return { ok: false, error: 'رابط المتابعة غير صالح.' };

  const exchange = await exchangeStaffPortalSessionRemote(accessToken);
  if (!exchange.ok) {
    clearStaffPortalSession();
    return { ok: false, error: exchange.error };
  }

  const res = await postJson<{
    member?: StaffTeamBookingsPayload['member'];
    salon?: StaffTeamBookingsPayload['salon'];
    bookings?: StaffTeamBookingRemote[];
    pendingCount?: number;
    error?: string;
  }>(STAFF_BOOKINGS_ENDPOINT, { action: 'list' }, 'staff', accessToken);

  if (!res.ok) {
    // جلسة منتهية أو رابط أُعيد إصداره — امسح وأعد المحاولة بتبادل جديد مرة واحدة
    clearStaffPortalSession();
    const retryExchange = await exchangeStaffPortalSessionRemote(accessToken);
    if (!retryExchange.ok) return { ok: false, error: retryExchange.error };
    const retry = await postJson<{
      member?: StaffTeamBookingsPayload['member'];
      salon?: StaffTeamBookingsPayload['salon'];
      bookings?: StaffTeamBookingRemote[];
      pendingCount?: number;
      error?: string;
    }>(STAFF_BOOKINGS_ENDPOINT, { action: 'list' }, 'staff', accessToken);
    if (!retry.ok) return { ok: false, error: retry.error };
    if (!retry.json.member || !retry.json.salon) {
      return { ok: false, error: normalizeError(retry.json.error || 'تعذّر تحميل الحجوزات.') };
    }
    return {
      ok: true,
      data: {
        member: retry.json.member,
        salon: retry.json.salon,
        bookings: Array.isArray(retry.json.bookings) ? retry.json.bookings : [],
        pendingCount: Number(retry.json.pendingCount) || 0,
      },
    };
  }

  if (!res.json.member || !res.json.salon) {
    return { ok: false, error: normalizeError(res.json.error || 'تعذّر تحميل الحجوزات.') };
  }
  return {
    ok: true,
    data: {
      member: res.json.member,
      salon: res.json.salon,
      bookings: Array.isArray(res.json.bookings) ? res.json.bookings : [],
      pendingCount: Number(res.json.pendingCount) || 0,
    },
  };
}

export async function confirmStaffTeamBookingRemote(
  token: string,
  bookingId: string,
): Promise<{ ok: true; booking: StaffTeamBookingRemote } | { ok: false; error: string }> {
  const accessToken = token.trim();
  const id = bookingId.trim();
  if (!accessToken) return { ok: false, error: 'رابط المتابعة غير صالح.' };
  if (!id) return { ok: false, error: 'معرّف الموعد مطلوب.' };

  const exchange = await exchangeStaffPortalSessionRemote(accessToken);
  if (!exchange.ok) return { ok: false, error: exchange.error };

  const res = await postJson<{
    booking?: StaffTeamBookingRemote;
    error?: string;
  }>(STAFF_BOOKINGS_ENDPOINT, { action: 'confirm', bookingId: id }, 'staff', accessToken);

  if (!res.ok) return { ok: false, error: res.error };
  if (!res.json.booking) {
    return { ok: false, error: normalizeError(res.json.error || 'تعذّر تأكيد الموعد.') };
  }
  return { ok: true, booking: res.json.booking };
}

export async function deleteTeamMemberRemote(
  memberId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const creds = portalCreds();
  if (!creds) return { ok: false, error: 'انتهت جلسة لوحة التحكم. أعد تسجيل الدخول.' };
  const res = await postJson<{ ok?: boolean }>(
    TEAM_ENDPOINT,
    {
      action: 'delete',
      barberId: creds.barberId,
      email: creds.email,
      memberId: memberId.trim(),
    },
    'barber',
  );
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true };
}

export async function updateCardCtaRemote(
  patch: Partial<CardCtaFlags>,
): Promise<{ ok: true; cardCta: CardCtaFlags } | { ok: false; error: string }> {
  const creds = portalCreds();
  if (!creds) return { ok: false, error: 'انتهت جلسة لوحة التحكم. أعد تسجيل الدخول.' };
  const res = await postJson<{ cardCta?: CardCtaFlags }>(
    TEAM_ENDPOINT,
    {
      action: 'update_card_cta',
      barberId: creds.barberId,
      email: creds.email,
      ...patch,
    },
    'barber',
  );
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, cardCta: res.json.cardCta ?? DEFAULT_CARD_CTA };
}

/** @deprecated */
export async function updateContactModeRemote(
  contactMode: ContactMode,
): Promise<{ ok: true; contactMode: ContactMode } | { ok: false; error: string }> {
  const creds = portalCreds();
  if (!creds) return { ok: false, error: 'انتهت جلسة لوحة التحكم. أعد تسجيل الدخول.' };
  const res = await postJson<{ contactMode?: ContactMode }>(
    TEAM_ENDPOINT,
    {
      action: 'update_contact_mode',
      barberId: creds.barberId,
      email: creds.email,
      contactMode,
    },
    'barber',
  );
  if (!res.ok) return { ok: false, error: res.error };
  return {
    ok: true,
    contactMode: res.json.contactMode === 'booking_only' ? 'booking_only' : 'classic',
  };
}

export async function uploadTeamMemberPhotoRemote(input: {
  memberId: string;
  imageBase64: string;
}): Promise<{ ok: true; publicUrl: string; member: TeamMemberRemote } | { ok: false; error: string }> {
  const creds = portalCreds();
  if (!creds) return { ok: false, error: 'انتهت جلسة لوحة التحكم. أعد تسجيل الدخول.' };
  const res = await postJson<{ publicUrl?: string; member?: TeamMemberRemote }>(
    TEAM_ENDPOINT,
    {
      action: 'upload_photo',
      barberId: creds.barberId,
      email: creds.email,
      memberId: input.memberId.trim(),
      imageBase64: input.imageBase64,
    },
    'barber',
  );
  if (!res.ok) return { ok: false, error: res.error };
  const publicUrl = String(res.json.publicUrl ?? '').trim();
  if (!publicUrl || !res.json.member) return { ok: false, error: 'تعذّر رفع الصورة.' };
  return { ok: true, publicUrl, member: res.json.member };
}

export async function listDayScheduleRemote(input: {
  teamMemberId: string;
  bookingDate: string;
}): Promise<
  | {
      ok: true;
      slots: string[];
      availableSlots: string[];
      blocks: Array<{ id: string; start_time: string; end_time: string }>;
    }
  | { ok: false; error: string }
> {
  const creds = portalCreds();
  if (!creds) return { ok: false, error: 'انتهت جلسة لوحة التحكم. أعد تسجيل الدخول.' };
  const res = await postJson<{
    slots?: string[];
    availableSlots?: string[];
    blocks?: Array<{ id: string; start_time: string; end_time: string }>;
  }>(
    TEAM_ENDPOINT,
    {
      action: 'list_day_schedule',
      barberId: creds.barberId,
      email: creds.email,
      teamMemberId: input.teamMemberId,
      bookingDate: input.bookingDate,
    },
    'barber',
  );
  if (!res.ok) return { ok: false, error: res.error };
  return {
    ok: true,
    slots: Array.isArray(res.json.slots) ? res.json.slots : [],
    availableSlots: Array.isArray(res.json.availableSlots) ? res.json.availableSlots : [],
    blocks: Array.isArray(res.json.blocks) ? res.json.blocks : [],
  };
}

export async function setTeamSlotBlockRemote(input: {
  teamMemberId: string;
  bookingDate: string;
  startTime: string;
  blocked: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const creds = portalCreds();
  if (!creds) return { ok: false, error: 'انتهت جلسة لوحة التحكم. أعد تسجيل الدخول.' };
  const res = await postJson<{ ok?: boolean }>(
    TEAM_ENDPOINT,
    {
      action: 'set_slot_block',
      barberId: creds.barberId,
      email: creds.email,
      ...input,
    },
    'barber',
  );
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true };
}
