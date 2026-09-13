# تقرير شامل — من إرسال تطبيق Halaq Map للمراجعة إلى إصلاحات البنية التحتية

**الغرض من هذا الملف:** توثيق تقني كامل لكل ما تم تنفيذه في هذه الجلسة، بلا حذف أو تلخيص مخلّ، ليطّلع عليه Cursor (أو أي مطوّر/وكيل آخر) ويكمل ما تبقى، وأهمّه: **إضافة ملفّي الترحيل (migrations) المذكورين أدناه إلى مستودع GitHub الفعلي وعمل commit لهما**، لأن من نفّذ هذا العمل (Claude) لم يملك صلاحية push على المستودع.

التاريخ: 2026-09-10. المستودع: `ritchstar/halaqmap` (GitHub). المشروع: `ritchstar4@gmail.com's Project` على Supabase (project ref: `lqzuhkzfhdhaosstduas`). الاستضافة: Vercel. تطبيق الأندرويد: `com.halaqmap.operators` على Google Play Console.

---

## 1) نشر تطبيق Android على Google Play Console (com.halaqmap.operators)

### 1.1 التحقق من متطلبات الامتثال الإلزامية
تم فحص Play Console لمعرفة أي نماذج امتثال إلزامية (Content Rating, Data Safety, Target Audience, Ads) قد تمنع النشر. **النتيجة: لم تظهر أي من هذه النماذج كعائق فعلي عند محاولة الترقية** — لم تكن مطلوبة بعد لهذا التطبيق/الحساب. تم توثيق حقائق الامتثال التالية (زوّدنيها صاحب الحساب) للرجوع إليها مستقبلاً إذا طُلبت:
- لا يجمع التطبيق أي بيانات عن المستخدم غير بيانات تسجيل الدخول بالإيميل.
- لا يعرض إعلانات.
- الفئة العمرية المستهدفة: 18 وما فوق.
- رابط سياسة الخصوصية: `https://store.halaqmap.com/#/store/cards/legal`

### 1.2 العائق الفعلي الوحيد: عدم تحديد الدول/المناطق
عند محاولة ترقية الإصدار لمسار الإنتاج، العائق الوحيد كان عدم وجود أي دولة/منطقة محددة للتوزيع.

**طلب صاحب الحساب:** "جميع الدول العربية" (كل دول جامعة الدول العربية).

**النتيجة: 19 من 22 دولة تمت إضافتها بنجاح:**
الإمارات، السعودية، الكويت، قطر، البحرين، عُمان (لاحظ: يجب كتابتها بالضبط "عُمان" بالتشكيل، بدونه لا يُطابق البحث)، الأردن، لبنان، العراق، مصر، ليبيا، تونس، الجزائر، المغرب، السودان، اليمن، الصومال، جيبوتي، جزر القمر.

**3 دول لم تُوجد في قائمة Google Play إطلاقاً تحت أي صيغة بحث جُرّبت** (سوريا، سورية؛ موريتانيا، موريتاني؛ فلسطين، الأراضي الفلسطينية، Palestine, Syria, Mauritania):
- **سوريا**: على الأرجح بسبب عقوبات دولية معروفة تمنع توفّرها كخيار توزيع في Google Play.
- **موريتانيا** و **فلسطين**: غير متوفرتين في قائمة التوزيع لهذا الحساب/التطبيق لسبب غير واضح — يستحق تأكيد لاحق مباشرة من دعم Google Play إن كان الوصول لهذه الأسواق مهماً.

### 1.3 عقبة تقنية أثناء العمل: إصدار تمهيدي (draft) فارغ كان يمنع الترقية لمسار الإنتاج
اكتُشف أن قناة الإنتاج بها "إصدار تمهيدي" فارغ (0 دول) من محاولة سابقة، وكان يمنع خيار "مرحلة الإنتاج" من الظهور كخيار متاح. تم حلّه بفتح ذلك الإصدار عبر "تحليل الإصدار" والضغط على "تجاهل الإصدار التمهيدي" مع التأكيد، ثم التحقق من زوال أي إصدار تمهيدي متبقٍ.

### 1.4 قرار المسار: الإنتاج مباشرة (تخطي الاختبار المغلق)
بسؤال صاحب الحساب صراحة، اختار **"مرحلة الإنتاج (Production) مباشرة"** بدل Closed Testing.

