/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * GET /w/:token/guest و /e/:token/guest → كرت الدعوة لمعاينة واتساب،
 * ثم تحويل الزائر إلى الهاش دون استهلاك رابط الضيف.
 */
import { createClient } from '@supabase/supabase-js';
import { STORE_EVENT_LIVE_TABLE } from './_lib/storeEventLive.js';
import {
  parseStoreLiveInviteId,
  parseStoreLiveInviteKind,
  parseStoreLiveInviteToken,
  STORE_LIVE_INVITE_SITE_NAME,
  storeLiveInviteCardImage,
  storeLiveInviteCopy,
  storeLiveInviteHashHref,
  storeLiveInviteShareHref,
  type StoreLiveInviteKind,
} from './_lib/storeLiveInviteShare.js';
import { STORE_WEDDING_LIVE_TABLE } from './_lib/storeWeddingLive.js';

export const config = { maxDuration: 8 };

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
  const refresh = input.refresh ? `<meta http-equiv="refresh" content="0;url=${nextHref}" />` : '';
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
<meta property="og:site_name" content="${escapeHtml(STORE_LIVE_INVITE_SITE_NAME)}" />
<meta property="og:locale" content="ar_SA" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:type" content="image/png" />
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
      'Cache-Control': input.refresh ? 'public, max-age=30, s-maxage=60' : 'public, max-age=300, s-maxage=3600',
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

async function readLiveInviteMeta(
  kind: StoreLiveInviteKind,
  token: string,
): Promise<{ voice?: unknown; photoSrc?: unknown; hostName?: unknown; occasionTitle?: unknown }> {
  const db = serviceClient();
  if (!db) return {};
  const table = kind === 'wedding' ? STORE_WEDDING_LIVE_TABLE : STORE_EVENT_LIVE_TABLE;
  const select = 'status, payload';
  const lookup = async (column: 'guest_token' | 'host_token' | 'display_token') => {
    const { data } = await db.from(table).select(select).eq(column, token).eq('status', 'live').maybeSingle();
    return data;
  };
  const row = (await lookup('guest_token')) || (await lookup('host_token')) || (await lookup('display_token'));
  if (!row) return {};
  const payload = row.payload && typeof row.payload === 'object' ? (row.payload as Record<string, unknown>) : {};
  return {
    voice: payload.voice,
    photoSrc: payload.photoSrc,
    hostName: payload.hostName,
    occasionTitle: payload.occasionTitle,
  };
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const kind = parseStoreLiveInviteKind(url.searchParams.get('kind'));
  const token = parseStoreLiveInviteToken(url.searchParams.get('token'));
  const inviteId = parseStoreLiveInviteId(url.searchParams.get('invite'));
  const crawler = isShareCrawler(request);

  if (!kind || !token) {
    const fallback = 'https://store.halaqmap.com/#/store';
    return htmlPage({
      title: 'دعوتكم الخاصة — halaqmap',
      description: STORE_LIVE_INVITE_SITE_NAME,
      canonical: 'https://store.halaqmap.com/',
      nextHref: fallback,
      image: storeLiveInviteCardImage({ kind: 'wedding', token: 'lab' }),
      refresh: !crawler,
    });
  }

  const meta = await readLiveInviteMeta(kind, token);
  const copy = storeLiveInviteCopy({
    kind,
    hostName: meta.hostName,
    occasionTitle: meta.occasionTitle,
  });
  const image = storeLiveInviteCardImage({
    kind,
    token,
    voice: meta.voice,
    photoSrc: meta.photoSrc,
  });

  return htmlPage({
    title: copy.title,
    description: copy.description,
    canonical: storeLiveInviteShareHref(kind, token),
    nextHref: storeLiveInviteHashHref(kind, token, inviteId),
    image,
    refresh: !crawler,
  });
}
