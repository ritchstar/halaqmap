import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getBarberListingBalance } from './listingLicenseService.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SA_PHONE_RE = /^05\d{8}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type BookingRow = {
  id: string;
  barber_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  service_name: string;
  service_price: number | null;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingStatus = BookingRow['status'];

function resolveSupabaseUrl(): string {
  return (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
}

function parseBookingTimestamp(dateIso: string, timeRaw: string): number | null {
  const m = /^(\d{2}):(\d{2})/.exec(String(timeRaw).trim());
  if (!m) return null;
  const t = new Date(`${dateIso}T${m[1]}:${m[2]}:00`);
  return Number.isFinite(t.getTime()) ? t.getTime() : null;
}

async function bookingSlotOverlaps(
  service: SupabaseClient,
  barberId: string,
  bookingDate: string,
  bookingTime: string,
  durationMinutes: number,
): Promise<boolean> {
  const newStart = parseBookingTimestamp(bookingDate, bookingTime);
  if (newStart == null) return true;
  const newEnd = newStart + durationMinutes * 60_000;

  const { data: rows, error } = await service
    .from('bookings')
    .select('booking_time, duration_minutes')
    .eq('barber_id', barberId)
    .eq('booking_date', bookingDate)
    .in('status', ['pending', 'confirmed']);

  if (error || !rows?.length) return false;

  for (const row of rows) {
    const existingStart = parseBookingTimestamp(bookingDate, String(row.booking_time ?? ''));
    if (existingStart == null) continue;
    const existingDur = Number(row.duration_minutes ?? 30);
    const existingEnd = existingStart + (Number.isFinite(existingDur) ? existingDur : 30) * 60_000;
    if (newStart < existingEnd && existingStart < newEnd) return true;
  }
  return false;
}

async function insertDiamondBookingViaService(
  service: SupabaseClient,
  input: {
    barberRowId: string;
    bookingDate: string;
    bookingTime: string;
    customerPhone: string;
    durationMinutes: number;
  },
): Promise<{ ok: true; booking: BookingRow } | { ok: false; error: string; status: number }> {
  const overlaps = await bookingSlotOverlaps(
    service,
    input.barberRowId,
    input.bookingDate,
    input.bookingTime,
    input.durationMinutes,
  );
  if (overlaps) {
    return { ok: false, error: 'slot overlaps existing booking', status: 409 };
  }

  const { data: row, error } = await service
    .from('bookings')
    .insert({
      barber_id: input.barberRowId,
      customer_id: null,
      customer_name: 'عميل حلاق ماب',
      customer_phone: input.customerPhone,
      customer_email: null,
      service_name: 'طلب موعد — باقة ماسية',
      service_price: null,
      booking_date: input.bookingDate,
      booking_time: input.bookingTime,
      duration_minutes: input.durationMinutes,
      status: 'pending',
      notes: 'طلب موعد من واجهة الزائر (ماسي)',
    })
    .select('*')
    .maybeSingle();

  if (error || !row) {
    return { ok: false, error: error?.message || 'Booking create failed', status: 500 };
  }

  return { ok: true, booking: row as BookingRow };
}

function normalizeBookingTime(raw: string): string | null {
  const trimmed = raw.trim();
  const m = TIME_RE.exec(trimmed);
  if (!m) return null;
  return `${m[1]}:${m[2]}:00`;
}

function isValidBookingDate(raw: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const d = new Date(`${raw}T12:00:00`);
  if (!Number.isFinite(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setDate(max.getDate() + 13);
  const candidate = new Date(`${raw}T12:00:00`);
  return candidate >= today && candidate <= max;
}

async function barberHasDiamondSchedulingAccess(
  supabase: SupabaseClient,
  barber: { id: string; tier: string | null },
): Promise<boolean> {
  if (String(barber.tier ?? '').toLowerCase() === 'diamond') return true;
  const balance = await getBarberListingBalance(supabase, String(barber.id));
  return balance.hasActiveListing && String(balance.activeTier ?? '').toLowerCase() === 'diamond';
}

export async function resolveDiamondBarberForBooking(
  supabase: SupabaseClient,
  barberId: string,
): Promise<{ ok: true; barberRowId: string } | { ok: false; error: string; status: number }> {
  const id = barberId.trim();
  if (!UUID_RE.test(id)) {
    return { ok: false, error: 'Invalid barber id', status: 400 };
  }

  const { data: barber, error } = await supabase
    .from('barbers')
    .select('id, tier, is_active')
    .eq('id', id)
    .maybeSingle();

  if (error || !barber) {
    return { ok: false, error: 'Barber not found', status: 404 };
  }

  if (barber.is_active === false) {
    return { ok: false, error: 'Barber inactive', status: 409 };
  }

  const hasDiamond = await barberHasDiamondSchedulingAccess(supabase, {
    id: String(barber.id),
    tier: barber.tier ?? null,
  });
  if (!hasDiamond) {
    return { ok: false, error: 'Diamond appointment scheduling is available for diamond salons only', status: 403 };
  }

  return { ok: true, barberRowId: String(barber.id) };
}

export async function assertBarberPortalDiamondScheduling(
  supabase: SupabaseClient,
  barberId: string,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const resolved = await resolveDiamondBarberForBooking(supabase, barberId);
  if (!resolved.ok) return resolved;
  return { ok: true };
}

export async function createDiamondAppointmentRequest(input: {
  barberId: string;
  bookingDate: string;
  bookingTime: string;
  customerPhone: string;
  durationMinutes?: number;
}): Promise<
  | { ok: true; bookingId: string; booking: BookingRow }
  | { ok: false; error: string; status: number }
> {
  const barberId = input.barberId.trim();
  const bookingDate = input.bookingDate.trim();
  const bookingTime = normalizeBookingTime(input.bookingTime);
  const phone = input.customerPhone.trim();
  const durationMinutes = input.durationMinutes ?? 30;

  if (!isValidBookingDate(bookingDate)) {
    return { ok: false, error: 'Invalid booking date', status: 400 };
  }
  if (!bookingTime) {
    return { ok: false, error: 'Invalid booking time', status: 400 };
  }
  if (!SA_PHONE_RE.test(phone)) {
    return { ok: false, error: 'Invalid Saudi mobile number', status: 400 };
  }
  if (durationMinutes < 1 || durationMinutes > 1440) {
    return { ok: false, error: 'Invalid duration', status: 400 };
  }

  const serviceSupabaseUrl = resolveSupabaseUrl();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serviceSupabaseUrl || !serviceRole) {
    return { ok: false, error: 'Server not configured', status: 503 };
  }

  const service = createClient(serviceSupabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const barber = await resolveDiamondBarberForBooking(service, barberId);
  if (!barber.ok) return barber;

  const inserted = await insertDiamondBookingViaService(service, {
    barberRowId: barber.barberRowId,
    bookingDate,
    bookingTime,
    customerPhone: phone,
    durationMinutes,
  });
  if (!inserted.ok) return inserted;

  return { ok: true, bookingId: inserted.booking.id, booking: inserted.booking };
}

export async function listBarberBookings(
  supabase: SupabaseClient,
  barberId: string,
): Promise<{ ok: true; bookings: BookingRow[] } | { ok: false; error: string; status: number }> {
  if (!UUID_RE.test(barberId)) {
    return { ok: false, error: 'Invalid barber id', status: 400 };
  }

  // الأحدث أولاً حتى تظهر طلبات pending الجديدة فوق المواعيد القديمة.
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('barber_id', barberId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return { ok: false, error: error.message || 'list_failed', status: 500 };
  }

  return { ok: true, bookings: (data ?? []) as BookingRow[] };
}

export async function updateBarberBookingStatus(
  supabase: SupabaseClient,
  input: { barberId: string; bookingId: string; status: 'confirmed' | 'cancelled' | 'completed' },
): Promise<{ ok: true; booking: BookingRow } | { ok: false; error: string; status: number }> {
  const barberId = input.barberId.trim();
  const bookingId = input.bookingId.trim();
  if (!UUID_RE.test(barberId) || !UUID_RE.test(bookingId)) {
    return { ok: false, error: 'Invalid id', status: 400 };
  }

  const { data: existing, error: readErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('barber_id', barberId)
    .maybeSingle();

  if (readErr || !existing) {
    return { ok: false, error: 'Booking not found', status: 404 };
  }

  const current = existing as BookingRow;
  if (current.status === 'cancelled' || current.status === 'completed' || current.status === 'no_show') {
    return { ok: false, error: 'Booking is closed', status: 409 };
  }

  const { data: updated, error: updateErr } = await supabase
    .from('bookings')
    .update({
      status: input.status,
      cancellation_reason: input.status === 'cancelled' ? 'ألغاه الحلاق من لوحة التحكم' : null,
    })
    .eq('id', bookingId)
    .eq('barber_id', barberId)
    .select('*')
    .maybeSingle();

  if (updateErr || !updated) {
    return { ok: false, error: updateErr?.message || 'update_failed', status: 500 };
  }

  return { ok: true, booking: updated as BookingRow };
}

/** حذف نهائي لحجز مغلق (ملغى / مكتمل / لم يحضر) من صندوق مواعيد الحلاق. */
export async function deleteClosedBarberBooking(
  supabase: SupabaseClient,
  input: { barberId: string; bookingId: string },
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const barberId = input.barberId.trim();
  const bookingId = input.bookingId.trim();
  if (!UUID_RE.test(barberId) || !UUID_RE.test(bookingId)) {
    return { ok: false, error: 'Invalid id', status: 400 };
  }

  const { data: existing, error: readErr } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('id', bookingId)
    .eq('barber_id', barberId)
    .maybeSingle();

  if (readErr || !existing) {
    return { ok: false, error: 'Booking not found', status: 404 };
  }

  const status = String((existing as { status?: unknown }).status ?? '');
  if (status !== 'cancelled' && status !== 'completed' && status !== 'no_show') {
    return {
      ok: false,
      error: 'Only closed bookings can be deleted; cancel the booking first',
      status: 409,
    };
  }

  const { error: deleteErr } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)
    .eq('barber_id', barberId);

  if (deleteErr) {
    return { ok: false, error: deleteErr.message || 'delete_failed', status: 500 };
  }

  return { ok: true };
}
