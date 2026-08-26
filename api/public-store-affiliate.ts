/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دخول المسوّق برابط سري، وقراءة دفتر العمولة. لا كاردي8.
 */
import { createHash, randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import { storeAffiliateCheckoutLinks } from './_lib/storeAffiliateCode.js';
import { issueStoreAffiliateMagic } from './_lib/storeAffiliateMagic.js';
import {
  isStoreProductTrialKey,
  requestStoreProductTrial,
  STORE_PRODUCT_TRIAL_QUOTA,
  STORE_PRODUCT_TRIAL_TABLE,
} from './_lib/storeProductTrial.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

type Db = NonNullable<ReturnType<typeof serviceClient>>;

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

function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) && raw.length <= 180;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function newSecret(): string {
  return randomBytes(32).toString('base64url');
}

function newAffiliateCode(): string {
  const raw = randomBytes(8)
    .toString('base64url')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return `${raw}aaaaaaa`.slice(0, 8);
}

function clip(raw: unknown, max: number): string {
  return String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function bearerToken(request: Request): string {
  const raw = request.headers.get('authorization') || '';
  return raw.replace(/^Bearer\s+/i, '').trim();
}

async function findSession(db: Db, sessionToken: string) {
  const hash = sha256(sessionToken);
  const { data } = await db
    .from('store_affiliate_sessions')
    .select('id, marketer_id, expires_at')
    .eq('token_hash', hash)
    .maybeSingle();
  if (!data || new Date(String(data.expires_at)).getTime() <= Date.now()) return null;
  return data;
}

async function publicMarketer(db: Db, marketerId: string) {
  const { data: marketer } = await db
    .from('store_affiliate_marketers')
    .select('email, display_name, code, status')
    .eq('id', marketerId)
    .maybeSingle();
  if (!marketer || String(marketer.status) !== 'approved') return null;
  const { data: rows } = await db
    .from('store_affiliate_ledger')
    .select('id, product_tag, line_id, price_halalas, commission_halalas, net_halalas, created_at')
    .eq('marketer_id', marketerId)
    .order('created_at', { ascending: false })
    .limit(80);
  const ledger = rows || [];
  const commissionSar = ledger.reduce((sum, row) => sum + Number(row.commission_halalas || 0), 0) / 100;
  return {
    email: marketer.email,
    displayName: marketer.display_name,
    code: marketer.code,
    commissionSar,
    links: storeAffiliateCheckoutLinks(marketer.code),
    ledger: ledger.map((row) => ({
      id: row.id,
      productTag: row.product_tag,
      lineId: row.line_id,
      priceSar: Number(row.price_halalas) / 100,
      commissionSar: Number(row.commission_halalas) / 100,
      netSar: Number(row.net_halalas) / 100,
      at: row.created_at,
    })),
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  return json({ ok: true, route: 'public-store-affiliate' }, 200, headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'public-store-affiliate');
  if (guard.ok === false) return json(guard.json, guard.status, headers);
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 6 });
  if (!secGuard.allowed) return secGuard.response;
  const db = serviceClient();
  if (!db) return json({ error: 'Server not configured' }, 503, headers);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, headers);
  }
  const action = String(body.action || '').trim();
  if (action === 'apply') return applyMarketer(db, body, headers);
  if (action === 'send_magic') return sendMagic(db, body, headers, request);
  if (action === 'redeem_magic') return redeemMagic(db, body, headers);
  if (action === 'me') return readMe(db, request, headers);
  if (action === 'logout') return logout(db, request, headers);
  if (action === 'request_trial') return requestTrial(db, body, headers, request);
  if (action === 'list_trials') return listTrials(db, request, headers);
  return json({ error: 'Unknown action' }, 400, headers);
}

