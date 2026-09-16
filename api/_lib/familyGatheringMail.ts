/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بريد تفويض مضيف تجمع عائلي — بلا علامة متجر خريطة الحل في النص.
 */
import { resolveResendFromAddress } from './resendFrom.js';

export async function sendFamilyGatheringHostEmail(input: {
  to: string;
  hostUrl: string;
  sendUrl: string;
  screenUrl: string;
  familyNameAr: string;
}): Promise<boolean> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = resolveResendFromAddress();
  if (!apiKey || !from) {
    console.error('[family-gathering-mail] resend_not_configured');
    return false;
  }

  const family = input.familyNameAr.trim() || 'التجمع العائلي';
  const subject = `رابط إدارة تجمع ${family}`;
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:24px;background:#fbf6ea;font-family:Tahoma,Arial,sans-serif;color:#1f2a23;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e7c767;border-radius:16px;padding:28px;">
    <p style="margin:0 0 8px;font-size:13px;color:#0e4b34;font-weight:700;">تجمع ${escapeHtml(family)}</p>
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.5;">رابط إدارة التجمع جاهز</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.8;">
      هذا رابطك الخاص لإدارة نص الترحيب ومراجعة التهاني على شاشة المجلس.
      لا تشارك رابط الإدارة مع من لا تحتاج أن يدير التجمع.
    </p>
    <p style="margin:0 0 28px;">
      <a href="${escapeAttr(input.hostUrl)}" style="display:inline-block;background:#0e4b34;color:#fbf6ea;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;">
        افتح لوحة الإدارة
      </a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#5c6d63;">روابط للعائلة (ليست للإدارة):</p>
    <p style="margin:0;font-size:13px;line-height:1.8;word-break:break-all;">
      إرسال تهنئة:<br/><a href="${escapeAttr(input.sendUrl)}">${escapeHtml(input.sendUrl)}</a><br/><br/>
      شاشة المجلس:<br/><a href="${escapeAttr(input.screenUrl)}">${escapeHtml(input.screenUrl)}</a>
    </p>
  </div>
</body></html>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject,
      html,
    }),
  });
  if (!resp.ok) {
    const detail = (await resp.text().catch(() => '')).slice(0, 280);
    console.error('[family-gathering-mail] resend_failed', resp.status, detail);
    return false;
  }
  return true;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, '&#39;');
}
