# Halaqmap Comprehensive Technical Report (AR/EN)

**Project:** Halaqmap  
**Repository Commit:** `6c933a2`  
**Date:** 2026-04-14  
**Prepared For:** Product owners, frontend/backend developers, DevOps, QA

---

## 1) مقدمة تعريفية بالمشروع (Arabic)

### ما هي الفكرة؟
**حلاق ماب** منصة عربية (سعودية التوجّه) تربط العملاء بالحلاقين المحترفين عبر:
- استعراض الحلاقين حسب القرب الجغرافي.
- صفحات تفاصيل للحلاق.
- رحلة تسجيل حلاق جديدة مع رفع مستندات وصور.
- خطط اشتراك (برونزي/ذهبي/ماسي).
- لوحة إدارة للمشرفين.
- تجربة تقييم عبر QR.

### القيمة العملية
- تسهيل اكتشاف الحلاق المناسب حسب المنطقة.
- تحويل اشتراكات الحلاقين إلى مسار رقمي واضح.
- توفير إدارة تشغيلية عبر لوحة تحكم.
- تمهيد لبنية قابلة للتوسع (دفع، مراجعات، رسائل، إحصائيات).

### الوضع الحالي باختصار
- الواجهة الأمامية ناضجة نسبيًا ومتكاملة المسارات.
- تكامل Supabase موجود (Auth + DB + Storage).
- تم إدخال مسارات رفع سيرفر-سايد لمعالجة مشاكل RLS/403.
- المتبقي تشغيليًا: التأكد النهائي من سياسات/جداول الإدراج في `registration_submissions` في بيئة الإنتاج.

---

## 2) Project Overview (English)

### What is Halaqmap?
Halaqmap is an Arabic, Saudi-focused barber discovery and subscription platform that includes:
- Geo-based barber discovery.
- Barber detail and contact/booking interactions.
- Multi-step barber onboarding with document/image uploads.
- Subscription tiers (`bronze`, `gold`, `diamond`).
- Admin portal for operations and moderation.
- QR-based customer rating flow.

### Product Value
- Improves barber discoverability and lead conversion.
- Structures onboarding and subscription intake.
- Enables operational control via admin dashboard.
- Provides a scalable foundation for payments, moderation, and analytics.

### Current Maturity
- Frontend experience is feature-rich and production-oriented.
- Supabase integration is in place.
- Server-side upload routes were added to reduce RLS-related failures.
- Remaining operational blocker is DB insert policy validation for `registration_submissions` in production.

---

## 3) النظام التقني والمعمارية (Architecture)

### 3.1 الواجهة الأمامية (Frontend)
- **Stack:** React 18 + TypeScript + Vite + Tailwind + Radix/shadcn.
- **Router:** `HashRouter` (مناسب للاستضافة الثابتة بدون rewrite معقد).
- **UI Layer:** مكونات كبيرة داخل `src/components` + صفحات في `src/pages`.
- **State/Data:** مزيج من state محلي + خدمات `src/lib` + بعض React Query.

**مراجع أساسية:**
- `src/App.tsx`
- `src/components/Layout.tsx`
- `src/pages/Home.tsx`
- `src/pages/Register.tsx`
- `src/components/RegistrationForm.tsx`

### 3.2 الخلفية (Supabase + Serverless)
- **Database:** PostgreSQL (Supabase) + RLS policies.
- **Auth:** Supabase Auth (خصوصًا للمشرفين).
- **Storage:** bucket باسم `registration-uploads`.
- **Server routes on Vercel:**
  - `api/register-signed-upload.ts` (المسار المفضل).
  - `api/register-upload-file.ts` (fallback server upload).

**مراجع:**
- `api/register-signed-upload.ts`
- `api/register-upload-file.ts`
- `vercel.json`
- `supabase/REGISTRATION_PUBLIC_FULL_SETUP.sql`

---

## 4) Architecture Summary (English)

### Frontend
- SPA built with Vite/React/TypeScript.
- Central route map in `src/App.tsx`.
- Feature modules split by domain pages + shared components.
- Domain/service orchestration in `src/lib`.

### Backend and Runtime
- Supabase for persistence and auth.
- Vercel serverless routes for secure upload orchestration.
- Database migrations under `supabase/migrations`.
- Production deployment currently aligned to server-assisted upload paths.

---

## 5) المسارات الرئيسية وتجارب المستخدم

### 5.1 المسارات العامة
- الصفحة الرئيسية: `/#/`
- التسجيل: `/#/register`
- الدفع: `/#/payment`
- نجاح التسجيل: `/#/register/success`
- سياسات الاشتراك: `/#/subscription-policy`
- التقييم عبر QR: `/#/rate/:barberId`

