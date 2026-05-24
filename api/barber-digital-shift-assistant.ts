import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  ensureConfigRow,
  generateDigitalShiftReply,
  loadDigitalShiftContext,
  refreshHeuristicRecommendations,
  type RecommendationInput,
} from './_lib/digitalShiftAssistant.js';
import { DIGITAL_SHIFT_NOT_ENABLED_ERROR_AR } from './_lib/subscriptionPricingCopy.js';

export const config = { maxDuration: 45 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  return Response.json(
    { ok: true, route: 'barber-digital-shift-assistant', publicApiGuard: registrationGuardDiagnostics() },
    { headers: corsHeaders(request) },
  );
}

async function assertBarber(
  supabase: SupabaseClient,
  barberId: string,
  email: string,
): Promise<
  | { ok: true; row: { id: string; email: string | null; tier: string | null; name: string | null } }
  | { ok: false; status: number; message: string }
> {
  const emailNorm = email.trim().toLowerCase();
  const { data: row, error } = await supabase
    .from('barbers')
    .select('id, email, tier, name')
    .eq('id', barberId)
    .maybeSingle();
  if (error || !row) return { ok: false, status: 404, message: 'Barber not found' };
  const b = row as { id: string; email: string | null; tier: string | null; name: string | null };
  if (String(b.email ?? '').trim().toLowerCase() !== emailNorm) {
    return { ok: false, status: 403, message: 'Email mismatch' };
  }
  if (b.tier !== 'diamond') {
    return { ok: false, status: 403, message: 'Digital shift assistant requires Diamond tier' };
  }
  return { ok: true, row: b };
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'barber-digital-shift-assistant');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers });
  }

  const action = String(body.action ?? '').trim();
  const barberId = String(body.barberId ?? '').trim();
  const email = String(body.email ?? '').trim();

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const gate = await assertBarber(supabase, barberId, email);
  if (!gate.ok) return Response.json({ error: gate.message }, { status: gate.status, headers });

  await ensureConfigRow(supabase, barberId);

  const { data: accessRow } = await supabase
    .from('barber_digital_shift_config')
    .select('enabled')
    .eq('barber_id', barberId)
    .maybeSingle();

  const addonActive = accessRow?.enabled === true;

  if (action !== 'summary' && !addonActive) {
    return Response.json(
      { error: DIGITAL_SHIFT_NOT_ENABLED_ERROR_AR },
      { status: 403, headers },
    );
  }

  if (action === 'summary') {
    const ctx = await loadDigitalShiftContext(supabase, barberId);
    if (!ctx) return Response.json({ error: 'Context unavailable' }, { status: 404, headers });

    const [{ data: cfg }, { data: wallet }, { data: recs }] = await Promise.all([
      supabase
        .from('barber_digital_shift_config')
        .select('*')
        .eq('barber_id', barberId)
        .maybeSingle(),
      supabase.from('barber_ai_wallet').select('*').eq('barber_id', barberId).maybeSingle(),
      supabase
        .from('barber_ai_recommendations')
        .select('*')
        .eq('barber_id', barberId)
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(40),
    ]);

    return Response.json(
      {
        ok: true,
        context: ctx,
        config: cfg,
        wallet,
        recommendations: recs ?? [],
      },
      { headers },
    );
  }

  if (action === 'update_settings') {
    const assistantName = String(body.assistantDisplayName ?? '').trim().slice(0, 60);
    const enabled =
      body.enabled === undefined || body.enabled === null
        ? addonActive
        : body.enabled === true;
    const replyDelayMinutes = Math.min(30, Math.max(1, Number(body.replyDelayMinutes ?? 3) || 3));

    const patch: Record<string, unknown> = { enabled, reply_delay_minutes: replyDelayMinutes };
    if (assistantName) patch.assistant_display_name = assistantName;

    const { error } = await supabase.from('barber_digital_shift_config').update(patch).eq('barber_id', barberId);
    if (error) return Response.json({ error: error.message }, { status: 500, headers });
    return Response.json({ ok: true }, { headers });
  }

  if (action === 'refresh_recommendations') {
    const ctx = await loadDigitalShiftContext(supabase, barberId);
    if (!ctx) return Response.json({ error: 'Context unavailable' }, { status: 404, headers });

    const input: RecommendationInput = {
      bannerImageUrls: Array.isArray(body.bannerImageUrls)
        ? (body.bannerImageUrls as unknown[]).map(String)
        : undefined,
      showDiscountBadge: body.showDiscountBadge === true,
      discountPercent:
        body.discountPercent == null || body.discountPercent === ''
          ? null
          : Number(body.discountPercent),
      galleryItems: Array.isArray(body.galleryItems)
        ? (body.galleryItems as { id?: string; createdAt?: string; imageUrl?: string }[]).map((g) => ({
            id: String(g.id ?? ''),
            createdAt: g.createdAt ? String(g.createdAt) : undefined,
            imageUrl: g.imageUrl ? String(g.imageUrl) : undefined,
          }))
        : undefined,
    };

    await refreshHeuristicRecommendations(supabase, barberId, ctx, input);

    const { data: recs } = await supabase
      .from('barber_ai_recommendations')
      .select('*')
      .eq('barber_id', barberId)
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(40);

    return Response.json({ ok: true, recommendations: recs ?? [] }, { headers });
  }

  if (action === 'dismiss_recommendation') {
    const recommendationId = String(body.recommendationId ?? '').trim();
    if (!recommendationId) return Response.json({ error: 'Missing recommendationId' }, { status: 400, headers });

    const { error } = await supabase
      .from('barber_ai_recommendations')
      .update({ status: 'dismissed' })
      .eq('id', recommendationId)
      .eq('barber_id', barberId);

    if (error) return Response.json({ error: error.message }, { status: 500, headers });
    return Response.json({ ok: true }, { headers });
  }

  if (action === 'barber_chat') {
    const message = String(body.message ?? '').trim();
    if (!message || message.length > 2000) {
      return Response.json({ error: 'message must be 1–2000 chars' }, { status: 400, headers });
    }

    const ctx = await loadDigitalShiftContext(supabase, barberId);
    if (!ctx) return Response.json({ error: 'Context unavailable' }, { status: 404, headers });

    const history = Array.isArray(body.history)
      ? (body.history as { role?: string; content?: string }[])
          .filter((t) => t && (t.role === 'user' || t.role === 'assistant'))
          .map((t) => ({ role: t.role as 'user' | 'assistant', content: String(t.content ?? '').slice(0, 2000) }))
      : [];

    // تعليمات ومهام الحلاق (من localStorage، تُرسل من العميل)
    const instructions = Array.isArray(body.instructions)
      ? (body.instructions as unknown[]).map(s => String(s)).filter(Boolean).slice(0, 20)
      : [];
    const tasks = Array.isArray(body.tasks)
      ? (body.tasks as { text?: string; done?: boolean }[])
          .map(t => ({ text: String(t.text ?? ''), done: Boolean(t.done) }))
          .filter(t => t.text)
          .slice(0, 30)
      : [];

    // ◆ قراءة توجيهات الأسطول (fleet_directive) من قاعدة البيانات
    let fleetDirectives: string[] = [];
    try {
      const { data: fdRows } = await supabase
        .from('barber_ai_recommendations')
        .select('title, body')
        .in('barber_id', [barberId, '__broadcast__'])
        .eq('status', 'active')
        .eq('category', 'fleet_directive')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);
      if (fdRows && fdRows.length > 0) {
        fleetDirectives = fdRows.map((r: { title: string; body: string }) =>
          `[${String(r.title ?? '')}] ${String(r.body ?? '')}`
        );
      }
    } catch { /* صامت — القناة الخلفية لا تُوقف المحادثة */ }

    try {
      const reply = await generateDigitalShiftReply(ctx, 'barber', message, history, { instructions, tasks, fleetDirectives });
      return Response.json({ ok: true, reply }, { headers });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'AI failed';
      return Response.json({ error: msg }, { status: 502, headers });
    }
  }

  // ◆ قراءة توجيهات الأسطول للمكتب الخاص
  if (action === 'fleet_directives_read') {
    const { data: fdRows } = await supabase
      .from('barber_ai_recommendations')
      .select('id, title, body, created_at, priority')
      .in('barber_id', [barberId, '__broadcast__'])
      .eq('status', 'active')
      .eq('category', 'fleet_directive')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(15);
    return Response.json({ ok: true, directives: fdRows ?? [] }, { headers });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400, headers });
}
