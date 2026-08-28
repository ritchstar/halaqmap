/**
 * تقييمات المتجر: نجوم وتعليق إلزامي، صفحة زائر، مؤشر إداري غير مقروء.
 * تشغيل: npx tsx scripts/test-store-reviews.mts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseReviewComment,
  parseReviewStars,
  parseStoreReviewBody,
} from '../api/_lib/storeReviews.ts';
import { STORE_REVIEWS_ADMIN_COPY, STORE_REVIEWS_COPY } from '../src/config/storeReviews.ts';
import { ROUTE_PATHS } from '../src/lib/routePaths.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(join(root, 'src/App.tsx'), 'utf8');
const dash = readFileSync(join(root, 'src/pages/AdminDashboard.tsx'), 'utf8');
const publicApi = readFileSync(join(root, 'api/public-store-reviews.ts'), 'utf8');
const adminApi = readFileSync(join(root, 'api/admin-store-reviews.ts'), 'utf8');
const page = readFileSync(join(root, 'src/pages/store/StoreReviewsPage.tsx'), 'utf8');
const form = readFileSync(join(root, 'src/components/store/StoreReviewForm.tsx'), 'utf8');
const engage = readFileSync(join(root, 'src/components/store/StoreVisitorEngage.tsx'), 'utf8');
const chrome = readFileSync(join(root, 'src/components/store/StoreChrome.tsx'), 'utf8');
const adminPage = readFileSync(join(root, 'src/app/admin/store-reviews/page.tsx'), 'utf8');
const sql = readFileSync(join(root, 'supabase/migrations/185_store_reviews.sql'), 'utf8');
const guard = readFileSync(join(root, 'api/_lib/registrationRouteGuard.ts'), 'utf8');

assert.equal(ROUTE_PATHS.STORE_REVIEWS, '/store/reviews');
assert.equal(ROUTE_PATHS.ADMIN_STORE_REVIEWS, '/store-reviews');
assert.notEqual(ROUTE_PATHS.STORE_REVIEWS, ROUTE_PATHS.PLATFORM_REVIEWS);
assert.match(STORE_REVIEWS_COPY.titleAr, /النجوم والتعليق/);
assert.match(STORE_REVIEWS_COPY.needCommentAr, /تعليقاً/);
assert.match(STORE_REVIEWS_ADMIN_COPY.unseenAr, /غير مقروء/);
assert.match(STORE_REVIEWS_ADMIN_COPY.cardLeadAr, /مؤشر/);

assert.equal(parseReviewStars(5), 5);
assert.equal(parseReviewStars(0), null);
assert.equal(parseReviewComment('قصير'), null);
assert.ok(parseReviewComment('تجربة واضحة مع المتجر'));
assert.equal(parseReviewComment('انظر https://example.com'), null);
assert.equal(parseStoreReviewBody({ stars: 5 }).ok, false);
assert.equal(parseStoreReviewBody({ stars: 4, comment: 'جيد جداً وواضح' }).ok, true);

assert.match(app, /StoreReviewsPage/);
assert.match(app, /StoreReviewsAdminPage/);
assert.match(app, /\/store\/reviews/);
assert.match(app, /\/store-reviews/);
assert.doesNotMatch(app, /storeReviews/);
assert.doesNotMatch(app, /from ['"]@\/config\/storeReviews/);

assert.match(page, /StoreReviewForm/);
assert.match(form, /comment/);
assert.match(form, /company_url_hp/);
assert.match(form, /required/);
assert.match(engage, /STORE_REVIEWS/);
assert.doesNotMatch(engage, /hm_store_ratings/);
assert.match(chrome, /STORE_REVIEWS/);

assert.match(dash, /ADMIN_STORE_REVIEWS/);
assert.match(dash, /تقييمات المتجر/);
assert.match(dash, /fetchAdminStoreReviews\(true\)/);
assert.match(dash, /storeReviewCounts\.unseen/);

assert.match(publicApi, /public-store-reviews/);
assert.match(publicApi, /parseStoreReviewBody/);
assert.match(publicApi, /company_url_hp/);
assert.match(adminApi, /verifyPlatformAdminFromRequestAny/);
assert.match(adminApi, /admin_seen_at/);
assert.match(adminApi, /searchParams\.get\('counts'\)/);
assert.match(adminPage, /fetchAdminStoreReviews/);
assert.match(adminPage, /unseen/);

assert.match(sql, /store_reviews/);
assert.match(sql, /service_role/);
assert.match(sql, /admin_seen_at/);
assert.match(guard, /public-store-reviews/);

assert.doesNotMatch(STORE_REVIEWS_COPY.leadAr, /كاردي8|افراحي1|رخصة النفاذ/);
assert.doesNotMatch(STORE_REVIEWS_ADMIN_COPY.leadAr, /كاردي8|افراحي1/);

console.log('test-store-reviews: ok');
