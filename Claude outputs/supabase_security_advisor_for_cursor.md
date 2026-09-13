# تقرير فحص Supabase Security Advisor — لمراجعة كروسور

**التاريخ:** 11 سبتمبر 2026
**الصفحة المفحوصة:** `https://supabase.com/dashboard/project/lqzuhkzfhdhaosstduas/advisors/security`
**طريقة الفحص:** فتح الصفحة فعلياً عبر متصفح آلي وقراءة كل بنود الجدول (1 خطأ + 23 تحذير + 37 معلومة)، ثم التحقق من أخطر البنود (دوال SECURITY DEFINER) مباشرة من كود الـ migrations في المستودع (`supabase/migrations/`) — وليس الاكتفاء بأسماء التحذيرات من الواجهة. لم يُعدَّل أي شيء، فحص وتحقق فقط.

---

## 1) الخطأ الوحيد (Error): RLS Disabled in Public

- **الجدول:** `public.spatial_ref_sys`
- هذا جدول نظامي يأتي تلقائياً مع تثبيت إضافة **PostGIS** نفسها، ويحتوي فقط تعريفات أنظمة الإحداثيات الجغرافية (SRID) — لا بيانات مستخدمين أو بيانات تطبيق. ظهوره كخطأ في Security Advisor شائع جداً في كل مشروع Supabase يستخدم PostGIS.
- **التقييم:** مخاطرة منعدمة عملياً. الإصلاح القياسي (تفعيل RLS مع policy للقراءة العامة فقط) اختياري ولا يستحق أولوية.

---

## 2) التحذيرات (23 تحذيراً)

### أ) Extension in Public (1)
إضافة `postgis` مثبّتة داخل schema العام `public` بدل schema منفصل (مثل `extensions`). توصية Supabase القياسية نقلها، لكنه تغيير حساس على مشروع منشور فعلياً (قد يكسر أي دالة/view تشير إليها بدون schema مؤهَّل) — **لا أقترح تنفيذه دون تخطيط ونسخة احتياطية أولاً**.

### ب) دوال SECURITY DEFINER قابلة للتنفيذ (22 دالة)
هذه الفئة هي الأهم أمنياً لأن SECURITY DEFINER يعني الدالة تعمل بصلاحيات مالكها (تتجاوز RLS). قسّمتها Supabase إلى:
- **8 دوال قابلة للتنفيذ بدون تسجيل دخول (public):** `barber_has_active_listing`, `barber_listing_summary`, `get_barber_card_cta_flags`, `get_public_showcase_fallback`, `search_barbers_nearby`, و3 نسخ من `st_estimatedextent` (دالة PostGIS الأساسية نفسها، ليست من كودكم).
- **14 دالة قابلة للتنفيذ لمستخدمين مسجّلين فقط:** تكرار جزئي للقائمة أعلاه + `actor_has_platform_manage_admins`, `actor_has_platform_view_messages`, `close_private_conversation`, `jwt_platform_admin_has_permission`, `start_private_conversation`, `start_private_conversation_by_barber_id`.

**تحققت من كود الأكثر حساسية منها مباشرة (git clone + قراءة migrations):**

- `jwt_platform_admin_has_permission(p_key text)` (migration `36_platform_admin_permissions_rls_alignment.sql`) و`actor_has_platform_manage_admins()` / `actor_has_platform_view_messages()` (migration `35_platform_admin_rls_delegation_support_chat.sql`): كلها تشتق الهوية من `auth.jwt() ->> 'email'` الخاص بالمستخدم المتصل نفسه (لا يمكن تزويره من العميل)، ولا تُرجع سوى `true/false` لصلاحيات **المستخدم المتصل نفسه** — بالإضافة `REVOKE ALL ... FROM PUBLIC` صريح ثم `GRANT ... TO authenticated`. **تصميم آمن.**

- `start_private_conversation_by_barber_id(p_barber_id uuid)` (أحدث نسخة في `44_private_chat_start_barber_errors.sql`) و`close_private_conversation(p_conversation_id uuid)` (`22_private_customer_barber_chat_rls.sql`): كلتاهما تشتقّان هوية المستخدم من `auth.uid()` داخل الدالة (لا تثقان بأي معرّف "من أنا" يُرسله العميل كمعامل)، و`close_private_conversation` تتحقق صراحة أن `auth.uid()` طرف فعلي في المحادثة (`c.customer_id = auth.uid() OR c.barber_user_id = auth.uid()`) قبل الإغلاق. **تصميم آمن ولا ثغرة انتحال هوية.**

