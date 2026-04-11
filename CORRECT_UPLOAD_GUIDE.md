# 📋 دليل الرفع الصحيح لمشروع حلاق ماب

## 🎯 السيناريو 1: الرفع على Vercel/Netlify (موصى به)

### الخطوة 1: تنظيف المشروع

```bash
# في مجلد المشروع
cd halaqmap

# حذف المجلدات غير المطلوبة
rm -rf node_modules/
rm -rf dist/
rm -rf .git/
```

### الخطوة 2: إنشاء ملف .gitignore

أنشئ ملف `.gitignore` في جذر المشروع:

```
# الملفات التي لا يجب رفعها
node_modules/
dist/
.DS_Store
.env
.env.local
.vercel
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.vscode/
.idea/
```

### الخطوة 3: تهيئة Git

```bash
# تهيئة Git
git init

# إضافة جميع الملفات (ما عدا المستثناة في .gitignore)
git add .

# Commit
git commit -m "Initial commit - HalaqMap v1.0"
```

### الخطوة 4: إنشاء Repository على GitHub

1. **افتح GitHub**: https://github.com
2. **اضغط "New Repository"**
3. **اسم Repository**: halaqmap
4. **الوصف**: منصة حلاق ماب - ربط الحلاقين بالعملاء
5. **اختر Public أو Private**
6. **لا تضف** README, .gitignore, License (موجودين بالفعل)
7. **اضغط "Create Repository"**

### الخطوة 5: ربط المشروع مع GitHub

```bash
# ربط مع GitHub
git remote add origin https://github.com/YOUR_USERNAME/halaqmap.git

# رفع الملفات
git branch -M main
git push -u origin main
```

### الخطوة 6: ربط Vercel مع GitHub

1. **افتح Vercel**: https://vercel.com/dashboard
2. **اضغط "Add New Project"**
3. **اختر "Import Git Repository"**
4. **اختر repository: halaqmap**
5. **اضغط "Import"**

### الخطوة 7: إعدادات Vercel (تلقائية)

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x
```

### الخطوة 8: Deploy

```
اضغط "Deploy"
انتظر 2-3 دقائق
✅ المشروع جاهز!
```

---

## 🎯 السيناريو 2: الرفع على cPanel

### الخطوة 1: بناء المشروع محلياً

```bash
# في مجلد المشروع
cd halaqmap

# تثبيت الحزم (إذا لم تكن مثبتة)
npm install

# بناء المشروع
npm run build
```

### الخطوة 2: التحقق من مجلد dist/

```bash
# التحقق من محتويات dist/
ls -la dist/

# يجب أن ترى:
# index.html
# .htaccess
# assets/
# images/
# favicon.ico
```

### الخطوة 3: ضغط مجلد dist/

#### على Windows:
```
1. اضغط بزر الماوس الأيمن على مجلد dist/
2. اختر "Send to" → "Compressed (zipped) folder"
3. سمّه: halaqmap-dist.zip
```

#### على Mac/Linux:
```bash
cd halaqmap
zip -r halaqmap-dist.zip dist/
```

### الخطوة 4: رفع على cPanel

1. **سجّل الدخول إلى cPanel**
2. **افتح File Manager**
3. **انتقل إلى public_html/**
4. **احذف الملفات القديمة** (احتفظ بنسخة احتياطية!)
5. **ارفع halaqmap-dist.zip**
6. **اضغط بزر الماوس الأيمن على الملف المضغوط**
7. **اختر "Extract"**
8. **سيتم فك الضغط في مجلد dist/**
9. **انقل محتويات dist/ إلى public_html/**

### الخطوة 5: نقل الملفات بشكل صحيح

```
⚠️ مهم: الملفات يجب أن تكون في public_html/ مباشرة!

✅ الصحيح:
public_html/
├── index.html
├── .htaccess
├── assets/
└── images/

❌ خطأ:
public_html/
└── dist/
    ├── index.html
    └── ...
```

### الخطوة 6: نقل الملفات (إذا كانت في dist/)

```
1. افتح مجلد dist/
2. حدد جميع الملفات (Ctrl+A أو Cmd+A)
3. اضغط "Move"
4. اختر المسار: /public_html/
5. اضغط "Move Files"
6. احذف مجلد dist/ الفارغ
```

---

## 🎯 السيناريو 3: الرفع على Netlify

### الطريقة 1: Drag & Drop (الأسهل)

1. **ابنِ المشروع محلياً**:
   ```bash
   npm run build
   ```

2. **افتح Netlify**: https://app.netlify.com
3. **اسحب مجلد dist/** إلى منطقة "Drop"
4. **انتظر 1-2 دقيقة**
5. **✅ المشروع جاهز!**

### الطريقة 2: عبر GitHub (موصى به)

```
نفس خطوات Vercel، لكن:
1. افتح Netlify بدلاً من Vercel
2. اختر "Import from Git"
3. اختر GitHub
4. اختر repository: halaqmap
5. Deploy!
```

---

## 📋 قائمة التحقق

### ✅ قبل الرفع:

```
□ حذفت node_modules/
□ حذفت dist/ (إذا كنت سترفع على Vercel/Netlify)
□ أنشأت .gitignore
□ بنيت المشروع (npm run build) إذا كنت سترفع على cPanel
□ تحققت من محتويات dist/
```

### ✅ أثناء الرفع:

```
□ رفعت الملفات الصحيحة فقط
□ الملفات في المكان الصحيح
□ لا توجد مجلدات فارغة
```

### ✅ بعد الرفع:

```
□ الموقع يفتح
□ جميع الصفحات تعمل
□ الصور تظهر
□ CSS يعمل
□ JavaScript يعمل
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: رفعت المشروع كاملاً على GitHub

```
الحل:
1. احذف repository من GitHub
2. أنشئ repository جديد
3. اتبع الخطوات الصحيحة أعلاه
```

### المشكلة 2: الملفات في مجلد dist/ داخل public_html/

```
الحل:
1. انقل محتويات dist/ إلى public_html/
2. احذف مجلد dist/
```

### المشكلة 3: node_modules/ كبير جداً

```
الحل:
1. لا ترفع node_modules/ أبداً!
2. أضفه إلى .gitignore
3. Vercel/Netlify سيثبته تلقائياً
```

---

## 💡 نصائح مهمة

### ✅ افعل:
- استخدم .gitignore
- ارفع على Vercel/Netlify (أسهل وأسرع)
- احتفظ بنسخة احتياطية
- اختبر محلياً قبل الرفع

### ❌ لا تفعل:
- لا ترفع node_modules/
- لا ترفع dist/ على GitHub (إلا إذا كنت تريد)
- لا ترفع ملفات .env
- لا ترفع ملفات .log

---

## 📞 الدعم

📧 admin@halaqmap.com
📱 0559602685

---

**🌐 https://halaqmap.com**

**الطريقة الصحيحة = نجاح مضمون! ✅**
