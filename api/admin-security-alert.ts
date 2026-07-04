/**
 * admin-security-alert — تنبيه بريدي فوري عند تسجيل تهديد حقيقي
 *
 * يُستدعى من useCyberThreatRecorder عند إغلاق جلسة تهديد حقيقية.
 * يُرسَل بريد للمؤسس عبر Resend.
 */

import { resolveResendFromAddress, readResendFromEmailEnv } from './_lib/resendFrom.js';

export const config = { maxDuration: 20 };

function siteUrl(): string {
  return ((process.env.VITE_SITE_ORIGIN || process.env.PUBLIC_SITE_ORIGIN || '').trim() || 'https://www.halaqmap.com').replace(/\/+$/, '');
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request): Promise<Response> {
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmailRaw = readResendFromEmailEnv() || 'noreply@halaqmap.com';
  const fromEmail = resolveResendFromAddress(fromEmailRaw);
  const adminEmail = (process.env.FOUNDER_ALERT_EMAIL || process.env.ADMIN_EMAIL || 'admin@halaqmap.com').trim();

  if (!resendKey) return json({ ok: false, reason: 'RESEND_API_KEY not configured' });

  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  // التحقق من البيانات
  const title      = String(body.title || 'تهديد سيبراني').trim();
  const subtitle   = String(body.subtitle || '').trim();
  const threats    = Number(body.totalThreats ?? 0);
  const duration   = Number(body.durationMs ?? 0);
  const peakSeverity = String(body.peakSeverity || 'warning');
  const reportBody = String(body.prosecutorReport || '');
  const sessionId  = String(body.sessionId || '');

  const durSec = Math.round(duration / 1000);
  const siteBase = siteUrl();
  const cyberOpsUrl = `${siteBase}/#/admin/cyber`;

  const severityColor = peakSeverity === 'critical' ? '#ef4444' : peakSeverity === 'elevated' ? '#f59e0b' : '#3b82f6';
  const severityLabel = peakSeverity === 'critical' ? '🚨 حرج' : peakSeverity === 'elevated' ? '⚠️ مرتفع' : '🔵 متوسط';

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><title>تنبيه أمني — حلاق ماب</title></head>
<body style="margin:0;padding:0;background:#0a0010;font-family:system-ui,sans-serif;color:#e2e8f0">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:24px">
    <tr><td>
      <!-- Header -->
      <div style="border-radius:12px;background:#0f0020;border:1px solid ${severityColor}44;padding:24px;margin-bottom:16px">
        <div style="font-size:10px;font-weight:900;letter-spacing:.2em;color:${severityColor}99;text-transform:uppercase;margin-bottom:8px">
          🔴 DVR تنبيه غرفة العمليات السيبرانية
        </div>
        <h1 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#fff">${title}</h1>
        <p style="margin:0;font-size:13px;color:#94a3b8">${subtitle}</p>
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">
        <div style="background:#1e0030;border-radius:10px;padding:16px;text-align:center;border:1px solid #ffffff11">
          <div style="font-size:28px;font-weight:900;color:${severityColor}">${threats}</div>
          <div style="font-size:11px;color:#64748b">تهديد مسجَّل</div>
        </div>
        <div style="background:#1e0030;border-radius:10px;padding:16px;text-align:center;border:1px solid #ffffff11">
          <div style="font-size:28px;font-weight:900;color:#7c3aed">${durSec}ث</div>
          <div style="font-size:11px;color:#64748b">مدة الجلسة</div>
        </div>
        <div style="background:#1e0030;border-radius:10px;padding:16px;text-align:center;border:1px solid ${severityColor}44">
          <div style="font-size:16px;font-weight:900;color:${severityColor}">${severityLabel}</div>
          <div style="font-size:11px;color:#64748b">مستوى الخطورة</div>
        </div>
      </div>

      <!-- Report -->
      ${reportBody ? `
      <div style="background:#0a0018;border-radius:10px;padding:16px;margin-bottom:16px;border:1px solid #ffffff0a">
        <div style="font-size:11px;font-weight:900;color:#f59e0b88;margin-bottom:8px">تقرير المدعي العام الرقمي</div>
        <pre style="margin:0;white-space:pre-wrap;font-size:12px;color:#cbd5e1;font-family:monospace;line-height:1.6">${reportBody.slice(0, 800)}</pre>
      </div>
      ` : ''}

      <!-- CTA -->
      <div style="text-align:center;padding:16px">
        <a href="${cyberOpsUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;padding:14px 28px;border-radius:12px;font-weight:900;font-size:14px;text-decoration:none">
          ▶ فتح غرفة العمليات وإعادة التشغيل
        </a>
      </div>

      <p style="text-align:center;font-size:10px;color:#334155;margin-top:16px">
        حلاق ماب · غرفة العمليات السيبرانية · جلسة ${sessionId}
      </p>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        subject: `🚨 تنبيه أمني: ${title} — ${threats} تهديد`,
        html,
      }),
    });

    const resendJson = (await resp.json().catch(() => ({}))) as { id?: string };
    const data = resendJson.id ? { id: resendJson.id } : {};
    return json({ ok: resp.ok, ...data });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : 'send_failed' }, 500);
  }
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' },
  });
}