### 1.5 الإرسال الرسمي للمراجعة
بتأكيد صريح من صاحب الحساب ("نعم قم بارسال الاصدار للمراجعة رسمياً")، تم:
1. حفظ الإصدار ("معاينة والتأكيد").
2. من "نظرة عامة على النشر" → "إرسال X تغييرات للمراجعة" → تأكيد النافذة المنبثقة.
3. تم التحقق من نجاح الإرسال عبر عدة مؤشرات مستقلة: عداد قائمة التحقق أصبح "4 من 5"، عنوان صفحة النشر تغيّر إلى **"التغييرات قيد المراجعة"**، وزر الإرسال تحوّل إلى "إزالة التغييرات".
4. **Managed publishing كانت OFF** — يعني هذا أن النشر سيكون تلقائياً فور موافقة Google، بلا خطوة يدوية إضافية.

> ملاحظة تقنية للمطوّرين: عناصر الدول في واجهة Play Console هي مكوّنات `<mat-checkbox>` مخصّصة (Angular Material)، وكذلك زر "حفظ" هو `<button>` لا يستجيب لـ `.click()` البرمجي المباشر — تطلّب الأمر محاكاة تسلسل أحداث فأرة حقيقي كامل (`pointerdown`→`mousedown`→`pointerup`→`mouseup`→`click`) بإحداثيات حقيقية من `getBoundingClientRect()` حتى تسجّل الواجهة التغيير فعلياً (تم التحقق عبر `aria-checked`).

---

## 2) سؤال تقني: هل يؤثر النمو الكبير في عدد المستخدمين على النطاق (الدومين)؟

تم توضيح أن النطاق (`halaqmap.com`) لا يتأثر تقنياً بحجم حركة المرور أو عدد المستخدمين — DNS واستضافة النطاق منفصلان عن البنية التحتية الخلفية (Backend). الاختناق الحقيقي عند النمو يكون في البنية الخلفية (قاعدة البيانات، حدود الاتصال، حدود مزوّدي الخدمات كالبريد الإلكتروني)، وليس في النطاق نفسه. هذا أدّى مباشرة لفحص مشروع Supabase الفعلي، حيث اكتُشفت مشاكل حقيقية موصوفة أدناه.

**المكدّس التقني (Stack) المُكتشف:**
- الواجهة الأمامية + الكود المصدري: GitHub (`ritchstar/halaqmap`)
- الاستضافة/النشر: Vercel
- قاعدة البيانات/Auth/Storage/Realtime: Supabase (فئة الحوسبة: **Nano** — أصغر فئة، حد أقصى افتراضي 200 اتصال عميل، وحجم تجمّع اتصالات (pool) 15)

---

## 3) المشاكل الحرجة المكتشفة في تدقيق Supabase (بترتيب الأولوية الذي اتُّفق عليه)

1. **حد إرسال إيميلات Auth الافتراضي: 2 إيميل/ساعة فقط** (`RATE_LIMIT_EMAIL_SENT`) — يدل على استخدام مزوّد البريد المدمج الافتراضي في Supabase (وليس SMTP مخصص)، وهذا يعني انسداد فعلي لتسجيل الدخول عبر OTP بمجرد تجاوز أول مستخدمَين في الساعة.
2. **خطأ "permission denied" على جدولي `security_events` و `security_block_list`**، يُشكّل ما يقارب **97.6% من إجمالي أخطاء Postgres** المرصودة في سجلات المشروع.
3. **فئة الحوسبة Nano** بحدودها الصارمة (200 اتصال / 15 pool) — لم تُعالَج، مؤجلة لمرحلة نمو حقيقية لاحقة.
4. **جدول `public.spatial_ref_sys`** (جدول نظام PostGIS) مُعلَّم من Security Advisor كـ RLS-disabled — لم يُعالَج (تفاصيل السبب في القسم 8).

---

## 4) الإصلاح الأول: SMTP مخصص عبر Resend لـ Supabase Auth

