/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * صفحة مسار الخدمات التسويقية للشركاء — حلاق ماب
 * المسار: /preview-partners
 *
 * مسار مُخصَّص للحلاقين والصالونات فقط.
 * يعزل تجربة الانضمام عن تجربة المستخدم العادي تماماً.
 * يعتمد نفس نظام التصميم الداكن لصفحة /preview مع محتوى موجَّه للشريك.
 */

import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Scissors, Star, CheckCircle2, Clock, ArrowLeft,
  Sparkles, ChevronDown, Globe2, Users, BarChart3,
  Crown, Zap, Navigation2,
  TrendingUp, QrCode, ImageIcon, Brain, FileCheck,
  ArrowRight, Menu, BriefcaseBusiness, Smartphone, Megaphone,
} from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { PUBLIC_PULSE_EXPERIENCE_ENABLED } from '@/config/publicPulseExperience';
import { PULSE_MAP_LINK_LABEL_AR } from '@/config/pulseMapConfig';
import { KSACityClocksBar } from '@/components/KSACityClocksBar';
import { FloatingPlatformActions } from '@/components/FloatingPlatformActions';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  TIER_MONTHLY_SAR,
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  DIAMOND_PRODUCT_STANDARD_LABEL_AR,
} from '@/config/subscriptionPricing';
import { SubscriptionTier } from '@/lib/index';
import { BannerPreviewTierSection } from '@/components/partner/banners-preview/BannerPreviewTierSection';
import { EndUserBarberBannerSim } from '@/components/partner/banners-preview/EndUserBarberBannerSim';
import { BannerRadiationField, bannerRadiationTierFromId, type BannerRadiationTier } from '@/components/BannerRadiationField';
import { PARTNER_BANNERS_PREVIEW_TIERS } from '@/config/partnerBannersPreviewCopy';
import {
  PARTNER_PRODUCT_HUB_OFFICE_ADDON_LINE,
  PARTNER_PRODUCT_HUB_SUMMARY_CARDS,
} from '@/config/partnerProductHubCopy';
import { PARTNER_TECHNICAL_PARTNER_LABEL_AR } from '@/config/partnerTechnicalPartnerDoctrine';
import { PLATFORM_B2B_TECHNICAL_PARTNER_ROLE_AR } from '@/config/platformIdentity';
import {
  PARTNER_FINAL_CTA_BODY_AR,
  PARTNER_HERO_CLOSING_TAGLINE_AR,
  PARTNER_LANDING_FAQ_AR,
  PARTNER_SECTION_INTROS,
  PARTNER_SOCIAL_VS_PLATFORM_ROWS_AR,
} from '@/config/partnerFieldSalesCopy';
import {
  PARTNER_JOIN_PATH_BADGE_AR,
  PARTNER_JOIN_PATH_HERO_HEADLINE_AR,
  PARTNER_JOIN_PATH_HERO_LEAD_AR,
  PARTNER_JOIN_PATH_HERO_TITLE_AR,
  PARTNER_JOIN_PATH_HOW_IT_WORKS,
  PARTNER_JOIN_PATH_PAY_GATE,
  PARTNER_JOIN_PATH_APP_HINT_AR,
  PARTNER_JOIN_PATH_PRIMARY_CTA_AR,
  PARTNER_JOIN_PATH_SECONDARY_LINKS,
  PARTNER_JOIN_PATH_STEPS,
  PARTNER_JOIN_PATH_TRUST_LINE_AR,
  PARTNER_SISTER_SURFACE_LINE_AR,
  PARTNER_JOIN_PATH_WHY_NOW,
} from '@/config/partnerJoinPathCopy';
import { PARTNER_WHY_ACTIVATE_SALES_UX_GATEWAY } from '@/config/partnerWhyActivateSalesCopy';
import { RegisterSalonGlowIcon } from '@/components/partner/RegisterSalonGlowIcon';
import { LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR, PARTNER_SUPPORT_WHATSAPP_URL } from '@/config/partnerLegal';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SiWhatsapp } from 'react-icons/si';
import { EcommerceVerifiedFooterBadge } from '@/components/EcommerceVerifiedFooterBadge';
import { HalaqmapBrandMark } from '@/components/HalaqmapBrandMark';
import { PartnerTechnicalPartnerCompare } from '@/components/partner/PartnerTechnicalPartnerCompare';
import { PartnerFreedomPillars } from '@/components/partner/PartnerFreedomPillars';
import { PartnerMallNarrativeSection } from '@/components/partner/PartnerMallNarrativeSection';
import { PartnerB2BVisualFeatureCards } from '@/components/partner/PartnerB2BVisualFeatureCards';
import { PartnerB2BUrgencyBand } from '@/components/partner/PartnerB2BUrgencyBand';
import { PartnerOwnerWatchSpotlight } from '@/components/partner/PartnerOwnerWatchSpotlight';
import { PartnerOrderReceptionTicker } from '@/components/partner/PartnerOrderReceptionTicker';
import { PartnerPlatformInspectionTicker } from '@/components/partner/PartnerPlatformInspectionTicker';
import { PartnerPlatformLaunchTicker } from '@/components/partner/PartnerPlatformLaunchTicker';
import { MobilePartnerActionDock } from '@/components/partner/MobilePartnerActionDock';
import { PartnerSharedTrialOfferBanner } from '@/components/partner/PartnerSharedTrialOfferBanner';
import {
  OWNER_WATCH_LISTING_DIAMOND_HIGHLIGHT_AR,
  OWNER_WATCH_LISTING_GOLD_HIGHLIGHT_AR,
} from '@/config/ownerWatchFeatureCopy';
import { PARTNER_FREEDOM_FEATURES_LEAD_AR } from '@/config/partnerFreedomNarrativeCopy';
import { routeToBuyPackage } from '@/lib/buyPackageRouter';
import { PlatformAmbientToggle } from '@/components/PlatformAmbientToggle';
import { PlatformTrustStrip } from '@/components/PlatformTrustStrip';
import { usePlatformAmbient } from '@/context/PlatformAmbientContext';
import { SOFTWARE_SERVICES_PORTAL_HEADING } from '@/config/partnerPortal';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';
import { MOBILE_PARTNER_ACTION_DOCK_CLEARANCE } from '@/lib/mobilePageShell';

// ─── Helpers ────────────────────────────────────────────────────────────────

let landingPreviewPreloadPromise: Promise<unknown> | null = null;
let registerPreloadPromise: Promise<unknown> | null = null;

function preloadLandingPreviewRoute(): Promise<unknown> {
  if (!landingPreviewPreloadPromise) {
    landingPreviewPreloadPromise = import('@/pages/LandingPreview');
  }
  return landingPreviewPreloadPromise;
}

function preloadRegisterRoute(): Promise<unknown> {
  if (!registerPreloadPromise) {
    registerPreloadPromise = import('@/pages/Register');
  }
  return registerPreloadPromise;
}

const FounderDeskBannerLazy = lazy(() =>
  import('@/components/partner/FounderDeskBanner').then((m) => ({ default: m.FounderDeskBanner })),
);

function FoundersOfferBanner({ onRegister }: { onRegister: () => void }) {
  void onRegister;
  return null;
}

function FeatureCard({ icon: Icon, title, desc, color, delay = 0, badge }: {
  icon: typeof Scissors; title: string; desc: string;
  color: string; delay?: number; badge?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_16px_40px_rgba(2,9,18,0.35)] transition-all hover:border-cyan-400/30 hover:shadow-[0_18px_42px_rgba(20,184,166,0.12)]"
      dir="rtl"
    >
      {badge && (
        <div className="absolute left-3 top-3 rounded-full border border-amber-300/30 bg-amber-500/10 px-2 py-0.5 text-[0.55rem] font-bold text-amber-200">
          {badge}
        </div>
      )}
      <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="mb-1.5 text-base font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-300">{desc}</p>
      <div className={`absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-15`} />
    </motion.div>
  );
}

