import { useEffect } from 'react';
import { BannersPageDigitalShift } from '@/components/BannersPageDigitalShift';
import { motion, useReducedMotion } from 'framer-motion';
import { NavLink as NavLinkDom } from 'react-router-dom';
import { Radar } from 'lucide-react';
import {
  PARTNER_BANNERS_PREVIEW_TIERS,
} from '@/config/partnerBannersPreviewCopy';
import { BarberDashboardNeonPreview } from '@/components/partner/banners-preview/BarberDashboardNeonPreview';
import { BannersPreviewAmbient } from '@/components/partner/banners-preview/BannersPreviewAmbient';
import { DigitalShiftImpactPreview } from '@/components/partner/banners-preview/DigitalShiftImpactPreview';
import { DigitalShiftAdminTrainingPreview } from '@/components/partner/banners-preview/DigitalShiftAdminTrainingPreview';
import { PrivateOfficeSimPreview } from '@/components/partner/banners-preview/PrivateOfficeSimPreview';
import { BannerPreviewTierSection } from '@/components/partner/banners-preview/BannerPreviewTierSection';
import {
  PARTNER_FEATURE_PREVIEW_DASHBOARD,
  PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT,
  PARTNER_FEATURE_PREVIEW_PRIVATE_OFFICE,
} from '@/config/partnerFeaturePreviewsCopy';
import { NavLink as NavLinkDom } from 'react-router-dom';
import {
  PLATFORM_IDENTITY_BADGE_AR,
  PLATFORM_IDENTITY_BOILERPLATE_AR,
} from '@/config/platformIdentity';

export default function PartnerBannersPreviewLanding() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'حلاق ماب — نماذج التسويق (بنرات وميزات)';
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
    <div className="relative min-h-screen text-slate-100" dir="rtl">
      <BannersPreviewAmbient />

      <header className="relative z-10 border-b border-white/10 bg-[#0b0f19]/85 backdrop-blur-md">
        <div className="container mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10">
              <Radar className="h-5 w-5 text-cyan-300" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold text-cyan-200/80">مسار الأعمال · شفافية بصرية</p>
              <h1 className="text-lg font-extrabold text-white md:text-xl">معاينة البنرات وإضافة المكتب الخاص 🏛️</h1>
            </div>
          </div>
          <p className="max-w-lg text-xs leading-relaxed text-slate-400">
            محاكاة تلقائية لرحلة المستخدم النهائي على <strong className="text-cyan-200/90">واجهة الرادار</strong>{' '}
            ضمن <strong className="text-cyan-200/90">نظام الرصد الذكي</strong> — معرض صور، تواصل، وفتح الموقع.
          </p>
        </div>
        <div className="container mx-auto max-w-6xl px-4 pb-4">
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/[0.06] px-4 py-3 text-[12px] leading-relaxed text-amber-100/90 md:text-[13px]">
            <span className="me-2 inline-flex items-center rounded-md border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
              {PLATFORM_IDENTITY_BADGE_AR}
            </span>
            {PLATFORM_IDENTITY_BOILERPLATE_AR}
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-6xl space-y-16 px-4 py-10 md:py-14">
        {PARTNER_BANNERS_PREVIEW_TIERS.map((tier, index) => (
          <BannerPreviewTierSection key={tier.id} tier={tier} index={index} />
        ))}

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="grid items-center gap-8 border-t border-white/10 pt-12 lg:grid-cols-2 lg:gap-12"
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
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="space-y-8 border-t border-white/10 pt-12"
        >
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div className="order-1 space-y-5 lg:order-1">
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/25 bg-violet-950/30 px-3 py-1 text-xs font-bold text-violet-100">
                {PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT.eyebrow}
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

        {/* ══ المكتب الخاص — ميزة Diamond الجديدة ══ */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="overflow-hidden rounded-3xl border border-violet-500/25 pt-0"
          style={{ background: 'linear-gradient(145deg,#06000f 0%,#0d0020 60%,#080010 100%)', boxShadow: '0 0 80px rgba(139,92,246,0.08)' }}
        >
          {/* رأس القسم */}
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
              <NavLinkDom to="/partners/digital-shift">
                <button type="button"
                  className="flex items-center gap-2 rounded-xl border border-violet-400/35 bg-violet-500/15 px-5 py-2.5 text-sm font-bold text-violet-200 hover:bg-violet-500/25 transition-all">
                  شرح مفصّل للميزة ←
                </button>
              </NavLinkDom>
            </div>
          </div>
          {/* المحاكاة التفاعلية */}
          <div className="grid gap-8 p-7 lg:grid-cols-2">
            <PrivateOfficeSimPreview />
            <div className="flex flex-col justify-center space-y-4">
              <h3 className="text-lg font-black text-white">كيف تعمل دورة المكتب الخاص؟</h3>
              <div className="space-y-3 text-sm text-slate-400">
                {[
                  { n:'1', t:'اضغط رمز التوجيه', d:'اختر «عرض:» أو «تعليمة:» أو أي من ٩ رموز — يُدرج في الشات تلقائياً' },
                  { n:'2', t:'اكتب وأرسل', d:'أكمل النص بعد الرمز واضغط إرسال — المكتب يُأكّد الحفظ' },
                  { n:'3', t:'المناوب ينفّذ', d:'عند تواصل الزبون، المناوب يطبّق العرض/التعليمة بسرية' },
                  { n:'4', t:'التقرير يصلك', d:'ملخص كل محادثة يصلك في المكتب — تعرف ما جرى أثناء غيابك' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-black text-violet-300">{s.n}</div>
                    <div>
                      <p className="font-bold text-violet-200">{s.t}</p>
                      <p className="text-[0.72rem]">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-violet-500/12 px-7 pb-5">
            <p className="mb-3 text-xs font-black text-violet-400/60">ميزات المكتب الخاص الكاملة</p>
          {/* شبكة الميزات */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PARTNER_FEATURE_PREVIEW_PRIVATE_OFFICE.bullets.map(b => (
              <div key={b.label}
                className="flex items-start gap-3 rounded-2xl border border-violet-400/12 bg-violet-950/25 px-4 py-4 transition-all hover:border-violet-400/25 hover:bg-violet-950/40">
                <span className="mt-0.5 text-xl shrink-0">{b.icon}</span>
                <div>
                  <p className="text-sm font-black text-violet-100">{b.label}</p>
                  <p className="mt-0.5 text-[0.72rem] leading-relaxed text-slate-400">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>{/* إغلاق شبكة الميزات */}
          </div>{/* إغلاق div التقسيم px-7 */}

          {/* فوتر */}
          <div className="border-t border-violet-500/12 px-8 py-4 text-center">
            <p className="text-[0.65rem] text-violet-400/40">
              متوفر حصراً مع إضافة المكتب الخاص 🏛️ (+25 ر.س/حزمة) على الباقة الماسية
            </p>
          </div>
        </motion.section>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-4 py-6 text-center text-[11px] text-slate-500">
        معاينة البنرات وإضافة المكتب الخاص 🏛️ · مسار الخدمات التسويقية لحلاق ماب
        <span className="mx-3 text-slate-700">·</span>
        <NavLinkDom to="/partners/private-office-guide" className="text-violet-400/60 hover:text-violet-300 underline transition-colors">
          دليل المكتب الخاص ←
        </NavLinkDom>
      </footer>

      {/* ── المناوب الرقمي الذكي — زر عائم لاستقبال الزوار ── */}
      <BannersPageDigitalShift />
    </div>
  );
}
