/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * طاقم الحلاقين + وضع الاتصال + فترات الحظر + فتحات الإتاحة للحجز بالاسم.
 */
import { randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { normalizeSaudiMobileForWa } from './saudiWhatsAppPhone.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/;
const STAFF_TOKEN_RE = /^[a-f0-9]{64}$/i;

export const MAX_TEAM_MEMBERS = 25;
export const MAX_TEAM_PHOTOS = 10;
export const MAX_DISPLAY_NAME_LEN = 60;
export const SLOT_STEP_MIN = 30;
export const DAY_START_MIN = 10 * 60;
export const DAY_END_MIN = 23 * 60;
export const TEAM_PHOTOS_BUCKET = 'barber-team';

export type ContactMode = 'classic' | 'booking_only';

/** ظواهر أيقونات بطاقة الماسي — مستقلة لكل أيقونة */
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

export type BarberTeamMemberRow = {
  id: string;
  barber_id: string;
  display_name: string;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
  default_duration_minutes: number;
  internal_notes: string | null;
  return_to_work_date: string | null;
  /** رمز صفحة الطاقم — يظهر لمالك الصالون فقط عبر API البوابة */
  staff_access_token: string | null;
  /** جوال واتساب اختياري للتنبيه اليدوي من المالك */
  notify_phone: string | null;
  created_at?: string;
  updated_at?: string;
};

export type StaffTeamBookingRow = {
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

export type TeamMemberBlockRow = {
  id: string;
  barber_id: string;
  team_member_id: string;
  block_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
};

export function normalizeContactMode(raw: unknown): ContactMode {
  return String(raw ?? '').trim() === 'booking_only' ? 'booking_only' : 'classic';
}

export function normalizeCardCtaFlags(raw: {
  card_show_phone?: unknown;
  card_show_whatsapp?: unknown;
  card_show_chat?: unknown;
  card_show_booking?: unknown;
  contact_mode?: unknown;
}): CardCtaFlags {
  const hasExplicit =
    raw.card_show_phone != null ||
    raw.card_show_whatsapp != null ||
    raw.card_show_chat != null ||
    raw.card_show_booking != null;
  if (!hasExplicit && normalizeContactMode(raw.contact_mode) === 'booking_only') {
    return {
      showPhone: false,
      showWhatsApp: false,
      showChat: true,
      showBooking: true,
    };
  }
  return {
    showPhone: raw.card_show_phone !== false,
    showWhatsApp: raw.card_show_whatsapp !== false,
    showChat: raw.card_show_chat !== false,
    showBooking: raw.card_show_booking === true,
  };
}

export function contactModeFromCardCta(flags: CardCtaFlags): ContactMode {
  if (!flags.showPhone && !flags.showWhatsApp && flags.showBooking) return 'booking_only';
  return 'classic';
}

function normalizeReturnDate(raw: unknown): string | null {
  const s = String(raw ?? '').trim().slice(0, 10);
  if (!s) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
}

export function normalizeDisplayName(raw: unknown): string {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_DISPLAY_NAME_LEN);
}

export function normalizePhotoUrl(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  if (s.length > 2000) return null;
  if (!/^https?:\/\//i.test(s) && !s.startsWith('/')) return null;
  return s;
}

export function parseDurationMinutes(raw: unknown, fallback = 30): number {
  const n = typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? ''), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(480, Math.max(5, Math.floor(n)));
}

export function generateStaffAccessToken(): string {
  return randomBytes(32).toString('hex');
}

export function normalizeNotifyPhone(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const wa = normalizeSaudiMobileForWa(s);
  if (!wa) return null;
  // خزّن بصيغة محلية 05xxxxxxxx لسهولة العرض في لوحة المالك
  return `0${wa.slice(3)}`;
}

function mapMember(row: Record<string, unknown>): BarberTeamMemberRow {
  const tokenRaw = row.staff_access_token == null ? '' : String(row.staff_access_token).trim();
  return {
    id: String(row.id ?? ''),
    barber_id: String(row.barber_id ?? ''),
    display_name: String(row.display_name ?? ''),
    photo_url: row.photo_url == null ? null : String(row.photo_url),
    sort_order: Number(row.sort_order) || 0,
    is_active: row.is_active !== false,
    default_duration_minutes: Number(row.default_duration_minutes) || 30,
    internal_notes: row.internal_notes == null ? null : String(row.internal_notes),
    return_to_work_date:
      row.return_to_work_date == null ? null : String(row.return_to_work_date).slice(0, 10),
    staff_access_token: tokenRaw && STAFF_TOKEN_RE.test(tokenRaw) ? tokenRaw : null,
    notify_phone: row.notify_phone == null ? null : String(row.notify_phone).trim() || null,
    ...(row.created_at ? { created_at: String(row.created_at) } : {}),
    ...(row.updated_at ? { updated_at: String(row.updated_at) } : {}),
  };
}

function mapBlock(row: Record<string, unknown>): TeamMemberBlockRow {
  return {
    id: String(row.id ?? ''),
    barber_id: String(row.barber_id ?? ''),
    team_member_id: String(row.team_member_id ?? ''),
    block_date: String(row.block_date ?? '').slice(0, 10),
    start_time: formatTimeHm(String(row.start_time ?? '')),
    end_time: formatTimeHm(String(row.end_time ?? '')),
    reason: row.reason == null ? null : String(row.reason),
  };
}

export function formatTimeHm(raw: string): string {
  const m = TIME_RE.exec(raw.trim());
  if (!m) return raw.trim().slice(0, 5);
  return `${m[1]}:${m[2]}`;
}

export function normalizeTimeHm(raw: string): string | null {
  const m = TIME_RE.exec(String(raw ?? '').trim());
  if (!m) return null;
  return `${m[1]}:${m[2]}`;
}

function parseTs(dateIso: string, timeRaw: string): number | null {
  const hm = formatTimeHm(timeRaw);
  const m = /^(\d{2}):(\d{2})/.exec(hm);
  if (!m) return null;
  const t = new Date(`${dateIso}T${m[1]}:${m[2]}:00`);
  return Number.isFinite(t.getTime()) ? t.getTime() : null;
}

function timeToMinutes(hm: string): number | null {
  const m = /^(\d{2}):(\d{2})/.exec(formatTimeHm(hm));
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function buildDaySlots(stepMin = SLOT_STEP_MIN): string[] {
  const slots: string[] = [];
  for (let mins = DAY_START_MIN; mins <= DAY_END_MIN; mins += stepMin) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return slots;
}

export async function getBarberContactMode(
  supabase: SupabaseClient,
  barberId: string,
): Promise<ContactMode> {
  const flags = await getBarberCardCta(supabase, barberId);
  return contactModeFromCardCta(flags);
}

export async function getBarberCardCta(
  supabase: SupabaseClient,
  barberId: string,
): Promise<CardCtaFlags> {
  const { data } = await supabase
    .from('barbers')
    .select(
      'contact_mode, card_show_phone, card_show_whatsapp, card_show_chat, card_show_booking',
    )
    .eq('id', barberId)
    .maybeSingle();
  if (!data) return { ...DEFAULT_CARD_CTA };
  return normalizeCardCtaFlags(data as Record<string, unknown>);
}

export async function loadCardCtaForBarbers(
  supabase: SupabaseClient,
  barberIds: string[],
): Promise<Map<string, CardCtaFlags>> {
  const map = new Map<string, CardCtaFlags>();
  const ids = [...new Set(barberIds.map((id) => id.trim()).filter((id) => UUID_RE.test(id)))];
  if (!ids.length) return map;
  const { data, error } = await supabase
    .from('barbers')
    .select(
      'id, contact_mode, card_show_phone, card_show_whatsapp, card_show_chat, card_show_booking',
    )
    .in('id', ids);
  if (error || !data) return map;
  for (const row of data) {
    map.set(String(row.id), normalizeCardCtaFlags(row as Record<string, unknown>));
  }
  return map;
}

/** @deprecated استخدم loadCardCtaForBarbers */
export async function loadContactModesForBarbers(
  supabase: SupabaseClient,
  barberIds: string[],
): Promise<Map<string, ContactMode>> {
  const cta = await loadCardCtaForBarbers(supabase, barberIds);
  const map = new Map<string, ContactMode>();
  for (const [id, flags] of cta) {
    map.set(id, contactModeFromCardCta(flags));
  }
  return map;
}

export async function updateBarberCardCta(
  supabase: SupabaseClient,
  barberId: string,
  patch: Partial<CardCtaFlags>,
): Promise<{ ok: true; cardCta: CardCtaFlags } | { ok: false; error: string }> {
  const current = await getBarberCardCta(supabase, barberId);
  const next: CardCtaFlags = {
    showPhone: patch.showPhone ?? current.showPhone,
    showWhatsApp: patch.showWhatsApp ?? current.showWhatsApp,
    showChat: patch.showChat ?? current.showChat,
    showBooking: patch.showBooking ?? current.showBooking,
  };
  const contactMode = contactModeFromCardCta(next);
  const { error } = await supabase
    .from('barbers')
    .update({
      card_show_phone: next.showPhone,
      card_show_whatsapp: next.showWhatsApp,
      card_show_chat: next.showChat,
      card_show_booking: next.showBooking,
      contact_mode: contactMode,
    })
    .eq('id', barberId);
  if (error) return { ok: false, error: error.message || 'update_failed' };
  return { ok: true, cardCta: next };
}

export async function updateBarberContactMode(
  supabase: SupabaseClient,
  barberId: string,
  mode: ContactMode,
): Promise<{ ok: true; contactMode: ContactMode } | { ok: false; error: string }> {
  const contactMode = normalizeContactMode(mode);
  const flags: CardCtaFlags =
    contactMode === 'booking_only'
      ? { showPhone: false, showWhatsApp: false, showChat: true, showBooking: true }
      : { ...DEFAULT_CARD_CTA };
  const result = await updateBarberCardCta(supabase, barberId, flags);
  if (!result.ok) return result;
  return { ok: true, contactMode };
}

export async function listTeamMembers(
  supabase: SupabaseClient,
  barberId: string,
  opts?: { activeOnly?: boolean; includeStaffSecrets?: boolean },
): Promise<BarberTeamMemberRow[]> {
  const includeSecrets = opts?.includeStaffSecrets === true;
  // select('*') — تجنّب ParserError من supabase-js عند تمرير سلسلة select ديناميكية
  let q = supabase
    .from('barber_team_members')
    .select('*')
    .eq('barber_id', barberId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (opts?.activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error || !data) return [];
  const members = data.map((r) => mapMember(r as Record<string, unknown>));
  if (!includeSecrets) {
    return members.map((m) => ({ ...m, staff_access_token: null, notify_phone: null }));
  }
  // أكمل التوكنات الناقصة عند أول قراءة من لوحة المالك
  const missing = members.filter((m) => !m.staff_access_token);
  if (missing.length) {
    await Promise.all(
      missing.map(async (m) => {
        const token = generateStaffAccessToken();
        const { data: updated } = await supabase
          .from('barber_team_members')
          .update({ staff_access_token: token, updated_at: new Date().toISOString() })
          .eq('id', m.id)
          .eq('barber_id', barberId)
          .select('staff_access_token')
          .maybeSingle();
        m.staff_access_token = updated?.staff_access_token
          ? String(updated.staff_access_token)
          : token;
      }),
    );
  }
  return members;
}

export async function upsertTeamMember(
  supabase: SupabaseClient,
  input: {
    barberId: string;
    memberId?: string;
    displayName: string;
    photoUrl?: string | null;
    sortOrder?: number;
    isActive?: boolean;
    defaultDurationMinutes?: number;
    internalNotes?: string | null;
    returnToWorkDate?: string | null;
    notifyPhone?: string | null;
    clearPhoto?: boolean;
  },
): Promise<{ ok: true; member: BarberTeamMemberRow } | { ok: false; error: string }> {
  const displayName = normalizeDisplayName(input.displayName);
  if (!displayName) return { ok: false, error: 'display_name_required' };

  const photoUrl =
    input.clearPhoto === true
      ? null
      : input.photoUrl === undefined
        ? undefined
        : normalizePhotoUrl(input.photoUrl);
  const duration = parseDurationMinutes(input.defaultDurationMinutes, 30);
  const sortOrder =
    typeof input.sortOrder === 'number' && Number.isFinite(input.sortOrder)
      ? Math.max(0, Math.floor(input.sortOrder))
      : 0;
  const isActive = input.isActive !== false;
  const notes = String(input.internalNotes ?? '')
    .trim()
    .slice(0, 500);
  const returnDate = isActive ? null : normalizeReturnDate(input.returnToWorkDate);
  const notifyPhoneProvided = Object.prototype.hasOwnProperty.call(input, 'notifyPhone');
  let notifyPhone: string | null | undefined;
  if (notifyPhoneProvided) {
    const raw = String(input.notifyPhone ?? '').trim();
    if (!raw) {
      notifyPhone = null;
    } else {
      notifyPhone = normalizeNotifyPhone(raw);
      if (!notifyPhone) return { ok: false, error: 'invalid_notify_phone' };
    }
  }

  const memberId = String(input.memberId ?? '').trim();
  if (memberId) {
    if (!UUID_RE.test(memberId)) return { ok: false, error: 'invalid_member_id' };
    const patch: Record<string, unknown> = {
      display_name: displayName,
      sort_order: sortOrder,
      is_active: isActive,
      default_duration_minutes: duration,
      internal_notes: notes || null,
      return_to_work_date: returnDate,
      updated_at: new Date().toISOString(),
    };
    if (photoUrl !== undefined) patch.photo_url = photoUrl;
    if (notifyPhone !== undefined) patch.notify_phone = notifyPhone;
    const { data, error } = await supabase
      .from('barber_team_members')
      .update(patch)
      .eq('id', memberId)
      .eq('barber_id', input.barberId)
      .select('*')
      .maybeSingle();
    if (error || !data) return { ok: false, error: error?.message || 'member_not_found' };
    return { ok: true, member: mapMember(data as Record<string, unknown>) };
  }

  const existing = await listTeamMembers(supabase, input.barberId, { includeStaffSecrets: true });
  if (existing.length >= MAX_TEAM_MEMBERS) return { ok: false, error: 'team_limit_reached' };

  const { data, error } = await supabase
    .from('barber_team_members')
    .insert({
      barber_id: input.barberId,
      display_name: displayName,
      photo_url: photoUrl ?? null,
      sort_order: sortOrder,
      is_active: isActive,
      default_duration_minutes: duration,
      internal_notes: notes || null,
      return_to_work_date: returnDate,
      notify_phone: notifyPhone ?? null,
      staff_access_token: generateStaffAccessToken(),
    })
    .select('*')
    .maybeSingle();
  if (error || !data) return { ok: false, error: error?.message || 'insert_failed' };
  return { ok: true, member: mapMember(data as Record<string, unknown>) };
}

export async function rotateStaffAccessToken(
  supabase: SupabaseClient,
  barberId: string,
  memberId: string,
): Promise<{ ok: true; member: BarberTeamMemberRow } | { ok: false; error: string }> {
  if (!UUID_RE.test(memberId)) return { ok: false, error: 'invalid_member_id' };
  const token = generateStaffAccessToken();
  const { data, error } = await supabase
    .from('barber_team_members')
    .update({ staff_access_token: token, updated_at: new Date().toISOString() })
    .eq('id', memberId)
    .eq('barber_id', barberId)
    .select('*')
    .maybeSingle();
  if (error || !data) return { ok: false, error: error?.message || 'member_not_found' };
  return { ok: true, member: mapMember(data as Record<string, unknown>) };
}

export async function resolveTeamMemberByStaffToken(
  supabase: SupabaseClient,
  token: string,
): Promise<
  | {
      ok: true;
      member: BarberTeamMemberRow;
      salonName: string;
    }
  | { ok: false; error: string; status: number }
> {
  const accessToken = String(token ?? '').trim();
  if (!STAFF_TOKEN_RE.test(accessToken)) {
    return { ok: false, error: 'invalid_token', status: 400 };
  }
  const { data, error } = await supabase
    .from('barber_team_members')
    .select(
      'id, barber_id, display_name, photo_url, sort_order, is_active, default_duration_minutes, internal_notes, return_to_work_date, staff_access_token, notify_phone, created_at, updated_at',
    )
    .eq('staff_access_token', accessToken)
    .maybeSingle();
  if (error) return { ok: false, error: error.message || 'lookup_failed', status: 500 };
  if (!data) return { ok: false, error: 'token_not_found', status: 404 };

  const member = mapMember(data as Record<string, unknown>);
  const { data: barber } = await supabase
    .from('barbers')
    .select('id, name, is_active')
    .eq('id', member.barber_id)
    .maybeSingle();
  if (!barber || barber.is_active === false) {
    return { ok: false, error: 'salon_inactive', status: 409 };
  }
  return {
    ok: true,
    member,
    salonName: String(barber.name ?? ''),
  };
}

export async function listStaffTeamBookings(
  supabase: SupabaseClient,
  teamMemberId: string,
): Promise<{ ok: true; bookings: StaffTeamBookingRow[] } | { ok: false; error: string; status: number }> {
  if (!UUID_RE.test(teamMemberId)) {
    return { ok: false, error: 'invalid_member_id', status: 400 };
  }
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, customer_name, customer_phone, service_name, booking_date, booking_time, duration_minutes, status, created_at',
    )
    .eq('team_member_id', teamMemberId)
    .in('status', ['pending', 'confirmed'])
    .gte('booking_date', today)
    .order('booking_date', { ascending: true })
    .order('booking_time', { ascending: true })
    .limit(100);
  if (error) return { ok: false, error: error.message || 'list_failed', status: 500 };
  const bookings: StaffTeamBookingRow[] = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const status = String(r.status ?? 'pending');
    return {
      id: String(r.id ?? ''),
      customer_name: String(r.customer_name ?? ''),
      customer_phone: String(r.customer_phone ?? ''),
      service_name: String(r.service_name ?? ''),
      booking_date: String(r.booking_date ?? '').slice(0, 10),
      booking_time: formatTimeHm(String(r.booking_time ?? '')),
      duration_minutes: Number(r.duration_minutes) || 30,
      status:
        status === 'confirmed' ||
        status === 'completed' ||
        status === 'cancelled' ||
        status === 'no_show'
          ? status
          : 'pending',
      created_at: String(r.created_at ?? ''),
    };
  });
  return { ok: true, bookings };
}

