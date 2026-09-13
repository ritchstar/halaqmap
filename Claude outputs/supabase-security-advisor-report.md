# تقرير Supabase Security Advisor — Halaq Map (المشروع الرئيسي)

**التاريخ:** 8 سبتمبر 2026
**المشروع:** `lqzuhkzfhdhaosstduas` (main / Production) — منظمة ritchstar4@gmail.com
**المصدر:** لوحة Security Advisor مباشرة (تم استخراج كل بند بند من اللوحة الحية، وليس تخمينًا)
**الإجمالي:** 1 خطأ (Error) + 37 تحذير (Warning) + 37 اقتراح (Info) = **75 بندًا**

> ملاحظة مهمة: هذا تقرير **تشخيصي فقط** — لم يتم تنفيذ أي تعديل فعلي على قاعدة البيانات أو الصلاحيات. أي تغيير على RLS أو الصلاحيات (grants) هو تعديل مباشر على إعدادات أمنية حساسة في بيئة إنتاج (Production)، لذا يجب أن ينفَّذه Cursor (أو فريق التطوير) بعد المراجعة، ثم يمكنني التحقق من النتيجة بعد النشر كالعادة.

---

## ملخص الأولويات

| المستوى | العدد | الوصف |
|---|---|---|
| 🔴 حرج جدًا — مراجعة فورية | 7 | دوال إدارية (admin) قابلة للاستدعاء من أي مستخدم مسجّل دخول |
| 🟠 عالي | 10 | دوال SECURITY DEFINER قابلة للاستدعاء بدون تسجيل دخول إطلاقًا |
| 🟡 متوسط | 5 | حاويات تخزين (buckets) عامة تسمح بسرد كل الملفات |
| 🟡 متوسط | 14 | دوال SECURITY DEFINER أخرى قابلة للاستدعاء من أي مستخدم مسجّل (أقل حساسية من الفئة الحرجة) |
| 🟢 منخفض | 1 | إضافة PostGIS مثبَّتة في مخطط public |
| 🔵 يحتاج تأكيد وظيفي (ليس خطرًا أمنيًا مباشرة) | 37 | جداول مفعّل عليها RLS لكن بدون أي سياسة — أي **لا أحد** يقدر يقرأها حاليًا من التطبيق (عدا service_role) |
| ⚪ حالة خاصة معروفة | 1 | `spatial_ref_sys` — جدول نظام تابع لـ PostGIS، غالبًا لا يمكن تفعيل RLS عليه فعليًا |

---

## 🔴 المستوى الأول (الأخطر): دوال إدارية يقدر يستدعيها أي مستخدم مسجّل دخول

هذه الفئة **الأهم على الإطلاق**. هذه الدوال تحمل خاصية `SECURITY DEFINER` (تُنفَّذ بصلاحيات منشئها، غالبًا تتجاوز RLS)، وأسماؤها توحي بوظائف إدارية حسّاسة (حذف سجلات، صلاحيات مدير، بيانات تشغيلية للمنصة) — لكن حسب تقرير Advisor فهي مسموحة لأي مستخدم مسجّل دخول عادي (authenticated) وليس فقط للمدراء. إن لم يكن هناك تحقق داخلي إضافي من صلاحية "أدمن" داخل جسم كل دالة، فهذه ثغرة تصعيد صلاحيات (privilege escalation) حقيقية.

| الدالة | الخطر المحتمل |
|---|---|
| `public.actor_has_platform_manage_admins()` | تتعلق بصلاحية إدارة المدراء أنفسهم |
| `public.actor_has_platform_view_messages()` | تتعلق بعرض رسائل على مستوى المنصة |
| `public.admin_purge_old_platform_logs(p_days integer)` | **حذف** سجلات على مستوى المنصة |
| `public.admin_purge_orphan_barber_portfolio_objects()` | **حذف** ملفات تخزين (portfolio) |
| `public.admin_purge_partner_promo_storage_objects()` | **حذف** ملفات تخزين (promo) |
| `public.admin_purge_registration_storage_objects()` | **حذف** ملفات تخزين (تسجيل) |
| `public.jwt_platform_admin_has_permission(p_key text)` | فحص/منح صلاحيات أدمن |
| `public.get_platform_resource_snapshot()` | كشف بيانات تشغيلية داخلية عن المنصة |

