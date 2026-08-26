/**
 * وسم واتساب لرابط الضيف يظهر كرت الدعوة، وشعار المتجر يبقى لجذر النطاق.
 * تشغيل: npx tsx scripts/test-store-live-invite-share.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STORE_LIVE_INVITE_CARD_MEN,
  STORE_LIVE_INVITE_CARD_WOMEN,
  STORE_LIVE_INVITE_MARK,
  storeLiveInviteCardImage,
  storeLiveInviteCopy,
  storeLiveInviteHashHref,
  storeLiveInviteShareHref,
} from '../api/_lib/storeLiveInviteShare.ts';
import { guestInviteHref } from '../src/lib/storeGuestDeviceLock.ts';
import { STORE_SHARE_META } from './lib/storeShareMeta.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const vercel = readFileSync(join(root, 'vercel.json'), 'utf8');
const api = readFileSync(join(root, 'api/public-store-live-invite-share.ts'), 'utf8');
const weddingApi = readFileSync(join(root, 'api/public-store-wedding-live.ts'), 'utf8');
const eventApi = readFileSync(join(root, 'api/public-store-event-live.ts'), 'utf8');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');

assert.equal(
  guestInviteHref('/w', 'lab', 'i851f4c5789a44830'),
  'https://store.halaqmap.com/w/lab/guest?invite=i851f4c5789a44830',
);
assert.equal(
  guestInviteHref('/e', 'event-lab', 'iabc'),
  'https://store.halaqmap.com/e/event-lab/guest?invite=iabc',
);
assert.doesNotMatch(guestInviteHref('/w', 'lab', 'i851f4c5789a44830'), /#/);

assert.equal(storeLiveInviteShareHref('wedding', 'lab', 'i851'), 'https://store.halaqmap.com/w/lab/guest?invite=i851');
assert.equal(storeLiveInviteHashHref('wedding', 'lab', 'i851'), 'https://store.halaqmap.com/#/w/lab/guest?invite=i851');
assert.equal(storeLiveInviteCardImage({ kind: 'wedding', token: 'lab' }), STORE_LIVE_INVITE_CARD_MEN);
assert.equal(storeLiveInviteCardImage({ kind: 'wedding', token: 'lab-women' }), STORE_LIVE_INVITE_CARD_WOMEN);
assert.equal(
  storeLiveInviteCardImage({ kind: 'wedding', token: 'lab', photoSrc: 'https://evil.example/x.png' }),
  STORE_LIVE_INVITE_CARD_MEN,
);
assert.match(storeLiveInviteCopy({ kind: 'wedding' }).title, /افراحي1/);
assert.match(storeLiveInviteCopy({ kind: 'event' }).title, /اجواء1/);
assert.doesNotMatch(storeLiveInviteCopy({ kind: 'wedding' }).description, /كاردي8|تمويناتا1|مطعمنا1/);

assert.equal(STORE_SHARE_META.image, STORE_LIVE_INVITE_MARK);
assert.match(STORE_SHARE_META.description, /متجر إلكتروني/);

assert.match(vercel, /public-store-live-invite-share\?kind=wedding/);
assert.match(vercel, /public-store-live-invite-share\?kind=event/);
assert.match(api, /isShareCrawler/);
assert.match(api, /og:image/);
assert.doesNotMatch(api, /claimGuestSeat/);
assert.doesNotMatch(api, /from ['"]@\/config\/storeWeddingLive['"]/);
assert.doesNotMatch(app, /storeLiveInviteShare|public-store-live-invite-share/);
assert.match(weddingApi, /\/w\/\$\{encodeURIComponent\(token\)\}\/guest/);
assert.match(eventApi, /\/e\/\$\{encodeURIComponent\(token\)\}\/guest/);
assert.doesNotMatch(weddingApi, /\/#\/w\/\$\{encodeURIComponent\(token\)\}\/guest/);
assert.match(indexHtml, /liveGuest/);
assert.match(indexHtml, /invite=/);
const issuance = readFileSync(join(root, 'src/components/store/StoreHostGuestInviteIssuance.tsx'), 'utf8');
assert.match(issuance, /دفعة لمفوض من العائلة/);
assert.match(issuance, /لا تفتحوا أي رابط/);
assert.match(issuance, /markWeddingGuestInvitesSent/);
assert.match(weddingApi, /inviteIds/);
assert.match(eventApi, /inviteIds/);
assert.doesNotMatch(app, /StoreHostGuestInviteIssuance|storeGuestDeviceLock/);

console.log('store-live-invite-share: ok');