### 5.2 المسارات الإدارية
- دخول الإدارة (مسار مخفي): `/{portalBase}/in`
- لوحة الإدارة: `/{portalBase}/ctrl`

### 5.3 تدفق تسجيل الحلاق (High-level)
1. إدخال بيانات النشاط والخدمات.
2. رفع مرفقات (مستندات/صور/إيصال).
3. رفع الملفات عبر مسار signed/server.
4. حفظ الطلب في `registration_submissions`.
5. الانتقال لواجهة النجاح/الدفع حسب السيناريو.

---

## 6) Major Flows (English)

### Customer Discovery
- Browse nearby barbers, filter by location/tier, open detail modal, and engage via call/WhatsApp/chat/booking options.

### Barber Onboarding
- Multi-step registration form with attachments and payment pathway.
- Upload path now prefers signed/server route to avoid direct anon storage failures.

### Admin Operations
- Hidden-path login + role-based access control.
- Dashboard handles review/requests/payments/operational tools depending on permissions.

---

## 7) قاعدة البيانات وSupabase (تفصيلي)

### 7.1 جداول المجال الأساسية (Historical migrations)
- `profiles`, `barbers`, `bookings`, `payments`, `subscriptions`, `reviews`, `messages`, `notifications`, `subscription_requests` وغيرها.
- تعريفها عبر migrations المبكرة (`01` إلى `12` وما بعدها).

### 7.2 مسار التسجيل العام
- جدول طلبات التسجيل: `public.registration_submissions`
- الحاوية: `storage.buckets.id = 'registration-uploads'`
- سياسات الإدراج/القراءة مرتبطة بملفات:
  - `supabase/migrations/14_registration_submissions_public.sql`
  - `supabase/migrations/17_registration_uploads_storage.sql`
  - `supabase/migrations/21_registration_storage_path_policy_fix.sql`
  - `supabase/REGISTRATION_PUBLIC_FULL_SETUP.sql` (ملف شامل موصى به للتشغيل السريع)

### 7.3 ملاحظة تشغيلية
إذا كان `api/register-signed-upload` يعطي `ready: true` بينما الحفظ يفشل، فالخلل عادة في:
- سياسة `INSERT` لدور `anon` على `registration_submissions`.
- أو أن SQL نُفذ على مشروع Supabase مختلف عن الإنتاج.

---

## 8) Data & Supabase Integration (English)

### Integration modules (`src/lib`)
- `publicBarbersFromSupabase.ts` – public barber reads.
- `registrationSubmissionsRemote.ts` – registration insert/read logic.
- `registrationFileUploads.ts` – upload orchestration and error handling.
- `admin*Remote.ts` and `adminAccessRemote.ts` – admin role/stats/payment data.

### Supabase Environment Dependencies
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `SUPABASE_ANON_KEY` (recommended mirror for server-side verification)

---

## 9) طبقة الرفع (Upload Pipeline) — الحالة الحالية

### التسلسل المعتمد الآن
1. **Preferred:** `api/register-signed-upload`
   - السيرفر ينشئ signed upload token/url بمفتاح الخدمة.
   - العميل يرفع الملف عبر signed endpoint.
2. **Fallback:** `api/register-upload-file`
   - السيرفر يستقبل الملف ويرفعه إلى Supabase.
3. **Direct anon upload fallback**
   - مقيد في الإنتاج، ومتاح غالبًا للتطوير/الطوارئ حسب env.

### الهدف من هذا التصميم
- تقليل اعتمادية الواجهة على سياسات RLS المباشرة في storage.
- تحسين الاستقرار على الجوال والشبكات المتذبذبة.
- تقديم تشخيص واضح عبر `GET` health style endpoints.

---

## 10) Upload Pipeline (English)

The current design is intentionally defense-in-depth:
- Signed upload route first (most robust for production).
- Server upload fallback second.
- Direct browser anon upload only when explicitly allowed.

This significantly reduces recurring `403 Forbidden`/RLS-related failures and avoids exposing service-role operations to the browser.

---

## 11) الأمن والصلاحيات (Security & Access)

### 11.1 نقاط القوة
- فصل مفتاح `service_role` في بيئة السيرفر فقط.
- وجود check endpoint يوضح readiness بدون كشف الأسرار.
- RBAC إداري عبر `platform_admin_roles` وسياسات SQL.

### 11.2 مخاطر/ديون تقنية
- بعض مسارات barber dashboard ما زالت أقرب للديمو/محلي.
- حساسية عالية لأي عدم تطابق بين env في Vercel وSupabase.
- احتمالية drift بين migrations وtypes المولدة.

