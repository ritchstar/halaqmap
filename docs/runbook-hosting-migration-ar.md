# Runbook — أزمات الاستضافة والانتقال (حلاق ماب)

**الجمهور:** المؤسس / Super Admin فقط  
**المرجع التفصيلي:** `NETLIFY_FAILOVER.md` · `docs/crisis-playbook.md`  
**آخر مراجعة:** يونيو 2026

---

## قبل أي خطوة

1. **حدّد النطاق:** خريطة؟ تسجيل؟ دفع؟ إدارة؟ API فقط؟
2. **جمّد النشر** — لا features أثناء الحادث.
3. **احفظ الأدلة:** Vercel deployment ID، Supabase logs، webhooks Moyasar.
4. **لا تغيّر DNS** إلا إذا تأكدت أن الإنتاج الحالي لا يستجيب أو معطّل > 6 ساعات.

**طبقات المنصة (تذكير):**

| الطبقة | المكوّن | من يتحرّك عند الأزمة؟ |
|--------|---------|------------------------|
| بيانات | Supabase (Postgres + Auth + Storage) | فقط عند «مشروع Supabase جديد» |
| تطبيق | Vercel (SPA + `/api/*`) | Failover → Netlify أو مزود آخر |
| نطاق | DNS + SSL | CNAME/NS حسب المزود |
| دفع | Moyasar + webhooks | تحديث URLs بعد تغيير النطاق/API |

---

## السيناريو أ — Vercel معطّلة → Netlify (طوارئ)

### متى تفعّل

- Vercel Status يُعلن حادثاً طويلاً **أو** لا يمكن النشر > 6 ساعات **و** الإنتاج الحالي متوقف.

### ما يعمل فوراً (≈10 دقائق)

- الواجهة + PWA + التوجيه client-side
- الخريطة وبحث الحلاقين (RPC مباشرة من Supabase، بما فيها `children_specialist`)
- Supabase Auth

### ما يتوقف (503 متوقّع)

- كل `/api/*`: تسجيل، دفع، موافقة إدارة، لوحة حلاق (حفظ إعدادات الأطفال)، AI staff، crons

### خطوات التنفيذ

```bash
npm i -g netlify-cli
netlify login
cd "/path/to/halaqmap"
netlify init          # site جديد، مثلاً halaqmap-failover
netlify deploy --build          # معاينة
netlify deploy --prod --build   # إنتاج
```

**متغيّرات Netlify (Production) — انسخ من Vercel:**

| متغيّر | إلزامي للواجهة |
|--------|----------------|
| `VITE_SUPABASE_URL` | ✅ |
| `VITE_SUPABASE_ANON_KEY` | ✅ |
| `VITE_ENABLE_ROUTE_MESSAGING` | ✅ = `true` |
| `VITE_GOOGLE_MAPS_API_KEY` / `VITE_MAPBOX_TOKEN` | حسب الخريطة |
| `VITE_SITE_ORIGIN` | ✅ بعد ربط النطاق |

**لا تنقل إلى Netlify (واجهة فقط):**  
`SUPABASE_SERVICE_ROLE_KEY` · `OPENAI_API_KEY` · `MOYASAR_*` · `CRON_SECRET` · `REGISTRATION_INTENT_SECRET`

**DNS (5–30 دقيقة):**

1. Netlify → Domains → أضف `halaqmap.com`
2. عند Cloudflare/خارجي: CNAME → `halaqmap-failover.netlify.app`
3. تتبّع: https://dnschecker.org

**بanner للمستخدمين (مقترح):**  
«بعض الخدمات (التسجيل والدفع) متوقفة مؤقتاً — تصفّح الخريطة يعمل.»

### تحقق بعد النشر

- [ ] `/` و `/#/` يفتحان
- [ ] `/manifest.json` و `/sw.js` → 200
- [ ] تسجيل دخول Supabase يعمل
- [ ] بحث جغرافي يُرجع حلاقين
- [ ] `/api/*` → 503 (متوقّع)

### العودة إلى Vercel

1. أعد CNAME/NS إلى Vercel
2. تحقق من آخر deployment ناجح
3. أزل banner الطوارئ
4. راجع webhooks/crons (لم تُشغَّل على Netlify في وضع static-only)

### ترقية: نقل `/api/*` إلى Netlify (3–4 ساعات)

| نقطة | Vercel | Netlify |
|------|--------|---------|
| Timeout | 60s | Free 10s · Pro 26s |
| Crons | `vercel.json` | Scheduled Functions (Pro) |
| Node + pdfkit | ✅ | Functions Node ✅ |

Crons الحالية على Vercel:

- `/api/cron-private-chat-maintenance` — كل 5 دقائق
- `/api/cron-security-triage` — 04:20 يومياً
- `/api/ops-billing-monitor?cron=1` — 04:00
- `/api/ops-intelligence-report?cron=1` — 05:00

**عند نقل API كامل:** انسخ **كل** secrets من Vercel Production إلى Netlify، ثم اختبر POST تسجيل + webhook دفع في staging قبل DNS.

---

## السيناريو ب — مشروع Supabase جديد (أو منطقة/مزود DB)

