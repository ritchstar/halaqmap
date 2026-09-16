/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تجمع عائلي sa1 — عرض/إرسال تهانٍ + لوحة مضيف + تفويض بريد إداري.
 */
import { createClient } from '@supabase/supabase-js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import { isBootstrapAdminEmail } from './_lib/adminManageBarbersAuth.js';
import {
  clipEmail,
  clipGreetingMessage,
  clipGreetingName,
  FAMILY_GATHERING_DEFAULTS,
  FAMILY_GATHERING_GREETINGS_TABLE,
  FAMILY_GATHERING_HOSTS_TABLE,
  FAMILY_GATHERING_INSTANCES_TABLE,
  FAMILY_GATHERING_SA1_SLUG,
  GREETINGS_DISPLAY_LIMIT,
  isValidEmail,
  newFamilyGatheringToken,
} from './_lib/familyGathering.js';
import { sendFamilyGatheringHostEmail } from './_lib/familyGatheringMail.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

type Db = NonNullable<ReturnType<typeof serviceClient>>;

type InstanceRow = {
  id: string;
  slug: string;
  family_name_ar: string;
  title_ar: string;
  welcome_ar: string;
  event_date_ar: string;
  event_time_ar: string;
  place_ar: string;
};

type GreetingRow = {
  id: string;
  name_ar: string;
  message_ar: string;
  created_at: string;
  is_hidden?: boolean;
};

type HostRow = {
  id: string;
  host_token: string;
  email: string | null;
  label_ar: string;
  created_at: string;
  instance_id: string;
};

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return Response.json(body, { status, headers });
}

function serviceClient() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

function readBearer(request: Request): string {
  const authHeader = request.headers.get('authorization')?.trim() || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';
}

function publicOrigin(): string {
  for (const key of ['FAMILY_GATHERING_PUBLIC_ORIGIN', 'PUBLIC_SITE_ORIGIN', 'VITE_PUBLIC_APP_ORIGIN'] as const) {
    const v = (process.env[key] || '').trim().replace(/\/+$/, '');
    if (v) return v;
  }
  return 'https://community.nota-council.com';
}

function familyUrls(slug: string, hostToken?: string) {
  const origin = publicOrigin();
  const base = `${origin}/#/sa1`;
  return {
    sendUrl: slug === FAMILY_GATHERING_SA1_SLUG ? base : `${origin}/#/sa1`,
    screenUrl: slug === FAMILY_GATHERING_SA1_SLUG ? `${base}/screen` : `${base}/screen`,
    hostUrl: hostToken ? `${base}/host/${encodeURIComponent(hostToken)}` : '',
  };
}

function mapPublic(instance: InstanceRow, greetings: GreetingRow[]) {
  return {
    slug: instance.slug,
    familyNameAr: instance.family_name_ar,
    titleAr: instance.title_ar,
    welcomeAr: instance.welcome_ar,
    eventDateAr: instance.event_date_ar,
    eventTimeAr: instance.event_time_ar,
    placeAr: instance.place_ar,
    greetings: greetings.map((g) => ({
      id: g.id,
      nameAr: g.name_ar,
      messageAr: g.message_ar,
      createdAt: g.created_at,
    })),
  };
}

async function loadInstanceBySlug(db: Db, slug: string): Promise<InstanceRow | null> {
  const { data, error } = await db
    .from(FAMILY_GATHERING_INSTANCES_TABLE)
    .select('id, slug, family_name_ar, title_ar, welcome_ar, event_date_ar, event_time_ar, place_ar')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as InstanceRow;
}

async function loadGreetings(db: Db, instanceId: string, includeHidden: boolean): Promise<GreetingRow[]> {
  let q = db
    .from(FAMILY_GATHERING_GREETINGS_TABLE)
    .select('id, name_ar, message_ar, created_at, is_hidden')
    .eq('instance_id', instanceId)
    .order('created_at', { ascending: false })
    .limit(GREETINGS_DISPLAY_LIMIT);
  if (!includeHidden) q = q.eq('is_hidden', false);
  const { data } = await q;
  return (data || []) as GreetingRow[];
}