/** تحميل عضو الطاقم عبر معرف الجلسة مع التحقق من salون نشط ومطابقة barberId. */
export async function resolveTeamMemberForStaffSession(
  supabase: SupabaseClient,
  input: { teamMemberId: string; barberId: string },
): Promise<
  | { ok: true; member: BarberTeamMemberRow; salonName: string }
  | { ok: false; error: string; status: number }
> {
  const teamMemberId = String(input.teamMemberId ?? '').trim();
  const barberId = String(input.barberId ?? '').trim();
  if (!UUID_RE.test(teamMemberId) || !UUID_RE.test(barberId)) {
    return { ok: false, error: 'invalid_session_ids', status: 400 };
  }
  const { data, error } = await supabase
    .from('barber_team_members')
    .select(
      'id, barber_id, display_name, photo_url, sort_order, is_active, default_duration_minutes, internal_notes, return_to_work_date, staff_access_token, notify_phone, created_at, updated_at',
    )
    .eq('id', teamMemberId)
    .eq('barber_id', barberId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message || 'lookup_failed', status: 500 };
  if (!data) return { ok: false, error: 'session_member_not_found', status: 401 };

  const member = mapMember(data as Record<string, unknown>);
  const { data: barber } = await supabase
    .from('barbers')
    .select('id, name, is_active')
    .eq('id', member.barber_id)
    .maybeSingle();
  if (!barber || barber.is_active === false) {
    return { ok: false, error: 'salon_inactive', status: 409 };
  }
  return {
    ok: true,
    member,
    salonName: String(barber.name ?? ''),
  };
}