### 11.3 توصيات
- منع أي اعتماد إنتاجي على direct anon upload.
- إضافة rate limiting على مسارات `api/register-*`.
- توحيد pipeline logs وربطها بمعرف الطلب `HM-*`.

---

## 12) DevOps, Build, Lint, CI

### البناء والتشغيل
- `npm run dev`
- `npm run build`
- `npm run lint`

### CI
- Workflow يتحقق من lint + type check + build.
- لا توجد حاليًا تغطية اختبارات سلوكية واسعة (unit/e2e) لمسارات التسجيل والرفع.

**مراجع:**
- `package.json`
- `.github/workflows/ci.yml`
- `eslint.config.js`
- `tsconfig*.json`

---

## 13) Postmortem Timeline (Since Yesterday) / التسلسل الزمني للحادثة

### Arabic
1. ظهرت أخطاء رفع ملفات (`Storage RLS`/`403`).
2. تم تبسيط سياسات bucket إلى check على `bucket_id` فقط.
3. أُضيف رفع عبر سيرفر Vercel لتجاوز قيود RLS المباشرة.
4. أُضيف مسار `api/register-signed-upload` كمسار مفضل.
5. تم تشخيص أن `serviceRoleKeySet` كان `false` ثم تم إصلاحه.
6. أصبحت readiness لمسار signed `true`.
7. تبقى خطأ إدراج DB في `registration_submissions` ويحتاج تثبيت SQL policy في مشروع الإنتاج.

### English
1. File uploads were failing with Storage RLS/403 errors.
2. Storage policy was simplified to bucket-only insert checks.
3. Vercel server upload route was introduced.
4. Signed upload route (`api/register-signed-upload`) was added and prioritized.
5. `serviceRoleKeySet=false` was identified and corrected.
6. Signed route now reports `ready=true`.
7. Remaining blocker moved to DB insert policy on `registration_submissions`.

---

## 14) Runbook تشغيلي سريع (Production Runbook)

### Step A — Verify API readiness
- `GET /api/register-signed-upload` => all flags true.
- `GET /api/register-upload-file` => all flags true.

### Step B — Verify SQL setup
Execute once on production Supabase:
- `supabase/REGISTRATION_PUBLIC_FULL_SETUP.sql`

Verify:
- `registration_submissions` table exists.
- anon INSERT policy exists for that table.
- `registration-uploads` bucket exists.

### Step C — End-to-end verification
- Submit registration from mobile + desktop.
- Confirm:
  - files uploaded in storage.
  - record inserted into `registration_submissions`.

---

## 15) قائمة ملفات مرجعية للمطورين (Quick Index)

- App & routes: `src/App.tsx`
- Main form: `src/components/RegistrationForm.tsx`
- Upload orchestration: `src/lib/registrationFileUploads.ts`
- DB submission service: `src/lib/registrationSubmissionsRemote.ts`
- Signed upload route: `api/register-signed-upload.ts`
- Server upload route: `api/register-upload-file.ts`
- Full SQL setup: `supabase/REGISTRATION_PUBLIC_FULL_SETUP.sql`
- Storage policy fix: `supabase/migrations/21_registration_storage_path_policy_fix.sql`
- Vercel function config: `vercel.json`
- Environment template: `.env.example`

---

## 16) Roadmap Recommendations / توصيات المرحلة القادمة

### Arabic
- توحيد توليد Types من Supabase بعد كل migration.
- بناء اختبارات e2e لمسار التسجيل الكامل.
- إضافة مراقبة/Logging معرف بالـ orderId.
- تشديد RBAC وبوابات أمان لوحة الإدارة.

### English
- Regenerate Supabase types after each migration.
- Add e2e coverage for full onboarding/upload flow.
- Implement structured logging keyed by `orderId`.
- Harden admin RBAC and route controls further.

---

## 17) ملخص تنفيذي نهائي (Executive Closing)

**Arabic:**  
المشروع وصل إلى مرحلة متقدمة وظيفيًا، وتم حل الجزء الأكبر من أزمة الرفع عبر تحويله لمسار سيرفر-سايد/سايند. الحالة التشغيلية الآن واضحة: الرفع أصبح جاهزًا (`ready=true`)، والعائق المتبقي يتركّز في سياسة إدراج جدول `registration_submissions` على مشروع الإنتاج نفسه.

**English:**  
The project is functionally advanced, and the major upload instability has been mitigated through server/signed upload architecture. Operationally, upload readiness is now confirmed (`ready=true`), and the remaining blocker is concentrated in production DB insert policy alignment for `registration_submissions`.

