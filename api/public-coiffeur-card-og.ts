/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * GET /c/:token/og.jpg → صورة مربّعة لمعاينة واتساب بالاسم والصفة.
 */
import { renderCoiffeurCardOgJpeg } from './_lib/coiffeurCardOg.js';

export const config = { maxDuration: 12 };

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const token = String(url.searchParams.get('c') || '').trim();
  const jpeg = token ? await renderCoiffeurCardOgJpeg(token) : null;
  if (!jpeg) {
    return new Response('not_found', {
      status: 404,
      headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
    });
  }
  return new Response(jpeg, {
    status: 200,
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Disposition': 'inline; filename="coiffeur-card.jpg"',
    },
  });
}
