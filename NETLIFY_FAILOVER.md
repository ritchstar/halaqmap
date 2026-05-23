# 🚨 Netlify Failover — دَليل النَّشر الطارئ

> **متى نَستخدمه؟** فقط إذا أَصبَحَت Vercel غير قادرة على نَشر أيّ build جَديد لِأَكثر من ساعَتَين، أو كانت Vercel Status Page تُعلِن حادثة طويلة.

> **ما الذي يُغطّيه هذا الـ Failover حالياً؟**
> - ✅ الواجهة الكاملة (React SPA من `dist/`)
> - ✅ PWA + Service Worker + Manifest
> - ✅ Cache headers مُطابقة لـ Vercel
> - ❌ `/api/*` — **غير مُهيَّأة بعد** (تَحتاج migration مُنفصِل، انظر القسم الأَخير)

---

## ⏱️ نَشر الواجهة في 10 دَقائق (Static-only)

### الخُطوات الستّ

```bash
# 1) ثَبِّت Netlify CLI (مرّة واحدة)
npm i -g netlify-cli

# 2) سَجّل دُخولك (يَفتح متصفّحاً لـ OAuth)
netlify login

# 3) من جذر المشروع، اربط بـ site جَديد
cd "/path/to/halaqmap"
netlify init
#    → اختر: "Create & configure a new site"
#    → اختر team: ritchstar-personal (أو ما يَظهر لك)
#    → site name: halaqmap-failover  (أو أيّ اسم متاح)

# 4) أَدخِل متغيّرات البيئة (انظر القائمة أدناه)
#    عَبر الـ UI: app.netlify.com → Site settings → Environment variables
#    أو عَبر CLI:
netlify env:set VITE_SUPABASE_URL "https://YOUR-PROJECT.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOi..."
# ... (انظر القائمة الكاملة أدناه)

# 5) نَفّذ بناء + نَشر تجريبي (يَأخذ ~1 دقيقة)
netlify deploy --build
#    → سَتَحصُل على URL مُؤقّت مثل: https://deploy-preview-1--halaqmap-failover.netlify.app
#    → افتَحه وتَأكَّد أن الواجهة تَعمل

# 6) إذا كان كل شيء جَيد، اِنشُر للإِنتاج
netlify deploy --prod --build
#    → سَتَحصُل على URL إِنتاجي: https://halaqmap-failover.netlify.app
```

### متغيّرات البيئة المَطلوبة على Netlify

نُسخها من Vercel → Settings → Environment Variables → Production إلى Netlify بنَفس الأَسماء:

#### **الأَساسيات (لا غِنى عَنها للواجهة)**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ENABLE_ROUTE_MESSAGING` = `true`

#### **اختياري لِخدمات إضافية**
- `VITE_GOOGLE_MAPS_API_KEY` (إذا كانت الخَريطة Google)
- `VITE_MAPBOX_TOKEN` (إذا كانت Mapbox)
- `VITE_ANALYTICS_*` (Sentry / Plausible / إلخ)

