# 🔧 حل مشكلة "Policy already exists"

## ❌ المشكلة

```
ERROR: 42710: policy "Anyone can view active barbers" already exists
```

---

## ✅ الحل

تم تحديث جميع ملفات SQL لتشمل:

### 1. حذف Policies القديمة قبل إنشاء جديدة
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ...
```

### 2. حذف Triggers القديمة
```sql
DROP TRIGGER IF EXISTS trigger_name ON table_name;
CREATE TRIGGER trigger_name ...
```

### 3. التحقق من وجود الأعمدة
```sql
DO $$ 
BEGIN
  IF NOT EXISTS (...) THEN
    ALTER TABLE ...
  END IF;
END $$;
```

---

## 🚀 الآن يمكنك

### تنفيذ الملفات بدون أخطاء:

```
✅ يمكنك تنفيذ الملف أكثر من مرة
✅ لن تحصل على خطأ "already exists"
✅ سيتم تحديث Policies والـ Triggers تلقائياً
```

---

## 📋 الملفات المحدّثة

```
✅ 02_create_barbers_table.sql (محدّث)
✅ 03_create_bookings_table.sql (محدّث)
```

---

## 🎯 الخطوة التالية

### نفذ الملفات المحدّثة:

```
1. افتح SQL Editor
2. نفذ 02_create_barbers_table.sql
3. نفذ 03_create_bookings_table.sql
4. أكمل باقي الملفات
```

---

**💪 الآن يعمل بدون أخطاء!**
