import { getServerPaymentProvider, resolveServerPaymentGateway } from './_lib/payment-gateway';

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

type Body = {
  tier?: unknown;
  amountHalalas?: unknown;
  licenseQuantity?: unknown;
  barberName?: unknown;
  requestId?: unknown;
  linkedBarberId?: unknown;
};

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function GET(): Promise<Response> {
  return Response.json(
    {
      ok: true,
      gateway: resolveServerPaymentGateway(),
      message: 'Unified payment provider is active.',
    },
    { headers: corsHeaders() },
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400, headers: corsHeaders() });
  }

  const tier = String(body.tier || '').trim();
  const barberName = String(body.barberName || '').trim();
  const amountHalalas = Number(body.amountHalalas);
  const licenseQuantity = Math.min(
    12,
    Math.max(1, Math.trunc(Number(body.licenseQuantity) || 1)),
  );
  const requestId = String(body.requestId || '').trim();
  const linkedBarberId = String(body.linkedBarberId || '').trim();

  if (!tier || !barberName || !Number.isFinite(amountHalalas) || amountHalalas < 100) {
    return Response.json({ ok: false, error: 'invalid_payload' }, { status: 400, headers: corsHeaders() });
  }

  const provider = getServerPaymentProvider();
  const session = provider.createSessionPayload({
    tier,
    barberName,
    amountHalalas: Math.round(amountHalalas),
    licenseQuantity,
    requestId,
    linkedBarberId,
  });

  return Response.json(
    {
      ok: true,
      gateway: provider.code,
      session,
    },
    { headers: corsHeaders() },
  );
}