**الإجراء الموصى به لكل دالة (يحتاج تأكيد Cursor حسب الاستخدام الفعلي في الكود):**
```sql
REVOKE EXECUTE ON FUNCTION public.admin_purge_old_platform_logs(integer) FROM authenticated;
-- كرر لكل دالة أعلاه، ثم إن كانت تُستدعى من الواجهة الإدارية فقط،
-- تأكد من استدعائها عبر مسار يستخدم service_role (Edge Function / خادم خلفي) لا من عميل المتصفح مباشرة.
```
إن كانت أي من هذه الدوال تحتوي بالفعل على فحص داخلي `IF NOT is_admin() THEN RAISE EXCEPTION` فهذا يخفف الخطر جزئيًا، لكن يبقى الأفضل عدم تعريض EXECUTE أصلًا لغير الأدمن — دفاع متعدد الطبقات.

---

## 🟠 المستوى الثاني: دوال SECURITY DEFINER قابلة للاستدعاء بدون تسجيل دخول إطلاقًا (10)

هذه تعمل حتى بدون تسجيل دخول (anon). بعضها **متعمَّد بوضوح** لأنها تخدم تصفح عام (بحث الحلاقين، صفحة عرض عامة)، لكن يستحق كل واحد تأكيدًا سريعًا أنه لا يُرجع بيانات حسّاسة أو يسمح بعملية كتابة.

| الدالة | ملاحظة |
|---|---|
| `public.search_barbers_nearby(...)` | محتمل أنها متعمَّدة (بحث عام) — تأكدوا أنها SELECT فقط ولا تُرجع بيانات اتصال حساسة |
| `public.get_public_showcase_fallback()` | يبدو متعمَّدًا (اسمها "public") |
| `public.barber_has_active_listing(p_barber_id uuid)` | تأكيد فقط أنها تُرجع boolean ولا تكشف بيانات إضافية |
| `public.barber_listing_summary(p_barber_id uuid)` | تحققوا من نوع البيانات المُعادة |
| `public.create_booking_safe(p_barber_id uuid, p_customer_name text, p_customer_phone text, p_service_...)` | ⚠️ هذه تكتب حجزًا فعليًا — يستحق مراجعة حماية من إساءة استخدام (spam/rate-limit) حتى لو الوظيفة متعمَّدة للعامة |
| `public.get_barber_card_cta_flags(p_ids uuid[])` | مراجعة خفيفة |
| `public.run_private_chat_maintenance()` | ⚠️ اسمها يوحي بأنها **صيانة داخلية**، ليست وظيفة يجب أن يستدعيها أي زائر مجهول — مرشّحة قوية للـ REVOKE من anon |
| `public.st_estimatedextent(text, text)` / `(text, text, text)` / `(text, text, text, boolean)` | هذه دوال **PostGIS نفسها** (ليست من كودكم) — سبب ظهورها أن PostGIS مثبّتة في public؛ نقلها لمخطط extensions (انظر أدناه) يحل هذا تلقائيًا |

---

## 🟡 المستوى الثالث: باقي دوال "Signed-In Users Can Execute" (14 المتبقية من أصل 21)

أقل حساسية من الفئة الحرجة أعلاه، لكن تستحق نفس المراجعة (هل يجب أن تكون بصلاحية authenticated عامة أم مقيّدة أكثر؟):

