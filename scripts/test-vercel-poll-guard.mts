/**
 * حراسة استطلاع فيرسل: إيقاف النبض في الخلفية، وإبطاء خلية الإدارة، ومنح كرون الشات.
 * تشغيل: npx tsx scripts/test-vercel-poll-guard.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { POLL_MS } from '../src/lib/pollingPolicy.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const policy = readFileSync(join(root, 'src/lib/pollingPolicy.ts'), 'utf8');
const sql = readFileSync(
  join(root, 'supabase/migrations/191_private_chat_maintenance_service_role.sql'),
  'utf8',
);
const cron = readFileSync(join(root, 'api/cron-private-chat-maintenance.ts'), 'utf8');
const feed = readFileSync(join(root, 'src/modules/ai-staff/components/SuperIntelligenceFeedPanel.tsx'), 'utf8');
const approvals = readFileSync(
  join(root, 'src/modules/ai-staff/components/EngineeringPendingApprovalsPanel.tsx'),
  'utf8',
);
const ops = readFileSync(
  join(root, 'src/modules/ops-controller/components/FounderOperationalFeedPanel.tsx'),
  'utf8',
);
const radar = readFileSync(
  join(root, 'src/modules/platform-radar/hooks/useOpsControllerRadarStatus.ts'),
  'utf8',
);
const grocers = readFileSync(join(root, 'src/pages/store/StoreGrocersShopPage.tsx'), 'utf8');
const restaurant = readFileSync(join(root, 'src/pages/store/StoreRestaurantShopPage.tsx'), 'utf8');
const cafe = readFileSync(join(root, 'src/pages/store/StoreCafeShopPage.tsx'), 'utf8');
const kitchen = readFileSync(join(root, 'src/pages/store/StoreKitchenShopPage.tsx'), 'utf8');
const produce = readFileSync(join(root, 'src/pages/store/StoreProduceShopPage.tsx'), 'utf8');
const shops = grocers + restaurant + cafe + kitchen + produce;
const hive = feed + approvals + ops + radar;

assert.equal(POLL_MS.STORE_LIVE_SHOP, 8_000);
assert.equal(POLL_MS.STORE_LIVE_DESK, 4_000);
assert.equal(POLL_MS.ADMIN_HIVE, 60_000);
assert.match(policy, /export function scheduleVisiblePoll/);
assert.match(policy, /isPollingTabActive\(\)/);

assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.run_private_chat_maintenance\(\) TO service_role/);
assert.match(cron, /run_private_chat_maintenance/);

assert.match(hive, /POLL_MS\.ADMIN_HIVE/);
assert.doesNotMatch(hive, /setInterval\(\(\) => void refresh\(\), 45_000\)/);
assert.doesNotMatch(hive, /pollMs = 15_000/);
assert.match(feed, /scheduleVisiblePoll/);
assert.match(approvals, /scheduleVisiblePoll/);
assert.match(ops, /scheduleVisiblePoll/);
assert.match(radar, /scheduleVisiblePoll/);

assert.match(shops, /scheduleVisiblePoll/);
assert.doesNotMatch(shops, /setInterval\(load, 4000\)/);
assert.match(kitchen, /desk \? POLL_MS\.STORE_LIVE_DESK : POLL_MS\.STORE_LIVE_SHOP/);
assert.match(cafe, /mode === 'desk' \|\| mode === 'host'/);

console.log('vercel-poll-guard: ok');
