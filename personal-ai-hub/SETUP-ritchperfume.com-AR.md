# إعداد ritchperfume.com — المكتب الشخصي الذكي

**الدومين:** `ritchperfume.com` (Namecheap — ينتهي Mar 21, 2027)  
**المسار:** `personal-ai-hub/`

---

## Subdomains

| الرابط | الخدمة | محلي |
|--------|--------|------|
| https://home.ritchperfume.com | بوابة روابط | `:8090` |
| https://ai.ritchperfume.com | Open WebUI | `:8080` |
| https://n8n.ritchperfume.com | n8n | `:5678` |
| https://ritchperfume.com | نفس البوابة (اختياري) | `:8090` |

---

## المرحلة 1 — Namecheap → Cloudflare (مرة واحدة)

Cloudflare Tunnel **يتطلّب** أن يكون DNS على Cloudflare.

1. سجّل في [dash.cloudflare.com](https://dash.cloudflare.com) (مجاني).
2. **Add site** → `ritchperfume.com` → Plan Free.
3. Cloudflare يعرض **Nameservers** (مثل `ada.ns.cloudflare.com`).
4. Namecheap → **Domain List** → `ritchperfume.com` → **MANAGE**.
5. **Nameservers** → **Custom DNS** → الصق nameservers من Cloudflare → Save.
6. انتظر 5–60 دقيقة حتى يصبح الدومين **Active** على Cloudflare.

> WhoisGuard على Namecheap يبقى — لا مشكلة.

---

## المرحلة 2 — Ollama + Docker (على جهازك)

```powershell
# 1) ثبّت Ollama من ollama.com ثم:
ollama pull qwen2.5:7b
ollama pull nomic-embed-text

# 2) Docker Compose
cd "c:\Users\hp\Downloads\halaqmap\halaqmap (8)\personal-ai-hub"
copy .env.example .env
# عدّل WEBUI_SECRET_KEY و N8N_ENCRYPTION_KEY (سلسلتان عشوائيتان)

docker compose up -d open-webui n8n
docker compose --profile portal up -d portal
```

**تحقق:** http://localhost:8080 · http://localhost:5678 · http://localhost:8090

---

## المرحلة 3 — Cloudflare Tunnel

```powershell
# ثبّت cloudflared من:
# https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

cloudflared tunnel login
cloudflared tunnel create ritch-ai-hub

cloudflared tunnel route dns ritch-ai-hub ai.ritchperfume.com
cloudflared tunnel route dns ritch-ai-hub n8n.ritchperfume.com
cloudflared tunnel route dns ritch-ai-hub home.ritchperfume.com
```

1. انسخ `cloudflared-config.example.yml` → `C:\Users\hp\.cloudflared\config.yml`
2. استبدل `YOUR-TUNNEL-UUID` بـ UUID من `cloudflared tunnel list`
3. صحّح مسار `credentials-file` إن لزم

```powershell
cloudflared tunnel run ritch-ai-hub
```

**تشغيل دائم (Windows):**  
Cloudflare Dashboard → Zero Trust → Networks → Tunnels → `ritch-ai-hub` → Install connector.

---

## المرحلة 4 — Cloudflare Access (حماية — إلزامي)

1. [one.dash.cloudflare.com](https://one.dash.cloudflare.com) → **Access** → **Applications** → Add.
2. Self-hosted → Domain: `ai.ritchperfume.com` → Policy: **Emails** → بريدك.
3. كرّر لـ `n8n.ritchperfume.com` و `home.ritchperfume.com`.
4. (اختياري) `ritchperfume.com` و `www` إذا فعّلتهما في ingress.

بدون Access أي شخص يصل للرابط يرى واجهتك.

---

## المرحلة 5 — n8n بعد HTTPS

`.env` جاهز مسبقاً:

```env
N8N_HOST=n8n.ritchperfume.com
N8N_WEBHOOK_URL=https://n8n.ritchperfume.com/
```

```powershell
docker compose up -d n8n --force-recreate
```

---

## Checklist نهائي

- [ ] Nameservers على Cloudflare
- [ ] `ollama pull qwen2.5:7b` + `nomic-embed-text`
- [ ] Docker: open-webui + n8n + portal
- [ ] Tunnel يعمل + DNS records تظهر في Cloudflare
- [ ] Access على ai / n8n / home
- [ ] https://ai.ritchperfume.com يفتح بعد OTP بريدك

---

## جهازك (16 GB RAM · Intel Iris Xe)

- **أساسي:** `qwen2.5:7b`
- **إذا بطيء:** `qwen2.5:3b`
- **RAG:** `nomic-embed-text`

```powershell
powershell -ExecutionPolicy Bypass -File scripts/detect-hardware.ps1
```

---

## استكشاف أخطاء

| المشكلة | الحل |
|---------|------|
| DNS لا يتحل | انتظر propagation؛ تحقق Nameservers على Namecheap |
| 502 من Tunnel | `docker compose ps` — الخدمات يجب أن تعمل |
| Access loop | امسح cookies أو Incognito |
| Ollama غير متصل | تأكد Ollama يعمل + `OLLAMA_BASE_URL` في `.env` |

---

*دليل شخصي — غير مرتبط بحلاق ماب.*