/**
 * تأكيد موعد يخص عضو الطاقم فقط: pending → confirmed.
 * الإلغاء ممنوع من هذا المسار (يبقى لمالك الصالون).
 */
export async function confirmStaffTeamBooking(
  supabase: SupabaseClient,
  input: { teamMemberId: string; barberId: string; bookingId: string },
): Promise<
  | { ok: true; booking: StaffTeamBookingRow }
  | { ok: false; error: string; status: number }
> {
  const teamMemberId = String(input.teamMemberId ?? '').trim();
  const barberId = String(input.barberId ?? '').trim();
  const bookingId = String(input.bookingId ?? '').trim();
  if (!UUID_RE.test(teamMemberId) || !UUID_RE.test(barberId) || !UUID_RE.test(bookingId)) {
    return { ok: false, error: 'invalid_id', status: 400 };
  }

  const { data: existing, error: readErr } = await supabase
    .from('bookings')
    .select(
      'id, barber_id, team_member_id, customer_name, customer_phone, service_name, booking_date, booking_time, duration_minutes, status, created_at',
    )
    .eq('id', bookingId)
    .eq('barber_id', barberId)
    .eq('team_member_id', teamMemberId)
    .maybeSingle();

  if (readErr) return { ok: false, error: readErr.message || 'lookup_failed', status: 500 };
  if (!existing) return { ok: false, error: 'booking_not_found', status: 404 };

  const currentStatus = String((existing as { status?: unknown }).status ?? '');
  if (currentStatus === 'confirmed') {
    const r = existing as Record<string, unknown>;
    return {
      ok: true,
      booking: {
        id: String(r.id ?? ''),
        customer_name: String(r.customer_name ?? ''),
        customer_phone: String(r.customer_phone ?? ''),
        service_name: String(r.service_name ?? ''),
        booking_date: String(r.booking_date ?? '').slice(0, 10),
        booking_time: formatTimeHm(String(r.booking_time ?? '')),
        duration_minutes: Number(r.duration_minutes) || 30,
        status: 'confirmed',
        created_at: String(r.created_at ?? ''),
      },
    };
  }
  if (currentStatus !== 'pending') {
    return { ok: false, error: 'booking_not_confirmable', status: 409 };
  }

  const { data: updated, error: updateErr } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      cancellation_reason: null,
    })
    .eq('id', bookingId)
    .eq('barber_id', barberId)
    .eq('team_member_id', teamMemberId)
    .eq('status', 'pending')
    .select(
      'id, customer_name, customer_phone, service_name, booking_date, booking_time, duration_minutes, status, created_at',
    )
    .maybeSingle();

  if (updateErr) return { ok: false, error: updateErr.message || 'update_failed', status: 500 };
  if (!updated) return { ok: false, error: 'booking_not_confirmable', status: 409 };

  const r = updated as Record<string, unknown>;
  return {
    ok: true,
    booking: {
      id: String(r.id ?? ''),
      customer_name: String(r.customer_name ?? ''),
      customer_phone: String(r.customer_phone ?? ''),
      service_name: String(r.service_name ?? ''),
      booking_date: String(r.booking_date ?? '').slice(0, 10),
      booking_time: formatTimeHm(String(r.booking_time ?? '')),
      duration_minutes: Number(r.duration_minutes) || 30,
      status: 'confirmed',
      created_at: String(r.created_at ?? ''),
    },
  };
}

