/**
 * Register — صفحة التسجيل المُعاد تصميمها
 * تتبع هوية المنصة الداكنة لمسار تسجيل الشركاء
 */

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RegistrationForm } from '@/components/RegistrationForm';
import { RegistrationErrorBoundary } from '@/components/RegistrationErrorBoundary';
import { ROUTE_PATHS } from '@/lib/index';
import { Scissors, Shield, ChevronRight, BookOpenCheck } from 'lucide-react';
import { PartnerLandingFaqAccordion } from '@/components/partner/PartnerLandingFaqAccordion';
import { PartnerFormWhatsAppSupport } from '@/components/partner/PartnerFormWhatsAppSupport';
import { PARTNER_REGISTER_PAGE } from '@/lib/partnerMarketingCopy';
import { PARTNER_REGISTRATION_GUIDE } from '@/config/partnerRegistrationGuideCopy';

export default function Register() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tierParam = params.get('tier'); // 'bronze' | 'gold' | 'diamond'
  const scrollToForm = Boolean(
    (location.state as { scrollToForm?: boolean } | null)?.scrollToForm,
  );

  useEffect(() => {
    if (!scrollToForm) return;
    const id = window.requestAnimationFrame(() => {
      document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(id);
  }, [scrollToForm]);

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #020912 0%, #040d1a 50%, #020912 100%)', fontFamily: 'Tajawal, system-ui' }}
    >
      {/* ── شريط التنقل العلوي ── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#020912]/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to={ROUTE_PATHS.BARBERS_LANDING}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ChevronRight className="h-4 w-4" />
            العودة للشركاء
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/10">
              <Scissors className="h-4 w-4 text-amber-300" />
            </div>
            <span className="text-sm font-black text-white">حلاق ماب</span>
            <span className="hidden sm:inline text-[0.6rem] text-slate-500">· مسار الشركاء</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/8 px-2.5 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[0.58rem] font-bold text-emerald-300">تفعيل وفق الحالة</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-8 pt-8 md:pb-16">
        {/* ── رأس الصفحة ── */}
        <motion.header
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-3 text-3xl font-black leading-tight text-white sm:text-4xl">
            {PARTNER_REGISTER_PAGE.title}
          </h1>
          <div className="mx-auto mt-4 max-w-2xl space-y-3 text-sm leading-7 text-slate-400">
            {PARTNER_REGISTER_PAGE.introParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-slate-500">
            {`حزمة ${tierParam === 'bronze' ? 'برونزي' : tierParam === 'gold' ? 'ذهبي' : tierParam === 'diamond' ? 'ماسي' : 'مناسبة'} — رخصة نفاذ رقمية مسبقة الدفع تُفعَّل وفق الحزمة التي تختارها.`}
          </p>

          {/* مراحل الشراء */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1">
            {PARTNER_REGISTER_PAGE.steps.map((s, i, arr) => (
              <div key={s} className="flex items-center">
                <span className={`rounded-full px-2.5 py-1 text-[0.6rem] font-bold ${
                  i === 0 ? 'bg-amber-500/15 text-amber-300 border border-amber-400/30' :
                  i === 3 ? 'bg-emerald-500/12 text-emerald-300 border border-emerald-400/25' :
                  'bg-white/5 text-slate-500 border border-white/8'
                }`}>{s}</span>
                {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-slate-700 mx-0.5" />}
              </div>
            ))}
          </div>

          {/* تأكيدات */}
          <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[0.6rem] text-slate-600">
            {PARTNER_REGISTER_PAGE.assuranceChips.map((t) => (
              <span key={t}>✅ {t}</span>
            ))}
          </div>
        </motion.header>

        {/* ── رحلة الزبون (Pitch Deck · شريحة 3) ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mx-auto mb-8 max-w-4xl"
        >
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/[0.04] p-4 sm:p-5">
            <h2 className="text-center text-sm font-bold text-teal-100 sm:text-right">
              {PARTNER_REGISTER_PAGE.customerJourneyTitle}
            </h2>
            <p className="mt-1 text-center text-xs text-slate-500 sm:text-right">
              {PARTNER_REGISTER_PAGE.customerJourneyLead}
            </p>
            <ol className="mt-4 grid gap-3 sm:grid-cols-3">
              {PARTNER_REGISTER_PAGE.customerJourney.map((item) => (
                <li
                  key={item.step}
                  className="rounded-xl border border-white/8 bg-black/20 p-3 text-right"
                >
                  <span className="text-[0.65rem] font-bold text-teal-400/90">{item.step}</span>
                  <p className="mt-1 text-xs font-bold text-white">{item.title}</p>
                  <p className="mt-1 text-[0.7rem] leading-relaxed text-slate-400">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </motion.section>

        {/* ── نموذج التسجيل + شريط دعم واتساب + أيقونة تعليمات الاشتراك ── */}
        <motion.section
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.1 }}
          className="mx-auto max-w-5xl scroll-mt-24"
          id="register-form"
        >
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-sky-400/20 bg-sky-500/[0.07] px-3 py-2.5 sm:px-4">
            <div className="min-w-0 text-right">
              <p className="text-xs font-bold text-sky-200 sm:text-sm">
                {PARTNER_REGISTRATION_GUIDE.openGuideCta}
              </p>
              <p className="mt-0.5 text-[0.65rem] leading-snug text-slate-400 sm:text-xs">
                {PARTNER_REGISTRATION_GUIDE.openGuideHint}
              </p>
            </div>
            <Link
              to={ROUTE_PATHS.REGISTER_GUIDE}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-sky-400/35 bg-sky-500/20 px-3 py-2 text-[0.7rem] font-bold text-sky-100 transition hover:bg-sky-500/30 active:scale-[0.98] sm:px-3.5 sm:text-xs"
              title={PARTNER_REGISTRATION_GUIDE.openGuideCta}
              aria-label={PARTNER_REGISTRATION_GUIDE.openGuideCta}
            >
              <BookOpenCheck className="h-4 w-4 shrink-0" aria-hidden />
              الدليل
            </Link>
          </div>
          <PartnerFormWhatsAppSupport context="register" variant="dark">
            <RegistrationErrorBoundary>
              <RegistrationForm />
            </RegistrationErrorBoundary>
          </PartnerFormWhatsAppSupport>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mx-auto mt-8 max-w-3xl"
        >
          <PartnerLandingFaqAccordion
            kicker={PARTNER_REGISTER_PAGE.faq.kicker}
            lead={PARTNER_REGISTER_PAGE.faq.lead}
            items={PARTNER_REGISTER_PAGE.faq.items}
            variant="dark"
            headingClassName="text-center"
          />
        </motion.div>

        {/* ── تذييل ── */}
        <footer className="mx-auto mt-10 max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Shield className="h-3.5 w-3.5 text-slate-600" />
            <p className="text-slate-600 text-xs">
              بالتسجيل توافق على{' '}
              <Link to={ROUTE_PATHS.SUBSCRIPTION_POLICY} className="text-slate-400 underline hover:text-amber-300">
                سياسة رخصة النفاذ
              </Link>
              {' '}و{' '}
              <Link to={ROUTE_PATHS.PARTNER_PRIVACY} className="text-slate-400 underline hover:text-amber-300">
                سياسة الخصوصية
              </Link>
            </p>
          </div>
          <p className="text-xs text-slate-700">ISIC4 474151 · حلاق ماب · B2B Technology Platform</p>
        </footer>
      </div>
    </div>
  );
}
