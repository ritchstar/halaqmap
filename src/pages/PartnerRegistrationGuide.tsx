/**
 * PartnerRegistrationGuide — تعليمات طريقة الاشتراك
 * Route: /partners/register/guide
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpenCheck,
  ChevronRight,
  ClipboardPen,
  Scissors,
  CheckCircle2,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { PARTNER_REGISTRATION_GUIDE } from '@/config/partnerRegistrationGuideCopy';

/** HashRouter لا يدعم #عنصر داخل المسار — نمرّر state للتمرير إلى النموذج */
const backToFormLink = {
  pathname: ROUTE_PATHS.REGISTER,
  state: { scrollToForm: true },
} as const;

export default function PartnerRegistrationGuide() {
  const copy = PARTNER_REGISTRATION_GUIDE;

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden"
      style={{
        background: 'linear-gradient(160deg, #020912 0%, #040d1a 50%, #020912 100%)',
        fontFamily: 'Tajawal, system-ui',
      }}
    >
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#020912]/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link
            to={ROUTE_PATHS.REGISTER}
            className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
            صفحة التسجيل
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/10">
              <BookOpenCheck className="h-4 w-4 text-sky-300" />
            </div>
            <span className="text-sm font-black text-white">تعليمات الاشتراك</span>
          </div>
          <Link
            to={backToFormLink.pathname}
            state={backToFormLink.state}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/15 px-2.5 py-1.5 text-[0.65rem] font-bold text-amber-200 transition hover:bg-amber-500/25 sm:px-3 sm:text-xs"
            title={copy.backToFormCta}
            aria-label={copy.backToFormCta}
          >
            <ClipboardPen className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{copy.backToFormCta}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-8 md:pb-16">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/10">
            <BookOpenCheck className="h-8 w-8 text-sky-300" aria-hidden />
          </div>
          <p className="text-[0.7rem] font-bold text-sky-300/90">{copy.kicker}</p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">{copy.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">{copy.subtitle}</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-[0.65rem] text-slate-500">
            <Scissors className="h-3.5 w-3.5 text-amber-300/80" aria-hidden />
            حلاق ماب · مسار الشركاء
          </div>
        </motion.header>

        <div className="space-y-5">
          {copy.sections.map((section, index) => (
            <motion.section
              key={section.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * (index + 1) }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
            >
              <h2 className="text-base font-black text-white sm:text-lg">{section.title}</h2>

              {'items' in section && section.items ? (
                <ul className="mt-4 space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm leading-7 text-slate-300">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-400/90" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {'nested' in section && section.nested ? (
                <ul className="mt-3 mr-6 space-y-2 border-r border-teal-400/20 pr-4">
                  {section.nested.map((item) => (
                    <li key={item} className="text-sm leading-7 text-slate-400">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}

              {'blocks' in section && section.blocks
                ? section.blocks.map((block) => (
                    <div
                      key={block.heading}
                      className="mt-5 rounded-xl border border-white/8 bg-black/20 p-4"
                    >
                      <h3 className="text-sm font-bold text-amber-200">{block.heading}</h3>
                      <ul className="mt-3 space-y-2.5">
                        {block.items.map((item) => (
                          <li
                            key={item.slice(0, 40)}
                            className="flex items-start gap-2.5 text-sm leading-7 text-slate-300"
                          >
                            <CheckCircle2
                              className="mt-1 h-4 w-4 shrink-0 text-amber-400/80"
                              aria-hidden
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                : null}
            </motion.section>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mx-auto mt-8 max-w-2xl text-center text-sm leading-8 text-slate-400"
        >
          {copy.closing}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            to={backToFormLink.pathname}
            state={backToFormLink.state}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-700 px-5 py-3 text-sm font-black text-white shadow-[0_10px_28px_rgba(245,158,11,0.25)] transition hover:from-amber-400 hover:to-amber-600 sm:w-auto"
          >
            <ClipboardPen className="h-5 w-5" aria-hidden />
            {copy.backToFormCta}
          </Link>
          <Link
            to={ROUTE_PATHS.BARBERS_LANDING}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 sm:w-auto"
          >
            صفحة الشركاء
          </Link>
        </motion.div>
      </main>

      {/* أيقونة عائمة للعودة للنموذج مع حفظ المسودة */}
      <Link
        to={backToFormLink.pathname}
        state={backToFormLink.state}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[55] inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-[0_10px_28px_rgba(245,158,11,0.35)] transition hover:bg-amber-400 active:scale-[0.97]"
        aria-label={copy.backToFormCta}
        title={copy.backToFormCta}
      >
        <ClipboardPen className="h-5 w-5 shrink-0" aria-hidden />
        تعبئة الطلب
      </Link>
    </div>
  );
}