`barber_has_active_listing`, `barber_listing_summary`, `close_private_conversation`, `create_booking_safe`, `get_barber_card_cta_flags`, `get_public_showcase_fallback`, `run_private_chat_maintenance`, `search_barbers_nearby`, `start_private_conversation`, `start_private_conversation_by_barber_id`, `st_estimatedextent` (3 نسخ zoom مختلفة — من PostGIS).

`close_private_conversation` و`start_private_conversation*` منطقيًا يجب أن تكون بصلاحية authenticated (يحتاجها أي مستخدم مسجّل ليبدأ محادثة) — هذه غالبًا **سليمة كما هي** ولا تحتاج تغييرًا.

---

## 🟡 المستوى الرابع: حاويات تخزين عامة تسمح بسرد الملفات (5 buckets)

| الحاوية | الخطر |
|---|---|
| `storage.barber-images` | أي شخص يقدر يسرد كل أسماء/مسارات الملفات في الحاوية (وليس فقط قراءة ملف يعرف رابطه) |
| `storage.barber-portfolio` | نفس الخطر |
| `storage.barber-team` | نفس الخطر |
| `storage.partner-promo` | نفس الخطر |
| `storage.shop-images` | نفس الخطر |

**الفرق المهم:** كون الحاوية "عامة" لعرض الصور أمر طبيعي ومقصود لتطبيق كهذا (صور المتاجر/الحلاقين تُعرض للجميع) — المشكلة تحديدًا هي **"Listing"** (سرد قائمة الملفات كاملة)، وليس القراءة. الحل المعتاد:
```sql
-- بدلًا من سياسة SELECT عامة على كل storage.objects لهذه الحاوية،
-- قيّدوها بحيث SELECT يسمح بالقراءة (للعرض) لكن بدون سرد شامل،
-- أو أضيفوا policy تسمح فقط بمسارات (prefix) محددة معروفة مسبقًا للعميل بدل السرد الحر.
```
هذا يحتاج قرار منتج (Product decision) مع Cursor: هل التطبيق فعليًا يعتمد على "سرد" محتويات هذه الحاويات من الواجهة؟ إن كانت الإجابة لا، فالتقييد آمن 100%.

---

## 🟢 المستوى الخامس: إضافة PostGIS في مخطط public (منخفض الأولوية)

```
public.postgis
```
ممارسة أفضل شائعة هي نقل الإضافة لمخطط مخصص باسم `extensions` بدل `public`، لتقليل التلوث في مساحة الأسماء العامة. هذا يحل أيضًا جزءًا من تحذيرات `st_estimatedextent` أعلاه تلقائيًا. **يحتاج حذر عند التنفيذ** — نقل إضافة PostGIS قد يتطلب تحديث أي استعلامات تشير لدوالها بمسار كامل، ويفضّل اختباره في بيئة staging أولًا إن وُجدت.

---

## 🔵 المستوى السادس: 37 جدولًا مفعّل عليها RLS لكن بدون أي سياسة (Info)

هذه ليست "ثغرة" بالمعنى الحرفي — العكس تمامًا: RLS مفعّل بدون أي policy يعني **رفض كامل بشكل افتراضي** (لا أحد، حتى المستخدم المسجّل، يقدر يقرأ/يكتب هذه الجداول عبر مفاتيح anon/authenticated؛ فقط service_role من الخادم يقدر). لذلك صنّفتها Supabase كـ"معلومة" لا "تحذير".

**لكن هذا يستحق تأكيدًا وظيفيًا من Cursor لكل جدول**، لأن هناك احتمالين:
1. **متعمَّد** — الجدول يُستخدم فقط من كود خادم/Edge Functions بمفتاح service_role (لا مشكلة، إغلاق آمن).
2. **خلل غير مقصود** — ميزة في التطبيق يُفترض أن تقرأ من هذا الجدول مباشرة من العميل، لكنها معطّلة بصمت بسبب غياب أي policy (يظهر للمستخدم كـ"لا بيانات" أو خطأ صلاحية غامض).

