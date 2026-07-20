/**
 * إطلاق عامل اعتراض المناوب عبر HTTP فقط — بدون سحب رسم بياني للذكاء/الرخص
 * حتى يبقى مسار `/api/customer-private-chat` خفيفاً على Vercel.
 */

function resolveShiftWorkerBaseUrl(): string {
  const candidates = [
    (process.env.VERCEL_PROJECT_PRODUCTION_URL || '').trim(),
    (process.env.VITE_SITE_ORIGIN || '').trim(),
    (process.env.SITE_ORIGIN || '').trim(),
    (process.env.VERCEL_URL || '').trim(),
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    const host = raw.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (host) return `https://${host}`;
  }
  return '';
}

/** يُطلق اعتراضاً كاملاً في invocation منفصل — لا يُعطّل إرسال رسالة العميل. */
export function dispatchDigitalShiftInterceptWorker(conversationId: string): boolean {
  const id = conversationId.trim();
  if (!id) return false;

  const base = resolveShiftWorkerBaseUrl();
  const secret = (process.env.CRON_SECRET || '').trim();

  if (!base || !secret) {
    console.warn('[shift] intercept worker dispatch skipped — missing base URL or CRON_SECRET', {
      hasBase: Boolean(base),
      hasSecret: Boolean(secret),
    });
    return false;
  }

  void fetch(`${base}/api/customer-digital-shift-intercept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ conversationId: id, worker: true }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.error('[shift] intercept worker HTTP error', res.status, body.slice(0, 200));
      }
    })
    .catch((err) => {
      console.error('[shift] intercept worker dispatch failed', err);
    });
  return true;
}
