import type { BarberDashboardScheduleItem } from '@/lib/barberDashboardLocalState';

const DEFAULT_ENDPOINT = '/api/diamond-appointment-booking';

export type RemoteBookingRow = {
  id: string;
  barber_id: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
};

function endpoint(): string {
  return String(import.meta.env.VITE_DIAMOND_APPOINTMENT_BOOKING_URL || DEFAULT_ENDPOINT).trim();
}

function publicHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
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

function normalizeErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid saudi mobile')) {
    return 'أدخل رقم جوال سعودي صحيح يبدأ بـ 05 (10 أرقام).';
  }
  if (m.includes('slot overlaps')) {
    return 'هذا الوقت محجوز مسبقاً. اختر وقتاً آخر.';
  }
  if (m.includes('diamond appointment scheduling')) {
    return 'جدولة المواعيد متاحة لباقة ماسي فقط.';
  }
  if (m.includes('barber inactive')) {
    return 'هذا الصالون غير مفعّل حالياً.';
  }
  if (m.includes('barber not found')) {
    return 'تعذّر إرسال طلب الحجز لهذا الصالون.';
  }
  if (m.includes('invalid booking date') || m.includes('invalid booking time')) {
    return 'التاريخ أو الوقت غير صالح.';
  }
  return message;
}

function formatBookingTime(raw: string): string {
  const trimmed = raw.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  const m = /^(\d{2}):(\d{2})/.exec(trimmed);
  return m ? `${m[1]}:${m[2]}` : trimmed;
}

function mapBookingStatus(
  status: RemoteBookingRow['status'],
): BarberDashboardScheduleItem['status'] {
  if (status === 'no_show') return 'cancelled';
  return status;
}

export function mapRemoteBookingToScheduleItem(row: RemoteBookingRow): BarberDashboardScheduleItem {
  return {
    id: row.id,
    barberId: row.barber_id,
    kind: 'customer_booking',
    date: row.booking_date,
    time: formatBookingTime(row.booking_time),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    service: row.service_name,
    status: mapBookingStatus(row.status),
    visibleOnProfile: false,
  };
}

async function postJson<T>(
  payload: Record<string, unknown>,
  auth: 'public' | 'barber',
): Promise<{ ok: true; json: T } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار حجز المواعيد غير مضبوط.' };
  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers: auth === 'barber' ? barberHeaders() : publicHeaders(),
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) {
      return { ok: false, error: normalizeErrorMessage(json.error || `HTTP ${res.status}`) };
    }
    return { ok: true, json };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function createDiamondAppointmentBookingRemote(input: {
  barberId: string;
  bookingDate: string;
  bookingTime: string;
  customerPhone: string;
  durationMinutes?: number;
}): Promise<{ ok: true; bookingId: string } | { ok: false; error: string }> {
  const res = await postJson<{ bookingId?: string }>(
    {
      action: 'create',
      barberId: input.barberId.trim(),
      bookingDate: input.bookingDate.trim(),
      bookingTime: input.bookingTime.trim(),
      customerPhone: input.customerPhone.trim(),
      durationMinutes: input.durationMinutes ?? 30,
    },
    'public',
  );
  if (!res.ok) return res;
  const bookingId = String(res.json.bookingId ?? '').trim();
  if (!bookingId) return { ok: false, error: 'تعذّر إنشاء طلب الحجز.' };
  return { ok: true, bookingId };
}

export async function listBarberBookingsRemote(): Promise<
  { ok: true; items: BarberDashboardScheduleItem[] } | { ok: false; error: string }
> {
  const res = await postJson<{ bookings?: RemoteBookingRow[] }>({ action: 'list' }, 'barber');
  if (!res.ok) return res;
  const rows = Array.isArray(res.json.bookings) ? res.json.bookings : [];
  return { ok: true, items: rows.map(mapRemoteBookingToScheduleItem) };
}

export async function updateBarberBookingStatusRemote(
  bookingId: string,
  status: 'confirmed' | 'cancelled' | 'completed',
): Promise<{ ok: true; item: BarberDashboardScheduleItem } | { ok: false; error: string }> {
  const res = await postJson<{ booking?: RemoteBookingRow }>(
    {
      action: 'update_status',
      bookingId: bookingId.trim(),
      status,
    },
    'barber',
  );
  if (!res.ok) return res;
  if (!res.json.booking) return { ok: false, error: 'تعذّر تحديث حالة الحجز.' };
  return { ok: true, item: mapRemoteBookingToScheduleItem(res.json.booking) };
}