- تبيّن أن صاحب الحساب لديه فعلاً حساب Resend متصل مسبقاً بمنصة حلاق ماب (يُستخدم لرسائل الحلاقين)، ونطاق `halaqmap.com` كان موثّقاً (Verified) فيه من قبل.
- **بمبدأ أقل صلاحية ممكنة**: بدل إعادة استخدام أي من مفاتيح API الموجودة (عدة مفاتيح "Full access")، تم إنشاء مفتاح جديد مخصص:
  - الاسم: `SUPABASE_AUTH_SMTP`
  - الصلاحية: **Sending access فقط** (ليست Full access)
  - القيد: مقيّد بنطاق `halaqmap.com` فقط
- تم إعداد SMTP المخصص في Supabase (Authentication → Emails → SMTP Settings):
  | الحقل | القيمة |
  |---|---|
  | Enable custom SMTP | ON |
  | Sender email address | `noreply@halaqmap.com` |
  | Sender name | خريطة الحل |
  | Host | `smtp.resend.com` |
  | Port | 465 |
  | Username | `resend` |
  | Password | مفتاح Resend API (لم يُعرض أو يُكتب نصياً في أي مكان — تم نسخه عبر زر النسخ في واجهة Resend ولصقه مباشرة عبر الحافظة، حماية لسرّية المفتاح) |
  | Minimum interval per user | 60 ثانية (افتراضي، لم يتغيّر) |
- **عائق تقني واجهته:** محاولة اللصق التلقائي للمفتاح عبر أتمتة المتصفح فشلت مرتين (لم يُسجَّل أي محتوى في الحقل)، وقراءة الحافظة نفسها للتشخيص محظورة عليّ لأسباب أمنية (تصنيف داخلي يمنع الوصول لقيم أسرار خام). **الحل:** طُلب من صاحب الحساب تنفيذ اللصق والحفظ يدوياً بنفسه، وهو ما تم بنجاح (تأكيد "Successfully updated settings" وتحقق مطابق بعد إعادة تحميل الصفحة بالكامل).
- **النتيجة المؤكدة:** حد إرسال إيميلات Auth (`emails/h`) في صفحة Rate Limits ارتفع تلقائياً من **2 إلى 30 إيميل/ساعة** فور تفعيل SMTP المخصص (هذا سلوك Supabase الافتراضي عند تفعيل SMTP مخصص، ويمكن رفعه يدوياً أكثر من نفس الصفحة).

---

## 5) الإصلاح الثاني: ترقية خطة Resend من Free إلى Pro

- **الخطة المجانية**: سقف صارم 100 إيميل/يوم، 3,000/شهر.
- **الاستخدام الفعلي وقت الفحص**: 93 إيميل خلال آخر 15 يوم فقط، معدل تسليم 100%، صفر ارتدادات — لا خطر فوري، لكن نفس فئة مشكلة الـ2/ساعة التي أُصلحت للتو، بسقف أعلى، ستتكرر عند النمو الحقيقي.
- **التوصية المقدَّمة وتم تنفيذها:** الترقية لخطة **Pro** ($20/شهر، 50,000 إيميل/شهر، **بلا سقف يومي**، فائض $0.90/1000 إيميل إضافي).
- صاحب الحساب أضاف بطاقة دفع بنفسه في Resend (تم التحقق منها عبر رسوم تحقق $0.00) — **لم أقم أنا بإدخال أي بيانات بطاقة دفع، هذا ممنوع عليّ كقاعدة أمان صارمة حتى بموافقة صريحة**.
- تم تنفيذ الترقية (بعد تأكيد صريح من صاحب الحساب على السعر): التكلفة **$0.20 اليوم** (نسبي)، ثم **$20/شهر** بانتظام. تأكيد النجاح: "Subscription updated successfully"، الخطة أصبحت Pro، Daily limit: Unlimited، التجديد القادم 10 أكتوبر.

---

## 6) الإصلاح الثالث (الأهم): صلاحيات service_role المفقودة على security_events / security_block_list — السبب الجذري لـ 97.6% من أخطاء Postgres

### 6.1 منهجية التشخيص
تم استنساخ مستودع GitHub العام `https://github.com/ritchstar/halaqmap.git` (بدون بيانات اعتماد، قراءة فقط) محلياً، والبحث النصي عن `security_events` و `security_block_list` عبر كامل الكود، مما أظهر 23 ملفاً مطابقاً في `supabase/migrations/`, `api/`, و `src/`.

