# 🎯 أوامر الرفع الكاملة - نسخ ولصق مباشر

## 🚀 الطريقة 1: الرفع على Vercel (موصى به)

### الخطوة 1: تنظيف المشروع

```bash
# انتقل إلى مجلد المشروع
cd halaqmap

# حذف المجلدات غير المطلوبة
rm -rf node_modules/
rm -rf dist/
rm -rf .git/
```

### الخطوة 2: تهيئة Git

```bash
# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# Commit
git commit -m "Initial commit - HalaqMap v1.0"
```

### الخطوة 3: إنشاء Repository على GitHub

**افتح المتصفح:**
1. اذهب إلى: https://github.com/new
2. Repository name: `halaqmap`
3. Description: `منصة حلاق ماب - ربط الحلاقين بالعملاء`
4. اختر Public أو Private
5. **لا تضف** README, .gitignore, License
6. اضغط "Create Repository"

### الخطوة 4: ربط المشروع مع GitHub

```bash
# استبدل YOUR_USERNAME باسم المستخدم الخاص بك
git remote add origin https://github.com/YOUR_USERNAME/halaqmap.git

# رفع الملفات
git branch -M main
git push -u origin main
```

### الخطوة 5: ربط Vercel

**افتح المتصفح:**
1. اذهب إلى: https://vercel.com/dashboard
2. اضغط "Add New Project"
3. اضغط "Import Git Repository"
4. اختر repository: `halaqmap`
5. اضغط "Import"
6. اضغط "Deploy"

**✅ انتظر 2-3 دقائق وسيكون موقعك جاهزاً!**

---

## 🎯 الطريقة 2: الرفع على Vercel عبر CLI (أسرع)

### الخطوة 1: تثبيت Vercel CLI

```bash
# تثبيت Vercel CLI عالمياً
npm install -g vercel
```

### الخطوة 2: تسجيل الدخول

```bash
# تسجيل الدخول (سيفتح المتصفح)
vercel login
```

### الخطوة 3: رفع المشروع

```bash
# انتقل إلى مجلد المشروع
cd halaqmap

# رفع المشروع
vercel

# اتبع التعليمات:
# Set up and deploy? → Yes
# Which scope? → اختر حسابك
# Link to existing project? → No
# What's your project's name? → halaqmap
# In which directory is your code located? → ./
# Want to override the settings? → No
```

### الخطوة 4: رفع للإنتاج

```bash
# رفع للإنتاج
vercel --prod
```

**✅ جاهز في دقيقة واحدة!**

---

## 🎯 الطريقة 3: الرفع على cPanel

### الخطوة 1: بناء المشروع محلياً

```bash
# انتقل إلى مجلد المشروع
cd halaqmap

# تثبيت الحزم (إذا لم تكن مثبتة)
npm install

# بناء المشروع
npm run build

# التحقق من محتويات dist/
ls -la dist/
```

### الخطوة 2: ضغط مجلد dist/

#### على Mac/Linux:
```bash
# ضغط مجلد dist/
cd halaqmap
zip -r halaqmap-dist.zip dist/
```

#### على Windows (PowerShell):
```powershell
# ضغط مجلد dist/
Compress-Archive -Path dist\* -DestinationPath halaqmap-dist.zip
```

### الخطوة 3: رفع على cPanel

**في المتصفح:**
1. سجّل الدخول إلى cPanel
2. افتح "File Manager"
3. انتقل إلى `public_html/`
4. احذف الملفات القديمة (احتفظ بنسخة احتياطية!)
5. اضغط "Upload"
6. ارفع `halaqmap-dist.zip`
7. بعد الرفع، اضغط بزر الماوس الأيمن على الملف
8. اختر "Extract"
9. سيتم فك الضغط في مجلد `dist/`

### الخطوة 4: نقل الملفات

**في File Manager:**
1. افتح مجلد `dist/`
2. حدد جميع الملفات (Ctrl+A)
3. اضغط "Move"
4. اختر المسار: `/public_html/`
5. اضغط "Move Files"
6. ارجع إلى `public_html/`
7. احذف مجلد `dist/` الفارغ
8. احذف ملف `halaqmap-dist.zip`

**✅ جاهز! افتح https://halaqmap.com**

---

## 🎯 الطريقة 4: الرفع على Netlify

### الطريقة A: Drag & Drop (الأسهل)

```bash
# بناء المشروع
cd halaqmap
npm install
npm run build
```

**في المتصفح:**
1. اذهب إلى: https://app.netlify.com
2. سجّل الدخول
3. اسحب مجلد `dist/` إلى منطقة "Drop"
4. انتظر 1-2 دقيقة

**✅ جاهز!**

### الطريقة B: عبر GitHub

**نفس خطوات Vercel، لكن:**
1. افتح https://app.netlify.com
2. اضغط "Add new site"
3. اختر "Import an existing project"
4. اختر "GitHub"
5. اختر repository: `halaqmap`
6. اضغط "Deploy site"

**✅ جاهز في 2-3 دقائق!**

---

## 🌐 ربط النطاق halaqmap.com

### في Vercel:

**في Dashboard:**
1. افتح مشروعك
2. اذهب إلى "Settings"
3. اضغط على "Domains"
4. اضغط "Add"
5. أدخل: `halaqmap.com`
6. اضغط "Add"

**في لوحة تحكم النطاق:**

أضف السجلات التالية:

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**✅ انتظر 1-24 ساعة**

---

## 🔄 التحديثات المستقبلية

### إذا استخدمت GitHub + Vercel:

```bash
# عدّل الملفات
# ثم:
git add .
git commit -m "Update: وصف التحديث"
git push

# Vercel سيقوم بالنشر تلقائياً!
```

### إذا استخدمت Vercel CLI:

```bash
# عدّل الملفات
# ثم:
vercel --prod
```

### إذا استخدمت cPanel:

```bash
# عدّل الملفات
# ثم:
npm run build
# ارفع محتويات dist/ مرة أخرى
```

---

## 📋 قائمة التحقق النهائية

```bash
# تحقق من البنية الصحيحة
cd halaqmap
ls -la

# يجب أن ترى:
# ✅ src/
# ✅ public/
# ✅ package.json
# ✅ vite.config.ts
# ✅ .gitignore
# ✅ vercel.json
# ❌ node_modules/ (يجب ألا يكون موجوداً)
# ❌ dist/ (يجب ألا يكون موجوداً قبل الرفع)
```

---

## 🐛 حل المشاكل

### المشكلة: git: command not found

```bash
# تثبيت Git
# على Mac:
brew install git

# على Ubuntu/Debian:
sudo apt-get install git

# على Windows:
# حمّل من: https://git-scm.com/download/win
```

### المشكلة: npm: command not found

```bash
# تثبيت Node.js و npm
# حمّل من: https://nodejs.org/
```

### المشكلة: Permission denied

```bash
# استخدم sudo (على Mac/Linux)
sudo npm install -g vercel
```

---

## 💡 نصائح سريعة

### ✅ افعل:
```bash
# احتفظ بنسخة احتياطية
cp -r halaqmap halaqmap-backup

# اختبر محلياً قبل الرفع
npm run dev
```

### ❌ لا تفعل:
```bash
# لا ترفع node_modules/
# لا ترفع dist/ على GitHub
# لا ترفع ملفات .env
```

---

## 📞 الدعم

📧 admin@halaqmap.com
📱 0559602685

---

**🌐 https://halaqmap.com**

**نسخ ولصق الأوامر مباشرة! 🚀**
