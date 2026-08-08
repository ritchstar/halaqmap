/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPinned, Scissors } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { PlatformOfficialFooterStrip } from '@/components/PlatformOfficialFooterStrip';
import {
  HAJJ_NUSUK_CTAS,
  HAJJ_NUSUK_FAQS,
  HAJJ_NUSUK_GEO_LINKS,
  HAJJ_NUSUK_HERO,
  HAJJ_NUSUK_LANG_HINTS,
  HAJJ_NUSUK_META,
  HAJJ_NUSUK_PLATFORM_NOTE,
  HAJJ_NUSUK_TERMS,
  hajjNusukAppCtaUrl,
} from '@/config/hajjNusukLandingCopy';

export default function HajjNusukLanding() {
  useEffect(() => {
    document.title = HAJJ_NUSUK_META.titleAr;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', HAJJ_NUSUK_META.descriptionAr);
  }, []);

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#061223_0%,#0a1f33_45%,#120a06_100%)] text-slate-100"
    >
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute right-[8%] top-[8%] h-[26rem] w-[26rem] rounded-full bg-teal-400/15 blur-[120px]" />
        <div className="absolute left-[10%] top-[40%] h-[20rem] w-[20rem] rounded-full bg-amber-400/12 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-6 md:pb-20 md:pt-8">
        <Link
          to={ROUTE_PATHS.HOME}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-teal-300/40 hover:text-teal-100"
        >
          <ArrowLeft className="h-4 w-4" />
          الرئيسية
        </Link>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-sm font-extrabold text-amber-300"
        >
          {HAJJ_NUSUK_HERO.badgeAr}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4 text-3xl font-black leading-tight text-white md:text-4xl"
        >
          {HAJJ_NUSUK_HERO.h1Ar}
        </motion.h1>
        <p className="mb-8 text-base leading-relaxed text-slate-300 md:text-lg">{HAJJ_NUSUK_HERO.leadAr}</p>

        <section className="mb-10 space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-teal-300">
            <Scissors className="h-5 w-5" />
            مصطلحات النسك
          </h2>
          {HAJJ_NUSUK_TERMS.map((t) => (
            <article
              key={t.termAr}
              className="rounded-2xl border border-teal-400/20 bg-white/5 p-4"
            >
              <h3 className="mb-1 text-base font-extrabold text-white">{t.termAr}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{t.bodyAr}</p>
            </article>
          ))}
        </section>

        <section className="mb-10 rounded-2xl border border-amber-400/30 bg-amber-950/30 p-4">
          <h2 className="mb-2 text-lg font-bold text-amber-200">دور المنصة</h2>
          <p className="text-sm leading-relaxed text-amber-50/90">{HAJJ_NUSUK_PLATFORM_NOTE}</p>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-lg font-bold text-teal-300">ابدأ الاستعلام الآن</h2>
          {HAJJ_NUSUK_CTAS.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <a
                href={hajjNusukAppCtaUrl(c.appNearKey)}
                className="mb-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-teal-600 to-cyan-600 px-4 py-3 text-center text-base font-extrabold text-slate-950"
              >
                {c.labelAr}
              </a>
              <p className="text-sm text-slate-400">{c.blurbAr}</p>
              <a
                href={c.nearPath}
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-teal-300 hover:underline"
              >
                <MapPinned className="h-4 w-4" />
                صفحة أقرب حلاق المحلية
              </a>
            </div>
          ))}
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold text-teal-300">صفحات أقرب حلاق — مكة والمدينة</h2>
          <ul className="space-y-2">
            {HAJJ_NUSUK_GEO_LINKS.map((g) => (
              <li key={g.href}>
                <a
                  href={g.href}
                  className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-teal-400/40"
                >
                  {g.labelAr}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-2 text-lg font-bold text-teal-300">كلمات يبحث بها الحجاج بلغات أخرى</h2>
          <p className="mb-3 text-sm text-slate-400">
            نفس المسار عبر أزرار مكة والمدينة أعلاه — إشارات لغوية مساعدة فقط.
          </p>
          <ul className="space-y-2">
            {HAJJ_NUSUK_LANG_HINTS.map((l) => (
              <li
                key={l.langAr}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
              >
                <p className="mb-1 text-sm font-bold text-amber-300">{l.langAr}</p>
                <p dir="auto" className="text-sm text-slate-300">
                  {l.line}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold text-teal-300">أسئلة شائعة</h2>
          <div className="space-y-2">
            {HAJJ_NUSUK_FAQS.map((f) => (
              <details
                key={f.q}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <summary className="cursor-pointer font-bold text-slate-100">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <PlatformOfficialFooterStrip />
      </div>
    </div>
  );
}