**تحذير:** أثقل من تغيير Vercel — خطّط لنافذة صيانة + نسخ احتياطي.

### المرحلة 1 — التحضير (قبل التبديل)

1. **Snapshot:** Backup يدوي أو PITR من مشروع Supabase الحالي.
2. **قائمة migrations:** كل ملفات `supabase/migrations/` بالترتيب الرقمي — آخرها عند الكتابة: `108_barber_children_specialist.sql`.
3. **صدّر secrets checklist** (لا تُخزَّن في Git):

| فئة | أمثلة |
|-----|--------|
| Supabase | `SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` · `VITE_SUPABASE_ANON_KEY` |
| Auth redirects | Site URL + Redirect URLs في لوحة Supabase |
| Vercel server | `REGISTRATION_*` · `MOYASAR_*` · `RESEND_*` · `OPENAI_API_KEY` · `CRON_SECRET` |
| Webhooks | Moyasar → `/api/...` أو edge function |

### المرحلة 2 — المشروع الجديد

1. أنشئ مشروع Supabase (نفس المنطقة إن أمكن — KSA/قريب).
2. **SQL Editor:** نفّذ migrations بالترتيب، أو `supabase db push` من CLI.
3. **تحقق حرج:**

```sql
-- عمود حلاقة الأطفال (108)
SELECT column_name FROM information_schema.columns
WHERE table_name = 'barbers' AND column_name = 'children_specialist';

-- RPC البحث
SELECT children_specialist FROM search_barbers_nearby(24.7136, 46.6753) LIMIT 1;
```

4. **Auth:** Site URL = `https://halaqmap.com` (أو staging)، Redirect URLs لمسارات Admin/Barber.
5. **Storage:** أنشئ buckets المطابقة + policies (انسخ من المشروع القديم أو migrations).
6. **Edge Functions:** أعد نشر `supabase/functions/` + secrets (Moyasar webhook، إلخ).

### المرحلة 3 — نقل البيانات (إن لزم)

| طريقة | متى |
|--------|-----|
| pg_dump / restore | انتقال كامل |
| PITR restore لمشروع جديد | استعادة نقطة زمنية |
| جداول انتقائية | staging أو اختبار |

**بعد restore:** أعد sequences وتحقق من counts:

```sql
SELECT COUNT(*) FROM barbers;
SELECT COUNT(*) FROM registration_submissions;
SELECT COUNT(*) FROM payments;
```

### المرحلة 4 — ربط Vercel (أو Netlify)

1. حدّث Environment Variables:
   - `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` (server فقط)
2. **Redeploy** Production (لا يكفي حفظ env بدون build جديد — `VITE_*` تُدمج وقت البناء).
3. Engineering Handshake من لوحة المؤسس → ping Supabase/Vercel/GitHub.

### المرحلة 5 — الدفع والwebhooks

1. Moyasar Dashboard → webhook URL → النطاق + مسار الدالة الصحيح.
2. اختبر دفعة sandbox → تحقق من `payments` + `barber_subscriptions` + `is_active`.
3. **لا تعيد الدفع يدوياً** للشركاء — replay webhook فقط بعد موافقة مالية.

### المرحلة 6 — إغلاق الحادث

- [ ] خريطة + فلاتر (أطفال / متخصص أطفال)
- [ ] تسجيل شريك جديد end-to-end
- [ ] لوحة حلاق ذهبي/ماسي + حفظ إعدادات الأطفال
- [ ] Admin login + ops crons (اليوم التالي)
- [ ] وثّق RCA داخلياً + حدّث هذا الملف إن وُجد درس جديد

---

## مصفوفة سريعة — ماذا يكسر ماذا؟

| الحادث | الخريطة | تسجيل | دفع | لوحة حلاق | Admin |
|--------|---------|-------|-----|-----------|-------|
| Vercel down (Netlify static) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Supabase down | ❌ | ❌ | ❌ | ❌ | ❌ |
| Migration ناقصة (108) | ⚠️ بدون `children_specialist` | ⚠️ | — | ⚠️ 503 API | — |
| DNS خاطئ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Webhook Moyasar فقط | ✅ | ✅ | ⚠️ paid لا يفعّل | — | ⚠️ |

---

## جهات اتصال تشغيلية (املأ محلياً — لا تُ commit)

| الدور | الاسم | القناة |
|-------|-------|--------|
| مؤسس / قرار | | |
| Supabase support | | dashboard |
| Vercel / Netlify | | |
| Moyasar | | |
| DNS (GoDaddy/Cloudflare) | | |

---

## رسائل جاهزة

**داخلي:**  
«حادث P{0|1} — نطاق: {Vercel|Supabase|DNS}. الإجراء: {failover|migration|rollback}. ETA: {وقت}. سلامة البيانات: {ok|قيد المراجعة}.»

**شركاء (عند الحاجة):**  
«نعمل على استعادة {التسجيل/الدفع}. حسابكم ومدفوعاتكم مسجّلة — لا حاجة لإعادة الدفع.»

---

*حلاق ماب — مؤسسة أحمد بن عبدالله بن سراء التجارية*
