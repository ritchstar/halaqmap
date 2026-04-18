# 🚀 دليل رفع موقع حلاق ماب على الاستضافة

## 📋 المتطلبات الأساسية

- ✅ النطاق: **halaqmap.com** (جاهز)
- ✅ استضافة ويب (cPanel, Plesk, أو VPS)
- ✅ دعم HTTPS/SSL
- ✅ ملفات المشروع (مجلد `dist`)

---

## 📦 الخطوة 1: تحميل ملفات المشروع

### **من المنصة الحالية:**

1. اضغط على أيقونة **Download** (↓) في أعلى يمين الصفحة
2. سيتم تحميل ملف مضغوط يحتوي على كامل المشروع
3. فك ضغط الملف على جهازك

### **أو استخدم الملفات الجاهزة:**

الملفات الجاهزة للرفع موجودة في مجلد: `dist/`

---

## 🌐 الخطوة 2: رفع الملفات على الاستضافة

### **أ) باستخدام cPanel (الطريقة الأسهل):**

#### 1️⃣ **تسجيل الدخول إلى cPanel**
```
https://halaqmap.com/cpanel
أو
https://cpanel.your-hosting-provider.com
```

#### 2️⃣ **فتح File Manager (مدير الملفات)**
- ابحث عن أيقونة "File Manager" أو "مدير الملفات"
- اضغط عليها

#### 3️⃣ **الانتقال إلى المجلد الرئيسي**
- انتقل إلى مجلد: `public_html/`
- هذا هو المجلد الذي سيظهر محتواه على halaqmap.com

#### 4️⃣ **حذف الملفات القديمة (إن وجدت)**
- احذف جميع الملفات الموجودة في `public_html/`
- **تحذير:** احتفظ بنسخة احتياطية إذا كان هناك محتوى مهم

#### 5️⃣ **رفع ملفات المشروع**

**الطريقة الأولى: رفع مجلد dist مباشرة**
```
1. اضغط على "Upload" في File Manager
2. اختر جميع الملفات من داخل مجلد dist/
3. ارفعها إلى public_html/
```

**الطريقة الثانية: رفع ملف مضغوط**
```
1. اضغط بزر الماوس الأيمن على مجلد dist/
2. اختر "Compress" أو "ضغط"
3. اختر ZIP
4. ارفع الملف المضغوط إلى public_html/
5. اضغط بزر الماوس الأيمن على الملف المضغوط
6. اختر "Extract" أو "فك الضغط"
7. احذف الملف المضغوط بعد فك الضغط
```

#### 6️⃣ **التأكد من البنية الصحيحة**

يجب أن تكون البنية كالتالي:
```
public_html/
├── index.html
├── assets/
│   ├── index-C0tTmEXy.css
│   ├── index-jo2owz-z.js
│   └── [other files]
└── [other files from dist/]
```

**⚠️ مهم جداً:**
- الملفات يجب أن تكون **داخل** `public_html/` مباشرة
- **ليس** داخل `public_html/dist/`

---

### **ب) باستخدام FTP (FileZilla):**

#### 1️⃣ **تحميل FileZilla**
```
https://filezilla-project.org/download.php
```

#### 2️⃣ **الاتصال بالاستضافة**
```
Host: ftp.halaqmap.com (أو عنوان FTP من مزود الاستضافة)
Username: اسم المستخدم FTP
Password: كلمة المرور FTP
Port: 21
```

#### 3️⃣ **رفع الملفات**
```
1. في الجانب الأيسر: افتح مجلد dist/ على جهازك
2. في الجانب الأيمن: افتح مجلد public_html/ على السيرفر
3. اسحب جميع الملفات من dist/ إلى public_html/
4. انتظر حتى يكتمل الرفع
```

---

### **ج) باستخدام SSH/Terminal (للمتقدمين):**

```bash
# الاتصال بالسيرفر
ssh username@halaqmap.com

# الانتقال إلى المجلد الرئيسي
cd public_html/

# حذف الملفات القديمة
rm -rf *

# رفع الملفات (من جهازك المحلي)
# استخدم scp أو rsync
scp -r dist/* username@halaqmap.com:~/public_html/
```

---

## 🔧 الخطوة 3: إعداد ملف .htaccess (مهم جداً!)

### **لماذا نحتاج .htaccess؟**
- لتوجيه جميع الطلبات إلى index.html
- لدعم React Router (HashRouter)
- لتفعيل HTTPS

### **إنشاء ملف .htaccess:**

