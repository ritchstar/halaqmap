/**
 * اختبار سريع لمنطق registrationRouteGuard (يُشغَّل عبر: npx tsx scripts/test-registration-route-guard.mts)
 */
import assert from 'node:assert';

async function main() {
  const uniqueIp = `203.0.113.${Math.floor(Math.random() * 240) + 10}`;

  process.env.REGISTRATION_RATE_LIMIT_MAX = '2';
  process.env.REGISTRATION_RATE_LIMIT_WINDOW_MS = '999999';
  delete process.env.REGISTRATION_ALLOWED_ORIGINS;

  const mod = await import('../api/_lib/registrationRouteGuard.ts');
  const mk = () =>
    new Request('https://example.test/', {
      method: 'POST',
      headers: { 'x-forwarded-for': uniqueIp },
    });

  assert.strictEqual(mod.runRegistrationRouteGuards(mk(), 'rl-x').ok, true, 'first within limit');
  assert.strictEqual(mod.runRegistrationRouteGuards(mk(), 'rl-x').ok, true, 'second within limit');
  const third = mod.runRegistrationRouteGuards(mk(), 'rl-x');
  assert.strictEqual(third.ok, false, 'third should 429');
  assert.strictEqual(third.status, 429);

  process.env.REGISTRATION_ALLOWED_ORIGINS = 'https://allowed.example,https://two.test/path';
  const okReq = new Request('https://api/', {
    method: 'POST',
    headers: { Origin: 'https://allowed.example', 'x-forwarded-for': '198.51.100.1' },
  });
  assert.strictEqual(mod.runRegistrationRouteGuards(okReq, 'origin-ok').ok, true);

  const badOrigin = new Request('https://api/', {
    method: 'POST',
    headers: { Origin: 'https://evil.test', 'x-forwarded-for': '198.51.100.2' },
  });
  const fo = mod.runRegistrationRouteGuards(badOrigin, 'origin-bad');
  assert.strictEqual(fo.ok, false);
  assert.strictEqual(fo.status, 403);

  const noOrigin = new Request('https://api/', {
    method: 'POST',
    headers: { 'x-forwarded-for': '198.51.100.3' },
  });
  const fn = mod.runRegistrationRouteGuards(noOrigin, 'origin-missing');
  assert.strictEqual(fn.ok, false);
  assert.strictEqual(fn.status, 403);

  delete process.env.REGISTRATION_ALLOWED_ORIGINS;
  delete process.env.PUBLIC_API_ALLOWED_ORIGINS;
  const list = mod.parseRegistrationAllowedOrigins();
  assert.deepStrictEqual(list, []);

  process.env.REGISTRATION_ALLOWED_ORIGINS = ' https://A.COM/foo ';
  const list2 = mod.parseRegistrationAllowedOrigins();
  assert.deepStrictEqual(list2, ['https://a.com']);

  process.env.PUBLIC_API_ALLOWED_ORIGINS = 'https://primary.test';
  delete process.env.REGISTRATION_ALLOWED_ORIGINS;
  const list3 = mod.parsePublicApiAllowedOrigins();
  assert.deepStrictEqual(list3, ['https://primary.test']);

  console.log('registrationRouteGuard: all checks passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
