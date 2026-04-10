# 🚀 دليل رفع حلاق ماب على Vercel

## 📋 المتطلبات

- ✅ حساب Vercel (مجاني): https://vercel.com
- ✅ حساب GitHub (مجاني): https://github.com
- ✅ ملفات المشروع

---

## 🎯 الطريقة الأولى: رفع مباشر (الأسرع)

### الخطوة 1: تحضير الملفات

```bash
# تأكد من وجود ملفات المشروع
cd halaqmap
ls -la
```

### الخطوة 2: تثبيت Vercel CLI

```bash
# تثبيت Vercel CLI عالمياً
npm install -g vercel

# أو باستخدام npx (بدون تثبيت)
npx vercel
```

### الخطوة 3: تسجيل الدخول

```bash
vercel login
# سيفتح المتصفح لتسجيل الدخول
```

### الخطوة 4: رفع المشروع

```bash
# في مجلد المشروع
cd halaqmap

# رفع المشروع
vercel

# اتبع التعليمات:
# 1. Set up and deploy? → Yes
# 2. Which scope? → اختر حسابك
# 3. Link to existing project? → No
# 4. What's your project's name? → halaqmap
# 5. In which directory is your code located? → ./
# 6. Want to override the settings? → No
```

### الخطوة 5: رفع للإنتاج

```bash
# بعد التأكد من أن كل شيء يعمل
vercel --prod
```

---

## 🎯 الطريقة الثانية: رفع عبر GitHub (موصى به)

### الخطوة 1: رفع على GitHub

```bash
# في مجلد المشروع
cd halaqmap

# تهيئة Git (إذا لم يكن موجوداً)
git init

# إضافة جميع الملفات
git add .

# Commit
git commit -m "Initial commit - HalaqMap v1.0"

# ربط مع GitHub (أنشئ repository أولاً على GitHub)
git remote add origin https://github.com/YOUR_USERNAME/halaqmap.git

# رفع الملفات
git push -u origin main
```

### الخطوة 2: ربط Vercel مع GitHub

1. **افتح Vercel**: https://vercel.com/dashboard
2. **اضغط "Add New Project"**
3. **اختر "Import Git Repository"**
4. **اختر repository: halaqmap**
5. **اضغط "Import"**

### الخطوة 3: إعدادات المشروع

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### الخطوة 4: Deploy

```
اضغط "Deploy"
انتظر 1-2 دقيقة
✅ المشروع جاهز!
```

---

## 🌐 ربط النطاق halaqmap.com

### الخطوة 1: في Vercel Dashboard

1. **افتح مشروعك** في Vercel
2. **اذهب إلى Settings**
3. **اضغط على Domains**
4. **أضف النطاق**: halaqmap.com

### الخطوة 2: إعدادات DNS

Vercel سيعطيك معلومات DNS:

#### الطريقة A: استخدام Nameservers (الأسهل)
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

#### الطريقة B: استخدام A Record
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

#### إضافة WWW
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### الخطوة 3: تحديث DNS في مزود النطاق

1. **سجّل الدخول** إلى لوحة تحكم النطاق (GoDaddy, Namecheap, إلخ)
2. **ابحث عن DNS Settings**
3. **أضف السجلات** من الأعلى
4. **احفظ التغييرات**
5. **انتظر 24-48 ساعة** (عادةً أسرع)

---

## 📁 ملف vercel.json (اختياري)

أنشئ ملف `vercel.json` في جذر المشروع:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🔄 التحديثات المستقبلية

### إذا استخدمت GitHub:
```bash
# عدّل الملفات
# ثم:
git add .
git commit -m "Update: وصف التحديث"
git push

# Vercel سيقوم بالنشر تلقائياً!
```

### إذا استخدمت CLI:
```bash
# عدّل الملفات
# ثم:
vercel --prod
```

---

## ✅ التحقق من النشر

### 1. افتح الرابط المؤقت
```
https://halaqmap.vercel.app
أو
https://halaqmap-xxx.vercel.app
```

### 2. اختبر جميع الصفحات
```
✅ الصفحة الرئيسية
✅ التسجيل
✅ الدفع
✅ لوحات التحكم
```

### 3. اختبر على الموبايل
```
✅ افتح الرابط على هاتفك
✅ تأكد من الاستجابة
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: Build Failed
```
الحل:
1. تحقق من package.json
2. تأكد من وجود "build": "vite build"
3. تأكد من تثبيت جميع الحزم
```

### المشكلة 2: 404 على الصفحات
```
الحل:
1. أضف ملف vercel.json (انظر أعلاه)
2. أو استخدم HashRouter (موجود بالفعل)
```

### المشكلة 3: النطاق لا يعمل
```
الحل:
1. تحقق من إعدادات DNS
2. انتظر حتى 48 ساعة
3. استخدم https://dnschecker.org للتحقق
```

---

## 📊 مقارنة خيارات الاستضافة

| الميزة | Vercel | Netlify | cPanel |
|--------|--------|---------|--------|
| السرعة | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| السهولة | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| SSL مجاني | ✅ | ✅ | ⚠️ |
| CDN | ✅ | ✅ | ❌ |
| التحديثات التلقائية | ✅ | ✅ | ❌ |
| السعر | مجاني | مجاني | مدفوع |
| الأفضل لـ | React/Next.js | Static Sites | WordPress |

---

## 💡 نصائح مهمة

### ✅ افعل:
- استخدم GitHub للتحديثات التلقائية
- فعّل Analytics في Vercel
- راقب الأداء بانتظام
- احتفظ بنسخة احتياطية

### ❌ لا تفعل:
- لا تشارك رابط .vercel.app (استخدم النطاق المخصص)
- لا تنسَ تحديث DNS
- لا تحذف المشروع من Vercel بدون نسخة احتياطية

---

## 📞 الدعم

### Vercel Support:
- 📚 الوثائق: https://vercel.com/docs
- 💬 المجتمع: https://github.com/vercel/vercel/discussions

### حلاق ماب Support:
- 📧 admin@halaqmap.com
- 📱 0559602685

---

## 🎉 تهانينا!

موقعك الآن على:
- 🌐 https://halaqmap.vercel.app (مؤقت)
- 🌐 https://halaqmap.com (بعد ربط النطاق)

**سريع ⚡ | آمن 🔒 | عالمي 🌍**

---

**تم إعداد هذا الدليل بواسطة فريق حلاق ماب**

**آخر تحديث: 8 أبريل 2026**
