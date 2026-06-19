# المكتب الشخصي الذكي — Personal AI Hub

**الموقع:** `personal-ai-hub/` (منفصل عن مشروع حلاق ماب — انقله لمجلدك الشخصي إن أردت)

**المكوّنات:** Ollama + Open WebUI + n8n + Cloudflare Tunnel + Access

---

## 1) مخطط Subdomains (استبدل `example.com` بدومينك)

| Subdomain | الخدمة | المنفذ المحلي | الغرض |
|-----------|--------|---------------|--------|
| `home.example.com` | nginx portal | 8090 | بوابة روابط شخصية |
| `ai.example.com` | Open WebUI | 8080 | محادثة + RAG + ملفات |
| `n8n.example.com` | n8n | 5678 | أتمتة وتنظيم |

**DNS:** عبر Cloudflare Tunnel — **لا تفتح** ports 8080/5678 على الراوتر.

**حماية (إلزامي):** Cloudflare Zero Trust → Access → Policy: بريدك فقط على `ai.*` و `n8n.*` و `home.*`.

**الدومين الرئيسي `example.com`:** redirect إلى `home.example.com` أو صفحة «قريباً» — اختياري.

---

## 2) متطلبات Windows

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (WSL2)
- [Ollama](https://ollama.com/download/windows) — **موصى على Windows مباشرة** (GPU أسهل)
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
- حساب Cloudflare + الدومين مُضاف (Nameservers على Cloudflare)

---

## 3) التثبيت — خطوة بخطوة

### أ) Ollama + النماذج

```powershell
# ثبّت Ollama من الموقع، ثم:
cd personal-ai-hub
powershell -ExecutionPolicy Bypass -File scripts/detect-hardware.ps1

# أمثلة (اختر حسب RAM من السكربت):
ollama pull qwen2.5:7b
ollama pull nomic-embed-text
```

**جدول النماذج:**

| RAM | GPU | نموذج محادثة | تضمين RAG |
|-----|-----|--------------|-----------|
| 8 GB | لا | `qwen2.5:3b` | `nomic-embed-text` |
| 16 GB | لا / ضعيف | `qwen2.5:7b` | `nomic-embed-text` |
| 32 GB | 8 GB VRAM | `qwen2.5:14b` + `7b` احتياط | `nomic-embed-text` |
| 32 GB+ | 12 GB+ | `qwen2.5:14b` أو `llama3.1:8b` | `nomic-embed-text` |

**العربية:** `qwen2.5` و `aya` جيدان محلياً — ابدأ بـ `qwen2.5:7b`.

### ب) Docker Compose

```powershell
cd personal-ai-hub
copy .env.example .env
# عدّل .env: WEBUI_SECRET_KEY, N8N_ENCRYPTION_KEY, N8N_HOST=n8n.example.com, إلخ

docker compose up -d open-webui n8n

# بوابة home (اختياري):
docker compose --profile portal up -d portal
```

**تحقق محلي:**

- Open WebUI → http://localhost:8080
- n8n → http://localhost:5678 (أنشئ حساب admin أول زيارة)

### ج) Cloudflare Tunnel

```powershell
cloudflared tunnel login
cloudflared tunnel create personal-ai-hub
cloudflared tunnel route dns personal-ai-hub ai.example.com
cloudflared tunnel route dns personal-ai-hub n8n.example.com
cloudflared tunnel route dns personal-ai-hub home.example.com
```

1. انسخ `cloudflared-config.example.yml` → `%USERPROFILE%\.cloudflared\config.yml`
2. استبدل `YOUR-TUNNEL-UUID` و `example.com`
3. شغّل:

```powershell
cloudflared tunnel run personal-ai-hub
```

**تشغيل تلقائي:** Cloudflare Dashboard → Tunnels → Configure as service (Windows).

### د) Cloudflare Access (Zero Trust)

1. [one.dash.cloudflare.com](https://one.dash.cloudflare.com) → Access → Applications
2. Add application → Self-hosted
3. Domain: `ai.example.com` — Policy: Emails → `your@email.com`
4. كرّر لـ `n8n.example.com` و `home.example.com`

---

## 4) ضبط n8n خلف HTTPS

في `.env`:

```env
N8N_HOST=n8n.example.com
N8N_PROTOCOL=https
N8N_WEBHOOK_URL=https://n8n.example.com/
```

ثم: `docker compose up -d n8n --force-recreate`

---

## 5) RAG — فهرسة ملفاتك (Open WebUI)

1. افتح `https://ai.example.com`
2. Workspace → Documents → Upload (PDF, txt, md)
3. في المحادثة: فعّل **Knowledge** / RAG على المجموعة

**مجلد مقترح على جهازك:** `Documents/PersonalBrain/` — انسخ إليه فواتير، ملاحظات، عقود.

---

## 6) أفكار أتمتة n8n (بداية)

| Workflow | الفكرة |
|----------|--------|
| صباحي | Schedule 07:00 → HTTP Request إلى Ollama → «لخص مهام اليوم» |
| أسبوعي | قراءة مجلد ملاحظات → تلخيص |
| تذكير | Cron شهري → backup reminder |

**ربط Ollama من n8n:** HTTP POST `http://host.docker.internal:11434/api/generate`  
(أو `https://ai.example.com` إذا أضفت workflow داخل Open WebUI بدلاً من n8n)

---

## 7) أوامر يومية

```powershell
# تشغيل
docker compose up -d open-webui n8n

# إيقاف
docker compose down

# سجلات
docker compose logs -f open-webui

# تحديث صور Docker
docker compose pull && docker compose up -d
```

---

## 8) أمان — checklist

- [ ] Cloudflare Access على كل subdomains
- [ ] `.env` غير مرفوع إلى Git
- [ ] `WEBUI_SECRET_KEY` و `N8N_ENCRYPTION_KEY` عشوائيان وطويلان
- [ ] لا تعرّض Ollama `11434` على الإنternet — محلي فقط
- [ ] Backup: مجلدات Docker volumes (`open_webui_data`, `n8n_data`)

---

## 9) نقل المجلد خارج halaqmap

```powershell
Move-Item "personal-ai-hub" "$env:USERPROFILE\personal-ai-hub"
cd $env:USERPROFILE\personal-ai-hub
```

---

## 10) استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| Open WebUI لا يرى Ollama | تأكد Ollama يعمل + `OLLAMA_BASE_URL=http://host.docker.internal:11434` |
| n8n webhooks لا تعمل | `N8N_WEBHOOK_URL` يجب أن يكون `https://n8n.example.com/` |
| Tunnel 502 | الخدمة المحلية متوقفة — `docker compose ps` |
| بطء شديد | استخدم نموذج أصغر `qwen2.5:3b` أو فعّل GPU |

---

*دليل شخصي — غير مرتبط بإنتاج حلاق ماب.*