### 6.2 السبب الجذري بدقة
- **ترحيل 74** (`supabase/migrations/74_prepare_data_api_explicit_grants_defaults.sql`) نفّذ:
  ```sql
  ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated, service_role;
  ```
  هذا يعني أن **أي جدول جديد** يُنشأ في `public` بعد هذا الترحيل **لا يحصل تلقائياً على أي صلاحية لأي دور — بما فيه service_role نفسه** — إلا إذا مُنحت صراحة في نفس ملف الترحيل الذي ينشئه.
- **ترحيل 89** (`89_security_protection.sql`) أنشأ `security_events` و `security_block_list` **بعد** ترحيل 74، وأضاف سياسات RLS فقط (`service_role_all_block_list`, `service_role_all_security_events` — `USING (auth.role() = 'service_role')`) لكنه **لم يُضِف أي عبارة GRANT إطلاقاً**. RLS طبقة منفصلة تماماً عن صلاحيات الجدول الأساسية (GRANT) — بدون GRANT لا يصل أي دور للجدول عبر PostgREST/Data API، **حتى لو سياسة RLS تسمح له نظرياً**.
- **دليل تأكيدي بالمقارنة:** الجدول الشقيق `payment_security_events` (ترحيل 55، **قبل** ترحيل 74) ما زال يعمل بشكل صحيح لأنه أُنشئ تحت السلوك القديم (منح تلقائي)، ثم ترحيل 74 نفسه منح `service_role` عليه صراحة كإجراء احترازي إضافي.
- **ترحيل 99** و **74** منحا `service_role` صراحة على جداول مشابهة أخرى (`platform_admin_financial_documents`, `platform_ops_controller_reports`, `admin_actions_log`, `payment_security_events`) — لكن **أبداً** لم يُمنح `security_events` أو `security_block_list`.
- **ترحيل 120** (`120_harden_public_rls_advisor.sql`) سحب لاحقاً *أيضاً* كل الصلاحيات عن `anon`/`authenticated`/`PUBLIC` على هذين الجدولين تحديداً (دفاع بالعمق مقصود)، **لكنه أيضاً لم يمنح شيئاً لـ service_role**.

**النتيجة العملية:** كل استدعاء من كود الخادم في:
- `api/_lib/securityGuard.ts`
- `api/admin-security-action.ts`
- `api/admin-security-agents.ts`

(وكلها تستخدم `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` من `@supabase/supabase-js`، أي عبر PostgREST Data API بمفتاح service_role) إلى `.from('security_events')` أو `.from('security_block_list')` — إدراج، قراءة، أو تحديث — كان يفشل بـ:
```
permission denied for table security_events
permission denied for table security_block_list
```
وهذا هو مصدر الغالبية العظمى (97.6%) من أخطاء Postgres المرصودة.

### 6.3 الإصلاح (طُبِّق مباشرة على الإنتاج)
لم أستطع تنفيذ SQL بنفسي (محظور آلياً كـ"تعديل إعدادات أمنية") — نفّذه صاحب الحساب في SQL Editor:
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.security_events TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.security_block_list TO service_role;

REVOKE ALL ON TABLE public.security_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.security_block_list FROM anon, authenticated;
```
النتيجة: "Success. No rows returned" — تم التطبيق بنجاح على قاعدة بيانات الإنتاج.

### 6.4 ⚠️ إجراء متبقٍ يحتاج Cursor/صاحب الحساب
تم تجهيز ملف ترحيل مطابق لإضافته لمجلد `supabase/migrations/` في المستودع، **لكنه لم يُضف بعد لمستودع GitHub الفعلي** (لا أملك صلاحية push):

**اسم الملف المقترح:** `supabase/migrations/20260910180000_security_events_service_role_grants.sql`

```sql
-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================================
-- Fix: security_events / security_block_list — missing service_role grants
-- =====================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.security_events TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.security_block_list TO service_role;