#### **في cPanel:**
```
1. افتح File Manager
2. انتقل إلى public_html/
3. اضغط "+ File" أو "ملف جديد"
4. اسم الملف: .htaccess
5. اضغط بزر الماوس الأيمن > Edit
6. الصق المحتوى التالي:
```

#### **محتوى ملف .htaccess:**

```apache
# Enable Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Handle React Router (HashRouter)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Disable Directory Browsing
Options -Indexes

# Custom Error Pages
ErrorDocument 404 /index.html
```

---

## 🔒 الخطوة 4: تفعيل SSL/HTTPS

### **أ) باستخدام Let's Encrypt (مجاني):**

#### **في cPanel:**
```
1. ابحث عن "SSL/TLS Status" أو "Let's Encrypt"
2. اختر النطاق: halaqmap.com
3. اضغط "Install" أو "تثبيت"
4. انتظر حتى يكتمل التثبيت (دقيقة واحدة)
```

### **ب) باستخدام شهادة SSL مدفوعة:**
```
1. اشترِ شهادة SSL من مزود موثوق
2. في cPanel > SSL/TLS > Manage SSL Sites
3. ارفع ملفات الشهادة
4. اضغط "Install Certificate"
```

---

## 🌐 الخطوة 5: ربط النطاق (إذا لم يكن مربوطاً)

### **إذا كان النطاق من مزود مختلف عن الاستضافة:**

#### 1️⃣ **الحصول على Nameservers من الاستضافة**
```
مثال:
ns1.your-hosting.com
ns2.your-hosting.com
```

#### 2️⃣ **تحديث Nameservers في لوحة النطاق**
```
1. سجّل الدخول إلى لوحة تحكم النطاق (GoDaddy, Namecheap, إلخ)
2. ابحث عن "Nameservers" أو "DNS Settings"
3. غيّر Nameservers إلى nameservers الاستضافة
4. احفظ التغييرات
```

#### 3️⃣ **الانتظار (24-48 ساعة)**
```
- قد يستغرق انتشار DNS من 1 إلى 48 ساعة
- عادةً يكتمل خلال ساعات قليلة
```

---

## ✅ الخطوة 6: التحقق من الموقع

### **1️⃣ افتح المتصفح وادخل:**
```
https://halaqmap.com
```

### **2️⃣ تحقق من:**
- ✅ الصفحة الرئيسية تظهر بشكل صحيح
- ✅ الصور تظهر
- ✅ الألوان والتصميم صحيح
- ✅ القوائم تعمل
- ✅ التنقل بين الصفحات يعمل
- ✅ HTTPS مفعّل (قفل أخضر في شريط العنوان)

### **3️⃣ اختبر جميع الصفحات:**
```
https://halaqmap.com/#/
https://halaqmap.com/#/register
https://halaqmap.com/#/about
https://halaqmap.com/#/privacy
https://halaqmap.com/#/subscription-policy
https://halaqmap.com/#/payment
```

---

## 🐛 حل المشاكل الشائعة

### **المشكلة 1: الصفحة لا تظهر (404 Not Found)**

**الحل:**
```
1. تأكد من أن ملف index.html موجود في public_html/
2. تأكد من أن الملفات ليست داخل مجلد فرعي
3. تحقق من صلاحيات الملفات (644 للملفات، 755 للمجلدات)
```

### **المشكلة 2: الصفحة تظهر بدون تنسيق (CSS لا يعمل)**

**الحل:**
```
1. افتح Developer Tools (F12)
2. تحقق من Console للأخطاء
3. تأكد من أن مجلد assets/ موجود
4. تأكد من أن ملفات CSS و JS موجودة في assets/
5. امسح الكاش (Ctrl+Shift+R)
```

### **المشكلة 3: الصور لا تظهر**

**الحل:**
```
1. تأكد من رفع مجلد images/ كاملاً
2. تحقق من مسارات الصور في الكود
3. تأكد من صلاحيات المجلدات (755)
```

### **المشكلة 4: HTTPS لا يعمل**

**الحل:**
```
1. تأكد من تثبيت شهادة SSL
2. تحقق من ملف .htaccess (قاعدة Force HTTPS)
3. امسح الكاش
4. جرّب في وضع التصفح الخفي
```

### **المشكلة 5: التنقل بين الصفحات لا يعمل**

**الحل:**
```
1. تأكد من وجود ملف .htaccess
2. تحقق من تفعيل mod_rewrite على السيرفر
3. اتصل بالدعم الفني للاستضافة
```

### **المشكلة 6: تسجيل الحلاق أو الدفع — تعذّر رفع المرفقات**