أسماء تستحق فحصًا أولويًا لأنها تبدو مرتبطة مباشرة بميزات يستخدمها المستخدم النهائي مباشرة (وليس فقط الأدمن):

`barber_push_subscriptions`, `salon_members`, `request_history`, `platform_support_messages`, `chat_line_translations`, `store_affiliate_marketers`, `store_affiliate_sessions`, `ambassadors`, `ambassador_wallet_ledger`, `bronze_trial_applications`, `bronze_trial_codes`

القائمة الكاملة (37):
`admin_activity_log`, `admin_magic_login_tokens`, `agent_conversations`, `ambassador_payout_requests`, `ambassador_target_requests`, `ambassador_wallet_ledger`, `ambassadors`, `barber_gallery_items`, `barber_interest_signups`, `barber_portal_magic_redemptions`, `barber_push_subscriptions`, `bronze_trial_applications`, `bronze_trial_codes`, `chat_line_translations`, `coverage_salon_nominations`, `enterprise_cohort_seats`, `enterprise_partner_cohorts`, `fleet_demand_counters`, `fleet_operational_pulse`, `fleet_salon_stagnation_pulse`, `partner_promo_video_config`, `partner_tutorial_videos`, `partner_tutorial_videos_config`, `platform_ops_billing_commitments`, `platform_ops_billing_poll_state`, `platform_payment_settings`, `platform_presence`, `platform_support_messages`, `request_history`, `salon_members`, `salon_ops_events`, `store_affiliate_ledger`, `store_affiliate_magic_links`, `store_affiliate_marketers`, `store_affiliate_sessions`, `system_settings`, `whatsapp_agent_sessions`

---

## ⚪ الخطأ الوحيد (Error): `public.spatial_ref_sys`

```
RLS Disabled in Public — public.spatial_ref_sys
```
هذا جدول نظام تابع لإضافة PostGIS نفسها (يحتوي بيانات مرجعية عامة للإحداثيات الجغرافية، لا بيانات حساسة إطلاقًا). في أغلب بيئات Supabase المُدارة، **لا يمكن تفعيل RLS عليه لأنكم لا تملكونه** (مملوك لدور PostGIS النظامي) — هذا معروف كحالة خاصة موثّقة من Supabase نفسها ويُعتبر غالبًا اقتراحًا يمكن تجاهله بأمان. اطلبوا من Cursor تأكيد ذلك فقط (محاولة `ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;` في SQL Editor — إن ظهر خطأ صلاحية "must be owner"، فهذا يثبت أنه لا يمكن إصلاحه من جانبكم، وهو أمر متوقع وآمن تجاهله).

---

## خطة العمل المقترحة (بالترتيب)

1. **فورًا:** مراجعة الدوال الإدارية السبع (المستوى الأول) — تأكيد إن كانت تحتوي فحص أدمن داخلي، وإلا REVOKE EXECUTE من `authenticated` فورًا.
2. **هذا الأسبوع:** مراجعة الدوال العشر القابلة للاستدعاء بدون تسجيل دخول (المستوى الثاني)، خصوصًا `run_private_chat_maintenance`.
3. **هذا الأسبوع:** قرار منتج بخصوص "Listing" في الـ5 حاويات، ثم تطبيق سياسة أضيق.
4. **حسب الوقت المتاح:** فحص الـ37 جدولًا بدون policy — تأكيد أيها متعمَّد الإغلاق وأيها خلل وظيفي يحتاج policy فعلي.
5. **منخفضة الأولوية:** نقل PostGIS من public إلى مخطط extensions.
6. **تجاهل بأمان (على الأغلب):** خطأ `spatial_ref_sys` بعد تأكيد واحد سريع.

بعد أن ينفّذ Cursor أي تعديل من هذه، أرسلوا لي التفاصيل وسأتحقق مباشرة من لوحة Security Advisor نفسها (إعادة تشغيل الفحص) للتأكد من انخفاض العدد فعليًا، بنفس أسلوب التحقق المستقل المعتاد.