async function verifyAdmin(request: Request, db: Db): Promise<{ ok: true; email: string } | { ok: false; status: number; message: string }> {
  const token = readBearer(request);
  if (!token) return { ok: false, status: 401, message: 'يلزم تسجيل الدخول' };

  const { data: userData, error } = await db.auth.getUser(token);
  const user = userData?.user;
  if (error || !user?.email?.trim()) return { ok: false, status: 401, message: 'جلسة غير صالحة' };

  const email = user.email.trim().toLowerCase();
  if (isBootstrapAdminEmail(email)) return { ok: true, email };

  const { data: adminRow } = await db
    .from('platform_admin_roles')
    .select('is_active')
    .eq('email', email)
    .maybeSingle();
  if (adminRow && (adminRow as { is_active?: boolean }).is_active === true) {
    return { ok: true, email };
  }
  return { ok: false, status: 403, message: 'غير مصرح' };
}

async function ensureSa1(db: Db): Promise<InstanceRow> {
  const existing = await loadInstanceBySlug(db, FAMILY_GATHERING_SA1_SLUG);
  if (existing) return existing;

  const { data, error } = await db
    .from(FAMILY_GATHERING_INSTANCES_TABLE)
    .insert({
      slug: FAMILY_GATHERING_SA1_SLUG,
      family_name_ar: FAMILY_GATHERING_DEFAULTS.familyNameAr,
      title_ar: FAMILY_GATHERING_DEFAULTS.titleAr,
      welcome_ar: FAMILY_GATHERING_DEFAULTS.welcomeAr,
      event_date_ar: FAMILY_GATHERING_DEFAULTS.eventDateAr,
      event_time_ar: FAMILY_GATHERING_DEFAULTS.eventTimeAr,
      place_ar: FAMILY_GATHERING_DEFAULTS.placeAr,
    })
    .select('id, slug, family_name_ar, title_ar, welcome_ar, event_date_ar, event_time_ar, place_ar')
    .single();
  if (error || !data) throw new Error(error?.message || 'ensure_failed');
  return data as InstanceRow;
}

async function ensureOwnerHost(db: Db, instanceId: string): Promise<HostRow> {
  const { data: rows } = await db
    .from(FAMILY_GATHERING_HOSTS_TABLE)
    .select('id, host_token, email, label_ar, created_at, instance_id')
    .eq('instance_id', instanceId)
    .eq('label_ar', 'صاحب المنصة')
    .limit(1);
  const first = (rows || [])[0] as HostRow | undefined;
  if (first) return first;

  const hostToken = newFamilyGatheringToken();
  const { data, error } = await db
    .from(FAMILY_GATHERING_HOSTS_TABLE)
    .insert({
      instance_id: instanceId,
      host_token: hostToken,
      email: null,
      label_ar: 'صاحب المنصة',
    })
    .select('id, host_token, email, label_ar, created_at, instance_id')
    .single();
  if (error || !data) throw new Error(error?.message || 'owner_host_failed');
  return data as HostRow;
}

async function listHosts(db: Db, instanceId: string): Promise<HostRow[]> {
  const { data } = await db
    .from(FAMILY_GATHERING_HOSTS_TABLE)
    .select('id, host_token, email, label_ar, created_at, instance_id')
    .eq('instance_id', instanceId)
    .order('created_at', { ascending: true });
  return (data || []) as HostRow[];
}

