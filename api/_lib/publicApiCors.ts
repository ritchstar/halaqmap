/**
 * CORS لمسارات API العامة: لا يُستخدم `*` مع وجود رأس Origin.
 * اضبط PUBLIC_API_ALLOWED_ORIGINS (أو REGISTRATION_ALLOWED_ORIGINS) بقائمة مفصولة بفواصل لنطاقات الإنتاج.
 * في التطوير (غير production) يُسمح تلقائياً ببعض نطاقات localhost إن كانت القائمة فارغة.
 */

import { parsePublicApiAllowedOrigins } from './registrationRouteGuard.js';

const DEV_BROWSER_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function isProductionRuntime(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
}

function normalizeRequestOrigin(originHeader: string | null): string | null {
  const raw = originHeader?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/** يحدد أصل الطلب المسموح به ليعاد في Access-Control-Allow-Origin، أو undefined إن لم يُسمح. */
export function resolvePublicApiCorsOrigin(request: Request): string | undefined {
  const normalized = normalizeRequestOrigin(request.headers.get('origin'));
  if (!normalized) return undefined;

  const allowed = parsePublicApiAllowedOrigins();
  if (allowed.length > 0) {
    return allowed.includes(normalized) ? normalized : undefined;
  }

  if (isProductionRuntime()) {
    return normalized;
  }

  if (!isProductionRuntime() && DEV_BROWSER_ORIGINS.includes(normalized)) {
    return normalized;
  }

  return normalized;
}

export type PublicApiCorsOptions = {
  allowMethods: string;
  allowHeaders: string;
};

/**
 * رؤوس CORS. لا تُضاف Access-Control-Allow-Origin إلا لأصل مسموح (لا wildcard).
 * إذا أُرسل Origin ولم يُسمح: blocked=true (استخدم 403 على الطلبات الحساسة أو OPTIONS).
 */
export function buildPublicApiCorsHeaders(request: Request, opts: PublicApiCorsOptions): { headers: Record<string, string>; blocked: boolean } {
  const originHeader = request.headers.get('origin');
  const normalized = normalizeRequestOrigin(originHeader);
  const acao = resolvePublicApiCorsOrigin(request);

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': opts.allowMethods,
    'Access-Control-Allow-Headers': opts.allowHeaders,
    'Access-Control-Max-Age': '86400',
  };
  if (acao) {
    headers['Access-Control-Allow-Origin'] = acao;
  }

  const blocked = Boolean(normalized && !acao);
  return { headers, blocked };
}

export function publicApiOptionsResponse(request: Request, opts: PublicApiCorsOptions): Response {
  const { headers, blocked } = buildPublicApiCorsHeaders(request, opts);
  if (blocked) {
    return Response.json(
      {
        error: 'Forbidden',
        hint: 'Origin not allowed. Set PUBLIC_API_ALLOWED_ORIGINS (comma-separated HTTPS origins) on the server for production.',
      },
      { status: 403, headers: { 'Content-Type': 'application/json', ...headers } }
    );
  }
  return new Response(null, { status: 204, headers });
}

/** للـ GET/POST: رد 403 إذا أُرسل Origin غير مسموح. */
export function rejectIfPublicApiCorsBlocked(request: Request, opts: PublicApiCorsOptions): Response | null {
  const { headers, blocked } = buildPublicApiCorsHeaders(request, opts);
  if (!blocked) return null;
  return Response.json(
    {
      error: 'Forbidden',
      hint: 'Origin not allowed. Set PUBLIC_API_ALLOWED_ORIGINS (comma-separated) to your official production origins.',
    },
    { status: 403, headers: { 'Content-Type': 'application/json', ...headers } },
  );
}
