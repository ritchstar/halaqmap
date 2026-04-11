# 🎉 تم ربط Frontend بـ Backend بنجاح!

---

## ✅ ما تم إنجازه

### **1. إنشاء Supabase Client:**
```typescript
// src/integrations/supabase/client.ts
import { supabase } from '@/integrations/supabase';
```

### **2. إنشاء Types:**
```typescript
// src/integrations/supabase/types.ts
import type { Database } from '@/integrations/supabase';
```

### **3. ملف البيئة:**
```
// .env
VITE_SUPABASE_URL=https://lqzuhkzfhdhaosstduas.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

---

## 📚 كيفية الاستخدام

### **1. استيراد Supabase Client:**

```typescript
import { supabase } from '@/integrations/supabase';
```

### **2. قراءة البيانات:**

```typescript
// جلب جميع الحلاقين
const { data: barbers, error } = await supabase
  .from('barbers')
  .select('*')
  .eq('is_active', true);

// جلب حلاق واحد
const { data: barber } = await supabase
  .from('barbers')
  .select('*')
  .eq('id', barberId)
  .single();
```

### **3. إضافة بيانات:**

```typescript
// إنشاء حجز جديد
const { data, error } = await supabase
  .from('bookings')
  .insert({
    barber_id: 'xxx',
    customer_name: 'أحمد',
    customer_phone: '0501234567',
    service_name: 'قص شعر',
    booking_date: '2026-04-10',
    booking_time: '14:00'
  });
```

### **4. تحديث بيانات:**

```typescript
// تحديث حالة الحجز
const { error } = await supabase
  .from('bookings')
  .update({ status: 'confirmed' })
  .eq('id', bookingId);
```

### **5. حذف بيانات:**

```typescript
// حذف حجز
const { error } = await supabase
  .from('bookings')
  .delete()
  .eq('id', bookingId);
```

---

## 🔐 Authentication

### **1. تسجيل الدخول:**

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### **2. التسجيل:**

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'أحمد محمد'
    }
  }
});
```

### **3. تسجيل الخروج:**

```typescript
const { error } = await supabase.auth.signOut();
```

### **4. الحصول على المستخدم الحالي:**

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

---

## 🔔 Real-time Subscriptions

### **الاستماع للتغييرات:**

```typescript
// الاستماع للحجوزات الجديدة
const subscription = supabase
  .channel('bookings')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'bookings'
  }, (payload) => {
    console.log('حجز جديد:', payload.new);
  })
  .subscribe();

// إلغاء الاشتراك
subscription.unsubscribe();
```

---

## 📦 Storage (الصور)

### **1. رفع صورة:**

```typescript
const file = event.target.files[0];
const fileExt = file.name.split('.').pop();
const fileName = `${Math.random()}.${fileExt}`;
const filePath = `${user.id}/${fileName}`;

const { error } = await supabase.storage
  .from('barber-images')
  .upload(filePath, file);
```

### **2. الحصول على رابط الصورة:**

```typescript
const { data } = supabase.storage
  .from('barber-images')
  .getPublicUrl(filePath);

const imageUrl = data.publicUrl;
```

### **3. حذف صورة:**

```typescript
const { error } = await supabase.storage
  .from('barber-images')
  .remove([filePath]);
```

---

## 🔍 البحث الجغرافي

### **البحث عن حلاقين قريبين:**

```typescript
// البحث ضمن 5 كم
const { data: nearbyBarbers } = await supabase.rpc('search_nearby_barbers', {
  user_lat: 24.7136,
  user_lng: 46.6753,
  radius_km: 5
});
```

---

## 📊 أمثلة عملية

### **1. صفحة الحلاقين:**

```typescript
import { supabase } from '@/integrations/supabase';
import { useEffect, useState } from 'react';

export function BarbersPage() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBarbers() {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (data) setBarbers(data);
      setLoading(false);
    }

    fetchBarbers();
  }, []);

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      {barbers.map(barber => (
        <div key={barber.id}>
          <h3>{barber.name}</h3>
          <p>التقييم: {barber.rating} ⭐</p>
        </div>
      ))}
    </div>
  );
}
```

### **2. نموذج الحجز:**

```typescript
import { supabase } from '@/integrations/supabase';
import { useState } from 'react';

export function BookingForm({ barberId }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    
    const { error } = await supabase
      .from('bookings')
      .insert({
        barber_id: barberId,
        customer_name: formData.get('name'),
        customer_phone: formData.get('phone'),
        service_name: formData.get('service'),
        booking_date: formData.get('date'),
        booking_time: formData.get('time')
      });

    if (error) {
      alert('حدث خطأ: ' + error.message);
    } else {
      alert('تم الحجز بنجاح!');
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="الاسم" required />
      <input name="phone" placeholder="الجوال" required />
      <input name="service" placeholder="الخدمة" required />
      <input name="date" type="date" required />
      <input name="time" type="time" required />
      <button disabled={loading}>
        {loading ? 'جاري الحجز...' : 'احجز الآن'}
      </button>
    </form>
  );
}
```

---

## 🎯 الخطوة التالية

الآن يمكنك:

1. ✅ استخدام Supabase في أي مكون
2. ✅ قراءة وكتابة البيانات
3. ✅ تفعيل Authentication
4. ✅ رفع الصور
5. ✅ الاستماع للتغييرات الفورية

---

## 📞 الدعم

راجع:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)

---

**© 2026 حلاق ماب - جميع الحقوق محفوظة**
