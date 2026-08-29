/**
 * معرض يوتيوب: صفحتان، مسودة ثم نشر، بلا استيراد من App.
 * تشغيل: npx tsx scripts/test-platform-youtube-gallery.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLATFORM_YOUTUBE_GALLERY_COPY } from '../src/config/platformYoutubeGallery.ts';
import {
  emptyYoutubeBox,
  isPlatformYoutubePageId,
  parseYoutubeBox,
  parseYoutubeBoxes,
  parseYoutubeDraftBoxes,
  publicYoutubeBoxes,
} from '../src/lib/platformYoutubeGallery.ts';
import { youtubeInPageEmbedUrl } from '../src/lib/youtubeUrl.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const publicPage = readFileSync(join(root, 'src/pages/YoutubeGalleryPage.tsx'), 'utf8');
const desk = readFileSync(join(root, 'src/app/admin/youtube-gallery/page.tsx'), 'utf8');
const player = readFileSync(join(root, 'src/components/youtube/YoutubeGalleryPlayer.tsx'), 'utf8');
const publicApi = readFileSync(join(root, 'api/public-youtube-gallery.ts'), 'utf8');
const adminApi = readFileSync(join(root, 'api/admin-youtube-gallery.ts'), 'utf8');
const sql = readFileSync(join(root, 'supabase/migrations/188_platform_youtube_gallery.sql'), 'utf8');
const grants = readFileSync(join(root, 'supabase/migrations/189_platform_youtube_gallery_grants.sql'), 'utf8');

assert.doesNotMatch(app, /from ['"]@\/config\/platformYoutubeGallery['"]/);
assert.doesNotMatch(app, /from ['"]@\/lib\/platformYoutubeGallery['"]/);
assert.match(app, /YoutubeGalleryPage/);
assert.match(app, /AdminYoutubeGalleryPage/);
assert.match(app, /YOUTUBE_HALAQ_PATH/);
assert.match(app, /\/videos/);
assert.match(app, /\/store\/videos/);
assert.match(app, /youtube-gallery/);

assert.equal(ROUTE_PATHS.YOUTUBE_HALAQ, '/videos');
assert.equal(ROUTE_PATHS.YOUTUBE_STORE, '/store/videos');
assert.equal(ROUTE_PATHS.ADMIN_YOUTUBE_GALLERY, '/youtube-gallery');
assert.equal(isPlatformYoutubePageId('halaq'), true);
assert.equal(isPlatformYoutubePageId('store'), true);
assert.equal(isPlatformYoutubePageId('lounge'), false);

const valid = parseYoutubeBox({
  id: 'a',
  titleAr: 'تجربة الرصد',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
});
assert.ok(valid);
assert.equal(valid?.videoId, 'dQw4w9WgXcQ');
assert.equal(parseYoutubeBox({ titleAr: '', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }), null);

const drafts = parseYoutubeDraftBoxes([emptyYoutubeBox(), { id: 'b', titleAr: '', youtubeUrl: '' }]);
assert.ok(drafts.length >= 1);
assert.equal(parseYoutubeBoxes(drafts).length, 0);

const published = publicYoutubeBoxes([valid!]);
assert.deepEqual(published, [{ id: 'a', titleAr: 'تجربة الرصد', videoId: 'dQw4w9WgXcQ' }]);
assert.match(youtubeInPageEmbedUrl('dQw4w9WgXcQ'), /youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/);
assert.match(youtubeInPageEmbedUrl('dQw4w9WgXcQ'), /rel=0/);

assert.match(publicPage, /YoutubeGalleryGrid/);
assert.doesNotMatch(publicPage, /youtube\.com\/watch/);
assert.doesNotMatch(publicPage, /إعلان|اعلان/);
assert.match(desk, /publishAdminYoutubeGallery/);
assert.match(desk, /emptyYoutubeBox/);
assert.match(player, /youtubeInPageEmbedUrl/);
assert.doesNotMatch(player, /youtube\.com\/watch/);
assert.match(publicApi, /published_boxes/);
assert.doesNotMatch(publicApi, /draft_boxes/);
assert.match(adminApi, /verifyPlatformAdminFromRequestAny/);
assert.match(adminApi, /onConflict: 'page_id'/);
assert.match(sql, /platform_youtube_galleries/);
assert.match(sql, /REVOKE ALL/);
assert.match(grants, /GRANT SELECT, INSERT, UPDATE, DELETE/);
assert.match(grants, /TO service_role/);
assert.match(PLATFORM_YOUTUBE_GALLERY_COPY.halaq.leadAr, /دون مغادرة الصفحة/);
assert.doesNotMatch(readFileSync(join(root, 'src/pages/AdminDashboard.tsx'), 'utf8'), /from ['"]@\/config\/platformYoutubeGallery['"]/);
assert.match(readFileSync(join(root, 'src/pages/AdminDashboard.tsx'), 'utf8'), /ADMIN_YOUTUBE_GALLERY/);

console.log('platform-youtube-gallery: ok');