-- دفاع بالعمق: يبقى الجدولان مغلقين تماماً أمام anon/authenticated
REVOKE ALL ON TABLE public.security_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.security_block_list FROM anon, authenticated;
```
**هذا ضروري** حتى يتطابق سجل ترحيلات CLI (`supabase migration history` / `supabase db push`) مع الحالة الفعلية لقاعدة بيانات الإنتاج، ولتجنّب تكرار نفس الخطأ في أي بيئة جديدة (staging، تطوير محلي، CI) تُبنى من الترحيلات من الصفر.

---

## 7) الإصلاح الرابع: صفحة `/admin/cyber` — اشتراك Realtime على security_events كان سيستمر بالفشل + لم يعمل أصلاً منذ إنشائه

### 7.1 التشخيص
فحص `src/app/admin/cyber/page.tsx` كشف استخدام عميل Supabase من جهة المتصفح (`getSupabaseClient()` — مفتاح anon + جلسة JWT للمستخدم المصادَق):
```ts
channel = client
  .channel('cyber-ops-security-live')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'security_events',
  }, (payload) => { /* ... */ })
  .subscribe();
```

**اكتُشفت مشكلتان منفصلتان تماماً:**

**أ) صلاحيات:** حتى بعد إصلاح القسم 6، لا توجد أي سياسة RLS تسمح لدور `authenticated` (حساب أدمن يستخدم المتصفح، وليس service_role) بقراءة `security_events` — فيفشل فحص RLS الذي يجريه Realtime عند أي أدمن يفتح هذه الصفحة تحديداً (حجم أصغر بكثير من مشكلة القسم 6، لكنه موجود).

**ب) لم يعمل البث اللحظي من الأساس:** ترحيل 90 (`90_cyber_dvr_sessions.sql`) نفّذ `ALTER TABLE public.security_events REPLICA IDENTITY FULL;` لكنه **لم يُضِف الجدول فعلياً** إلى نشرة (publication) `supabase_realtime` عبر `ALTER PUBLICATION supabase_realtime ADD TABLE ...`. بدون هذه الخطوة، Postgres **لا يُصدر أي حدث تغيير لهذا الجدول إطلاقاً** — البث اللحظي لم يكن ليعمل حتى لو حُلّت مشكلة الصلاحيات وحدها.

### 7.2 التحقق من النمط الصحيح قبل التطبيق
تم التأكد أن نفس النمط بالضبط (GRANT + سياسة RLS محصورة بالمدراء + تسجيل في نشرة Realtime) **يعمل فعلاً** في نفس المستودع لجدول مشابه تماماً في الحساسية: `platform_booking_security_log` (ترحيلات 36 و37)، وكذلك `payment_security_events` (ترحيل 55) — كلاهما يستخدم دالة فحص الأدمن الموجودة فعلاً `public.is_jwt_platform_admin()` (بريد bootstrap: `ritchstar4@gmail.com`, `admin@halaqmap.com`، أو جدول `platform_admin_roles`)، وهي دالة مستخدمة في 15 ملف ترحيل مختلف، آخرها ترحيل 205.

### 7.3 الإصلاح (طُبِّق مباشرة على الإنتاج)
نفّذه صاحب الحساب في SQL Editor:
```sql
GRANT SELECT ON TABLE public.security_events TO authenticated;

DROP POLICY IF EXISTS "jwt_admin_select_security_events" ON public.security_events;
CREATE POLICY "jwt_admin_select_security_events"
  ON public.security_events FOR SELECT TO authenticated
  USING (public.is_jwt_platform_admin());

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'security_events'
  ) THEN
    RETURN;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.security_events;
