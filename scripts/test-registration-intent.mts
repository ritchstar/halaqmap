/**
 * اختبار توقيع نية التسجيل: npx tsx scripts/test-registration-intent.mts
 */
import assert from 'node:assert';

async function main() {
  process.env.REGISTRATION_INTENT_SECRET = 'test-secret-for-unit-tests-only-32chars';
  const mod = await import('../api/_lib/registrationIntentCrypto.ts');
  const orderId = 'HM-20260417-AB12CD';
  const tok = mod.mintRegistrationIntentToken(orderId, process.env.REGISTRATION_INTENT_SECRET);
  assert.strictEqual(mod.verifyRegistrationIntentToken(orderId, tok, process.env.REGISTRATION_INTENT_SECRET).ok, true);
  assert.strictEqual(mod.verifyRegistrationIntentToken('HM-20260417-XXXXXX', tok, process.env.REGISTRATION_INTENT_SECRET).ok, false);
  assert.strictEqual(mod.verifyRegistrationIntentToken(orderId, 'bad', process.env.REGISTRATION_INTENT_SECRET).ok, false);
  console.log('registrationIntentCrypto: ok');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