async function applyMarketer(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const accepted = body.acceptedRules === true || body.acceptedRules === 'true';
  const email = clip(body.email, 180).toLowerCase();
  const displayName = clip(body.displayName, 80);
  const phone = clip(body.phone, 20);
  const city = clip(body.city, 120);
  const channelPlan = clip(body.channelPlan, 400);
  const experience = clip(body.experience, 600);
  if (!accepted) return json({ error: 'يجب الموافقة على وثيقة القواعد.' }, 400, headers);
  if (!isEmail(email)) return json({ error: 'أدخل إيميلاً صالحاً.' }, 400, headers);
  if (displayName.length < 2) return json({ error: 'الاسم الظاهر مطلوب.' }, 400, headers);
  if (phone.length < 9) return json({ error: 'أدخل رقم جوال صالحاً.' }, 400, headers);
  if (city.length < 3) return json({ error: 'اكتب المدينة أو النطاق الذي ستسوّق فيه.' }, 400, headers);
  if (channelPlan.length < 12) return json({ error: 'اشرح كيف ستسوّق منتجات المتجر.' }, 400, headers);
  if (experience.length < 20) return json({ error: 'اشرح خبرتك أو استعدادك بجملة أوضح.' }, 400, headers);

  const { data: existing } = await db
    .from('store_affiliate_marketers')
    .select('id, status')
    .ilike('email', email)
    .maybeSingle();

  if (existing) {
    if (String(existing.status) === 'approved') {
      return json({ ok: true, status: 'approved' }, 200, headers);
    }
    const { error } = await db
      .from('store_affiliate_marketers')
      .update({
        display_name: displayName,
        phone,
        city,
        channel_plan: channelPlan,
        experience,
        status: 'pending_review',
        review_note: '',
        reviewed_at: null,
        reviewed_by: '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) return json({ error: 'تعذر حفظ الطلب.' }, 500, headers);
    return json({ ok: true, status: 'pending_review' }, 200, headers);
  }

  let code = newAffiliateCode();
  for (let i = 0; i < 6; i += 1) {
    const inserted = await db
      .from('store_affiliate_marketers')
      .insert({
        email,
        display_name: displayName,
        phone,
        city,
        channel_plan: channelPlan,
        experience,
        code,
        status: 'pending_review',
      })
      .select('id')
      .maybeSingle();
    if (!inserted.error && inserted.data) {
      return json({ ok: true, status: 'pending_review' }, 200, headers);
    }
    code = newAffiliateCode();
  }
  return json({ error: 'تعذر حفظ الطلب.' }, 500, headers);
}

async function sendMagic(db: Db, body: Record<string, unknown>, headers: Record<string, string>, request: Request) {
  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const sent = { ok: true, sent: true };
  if (!isEmail(email)) return json(sent, 200, headers);

  const { data: marketer } = await db
    .from('store_affiliate_marketers')
    .select('id, status, code')
    .ilike('email', email)
    .maybeSingle();
  if (!marketer || String(marketer.status) !== 'approved') return json(sent, 200, headers);
  await issueStoreAffiliateMagic({
    db,
    request,
    marketerId: String(marketer.id),
    email,
    code: String(marketer.code || ''),
  });
  return json(sent, 200, headers);
}

async function redeemMagic(db: Db, body: Record<string, unknown>, headers: Record<string, string>) {
  const token = String(body.token || '').trim();
  if (!token) return json({ error: 'الرابط غير صالح' }, 400, headers);
  const { data: row } = await db
    .from('store_affiliate_magic_links')
    .select('id, marketer_id, expires_at, used_at')
    .eq('token_hash', sha256(token))
    .maybeSingle();
  if (!row || row.used_at || new Date(String(row.expires_at)).getTime() <= Date.now()) {
    return json({ error: 'الرابط منتهٍ أو مستهلك' }, 400, headers);
  }
  const { data: marketer } = await db
    .from('store_affiliate_marketers')
    .select('status')
    .eq('id', row.marketer_id)
    .maybeSingle();
  if (!marketer || String(marketer.status) !== 'approved') {
    return json({ error: 'يلزم موافقة الإدارة أولاً' }, 403, headers);
  }
  const sessionToken = newSecret();
  const { error: sessionErr } = await db.from('store_affiliate_sessions').insert({
    marketer_id: row.marketer_id,
    token_hash: sha256(sessionToken),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
  if (sessionErr) return json({ error: 'تعذر فتح الجلسة' }, 500, headers);
  await db
    .from('store_affiliate_magic_links')
    .update({ used_at: new Date().toISOString() })
    .eq('id', row.id)
    .is('used_at', null);
  const profile = await publicMarketer(db, row.marketer_id);
  if (!profile) return json({ error: 'تعذر فتح اللوحة' }, 404, headers);
  return json({ ok: true, sessionToken, marketer: profile }, 200, headers);
}

async function readMe(db: Db, request: Request, headers: Record<string, string>) {
  const session = await findSession(db, bearerToken(request));
  if (!session) return json({ error: 'يلزم رابط دخول جديد' }, 401, headers);
  const profile = await publicMarketer(db, session.marketer_id);
  if (!profile) return json({ error: 'يلزم رابط دخول جديد' }, 401, headers);
  return json({ ok: true, marketer: profile }, 200, headers);
}

async function logout(db: Db, request: Request, headers: Record<string, string>) {
  const token = bearerToken(request);
  if (token) {
    await db.from('store_affiliate_sessions').delete().eq('token_hash', sha256(token));
  }
  return json({ ok: true }, 200, headers);
}

async function requestTrial(
  db: Db,
  body: Record<string, unknown>,
  headers: Record<string, string>,
  request: Request,
) {
  const session = await findSession(db, bearerToken(request));
  if (!session) return json({ error: 'يلزم رابط دخول جديد' }, 401, headers);
  const { data: marketer } = await db
    .from('store_affiliate_marketers')
    .select('id, display_name, status')
    .eq('id', session.marketer_id)
    .maybeSingle();
  if (!marketer || String(marketer.status) !== 'approved') {
    return json({ error: 'يلزم موافقة الإدارة أولاً' }, 403, headers);
  }
  const productKey = body.productKey;
  if (!isStoreProductTrialKey(productKey)) {
    return json({ error: 'حدّد المنتج.' }, 400, headers);
  }
  const result = await requestStoreProductTrial(db, {
    productKey,
    email: String(body.email || ''),
    marketerId: String(marketer.id),
    marketerLabel: String(marketer.display_name || 'مسوّق'),
  });
  if (!result.ok) return json({ error: result.error }, 400, headers);
  return json({ ok: true, trialId: result.trialId }, 200, headers);
}

async function listTrials(db: Db, request: Request, headers: Record<string, string>) {
  const session = await findSession(db, bearerToken(request));
  if (!session) return json({ error: 'يلزم رابط دخول جديد' }, 401, headers);
  const { data } = await db
    .from(STORE_PRODUCT_TRIAL_TABLE)
    .select(
      'id, product_key, beneficiary_email, status, issuer_kind, issued_by_label, first_opened_at, trial_ends_at, created_at',
    )
    .eq('marketer_id', session.marketer_id)
    .order('created_at', { ascending: false })
    .limit(80);
  const rows = data || [];
  const used: Record<string, number> = {};
  for (const row of rows) {
    if (String(row.status) === 'declined') continue;
    const key = String(row.product_key);
    used[key] = (used[key] || 0) + 1;
  }
  return json({ ok: true, quota: STORE_PRODUCT_TRIAL_QUOTA, used, rows }, 200, headers);
}
