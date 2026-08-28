/**
 * قائمة هدايا المتجر: صفحة إدارة مع حالة التأكيد وإعادة الإرسال.
 * تشغيل: npx tsx scripts/test-store-gift-roster.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORE_GIFT_ROSTER_COPY } from '../src/config/storeGiftRoster.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const dash = readFileSync(join(root, 'src/pages/AdminDashboard.tsx'), 'utf8');
const api = readFileSync(join(root, 'api/admin-store-gifts.ts'), 'utf8');
const page = readFileSync(join(root, 'src/app/admin/store-gifts/page.tsx'), 'utf8');

assert.equal(ROUTE_PATHS.ADMIN_STORE_GIFTS, '/store-gifts');
assert.match(STORE_GIFT_ROSTER_COPY.titleAr, /قائمة المشاركين/);
assert.match(STORE_GIFT_ROSTER_COPY.pendingAr, /بانتظار تأكيد البريد/);
assert.match(STORE_GIFT_ROSTER_COPY.activeAr, /مفعل/);
assert.match(STORE_GIFT_ROSTER_COPY.resendAr, /أعد إرسال/);
assert.match(app, /StoreGiftRosterPage/);
assert.match(app, /\/store-gifts/);
assert.doesNotMatch(app, /storeGiftRoster/);
assert.match(dash, /ADMIN_STORE_GIFTS/);
assert.match(dash, /قائمة هدايا المتجر/);
assert.match(api, /verifyPlatformAdminFromRequestAny/);
assert.match(api, /await sendGiftConfirmEmail/);
assert.match(api, /await sendKitchenGiftConfirmEmail/);
assert.doesNotMatch(api, /void sendGiftConfirmEmail/);
assert.match(page, /resendAdminStoreGiftConfirm/);
assert.match(page, /copyActiveAr/);

console.log('test-store-gift-roster: ok');