END
$$;
```

### 7.4 التحقق (تم بنفسي مباشرة عبر واجهة Supabase، بدون كتابة أي SQL)
- **Database → Policies**: تأكدت من وجود السياستين على `security_events`: `jwt_admin_select_security_events` (SELECT → authenticated) و `service_role_all_security_events` (ALL) معاً.
- **Database → Publications → supabase_realtime**: تأكدت أن مفتاح تبديل (toggle) البث اللحظي لـ `security_events` أصبح **أخضر/مفعّل** ضمن قائمة الجداول.

### 7.5 ⚠️ إجراء متبقٍ يحتاج Cursor/صاحب الحساب
نفس الوضع كالقسم 6.4 — ملف الترحيل جاهز لكنه **لم يُضف بعد لمستودع GitHub**:

**اسم الملف المقترح:** `supabase/migrations/20260910190000_security_events_admin_realtime_feed.sql` (المحتوى مطابق تماماً للـ SQL في القسم 7.3 أعلاه، مع تعليقات توثيقية بالعربية).

---

## 8) أمور لوحظت لكن تُركت عمداً بلا معالجة (بقرار/بانتظار صاحب الحساب)

1. **فئة الحوسبة Nano على Supabase**: حدود صارمة (200 اتصال عميل أقصى، 15 pool size) — ستحتاج ترقية قبل أي نمو حقيقي في عدد المستخدمين المتزامنين. لم يُطلب التعامل معها في هذه الجلسة.
2. **`public.spatial_ref_sys`**: جدول نظام تابع لإضافة PostGIS، مملوك للدور `supabase_admin`، لذلك لا يمكن تفعيل RLS عليه مباشرة (`ALTER TABLE ... ENABLE RLS` يفشل لعدم الملكية). ترحيل 120 اتخذ الحل البديل المعتمد: سحب وصول Data API عنه بالكامل (الجدول لا حاجة فعلية لوصول عملاء له، فقط دوال PostGIS الداخلية تستخدمه). على الأرجح منخفض الأولوية — لم يُناقَش أكثر مع صاحب الحساب.
3. **ملفّا الترحيل الجديدان (القسمان 6.4 و7.5) غير مُضافَين بعد لمستودع GitHub الفعلي.** هذا أهم إجراء متبقٍ — بدونه، أي `supabase db push` مستقبلي من بيئة تطوير جديدة لن يعرف أن هذين الإصلاحين طُبِّقا على الإنتاج، وقد تتكرر نفس المشكلة (نسيان GRANT بعد ترحيل 74) في جداول مستقبلية إن لم يُنتبه لها.

---

## 9) ملاحظات تقنية عامة يستفيد منها Cursor عند العمل على هذا المستودع مستقبلاً

- **قاعدة يجب تذكّرها لكل جدول جديد بعد ترحيل 74:** أي `CREATE TABLE` جديد في `public` **يجب** أن يتضمّن في نفس ملف الترحيل عبارات `GRANT` الصريحة لكل دور يُفترض أن يصل للجدول (عادة `service_role` على الأقل)، وإلا فالجدول غير قابل للوصول عبر Data API/PostgREST من أي دور، **حتى service_role**. هذا خطأ سهل التكرار وقد وقع فيه فعلاً ترحيل 89.
- **دالة فحص صلاحية الأدمن الموحّدة:** `public.is_jwt_platform_admin()` (معرّفة في ترحيل 28) — تفحص بريد JWT مقابل قائمة bootstrap ثابتة (`ritchstar4@gmail.com`, `admin@halaqmap.com`) أو جدول `platform_admin_roles`. هذه الدالة (وليست `jwt_platform_admin_has_permission()` الأكثر تفصيلاً المستخدمة في بعض السياقات الأخرى مثل ترحيل 36) هي المستخدمة مع `security_events` هنا، اتساقاً مع نمط `payment_security_events`.
- **نمط الوصول من كود الخادم:** كل ملفات `api/*.ts` تصل لـ Supabase عبر `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` — أي دائماً عبر PostgREST Data API وليس اتصال Postgres مباشر. هذا يعني أن مشكلة "نسيان GRANT" تصيب حتى الكود الخادمي الموثوق (service_role)، وليست مقتصرة على العميل (anon/authenticated) فقط.
- **تسمية ملفات الترحيل:** التسلسل الرقمي `NN_description.sql` وصل حتى 205، ثم ظهر نمط `20260611060000_description.sql` (بالتاريخ) لملفين. اعتُمد نمط التاريخ للملفين الجديدين (القسمان 6.4 و7.5) لضمان ترتيبهما الصحيح بعد كل الملفات الـ207 الموجودة.
- **جميع اختبارات/إصلاحات هذه الجلسة طُبِّقت مباشرة على قاعدة بيانات الإنتاج (`main` / `PRODUCTION`)** عبر SQL Editor في Supabase Dashboard، وليس عبر بيئة تطوير أو staging منفصلة — لأن لا بيئة أخرى كانت متاحة/مذكورة.

---

*نهاية التقرير.*
