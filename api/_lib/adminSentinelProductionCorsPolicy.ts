import { parsePublicApiAllowedOrigins } from './registrationRouteGuard.js';

/** أصل الإنتاج الرسمي — يجب أن يبقى ضمن `PUBLIC_API_ALLOWED_ORIGINS` على Vercel Production. */
export const HALAQMAP_PRODUCTION_ORIGIN = 'https://halaqmap.com';

function parseStrictEnv(): 'unset' | 'on' | 'off' {
  const raw = (process.env.ADMIN_SENTINEL_PUBLIC_ORIGINS_STRICT ?? '').trim().toLowerCase();
  if (raw === '') return 'unset';
  if (raw === '0' || raw === 'false' || raw === 'no') return 'off';
  if (raw === '1' || raw === 'true' || raw === 'yes') return 'on';
  return 'unset';
}

/**
 * على Vercel فقط (`VERCEL_ENV === 'production'`): يفرض ضبط CORS عبر `process.env` على الخادم.
 *
 * - قائمة أصول فارغة → 403.
 * - يجب أن تتضمن القائمة `https://halaqmap.com`.
 * - **أكثر من نطاق في القائمة:** يُعامل تلقائياً كوضع غير صارم (مكافئ `ADMIN_SENTINEL_PUBLIC_ORIGINS_STRICT=0`):
 *   لا يُشترط عنصر واحد فقط؛ قبول Sentinel يتبع `PUBLIC_API_ALLOWED_ORIGINS` + طبقة CORS العامة.
 *   إن عُيّن صراحةً `ADMIN_SENTINEL_PUBLIC_ORIGINS_STRICT=1` مع عدة نطاقات → 403 (تعارض).
 * - **نطاق واحد فقط:** الوضع الصارم افتراضياً (`STRICT` غير معرّف = صارم): يجب أن يكون العنصر الوحيد هو `https://halaqmap.com`.
 *   للسماح بنطاق إنتاج واحد غير ذلك مع تعارض: عيّن `ADMIN_SENTINEL_PUBLIC_ORIGINS_STRICT=0`.
 */
export function rejectIfSentinelProductionPublicOriginsMisconfigured(): Response | null {
  if (process.env.VERCEL_ENV !== 'production') return null;

  const allowed = parsePublicApiAllowedOrigins();
  if (allowed.length === 0) {
    return Response.json(
      {
        error: 'Forbidden',
        hint:
          'Vercel Production: عيّن PUBLIC_API_ALLOWED_ORIGINS على الخادم (وفيه على الأقل https://halaqmap.com).',
      },
      { status: 403 },
    );
  }

  if (!allowed.includes(HALAQMAP_PRODUCTION_ORIGIN)) {
    return Response.json(
      {
        error: 'Forbidden',
        hint: `Vercel Production: PUBLIC_API_ALLOWED_ORIGINS يجب أن تتضمن بالضبط ${HALAQMAP_PRODUCTION_ORIGIN}.`,
      },
      { status: 403 },
    );
  }

  const multiOrigin = allowed.length > 1;
  const strictMode = parseStrictEnv();

  if (multiOrigin) {
    if (strictMode === 'on') {
      return Response.json(
        {
          error: 'Forbidden',
          hint:
            'PUBLIC_API_ALLOWED_ORIGINS يتضمن أكثر من نطاق — لا يُستخدم مع ADMIN_SENTINEL_PUBLIC_ORIGINS_STRICT=1. احذف المتغير أو عيّن ADMIN_SENTINEL_PUBLIC_ORIGINS_STRICT=0.',
        },
        { status: 403 },
      );
    }
    return null;
  }

  const strictSingle =
    strictMode === 'off' ? false : strictMode === 'on' ? true : true;

  if (!strictSingle) return null;

  if (allowed.length !== 1 || allowed[0] !== HALAQMAP_PRODUCTION_ORIGIN) {
    return Response.json(
      {
        error: 'Forbidden',
        hint: `Vercel Production (وضع صارم، قائمة مفردة): اجعل PUBLIC_API_ALLOWED_ORIGINS=${HALAQMAP_PRODUCTION_ORIGIN} فقط، أو عيّن ADMIN_SENTINEL_PUBLIC_ORIGINS_STRICT=0.`,
      },
      { status: 403 },
    );
  }

  return null;
}
