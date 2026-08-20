/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * GET /oc/:token → معاينة واتساب بلا هاش ثم تحويل الزائر إلى البطاقة الحيّة.
 */
import { createClient } from '@supabase/supabase-js';
import {
  publicPaidView,
  STORE_ISSUED_CARDS_TABLE,
  type PaidInvitePayload,
} from './_lib/storeIssuedCards.js';

export const config = { maxDuration: 8 };

const STORE_ORIGIN = 'https://store.halaqmap.com';
const BRAND_AR = 'halaqmap · خريطة الحل';
const OG_IMAGE = `${STORE_ORIGIN}/images/halaqmap-store-mark-radar-square-1200x1200.png`;
const TOKEN_RE = /^[A-Za-z0-9_-]{16,64}$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isShareCrawler(request: Request): boolean {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  return /whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|slackbot|linkedinbot|discordbot|pinterest|googlebot/.test(
    ua,
  );
}

function htmlPage(input: {
  title: string;
  description: string;
  canonical: string;
  nextHref: string;
  image: string;
  refresh: boolean;
}): Response {
  const title = escapeHtml(input.title);
  const description = escapeHtml(input.description);
  const canonical = escapeHtml(input.canonical);
  const nextHref = escapeHtml(input.nextHref);
  const image = escapeHtml(input.image);
  const refresh = input.refresh
    ? `<meta http-equiv="refresh" content="0;url=${nextHref}" />`
    : '';
  const jump = input.refresh
    ? `<script>(function(){try{location.replace(${JSON.stringify(input.nextHref)});}catch(e){}})();</script>`
    : '';
  const body = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<meta name="robots" content="noindex, nofollow" />
<meta name="description" content="${description}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="${escapeHtml(BRAND_AR)}" />
<meta property="og:locale" content="ar_SA" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="1200" />
<meta property="og:image:alt" content="${title}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
${refresh}
<style>
  html,body{margin:0;min-height:100vh;background:#061018;color:#f4efe4;font-family:Tahoma,Arial,sans-serif}
  a{color:#e8c547;font-weight:800}
  .wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center}
</style>
</head>
<body>
<div class="wrap"><p><a href="${nextHref}">${title}</a></p></div>
${jump}
</body>
</html>`;
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': input.refresh ? 'public, max-age=60, s-maxage=300' : 'public, max-age=300, s-maxage=3600',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

function serviceClient() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const token = String(url.searchParams.get('token') || '').trim();
  const canonical = token ? `${STORE_ORIGIN}/oc/${encodeURIComponent(token)}` : `${STORE_ORIGIN}/#/store/invites`;
  const fallbackView = `${STORE_ORIGIN}/#/store/invites`;
  const crawler = isShareCrawler(request);

  if (!TOKEN_RE.test(token)) {
    return htmlPage({
      title: 'بطاقة مناسبة — halaqmap',
      description: 'بطاقة مناسبة قابلة للمشاركة عبر خريطة الحل.',
      canonical: `${STORE_ORIGIN}/#/store/invites`,
      nextHref: fallbackView,
      image: OG_IMAGE,
      refresh: !crawler,
    });
  }

  const db = serviceClient();
  let title = 'بطاقة مناسبة — halaqmap';
  let description = 'بطاقة مناسبة قابلة للمشاركة عبر خريطة الحل.';
  let nextHref = `${STORE_ORIGIN}/#/store/invites/v/${encodeURIComponent(token)}`;

  if (db) {
    const { data } = await db
      .from(STORE_ISSUED_CARDS_TABLE)
      .select('kind, status, template_id, price_halalas, payload')
      .eq('public_token', token)
      .maybeSingle();
    if (data?.kind === 'paid_invite' && data.status === 'live') {
      const card = publicPaidView(
        data.payload as PaidInvitePayload,
        String(data.template_id || ''),
        Number(data.price_halalas || 0),
      );
      const occasion = String(card.occasionLine || '').trim() || 'بطاقة مناسبة';
      const host = String(card.hostName || '').trim();
      title = host ? `${occasion} · ${host}` : occasion;
      const details = [card.whenText, card.placeText, card.message]
        .map((part) => String(part || '').trim())
        .filter(Boolean);
      description = details[0] || 'صُممت عبر halaqmap · خريطة الحل';
    } else {
      nextHref = fallbackView;
    }
  }

  return htmlPage({
    title,
    description,
    canonical,
    nextHref,
    image: OG_IMAGE,
    refresh: !crawler,
  });
}
