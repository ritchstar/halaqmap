/**
 * POST /api/admin-partner-prospects-scan
 * Vision OCR — extract barber shop name + WhatsApp/phone from screenshot(s).
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { scanPartnerProspectsFromImage } from './_lib/partnerProspectScan.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 60 };

const CORS_OPTS = {
  allowMethods: 'POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(data: unknown, status: number, request: Request): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      ...corsHeaders(request),
    },
  });
}

function getServiceEnv(): { url: string; serviceRole: string } | null {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) return null;
  return { url, serviceRole };
}

function estimateBase64Bytes(base64: string): number {
  const pad = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - pad;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) return json({ error: 'Server not configured' }, 503, request);

  const gate = await verifyPlatformAdminFromRequestAny(request, env.url, env.serviceRole, [
    'view_command_center',
    'manage_command_center',
  ]);
  if (gate.ok === false) return json(gate.json, gate.status, request);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, request);
  }

  const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : '';
  const imageMime = String(body.imageMime || body.mimeType || '').trim().toLowerCase();

  if (!imageBase64) return json({ error: 'ارفع صورة واحدة على الأقل' }, 400, request);
  if (estimateBase64Bytes(imageBase64) > MAX_IMAGE_BYTES) {
    return json({ error: 'حجم الصورة كبير — الحد 4MB' }, 400, request);
  }

  try {
    const leads = await scanPartnerProspectsFromImage(imageBase64, imageMime);
    return json({ ok: true, leads, count: leads.length }, 200, request);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'تعذّر تحليل الصورة';
    return json({ error: msg }, 502, request);
  }
}