// ─── Pricing card ────────────────────────────────────────────────────────────
function PricingCard({
  tier, price, name, badge, features, accent,
  ringColor, recommended = false, delay = 0, addOnAvailable = false, tierQuery,
  radiationTier,
}: {
  tier: string; price: number; name: string; badge: string;
  features: string[]; accent: string; ringColor: string;
  recommended?: boolean; delay?: number; addOnAvailable?: boolean; tierQuery?: string;
  radiationTier: BannerRadiationTier;
}) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="relative"
    >
      <BannerRadiationField tier={radiationTier}>
      <div
      className={`banner-major-card-face relative flex flex-col rounded-2xl border bg-gradient-to-b from-white via-slate-50 to-[#f8fbff] p-6 shadow-[0_18px_46px_rgba(148,163,184,0.12)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(148,163,184,0.16)]
        ${recommended ? 'border-amber-300/80' : 'border-slate-200/90'}`}
      dir="rtl"
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-4 py-0.5 text-[0.65rem] font-bold text-black shadow">
          الأكثر طلباً
        </div>
      )}
      <div className="banner-major-card-copy">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">{badge}</span>
        <div>
          <div className="text-lg font-black text-slate-900">{name}</div>
          <div className="text-[0.62rem] text-slate-500">{tier} License · ISIC4 474151</div>
        </div>
      </div>
      <div className="mb-2 flex items-end gap-1">
        <span className="text-4xl font-black tabular-nums text-slate-900">{price}</span>
        <span className="mb-1 text-xs text-slate-500">ر.س / حزمة ٣٠ يوم</span>
      </div>
      {addOnAvailable && (
        <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50/80 px-3 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[0.6rem] font-black uppercase tracking-wider text-violet-700">🏛️ إضافة المكتب الخاص</span>
            <span className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[0.55rem] font-black text-violet-800">+{DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س/حزمة</span>
          </div>
          <p className="mb-1.5 text-[0.72rem] font-bold text-slate-900">مساعد داخلي + مناوب شات — مترابطان</p>
          <div className="space-y-1">
            {[
              '📋 أعطِ تعليماتك بـ«تعليمة:» — المناوب ينفّذها مع كل زبون',
              '🌙 المناوب يرد بذكاء بـ7 لغات عند الإغلاق أو الانشغال',
              '📡 تقارير كل محادثة تصلك تلقائياً في المكتب',
              '💳 رصيد حزمتك + رابط التجديد في ثانية',
            ].map(f => (
              <div key={f} className="flex items-center gap-1.5 text-[0.65rem] text-slate-600">
                {f}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={() => navigate(ROUTE_PATHS.PRIVATE_OFFICE_GUIDE)}
              className="text-[0.6rem] text-violet-700 underline transition-colors hover:text-violet-900">
              دليل الاستخدام ←
            </button>
            <span className="text-slate-300">·</span>
            <button onClick={() => navigate(ROUTE_PATHS.DIGITAL_SHIFT_FEATURE)}
              className="text-[0.6rem] text-violet-700 underline transition-colors hover:text-violet-900">
              شرح تقني ←
            </button>
          </div>
        </div>
      )}
      <ul className="mb-6 flex flex-col gap-2" dir="rtl">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[0.78rem] text-slate-700">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => routeToBuyPackage(navigate, {
          tier: (tierQuery as 'bronze' | 'gold' | 'diamond') ?? 'gold',
          plan: 'monthly',
        })}
        className={`mt-auto w-full rounded-xl py-3 text-sm font-bold transition-all
          ${recommended
            ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:from-amber-300'
            : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
          }`}
      >
        ابدأ بهذه الباقة →
      </button>
      </div>
      </div>
      </BannerRadiationField>
    </motion.div>
  );
}

// ─── أيقونات الباقات — تصميم حصري ────────────────────────────────────────────
// برونزي: موجات إشارة تتمدد من نقطة مركزية (الحضور الرقمي)
// ذهبي: سلّم صاعد من كتل (الصعود في النتائج)
// ماسي: بلورة مقطوعة ثمانية الأضلاع (جودة استثنائية)
// ماسي+مكتب: مركز قيادة بمدارات متصلة (نظام ذكي مترابط)
function TierIcon({ tier }: { tier: 'bronze' | 'gold' | 'diamond' | 'office' }) {
  if (tier === 'bronze') return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* نقطة مركزية */}
      <circle cx="24" cy="30" r="3" fill="#b45309"/>
      {/* موجة 1 */}
      <path d="M16 30 Q16 22 24 22 Q32 22 32 30" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" strokeOpacity=".9"/>
      {/* موجة 2 */}
      <path d="M10 30 Q10 15 24 15 Q38 15 38 30" stroke="#b45309" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeOpacity=".55"/>
      {/* موجة 3 */}
      <path d="M5 30 Q5 8 24 8 Q43 8 43 30" stroke="#b45309" strokeWidth="1" fill="none" strokeLinecap="round" strokeOpacity=".25"/>
      {/* خط الأرضية */}
      <line x1="18" y1="34" x2="30" y2="34" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeOpacity=".4"/>
    </svg>
  );
  if (tier === 'gold') return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* كتلة 1 — أعلى */}
      <rect x="19" y="6" width="10" height="7" rx="2" fill="#f59e0b" fillOpacity=".9"/>
      {/* كتلة 2 */}
      <rect x="14" y="16" width="20" height="7" rx="2" fill="#f59e0b" fillOpacity=".6"/>
      {/* كتلة 3 */}
      <rect x="9" y="26" width="30" height="7" rx="2" fill="#f59e0b" fillOpacity=".35"/>
      {/* سهم صاعد */}
      <path d="M24 4 L28 9 L24 7 L20 9 Z" fill="#f59e0b"/>
      {/* قاعدة */}
      <rect x="6" y="36" width="36" height="2.5" rx="1.2" fill="#f59e0b" fillOpacity=".2"/>
    </svg>
  );
  if (tier === 'diamond') return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* مثمن الأضلاع (بلورة مقطوعة) */}
      <polygon points="24,5 34,9 41,19 41,29 34,39 24,43 14,39 7,29 7,19 14,9" 
        fill="#164e63" fillOpacity=".5" stroke="#22d3ee" strokeWidth="1.5"/>
      {/* أضلاع داخلية (وجوه البلورة) */}
      <polygon points="24,11 31,14 35,21 35,27 31,34 24,37 17,34 13,27 13,21 17,14"
        fill="none" stroke="#22d3ee" strokeWidth=".8" strokeOpacity=".4"/>
      {/* خطوط المحاور */}
      <line x1="24" y1="5" x2="24" y2="43" stroke="#22d3ee" strokeWidth=".6" strokeOpacity=".25"/>
      <line x1="7" y1="24" x2="41" y2="24" stroke="#22d3ee" strokeWidth=".6" strokeOpacity=".25"/>
      {/* مركز */}
      <circle cx="24" cy="24" r="3.5" fill="#22d3ee" fillOpacity=".5"/>
    </svg>
  );
  // office — مركز قيادة ذكي بمدارات
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      {/* مدار خارجي */}
      <ellipse cx="24" cy="24" rx="18" ry="8" stroke="#a78bfa" strokeWidth="1" fill="none" strokeOpacity=".3"
        transform="rotate(-30 24 24)"/>
      {/* مدار داخلي */}
      <ellipse cx="24" cy="24" rx="12" ry="5" stroke="#a78bfa" strokeWidth="1.2" fill="none" strokeOpacity=".55"
        transform="rotate(40 24 24)"/>
      {/* النواة */}
      <circle cx="24" cy="24" r="5" fill="#2e1065" stroke="#a78bfa" strokeWidth="1.5"/>
      <circle cx="24" cy="24" r="2.5" fill="#a78bfa" fillOpacity=".8"/>
      {/* أقمار صناعية */}
      <circle cx="38" cy="16" r="2.5" fill="#a78bfa" fillOpacity=".6"/>
      <circle cx="10" cy="34" r="2" fill="#a78bfa" fillOpacity=".45"/>
      <circle cx="36" cy="35" r="1.5" fill="#a78bfa" fillOpacity=".4"/>
      {/* روابط */}
      <line x1="29" y1="21" x2="36" y2="17" stroke="#a78bfa" strokeWidth=".8" strokeOpacity=".4"/>
      <line x1="19" y1="27" x2="11" y2="33" stroke="#a78bfa" strokeWidth=".8" strokeOpacity=".35"/>
    </svg>
  );
}

