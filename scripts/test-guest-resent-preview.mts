/**
 * نموذج صفحة الرابط المعاد إرساله مربوط بلوحة المضيف، ومعزول عن App.
 * تشغيل: npx tsx scripts/test-guest-resent-preview.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eventLiveCopy } from '../src/config/storeEventLive.ts';
import { weddingLiveCopy } from '../src/config/storeWeddingLive.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const blocked = readFileSync(join(root, 'src/components/store/StoreGuestDeviceBlocked.tsx'), 'utf8');
const eventPanel = readFileSync(join(root, 'src/components/store/StoreEventHostPanel.tsx'), 'utf8');
const weddingPanel = readFileSync(join(root, 'src/components/store/StoreWeddingHostPanel.tsx'), 'utf8');
const preview = readFileSync(join(root, 'src/components/store/StoreGuestResentLinkPreview.tsx'), 'utf8');

const eventWomen = eventLiveCopy('women');
const weddingWomen = weddingLiveCopy('women');

assert.equal(eventWomen.resentPreviewKickerAr, 'رابط أُعيد إرساله');
assert.match(eventWomen.resentPreviewCaptionAr, /أُعيد إرساله/);
assert.equal(weddingWomen.resentPreviewKickerAr, eventWomen.resentPreviewKickerAr);
assert.equal(eventLiveCopy('men').titleAr, 'اجواء1');
assert.equal(eventWomen.titleAr, 'اجواء1 نسائي');

assert.match(blocked, /غير مسموح قانونياً عرض هذه الدعوة/);
assert.match(blocked, /هذا الرابط معاد استخدامه/);
assert.match(preview, /data-resent-preview="1"/);
assert.match(preview, /StoreGuestDeviceBlocked/);
assert.match(preview, /compact/);

assert.match(eventPanel, /StoreGuestResentLinkPreview/);
assert.match(weddingPanel, /StoreGuestResentLinkPreview/);
assert.match(eventPanel, /hostAr=\{voice === 'women' \? 'المضيفة' : 'المضيف'\}/);
assert.doesNotMatch(app, /StoreGuestResentLinkPreview|storeEventLive|storeWeddingLive/);

console.log('guest-resent-preview: ok');