export async function loadTeamMemberDisplayMap(
  supabase: SupabaseClient,
  memberIds: string[],
): Promise<Map<string, { displayName: string; photoUrl: string | null }>> {
  const map = new Map<string, { displayName: string; photoUrl: string | null }>();
  const ids = [...new Set(memberIds.map((id) => id.trim()).filter((id) => UUID_RE.test(id)))];
  if (!ids.length) return map;
  const { data, error } = await supabase
    .from('barber_team_members')
    .select('id, display_name, photo_url')
    .in('id', ids);
  if (error || !data) return map;
  for (const row of data) {
    map.set(String(row.id), {
      displayName: String(row.display_name ?? ''),
      photoUrl: row.photo_url == null ? null : String(row.photo_url),
    });
  }
  return map;
}

export async function countTeamPhotos(
  supabase: SupabaseClient,
  barberId: string,
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const { data, error } = await supabase.storage.from(TEAM_PHOTOS_BUCKET).list(barberId, {
    limit: 200,
  });
  if (error) return { ok: false, error: error.message || 'list_failed' };
  const count = (data ?? []).filter((o) => o.name && !o.name.endsWith('/')).length;
  return { ok: true, count };
}

export async function uploadTeamMemberPhoto(
  supabase: SupabaseClient,
  input: { barberId: string; memberId: string; imageBase64: string },
): Promise<{ ok: true; publicUrl: string; objectPath: string; member: BarberTeamMemberRow } | { ok: false; error: string }> {
  if (!UUID_RE.test(input.memberId)) return { ok: false, error: 'invalid_member_id' };
  const listed = await countTeamPhotos(supabase, input.barberId);
  if (!listed.ok) return listed;
  if (listed.count >= MAX_TEAM_PHOTOS) return { ok: false, error: 'team_photos_limit_reached' };

  let buf: Buffer;
  try {
    buf = Buffer.from(String(input.imageBase64 ?? '').trim(), 'base64');
  } catch {
    return { ok: false, error: 'invalid_image' };
  }
  if (buf.length < 32) return { ok: false, error: 'invalid_image' };
  if (buf.length > 2_500_000) return { ok: false, error: 'image_too_large' };

  const { data: member } = await supabase
    .from('barber_team_members')
    .select('id, photo_url')
    .eq('id', input.memberId)
    .eq('barber_id', input.barberId)
    .maybeSingle();
  if (!member) return { ok: false, error: 'member_not_found' };

  const path = `${input.barberId}/${input.memberId}-${Date.now()}.webp`;
  const { error: upErr } = await supabase.storage.from(TEAM_PHOTOS_BUCKET).upload(path, buf, {
    contentType: 'image/webp',
    upsert: false,
  });
  if (upErr) return { ok: false, error: upErr.message || 'upload_failed' };

  const { data: pub } = supabase.storage.from(TEAM_PHOTOS_BUCKET).getPublicUrl(path);
  const publicUrl = pub?.publicUrl ? String(pub.publicUrl) : '';
  if (!publicUrl) return { ok: false, error: 'public_url_unavailable' };

  const { data: updated, error: updErr } = await supabase
    .from('barber_team_members')
    .update({ photo_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', input.memberId)
    .eq('barber_id', input.barberId)
    .select('*')
    .maybeSingle();
  if (updErr || !updated) return { ok: false, error: updErr?.message || 'member_update_failed' };

  return {
    ok: true,
    publicUrl,
    objectPath: path,
    member: mapMember(updated as Record<string, unknown>),
  };
}

export async function deleteTeamMember(
  supabase: SupabaseClient,
  barberId: string,
  memberId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!UUID_RE.test(memberId)) return { ok: false, error: 'invalid_member_id' };
  const { error } = await supabase
    .from('barber_team_members')
    .delete()
    .eq('id', memberId)
    .eq('barber_id', barberId);
  if (error) return { ok: false, error: error.message || 'delete_failed' };
  return { ok: true };
}

export async function listTeamBlocks(
  supabase: SupabaseClient,
  input: { barberId: string; teamMemberId: string; blockDate: string },
): Promise<TeamMemberBlockRow[]> {
  const { data, error } = await supabase
    .from('barber_team_member_blocks')
    .select('id, barber_id, team_member_id, block_date, start_time, end_time, reason')
    .eq('barber_id', input.barberId)
    .eq('team_member_id', input.teamMemberId)
    .eq('block_date', input.blockDate)
    .order('start_time', { ascending: true });
  if (error || !data) return [];
  return data.map((r) => mapBlock(r as Record<string, unknown>));
}

export async function setTeamSlotBlocked(
  supabase: SupabaseClient,
  input: {
    barberId: string;
    teamMemberId: string;
    blockDate: string;
    startTime: string;
    durationMinutes?: number;
    blocked: boolean;
    reason?: string | null;
  },
): Promise<{ ok: true; blocks: TeamMemberBlockRow[] } | { ok: false; error: string }> {
  if (!UUID_RE.test(input.teamMemberId)) return { ok: false, error: 'invalid_member_id' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.blockDate)) return { ok: false, error: 'invalid_date' };
  const startHm = normalizeTimeHm(input.startTime);
  if (!startHm) return { ok: false, error: 'invalid_time' };
  const duration = parseDurationMinutes(input.durationMinutes, SLOT_STEP_MIN);
  const startMin = timeToMinutes(startHm);
  if (startMin == null) return { ok: false, error: 'invalid_time' };
  const endMin = startMin + duration;
  const endHm = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

  const { data: member } = await supabase
    .from('barber_team_members')
    .select('id')
    .eq('id', input.teamMemberId)
    .eq('barber_id', input.barberId)
    .maybeSingle();
  if (!member) return { ok: false, error: 'member_not_found' };

  // امسح أي حظر يتقاطع مع هذه النافذة ثم أعد الإدراج إن لزم
  const existing = await listTeamBlocks(supabase, {
    barberId: input.barberId,
    teamMemberId: input.teamMemberId,
    blockDate: input.blockDate,
  });
  const slotStart = parseTs(input.blockDate, startHm);
  const slotEnd = parseTs(input.blockDate, endHm);
  if (slotStart == null || slotEnd == null) return { ok: false, error: 'invalid_time' };

  const overlappingIds = existing
    .filter((b) => {
      const bs = parseTs(b.block_date, b.start_time);
      const be = parseTs(b.block_date, b.end_time);
      if (bs == null || be == null) return false;
      return slotStart < be && bs < slotEnd;
    })
    .map((b) => b.id);

  if (overlappingIds.length) {
    await supabase.from('barber_team_member_blocks').delete().in('id', overlappingIds);
  }

  if (input.blocked) {
    const { error } = await supabase.from('barber_team_member_blocks').insert({
      barber_id: input.barberId,
      team_member_id: input.teamMemberId,
      block_date: input.blockDate,
      start_time: `${startHm}:00`,
      end_time: `${endHm}:00`,
      reason: String(input.reason ?? '').trim().slice(0, 200) || 'محظور يدوياً',
    });
    if (error) return { ok: false, error: error.message || 'block_failed' };
  }

  const blocks = await listTeamBlocks(supabase, {
    barberId: input.barberId,
    teamMemberId: input.teamMemberId,
    blockDate: input.blockDate,
  });
  return { ok: true, blocks };
}

