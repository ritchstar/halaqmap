# Handoff تقني — كوافير ماب تحت مظلة حلاق ماب

**الحالة:** مدمج داخل مستودع حلاق ماب. لا مشروع جديد، لا مستودع منفصل، لا فورم تسجيل منسوخ.

راجعه كروسور وصحّح بندين قبل التنفيذ: لا تُبنَ فورم انضمام مستقل، ولا تُنسَخ صفحات `/near` و`/need` في هذه المرحلة.

---

## 1. التكديس المعتمد — لا يُغيَّر

Vite + React 18 + TypeScript + `HashRouter` + Tailwind + Framer Motion + TanStack Query + Supabase + دوال `api/` على Vercel + Moyasar (تاجر حلاق ماب فقط).

**ممنوع:** Next.js، Vue، HTML مستقل كمنصة، `BrowserRouter`، مشروع Vite منفصل، حساب Moyasar جديد، `callback_url` جديد.

---

## 2. المسارات الفعلية داخل نفس التطبيق

```
/#/coiffeur                     هبوط كوافير ماب
/#/coiffeur/partners            هبوط الشركاء (نصوص نسائية فقط)
/#/coiffeur/partners/register   إعادة توجيه إلى /#/partners/register?surface=coiffeur
```

**لا تُنشأ** `CoiffeurPartnersRegister.tsx`. فورم الخطوات السبع هو فورم حلاق ماب الحالي بلا تعديل ترتيب/إلزام.

**لا تُنشأ الآن** نسخ `/coiffeur/near` أو `/coiffeur/need`. خريطة المستعلمات تُفعَّل بعد تسكين صالونات نسائية — لا تُحوَّل المستعلمة إلى مسار الحلاقة الرجالية.

---

## 3. الدفع — غير قابل للتفاوض

كل بدء دفع ونجاح دفع وcallback:

```
https://www.halaqmap.com/#/partners/payment
https://www.halaqmap.com/#/partners/payment/success
```

الثوابت في الكود: `src/config/coiffeurMapUmbrella.ts`

على المضيف `coiffeur.halaqmap.com`: أي هاش دفع يُعاد فوراً إلى `www.halaqmap.com`.

---

## 4. الملفات داخل المستودع

```
src/config/coiffeurMapUmbrella.ts
src/pages/coiffeur/CoiffeurLanding.tsx
src/pages/coiffeur/CoiffeurPartnersLanding.tsx
src/lib/routePaths.ts          (COIFFEUR_*)
src/App.tsx                    (المسارات + CoiffeurDomainRedirect)
```

---

## 5. الاستضافة

نفس أصل حلاق ماب على Vercel. الدومين القمر الصناعي المستهدف: `coiffeur.halaqmap.com` (CNAME لنفس التطبيق). لا مشروع Vercel منفصل.

نمط مجتمع ماب يبقى المرجع: واجهة على دومين خاص، والكيان والدفع على حلاق ماب.

---

## 6. ما يبنيه الوكيل الخارجي بعد ذلك

- نصوص/مكونات عرض إضافية تحت `src/pages/coiffeur/` فقط.
- لا يلمس فورم التسجيل، لا ميسر، لا `callback_url`، لا أسعار جديدة دون اعتماد المظلة.
- أي CTA دفع يستخدم `COIFFEUR_HALAQMAP_PAYMENT_URL` حصراً.

## 7. معايير القبول

- [ ] المسارات تعمل عبر `HashRouter` داخل نفس bundle
- [ ] لا رابط دفع خارج `www.halaqmap.com`
- [ ] التسجيل = `/partners/register` وليس فورم منسوخ
- [ ] الفوتر يحمل نص التبعية + الرقم الوطني الموحد + توثيق التجارة الإلكترونية
- [ ] لا حساب Moyasar جديد