- دوال `st_estimatedextent` هي دوال PostGIS القياسية نفسها (جزء من الإضافة، ليست كودكم) — قابليتها للتنفيذ العام متوقعة وغير قابلة للتفادي إلا بنقل postgis خارج `public` (البند أ أعلاه).

**⚠️ الملاحظة الوحيدة التي تستحق تأكيدكم — تسريب رقم هاتف عام:**

`search_barbers_nearby(...)` (أحدث نسخة في `20260611060100_barber_gallery_public.sql`، دالة **قابلة للتنفيذ بدون تسجيل دخول**) تُرجع عمود **`phone`** ضمن نتائج كل حلاق في نتائج البحث العام (تُقرأ من `public.barbers_public_directory`). بمعنى: **أي زائر غير مسجّل** يستدعي هذه الدالة (وهي المستخدمة في البحث/الخريطة العامة للموقع) يحصل على رقم هاتف كل حلاق ظاهر في النتائج.

**المطلوب تأكيده:** هل عرض رقم هاتف الحلاق للزوار غير المسجّلين **مقصود** (كدليل تواصل عام لجذب العملاء)، أم يُفترض أن يظهر فقط بعد تسجيل الدخول أو بعد بدء محادثة؟ إن لم يكن مقصوداً، الإصلاح بسيط: حذف `phone` من `RETURNS TABLE` ومن الـ `SELECT` في `search_barbers_nearby`، وإضافته فقط في دالة/مسار مخصص للمستخدمين المسجّلين إن لزم.

---

## 3) المعلوماتية (37 اقتراحاً) — كلها من نفس النوع: RLS Enabled No Policy

37 جدولاً لديها RLS **مفعّل** لكن **بدون أي policy معرّفة**. هذا يعني عملياً أن **كل وصول (قراءة/كتابة) عبر anon أو authenticated مرفوض بالكامل افتراضياً** — وهو السلوك الآمن (fail-closed)، وليس ثغرة. هذه الجداول لا يصلها إلا service_role key من الخادم.

**القائمة الكاملة (37):**
`admin_activity_log`, `admin_magic_login_tokens`, `agent_conversations`, `ambassador_payout_requests`, `ambassador_target_requests`, `ambassador_wallet_ledger`, `ambassadors`, `barber_gallery_items`, `barber_interest_signups`, `barber_portal_magic_redemptions`, `barber_push_subscriptions`, `bronze_trial_applications`, `bronze_trial_codes`, `chat_line_translations`, `coverage_salon_nominations`, `enterprise_cohort_seats`, `enterprise_partner_cohorts`, `fleet_demand_counters`, `fleet_operational_pulse`, `fleet_salon_stagnation_pulse`, `partner_promo_video_config`, `partner_tutorial_videos`, `partner_tutorial_videos_config`, `platform_ops_billing_commitments`, `platform_ops_billing_poll_state`, `platform_payment_settings`, `platform_presence`, `platform_support_messages`, `request_history`, `salon_members`, `salon_ops_events`, `store_affiliate_ledger`, `store_affiliate_magic_links`, `store_affiliate_marketers`, `store_affiliate_sessions`, `system_settings`, `whatsapp_agent_sessions`.

**المطلوب تأكيده:** هل يحاول أي جزء من الواجهة الأمامية (كود العميل) الوصول لأي من هذه الجداول مباشرة عبر Supabase client SDK بمفتاح anon/authenticated؟ إن كان كذلك، سيفشل الاستدعاء **بصمت** (يرجع نتائج فارغة بدل خطأ واضح) بدل أن يُبلّغ عن مشكلة — يستحق `grep` سريع في الكود عن أسماء هذه الجداول في استدعاءات `.from('...')` من جهة العميل (ليس من `api/` الذي يستخدم عادة service role) للتأكد من عدم وجود اعتماد مكسور بصمت.

---

## الطلب من كروسور

1. تأكيد صريح: هل عرض `phone` في نتائج `search_barbers_nearby` العامة **مقصود** أم يحتاج إصلاح؟
2. فحص سريع (`grep`) في كود الواجهة الأمامية عن أي استدعاء client-side لأي من الـ37 جدولاً أعلاه، للتأكد من عدم وجود ميزة معطّلة بصمت بسبب عدم وجود policy.
3. لا حاجة لأي إجراء بخصوص بند `spatial_ref_sys` أو `Extension in Public` — منخفضا الأولوية ولا يستحقان وقتاً الآن.
4. لا حاجة للتحقق من دوال `jwt_platform_admin_has_permission`، `actor_has_platform_manage_admins/view_messages`، `start_private_conversation*`، `close_private_conversation` — تم التحقق من كودها هنا مباشرة وهي آمنة التصميم.
