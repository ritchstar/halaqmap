/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * هبوط كوافير ماب — سطح قطاعي تحت مظلة حلاق ماب.
 * لا بوابة دفع محلية. التسجيل يعيد استخدام /partners/register.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Scissors, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  COIFFEUR_BRAND_AR,
  COIFFEUR_FOOTER_ECOMMERCE_AR,
  COIFFEUR_FOOTER_LEGAL_AR,
  COIFFEUR_LANDING_COPY,
  COIFFEUR_LANDING_META,
  COIFFEUR_UMBRELLA_LINE_AR,
} from '@/config/coiffeurMapUmbrella';

const TRUST_ICONS = [Sparkles, Wallet, ShieldCheck] as const;

export default function CoiffeurLanding() {
  useDocumentTitle(COIFFEUR_LANDING_META.documentTitle);

  return (
    <div dir="rtl" className="relative min-h-screen overflow-x-clip bg-[linear-gradient(165deg,#020912_0%,#041422_48%,#020912_100%)] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#020912]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-black text-teal-300">{COIFFEUR_BRAND_AR}</p>
            <p className="text-[11px] text-slate-400">سطح قطاعي تابع لمنصة حلاق ماب</p>
          </div>
          <Link
            to={ROUTE_PATHS.COIFFEUR_PARTNERS}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-4 py-2.5 text-xs font-black text-white"
          >
            <Scissors className="h-3.5 w-3.5" />
            {COIFFEUR_LANDING_COPY.partnerCta}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 pb-10 pt-14 text-center">
        <span className="inline-flex rounded-full border border-teal-400/40 bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-200">
          {COIFFEUR_LANDING_COPY.badge}
        </span>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl"
        >
          {COIFFEUR_LANDING_COPY.title}
        </motion.h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-slate-300 sm:text-base">
          {COIFFEUR_LANDING_COPY.lead}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to={ROUTE_PATHS.COIFFEUR_INQUIRE}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-6 py-3 text-sm font-black text-white"
          >
            {COIFFEUR_LANDING_COPY.searchCta}
          </Link>
          <Link
            to={ROUTE_PATHS.COIFFEUR_PARTNERS}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-500/10 px-6 py-3 text-sm font-black text-amber-100"
          >
            {COIFFEUR_LANDING_COPY.partnerSecondary}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <p className="mx-auto mt-3 max-w-lg text-xs leading-6 text-slate-500">
          {COIFFEUR_LANDING_COPY.searchHint}
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-5 pb-16 sm:grid-cols-3">
        {COIFFEUR_LANDING_COPY.trust.map((point, index) => {
          const Icon = TRUST_ICONS[index] ?? Sparkles;
          return (
            <div key={point.title} className="rounded-2xl border border-teal-400/20 bg-white/[0.03] p-5">
              <Icon className="h-5 w-5 text-teal-300" />
              <h2 className="mt-3 text-sm font-black text-white">{point.title}</h2>
              <p className="mt-2 text-xs leading-7 text-slate-400">{point.body}</p>
            </div>
          );
        })}
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center">
        <p className="text-xs leading-7 text-slate-400">{COIFFEUR_UMBRELLA_LINE_AR}</p>
        <p className="mt-2 text-[11px] text-slate-500">{COIFFEUR_FOOTER_LEGAL_AR}</p>
        <p className="mt-1 text-[11px] text-slate-500">{COIFFEUR_FOOTER_ECOMMERCE_AR}</p>
        <Link to={ROUTE_PATHS.HOME} className="mt-3 inline-block text-xs font-bold text-teal-300">
          العودة لحلاق ماب
        </Link>
      </footer>
    </div>
  );
}
