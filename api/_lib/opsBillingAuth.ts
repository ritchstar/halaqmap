import { createClient } from '@supabase/supabase-js';
import {
  verifyPlatformAdminFromRequest,
  verifyPlatformAdminFromRequestAny,
} from './adminManageBarbersAuth.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './supabaseUrl.js';
import type { OpsBillingSupabase } from './opsBillingSync.js';

export async function getServiceSupabase(): Promise<
  | { ok: true; supabase: OpsBillingSupabase; url: string }
  | { ok: false; status: number; body: Record<string, unknown> }
> {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return {
      ok: false,
      status: 503,
      body: { error: 'Server not configured', hint: 'SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required' },
    };
  }
  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as OpsBillingSupabase;
  return { ok: true, supabase, url };
}

function bearerFromHeader(h: string | null): string | null {
  const v = h?.trim() || '';
  if (!v.startsWith('Bearer ')) return null;
  const t = v.slice('Bearer '.length).trim();
  return t.length > 0 ? t : null;
}

function isCronSecretToken(token: string): boolean {
  const t = token.trim();
  const candidates = [process.env.CRON_SECRET, process.env.OPS_BILLING_CRON_SECRET]
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter((s) => s.length > 0);
  return candidates.some((c) => c === t);
}

export function isCronAuthorized(request: Request): boolean {
  const fromAuth = bearerFromHeader(request.headers.get('authorization'));
  if (fromAuth && isCronSecretToken(fromAuth)) return true;
  const fromX = bearerFromHeader(request.headers.get('x-ops-billing-cron-authorization'));
  if (fromX && isCronSecretToken(fromX)) return true;
  return false;
}

export async function authorizeOpsBillingRead(
  request: Request,
): Promise<
  | { ok: true; supabase: OpsBillingSupabase; actorEmail: string | null }
  | { ok: false; status: number; json: Record<string, unknown> }
> {
  const base = await getServiceSupabase();
  if (base.ok === false) return { ok: false, status: base.status, json: base.body };

  if (isCronAuthorized(request)) {
    return { ok: true, supabase: base.supabase, actorEmail: null };
  }

  const gate = await verifyPlatformAdminFromRequestAny(request, base.url, process.env.SUPABASE_SERVICE_ROLE_KEY || '', [
    'view_ops_billing_monitor',
    'manage_centralized_billing_ops',
  ]);
  if (gate.ok === false) {
    return { ok: false, status: gate.status, json: gate.json };
  }
  return { ok: true, supabase: gate.supabase as OpsBillingSupabase, actorEmail: gate.actorEmail };
}

export async function authorizeOpsBillingWrite(
  request: Request,
): Promise<
  | { ok: true; supabase: OpsBillingSupabase; actorEmail: string | null }
  | { ok: false; status: number; json: Record<string, unknown> }
> {
  const base = await getServiceSupabase();
  if (base.ok === false) return { ok: false, status: base.status, json: base.body };

  if (isCronAuthorized(request)) {
    return { ok: true, supabase: base.supabase, actorEmail: null };
  }

  const gate = await verifyPlatformAdminFromRequest(
    request,
    base.url,
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    'manage_centralized_billing_ops',
  );
  if (gate.ok === false) {
    return { ok: false, status: gate.status, json: gate.json };
  }
  return { ok: true, supabase: gate.supabase as OpsBillingSupabase, actorEmail: gate.actorEmail };
}
