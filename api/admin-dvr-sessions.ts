/**
 * admin-dvr-sessions — إدارة جلسات التسجيل الأمني الدائمة
 *
 * Actions:
 *  save    — حفظ جلسة DVR في Supabase (تُستدعى من useCyberThreatRecorder)
 *  list    — قائمة الجلسات للمراجعة (max 50)
 *  get     — جلسة واحدة كاملة للتشغيل
 *  delete  — حذف جلسة
 */

import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';

export const config = { maxDuration: 20 };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, ['view_command_center', 'manage_admins']);
  if (!auth.ok) return json(auth.json, auth.status);

  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const action = String(body.action || '').trim();
  const supabase = createClient(serverUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // ── حفظ جلسة DVR جديدة ────────────────────────────────────────────
  if (action === 'save') {
    const session = body.session as {
      id?: string; recordedAt?: string; titleAr?: string; subtitleAr?: string;
      durationMs?: number; events?: unknown[]; stats?: unknown; prosecutorReport?: unknown;
    };
    if (!session?.id) return json({ error: 'session.id required' }, 400);

    const { error } = await supabase.from('cyber_dvr_sessions').upsert({
      id: String(session.id),
      recorded_at: String(session.recordedAt ?? new Date().toISOString()),
      title_ar: String(session.titleAr ?? 'تسجيل أمني'),
      subtitle_ar: String(session.subtitleAr ?? ''),
      duration_ms: Number(session.durationMs ?? 0),
      events: session.events ?? [],
      stats: session.stats ?? {},
      prosecutor_report: session.prosecutorReport ?? {},
      viewed: false,
    }, { onConflict: 'id' });

    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  // ── قائمة الجلسات للمراجعة ────────────────────────────────────────
  if (action === 'list') {
    const { data, count } = await supabase
      .from('cyber_dvr_sessions')
      .select('id, recorded_at, title_ar, subtitle_ar, duration_ms, stats, viewed', { count: 'exact' })
      .order('recorded_at', { ascending: false })
      .limit(50);
    return json({ ok: true, sessions: data ?? [], total: count ?? 0 });
  }

  // ── تفاصيل جلسة كاملة للتشغيل ─────────────────────────────────────
  if (action === 'get') {
    const id = String(body.id || '').trim();
    if (!id) return json({ error: 'id required' }, 400);
    const { data } = await supabase
      .from('cyber_dvr_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (!data) return json({ error: 'Not found' }, 404);
    // سجّل كـ viewed
    await supabase.from('cyber_dvr_sessions').update({ viewed: true }).eq('id', id);
    return json({ ok: true, session: data });
  }

  // ── حذف جلسة ─────────────────────────────────────────────────────
  if (action === 'delete') {
    const id = String(body.id || '').trim();
    if (!id) return json({ error: 'id required' }, 400);
    await supabase.from('cyber_dvr_sessions').delete().eq('id', id);
    return json({ ok: true });
  }

  return json({ error: 'Unknown action' }, 400);
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
  });
}
