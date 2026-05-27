import { useEffect } from 'react';
import { BannersPageDigitalShift } from '@/components/BannersPageDigitalShift';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Radar, Sparkles } from 'lucide-react';
import { BarberDashboardNeonPreview } from '@/components/partner/banners-preview/BarberDashboardNeonPreview';
import { BannersPreviewAmbient } from '@/components/partner/banners-preview/BannersPreviewAmbient';
import { DigitalShiftImpactPreview } from '@/components/partner/banners-preview/DigitalShiftImpactPreview';
import { DigitalShiftAdminTrainingPreview } from '@/components/partner/banners-preview/DigitalShiftAdminTrainingPreview';
import { PrivateOfficeSimPreview } from '@/components/partner/banners-preview/PrivateOfficeSimPreview';
import { BannerPreviewTierSection } from '@/components/partner/banners-preview/BannerPreviewTierSection';
import { PartnerProductHubSectionNav } from '@/components/partner/banners-preview/PartnerProductHubSectionNav';
import { PartnerTierComparisonGrid } from '@/components/partner/banners-preview/PartnerTierComparisonGrid';
import { Button } from '@/components/ui/button';
import {
  PARTNER_BANNERS_PREVIEW_TIERS,
  PARTNER_FEATURE_PREVIEW_DASHBOARD,
  PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT,
  PARTNER_FEATURE_PREVIEW_PRIVATE_OFFICE,
  PARTNER_PRODUCT_HUB_CTA,
  PARTNER_PRODUCT_HUB_INTRO,
  PARTNER_PRODUCT_HUB_SECTION_IDS,
  PARTNER_PRODUCT_HUB_SECTIONS,
  PARTNER_PRODUCT_HUB_TAGLINE,
  PARTNER_PRODUCT_HUB_TITLE,
  PARTNER_TIER_COMPARISON_COLUMNS,
} from '@/config/partnerProductHubCopy';
import {
  PLATFORM_IDENTITY_BADGE_AR,
  PLATFORM_IDENTITY_BOILERPLATE_AR,
} from '@/config/platformIdentity';
import { PlatformTrustStrip } from '@/components/PlatformTrustStrip';
import { routeToBuyPackage } from '@/lib/buyPackageRouter';

const PRIVATE_OFFICE_CYCLE_STEPS = [
  { n: '1', t: 'اضغط رمز التوجيه', d: 'اختر «عرض:» أو «تعليمة:» أو أي من ٩ رموز — يُدرج في الشات تلقائياً' },
  { n: '2', t: 'اكتب وأرسل', d: 'أكمل النص بعد الرمز واضغط إرسال — المكتب يُأكّد الحفظ' },
  { n: '3', t: 'المناوب ينفّذ', d: 'عند تواصل الزبون، المناوب يطبّق العرض/التعليمة بسرية' },
  { n: '4', t: 'التقرير يصلك', d: 'ملخص كل محادثة يصلك في المكتب — تعرف ما جرى أثناء غيابك' },
] as const;

