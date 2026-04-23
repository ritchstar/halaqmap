# 🗄️ قاعدة بيانات حلاق ماب

تم إنشاء قاعدة بيانات كاملة لمنصة حلاق ماب باستخدام Supabase (PostgreSQL).

---

## 📊 الإحصائيات

```
✅ 12 جدول
✅ 30+ سياسة أمنية (RLS)
✅ 15+ Trigger
✅ 10+ Function
✅ 20+ Index
✅ 1 Storage Bucket
```

---

## 📁 الملفات

### Migrations (في مجلد `supabase/migrations/`):

```
01_create_profiles_table.sql          - ملفات المستخدمين
02_create_barbers_table.sql           - بيانات الحلاقين
03_create_bookings_table.sql          - الحجوزات
04_create_payments_table.sql          - المدفوعات
05_create_subscriptions_table.sql     - الاشتراكات
06_create_reviews_table.sql           - التقييمات
07_create_notifications_table.sql     - الإشعارات
08_create_messages_table.sql          - الرسائل
09_create_barber_services_table.sql   - خدمات الحلاق
10_create_working_hours_table.sql     - أوقات العمل
11_create_categories_table.sql        - التصنيفات
12_create_subscription_requests_table.sql - طلبات الاشتراك
13_create_storage.sql                 - تخزين الصور
14_registration_submissions_public.sql - قراءة عامة لطلبات التسجيل (حسب الحاجة)
15_admin_jwt_platform_rls.sql         - صلاحيات أدمن JWT للمنصّة
16_rating_invite_qr_reviews.sql       - رمز دعوة التقييم (barbers) + حقول التقييم (reviews)
```

### الأدلة:

```
DATABASE_GUIDE.md  - دليل شامل
QUICK_START.txt    - خطوات سريعة
```

---

## 🚀 التنفيذ

### الطريقة السريعة:

1. افتح: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/sql
2. انسخ محتوى كل ملف بالترتيب
3. الصق في SQL Editor
4. اضغط **Run**

**راجع `QUICK_START.txt` للتفاصيل**

---

## 🔐 الأمان

- ✅ Row Level Security على جميع الجداول
- ✅ Policies للصلاحيات (عميل/حلاق/أدمن)
- ✅ Triggers للإشعارات التلقائية
- ✅ Functions آمنة (SECURITY DEFINER)

---

## 🔔 الميزات

### الإشعارات التلقائية:
- ✅ عند حجز جديد
- ✅ عند رسالة جديدة
- ✅ عند تقييم جديد
- ✅ عند الموافقة على اشتراك

### التحديثات التلقائية:
- ✅ تحديث rating الحلاق عند تقييم
- ✅ تحديث tier الحلاق عند اشتراك
- ✅ تحديث updated_at تلقائياً

---

## 📞 الدعم

راجع `DATABASE_GUIDE.md` للدليل الشامل

---

**© 2026 حلاق ماب**
