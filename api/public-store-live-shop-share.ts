/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * GET /h/:token و /g/:token … → معاينة واتساب باسم النشاط ثم تحويل إلى الهاش.
 */
import {
  isShareCrawler,
  parseStoreLiveShopKind,
  parseStoreLiveShopToken,
  readStoreLiveShopMeta,
  storeLiveShopCopy,
  storeLiveShopHashHref,
  storeLiveShopShareHref,
  storeLiveShopShareHtml,
  type StoreLiveShopKind,
} from './_lib/storeLiveShopShare.js';

export const config = { maxDuration: 8 };

function fallbackCopy(kind: StoreLiveShopKind | null) {
  if (!kind) {
    return {
      title: 'صفحة نشاط — halaqmap',
      description: 'صفحة نشاط على خريطة الحل.',
      siteName: 'halaqmap',
    };
  }
  const copy = storeLiveShopCopy(kind, '');
  return { title: copy.title, description: copy.description, siteName: copy.siteName };
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const kind = parseStoreLiveShopKind(url.searchParams.get('kind'));
  const token = parseStoreLiveShopToken(url.searchParams.get('token'));
  const crawler = isShareCrawler(request);

  if (!kind || !token) {
    const fallback = fallbackCopy(kind);
    const nextHref = 'https://store.halaqmap.com/#/store';
    return new Response(
      storeLiveShopShareHtml({
        title: fallback.title,
        description: fallback.description,
        siteName: fallback.siteName,
        canonical: nextHref,
        nextHref,
        image: storeLiveShopCopy(kind || 'halana', '').image,
        refresh: !crawler,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=60, s-maxage=300',
          'Referrer-Policy': 'no-referrer',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      },
    );
  }

  const meta = await readStoreLiveShopMeta(kind, token);
  const copy = storeLiveShopCopy(kind, meta.shopName);
  const canonical = storeLiveShopShareHref(kind, token);
  const nextHref = storeLiveShopHashHref(kind, token);

  return new Response(
    storeLiveShopShareHtml({
      title: copy.title,
      description: copy.description,
      siteName: copy.siteName,
      canonical,
      nextHref: meta.live ? nextHref : 'https://store.halaqmap.com/#/store',
      image: copy.image,
      refresh: !crawler,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': meta.live ? 'public, max-age=60, s-maxage=300' : 'public, max-age=300, s-maxage=3600',
        'Referrer-Policy': 'no-referrer',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  );
}
