import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Radar, Sparkles } from 'lucide-react';
import { BarberDashboardNeonPreview } from '@/components/partner/banners-preview/BarberDashboardNeonPreview';
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
import { PartnerTechnicalPartnerCompare } from '@/components/partner/PartnerTechnicalPartnerCompare';
import { routeToBuyPackage } from '@/lib/buyPackageRouter';
import { PARTNER_PRODUCT_HUB_OFFICE_ADDON_LINE } from '@/config/partnerProductHubCopy';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const PRIVATE_OFFICE_CYCLE_STEPS = [
  { n: '1', t: 'اضغط رمز التوجيه', d: 'اختر «عرض:» أو «تعليمة:» أو أي من ٩ رموز — يُدرج في الشات تلقائياً' },
  { n: '2', t: 'اكتب وأرسل', d: 'أكمل النص بعد الرمز واضغط إرسال — المكتب يُأكّد الحفظ' },
  { n: '3', t: 'المناوب ينفّذ', d: 'عند تواصل الزبون، المناوب يطبّق العرض/التعليمة بسرية' },
  { n: '4', t: 'التقرير يصلك', d: 'ملخص كل محادثة يصلك في المكتب — تعرف ما جرى أثناء غيابك' },
] as const;

export default function PartnerBannersPreviewLanding() {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [deferMobileSections, setDeferMobileSections] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 768,
  );
  const compareRef = useRef<HTMLElement | null>(null);
  const dashboardRef = useRef<HTMLElement | null>(null);
  const digitalRef = useRef<HTMLElement | null>(null);
  const officeRef = useRef<HTMLElement | null>(null);
  const nextStepRef = useRef<HTMLElement | null>(null);
  const compareInView = useInView(compareRef, { once: true, margin: '320px 0px 320px 0px' });
  const dashboardInView = useInView(dashboardRef, { once: true, margin: '320px 0px 320px 0px' });
  const digitalInView = useInView(digitalRef, { once: true, margin: '320px 0px 320px 0px' });
  const officeInView = useInView(officeRef, { once: true, margin: '320px 0px 320px 0px' });
  const nextStepInView = useInView(nextStepRef, { once: true, margin: '320px 0px 320px 0px' });

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
    return () => {
      document.title = prevTitle;
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setDeferMobileSections(true);
      return;
    }
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setDeferMobileSections(true);
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(enable, { timeout: 2200 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(enable, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [isMobile]);

  return (
    <div
      className="relative min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7fbff_34%,#f7fbf8_100%)] text-slate-900"
      dir="rtl"
    >
      <div className={cn(
        'pointer-events-none absolute inset-0',
        isMobile
          ? 'bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.05),transparent_20%),radial-gradient(circle_at_20%_18%,rgba(34,211,238,0.04),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.03),transparent_18%)]'
          : 'bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.10),transparent_24%),radial-gradient(circle_at_20%_18%,rgba(34,211,238,0.08),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.06),transparent_20%)]',
      )} />

      <div className={cn(
        'relative z-10 border-b border-slate-200/85 bg-white/82',
        isMobile ? 'backdrop-blur-0' : 'backdrop-blur-xl',
      )}>
        <div className={cn('container mx-auto max-w-6xl px-4', isMobile ? 'py-6' : 'py-8 md:py-10')}>
          <Link
            to={PARTNER_PRODUCT_HUB_CTA.marketingPath}
            className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/92 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:border-cyan-200 hover:text-cyan-800"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" aria-hidden />
            العودة للصفحة التسويقية
          </Link>

          <div className={cn('flex flex-wrap items-start justify-between gap-6', isMobile && 'gap-4')}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 shadow-[0_10px_24px_rgba(34,211,238,0.10)]">
                <Radar className="h-5 w-5 text-cyan-700" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold text-cyan-700">مسار الأعمال · مركز المعاينة</p>
                <h1 className="text-2xl font-extrabold text-slate-950 md:text-3xl">{PARTNER_PRODUCT_HUB_TITLE}</h1>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">{PARTNER_PRODUCT_HUB_TAGLINE}</p>
              </div>
            </div>
            <div className={cn(
              'max-w-xl rounded-[1.4rem] border border-slate-200 bg-white/92 p-4 shadow-[0_16px_38px_rgba(148,163,184,0.10)]',
              isMobile && 'max-w-none',
            )}>
              <p className="text-sm leading-7 text-slate-600">{PARTNER_PRODUCT_HUB_INTRO}</p>
            </div>
          </div>

          {isMobile ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/92 p-4 shadow-[0_12px_30px_rgba(148,163,184,0.10)]">
                <p className="text-[0.92rem] leading-7 text-slate-600">
                  صفحة عملية لمعاينة الباقات والمكتب الخاص بدون إغراقك في التفاصيل من أول لحظة. ابدأ بالقرار ثم انزل للمعاينات عند الحاجة.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-emerald-500 font-black text-black shadow-[0_10px_22px_rgba(16,185,129,0.14)] hover:bg-emerald-400"
                  onClick={() => navigate(PARTNER_PRODUCT_HUB_CTA.registerPath)}
                >
                  سجّل صالونك
                </Button>
                <Button
                  variant="outline"
                  className="border-violet-200 bg-white text-violet-800 hover:bg-violet-50"
                  onClick={() => document.getElementById(PARTNER_PRODUCT_HUB_SECTION_IDS.banners)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                >
                  ابدأ بالمعاينة
                </Button>
                <Button
                  variant="ghost"
                  className="text-slate-600 hover:text-slate-950"
                  onClick={() => document.getElementById(PARTNER_PRODUCT_HUB_SECTION_IDS.nextStep)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                >
                  الخطوة التالية
                </Button>
              </div>
              {deferMobileSections ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-[0.84rem] leading-6 text-emerald-900">
                  {PARTNER_PRODUCT_HUB_OFFICE_ADDON_LINE}
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <div className="mt-6 rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,rgba(255,249,239,0.95),rgba(255,255,255,0.95))] px-5 py-4 text-[12px] leading-relaxed text-slate-700 shadow-[0_14px_30px_rgba(245,158,11,0.08)] md:text-[13px]">
                <span className="me-2 inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  {PLATFORM_IDENTITY_BADGE_AR}
                </span>
                {PLATFORM_IDENTITY_BOILERPLATE_AR}
              </div>
              <div className="mt-4">
                <PlatformTrustStrip variant="strip" tone="light" />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-600">{PARTNER_PRODUCT_HUB_OFFICE_ADDON_LINE}</p>
              <div className="mt-6">
                <PartnerTechnicalPartnerCompare variant="compact" />
              </div>
            </>
          )}
        </div>
      </div>

      {(!isMobile || deferMobileSections) ? <PartnerProductHubSectionNav sections={PARTNER_PRODUCT_HUB_SECTIONS} /> : null}

      <div className="relative z-10 container mx-auto max-w-6xl space-y-14 px-4 py-8 md:space-y-20 md:py-14">
        <section id={PARTNER_PRODUCT_HUB_SECTION_IDS.banners} className="scroll-mt-36 space-y-16">
          {PARTNER_BANNERS_PREVIEW_TIERS.map((tier, index) => (
            <BannerPreviewTierSection key={tier.id} tier={tier} index={index} />
          ))}
        </section>

        <motion.section
          ref={dashboardRef}
          id={PARTNER_PRODUCT_HUB_SECTION_IDS.dashboard}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="scroll-mt-36 grid items-center gap-8 rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_48px_rgba(148,163,184,0.10)] lg:grid-cols-2 lg:gap-12 lg:p-8"
        >
          <div className="order-2 lg:order-1">
            {(!isMobile || deferMobileSections) && dashboardInView ? <BarberDashboardNeonPreview /> : <div className="min-h-[22rem] rounded-2xl border border-slate-200 bg-white/70" />}
          </div>
          <motion.div className="order-1 space-y-5 lg:order-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800">
              {PARTNER_FEATURE_PREVIEW_DASHBOARD.eyebrow}
            </span>
            <h2 className="text-xl font-extrabold leading-snug text-slate-950 md:text-2xl">
              {PARTNER_FEATURE_PREVIEW_DASHBOARD.title}
            </h2>
            <motion.div className="space-y-4 text-sm leading-8 text-slate-600">
              {PARTNER_FEATURE_PREVIEW_DASHBOARD.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          ref={compareRef}
          id={PARTNER_PRODUCT_HUB_SECTION_IDS.diamondCompare}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.04 }}
          className="scroll-mt-36 rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_48px_rgba(148,163,184,0.10)] lg:p-8"
        >
          {(!isMobile || deferMobileSections) && compareInView ? (
            <PartnerTierComparisonGrid columns={PARTNER_TIER_COMPARISON_COLUMNS} />
          ) : (
            <div className="min-h-[18rem] rounded-2xl border border-slate-200 bg-white/70" />
          )}
        </motion.section>

        <motion.section
          ref={digitalRef}
          id={PARTNER_PRODUCT_HUB_SECTION_IDS.digitalShift}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="scroll-mt-36 space-y-8 rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_48px_rgba(148,163,184,0.10)] lg:p-8"
        >
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div className="order-1 space-y-5 lg:order-1">
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800">
                🌙 المناوب الذكي · وجه الزبون
              </span>
              <h2 className="text-xl font-extrabold leading-snug text-slate-950 md:text-2xl">
                {PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT.title}
              </h2>
              <motion.div className="space-y-4 text-sm leading-8 text-slate-600">
                {PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </motion.div>
            </motion.div>
            <div className="order-2 lg:order-2">
              {(!isMobile || deferMobileSections) && digitalInView ? <DigitalShiftImpactPreview /> : <div className="min-h-[20rem] rounded-2xl border border-slate-200 bg-white/70" />}
            </div>
          </div>
          {(!isMobile || deferMobileSections) && digitalInView ? <DigitalShiftAdminTrainingPreview /> : null}
        </motion.section>

        <motion.section
          ref={officeRef}
          id={PARTNER_PRODUCT_HUB_SECTION_IDS.privateOffice}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="scroll-mt-36 overflow-hidden rounded-3xl border border-violet-200 bg-[linear-gradient(145deg,rgba(251,245,255,0.96),rgba(255,255,255,0.96))] pt-0 shadow-[0_22px_52px_rgba(148,163,184,0.12)]"
        >
          <div className="border-b border-violet-100 px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-black text-violet-800">
                  {PARTNER_FEATURE_PREVIEW_PRIVATE_OFFICE.eyebrow}
                </span>
                <h2 className="mt-2 text-xl font-extrabold leading-snug text-slate-950 md:text-2xl">
                  {PARTNER_FEATURE_PREVIEW_PRIVATE_OFFICE.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">محادثة داخلية حصرية — أنت والمناوب فقط، لا يراها الزبائن</p>
              </div>
              <NavLink to={PARTNER_PRODUCT_HUB_CTA.guidePath}>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-5 py-2.5 text-sm font-bold text-violet-800 shadow-sm transition-all hover:bg-violet-50"
                >
                  <BookOpen className="h-4 w-4" />
                  دليل التشغيل الكامل
                </button>
              </NavLink>
            </div>
          </div>

          <div className="grid gap-8 p-7 lg:grid-cols-2">
            {(!isMobile || deferMobileSections) && officeInView ? <PrivateOfficeSimPreview /> : <div className="min-h-[24rem] rounded-2xl border border-violet-100 bg-white/75" />}
            <div className="flex flex-col justify-center space-y-4">
              <h3 className="text-lg font-black text-slate-950">كيف تعمل دورة المكتب الخاص؟</h3>
              <div className="space-y-3 text-sm text-slate-600">
                {PRIVATE_OFFICE_CYCLE_STEPS.map((step) => (
                  <div key={step.n} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-xs font-black text-violet-700">
                      {step.n}
                    </div>
                    <div>
                      <p className="font-bold text-violet-900">{step.t}</p>
                      <p className="text-[0.72rem]">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-violet-100 px-7 pb-5">
            <p className="mb-3 text-xs font-black text-violet-700/70">ميزات المكتب الخاص الكاملة</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PARTNER_FEATURE_PREVIEW_PRIVATE_OFFICE.bullets.map((bullet) => (
                <div
                  key={bullet.label}
                  className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-white/92 px-4 py-4 shadow-sm transition-all hover:border-violet-200 hover:bg-violet-50/50"
                >
                  <span className="mt-0.5 shrink-0 text-xl">{bullet.icon}</span>
                  <div>
                    <p className="text-sm font-black text-violet-900">{bullet.label}</p>
                    <p className="mt-0.5 text-[0.72rem] leading-relaxed text-slate-600">{bullet.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          ref={nextStepRef}
          id={PARTNER_PRODUCT_HUB_SECTION_IDS.nextStep}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="scroll-mt-36 rounded-3xl border border-emerald-200 bg-[linear-gradient(135deg,rgba(243,252,248,0.98),rgba(255,255,255,0.96))] p-8 text-center shadow-[0_22px_52px_rgba(148,163,184,0.10)] md:p-10"
        >
          {(!isMobile || deferMobileSections) && nextStepInView ? <Sparkles className="mx-auto mb-3 h-8 w-8 text-emerald-600" aria-hidden /> : null}
          <h2 className="text-2xl font-black text-slate-950">{PARTNER_PRODUCT_HUB_CTA.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">{PARTNER_PRODUCT_HUB_CTA.subtitle}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              className="bg-emerald-500 font-black text-black shadow-[0_10px_22px_rgba(16,185,129,0.14)] hover:bg-emerald-400"
              onClick={() => navigate(PARTNER_PRODUCT_HUB_CTA.registerPath)}
            >
              سجّل صالونك
            </Button>
            <Button
              variant="outline"
              className="border-violet-200 bg-white text-violet-800 hover:bg-violet-50"
              onClick={() =>
                routeToBuyPackage(navigate, { tier: 'diamond', plan: 'monthly', digitalShiftAddon: true })
              }
            >
              اشترِ ماسي + المكتب
            </Button>
            <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-950">
              <NavLink to={PARTNER_PRODUCT_HUB_CTA.guidePath}>دليل المكتب الخاص</NavLink>
            </Button>
          </div>
          <p className="mt-5 text-[0.65rem] text-slate-500">
            شرح موسّع إضافي:{' '}
            <NavLink to={PARTNER_PRODUCT_HUB_CTA.deepDivePath} className="text-cyan-700 underline hover:text-cyan-800">
              صفحة المناوب والمكتب
            </NavLink>
          </p>
        </motion.section>
      </div>
    </div>
  );
}