export default function PartnerBannersPreviewLanding() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const timer = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'حلاق ماب — معاينة الباقات والمكتب الخاص';
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      meta.remove();
    };
  }, []);

  return (
    <div className="relative text-slate-100" dir="rtl">
      <BannersPreviewAmbient />

      <div className="relative z-10 border-b border-white/10 bg-[#0b0f19]/85 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl px-4 py-5">
          <Link
            to={PARTNER_PRODUCT_HUB_CTA.marketingPath}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300/80 transition-colors hover:text-cyan-200"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" aria-hidden />
            العودة للصفحة التسويقية
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10">
                <Radar className="h-5 w-5 text-cyan-300" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold text-cyan-200/80">مسار الأعمال · مركز المعاينة</p>
                <h1 className="text-lg font-extrabold text-white md:text-xl">{PARTNER_PRODUCT_HUB_TITLE}</h1>
                <p className="mt-1 text-xs leading-relaxed text-violet-200/80">{PARTNER_PRODUCT_HUB_TAGLINE}</p>
              </div>
            </div>
            <p className="max-w-lg text-xs leading-relaxed text-slate-400">{PARTNER_PRODUCT_HUB_INTRO}</p>
          </div>

          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/[0.06] px-4 py-3 text-[12px] leading-relaxed text-amber-100/90 md:text-[13px]">
            <span className="me-2 inline-flex items-center rounded-md border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
              {PLATFORM_IDENTITY_BADGE_AR}
            </span>
            {PLATFORM_IDENTITY_BOILERPLATE_AR}
          </div>
          <div className="mt-3">
            <PlatformTrustStrip variant="strip" tone="dark" />
          </div>
        </div>
      </div>

      <PartnerProductHubSectionNav sections={PARTNER_PRODUCT_HUB_SECTIONS} />

      <div className="relative z-10 container mx-auto max-w-6xl space-y-16 px-4 py-10 md:py-14">
        <section id={PARTNER_PRODUCT_HUB_SECTION_IDS.banners} className="scroll-mt-36 space-y-16">
          {PARTNER_BANNERS_PREVIEW_TIERS.map((tier, index) => (
            <BannerPreviewTierSection key={tier.id} tier={tier} index={index} />
          ))}
        </section>

        <motion.section
          id={PARTNER_PRODUCT_HUB_SECTION_IDS.dashboard}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="scroll-mt-36 grid items-center gap-8 border-t border-white/10 pt-12 lg:grid-cols-2 lg:gap-12"
        >
          <div className="order-2 lg:order-1">
            <BarberDashboardNeonPreview />
          </div>
          <motion.div className="order-1 space-y-5 lg:order-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/25 bg-cyan-950/30 px-3 py-1 text-xs font-bold text-cyan-100">
              {PARTNER_FEATURE_PREVIEW_DASHBOARD.eyebrow}
            </span>
            <h2 className="text-xl font-extrabold leading-snug text-white md:text-2xl">
              {PARTNER_FEATURE_PREVIEW_DASHBOARD.title}
            </h2>
            <motion.div className="space-y-4 text-sm leading-8 text-slate-300">
              {PARTNER_FEATURE_PREVIEW_DASHBOARD.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          id={PARTNER_PRODUCT_HUB_SECTION_IDS.diamondCompare}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.04 }}
          className="scroll-mt-36 border-t border-white/10 pt-12"
        >
          <PartnerTierComparisonGrid columns={PARTNER_TIER_COMPARISON_COLUMNS} />
        </motion.section>

        <motion.section
          id={PARTNER_PRODUCT_HUB_SECTION_IDS.digitalShift}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="scroll-mt-36 space-y-8 border-t border-white/10 pt-12"
        >
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div className="order-1 space-y-5 lg:order-1">
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/25 bg-violet-950/30 px-3 py-1 text-xs font-bold text-violet-100">
                🌙 المناوب الذكي · وجه الزبون
              </span>
              <h2 className="text-xl font-extrabold leading-snug text-white md:text-2xl">
                {PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT.title}
              </h2>
              <motion.div className="space-y-4 text-sm leading-8 text-slate-300">
                {PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </motion.div>
            </motion.div>
            <div className="order-2 lg:order-2">
              <DigitalShiftImpactPreview />
            </div>
          </div>
          <DigitalShiftAdminTrainingPreview />
        </motion.section>

        <motion.section
          id={PARTNER_PRODUCT_HUB_SECTION_IDS.privateOffice}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="scroll-mt-36 overflow-hidden rounded-3xl border border-violet-500/25 pt-0"
          style={{
            background: 'linear-gradient(145deg,#06000f 0%,#0d0020 60%,#080010 100%)',
            boxShadow: '0 0 80px rgba(139,92,246,0.08)',
          }}
        >
          <div className="border-b border-violet-500/15 px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/12 px-3 py-1 text-xs font-black text-violet-300">
                  {PARTNER_FEATURE_PREVIEW_PRIVATE_OFFICE.eyebrow}
                </span>
                <h2 className="mt-2 text-xl font-extrabold leading-snug text-white md:text-2xl">
                  {PARTNER_FEATURE_PREVIEW_PRIVATE_OFFICE.title}
                </h2>
                <p className="mt-1 text-sm text-slate-400">محادثة داخلية حصرية — أنت والمناوب فقط، لا يراها الزبائن</p>
              </div>
              <NavLink to={PARTNER_PRODUCT_HUB_CTA.guidePath}>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-violet-400/35 bg-violet-500/15 px-5 py-2.5 text-sm font-bold text-violet-200 transition-all hover:bg-violet-500/25"
                >
                  <BookOpen className="h-4 w-4" />
                  دليل التشغيل الكامل
                </button>
              </NavLink>
            </div>
          </div>

          <div className="grid gap-8 p-7 lg:grid-cols-2">
            <PrivateOfficeSimPreview />
            <div className="flex flex-col justify-center space-y-4">
              <h3 className="text-lg font-black text-white">كيف تعمل دورة المكتب الخاص؟</h3>
              <div className="space-y-3 text-sm text-slate-400">
                {PRIVATE_OFFICE_CYCLE_STEPS.map((step) => (
                  <div key={step.n} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-black text-violet-300">
                      {step.n}
                    </div>
                    <div>
                      <p className="font-bold text-violet-200">{step.t}</p>
                      <p className="text-[0.72rem]">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-violet-500/12 px-7 pb-5">
            <p className="mb-3 text-xs font-black text-violet-400/60">ميزات المكتب الخاص الكاملة</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PARTNER_FEATURE_PREVIEW_PRIVATE_OFFICE.bullets.map((bullet) => (
                <div
                  key={bullet.label}
                  className="flex items-start gap-3 rounded-2xl border border-violet-400/12 bg-violet-950/25 px-4 py-4 transition-all hover:border-violet-400/25 hover:bg-violet-950/40"
                >
                  <span className="mt-0.5 shrink-0 text-xl">{bullet.icon}</span>
                  <div>
                    <p className="text-sm font-black text-violet-100">{bullet.label}</p>
                    <p className="mt-0.5 text-[0.72rem] leading-relaxed text-slate-400">{bullet.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id={PARTNER_PRODUCT_HUB_SECTION_IDS.nextStep}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="scroll-mt-36 rounded-3xl border border-emerald-400/25 bg-gradient-to-l from-emerald-500/10 via-cyan-500/8 to-transparent p-8 text-center md:p-10"
        >
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-emerald-300" aria-hidden />
          <h2 className="text-2xl font-black text-white">{PARTNER_PRODUCT_HUB_CTA.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">{PARTNER_PRODUCT_HUB_CTA.subtitle}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              className="bg-emerald-500 font-black text-black hover:bg-emerald-400"
              onClick={() => navigate(PARTNER_PRODUCT_HUB_CTA.registerPath)}
            >
              سجّل صالونك
            </Button>
            <Button
              variant="outline"
              className="border-violet-400/35 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20"
              onClick={() =>
                routeToBuyPackage(navigate, { tier: 'diamond', plan: 'monthly', digitalShiftAddon: true })
              }
            >
              اشترِ ماسي + المكتب
            </Button>
            <Button asChild variant="ghost" className="text-slate-300 hover:text-white">
              <NavLink to={PARTNER_PRODUCT_HUB_CTA.guidePath}>دليل المكتب الخاص</NavLink>
            </Button>
          </div>
          <p className="mt-5 text-[0.65rem] text-slate-500">
            شرح موسّع إضافي:{' '}
            <NavLink to={PARTNER_PRODUCT_HUB_CTA.deepDivePath} className="text-cyan-400/80 underline hover:text-cyan-300">
              صفحة المناوب والمكتب
            </NavLink>
          </p>
        </motion.section>
      </div>

      <BannersPageDigitalShift />
    </div>
  );
}
