/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يمنع رجوع انحدار: الـ minifier كان يحذف `|| '/m/hm-desk…'` فيبقى
 * `path={undefined}` مع كاش route-paths قديم ويُسقط إقلاع المنصة.
 *
 * تشغيل: npx --yes tsx scripts/test-founder-desk-route-literals.mts
 * (يتطلب dist/ من `npx vite build`)
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST_ASSETS = join(process.cwd(), 'dist', 'assets');

function findChunk(prefix: string): string {
  const name = readdirSync(DIST_ASSETS).find((f) => f.startsWith(prefix) && f.endsWith('.js'));
  if (!name) throw new Error(`missing chunk ${prefix}* in dist/assets`);
  return join(DIST_ASSETS, name);
}

function main(): void {
  const app = readFileSync(findChunk('App-'), 'utf8');
  const banner = readFileSync(findChunk('FounderDeskBanner-'), 'utf8');
  const checks: Array<{ name: string; ok: boolean; detail: string }> = [
    {
      name: 'app_has_founder_landing_literal',
      ok: app.includes('/m/hm-desk-k7q3'),
      detail: 'App chunk must embed /m/hm-desk-k7q3 (not only ROUTE_PATHS.FOUNDER_DESK_LANDING)',
    },
    {
      name: 'app_has_visitor_chat_literal',
      ok: app.includes('/partners/live-chat'),
      detail: 'App chunk must embed /partners/live-chat',
    },
    {
      name: 'app_not_stripped_to_property_only',
      ok: !/FOUNDER_DESK_LANDING,X=n\.FOUNDER_DESK_VISITOR_CHAT/.test(app),
      detail: 'minifier must not collapse founder paths to property reads only',
    },
    {
      name: 'banner_has_visitor_chat_literal',
      ok: banner.includes('/partners/live-chat'),
      detail: 'FounderDeskBanner must embed /partners/live-chat',
    },
  ];

  let failed = 0;
  for (const c of checks) {
    const mark = c.ok ? 'OK' : 'FAIL';
    console.log(`${mark}  ${c.name}  ${c.detail}`);
    if (!c.ok) failed += 1;
  }
  if (failed > 0) {
    console.error(`founder_desk_route_literals_failed: ${failed}`);
    process.exit(1);
  }
  console.log('founder_desk_route_literals_ok');
}

main();