export default async function handler(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  if (request.method === 'OPTIONS') return publicApiOptionsResponse(request, CORS_OPTS);

  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  if (request.method !== 'GET' && request.method !== 'POST') {
    return json({ ok: false, error: 'method_not_allowed' }, 405, headers);
  }

  const guard = runRegistrationRouteGuards(request, 'public-family-gathering');
  if (guard.ok === false) return json(guard.json, guard.status, headers);

  const db = serviceClient();
  if (!db) return json({ ok: false, error: 'service_unavailable' }, 503, headers);

  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const action = (url.searchParams.get('action') || 'get_public').trim();
      const secGuard = await runSecurityGuard(request, {
        sensitiveRoute: true,
        rateLimit: action === 'get_host' ? 40 : 60,
      });
      if (!secGuard.allowed) return secGuard.response;

      const slug = (url.searchParams.get('slug') || FAMILY_GATHERING_SA1_SLUG).trim() || FAMILY_GATHERING_SA1_SLUG;

      if (action === 'get_public') {
        const instance = await loadInstanceBySlug(db, slug);
        if (!instance) return json({ ok: false, error: 'not_found' }, 404, headers);
        const greetings = await loadGreetings(db, instance.id, false);
        return json({ ok: true, ...mapPublic(instance, greetings) }, 200, headers);
      }

      if (action === 'get_host') {
        const hostToken = (url.searchParams.get('host_token') || '').trim();
        if (hostToken.length < 16) return json({ ok: false, error: 'invalid_token' }, 400, headers);
        const { data: host } = await db
          .from(FAMILY_GATHERING_HOSTS_TABLE)
          .select('id, host_token, email, label_ar, created_at, instance_id')
          .eq('host_token', hostToken)
          .maybeSingle();
        if (!host) return json({ ok: false, error: 'not_found' }, 404, headers);
        const hostRow = host as HostRow;
        const { data: instance } = await db
          .from(FAMILY_GATHERING_INSTANCES_TABLE)
          .select('id, slug, family_name_ar, title_ar, welcome_ar, event_date_ar, event_time_ar, place_ar')
          .eq('id', hostRow.instance_id)
          .maybeSingle();
        if (!instance) return json({ ok: false, error: 'not_found' }, 404, headers);
        const inst = instance as InstanceRow;
        const greetings = await loadGreetings(db, inst.id, true);
        const urls = familyUrls(inst.slug, hostRow.host_token);
        return json(
          {
            ok: true,
            ...mapPublic(inst, greetings.filter((g) => !g.is_hidden)),
            allGreetings: greetings.map((g) => ({
              id: g.id,
              nameAr: g.name_ar,
              messageAr: g.message_ar,
              createdAt: g.created_at,
              isHidden: Boolean(g.is_hidden),
            })),
            sendUrl: urls.sendUrl,
            screenUrl: urls.screenUrl,
            hostUrl: urls.hostUrl,
            hostLabelAr: hostRow.label_ar,
          },
          200,
          headers,
        );
      }

      return json({ ok: false, error: 'unknown_action' }, 400, headers);
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action || '').trim();
    const secGuard = await runSecurityGuard(request, {
      sensitiveRoute: true,
      rateLimit: action === 'add_greeting' ? 12 : action.startsWith('admin_') ? 20 : 40,
    });
    if (!secGuard.allowed) return secGuard.response;

    if (action === 'add_greeting') {
      const slug = String(body.slug || FAMILY_GATHERING_SA1_SLUG).trim() || FAMILY_GATHERING_SA1_SLUG;
      const nameAr = clipGreetingName(body.nameAr ?? body.name);
      const messageAr = clipGreetingMessage(body.messageAr ?? body.message);
      if (!nameAr || !messageAr) {
        return json({ ok: false, error: 'incomplete' }, 400, headers);
      }
      const instance = await loadInstanceBySlug(db, slug);
      if (!instance) return json({ ok: false, error: 'not_found' }, 404, headers);
      const { data, error } = await db
        .from(FAMILY_GATHERING_GREETINGS_TABLE)
        .insert({
          instance_id: instance.id,
          name_ar: nameAr,
          message_ar: messageAr,
        })
        .select('id, name_ar, message_ar, created_at')
        .single();
      if (error || !data) return json({ ok: false, error: error?.message || 'insert_failed' }, 500, headers);
      const row = data as GreetingRow;
      return json(
        {
          ok: true,
          greeting: {
            id: row.id,
            nameAr: row.name_ar,
            messageAr: row.message_ar,
            createdAt: row.created_at,
          },
        },
        200,
        headers,
      );
    }

    if (action === 'save_host') {
      const hostToken = String(body.host_token || body.hostToken || '').trim();
      if (hostToken.length < 16) return json({ ok: false, error: 'invalid_token' }, 400, headers);
      const { data: host } = await db
        .from(FAMILY_GATHERING_HOSTS_TABLE)
        .select('id, instance_id')
        .eq('host_token', hostToken)
        .maybeSingle();
      if (!host) return json({ ok: false, error: 'not_found' }, 404, headers);

      const patch: Record<string, string> = { updated_at: new Date().toISOString() };
      if (typeof body.titleAr === 'string') patch.title_ar = String(body.titleAr).trim().slice(0, 120);
      if (typeof body.welcomeAr === 'string') patch.welcome_ar = String(body.welcomeAr).trim().slice(0, 800);
      if (typeof body.familyNameAr === 'string') patch.family_name_ar = String(body.familyNameAr).trim().slice(0, 80);
      if (typeof body.eventDateAr === 'string') patch.event_date_ar = String(body.eventDateAr).trim().slice(0, 120);
      if (typeof body.eventTimeAr === 'string') patch.event_time_ar = String(body.eventTimeAr).trim().slice(0, 120);
      if (typeof body.placeAr === 'string') patch.place_ar = String(body.placeAr).trim().slice(0, 120);

      const { error } = await db
        .from(FAMILY_GATHERING_INSTANCES_TABLE)
        .update(patch)
        .eq('id', (host as { instance_id: string }).instance_id);
      if (error) return json({ ok: false, error: error.message }, 500, headers);
      return json({ ok: true }, 200, headers);
    }

    if (action === 'hide_greeting') {
      const hostToken = String(body.host_token || body.hostToken || '').trim();
      const greetingId = String(body.greetingId || body.greeting_id || '').trim();
      const hidden = body.hidden !== false;
      if (hostToken.length < 16 || !greetingId) {
        return json({ ok: false, error: 'invalid' }, 400, headers);
      }
      const { data: host } = await db
        .from(FAMILY_GATHERING_HOSTS_TABLE)
        .select('instance_id')
        .eq('host_token', hostToken)
        .maybeSingle();
      if (!host) return json({ ok: false, error: 'not_found' }, 404, headers);
      const { error } = await db
        .from(FAMILY_GATHERING_GREETINGS_TABLE)
        .update({ is_hidden: hidden })
        .eq('id', greetingId)
        .eq('instance_id', (host as { instance_id: string }).instance_id);
      if (error) return json({ ok: false, error: error.message }, 500, headers);
      return json({ ok: true }, 200, headers);
    }

    if (action === 'admin_ensure') {
      const admin = await verifyAdmin(request, db);
      if (!admin.ok) return json({ ok: false, error: admin.message }, admin.status, headers);
      const instance = await ensureSa1(db);
      const owner = await ensureOwnerHost(db, instance.id);
      const hosts = await listHosts(db, instance.id);
      const urls = familyUrls(instance.slug, owner.host_token);
      return json(
        {
          ok: true,
          ...mapPublic(instance, []),
          sendUrl: urls.sendUrl,
          screenUrl: urls.screenUrl,
          ownerHostUrl: urls.hostUrl,
          hosts: hosts.map((h) => ({
            id: h.id,
            email: h.email || '',
            labelAr: h.label_ar,
            hostUrl: familyUrls(instance.slug, h.host_token).hostUrl,
            createdAt: h.created_at,
          })),
        },
        200,
        headers,
      );
    }

    if (action === 'admin_mint_host') {
      const admin = await verifyAdmin(request, db);
      if (!admin.ok) return json({ ok: false, error: admin.message }, admin.status, headers);
      const email = clipEmail(body.email);
      if (!isValidEmail(email)) return json({ ok: false, error: 'invalid_email' }, 400, headers);

      const instance = await ensureSa1(db);
      await ensureOwnerHost(db, instance.id);
      const hostToken = newFamilyGatheringToken();
      const labelAr = String(body.labelAr || 'منظم التجمع').trim().slice(0, 80) || 'منظم التجمع';
      const { data: host, error } = await db
        .from(FAMILY_GATHERING_HOSTS_TABLE)
        .insert({
          instance_id: instance.id,
          host_token: hostToken,
          email,
          label_ar: labelAr,
        })
        .select('id, host_token, email, label_ar, created_at')
        .single();
      if (error || !host) return json({ ok: false, error: error?.message || 'mint_failed' }, 500, headers);

      const urls = familyUrls(instance.slug, (host as HostRow).host_token);
      const mailed = await sendFamilyGatheringHostEmail({
        to: email,
        hostUrl: urls.hostUrl,
        sendUrl: urls.sendUrl,
        screenUrl: urls.screenUrl,
        familyNameAr: instance.family_name_ar,
      });

      return json(
        {
          ok: true,
          mailed,
          host: {
            id: (host as HostRow).id,
            email,
            labelAr,
            hostUrl: urls.hostUrl,
            createdAt: (host as HostRow).created_at,
          },
        },
        200,
        headers,
      );
    }

    return json({ ok: false, error: 'unknown_action' }, 400, headers);
  } catch (err) {
    console.error('[family-gathering]', err);
    return json({ ok: false, error: 'server_error' }, 500, headers);
  }
}