تحدث غالباً عندما يكون **`dist/` على استضافة ثابتة (cPanel)** بينما **دوال الرفع** (`/api/register-signed-upload` و `/api/register-upload-file`) **منشورة على Vercel فقط**. المتصفح يطلب `/api/...` من نطاق الموقع العام فيرجع **404** ولا يصل إلى Vercel.

**الحل (بناء الواجهة):** قبل `npm run build` عيّن أصل مشروع Vercel (بدون شرطة في النهاية)، ثم أعد البناء وارفع `dist/`:

```
VITE_REGISTRATION_API_ORIGIN=https://اسم-مشروعك.vercel.app
```

**تحقق سريع:** من المتصفح افتح  
`https://اسم-مشروعك.vercel.app/api/register-signed-upload`  
يجب أن يظهر JSON فيه `ready: true` عند اكتمال متغيرات Vercel.

**الحل (Vercel):** `SUPABASE_URL`، `SUPABASE_SERVICE_ROLE_KEY`، و`SUPABASE_ANON_KEY` أو `VITE_SUPABASE_ANON_KEY` بنفس قيمة مفتاح anon في الواجهة (للتحقق من رأس `x-supabase-anon`).

**الحل (Supabase):** تنفيذ `supabase/REGISTRATION_PUBLIC_FULL_SETUP.sql` (أو migrations التخزين) لإنشاء حاوية `registration-uploads` والسياسات المناسبة.

---

## 📊 اختبار الأداء

### **بعد الرفع، اختبر الموقع:**

#### 1️⃣ **سرعة التحميل:**
```
https://pagespeed.web.dev/
https://gtmetrix.com/
```

#### 2️⃣ **الأمان:**
```
https://www.ssllabs.com/ssltest/
```

#### 3️⃣ **الاستجابة (Mobile-Friendly):**
```
https://search.google.com/test/mobile-friendly
```

---

## 🔄 التحديثات المستقبلية

### **عند تحديث الموقع:**

```
1. قم ببناء المشروع مرة أخرى (npm run build)
2. احتفظ بنسخة احتياطية من public_html/
3. احذف الملفات القديمة (ما عدا .htaccess)
4. ارفع الملفات الجديدة من dist/
5. امسح الكاش
6. اختبر الموقع
```

---

## 📞 الدعم الفني

### **إذا واجهت أي مشكلة:**

#### **دعم الاستضافة:**
```
اتصل بمزود الاستضافة للمساعدة في:
- إعدادات السيرفر
- تثبيت SSL
- صلاحيات الملفات
- mod_rewrite
```

#### **دعم حلاق ماب:**
```
📧 admin@halaqmap.com
📱 0559602685
```

---

## ✅ قائمة التحقق النهائية

قبل إطلاق الموقع، تأكد من:

- [ ] جميع الملفات مرفوعة في public_html/
- [ ] ملف .htaccess موجود ومُعد بشكل صحيح
- [ ] SSL/HTTPS مفعّل ويعمل
- [ ] جميع الصفحات تعمل بشكل صحيح
- [ ] الصور تظهر
- [ ] التنقل بين الصفحات يعمل
- [ ] النماذج تعمل
- [ ] تسجيل الحلاق: رفع المرفقات يعمل (إن كان `dist` على cPanel وVercel منفصل: `VITE_REGISTRATION_API_ORIGIN` مضبوط في البناء)
- [ ] الموقع يعمل على الموبايل
- [ ] لا توجد أخطاء في Console
- [ ] السرعة مقبولة (< 3 ثواني)

---

## 🎉 تهانينا!

موقع **حلاق ماب** الآن على الهواء مباشرة على:

### **🌐 https://halaqmap.com**

---

## 📝 ملاحظات إضافية

### **النسخ الاحتياطية:**
```
- قم بعمل نسخة احتياطية أسبوعية
- احتفظ بنسخة من الملفات على جهازك
- استخدم خدمة النسخ الاحتياطي من الاستضافة
```

### **المراقبة:**
```
- راقب استهلاك الموارد (Bandwidth, Storage)
- راقب الأخطاء في لوحة التحكم
- راقب سرعة الموقع بشكل دوري
```

### **الأمان:**
```
- غيّر كلمات المرور بشكل دوري
- حدّث الملفات عند توفر تحديثات
- راقب محاولات الاختراق
- استخدم Cloudflare للحماية الإضافية
```

---

**تم إعداد هذا الدليل بواسطة فريق حلاق ماب**
**آخر تحديث: 8 أبريل 2026**
