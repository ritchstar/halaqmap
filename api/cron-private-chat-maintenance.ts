import { createClient } from '@supabase/supabase-js';
import { verifyVercelCronRequest } from './_lib/vercelCronAuth.js';

export const config = {
  maxDuration: 30,
};

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  const gate = verifyVercelCronRequest(request);
  if (gate.ok === false) {
    return Response.json(gate.json, { status: gate.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc('run_private_chat_maintenance');
  if (error) {
    return Response.json({ error: error.message || 'Maintenance RPC failed' }, { status: 500, headers });
  }

  return Response.json(
    {
      ok: true,
      route: 'cron-private-chat-maintenance',
      expiredConversationsUpdated: Number(data ?? 0),
      ranAtIso: new Date().toISOString(),
    },
    { headers },
  );
}
