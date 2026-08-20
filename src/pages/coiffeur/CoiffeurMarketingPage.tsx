/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * خطط الظهور ومنجزات كوافير ماب — صفحة تجارية لصاحبة المشغل.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Heart,
  Megaphone,
  QrCode,
  Radio,
  Search,
  Sparkles,
} from 'lucide-react';
import { CoiffeurBrandMark } from '@/components/coiffeur/CoiffeurBrandMark';
import { RegisterSalonGlowIcon } from '@/components/partner/RegisterSalonGlowIcon';
import {
  COIFFEUR_FOOTER_ECOMMERCE_AR,
  COIFFEUR_FOOTER_LEGAL_AR,
  COIFFEUR_UMBRELLA_LINE_AR,
} from '@/config/coiffeurMapUmbrella';
import {
  COIFFEUR_MARKETING_META,
  COIFFEUR_MARKETING_MOOD,
  COIFFEUR_MARKETING_PAGE as COPY,
  COIFFEUR_MARKETING_PILLARS,
  COIFFEUR_MARKETING_PROOF_IMAGE,
} from '@/config/coiffeurMarketingCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { ROUTE_PATHS } from '@/lib/routePaths';

const PILLAR_ICONS = [Search, Radio, QrCode, Heart, Sparkles, Sparkles, CreditCard] as const;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function CoiffeurMarketingPage() {
  useDocumentTitle(COIFFEUR_MARKETING_META.documentTitle);

  useEffect(() => {
    ProductEvents.partnerLandingView();
  }, []);

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-x-clip bg-[linear-gradient(165deg,#14080e_0%,#1c0d14_48%,#12070c_100%)] text-rose-50"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(244,212,192,0.35) 1px,transparent 1px),linear-gradient(90deg,rgba(244,212,192,0.18) 1px,transparent 1px)',
          backgroundSize: '56px 56px',
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-rose-400/14 blur-[110px]" aria-hidden />
      <div className="pointer-events-none absolute -right-24 top-40 h-[22rem] w-[22rem] rounded-full bg-amber-200/12 blur-[96px]" aria-hidden />

      <header className="relative z-10 border-b border-[#f4d4c0]/15 px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link to={ROUTE_PATHS.COIFFEUR_LANDING} className="inline-flex no-underline">
            <CoiffeurBrandMark className="h-20 w-20 ring-1 ring-[#f4d4c0]/40" sizes="80px" />
          </Link>
          <Link
            to={ROUTE_PATHS.COIFFEUR_PARTNERS}
            className="text-sm font-bold text-[#f4d4c0] hover:text-white"
          >
            {COPY.ctaPartners}
          </Link>
        </div>
      </header>

      <section className="relative z-10 px-5 py-14 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f4d4c0]/40 bg-[#f4d4c0]/12 px-4 py-1.5 text-xs font-black tracking-[0.14em] text-[#f4d4c0]"
          >
            <Megaphone className="h-3.5 w-3.5" />
            {COPY.badge}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-balance bg-gradient-to-l from-white via-rose-50 to-[#f4d4c0] bg-clip-text text-3xl font-black leading-[1.3] text-transparent md:text-5xl"
          >
            {COPY.title}
          </motion.h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-bold leading-9 text-[#f4d4c0] md:text-2xl">
            {COPY.headline}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-rose-100/80 md:text-lg">
            {COPY.lead}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={ROUTE_PATHS.COIFFEUR_REGISTER}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#f4d4c0] to-amber-200 px-8 py-4 text-sm font-black text-[#14080e] shadow-[0_16px_36px_rgba(244,212,192,0.28)]"
            >
              <RegisterSalonGlowIcon size="md" tone="gold" />
              {COPY.ctaPrimary}
            </Link>
            <button
              type="button"
              onClick={() => scrollToSection('منجز-الظهور')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f4d4c0]/30 bg-white/5 px-6 py-4 text-sm font-bold text-rose-50 hover:bg-white/10"
            >
              {COPY.ctaProof}
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 pb-6">
        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-3">
          {COIFFEUR_MARKETING_MOOD.map((shot) => (
            <figure
              key={shot.src}
              className="overflow-hidden rounded-2xl border border-[#f4d4c0]/20"
            >
              <img src={shot.src} alt={shot.alt} className="aspect-[16/10] w-full object-cover" />
            </figure>
          ))}
        </div>
      </section>

      <section
        id="منجز-الظهور"
        className="relative z-10 scroll-mt-8 px-5 py-12 md:py-16"
      >
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border border-[#f4d4c0]/35 bg-[#1a0c12]/85 shadow-[0_28px_70px_-30px_rgba(244,212,192,0.45)]">
          <div className="grid items-center gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 md:p-10">
              <p className="text-xs font-black tracking-[0.18em] text-[#f4d4c0]">{COPY.proofKicker}</p>
              <h2 className="mt-3 text-2xl font-black leading-snug text-white md:text-3xl">
                {COPY.proofTitle}
              </h2>
              <p className="mt-4 text-base leading-8 text-rose-100/80 md:text-lg">{COPY.proofLead}</p>
              <p className="mt-4 text-sm text-rose-100/55">
                {COPY.proofQueryLabel}
                <span className="mx-2 font-extrabold text-[#f4d4c0]">{COPY.proofQuery}</span>
                <code dir="ltr" className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-[0.75rem]">
                  {COPY.proofHost}
                </code>
              </p>
              <p className="mt-5 text-sm leading-7 text-rose-100/75">{COPY.proofInvite}</p>
            </div>
            <figure className="border-t border-[#f4d4c0]/20 bg-white lg:border-t-0 lg:border-s">
              <img
                src={COIFFEUR_MARKETING_PROOF_IMAGE}
                alt={COPY.proofAlt}
                className="aspect-[16/9] w-full object-contain object-top bg-white"
              />
              <figcaption className="border-t border-[#f4d4c0]/20 bg-[#14080e] px-4 py-3 text-sm font-bold text-[#f4d4c0]">
                {COPY.proofCaption}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <nav
        aria-label="محاور خطة الظهور"
        className="relative z-20 border-y border-[#f4d4c0]/20 bg-[#14080e]/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3 md:flex-wrap md:justify-center">
          {COIFFEUR_MARKETING_PILLARS.map((pillar) => (
            <button
              type="button"
              key={pillar.id}
              onClick={() => scrollToSection(pillar.id)}
              className="shrink-0 rounded-full border border-[#f4d4c0]/25 bg-[#f4d4c0]/10 px-3 py-1.5 text-xs font-bold text-rose-100 hover:border-[#f4d4c0]/60 hover:text-white"
            >
              {pillar.numeral} · {pillar.kicker}
            </button>
          ))}
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl space-y-10 px-5 py-12 md:py-16">
        <header className="max-w-3xl">
          <p className="text-xs font-black tracking-[0.18em] text-[#f4d4c0]">{COPY.howKicker}</p>
          <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">{COPY.howTitle}</h2>
          <p className="mt-4 text-base leading-8 text-rose-100/75 md:text-lg">{COPY.howLead}</p>
        </header>

        {COIFFEUR_MARKETING_PILLARS.map((pillar, index) => {
          const Icon = PILLAR_ICONS[index] ?? Sparkles;
          return (
            <motion.article
              key={pillar.id}
              id={pillar.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-48px' }}
              transition={{ duration: 0.45 }}
              className="scroll-mt-28 overflow-x-clip rounded-3xl border border-[#f4d4c0]/25 bg-white/[0.035] shadow-[0_24px_60px_rgba(20,8,14,0.45)]"
            >
              <div className="flex flex-col gap-6 border-r-4 border-[#f4d4c0]/70 p-6 md:flex-row md:p-8">
                <div className="flex shrink-0 flex-col items-start gap-3 md:w-36">
                  <span className="bg-gradient-to-b from-[#f4d4c0] to-amber-200 bg-clip-text text-5xl font-black leading-none text-transparent md:text-6xl">
                    {pillar.numeral}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-[#f4d4c0]/40 bg-[#f4d4c0]/12 px-3 py-2 text-[#f4d4c0]">
                    <Icon className="h-4 w-4" />
                    <span className="text-[0.7rem] font-black tracking-wide">{pillar.kicker}</span>
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-black leading-snug text-white md:text-2xl">{pillar.title}</h3>
                  <p className="mt-4 text-base leading-8 text-rose-100/80 md:text-lg">{pillar.body}</p>
                  <ul className="mt-5 space-y-2.5">
                    {pillar.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm leading-7 text-rose-50/90">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#f4d4c0]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 rounded-2xl border border-[#f4d4c0]/25 bg-gradient-to-l from-[#f4d4c0]/15 via-[#f4d4c0]/8 to-transparent px-5 py-4">
                    <p className="text-[0.68rem] font-black tracking-[0.16em] text-[#f4d4c0]">
                      {pillar.benefitLabel}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-8 text-rose-50 md:text-base">
                      {pillar.benefit}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <section className="relative z-10 border-t border-[#f4d4c0]/15 px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl rounded-3xl border border-[#f4d4c0]/25 bg-[#1a0c12] px-6 py-10 text-center md:px-10"
        >
          <p className="text-xs font-black tracking-[0.2em] text-[#f4d4c0]">{COPY.closeKicker}</p>
          <h2 className="mt-3 text-2xl font-black leading-snug text-white md:text-3xl">{COPY.closeTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-rose-100/75">{COPY.closeBody}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={ROUTE_PATHS.COIFFEUR_REGISTER}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[#f4d4c0] to-amber-200 px-8 py-4 text-sm font-black text-[#14080e]"
            >
              <RegisterSalonGlowIcon size="md" tone="gold" />
              {COPY.ctaPrimary}
            </Link>
            <Link
              to={ROUTE_PATHS.COIFFEUR_INTEREST}
              className="inline-flex items-center gap-2 rounded-xl border border-[#f4d4c0]/30 bg-white/5 px-6 py-4 text-sm font-bold text-rose-50 hover:bg-white/10"
            >
              {COPY.ctaInterest}
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-[#f4d4c0]/15 px-5 py-8 text-center">
        <p className="text-sm leading-7 text-rose-100/70">{COIFFEUR_UMBRELLA_LINE_AR}</p>
        <p className="mt-2 text-xs text-rose-100/50">{COIFFEUR_FOOTER_LEGAL_AR}</p>
        <p className="mt-1 text-xs text-rose-100/50">{COIFFEUR_FOOTER_ECOMMERCE_AR}</p>
        <Link to={ROUTE_PATHS.COIFFEUR_PARTNERS} className="mt-3 inline-block text-sm text-[#f4d4c0]">
          {COPY.ctaPartners}
        </Link>
      </footer>
    </div>
  );
}
