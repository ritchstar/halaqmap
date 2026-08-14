/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * صفحة تعهدات التسويق والانتشار — مسار الشركاء.
 * المسار: /partners/marketing
 */
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  CreditCard,
  Globe2,
  Landmark,
  Megaphone,
  QrCode,
  Radio,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { PARTNER_JOIN_PATH_PRIMARY_CTA_AR } from '@/config/partnerJoinPathCopy';
import {
  PARTNER_MARKETING_PAGE,
  PARTNER_MARKETING_PAGE_META,
  PARTNER_MARKETING_PILLARS,
} from '@/config/partnerMarketingCommitmentsCopy';

const PILLAR_ICONS = [Search, Radio, QrCode, Landmark, Bot, CreditCard, ShieldCheck] as const;

function renderRich(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={`${part}-${i}`}
          className="mx-0.5 inline-block rounded-md border border-teal-400/25 bg-teal-500/10 px-1.5 py-0.5 font-mono text-[0.9em] text-teal-100"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${i}-${part.slice(0, 12)}`}>{part}</span>;
  });
}

export default function PartnerMarketingCommitmentsPage() {
  const navigate = useNavigate();
  useDocumentTitle(PARTNER_MARKETING_PAGE_META.documentTitle);

  useEffect(() => {
    ProductEvents.partnerLandingView();
  }, []);

  const goRegister = (source: string) => {
    ProductEvents.partnerJoinCtaClick({ source });
    navigate(ROUTE_PATHS.REGISTER);
  };

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(165deg,#020912_0%,#041422_48%,#020912_100%)] text-slate-100"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(20,184,166,0.35) 1px,transparent 1px),linear-gradient(90deg,rgba(251,191,36,0.22) 1px,transparent 1px)',
          backgroundSize: '56px 56px',
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-teal-500/12 blur-[110px]" aria-hidden />
      <div className="pointer-events-none absolute -right-24 top-40 h-[22rem] w-[22rem] rounded-full bg-amber-400/10 blur-[96px]" aria-hidden />

      <section className="relative z-10 border-b border-white/10 px-5 py-14 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-500/10 px-4 py-1.5 text-xs font-black tracking-[0.14em] text-amber-200"
          >
            <Megaphone className="h-3.5 w-3.5" />
            {PARTNER_MARKETING_PAGE.badge}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-balance bg-gradient-to-l from-white via-teal-50 to-amber-100 bg-clip-text text-3xl font-black leading-[1.25] text-transparent md:text-5xl"
          >
            {PARTNER_MARKETING_PAGE.title}
          </motion.h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-bold leading-9 text-teal-100 md:text-2xl">
            {PARTNER_MARKETING_PAGE.headline}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            {PARTNER_MARKETING_PAGE.lead}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => goRegister('marketing_hero')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-8 py-4 text-sm font-black text-white shadow-[0_16px_36px_rgba(20,184,166,0.28)]"
            >
              <Scissors className="h-4 w-4" />
              {PARTNER_JOIN_PATH_PRIMARY_CTA_AR}
            </button>
            <Link
              to={ROUTE_PATHS.PARTNER_SALES_OFFICE}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-bold text-slate-100 hover:bg-white/10"
            >
              {PARTNER_MARKETING_PAGE.ctaSecondary}
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <nav
        aria-label="محاور الاستراتيجية"
        className="relative z-20 border-b border-white/10 bg-[#020912]/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3 md:flex-wrap md:justify-center">
          {PARTNER_MARKETING_PILLARS.map((pillar) => (
            <a
              key={pillar.id}
              href={`#${pillar.id}`}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-teal-400/40 hover:text-white"
            >
              {pillar.numeral} · {pillar.kicker}
            </a>
          ))}
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl space-y-8 px-5 py-12 md:py-16">
        {PARTNER_MARKETING_PILLARS.map((pillar, index) => {
          const Icon = PILLAR_ICONS[index] ?? Sparkles;
          return (
            <motion.article
              key={pillar.id}
              id={pillar.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-48px' }}
              transition={{ duration: 0.45 }}
              className="scroll-mt-28 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-[0_24px_60px_rgba(2,9,18,0.45)]"
            >
              <div className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
                <div className="flex shrink-0 flex-col items-start gap-3 md:w-36">
                  <span className="bg-gradient-to-b from-amber-200 to-teal-300 bg-clip-text text-5xl font-black leading-none text-transparent md:text-6xl">
                    {pillar.numeral}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-teal-400/25 bg-teal-500/10 px-3 py-2 text-teal-100">
                    <Icon className="h-4 w-4" />
                    <span className="text-[0.7rem] font-black tracking-wide">{pillar.kicker}</span>
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black leading-snug text-white md:text-2xl">
                    {renderRich(pillar.title)}
                  </h2>
                  <p className="mt-4 text-base leading-8 text-slate-300 md:text-lg">{renderRich(pillar.body)}</p>
                  <ul className="mt-5 space-y-2.5">
                    {pillar.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm leading-7 text-slate-200">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-300" />
                        <span>{renderRich(point)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 rounded-2xl border border-amber-300/25 bg-gradient-to-l from-amber-500/15 via-amber-500/8 to-transparent px-5 py-4">
                    <p className="text-[0.68rem] font-black tracking-[0.16em] text-amber-200">
                      {pillar.benefitLabel}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-8 text-amber-50 md:text-base">
                      {pillar.benefit}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <section className="relative z-10 border-t border-white/10 px-5 py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-teal-400/10 blur-[80px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl rounded-3xl border border-teal-400/25 bg-[#041018] px-6 py-10 text-center md:px-10"
        >
          <p className="text-xs font-black tracking-[0.2em] text-teal-300">{PARTNER_MARKETING_PAGE.closeKicker}</p>
          <h2 className="mt-3 text-2xl font-black leading-snug text-white md:text-3xl">
            {PARTNER_MARKETING_PAGE.closeTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-300">
            {PARTNER_MARKETING_PAGE.closeBody}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => goRegister('marketing_close')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-8 py-4 text-sm font-black text-white shadow-[0_16px_36px_rgba(20,184,166,0.28)]"
            >
              <Scissors className="h-4 w-4" />
              {PARTNER_MARKETING_PAGE.ctaPrimary}
            </button>
            <Link
              to={ROUTE_PATHS.BARBERS_LANDING}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-bold text-slate-100 hover:bg-white/10"
            >
              <Globe2 className="h-4 w-4" />
              {PARTNER_MARKETING_PAGE.ctaTertiary}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
