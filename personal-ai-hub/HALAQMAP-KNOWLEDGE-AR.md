# جعل Open WebUI «مساعد حلاق ماب» — دليل عملي

**الهدف:** مساعد محلي يعرف بنية المنصة، migrations، التشغيل، والأزمات — **بدون** رفع أسرار.

---

## النموذج: 3 طبقات

| الطبقة | ماذا | أين في Open WebUI |
|--------|------|-------------------|
| 1 | **System Prompt** — شخصية + قواعد | Workspace → Models → System Prompt (أو Model preset) |
| 2 | **Knowledge (RAG)** — مستندات المشروع | Workspace → Knowledge → Upload |
| 3 | **تحديث دوري** — بعد كل feature كبير | أعد توليد export + أعد رفع الملفات |

---

## الخطوة 1 — System Prompt

1. افتح http://localhost:8080
2. **Workspace** → **Models** (أو عند إنشاء محادثة: Customize)
3. الصق محتوى الملف:

```
personal-ai-hub/knowledge/halaqmap/SYSTEM-PROMPT-AR.txt
```

4. احفظ كـ **Model preset** باسم: `HalaqMap Founder Assistant`

---

## الخطوة 2 — تجهيز حزمة المعرفة (مرة + بعد كل تحديث كبير)

### أ) توليد export محدّث (من جذر halaqmap)

```powershell
cd "c:\Users\hp\Downloads\halaqmap\halaqmap (8)"
node scripts/generate-architecture-export.mjs
```

ينتج/يحدّث: `docs/export/GROUP-01` … `GROUP-08` + `FILE-TREE.md`

### ب) الملفات التي ترفعها إلى Knowledge

**أساسية (ابدأ بهذه):**

| ملف | لماذا |
|-----|--------|
| `ARCHITECTURE.md` | ملخص معماري |
| `docs/export/GROUP-01-CORE-CONFIG.md` | Auth + config |
| `docs/export/GROUP-05-COMPLIANCE-REGISTRATION.md` | تسجيل + امتثال |
| `docs/export/GROUP-06-OPS-RADAR.md` | Ops + radar |
| `docs/export/GROUP-08-SUPABASE-MIGRATIONS-ENGINEERING.md` | migrations هندسة |
| `docs/crisis-playbook.md` | أزمات |
| `docs/runbook-hosting-migration-ar.md` | استضافة |
| `NETLIFY_FAILOVER.md` | failover |
| `docs/COMPLIANCE_AND_SECURITY_BACKLOG.md` | أمان |

**حسب الحاجة:**

| ملف | متى |
|-----|-----|
| `GROUP-03` | Engineering / Super Intelligence |
| `GROUP-04` | Public Prosecutor |
| `GROUP-07` | UI admin |
| `supabase/migrations/108_*.sql` | ميزة الأطفال |
| `personal-ai-hub/SETUP-ritchperfume.com-AR.md` | AI hub شخصي (منفصل) |

### ج) **لا ترفع أبداً**

- `.env` · `.agent_secrets.env`
- أي ملف فيه `SERVICE_ROLE` · `API_KEY` · tokens
- `dist/` · `node_modules/`
- نسخ كاملة من `api/` أو `src/` (ضخمة — استخدم GROUP exports بدلاً)

---

## الخطوة 3 — رفع Knowledge في Open WebUI

1. **Workspace** → **Knowledge** → **+ Create Collection**
2. الاسم: `HalaqMap Platform`
3. **Upload files** — اسحب الملفات من الجدول أعلاه
4. انتظر اكتمال **Embedding** (`nomic-embed-text` يجب أن يكون في Ollama)

```powershell
ollama pull nomic-embed-text
```

5. في **Settings** → **Documents** → Embedding model: `nomic-embed-text`

---

## الخطوة 4 — محادثة مفعّلة بـ RAG

1. محادثة جديدة
2. اختر preset: `HalaqMap Founder Assistant`
3. فعّل **Knowledge** → Collection: `HalaqMap Platform`
4. جرّب:

> «ما الفرق بين acceptsChildren و childrenSpecialist؟»
> «ماذا يتوقف إذا نقلنا الواجهة إلى Netlify بدون API؟»
> «ما ترتيب migrations للأطفال؟»

---

## الخطوة 5 — تحديث بعد كل sprint

```powershell
cd halaqmap
git pull
node scripts/generate-architecture-export.mjs
```

ثم في Open WebUI: Knowledge → **Re-sync** أو احذف Collection وأعد الرفع.

**نصيحة:** أنشئ ملف `docs/HALAQMAP-CHANGELOG-FOUNDER.md` (يدوي) — 10 أسطر لكل feature — وارفعه مع الـ export.

---

## حدود واقعية (16 GB RAM · qwen2.5:7b)

| يجيد | ضعيف |
|------|------|
| شرح معماري من المستندات | قراءة 300 ملف كود دفعة واحدة |
| خطوات migration / crisis | كتابة migration معقدة بدون مراجعة |
| تلخيص GROUP exports | تذكر commit hash دقيق بدون مستند |

**للأسئلة العميقة في الكود:** اسأل Cursor في المشروع — Open WebUI للسياق التشغيلي والقرار.

---

## اختياري — مجلد معرفة على القرص

انسخ نسخة للفهرسة:

```powershell
mkdir "$env:USERPROFILE\Documents\HalaqMapBrain" -Force
copy ARCHITECTURE.md "$env:USERPROFILE\Documents\HalaqMapBrain\"
copy docs\export\GROUP-*.md "$env:USERPROFILE\Documents\HalaqMapBrain\"
copy docs\crisis-playbook.md "$env:USERPROFILE\Documents\HalaqMapBrain\"
```

ارفع من هذا المجلد — يبقى منفصلاً عن Git.

---

*مساعد شخصي — ليس بديلاً عن مراجعة الكود قبل أي deploy.*