function AnnualPackagesSection({ navigate }: { navigate: (to: string) => void }) {
  void navigate;
  return null;
}

type CertificateMockTier = 'bronze' | 'gold' | 'diamond';

const CERTIFICATE_MOCK_DATA: Record<
  CertificateMockTier,
  {
    accentBorder: string;
    accentGlow: string;
    badgeTone: string;
    statusTone: string;
    footerTone: string;
    statusLabel: string;
    salonName: string;
    activationCode: string;
    responseModel: string;
    issuedAt: string;
    validUntil: string;
  }
> = {
  bronze: {
    accentBorder: 'border-teal-300/50',
    accentGlow: 'shadow-teal-500/25',
    badgeTone: 'border border-emerald-300/45 bg-emerald-500/20 text-emerald-50',
    statusTone: 'text-teal-50',
    footerTone: 'border-teal-200/30 bg-teal-500/14',
    statusLabel: 'نشطة',
    salonName: 'صالون نموذجي — البرونزي',
    activationCode: 'HM-LIC-BRZ-2026-001',
    responseModel: 'ظهور عند الطلب',
    issuedAt: 'يونيو 2026',
    validUntil: '30 يوم من تاريخ التفعيل',
  },
  gold: {
    accentBorder: 'border-teal-200/55',
    accentGlow: 'shadow-teal-400/28',
    badgeTone: 'border border-emerald-300/45 bg-emerald-500/20 text-emerald-50',
    statusTone: 'text-teal-50',
    footerTone: 'border-teal-200/35 bg-teal-500/16',
    statusLabel: 'نشطة',
    salonName: 'صالون نموذجي — الذهبي',
    activationCode: 'HM-LIC-GLD-2026-002',
    responseModel: 'أولوية ظهور عند الطلب',
    issuedAt: 'يونيو 2026',
    validUntil: '30 يوم من تاريخ التفعيل',
  },
  diamond: {
    accentBorder: 'border-cyan-300/60',
    accentGlow: 'shadow-cyan-400/28',
    badgeTone: 'border border-cyan-200/50 bg-cyan-500/18 text-white',
    statusTone: 'text-cyan-50',
    footerTone: 'border-cyan-200/30 bg-cyan-500/14',
    statusLabel: 'نشطة',
    salonName: 'صالون نموذجي — الماسي',
    activationCode: 'HM-LIC-DMD-2026-003',
    responseModel: 'ظهور مميز + مكتب خاص اختياري',
    issuedAt: 'يونيو 2026',
    validUntil: '30 يوم من تاريخ التفعيل',
  },
};