export async function listBusyIntervalsForMember(
  supabase: SupabaseClient,
  input: { barberId: string; teamMemberId: string | null; bookingDate: string },
): Promise<Array<{ start: number; end: number; source: 'booking' | 'block' }>> {
  const intervals: Array<{ start: number; end: number; source: 'booking' | 'block' }> = [];

  let bookingQuery = supabase
    .from('bookings')
    .select('booking_time, duration_minutes, team_member_id')
    .eq('barber_id', input.barberId)
    .eq('booking_date', input.bookingDate)
    .in('status', ['pending', 'confirmed']);

  if (input.teamMemberId) {
    bookingQuery = bookingQuery.eq('team_member_id', input.teamMemberId);
  } else {
    bookingQuery = bookingQuery.is('team_member_id', null);
  }

  const { data: bookings } = await bookingQuery;
  for (const row of bookings ?? []) {
    const start = parseTs(input.bookingDate, String(row.booking_time ?? ''));
    if (start == null) continue;
    const dur = Number(row.duration_minutes ?? 30);
    intervals.push({
      start,
      end: start + (Number.isFinite(dur) ? dur : 30) * 60_000,
      source: 'booking',
    });
  }

  if (input.teamMemberId) {
    const blocks = await listTeamBlocks(supabase, {
      barberId: input.barberId,
      teamMemberId: input.teamMemberId,
      blockDate: input.bookingDate,
    });
    for (const b of blocks) {
      const start = parseTs(b.block_date, b.start_time);
      const end = parseTs(b.block_date, b.end_time);
      if (start == null || end == null) continue;
      intervals.push({ start, end, source: 'block' });
    }
  }

  return intervals;
}

