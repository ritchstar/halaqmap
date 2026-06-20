# halaqmap_landing — صفحة هبوط B2B (Skywork)

**تصدير Skywork** لأصحاب الصالونات — مدمج في المنصة الرئيسية.

---

## الدمج في حلاق ماب

| العنصر | الموقع |
|--------|--------|
| **صفحة معتمدة (Production)** | `src/pages/PartnersB2BLanding.tsx` |
| **مسار التطبيق** | `/#/partners/b2b` |
| **نطاق مخصص** | `partners.halaqmap.com` → يوجّه إلى `/#/partners/b2b` |
| **TEXT LOCK** | `docs/pitch/partner-deck-slides-ar.md` |

**روابط CTA داخل المنصة:** التسجيل `/#/partners/register` · تجربة الزبون `/#/`

---

## هذا المجلد (`halaqmap_landing/`)

نسخة Skywork للمرجع والتعديل — **البناء الرسمي من جذر المشروع** (`npm run build`)، وليس من هنا.

### تحديث بعد تعديل Skywork

1. عدّل في Skywork وصدّر إلى `halaqmap_landing/`.
2. انسخ `src/pages/home/index.tsx` → `src/pages/PartnersB2BLanding.tsx`.
3. استبدل `<a href=…>` بـ `<Link to={ROUTE_PATHS.…}>` و`useDocumentTitle` (انظر النسخة الحالية).

---

## النشر — `partners.halaqmap.com`

**موصى به:** نفس مشروع Vercel الرئيسي.

1. Vercel → Domains → أضف `partners.halaqmap.com`
2. DNS: `CNAME partners → cname.vercel-dns.com`
3. Deploy — التوجيه مبرمج في `src/App.tsx` (`PartnersDomainRedirect`)

**لا حاجة** لـ Publish على Skywork إذا استخدمت Vercel.

---

## Tech stack (Skywork)

- Vite · TypeScript · React · shadcn-ui · Tailwind CSS v4 · Framer Motion · RTL

---

## 开发流程 (Skywork)

1. 参考用户需求，调整 `src/index.css` 主题
2. 页面在 `src/pages/` 下
3. 路由在 `src/App.tsx`
4. 同步到 `src/pages/PartnersB2BLanding.tsx` 后再 commit المنصة الرئيسية
