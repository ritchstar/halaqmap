/**
 * Security Advisor — ترحيل 205: سحب EXECUTE الإداري عن authenticated/anon.
 * تشغيل: npx tsx scripts/test-security-advisor-rpc-hardening.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const migration = readFileSync(
  join(root, 'supabase/migrations/205_security_advisor_rpc_hardening.sql'),
  'utf8',
);
const api = readFileSync(join(root, 'api/admin-platform-resources.ts'), 'utf8');
const remote = readFileSync(join(root, 'src/lib/adminResourceMetricsRemote.ts'), 'utf8');
const simulate = readFileSync(join(root, 'api/simulate-booking-overlap.ts'), 'utf8');

assert.match(migration, /is_service_role_executor/);
assert.match(migration, /REVOKE ALL ON FUNCTION public\.run_private_chat_maintenance\(\) FROM PUBLIC, anon, authenticated/);
assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.get_platform_resource_snapshot\(\) TO service_role/);
assert.match(migration, /REVOKE ALL ON FUNCTION public\.get_platform_resource_snapshot\(\) FROM PUBLIC, anon, authenticated/);
assert.match(migration, /REVOKE ALL ON FUNCTION public\.create_booking_safe/);
assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.create_booking_safe/);

assert.match(api, /get_platform_resource_snapshot/);
assert.match(api, /verifyActivePlatformAdminFromRequest/);
assert.match(api, /isBootstrapAdminEmail/);

assert.doesNotMatch(remote, /\.rpc\('get_platform_resource_snapshot'/);
assert.doesNotMatch(remote, /\.rpc\('admin_purge_/);
assert.match(remote, /\/api\/admin-platform-resources/);

assert.match(simulate, /service\.rpc\('create_booking_safe'/);
assert.doesNotMatch(simulate, /anon\.rpc\('create_booking_safe'/);

console.log('security-advisor-rpc-hardening: ok');