export async function listAvailableSlots(
  supabase: SupabaseClient,
  input: {
    barberId: string;
    teamMemberId?: string | null;
    bookingDate: string;
    durationMinutes?: number;
  },
): Promise<{ ok: true; slots: string[] } | { ok: false; error: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.bookingDate)) {
    return { ok: false, error: 'invalid_date' };
  }
  const duration = parseDurationMinutes(input.durationMinutes, SLOT_STEP_MIN);
  const teamMemberId = input.teamMemberId ? String(input.teamMemberId).trim() : null;
  if (teamMemberId && !UUID_RE.test(teamMemberId)) {
    return { ok: false, error: 'invalid_member_id' };
  }

  if (teamMemberId) {
    const { data: member } = await supabase
      .from('barber_team_members')
      .select('id, is_active, default_duration_minutes')
      .eq('id', teamMemberId)
      .eq('barber_id', input.barberId)
      .maybeSingle();
    if (!member || member.is_active === false) {
      return { ok: false, error: 'member_not_found' };
    }
  }

  const busy = await listBusyIntervalsForMember(supabase, {
    barberId: input.barberId,
    teamMemberId,
    bookingDate: input.bookingDate,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const candidateDay = new Date(`${input.bookingDate}T12:00:00`);
  const isToday = candidateDay.toDateString() === today.toDateString();
  const now = Date.now();

  const available: string[] = [];
  for (const slot of buildDaySlots(SLOT_STEP_MIN)) {
    const start = parseTs(input.bookingDate, slot);
    if (start == null) continue;
    const end = start + duration * 60_000;
    if (isToday && start <= now) continue;
    const overlaps = busy.some((b) => start < b.end && b.start < end);
    if (!overlaps) available.push(slot);
  }

  return { ok: true, slots: available };
}

export async function resolveTeamMemberForBooking(
  supabase: SupabaseClient,
  barberId: string,
  teamMemberId: string | null | undefined,
): Promise<{ ok: true; teamMemberId: string | null; durationMinutes: number } | { ok: false; error: string; status: number }> {
  const id = String(teamMemberId ?? '').trim();
  if (!id) return { ok: true, teamMemberId: null, durationMinutes: SLOT_STEP_MIN };
  if (!UUID_RE.test(id)) return { ok: false, error: 'Invalid team member id', status: 400 };

  const { data, error } = await supabase
    .from('barber_team_members')
    .select('id, is_active, default_duration_minutes')
    .eq('id', id)
    .eq('barber_id', barberId)
    .maybeSingle();

  if (error || !data || data.is_active === false) {
    return { ok: false, error: 'Team member not found or inactive', status: 404 };
  }

  return {
    ok: true,
    teamMemberId: String(data.id),
    durationMinutes: Number(data.default_duration_minutes) || SLOT_STEP_MIN,
  };
}

export async function getPublicBookingContext(
  supabase: SupabaseClient,
  barberId: string,
): Promise<
  | {
      ok: true;
      salon: {
        id: string;
        name: string;
        contactMode: ContactMode;
        cardCta: CardCtaFlags;
        address: string | null;
        tier: string | null;
      };
      team: Array<{
        id: string;
        displayName: string;
        photoUrl: string | null;
        defaultDurationMinutes: number;
      }>;
    }
  | { ok: false; error: string; status: number }
> {
  if (!UUID_RE.test(barberId)) return { ok: false, error: 'Invalid barber id', status: 400 };

  const { data: barber, error } = await supabase
    .from('barbers')
    .select(
      'id, name, address, tier, is_active, contact_mode, card_show_phone, card_show_whatsapp, card_show_chat, card_show_booking',
    )
    .eq('id', barberId)
    .maybeSingle();

  if (error || !barber) return { ok: false, error: 'Barber not found', status: 404 };
  if (barber.is_active === false) return { ok: false, error: 'Barber inactive', status: 409 };

  const cardCta = normalizeCardCtaFlags(barber as Record<string, unknown>);
  const members = await listTeamMembers(supabase, barberId, { activeOnly: true });

  return {
    ok: true,
    salon: {
      id: String(barber.id),
      name: String(barber.name ?? ''),
      contactMode: contactModeFromCardCta(cardCta),
      cardCta,
      address: barber.address == null ? null : String(barber.address),
      tier: barber.tier == null ? null : String(barber.tier),
    },
    team: members.map((m) => ({
      id: m.id,
      displayName: m.display_name,
      photoUrl: m.photo_url,
      defaultDurationMinutes: m.default_duration_minutes,
    })),
  };
}