> ⚠️ **لا تَنقُل المتغيّرات الحَسّاسة** (`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `VERCEL_TOKEN`, إلخ) — هذه تُستخدم في `/api/*` فقط وليست مَطلوبة للواجهة.

---

## 🔀 تَبديل DNS عند الحاجة (إذا Vercel ميِّتة فِعلاً)

> **افعل هذا فقط إذا أَكَّدتِ أن Vercel لا تَستجيب وأن إنتاجك الحالي على Vercel يَعمل لكن لا تَستطيعين النَّشر.**
> **بَدائل الـ DNS تَستغرق 5-30 دَقيقة للانتشار** — افعَلي ذلك خِلال نافِذة هَدوء.

### إذا كان النِّطاق على Vercel (Vercel-managed DNS)

1. Vercel Dashboard → Settings → Domains → اِنسَخ NS records الحالية
2. مَوفِّر النِّطاق (Namecheap / Cloudflare / إلخ) → اِستَبدل NS records بتلك التي يُعطيها Netlify
3. Netlify Dashboard → Domains → Add custom domain → halaqmap.com
4. اِنتَظِر انتشار DNS (يَمكنك تَتبُّعه على https://dnschecker.org)

### إذا كان النِّطاق على Cloudflare/خارجي

1. مَوفِّر DNS → A/CNAME records:
   - `halaqmap.com` → CNAME → `halaqmap-failover.netlify.app`
   - `www.halaqmap.com` → CNAME → `halaqmap-failover.netlify.app`
2. Netlify → Domains → Add custom domain → halaqmap.com
3. Netlify يُجَدّد SSL تَلقائياً (Let's Encrypt) خِلال 5 دَقائق

### العَودة إلى Vercel بَعد تَعافيها

عَكس نَفس الخُطوات: أَعِد NS أو CNAME إلى Vercel. الـ DNS rollback أَيضاً 5-30 دَقيقة.

---

## 🛠️ مُشكلة الـ `/api/*` — خَريطة الطَّريق

في هذا الـ failover، أيّ طَلَب لِـ `/api/*` يُرَدّ بـ **503 Service Unavailable** عَمداً. هذا يَعني:
- ✅ تَصفُّح الموقع، تَسجيل الدُّخول (Supabase Auth مباشَرةً)، عَرض الخَريطة، البَحث، PWA كَامل
- ❌ مُيزات تَعتمد على الـ API:
  - مُعالَجة الدَّفع (Moyasar)
  - تَرشيح الحلاقين (approval workflow)
  - مُجمَّع وَكلاء الـ AI (Marketing, Prosecutor, إلخ)
  - الحماية الإِدارية للوحة التَّحكم

### خِيار "Migration الكامل" للـ APIs (3-4 ساعات)

إذا أَرَدتِ نَقل الـ APIs أيضاً، الخُطوات:

#### 1. تَحويل صيغة الـ handlers
ملفّات Vercel تَستخدم Web Standards:
```ts
export async function GET(request: Request) { ... }
export async function POST(request: Request) { ... }
```

Netlify Functions v2 يَدعم نَفس الصيغة:
```ts
export default async (request: Request) => { ... }
```

نَحتاج dispatcher يُحَوِّل بين الصِّيغَتَين.

#### 2. مَحدودية الـ Timeout على Netlify
- Free tier: **10 ثوانٍ** فقط (vs Vercel 60s)
- Pro tier: **26 ثانية** (vs Vercel 60s)
- لِـ APIs الـ OpenAI الطَّويلة (lab-chat) قَد لا يَكون كافياً
- الحَلّ: تَرقية Netlify Pro ($19/شهر) أَو استخدام Background Functions (15min على Pro)

#### 3. نَقل Crons
Netlify Scheduled Functions تَتَطلَّب Pro plan. حالياً عَلى Vercel:
- `/api/ops-billing-monitor?cron=1` (04:00 يَومياً)
- `/api/ops-intelligence-report?cron=1` (05:00 يَومياً)

#### 4. APIs غير مُتوافِقة مع Edge Runtime
الملفّات التي تَستخدم `readFileSync` أَو `node:fs`:
- `api/_lib/engineeringWingHandshake.ts` → تَستخدم `readFileSync` لِقراءة `.agent_secrets.env`. تَحتاج refactor لِقراءة كل شيء من `process.env`.
- `api/_lib/partnerContractPdfKit.ts` و `api/_lib/partnerUnifiedContractAr.ts` → تَستخدم `pdfkit` الذي يَحتاج Node runtime. يَعمل على Netlify Functions (Node) لكن ليس على Netlify Edge Functions.

### إذا قَرَّرتِ migration الـ APIs، أَخبريني وَسأَفتَح PR مُنفصل لِذلك. الوَقت المُقَدَّر: 3-4 ساعات عَمَل + اِختبار.

---

## 🔄 اِستراتيجية الـ Failover المُوصى بها

```
الوَضع الطَّبيعي:
  halaqmap.com (Vercel — UI + APIs)

طَوارئ خَفيفة (Vercel ميِّتة لساعَة-ساعَتَين):
  انتَظِري — لا تَفعَلي شيئاً
  الإنتاج الحالي يَستمرّ في العَمَل (CJSXENTta على Vercel CDN)

طَوارئ كاملة (Vercel ميِّتة > 6 ساعات):
  1. اِنشُر الواجهة على Netlify (10 دَقائق)
  2. حَوِّلي DNS مُؤقّتاً (5-30 دَقيقة)
  3. الإِنتاج يَستمرّ بدون APIs (تَحذير للمُستخدمين عبر banner)
  4. عِندَ تَعافي Vercel — عَكس DNS، حَذف banner
```

---

## ✅ تَحقُّق سَريع بَعد النَّشر

عَلى `https://halaqmap-failover.netlify.app` تَأكَّدي:

- [ ] الصَّفحة الرَّئيسية تَفتَح
- [ ] الـ PWA Manifest يَعمل (`/manifest.json` يَرجِع 200)
- [ ] Service Worker يَتَسَجَّل (`/sw.js`)
- [ ] التَّوجيه الـ client-side يَعمل (`/partner-story`, `/admin`, إلخ)
- [ ] الـ Headers صَحيحة (DevTools → Network → /assets/index-*.js → Cache-Control: immutable)
- [ ] Supabase auth يَعمل (سَجِّلي دُخول كَمُستَخدم)
- [ ] `/api/*` تَرجِع 503 عَمداً (مُتَوَقَّع)

إذا كل ما سَبَق ✅ — Netlify جاهزة كَخطّ احتياطي يَدوي.
