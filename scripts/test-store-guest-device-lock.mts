/**
 * روابط مدعوي افراحي1 واجواء1: إصدار من المشتري، لمرة واحدة، جهاز واحد.
 * تشغيل: npx tsx scripts/test-store-guest-device-lock.mts
 */
import assert from 'node:assert/strict';
import {
  claimGuestSeat,
  guestInviteStats,
  guestSeatMatches,
  markGuestInviteSent,
  markGuestInvitesSent,
  mintGuestInvite,
  mintGuestInviteBatch,
} from '../api/_lib/storeGuestDeviceLock.ts';
import {
  GUEST_DELEGATE_PACK_SIZES,
  buildGuestDelegatePackText,
  guestDelegateWhatsappHref,
  normalizeGuestDelegatePackSize,
} from '../src/lib/storeGuestDeviceLock.ts';

const minted = mintGuestInvite([]);
assert.ok(minted.stamp.id);
assert.ok(minted.stamp.exp > Date.now());

const bare = claimGuestSeat([], minted.stamps, { deviceHash: 'dev-a' });
assert.equal(bare.ok, false);

const first = claimGuestSeat([], minted.stamps, { inviteId: minted.stamp.id, deviceHash: 'dev-a' });
assert.equal(first.ok, true);
if (!first.ok) throw new Error('expected first claim');
assert.ok(first.seatId);
assert.equal(first.stamps[0]?.usedBy, 'dev-a');

const sameDevice = claimGuestSeat(first.seats, first.stamps, { deviceHash: 'dev-a' });
assert.equal(sameDevice.ok, true);
if (!sameDevice.ok) throw new Error('expected return visit');
assert.equal(sameDevice.seatId, first.seatId);

const forwardSeated = claimGuestSeat(first.seats, first.stamps, { seatId: first.seatId, deviceHash: 'dev-b' });
assert.equal(forwardSeated.ok, false);

const forwardInvite = claimGuestSeat(first.seats, first.stamps, { inviteId: minted.stamp.id, deviceHash: 'dev-b' });
assert.equal(forwardInvite.ok, false);

const expired = claimGuestSeat([], minted.stamps, { inviteId: minted.stamp.id, deviceHash: 'dev-c' }, minted.stamp.exp + 1);
assert.equal(expired.ok, false);

const secondMint = mintGuestInvite(first.stamps);
const secondGuest = claimGuestSeat(first.seats, secondMint.stamps, { inviteId: secondMint.stamp.id, deviceHash: 'dev-c' });
assert.equal(secondGuest.ok, true);
if (!secondGuest.ok) throw new Error('expected new host-issued invite');
assert.notEqual(secondGuest.seatId, first.seatId);

assert.equal(guestSeatMatches(secondGuest.seats, first.seatId, 'dev-a'), true);
assert.equal(guestSeatMatches(secondGuest.seats, first.seatId, 'dev-b'), false);

const batch = mintGuestInviteBatch([], 200);
assert.equal(batch.created.length, 200);
assert.equal(guestInviteStats(batch.stamps).remaining, 200);
const marked = markGuestInviteSent(batch.stamps, batch.created[0].id);
assert.equal(marked.ok, true);
if (marked.ok) {
  assert.equal(guestInviteStats(marked.stamps).sent, 1);
  assert.equal(guestInviteStats(marked.stamps).remaining, 199);
}
const overflow = mintGuestInviteBatch(batch.stamps, 10);
assert.equal(overflow.created.length, 10);
assert.equal(guestInviteStats(overflow.stamps).remaining, 210);

const pack = markGuestInvitesSent(batch.stamps, batch.created.slice(0, 25).map((item) => item.id));
assert.equal(pack.ok, true);
if (pack.ok) {
  assert.equal(pack.marked, 25);
  assert.equal(guestInviteStats(pack.stamps).remaining, 175);
}
assert.equal(markGuestInvitesSent(batch.stamps, []).ok, false);
assert.equal(normalizeGuestDelegatePackSize(75), 75);
assert.equal(normalizeGuestDelegatePackSize(13), 25);
assert.deepEqual([...GUEST_DELEGATE_PACK_SIZES], [25, 50, 75, 100]);
const packText = buildGuestDelegatePackText([
  { guestUrl: 'https://store.halaqmap.com/w/lab/guest?invite=ia' },
  { guestUrl: 'https://store.halaqmap.com/w/lab/guest?invite=ib' },
]);
assert.match(packText, /لا تفتحوا أي رابط/);
assert.match(packText, /تفويض إرسال دعوات/);
assert.doesNotMatch(packText, /RSVP|قائمة ضيوف/);
assert.match(guestDelegateWhatsappHref(packText), /^https:\/\/wa\.me\/\?text=/);

console.log('store-guest-device-lock ok');
