/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسح دوري حقيقي (يومي) يُتلف محتوى طلبات أفراحي1/اجواء1 المدفوعة (غير
 * التجريبية) التي تجاوزت مدة تفعيلها (٩٠ يوماً)، بمعزل عن أي زيارة للرابط.
 * هذا هو التنفيذ الفعلي لوعد «تُحذف بيانات مناسبتكم تلقائياً وفق مدة
 * التفعيل» المذكور في نصوص تسويق المنتجين. راجع api/_lib/storeLiveRetention.ts
 * لتفاصيل ما يُتلف وما يبقى (سجل الدفع/الفاتورة يبقى لأغراض محاسبية).
 */
import { createClient } from '@supabase/supabase-js';
import { verifyVercelCronRequest } from './_lib/vercelCronAuth.js';
import { emitOpsEventFireAndForget } from './_lib/opsEventRouter.js';
import { sweepStoreLiveRetention } from './_lib/storeLiveRetention.js';

export const config = {
  maxDuration: 60,
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

  try {
    const result = await sweepStoreLiveRetention(supabase);
    if (result.failed > 0) {
      emitOpsEventFireAndForget({
        type: 'api.error',
        severity: 'watch',
        category: 'compliance',
        title: 'تعثّر جزئي في إتلاف بيانات أفراحي1/اجواء1 المنتهية',
        summary: `فشل ${result.failed} عملية إتلاف ضمن المسح الدوري (وُجّهت ${result.wedding} أفراحي1 و${result.event} اجواء1 بنجاح).`,
        clientId: 'STORE_LIVE_RETENTION',
        detail: { source: 'cron-store-live-retention', ...result },
        dedupeKey: 'store.live_retention_sweep_failed',
        dedupeHours: 6,
      });
    }
    return Response.json(
      {
        ok: true,
        route: 'cron-store-live-retention',
        weddingDeleted: result.wedding,
        eventDeleted: result.event,
        failed: result.failed,
        ranAtIso: new Date().toISOString(),
      },
      { headers },
    );
  } catch (err) {
    emitOpsEventFireAndForget({
      type: 'api.error',
      severity: 'urgent',
      category: 'compliance',
      title: 'فشل تشغيل مسح إتلاف بيانات أفراحي1/اجواء1',
      summary: String((err as Error)?.message || err || 'unknown error').slice(0, 400),
      clientId: 'STORE_LIVE_RETENTION',
      detail: { source: 'cron-store-live-retention' },
      dedupeKey: 'store.live_retention_sweep_crashed',
      dedupeHours: 1,
    });
    return Response.json({ error: 'Retention sweep failed' }, { status: 500, headers });
  }
}
