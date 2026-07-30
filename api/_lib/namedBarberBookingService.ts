/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * طاقم الحلاقين + وضع الاتصال + فترات الحظر + فتحات الإتاحة للحجز بالاسم.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/;

export const MAX_TEAM_MEMBERS = 25;
export const MAX_DISPLAY_NAME_LEN = 60;
export const SLOT_STEP_MIN = 30;
export const DAY_START_MIN = 10 * 60;
export const DAY_END_MIN = 23 * 60;

export type ContactMode = 'classic' | 'booking_only';

export type BarberTeamMemberRow = {
  id: string;
  barber_id: string;
  display_name: string;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
  default_duration_minutes: number;
  internal_notes: string | null;
  created_at?: string;
  updated_at?: string;
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

function mapMember(row: Record<string, unknown>): BarberTeamMemberRow {
  return {
    id: String(row.id ?? ''),
    barber_id: String(row.barber_id ?? ''),
    display_name: String(row.display_name ?? ''),
    photo_url: row.photo_url == null ? null : String(row.photo_url),
    sort_order: Number(row.sort_order) || 0,
    is_active: row.is_active !== false,
    default_duration_minutes: Number(row.default_duration_minutes) || 30,
    internal_notes: row.internal_notes == null ? null : String(row.internal_notes),
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
  const { data } = await supabase.from('barbers').select('contact_mode').eq('id', barberId).maybeSingle();
  return normalizeContactMode(data?.contact_mode);
}

export async function loadContactModesForBarbers(
  supabase: SupabaseClient,
  barberIds: string[],
): Promise<Map<string, ContactMode>> {
  const map = new Map<string, ContactMode>();
  const ids = [...new Set(barberIds.map((id) => id.trim()).filter((id) => UUID_RE.test(id)))];
  if (!ids.length) return map;
  const { data, error } = await supabase.from('barbers').select('id, contact_mode').in('id', ids);
  if (error || !data) return map;
  for (const row of data) {
    map.set(String(row.id), normalizeContactMode(row.contact_mode));
  }
  return map;
}

export async function updateBarberContactMode(
  supabase: SupabaseClient,
  barberId: string,
  mode: ContactMode,
): Promise<{ ok: true; contactMode: ContactMode } | { ok: false; error: string }> {
  const contactMode = normalizeContactMode(mode);
  const { error } = await supabase.from('barbers').update({ contact_mode: contactMode }).eq('id', barberId);
  if (error) return { ok: false, error: error.message || 'update_failed' };
  return { ok: true, contactMode };
}

export async function listTeamMembers(
  supabase: SupabaseClient,
  barberId: string,
  opts?: { activeOnly?: boolean },
): Promise<BarberTeamMemberRow[]> {
  let q = supabase
    .from('barber_team_members')
    .select(
      'id, barber_id, display_name, photo_url, sort_order, is_active, default_duration_minutes, internal_notes, created_at, updated_at',
    )
    .eq('barber_id', barberId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (opts?.activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error || !data) return [];
  return data.map((r) => mapMember(r as Record<string, unknown>));
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
  },
): Promise<{ ok: true; member: BarberTeamMemberRow } | { ok: false; error: string }> {
  const displayName = normalizeDisplayName(input.displayName);
  if (!displayName) return { ok: false, error: 'display_name_required' };

  const photoUrl = normalizePhotoUrl(input.photoUrl);
  const duration = parseDurationMinutes(input.defaultDurationMinutes, 30);
  const sortOrder =
    typeof input.sortOrder === 'number' && Number.isFinite(input.sortOrder)
      ? Math.max(0, Math.floor(input.sortOrder))
      : 0;
  const isActive = input.isActive !== false;
  const notes = String(input.internalNotes ?? '')
    .trim()
    .slice(0, 500);

  const memberId = String(input.memberId ?? '').trim();
  if (memberId) {
    if (!UUID_RE.test(memberId)) return { ok: false, error: 'invalid_member_id' };
    const { data, error } = await supabase
      .from('barber_team_members')
      .update({
        display_name: displayName,
        photo_url: photoUrl,
        sort_order: sortOrder,
        is_active: isActive,
        default_duration_minutes: duration,
        internal_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .eq('barber_id', input.barberId)
      .select('*')
      .maybeSingle();
    if (error || !data) return { ok: false, error: error?.message || 'member_not_found' };
    return { ok: true, member: mapMember(data as Record<string, unknown>) };
  }

  const existing = await listTeamMembers(supabase, input.barberId);
  if (existing.length >= MAX_TEAM_MEMBERS) return { ok: false, error: 'team_limit_reached' };

  const { data, error } = await supabase
    .from('barber_team_members')
    .insert({
      barber_id: input.barberId,
      display_name: displayName,
      photo_url: photoUrl,
      sort_order: sortOrder,
      is_active: isActive,
      default_duration_minutes: duration,
      internal_notes: notes || null,
    })
    .select('*')
    .maybeSingle();
  if (error || !data) return { ok: false, error: error?.message || 'insert_failed' };
  return { ok: true, member: mapMember(data as Record<string, unknown>) };
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
    .select('id, name, address, tier, is_active, contact_mode')
    .eq('id', barberId)
    .maybeSingle();

  if (error || !barber) return { ok: false, error: 'Barber not found', status: 404 };
  if (barber.is_active === false) return { ok: false, error: 'Barber inactive', status: 409 };

  const members = await listTeamMembers(supabase, barberId, { activeOnly: true });

  return {
    ok: true,
    salon: {
      id: String(barber.id),
      name: String(barber.name ?? ''),
      contactMode: normalizeContactMode(barber.contact_mode),
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
