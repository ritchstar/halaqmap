/**
 * فحص صحة إقلاع الإنتاج — قراءة فقط، لا يعدّل شيئاً على المنصة.
 * تشغيل: npx --yes tsx scripts/prod-boot-health-check.mts
 */
const ORIGIN = process.env.HALAQMAP_ORIGIN || 'https://www.halaqmap.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

type Check = { name: string; ok: boolean; detail: string };

async function fetchText(url: string): Promise<{ status: number; body: string; bytes: number }> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,*/*' },
    redirect: 'follow',
  });
  const body = await res.text();
  return { status: res.status, body, bytes: body.length };
}

async function fetchBytes(url: string): Promise<{ status: number; bytes: number }> {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'User-Agent': UA },
    redirect: 'follow',
  });
  const buf = await res.arrayBuffer();
  return { status: res.status, bytes: buf.byteLength };
}

function pick(re: RegExp, html: string): string | null {
  const m = html.match(re);
  return m?.[1] ?? null;
}

async function main(): Promise<void> {
  const checks: Check[] = [];
  const home = await fetchText(`${ORIGIN}/?health=${Date.now()}`);

  checks.push({
    name: 'homepage_http',
    ok: home.status === 200 && home.bytes > 5000,
    detail: `status=${home.status} bytes=${home.bytes}`,
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
    name: 'sw_not_v13_loop',
    ok: swFlag !== 'v13',
    detail: `sw=${swFlag || 'none'}`,
  });

  if (cssPath) {
    const css = await fetchBytes(`${ORIGIN}${cssPath}`);
    checks.push({
      name: 'css_asset',
      ok: css.status === 200 && css.bytes > 50_000,
      detail: `status=${css.status} bytes=${css.bytes}`,
    });
  } else {
    checks.push({ name: 'css_asset', ok: false, detail: 'no_css_path' });
  }

  if (jsPath) {
    const js = await fetchBytes(`${ORIGIN}${jsPath}`);
    checks.push({
      name: 'js_entry',
      ok: js.status === 200 && js.bytes > 1000,
      detail: `status=${js.status} bytes=${js.bytes}`,
    });
  } else {
    checks.push({ name: 'js_entry', ok: false, detail: 'no_js_path' });
  }

  const failed = checks.filter((c) => !c.ok);
  for (const c of checks) {
    console.log(`${c.ok ? 'OK' : 'FAIL'}  ${c.name}  ${c.detail}`);
  }
  if (failed.length) {
    console.error(`\nhealth_check_failed: ${failed.length}`);
    process.exit(1);
  }
  console.log('\nhealth_check_ok');
}

main().catch((err) => {
  console.error('health_check_error', err);
  process.exit(2);
});
