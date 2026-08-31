/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قيد مبيعات المتجر للإدارة — قراءة فقط من جداول الطلبات المسدّدة.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  STORE_SALES_LEDGER_PRODUCTS,
  STORE_SALES_TABLE,
  isStoreSalesLedgerProduct,
  mapStoreSalesRow,
  summarizeStoreSales,
  type StoreSalesLedgerProduct,
  type StoreSalesLedgerRow,
} from './_lib/storeSalesLedger.js';

export const config = { maxDuration: 20 };

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

const SELECT =
  'id, status, buyer_email, buyer_name, price_halalas, moyasar_payment_id, payload, created_at, is_trial';

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

async function loadProduct(
  supabase: SupabaseClient,
  product: StoreSalesLedgerProduct,
): Promise<StoreSalesLedgerRow[]> {
  const { data, error } = await supabase
    .from(STORE_SALES_TABLE[product])
    .select(SELECT)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return [];
  return (data || [])
    .map((row) => mapStoreSalesRow(product, row as Record<string, unknown>))
    .filter((row): row is StoreSalesLedgerRow => Boolean(row));
}

export async function GET(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'view_overview',
    'view_payments',
  ]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }
  const supabase = createClient(serverUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const asked = new URL(request.url).searchParams.get('product') || '';
  const products = isStoreSalesLedgerProduct(asked) ? [asked] : [...STORE_SALES_LEDGER_PRODUCTS];
  const byProduct: Record<string, StoreSalesLedgerRow[]> = {};
  for (const product of products) {
    byProduct[product] = await loadProduct(supabase, product);
  }
  const rows = isStoreSalesLedgerProduct(asked) ? byProduct[asked] || [] : [];
  const summaries = STORE_SALES_LEDGER_PRODUCTS.map((product) =>
    summarizeStoreSales(product, byProduct[product] || []),
  );
  return Response.json(
    {
      ok: true,
      product: isStoreSalesLedgerProduct(asked) ? asked : 'all',
      rows,
      summaries,
    },
    { headers },
  );
}
