/**
 * مزامنة أوقات العمل من طلب التسجيل → جدول working_hours + حقل العرض العام.
 * day_of_week: 0=الأحد … 6=السبت (مطابق لتعريف الجدول).
 */
import type { SupabaseClient } from '@supabase/supabase-js';

const DAY_TO_DOW: Record<string, number> = {
  الأحد: 0,
  الاثنين: 1,
  الثلاثاء: 2,
  الأربعاء: 3,
  الخميس: 4,
  الجمعة: 5,
  السبت: 6,
};

const DOW_TO_DAY: Record<number, string> = {
  0: 'الأحد',
  1: 'الاثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
};

export type WeeklyWorkingHourSlot = { day: string; open: string; close: string };

function isClosed(open: string, close: string): boolean {
  const o = open.trim();
  const c = close.trim();
  if (o === 'مغلق' || c === 'مغلق') return true;
  return !o && !c;
}

function normalizeTime(raw: string): string | null {
  const t = String(raw ?? '').trim();
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function parseWeeklyWorkingHoursFromPayload(
  payload: Record<string, unknown> | null | undefined,
): WeeklyWorkingHourSlot[] {
  if (!payload) return [];
  const raw = payload.weeklyWorkingHours;
  if (!Array.isArray(raw)) return [];
  const out: WeeklyWorkingHourSlot[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const day = String(o.day ?? '').trim();
    if (!(day in DAY_TO_DOW)) continue;
    out.push({
      day,
      open: String(o.open ?? '').trim(),
      close: String(o.close ?? '').trim(),
    });
  }
  return out;
}

export function workingHoursRowsToSlots(
  rows: Array<{
    day_of_week: number;
    is_open: boolean | null;
    open_time: string | null;
    close_time: string | null;
  }>,
): WeeklyWorkingHourSlot[] {
  const byDow = new Map<number, WeeklyWorkingHourSlot>();
  for (const r of rows) {
    const day = DOW_TO_DAY[r.day_of_week];
    if (!day) continue;
    if (r.is_open === false) {
      byDow.set(r.day_of_week, { day, open: 'مغلق', close: 'مغلق' });
      continue;
    }
    const open = String(r.open_time ?? '').slice(0, 5);
    const close = String(r.close_time ?? '').slice(0, 5);
    if (!open || !close) {
      byDow.set(r.day_of_week, { day, open: 'مغلق', close: 'مغلق' });
    } else {
      byDow.set(r.day_of_week, { day, open, close });
    }
  }
  // ترتيب سعودي: السبت → الجمعة
  const order = [6, 0, 1, 2, 3, 4, 5];
  return order
    .map((dow) => byDow.get(dow))
    .filter((x): x is WeeklyWorkingHourSlot => Boolean(x));
}

export async function syncBarberWorkingHoursFromSlots(
  supabase: SupabaseClient,
  barberId: string,
  slots: WeeklyWorkingHourSlot[],
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  if (!barberId || slots.length === 0) return { ok: true, count: 0 };

  const now = new Date().toISOString();
  const rows = slots
    .map((slot) => {
      const dow = DAY_TO_DOW[slot.day];
      if (dow == null) return null;
      const closed = isClosed(slot.open, slot.close);
      const open = closed ? null : normalizeTime(slot.open);
      const close = closed ? null : normalizeTime(slot.close);
      if (!closed && (open == null || close == null)) return null;
      return {
        barber_id: barberId,
        day_of_week: dow,
        is_open: !closed,
        open_time: open,
        close_time: close,
        updated_at: now,
      };
    })
    .filter(Boolean) as Array<Record<string, unknown>>;

  if (rows.length === 0) return { ok: true, count: 0 };

  const { error } = await supabase.from('working_hours').upsert(rows, {
    onConflict: 'barber_id,day_of_week',
  });
  if (error) return { ok: false, error: error.message };

  // نسخة سريعة للعرض العام (العمود اختياري حتى اكتمال الترحيل)
  const { error: colErr } = await supabase
    .from('barbers')
    .update({
      weekly_working_hours: slots,
      updated_at: now,
    })
    .eq('id', barberId);
  if (colErr && !/weekly_working_hours/i.test(colErr.message || '')) {
    console.error('[working-hours] barber_column_update_failed', colErr.message);
  }

  return { ok: true, count: rows.length };
}

export async function syncBarberWorkingHoursFromRegistrationPayload(
  supabase: SupabaseClient,
  barberId: string,
  payload: Record<string, unknown> | null | undefined,
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const slots = parseWeeklyWorkingHoursFromPayload(payload);
  return syncBarberWorkingHoursFromSlots(supabase, barberId, slots);
}

export async function loadWorkingHoursSlotsForBarbers(
  supabase: SupabaseClient,
  barberIds: string[],
): Promise<Map<string, WeeklyWorkingHourSlot[]>> {
  const map = new Map<string, WeeklyWorkingHourSlot[]>();
  const ids = [...new Set(barberIds.map((x) => String(x).trim()).filter(Boolean))];
  if (ids.length === 0) return map;

  // فضّل العمود المخزّن على barbers إن وُجد
  const { data: barberRows } = await supabase
    .from('barbers')
    .select('id, weekly_working_hours')
    .in('id', ids);
  for (const row of barberRows ?? []) {
    const id = String((row as { id?: string }).id ?? '');
    const raw = (row as { weekly_working_hours?: unknown }).weekly_working_hours;
    if (!id || !Array.isArray(raw) || raw.length === 0) continue;
    const slots = parseWeeklyWorkingHoursFromPayload({ weeklyWorkingHours: raw });
    if (slots.length) map.set(id, slots);
  }

  const missing = ids.filter((id) => !map.has(id));
  if (missing.length === 0) return map;

  const { data: wh } = await supabase
    .from('working_hours')
    .select('barber_id, day_of_week, is_open, open_time, close_time')
    .in('barber_id', missing);
  const grouped = new Map<string, Array<{
    day_of_week: number;
    is_open: boolean | null;
    open_time: string | null;
    close_time: string | null;
  }>>();
  for (const r of wh ?? []) {
    const bid = String((r as { barber_id?: string }).barber_id ?? '');
    if (!bid) continue;
    const list = grouped.get(bid) ?? [];
    list.push({
      day_of_week: Number((r as { day_of_week: number }).day_of_week),
      is_open: (r as { is_open?: boolean | null }).is_open ?? true,
      open_time: (r as { open_time?: string | null }).open_time ?? null,
      close_time: (r as { close_time?: string | null }).close_time ?? null,
    });
    grouped.set(bid, list);
  }
  for (const [bid, rows] of grouped) {
    map.set(bid, workingHoursRowsToSlots(rows));
  }
  return map;
}
