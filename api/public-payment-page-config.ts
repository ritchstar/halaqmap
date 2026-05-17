import { normalizeSupabaseUrl, isLikelyHttpUrl } from './_lib/supabaseUrl.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 15,
};

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

type Row = {
  preferred_gateway?: string;
  display_payment_mode?: string;
  enable_moyasar_card?: boolean;
  enable_sab_gateway?: boolean;
  enable_bank_transfer_semiannual?: boolean;
  bank_display_name_ar?: string;
  bank_beneficiary_name?: string;
  bank_iban?: string;
};

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

/** حقول آمنة للواجهة العامة (صفحة الدفع) — بدون أسرار. */
export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return Response.json(
      {
        ok: false,
        error: 'server_not_configured',
        hint: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.',
      },
      { status: 503, headers },
    );
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });

  const { data, error } = await supabase.from('platform_payment_settings').select('*').eq('id', 1).maybeSingle();

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500, headers });
  }

  const row = (data || {}) as Row;
  const preferredGateway = String(row.preferred_gateway || 'MOYASAR').toUpperCase() === 'SAB' ? 'SAB' : 'MOYASAR';

  return Response.json(
    {
      ok: true,
      preferredGateway,
      displayPaymentMode: String(row.display_payment_mode || 'test').toLowerCase() === 'live' ? 'live' : 'test',
      enableMoyasarCard: row.enable_moyasar_card !== false,
      enableSabGateway: row.enable_sab_gateway === true,
    },
    { headers },
  );
}
