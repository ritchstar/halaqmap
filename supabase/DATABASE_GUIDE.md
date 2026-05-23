# 🗄️ دليل قاعدة البيانات - حلاق ماب

## 📋 نظرة عامة

تم إنشاء **12 جدول** و **1 Storage Bucket** لمنصة حلاق ماب.

---

## 📊 الجداول المُنشأة

### الجداول الأساسية (6):
1. ✅ **profiles** - ملفات المستخدمين
2. ✅ **barbers** - بيانات الحلاقين
3. ✅ **bookings** - الحجوزات
4. ✅ **payments** - المدفوعات
5. ✅ **subscriptions** - الاشتراكات
6. ✅ **reviews** - التقييمات

### الجداول الإضافية (6):
7. ✅ **notifications** - الإشعارات
8. ✅ **messages** - الرسائل
9. ✅ **barber_services** - خدمات الحلاق
10. ✅ **working_hours** - أوقات العمل
11. ✅ **categories** - التصنيفات
12. ✅ **subscription_requests** - طلبات الاشتراك

### Storage:
13. ✅ **barber-images** - تخزين الصور

---

## 🚀 كيفية تنفيذ الملفات

### الطريقة 1: عبر Supabase Dashboard (الأسهل)

#### الخطوة 1: اذهب إلى SQL Editor
```
https://supabase.com/dashboard/project/YOUR_PROJECT_REF/sql
```

#### الخطوة 2: نفذ الملفات بالترتيب

انسخ محتوى كل ملف وألصقه في SQL Editor ثم اضغط **Run**:

```
1. 01_create_profiles_table.sql
2. 02_create_barbers_table.sql
3. 03_create_bookings_table.sql
4. 04_create_payments_table.sql
5. 05_create_subscriptions_table.sql
6. 06_create_reviews_table.sql
7. 07_create_notifications_table.sql
8. 08_create_messages_table.sql
9. 09_create_barber_services_table.sql
10. 10_create_working_hours_table.sql
11. 11_create_categories_table.sql
12. 12_create_subscription_requests_table.sql
13. 13_create_storage.sql
14. 14_registration_submissions_public.sql
15. 15_admin_jwt_platform_rls.sql
16. 16_rating_invite_qr_reviews.sql
```

**ملخص 16:** يضيف `rating_invite_token` لجدول `barbers` (رابط/QR تقييم خاص بكل حلاق)، ويضيف لجدول
`reviews` الحقول `via_qr_invite` و`is_public` و`is_highlighted` لربط الواجهة لاحقاً بسياسة العرض.

---

### الطريقة 2: عبر Supabase CLI

#### الخطوة 1: تثبيت Supabase CLI
```bash
npm install -g supabase
```

#### الخطوة 2: تسجيل الدخول
```bash
supabase login
```

#### الخطوة 3: ربط المشروع
```bash
cd halaqmap
supabase link --project-ref YOUR_PROJECT_REF
```

#### الخطوة 4: تنفيذ Migrations
```bash
supabase db push
```

---

## 🔐 الأمان (Row Level Security)

### تم تفعيل RLS على جميع الجداول:

#### للعملاء:
- ✅ يمكنهم رؤية ملفاتهم الشخصية
- ✅ يمكنهم رؤية حجوزاتهم فقط
- ✅ يمكنهم إنشاء حجوزات
- ✅ يمكنهم إضافة تقييمات

#### للحلاقين:
- ✅ يمكنهم رؤية ملفاتهم
- ✅ يمكنهم رؤية حجوزاتهم
- ✅ يمكنهم إدارة خدماتهم
- ✅ يمكنهم الرد على التقييمات
- ✅ يمكنهم رؤية مدفوعاتهم

#### للأدمن:
- ✅ يمكنهم رؤية كل شيء
- ✅ يمكنهم إدارة كل شيء
- ✅ يمكنهم الموافقة على طلبات الاشتراك

---

## 🔔 الإشعارات التلقائية

### Triggers المُفعّلة:

1. **عند حجز جديد:**
   - ✅ إرسال إشعار للحلاق

2. **عند رسالة جديدة:**
   - ✅ إرسال إشعار للمستقبل

3. **عند تقييم جديد:**
   - ✅ تحديث rating الحلاق تلقائياً

4. **عند الموافقة على اشتراك:**
   - ✅ إنشاء اشتراك تلقائياً
   - ✅ تحديث tier الحلاق
   - ✅ إرسال إشعار للحلاق

---

## 📈 الإحصائيات

### ما تم إنشاؤه:

```
✅ 12 جدول
✅ 30+ سياسة أمنية (RLS Policies)
✅ 15+ Trigger
✅ 10+ Function
✅ 20+ Index للأداء
✅ 1 Storage Bucket
```

---

## 🎯 الخطوة التالية

بعد تنفيذ جميع الملفات:

### 1. ربط Frontend بـ Backend
```typescript
// سيتم إنشاء ملف:
src/integrations/supabase/client.ts
```

### 2. إنشاء Types
```typescript
// سيتم إنشاء:
src/integrations/supabase/types.ts
```

### 3. تفعيل Authentication
```typescript
// سيتم تفعيل:
- تسجيل الدخول
- التسجيل
- إعادة تعيين كلمة المرور
```

---

## 🆘 حل المشاكل

### المشكلة: خطأ في تنفيذ SQL

**الحل:**
1. تأكد من تنفيذ الملفات بالترتيب
2. تحقق من عدم وجود الجدول مسبقاً
3. راجع رسالة الخطأ

### المشكلة: RLS يمنع الوصول

**الحل:**
1. تأكد من تسجيل الدخول
2. تحقق من user_type في جدول profiles
3. راجع Policies

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. راجع رسالة الخطأ في SQL Editor
2. تحقق من Logs في Supabase Dashboard
3. اسألني عن أي استفسار

---

**© 2026 حلاق ماب - جميع الحقوق محفوظة**

**آخر تحديث: 2026-04-09**
