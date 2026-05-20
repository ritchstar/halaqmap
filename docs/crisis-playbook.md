# Halaq Map — Crisis Playbook (Internal B2B)

**Classification:** Founder / Super Admin only · Professional Sovereignty  
**Scope:** Uptime, data integrity, payment continuity, and sovereign recovery of the Halaq Map platform.

---

## 0. Crisis triage (first 5 minutes)

1. **Confirm blast radius** — consumer map/search (`Home.tsx`), partner registration, barber portal, admin dashboard, or payments only?
2. **Freeze non-essential changes** — no feature deploys during active incident.
3. **Preserve evidence** — Vercel deployment ID, Supabase logs, Moyasar webhook payloads, browser HAR if UI-only.
4. **Assign roles** — one operator on comms, one on infra, one on data verification.
5. **Open Crisis Discussion** — use the System Crisis Advisor thread; prioritize P0/P1 tasks only.

---

## 1. Supabase / database

| Symptom | Immediate action | Verification |
|--------|------------------|--------------|
| API 503 / RLS deny-all | Confirm `SUPABASE_SERVICE_ROLE_KEY` on Vercel; never expose to client | `GET /api/ops-controller` with admin JWT |
| Migration drift | Apply pending SQL in order (`supabase/migrations/`) via SQL Editor or `supabase db push` | Compare migration list vs production |
| Admin tables unreachable | Apply `82_platform_admin_server_role_grants.sql` if grants missing | Service role SELECT on `platform_ops_controller_reports` |
| Data corruption suspicion | Stop writes; snapshot via Supabase backup/PITR if available | Row counts on `barbers`, `payments`, `registration_submissions` |

**Rollback:** restore from Supabase backup; replay webhooks only after finance sign-off.

---

## 2. Vercel / frontend

| Symptom | Immediate action | Verification |
|--------|------------------|--------------|
| Blank admin / 404 on routes | HashRouter — confirm `/#/admin` paths; check `dist/index.html` | `npm run build` locally |
| API routes 502 | Check function logs; `maxDuration` in `vercel.json` | Hit route GET diagnostics |
| Stale PWA cache | Bump build; verify `Cache-Control` on `index.html` / `sw.js` | Hard refresh / incognito |

**Rollback:** redeploy previous Vercel deployment from dashboard.

---

## 3. Payments (Moyasar)

| Symptom | Immediate action | Verification |
|--------|------------------|--------------|
| Webhook not firing | Check `supabase/functions/moyasar-webhook` secrets; Vercel proxy | Test event in Moyasar dashboard |
| Paid but barber inactive | Run fulfillment path: `listing-license-fulfill-internal`, approve flow | `payments` + `barber_subscriptions` rows |
| Double charge concern | Do **not** manual refund from UI; trace `payments` id + Moyasar id | Admin payments tab |

---

## 4. Auth & admin access

| Symptom | Immediate action | Verification |
|--------|------------------|--------------|
| Founder locked out | Bootstrap email in `ADMIN_EMAIL` / `VITE_ADMIN_EMAIL`; `platform_admin_roles` | `adminManageBarbersAuth.isBootstrapAdminEmail` |
| Staff permission regression | Inspect `permissions` JSON on `platform_admin_roles` | Re-seed from AdminDashboard templates |
| Sentinel / crisis routes 401 | JWT expiry; Supabase session refresh | Re-login via admin login path |

---

## 5. AI staff & ops intelligence

| Symptom | Immediate action | Verification |
|--------|------------------|--------------|
| Lab chat 502 | `OPENAI_API_KEY` on Vercel; model env vars | GET `/api/admin-system-crisis-advisor-lab-chat` |
| Ops digest missing | Cron `0 5 * * *` → `/api/ops-intelligence-report?cron=1` | Manual GET with `CRON_SECRET` |
| Urgent field reports | Review `FounderOperationalFeedPanel` red flags | `platform_ops_controller_reports` severity=urgent |

---

## 6. Data integrity checklist

- [ ] `barbers.is_active` matches paid subscriptions
- [ ] `registration_submissions` without orphan payments
- [ ] No service role key in client bundle (`VITE_*` audit)
- [ ] RLS deny-all on sensitive tables (`platform_ops_controller_reports`, financial archive)
- [ ] Honor Board / B2B manifesto not leaked on `Home.tsx` consumer routes

---

## 7. Communication templates

**Internal (founder):**  
«حادث تشغيلي P{0|1} — نطاق: {subsystem}. الإجراء الحالي: {action}. ETA للاستقرار: {eta}. سلامة البيانات: {ok|under review}.»

**Partners (if needed):**  
«نعمل على استعادة خدمة {feature} — حسابكم ومدفوعاتكم آمنة وفق سجلاتنا. لا حاجة لإعادة الدفع.»

---

## 8. Post-incident

1. Root cause document (internal, Arabic + technical appendix).
2. Migration or config guard to prevent recurrence.
3. Update this playbook with lesson learned.
4. Optional: synthetic ops report via OPS_MANAGER feed for audit trail.

---

*Last reviewed: May 2026 · Halaq Map — مؤسسة أحمد بن عبدالله بن سراء التجارية*
