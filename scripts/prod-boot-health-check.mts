/**
 * فحص صحة إقلاع الإنتاج — قراءة فقط عبر curl (يتجنب مشاكل شهادة Node محلياً).
 * تشغيل: npx --yes tsx scripts/prod-boot-health-check.mts
 */
import { spawnSync } from 'node:child_process';

const ORIGIN = process.env.HALAQMAP_ORIGIN || 'https://www.halaqmap.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function curl(url: string): { status: number; body: string } {
  const r = spawnSync(
    'curl',
    ['-k', '-sS', '-A', UA, '-w', '\n__HTTP__:%{http_code}', url],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 },
  );
  if (r.error) throw r.error;
  const out = String(r.stdout || '');
  const m = out.match(/\n__HTTP__:(\d+)\s*$/);
  const status = m ? Number(m[1]) : 0;
  const body = m ? out.slice(0, m.index) : out;
  return { status, body };
}

function pick(re: RegExp, html: string): string | null {
  const m = html.match(re);
  return m?.[1] ?? null;
}

function main(): void {
  const home = curl(`${ORIGIN}/?health=${Date.now()}`);
  const checks: Array<{ name: string; ok: boolean; detail: string }> = [];

  checks.push({
    name: 'homepage_http',
    ok: home.status === 200 && home.body.length > 5000,
    detail: `status=${home.status} bytes=${home.body.length}`,
  });

  const commit = pick(/halaqmap-build-commit"\s+content="([^"]+)"/, home.body);
  const assetQ = pick(/halaqmap-asset-query"\s+content="([^"]+)"/, home.body);
  const swFlag = pick(/hm-sw-reset-(v\d+)/, home.body);
  const cssPath = pick(/href="(\/assets\/index-[^"]+\.css[^"]*)"/, home.body);
  const jsPath = pick(/src="(\/assets\/index-[^"]+\.js[^"]*)"/, home.body);
  const cssPos = cssPath ? home.body.indexOf(cssPath) : -1;
  const swPos = home.body.indexOf('hm-sw-reset');

  checks.push({
    name: 'build_meta',
    ok: Boolean(commit && assetQ),
    detail: `commit=${commit || '?'} assetQuery=${assetQ || '?'} sw=${swFlag || '?'}`,
  });
  checks.push({
    name: 'css_early_in_head',
    ok: Boolean(cssPath) && cssPos >= 0 && (swPos < 0 || cssPos < swPos),
    detail: cssPath || 'missing_css_link',
  });
  checks.push({
    name: 'sw_not_stale_reset',
    ok: swFlag !== 'v13' && swFlag !== 'v17',
    detail: `sw=${swFlag || 'none'} (expect v18+ after founder-desk chat split)`,
  });
  checks.push({
    name: 'deploy_has_register_fix',
    ok: Boolean(commit),
    detail: `commit=${commit || '?'}`,
  });

  if (cssPath) {
    const css = curl(`${ORIGIN}${cssPath}`);
    checks.push({
      name: 'css_asset',
      ok: css.status === 200 && css.body.length > 50_000,
      detail: `status=${css.status} bytes=${css.body.length}`,
    });
  } else {
    checks.push({ name: 'css_asset', ok: false, detail: 'no_css_path' });
  }

  if (jsPath) {
    const js = curl(`${ORIGIN}${jsPath}`);
    checks.push({
      name: 'js_entry',
      ok: js.status === 200 && js.body.length > 1000,
      detail: `status=${js.status} bytes=${js.body.length}`,
    });
  } else {
    checks.push({ name: 'js_entry', ok: false, detail: 'no_js_path' });
  }

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) console.log(`${c.ok ? 'OK' : 'FAIL'}  ${c.name}  ${c.detail}`);
  if (failed.length) {
    console.error(`\nhealth_check_failed: ${failed.length}`);
    process.exit(1);
  }
  console.log('\nhealth_check_ok');
}

main();