function CertificateMockup({ tier }: { tier: CertificateMockTier }) {
  const tierConfig = PARTNER_BANNERS_PREVIEW_TIERS.find((item) => item.id === tier) ?? PARTNER_BANNERS_PREVIEW_TIERS[1]!;
  const mock = CERTIFICATE_MOCK_DATA[tier];

  return (
    <div className="relative mx-auto max-w-md" dir="rtl">
      <div className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-teal-400/30 via-cyan-500/14 to-emerald-500/18 blur-xl" />

      <div
        className={cn(
          'relative overflow-hidden rounded-3xl border-2 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_36%),linear-gradient(165deg,#0f766e_0%,#115e59_38%,#0a4f4a_72%,#042f2e_100%)] p-6 shadow-2xl sm:p-7',
          mock.accentBorder,
          mock.accentGlow,
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #5eead4 0, #5eead4 1px, transparent 0, transparent 50%)',
            backgroundSize: '12px 12px',
          }}
        />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full bg-cyan-300/18 blur-3xl" />
        <div className="pointer-events-none absolute -left-8 bottom-8 h-24 w-24 rounded-full bg-amber-300/10 blur-2xl" />

        <div className="relative space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <HalaqmapBrandMark className="h-14 w-14 shrink-0 rounded-2xl ring-2 ring-teal-200/35 shadow-lg shadow-teal-500/25" />
              <div>
                <h3 className="text-base font-black text-white sm:text-lg">شهادة تفعيل رقمية</h3>
                <p className="mt-0.5 text-[0.68rem] leading-relaxed text-teal-50/75">
                  وثيقة رسمية تُثبت ملكيتك لمنتج حلاق ماب الرقمي
                </p>
              </div>
            </div>
            <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[0.55rem] font-black', mock.badgeTone)}>
              {mock.statusLabel}
            </span>
          </div>

          <div className="rounded-2xl border border-white/14 bg-black/30 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="text-[0.58rem] font-semibold tracking-wide text-teal-100/70">
              صاحب الرخصة · رخصة النفاذ الرقمية
            </p>
            <p className="mt-1 text-base font-bold text-white sm:text-lg">{mock.salonName}</p>
          </div>

          <motion.div
            className="relative overflow-hidden rounded-2xl border border-teal-200/50 bg-[linear-gradient(180deg,rgba(13,148,136,0.45)_0%,rgba(6,78,59,0.72)_48%,rgba(2,44,34,0.92)_100%)] px-4 py-5 text-center shadow-[inset_0_1px_0_rgba(153,246,228,0.28),0_0_36px_rgba(20,184,166,0.22)]"
            animate={{
              boxShadow: [
                '0 0 28px rgba(20,184,166,0.14)',
                '0 0 48px rgba(45,212,191,0.28)',
                '0 0 28px rgba(20,184,166,0.14)',
              ],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-transparent"
              animate={{ x: ['-120%', '220%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }}
            />
            <div className="relative">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-teal-200/40 bg-teal-500/20 px-3 py-0.5">
                <Sparkles className="h-3 w-3 text-teal-100" />
                <span className="text-[0.62rem] font-bold text-teal-50">كود التفعيل — مفتاح رخصتك</span>
              </div>
              <p
                className="font-mono text-[1.15rem] font-black tracking-[0.12em] text-transparent sm:text-[1.35rem]"
                dir="ltr"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #ecfdf5 0%, #5eead4 42%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }}
              >
                {mock.activationCode}
              </p>
              <p className="mt-2 text-[0.62rem] leading-relaxed text-teal-50/80">
                احفظ هذا الرمز — مرجعك الوحيد للتحقق، الدعم، وربط لوحة التحكم
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-2.5 text-[0.62rem] sm:gap-3">
            {[
              { label: 'الباقة المختارة', value: `${tierConfig.badge} ${tierConfig.name}` },
              { label: 'نظام الاستجابة', value: mock.responseModel },
              { label: 'تاريخ الإصدار', value: mock.issuedAt },
              { label: 'صلاحية الرخصة', value: mock.validUntil },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/12 bg-white/[0.07] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-3"
              >
                <p className="text-teal-100/65">{item.label}</p>
                <p className="mt-1 font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className={cn('flex items-start gap-2.5 rounded-xl border px-3 py-2.5', mock.footerTone)}>
            <FileCheck className={cn('mt-0.5 h-4 w-4 shrink-0', mock.statusTone)} />
            <div>
              <p className={cn('text-[0.68rem] font-bold', mock.statusTone)}>
                مُصدَرة ومُسجَّلة على نظام حلاق ماب — {mock.statusLabel}
              </p>
              <p className="mt-0.5 text-[0.58rem] leading-relaxed text-teal-50/75">
                منتج رقمي رسمي — تتبدل الشهادة منطقيًا بحسب الباقة، مدة النفاذ، ونظام الاستجابة المفعّل
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function PartnerMarketingPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isStrictPartnerPath =
    location.pathname === ROUTE_PATHS.BARBERS_LANDING || location.pathname.startsWith('/partners/');
  useDocumentTitle(SOFTWARE_SERVICES_PORTAL_HEADING);
  const { effectivePhase, control } = usePlatformAmbient();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'bronze' | 'gold' | 'diamond'>('gold');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [ideaAccordion, setIdeaAccordion] = useState<string | undefined>(undefined);
  const [ideaBriefOpen, setIdeaBriefOpen] = useState(false);
  const [deferMobilePartnerContent, setDeferMobilePartnerContent] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 768,
  );

  const warmHomeRoute = useCallback(() => {
    void preloadLandingPreviewRoute();
  }, []);
  const warmRegisterRoute = useCallback(() => {
    void preloadRegisterRoute();
  }, []);
  const goRegister = useCallback((source: string) => {
    ProductEvents.partnerJoinCtaClick({ source });
    warmRegisterRoute();
    navigate(ROUTE_PATHS.REGISTER);
  }, [navigate, warmRegisterRoute]);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const goToIdeaBrief = useCallback(() => {
    setMobileNavOpen(false);
    setIdeaBriefOpen(true);
  }, []);

  useEffect(() => {
    ProductEvents.partnerLandingView();
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setDeferMobilePartnerContent(true);
      return;
    }
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setDeferMobilePartnerContent(true);
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(enable, { timeout: 1800 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(enable, 900);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [isMobile]);

  return (
    <div
      dir="rtl"
      className="platform-dark platform-ambient relative min-h-screen overflow-x-hidden bg-[linear-gradient(160deg,#020912_0%,#040d1a_50%,#020912_100%)] text-slate-100"
      style={{ fontFamily: 'Tajawal, system-ui' }}
      data-ambient-phase={effectivePhase}
      data-ambient-control={control}
    >
      <Dialog open={ideaBriefOpen} onOpenChange={setIdeaBriefOpen}>
        <DialogContent
          dir="rtl"
          className="max-h-[85vh] overflow-y-auto border-teal-400/30 bg-[#041018] text-slate-100 sm:max-w-lg"
        >
          <DialogHeader className="space-y-3 text-right">
            <DialogTitle className="text-right text-xl font-black leading-8 text-white">
              الفكرة باختصار
            </DialogTitle>
            <DialogDescription className="text-right text-sm leading-8 text-slate-300">
              {PARTNER_WHY_ACTIVATE_SALES_UX_GATEWAY.body}
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3">
            {PARTNER_JOIN_PATH_HOW_IT_WORKS.points.map((point) => (
              <li key={point.title} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm font-black text-teal-200">{point.title}</p>
                <p className="mt-1 text-sm leading-7 text-slate-300">{point.body}</p>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setIdeaBriefOpen(false);
                goRegister('idea_brief');
              }}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-4 py-3 text-sm font-black text-white"
            >
              {PARTNER_JOIN_PATH_PRIMARY_CTA_AR}
            </button>
            <Link
              to={ROUTE_PATHS.PARTNER_SALES_OFFICE}
              onClick={() => setIdeaBriefOpen(false)}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100"
            >
              التفاصيل في مكتب المبيعات
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* أزرار عائمة */}
      {deferMobilePartnerContent && !isMobile ? <FloatingPlatformActions /> : null}
      {/* مكتب مدير المبيعات أصبح صفحة مستقلة — بطاقة الدخول موجودة داخل الهيرو */}

      {/* ── شبكة التكتير الخلفية ──────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(14,116,144,0.22) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,0.18) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.07),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.06),transparent_22%)]" />

      {/* ══════════════════════════════════════════════════════════════════
          الهيدر الموحّد — شريط المدن + التنقل (مسار الشركاء)
          ══════════════════════════════════════════════════════════════════ */}
      <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-500">
        <PartnerPlatformLaunchTicker surface="partner-dark" forceShow />
        <PartnerPlatformInspectionTicker surface="partner-dark" />
        <div className="relative z-20">
          <PartnerOrderReceptionTicker surface="partner-dark" />
        </div>

        <div className="relative isolate">
        {/* خلفية زجاجية — خلف التنقل فقط، لا تغطي شريط الفحص */}
        <div className={cn(
          'pointer-events-none absolute inset-0 -z-10 border-b border-white/10 bg-[#020912]/90 shadow-[0_12px_40px_rgba(0,0,0,0.35)]',
          isMobile ? 'backdrop-blur-0' : 'backdrop-blur-2xl',
        )} />

        {/* ── شريط مدن المملكة ────────────────────────────────────────── */}
        {!isMobile ? (
          <div className="relative min-h-[72px] border-b border-white/10">
            <KSACityClocksBar />
          </div>
        ) : null}

        {/* ── التنقل الرئيسي ──────────────────────────────────────────── */}
        <div className="relative">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3">

            {/* الشعار */}
            <Link
              to={ROUTE_PATHS.HOME}
              onMouseEnter={warmHomeRoute}
              onFocus={warmHomeRoute}
              onPointerDown={warmHomeRoute}
              onTouchStart={warmHomeRoute}
              className="flex items-center gap-3 no-underline"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-300/35 to-teal-300/25 blur-sm" />
                <motion.div
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300/60 bg-gradient-to-br from-white via-amber-50 to-teal-50 shadow-[0_10px_24px_rgba(245,158,11,0.18),inset_0_1px_0_rgba(255,255,255,0.85)]"
                  whileHover={{ scale: 1.08, rotate: -12 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Scissors className="h-4 w-4 text-amber-700" />
                </motion.div>
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[0.95rem] font-black tracking-wide text-white">حلاق ماب</span>
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-teal-500"
                  />
                </div>
                <div className="text-[0.48rem] font-bold tracking-[0.25em] text-slate-400">مسار الشركاء · B2B</div>
              </div>
              {/* شارة الشركاء */}
              <div className="hidden items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 sm:flex">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                />
                <span className="text-[0.55rem] font-bold text-emerald-200">مسار نشط</span>
              </div>
            </Link>
            <nav className="hidden items-center gap-1 md:flex" dir="rtl">
              <button
                type="button"
                onClick={goToIdeaBrief}
                className="group flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[0.78rem] font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-teal-300/80 transition-colors group-hover:text-teal-200" />
                الفكرة باختصار
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('الأسعار')}
                className="group flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[0.78rem] font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <Crown className="h-3.5 w-3.5 text-teal-300/80 transition-colors group-hover:text-teal-200" />
                الأسعار
              </button>
              <Link
                to={ROUTE_PATHS.PARTNER_MARKETING}
                className="group flex items-center gap-1.5 rounded-xl border border-amber-300/30 bg-amber-500/10 px-3.5 py-2 text-[0.78rem] font-semibold text-amber-100 transition-all hover:bg-amber-500/20"
              >
                <Megaphone className="h-3.5 w-3.5" />
                {PARTNER_JOIN_PATH_SECONDARY_LINKS.marketing}
              </Link>
              <a
                href={`${PARTNER_SUPPORT_WHATSAPP_URL}?text=${encodeURIComponent('مرحباً، أريد تسجيل صالوني في حلاق ماب.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-2 text-[0.78rem] font-semibold text-emerald-100 transition-all hover:bg-emerald-500/20"
              >
                <SiWhatsapp className="h-3.5 w-3.5" />
                واتساب
              </a>
              <div className="mx-1 h-5 w-px bg-white/15" />
              <Link
                to={ROUTE_PATHS.HOME}
                onMouseEnter={warmHomeRoute}
                onFocus={warmHomeRoute}
                onPointerDown={warmHomeRoute}
                onTouchStart={warmHomeRoute}
                className="group flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-[0.78rem] font-semibold text-slate-200 transition-all hover:bg-white/10 hover:text-white"
              >
                <Globe2 className="h-3.5 w-3.5" />
                للمستخدمين
                <ArrowRight className="h-3 w-3 opacity-50 group-hover:opacity-100" />
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <PlatformAmbientToggle variant="partner" className="inline-flex" />
              {!isMobile ? (
              <motion.button
                onMouseEnter={warmRegisterRoute}
                onFocus={warmRegisterRoute}
                onPointerDown={warmRegisterRoute}
                onTouchStart={warmRegisterRoute}
                onClick={() => goRegister('header')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative overflow-visible rounded-xl bg-gradient-to-l from-amber-400 via-amber-300 to-yellow-300 px-4 py-2.5 text-xs font-black text-slate-950 shadow-[0_12px_30px_rgba(245,158,11,0.22)] transition-all hover:shadow-[0_18px_34px_rgba(245,158,11,0.28)]"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                />
                  <span className="relative flex items-center gap-1.5">
                  <RegisterSalonGlowIcon size="sm" tone="frost" />
                  <span className="hidden lg:inline">{PARTNER_JOIN_PATH_PRIMARY_CTA_AR}</span>
                  <span className="lg:hidden">سجّل الآن</span>
                </span>
              </motion.button>
              ) : null}

              {/* موبايل — أيقونة القائمة */}
              <button
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10 md:hidden"
                aria-label="القائمة"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* خط التوهج السفلي — ذهبي */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent" />

          {/* ── قائمة موبايل ──────────────────────────────────────────── */}
            {mobileNavOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="relative border-t border-white/10 bg-[#020912]/95 px-4 py-3 md:hidden"
              >
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={goToIdeaBrief}
                    className="rounded-xl px-4 py-2.5 text-right text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-all"
                  >
                    الفكرة باختصار
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobileNavOpen(false); scrollToSection('الأسعار'); }}
                    className="rounded-xl px-4 py-2.5 text-right text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-all"
                  >
                    الأسعار
                  </button>
                  <Link
                    to={ROUTE_PATHS.PARTNER_MARKETING}
                    onClick={() => setMobileNavOpen(false)}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/30 bg-amber-500/10 py-2.5 text-sm font-bold text-amber-100"
                  >
                    <Megaphone className="h-4 w-4" />
                    {PARTNER_JOIN_PATH_SECONDARY_LINKS.marketing}
                  </Link>
                  <a
                    href={`${PARTNER_SUPPORT_WHATSAPP_URL}?text=${encodeURIComponent('مرحباً، أريد تسجيل صالوني في حلاق ماب.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 py-2.5 text-sm font-bold text-emerald-100"
                  >
                    <SiWhatsapp className="h-4 w-4" />
                    تواصل واتساب
                  </a>
                  <button
                    onMouseEnter={warmRegisterRoute}
                    onFocus={warmRegisterRoute}
                    onPointerDown={warmRegisterRoute}
                    onTouchStart={warmRegisterRoute}
                    onClick={() => { setMobileNavOpen(false); goRegister('mobile_nav'); }}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-400/40 bg-teal-500/15 py-2.5 text-sm font-black text-teal-100">
                    <RegisterSalonGlowIcon size="sm" tone="gold" />
                    {PARTNER_JOIN_PATH_PRIMARY_CTA_AR}
                  </button>
                  <Link
                    to={ROUTE_PATHS.PARTNER_APP}
                    onClick={() => setMobileNavOpen(false)}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-400/30 bg-teal-500/10 py-2.5 text-sm font-bold text-teal-100"
                  >
                    <Smartphone className="h-4 w-4" />
                    {PARTNER_JOIN_PATH_SECONDARY_LINKS.app}
                  </Link>
                </div>
              </motion.div>
            )}
        </div>

        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={cn(
        'relative overflow-hidden',
        /* هوامش علوية تغطي الهيدر الثابت */
        isMobile ? 'pt-28' : 'min-h-[88dvh] pt-40',
      )}>
        <div className={cn(
          'pointer-events-none absolute rounded-full bg-amber-300/12',
          isMobile ? '-right-24 top-4 h-[260px] w-[260px] blur-[52px]' : '-right-80 top-0 h-[700px] w-[700px] blur-[110px]',
        )} />
        <div className={cn(
          'pointer-events-none absolute rounded-full bg-teal-300/10',
          isMobile ? '-left-20 bottom-8 h-[220px] w-[220px] blur-[44px]' : '-left-60 bottom-0 h-[500px] w-[500px] blur-[92px]',
        )} />

        <div className={cn(
          'relative z-10 mx-auto max-w-7xl px-5',
          isMobile ? 'py-10' : 'py-20 lg:py-28',
        )}>
          <PartnerSharedTrialOfferBanner onRegister={() => goRegister('shared_trial_offer')} />
          <div className={cn(!isMobile && 'grid items-center gap-12 lg:grid-cols-2 lg:gap-20')}>
          {/* Text */}
          <motion.div initial={false} animate={{ opacity: 1, x: 0 }}>

            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-[0.68rem] font-semibold text-teal-100 sm:text-xs">
              <Sparkles className="h-3 w-3 shrink-0" />
              {PARTNER_JOIN_PATH_BADGE_AR}
            </div>

            <h1 className={cn(
              'mb-3 font-black leading-[1.1] text-white',
              isMobile ? 'text-[clamp(2rem,8vw,2.6rem)]' : 'mb-4 text-[clamp(2.6rem,5.5vw,4rem)]',
            )}>
              {PARTNER_JOIN_PATH_HERO_TITLE_AR}
            </h1>

            <p className={cn(
              'mb-3 font-bold leading-snug text-teal-200',
              isMobile ? 'text-[1.05rem]' : 'mb-4 text-xl md:text-2xl',
            )}>
              {PARTNER_JOIN_PATH_HERO_HEADLINE_AR}
            </p>

            <p className={cn(
              'mb-5 max-w-xl leading-relaxed text-slate-300',
              isMobile ? 'text-[0.95rem] leading-8' : 'mb-6 text-base',
            )}>
              {PARTNER_JOIN_PATH_HERO_LEAD_AR}
            </p>

            <p className="mb-3 text-sm font-semibold text-amber-200/90">
              يقتصر الاشتراك على المنشآت فقط · بوابة الدفع بعد اكتمال التعهدات
            </p>
            <p className="mb-3 text-sm font-semibold text-teal-100/90">
              {PARTNER_JOIN_PATH_TRUST_LINE_AR}
            </p>
            <p className="mb-5 max-w-xl text-sm leading-7 text-slate-300">
              {PARTNER_SISTER_SURFACE_LINE_AR}
            </p>

            {!isMobile ? (
              <PlatformTrustStrip variant="strip" tone="dark" className="mb-6 max-w-xl" />
            ) : null}

            <div className={cn('flex flex-col gap-3', !isMobile && 'sm:flex-row sm:flex-wrap')}>
              <button
                onMouseEnter={warmRegisterRoute}
                onFocus={warmRegisterRoute}
                onPointerDown={warmRegisterRoute}
                onTouchStart={warmRegisterRoute}
                onClick={() => goRegister('hero')}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-8 py-4 font-bold text-white shadow-xl shadow-cyan-500/15 hover:from-teal-400"
              >
                <RegisterSalonGlowIcon size="md" tone="gold" /> {PARTNER_JOIN_PATH_PRIMARY_CTA_AR}
              </button>
              <a
                href={`${PARTNER_SUPPORT_WHATSAPP_URL}?text=${encodeURIComponent('مرحباً، أريد تسجيل صالوني في حلاق ماب.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-6 py-4 font-semibold text-emerald-100 hover:bg-emerald-500/20"
              >
                <SiWhatsapp className="h-4 w-4" /> تواصل واتساب مباشر
              </a>
              {isStrictPartnerPath && !isMobile ? (
                <Link
                  to={ROUTE_PATHS.PARTNER_SALES_OFFICE}
                  className="flex items-center justify-center gap-2 rounded-xl border border-amber-300/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-100 hover:bg-amber-500/20"
                >
                  <BriefcaseBusiness className="h-4 w-4" />
                  مكتب المبيعات
                </Link>
              ) : null}
            </div>
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">
              {PARTNER_JOIN_PATH_APP_HINT_AR}
            </p>

            <div className="mt-8">
              <Suspense fallback={null}>
                <FounderDeskBannerLazy />
              </Suspense>
            </div>

          </motion.div>

          {/* Card preview */}
          {!isMobile ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="relative flex flex-col gap-4 overflow-visible"
          >
            <p className="mb-4 text-center text-sm font-semibold text-slate-300">
              هكذا يظهر صالونك للمستعلم بعد التفعيل
            </p>
            <div className="mb-4 flex items-center justify-center gap-2">
              {PARTNER_BANNERS_PREVIEW_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setActiveTab(tier.id)}
                  className={`rounded-lg border px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === tier.id
                      ? tier.id === 'diamond' ? 'border-cyan-300 bg-cyan-100 text-cyan-800 shadow-sm'
                        : tier.id === 'gold' ? 'border-amber-300 bg-amber-100 text-amber-800 shadow-sm'
                        : 'border-amber-300 bg-amber-50 text-amber-800 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {tier.badge} {tier.id === 'bronze' ? 'برونزي' : tier.id === 'gold' ? 'ذهبي' : 'ماسي'}
                </button>
              ))}
            </div>
            {(() => {
              const activeBannerTier = PARTNER_BANNERS_PREVIEW_TIERS.find((t) => t.id === activeTab);
              if (!activeBannerTier) return null;
              return (
                <motion.div
                  key={activeBannerTier.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-visible"
                >
                  <EndUserBarberBannerSim tier={activeBannerTier} mode="static" />
                </motion.div>
              );
            })()}
            <p className="mt-3 text-center text-[0.65rem] text-slate-400">
              معاينة ثابتة — اختر الباقة · للتفاصيل انتقل لقسم الأسعار
            </p>
          </motion.div>
          ) : null}
          </div>
        </div>

        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className={cn('absolute bottom-8 left-1/2 -translate-x-1/2 text-teal-500/50', isMobile && 'hidden')}>
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      {isMobile && !deferMobilePartnerContent ? null : (
      <>
      <section id="فكرة-الانضمام" className="relative z-10 border-y border-white/10 bg-white/[0.03] py-10 md:py-14">
        <div className="mx-auto max-w-5xl px-5" dir="rtl">
          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Sparkles, title: PARTNER_JOIN_PATH_HOW_IT_WORKS.kicker, body: PARTNER_JOIN_PATH_HOW_IT_WORKS.points[0].title },
              { icon: TrendingUp, title: PARTNER_JOIN_PATH_WHY_NOW.kicker, body: PARTNER_JOIN_PATH_WHY_NOW.points[0].title },
              { icon: Zap, title: PARTNER_JOIN_PATH_STEPS.kicker, body: PARTNER_JOIN_PATH_STEPS.steps[0].title },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-right"
              >
                <item.icon className="mb-2 h-5 w-5 text-teal-300" />
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
          <Accordion
            type="single"
            collapsible
            value={ideaAccordion}
            onValueChange={setIdeaAccordion}
            className="rounded-2xl border border-white/10 bg-[#041018] px-4"
          >
            <AccordionItem value="how" id={PARTNER_JOIN_PATH_HOW_IT_WORKS.id} className="scroll-mt-28 border-white/10">
              <AccordionTrigger className="text-right text-white hover:no-underline">
                {PARTNER_JOIN_PATH_HOW_IT_WORKS.title}
              </AccordionTrigger>
              <AccordionContent className="text-slate-300">
                <p className="mb-3 leading-7">{PARTNER_JOIN_PATH_HOW_IT_WORKS.lead}</p>
                <ul className="space-y-2">
                  {PARTNER_JOIN_PATH_HOW_IT_WORKS.points.map((point) => (
                    <li key={point.title}>
                      <span className="font-bold text-teal-200">{point.title}: </span>
                      {point.body}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="why" id={PARTNER_JOIN_PATH_WHY_NOW.id} className="scroll-mt-28 border-white/10">
              <AccordionTrigger className="text-right text-white hover:no-underline">
                {PARTNER_JOIN_PATH_WHY_NOW.title}
              </AccordionTrigger>
              <AccordionContent className="text-slate-300">
                <p className="mb-3 leading-7">{PARTNER_JOIN_PATH_WHY_NOW.lead}</p>
                <ul className="space-y-2">
                  {PARTNER_JOIN_PATH_WHY_NOW.points.map((point) => (
                    <li key={point.title}>
                      <span className="font-bold text-teal-200">{point.title}: </span>
                      {point.body}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="steps" id={PARTNER_JOIN_PATH_STEPS.id} className="scroll-mt-28 border-white/10">
              <AccordionTrigger className="text-right text-white hover:no-underline">
                {PARTNER_JOIN_PATH_STEPS.title}
              </AccordionTrigger>
              <AccordionContent className="text-slate-300">
                <p className="mb-3 leading-7">{PARTNER_JOIN_PATH_STEPS.lead}</p>
                <ul className="space-y-2">
                  {PARTNER_JOIN_PATH_STEPS.steps.map((step) => (
                    <li key={step.step}>
                      <span className="font-bold text-teal-200">{step.title}: </span>
                      {step.body}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm leading-7 text-slate-400" id={PARTNER_JOIN_PATH_PAY_GATE.id}>
                  {PARTNER_JOIN_PATH_PAY_GATE.body}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="الأسعار" className="relative z-10 py-24">
        <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-amber-300/9 blur-[88px]" />
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-14 text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-200">
              <Crown className="h-3 w-3" /> حزم رخصة النفاذ الرقمية
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mb-3 text-3xl font-black text-white md:text-4xl">
              {PARTNER_SECTION_INTROS.plans.title}
            </motion.h2>
            <p className="text-slate-300">{PARTNER_SECTION_INTROS.plans.lead}</p>
          </div>

          <div className="banner-radiation-stage">
          <div className="banner-radiation-grid relative z-[1] grid gap-6 md:grid-cols-3 md:gap-8">
            {/* ── برونزي ── من TIER_MONTHLY_SAR مباشرة */}
            <PricingCard
              tier="Bronze" tierQuery="bronze"
              radiationTier="bronze"
              price={TIER_MONTHLY_SAR[SubscriptionTier.BRONZE]}
              name="برونزي" badge="🥉"
              accent="text-amber-700" ringColor="border-amber-700/30"
              delay={0}
              features={[
                'ظهور عند الطلب للمستخدمين المناسبين',
                'بطاقة صالون كاملة: موقع، اتصال، واتساب',
                'صور واجهة ٣ صور + بنر أساسي',
                'أوقات عمل أسبوعية + حالة مفتوح/مغلق',
                'شهادة تفعيل رقمية + رقم الرخصة',
              ]}
            />

            {/* ── ذهبي ── */}
            <PricingCard
              tier="Gold" tierQuery="gold"
              radiationTier="gold"
              price={TIER_MONTHLY_SAR[SubscriptionTier.GOLD]}
              name="ذهبي" badge="🥇"
              accent="text-amber-400" ringColor="border-amber-400/40"
              recommended delay={0.1}
              features={[
                'كل مزايا البرونزي +',
                'ظهور أولوية في نتائج المنطقة',
                'بنر تسويقي احترافي بصري',
                'متابعة داخلية منظّمة داخل الحساب',
                'خدمة كبار السن وذوي الاحتياجات الخاصة',
                'QR تقييم موثّق + رابط الصالون',
                OWNER_WATCH_LISTING_GOLD_HIGHLIGHT_AR,
              ]}
            />

            {/* ── ماسي + Add-on اختياري ── */}
            <PricingCard
              tier="Diamond" tierQuery="diamond"
              radiationTier="diamond"
              price={TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND]}
              name="ماسي" badge="💎"
              accent="text-cyan-400" ringColor="border-cyan-400/30"
              delay={0.2} addOnAvailable
              features={[
                'كل مزايا الذهبي +',
                'صدارة نتائج المنطقة والمدينة',
                'شات مع الزبائن عبر واتساب ذكي',
                'معرض حتى 40 صورة',
                'تحليلات مفصّلة + تقارير أداء متقدمة',
                OWNER_WATCH_LISTING_DIAMOND_HIGHLIGHT_AR,
                `${DIAMOND_PRODUCT_STANDARD_LABEL_AR} | +${DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س إضافة المكتب الخاص 🏛️`,
              ]}
            />
          </div>
          </div>
          <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-500/10 px-5 py-4 text-right">
            <p className="text-[0.72rem] font-black tracking-[0.16em] text-amber-200">
              تنبيه امتثال لمحتوى الفيديو
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              عند تفعيل المزايا التي تتضمن عرض الفيديو، يلتزم الصالون بأن تكون المقاطع خالية من أي مخالفات تشريعية أو ملاحظات تمس الذوق العام، بما في ذلك الموسيقى الصاخبة أو تصوير أي زبون أو شخص آخر دون موافقته الخطية الصريحة. وتبقى المسؤولية كاملة على الصالون بوصفه الناشر والمتحكم بمحتوى ملفه، مع خضوع المواد المعروضة لرقابة تقنية صارمة من المنصة.
            </p>
          </div>
          <p className="mt-5 text-center text-[0.68rem] text-slate-400">
            كل حزمة صالحة ٣٠ يوماً · لا وساطة تجارية · لا عمولة على الخدمة · لا بيانات حكومية مطلوبة للتسجيل
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onMouseEnter={warmRegisterRoute}
              onFocus={warmRegisterRoute}
              onPointerDown={warmRegisterRoute}
              onTouchStart={warmRegisterRoute}
              onClick={() => goRegister('pricing')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/15"
            >
              <RegisterSalonGlowIcon size="md" tone="gold" /> {PARTNER_JOIN_PATH_PRIMARY_CTA_AR}
            </button>
            <Link
              to={ROUTE_PATHS.REGISTER_GUIDE}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
            >
              {PARTNER_JOIN_PATH_SECONDARY_LINKS.guide}
            </Link>
          </div>
        </div>
      </section>

      {/* ── اقرأ المزيد (ثانوي) ──────────────────────────────────────────── */}
      <section id="منطق-الشراكة" className="relative z-10 border-y border-white/10 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-5xl px-5 pb-10 text-center" dir="rtl">
          <h2 className="text-2xl font-black text-white">اقرأ المزيد عن المسار</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
            تفاصيل أعمق لمن يريد فهم حرية التشغيل ومزايا الباقات قبل تعبئة الطلب.
          </p>
        </div>
        <PartnerMallNarrativeSection compact={isMobile} variant="dark" />
        <PartnerB2BVisualFeatureCards variant="dark" />
        <PartnerB2BUrgencyBand variant="dark" />
        <PartnerOwnerWatchSpotlight compact={isMobile} variant="dark" />
        <PartnerFreedomPillars compact={isMobile} variant="dark" />
        <div className="mx-auto max-w-5xl px-5 py-10">
          <PartnerTechnicalPartnerCompare variant="full" tone="dark" />
        </div>
      </section>

      {/* ── Features (ثانوي) ─────────────────────────────────────────────── */}
      <section id="مزايا الباقات" className="relative z-10 border-y border-white/10 bg-white/[0.02] py-24">
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-violet-300/8 blur-[84px]" />
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-black text-white md:text-4xl">
              أدوات تخدم حريتك
            </motion.h2>
            <p className="mt-3 text-slate-300">{PARTNER_FREEDOM_FEATURES_LEAD_AR}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Navigation2} title="ظهور عند الطلب" desc="تُفعَّل برمجياً فقط عند وجود طلب نشط تنطبق عليه البيانات المتاحة والفلترة — لا إشغال دائم للمساحة الرقمية." color="from-amber-500 to-yellow-500" delay={0} />
            <FeatureCard icon={ImageIcon} title="بطاقة + بنر احترافي" desc="صفحة صالونك كاملة: صور واجهة، بنر تسويقي، خدمات، أسعار، وساعات العمل." color="from-teal-500 to-cyan-500" delay={0.08} />
            <FeatureCard icon={Clock} title="مفتوح/مغلق لحظياً" desc="اضبط حالة صالونك في أي وقت عبر رابط سري — بدون دخول لوحة التحكم." color="from-emerald-500 to-green-500" delay={0.16} />
            <FeatureCard icon={Star} title="تقييمات موثّقة + QR" desc="كود QR يُرسل لزبونك لتقييمك بعد الخدمة — تقييمات حقيقية لا وهمية." color="from-rose-500 to-pink-500" delay={0.08} badge="Gold +" />
            <FeatureCard icon={BarChart3} title="متابعة داخلية منظّمة" desc="أدوات داخلية تساعد الصالون على إدارة حضوره الرقمي بهدوء ووضوح داخل حسابه." color="from-violet-500 to-purple-500" delay={0.16} badge="Gold +" />
            <FeatureCard icon={Brain} title="إضافة المكتب الخاص 🏛️" desc="مساعد داخلي + مناوب شات مترابطان — أعطِ تعليماتك، المناوب ينفّذها، والتقارير تصلك داخل المسار التشغيلي." color="from-violet-600 to-indigo-600" delay={0.24} badge="Diamond Add-on" />
            <FeatureCard icon={Users} title="خدمة كبار السن وذوي الاحتياجات" desc="إعلان موجَّه لشريحة لا تجدها في أي منصة أخرى — ميزة تنافسية حقيقية." color="from-sky-500 to-blue-400" delay={0.08} badge="Gold +" />
            <FeatureCard icon={QrCode} title="بورتفوليو صور" desc="اعرض أعمالك الفعلية — المزيد من الصور = المزيد من الثقة قبل الزيارة." color="from-orange-500 to-red-500" delay={0.16} badge="Diamond +" />
            <FeatureCard icon={FileCheck} title="شهادة تفعيل رقمية" desc="وثيقة رقمية صادرة من المنصة بعد كل دفعة — تتضمن كود التفعيل وبيانات الرخصة وفق الحالة الحالية في النظام." color="from-amber-600 to-orange-500" delay={0.24} />
          </div>
        </div>
      </section>

      {/* ── Banner preview showcase ───────────────────────────────────────── */}
      <section id="معاينة البنرات" className="relative z-10 border-y border-white/10 bg-white/[0.02] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-black text-white md:text-4xl">
              هكذا يظهر صالونك
            </motion.h2>
            <p className="mt-3 text-slate-300">
              معاينة ثابتة للبنرات — للمحاكاة الحية والرقابة الإدارية انتقل لصفحة المعاينة الكاملة
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-cyan-200/80">{PARTNER_PRODUCT_HUB_OFFICE_ADDON_LINE}</p>
          </div>

          <div className="space-y-16">
            {PARTNER_BANNERS_PREVIEW_TIERS.map((tier, index) => (
              <BannerPreviewTierSection
                key={tier.id}
                tier={tier}
                index={index}
                bannerMode="static"
                showCta={false}
                className="border-b border-white/5 pb-16 last:border-b-0 last:pb-0"
              />
            ))}
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PARTNER_PRODUCT_HUB_SUMMARY_CARDS.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() =>
                  navigate(`${ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW}#${card.sectionId}`)
                }
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-right shadow-[0_16px_36px_rgba(2,9,18,0.35)] transition-all hover:border-cyan-400/40 hover:bg-cyan-500/10"
              >
                <p className="text-2xl">{card.emoji}</p>
                <p className="mt-2 text-base font-black text-white group-hover:text-cyan-100">{card.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{card.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                  شاهد المحاكاة
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                </span>
              </button>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => navigate(ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-100 transition-all hover:border-amber-300/50 hover:bg-amber-500/20"
            >
              <ImageIcon className="h-4 w-4" /> معاينة الباقات والمكتب الخاص — الصفحة الكاملة
            </button>
          </div>
        </div>
      </section>

      {/* ── Digital certificate ───────────────────────────────────────────── */}
      <section className="relative z-10 py-24">
        <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-amber-300/9 blur-[72px]" />
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} dir="rtl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-200">
                <FileCheck className="h-3 w-3" /> بعد كل دفعة — وفق حالة التفعيل
              </div>
              <h2 className="mb-5 text-3xl font-black text-white">شهادة تفعيل تليق بشراكتك</h2>
              <p className="mb-6 text-base leading-relaxed text-slate-300">
                حلاق ماب تُسلّمك وثيقة رقمية صادرة من المنصة تُثبت ملكيتك لرخصة النفاذ:
                اسم منشأتك، باقتك، تواريخ الصلاحية، وكود تفعيل فريد يُبرز كمفتاح رخصتك الرسمي.
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  'كود تفعيل بارز بتنسيق `HM-LIC-XXXX-XXXX-XXXX`',
                  'إصدار بعد اكتمال الدفع وفق حالة التفعيل الحالية',
                  'اسم المنشأة والباقة وصلاحية الرخصة موضحة',
                  'مرجع رسمي للتحقق والدعم ولوحة التحكم',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-300" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <CertificateMockup tier={activeTab} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── مقارنة سريعة ─────────────────────────────────────────────────── */}
      <section className="relative z-10 border-t border-white/10 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-4xl px-5">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mb-2 text-center text-2xl font-black text-white">
            {PARTNER_SECTION_INTROS.comparison.title}
          </motion.h2>
          <p className="mb-8 text-center text-sm leading-relaxed text-slate-300">{PARTNER_SECTION_INTROS.comparison.lead}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {PARTNER_SOCIAL_VS_PLATFORM_ROWS_AR.map((row) => (
              <div key={row.channel} className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
                <p className="font-bold text-white">{row.channel}</p>
                <p className="mt-2 text-sm text-slate-300">{row.intent}</p>
                <p className="mt-2 text-xs font-semibold text-teal-200">{row.cost}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 border-t border-white/10 py-20">
        <div className="mx-auto max-w-3xl px-5">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mb-3 text-center text-2xl font-black text-white">
            {PARTNER_SECTION_INTROS.faq.kicker}
          </motion.h2>
          <p className="mb-10 text-center text-sm text-slate-300">{PARTNER_SECTION_INTROS.faq.lead}</p>
          <div className="flex flex-col gap-3">
            {PARTNER_LANDING_FAQ_AR.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_14px_30px_rgba(2,9,18,0.35)]"
              >
                <button
                  className="flex w-full items-center justify-between px-5 py-4 text-right text-sm font-semibold text-white hover:text-teal-100"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.q}
                  <ChevronDown className={`h-4 w-4 shrink-0 text-amber-300 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <p className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-slate-300">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 overflow-hidden border-t border-white/10 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-amber-300/10 blur-[96px]" />
          <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-teal-300/9 blur-[84px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-5 text-center" dir="rtl">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="mb-4 text-3xl font-black leading-snug text-white md:text-4xl">
              {PARTNER_HERO_CLOSING_TAGLINE_AR}
            </h2>
            <p className="mx-auto mb-3 max-w-xl text-base leading-relaxed text-slate-300">
              {PARTNER_JOIN_PATH_HERO_LEAD_AR}
            </p>
            <p className="mx-auto mb-8 max-w-xl text-sm font-semibold leading-7 text-emerald-200">
              {PARTNER_JOIN_PATH_PAY_GATE.body}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onMouseEnter={warmRegisterRoute}
                onFocus={warmRegisterRoute}
                onPointerDown={warmRegisterRoute}
                onTouchStart={warmRegisterRoute}
                onClick={() => goRegister('footer_cta')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-10 py-4 font-bold text-white shadow-2xl shadow-cyan-500/18 hover:from-teal-400 transition-all"
              >
                <RegisterSalonGlowIcon size="lg" tone="gold" /> {PARTNER_JOIN_PATH_PRIMARY_CTA_AR}
              </button>
              <button
                onClick={() => navigate(ROUTE_PATHS.PARTNER_WHY)}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 font-semibold text-slate-100 hover:bg-white/10 transition-all"
              >
                {PARTNER_JOIN_PATH_SECONDARY_LINKS.why} <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate(ROUTE_PATHS.PARTNER_MARKETING)}
                className="flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-500/10 px-8 py-4 font-semibold text-amber-100 hover:bg-amber-500/20 transition-all"
              >
                <Megaphone className="h-4 w-4" />
                {PARTNER_JOIN_PATH_SECONDARY_LINKS.marketing}
              </button>
              <button
                onClick={() => navigate(ROUTE_PATHS.PARTNER_STORY)}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 font-semibold text-slate-200 hover:bg-white/10 transition-all"
              >
                {PARTNER_JOIN_PATH_SECONDARY_LINKS.story} <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
            <p className="mx-auto mt-6 max-w-md text-xs text-slate-400">
              {PARTNER_FINAL_CTA_BODY_AR}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className={cn(
        'relative z-10 border-t border-white/10 bg-[#020912]/80 pt-12 backdrop-blur-sm',
        isMobile
          ? MOBILE_PARTNER_ACTION_DOCK_CLEARANCE
          : 'pb-[max(3rem,calc(1.5rem+env(safe-area-inset-bottom,0px)))]',
      )}>
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
            <div dir="rtl">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-700">
                  <Scissors className="h-4 w-4 text-black" />
                </div>
                <span className="text-base font-black text-white">حلاق ماب — مسار الشركاء</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                {PLATFORM_B2B_TECHNICAL_PARTNER_ROLE_AR}
                <span className="mt-2 block">
                  مزوّد حلول تقنية · {PARTNER_TECHNICAL_PARTNER_LABEL_AR} · ISIC4 474151 · المملكة العربية السعودية — ليست وسيطاً تجارياً.
                </span>
              </p>
            </div>
            <div dir="rtl">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">مسار الشركاء</h4>
              <div className="flex flex-col gap-2.5 text-sm text-slate-300">
                {[
                  { label: 'التسجيل', to: ROUTE_PATHS.REGISTER, source: 'footer_link' },
                  { label: PARTNER_JOIN_PATH_SECONDARY_LINKS.marketing, to: ROUTE_PATHS.PARTNER_MARKETING },
                  { label: PARTNER_JOIN_PATH_SECONDARY_LINKS.app, to: ROUTE_PATHS.PARTNER_APP },
                  { label: 'الباقات والأسعار', to: ROUTE_PATHS.SUBSCRIPTION_POLICY },
                  { label: 'طلب ضيافة B2B (فنادق/شقق)', to: ROUTE_PATHS.HOSPITALITY_B2B_REQUEST },
                  { label: 'سياسة الحزم', to: ROUTE_PATHS.SUBSCRIPTION_POLICY },
                  { label: 'مكتب مدير المبيعات', to: ROUTE_PATHS.PARTNER_SALES_OFFICE },
                  { label: 'خدمة العملاء', to: ROUTE_PATHS.PARTNER_SUPPORT },
                  { label: 'خصوصية الشركاء', to: ROUTE_PATHS.PARTNER_PRIVACY },
                ].map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={link.source ? () => ProductEvents.partnerJoinCtaClick({ source: link.source }) : undefined}
                    className="hover:text-amber-200 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div dir="rtl">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">المستخدمون</h4>
              <div className="flex flex-col gap-2.5">
                <Link
                  to={ROUTE_PATHS.HOME}
                  onMouseEnter={warmHomeRoute}
                  onFocus={warmHomeRoute}
                  onPointerDown={warmHomeRoute}
                  onTouchStart={warmHomeRoute}
                  className="text-sm text-slate-300 hover:text-teal-200 transition-colors"
                >
                  ابحث عن حلاق ↗
                </Link>
                <Link to={ROUTE_PATHS.USER_PRIVACY_POLICY} className="text-sm text-slate-300 hover:text-teal-200">سياسة الخصوصية</Link>
                <Link to={ROUTE_PATHS.TERMS_OF_SERVICE} className="text-sm text-slate-300 hover:text-teal-200">شروط الاستخدام</Link>
                {PUBLIC_PULSE_EXPERIENCE_ENABLED ? (
                  <Link to={ROUTE_PATHS.RADAR_SHOWCASE} className="text-sm text-slate-300 hover:text-teal-200 transition-colors">
                    {PULSE_MAP_LINK_LABEL_AR}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/10 pt-8 text-center text-[0.7rem] text-slate-500 md:flex-row md:justify-between">
            <span>© ٢٠٢٦ حلاق ماب — جميع الحقوق محفوظة</span>
            <span className="text-slate-500">مزوّد حلول تقنية · ISIC4 474151 · المملكة العربية السعودية</span>
          </div>
          <div className="mt-2 text-center text-sm font-bold text-slate-200 sm:text-base">
            تراخيص الهيئة العامة لتنظيم الإعلام 167220 - 167221 - 167222
          </div>
          <div className="mt-2 text-center text-sm font-bold text-slate-200 sm:text-base">
            {LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR}
          </div>
          <div className="mt-5">
            <EcommerceVerifiedFooterBadge variant="dark" />
          </div>
        </div>
      </footer>
      </>
      )}
      {isMobile ? (
        <MobilePartnerActionDock
          onRegister={() => goRegister('mobile_dock')}
          onSalesOffice={() => navigate(ROUTE_PATHS.PARTNER_SALES_OFFICE)}
        />
      ) : null}
    </div>
  );
}
