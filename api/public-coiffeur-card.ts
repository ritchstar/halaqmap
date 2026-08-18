/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * GET /c/:token → معاينة واتساب/سوشال (og:image) ثم تحويل المستعلمة إلى بطاقة كوافير ماب.
 * الاسم والصفة داخل الرمز فقط — لا تخزين على الخادم.
 */
import {
  decodeCoiffeurCardToken,
} from './_lib/coiffeurCardShare.js';

export const config = { maxDuration: 8 };

const SATELLITE = 'https://coiffeur.halaqmap.com';
const BRAND_AR = 'كوافير ماب';
const TAGLINE = 'استعلمي من موقعك — مجاناً وبلا تطبيق';
const OG_IMAGE = `${SATELLITE}/images/coiffeur/card-og.png`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function htmlPage(input: {
  title: string;
  description: string;
  canonical: string;
  nextHref: string;
}): Response {
  const title = escapeHtml(input.title);
  const description = escapeHtml(input.description);
  const canonical = escapeHtml(input.canonical);
  const nextHref = escapeHtml(input.nextHref);
  const body = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<meta name="robots" content="noindex, nofollow" />
<meta name="description" content="${description}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${escapeHtml(BRAND_AR)}" />
<meta property="og:locale" content="ar_SA" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${escapeHtml(OG_IMAGE)}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${escapeHtml(BRAND_AR)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${escapeHtml(OG_IMAGE)}" />
<meta http-equiv="refresh" content="0;url=${nextHref}" />
<style>
  html,body{margin:0;min-height:100vh;background:#14080e;color:#f7efe8;font-family:Tahoma,Arial,sans-serif}
  a{color:#f4d4c0;font-weight:800}
  .wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center}
</style>
</head>
<body>
<div class="wrap"><p><a href="${nextHref}">${escapeHtml(BRAND_AR)}</a></p></div>
<script>
(function(){try{location.replace(${JSON.stringify(input.nextHref)});}catch(e){}})();
</script>
</body>
</html>`;
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const token = String(url.searchParams.get('c') || '').trim();
  const decoded = decodeCoiffeurCardToken(token);
  const canonical = decoded ? `${SATELLITE}/c/${token}` : `${SATELLITE}/#/coiffeur`;
  const nextHref = decoded
    ? `${SATELLITE}/#/coiffeur/card?c=${encodeURIComponent(token)}`
    : `${SATELLITE}/#/coiffeur`;
  const title = decoded ? `${decoded.name} · ${decoded.role}` : BRAND_AR;
  return htmlPage({
    title,
    description: TAGLINE,
    canonical,
    nextHref,
  });
}
