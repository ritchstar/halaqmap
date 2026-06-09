/**
 * صفحة مسار الخدمات التسويقية للشركاء — حلاق ماب
 * المسار: /preview-partners
 *
 * مسار مُخصَّص للحلاقين والصالونات فقط.
 * يعزل تجربة الانضمام عن تجربة المستخدم العادي تماماً.
 * يعتمد نفس نظام التصميم الداكن لصفحة /preview مع محتوى موجَّه للشريك.
 */

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Scissors, Star, Shield, CheckCircle2, Clock, ArrowLeft,
  Sparkles, ChevronDown, Globe2, Users, Award, BarChart3,
  Crown, Zap, Navigation2, Phone, MessageCircle, Lock,
  TrendingUp, QrCode, ImageIcon, Brain, Moon, FileCheck,
  ChevronLeft, ArrowRight, Wifi, Menu, BriefcaseBusiness
} from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
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
  PARTNER_PRODUCT_HUB_TAGLINE,
} from '@/config/partnerProductHubCopy';
import {
  PARTNER_TECHNICAL_PARTNER_HEADLINE,
  PARTNER_TECHNICAL_PARTNER_HERO_CHIPS,
  PARTNER_TECHNICAL_PARTNER_LABEL_AR,
  PARTNER_TECHNICAL_PARTNER_TAGLINE,
} from '@/config/partnerTechnicalPartnerDoctrine';
import { PLATFORM_B2B_TECHNICAL_PARTNER_ROLE_AR } from '@/config/platformIdentity';
import { PartnerTechnicalPartnerCompare } from '@/components/partner/PartnerTechnicalPartnerCompare';
import { routeToBuyPackage } from '@/lib/buyPackageRouter';
import { PlatformAmbientToggle } from '@/components/PlatformAmbientToggle';
import { PlatformTlsTrustBadge } from '@/components/PlatformTlsTrustBadge';
import { PlatformTrustStrip } from '@/components/PlatformTrustStrip';
import { usePlatformAmbient } from '@/context/PlatformAmbientContext';
import { SOFTWARE_SERVICES_PORTAL_HEADING } from '@/config/partnerPortal';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

// ─── Animated counter ──────────────────────────────────────────────────────
function useCounter(end: number, duration = 1800, enabled = true) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  if (enabled && !started.current) {
    started.current = true;
    let current = 0;
    const step = end / (duration / 16);
    const t = setInterval(() => {
      current += step;
      if (current >= end) { setCount(end); clearInterval(t); }
      else setCount(Math.floor(current));
    }, 16);
  }
  return count;
}

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
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-[#f7fbff] p-5 shadow-[0_16px_40px_rgba(148,163,184,0.12)] hover:border-sky-200 hover:shadow-[0_18px_42px_rgba(56,189,248,0.14)] transition-all"
      dir="rtl"
    >
      {badge && (
        <div className="absolute left-3 top-3 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[0.55rem] font-bold text-amber-700">
          {badge}
        </div>
      )}
      <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} p-0.5`}>
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-white/90">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <h3 className="mb-1.5 text-base font-bold text-slate-900">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
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
    accentBorder: 'border-amber-500/35',
    accentGlow: 'shadow-amber-500/15',
    badgeTone: 'border border-amber-300/40 bg-amber-500/10 text-amber-200',
    statusTone: 'text-amber-200',
    footerTone: 'border-amber-400/20 bg-amber-500/10',
    statusLabel: 'نشطة',
    salonName: 'صالون نموذجي — البرونزي',
    activationCode: 'HM-LIC-BRZ-2026-001',
    responseModel: 'ظهور عند الطلب',
    issuedAt: 'يونيو 2026',
    validUntil: '30 يوم من تاريخ التفعيل',
  },
  gold: {
    accentBorder: 'border-amber-400/45',
    accentGlow: 'shadow-amber-400/20',
    badgeTone: 'border border-amber-300/40 bg-amber-500/10 text-amber-100',
    statusTone: 'text-amber-100',
    footerTone: 'border-amber-300/20 bg-amber-500/10',
    statusLabel: 'نشطة',
    salonName: 'صالون نموذجي — الذهبي',
    activationCode: 'HM-LIC-GLD-2026-002',
    responseModel: 'أولوية ظهور عند الطلب',
    issuedAt: 'يونيو 2026',
    validUntil: '30 يوم من تاريخ التفعيل',
  },
  diamond: {
    accentBorder: 'border-cyan-400/40',
    accentGlow: 'shadow-cyan-400/20',
    badgeTone: 'border border-cyan-300/40 bg-cyan-500/10 text-cyan-100',
    statusTone: 'text-cyan-100',
    footerTone: 'border-cyan-300/20 bg-cyan-500/10',
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
      {/* هالة خارجية */}
      <div className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-amber-400/25 via-amber-600/10 to-emerald-500/15 blur-xl" />

      <div className={cn(
        'relative overflow-hidden rounded-3xl border-2 bg-gradient-to-b p-6 shadow-2xl sm:p-7',
        mock.accentBorder,
        mock.accentGlow,
        tier === 'diamond' ? 'shadow-cyan-500/10' : 'shadow-amber-500/15',
      )}>
        {/* زخرفة diagonal */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%)',
            backgroundSize: '10px 10px',
          }}
        />
        {/* توهج علوي */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative space-y-5">
          {/* الرأس */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-800 shadow-lg shadow-amber-500/30 ring-2 ring-amber-200/30">
                <Scissors className="h-7 w-7 text-black" />
                <div className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full border-2 border-[#071007] bg-emerald-400" />
              </div>
              <div>
                <p className="text-[0.65rem] font-bold tracking-[0.2em] text-amber-300/80">HALAQ MAP</p>
                <h3 className="text-base font-black text-white sm:text-lg">شهادة تفعيل رقمية</h3>
                <p className="mt-0.5 text-[0.68rem] leading-relaxed text-slate-400">
                  وثيقة رسمية تُثبت ملكيتك لمنتج حلاق ماب الرقمي
                </p>
              </div>
            </div>
            <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[0.55rem] font-black', mock.badgeTone)}>
              {mock.statusLabel}
            </span>
          </div>

          {/* صاحب الرخصة */}
          <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
            <p className="text-[0.58rem] font-semibold tracking-wide text-slate-500">صاحب الرخصة · رخصة النفاذ الرقمية</p>
            <p className="mt-1 text-base font-bold text-white sm:text-lg">{mock.salonName}</p>
          </div>

          {/* كود التفعيل — البطل */}
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-950/50 via-[#120a00] to-black/60 px-4 py-5 text-center shadow-[inset_0_1px_0_rgba(251,191,36,0.2),0_0_40px_rgba(245,158,11,0.12)]"
            animate={{ boxShadow: ['0 0 30px rgba(245,158,11,0.10)', '0 0 50px rgba(245,158,11,0.22)', '0 0 30px rgba(245,158,11,0.10)'] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-amber-200/10 to-transparent"
              animate={{ x: ['-120%', '220%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }}
            />
            <div className="relative">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-0.5">
                <Sparkles className="h-3 w-3 text-amber-300" />
                <span className="text-[0.62rem] font-bold text-amber-200">كود التفعيل — مفتاح رخصتك</span>
              </div>
              <p
                className="font-mono text-[1.15rem] font-black tracking-[0.12em] text-transparent sm:text-[1.35rem]"
                dir="ltr"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 45%, #f59e0b 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }}
              >
                {mock.activationCode}
              </p>
              <p className="mt-2 text-[0.62rem] leading-relaxed text-amber-100/55">
                احفظ هذا الرمز — مرجعك الوحيد للتحقق، الدعم، وربط لوحة التحكم
              </p>
            </div>
          </motion.div>

          {/* التفاصيل */}
          <div className="grid grid-cols-2 gap-2.5 text-[0.62rem] sm:gap-3">
            {[
              { label: 'الباقة المختارة', value: `${tierConfig.badge} ${tierConfig.name}` },
              { label: 'نظام الاستجابة', value: mock.responseModel },
              { label: 'تاريخ الإصدار', value: mock.issuedAt },
              { label: 'صلاحية الرخصة', value: mock.validUntil },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 sm:p-3"
              >
                <p className="text-slate-500">{item.label}</p>
                <p className="mt-1 font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          {/* التذييل */}
          <div className={cn('flex items-start gap-2.5 rounded-xl border px-3 py-2.5', mock.footerTone)}>
            <FileCheck className={cn('mt-0.5 h-4 w-4 shrink-0', mock.statusTone)} />
            <div>
              <p className={cn('text-[0.68rem] font-bold', mock.statusTone)}>
                مُصدَرة ومُسجَّلة على نظام حلاق ماب — {mock.statusLabel}
              </p>
              <p className="mt-0.5 text-[0.58rem] leading-relaxed text-slate-300/80">
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
  const [deferMobilePartnerContent, setDeferMobilePartnerContent] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 768,
  );

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });
  const salons = useCounter(2300, 1800, statsInView);
  const cities = useCounter(47, 1400, statsInView);
  const searches = useCounter(18000, 2000, statsInView);
  const warmHomeRoute = useCallback(() => {
    void preloadLandingPreviewRoute();
  }, []);
  const warmRegisterRoute = useCallback(() => {
    void preloadRegisterRoute();
  }, []);
  const handleRegisterNavigate = useCallback(() => {
    warmRegisterRoute();
    navigate(ROUTE_PATHS.REGISTER);
  }, [navigate, warmRegisterRoute]);

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
      className="platform-ambient relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#fffdf7_0%,#f7fbff_34%,#f5faf7_100%)] text-slate-900"
      style={{ fontFamily: 'Tajawal, system-ui' }}
      data-ambient-phase={effectivePhase}
      data-ambient-control={control}
    >

      {/* أزرار عائمة */}
      {deferMobilePartnerContent ? <FloatingPlatformActions /> : null}
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
      <header className="fixed inset-x-0 top-0 z-50 transition-all duration-500">

        {/* خلفية زجاجية */}
        <div className={cn(
          'absolute inset-0 border-b border-sky-200/80 bg-white/85 shadow-[0_12px_40px_rgba(148,163,184,0.16)]',
          isMobile ? 'backdrop-blur-0' : 'backdrop-blur-2xl',
        )} />

        {/* ── شريط مدن المملكة ────────────────────────────────────────── */}
        {!isMobile || deferMobilePartnerContent ? (
          <div className="relative border-b border-sky-100/90">
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
                  <span className="text-[0.95rem] font-black tracking-wide text-slate-900">حلاق ماب</span>
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-teal-500"
                  />
                </div>
                <div className="text-[0.48rem] font-bold tracking-[0.25em] text-slate-500">مسار الشركاء · B2B</div>
              </div>
              {/* شارة الشركاء */}
              <div className="hidden items-center gap-1 rounded-full border border-emerald-300/50 bg-emerald-50 px-2.5 py-1 sm:flex">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                />
                <span className="text-[0.55rem] font-bold text-emerald-700">مسار نشط</span>
              </div>
            </Link>
            <nav className="hidden items-center gap-1 md:flex" dir="rtl">
              {[
                { label: 'كيف تنضم',      id: 'كيف تنضم',      icon: Navigation2 },
                { label: 'مزايا الباقات', id: 'مزايا الباقات', icon: Sparkles },
                { label: 'الأسعار',       id: 'الأسعار',       icon: Crown },
                { label: 'منطق الشراكة', id: 'منطق-الشراكة', icon: Users },
                { label: 'معاينة الباقات 🏛️', id: 'معاينة البنرات', icon: ImageIcon },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="group flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[0.78rem] font-semibold text-slate-600 transition-all hover:bg-sky-100 hover:text-sky-900 cursor-pointer"
                >
                  <item.icon className="h-3.5 w-3.5 text-teal-600/70 transition-colors group-hover:text-teal-700" />
                  {item.label}
                </button>
              ))}

              <div className="mx-1 h-5 w-px bg-slate-200" />
              <Link
                to={ROUTE_PATHS.HOME}
                onMouseEnter={warmHomeRoute}
                onFocus={warmHomeRoute}
                onPointerDown={warmHomeRoute}
                onTouchStart={warmHomeRoute}
                className="group flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2 text-[0.78rem] font-semibold text-teal-700 transition-all hover:border-teal-300 hover:bg-teal-100 hover:text-teal-800"
              >
                <Globe2 className="h-3.5 w-3.5" />
                للمستخدمين
                <ArrowRight className="h-3 w-3 opacity-50 group-hover:opacity-100" />
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <PlatformAmbientToggle variant="partner" className="hidden md:inline-flex" />
              <PlatformAmbientToggle variant="partner" className="inline-flex md:hidden" />
              <motion.button
                onMouseEnter={warmRegisterRoute}
                onFocus={warmRegisterRoute}
                onPointerDown={warmRegisterRoute}
                onTouchStart={warmRegisterRoute}
                onClick={handleRegisterNavigate}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-l from-amber-400 via-amber-300 to-yellow-300 px-4 py-2.5 text-xs font-black text-slate-950 shadow-[0_12px_30px_rgba(245,158,11,0.22)] transition-all hover:shadow-[0_18px_34px_rgba(245,158,11,0.28)]"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                />
                <span className="relative flex items-center gap-1.5">
                  <Scissors className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">سجّل صالونك</span>
                  <span className="sm:hidden">انضم</span>
                </span>
              </motion.button>

              {/* موبايل — أيقونة القائمة */}
              <button
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 md:hidden"
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
                className="relative border-t border-slate-200 bg-white/95 px-4 py-3 md:hidden"
              >
                <div className="flex flex-col gap-1">
                  {[
                    { label: 'كيف تنضم', id: 'كيف تنضم' },
                    { label: 'مزايا الباقات', id: 'مزايا الباقات' },
                    { label: 'الأسعار', id: 'الأسعار' },
                    { label: 'البنرات', id: 'معاينة البنرات' },
                  ].map(item => (
                    <button key={item.id} type="button"
                      onClick={() => { setMobileNavOpen(false); document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                      className="rounded-xl px-4 py-2.5 text-right text-sm font-semibold text-slate-700 hover:bg-sky-100 hover:text-sky-900 transition-all">
                      {item.label}
                    </button>
                  ))}
                  <button
                    onMouseEnter={warmRegisterRoute}
                    onFocus={warmRegisterRoute}
                    onPointerDown={warmRegisterRoute}
                    onTouchStart={warmRegisterRoute}
                    onClick={() => { setMobileNavOpen(false); handleRegisterNavigate(); }}
                    className="mt-1 w-full rounded-xl border border-amber-300/70 bg-amber-50 py-2.5 text-sm font-black text-amber-800">
                    سجّل صالونك ←
                  </button>
                </div>
              </motion.div>
            )}
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={cn(
        'relative overflow-hidden',
        isMobile ? 'pt-20' : 'min-h-[100dvh] pt-24',
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
          isMobile ? 'py-10' : 'grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28',
        )}>
          {/* Text */}
          <motion.div initial={{ opacity: 0, x: isMobile ? 0 : 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700">
              <Sparkles className="h-3 w-3" /> مسار الخدمات التسويقية للشركاء
            </motion.div>

            <h1 className="mb-6 text-[clamp(2.4rem,5.5vw,3.8rem)] font-black leading-[1.1] text-slate-950">
              اجعل صالونك
              <span className="block bg-gradient-to-l from-teal-600 via-cyan-600 to-emerald-500 bg-clip-text text-transparent">
                يُكتشف بذكاء
              </span>
            </h1>

            {/* ── بوابة مكتب مدير المبيعات — مباشرة تحت العنوان الرئيسي ── */}
            {isStrictPartnerPath && !isMobile ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="mb-6 w-full min-w-0"
              >
                <Link
                  to={ROUTE_PATHS.PARTNER_SALES_OFFICE}
                  className="group block overflow-hidden rounded-[1.5rem] border border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,243,0.98),rgba(255,255,255,0.96))] p-4 shadow-[0_16px_38px_rgba(245,158,11,0.10)] transition-all hover:border-amber-300 hover:shadow-[0_18px_42px_rgba(245,158,11,0.14)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-[1.15rem] border border-amber-200 bg-[linear-gradient(145deg,#fffdf8,#f8efdb)] shadow-[0_10px_24px_rgba(245,158,11,0.12)]">
                        <Scissors className="h-6 w-6 text-amber-700" />
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-cyan-200 bg-white text-[0.42rem] font-black text-cyan-700">
                          B2B
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1 inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50/80 px-2.5 py-1 text-[0.6rem] font-black text-cyan-800">
                          <BriefcaseBusiness className="h-3.5 w-3.5" />
                          تحدث مع مدير المبيعات
                        </div>
                        <p className="text-lg font-black text-slate-950">ادخل مكتب المبيعات التجاري</p>
                        <p className="mt-1 max-w-xl text-[0.84rem] leading-6 text-slate-600">
                          مكتب مستقل يشرح الباقات الحالية وآلية التفعيل بلغة أقرب للصالونات والمنشآت.
                        </p>
                      </div>
                    </div>

                    <div className="hidden shrink-0 flex-col items-end gap-2 md:flex">
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[0.68rem] font-bold text-emerald-700">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        مجلس حيّ ومباشر
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[0.68rem] font-bold text-slate-700">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        افتح المكتب
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ) : null}

            {isMobile ? (
              <>
                <p className="mb-5 max-w-lg text-[0.98rem] leading-8 text-slate-600">
                  منصة تساعد صالونك على الظهور عند الطلب أمام المستعلم المناسب. ابدأ الآن بخطوة واضحة وسريعة.
                </p>
                <div className="mb-5 rounded-[1.35rem] border border-emerald-200 bg-white/92 p-4 shadow-sm">
                  <p className="text-[0.78rem] font-black text-emerald-700">قرار سريع</p>
                  <p className="mt-1 text-[0.9rem] leading-7 text-slate-600">
                    اختر التسجيل مباشرة، أو افتح مكتب المبيعات إذا أردت شرح الباقات وآلية التفعيل قبل البدء.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-600">
                  {PARTNER_TECHNICAL_PARTNER_HEADLINE}
                  <span className="mt-2 block text-[0.9rem] leading-relaxed text-slate-500">
                    {PARTNER_TECHNICAL_PARTNER_TAGLINE}
                  </span>
                  <span className="mt-2 block text-[0.85rem] text-amber-700/80">
                    لا عمولة · لا وسيط · لا عقد مُلزِم
                  </span>
                </p>

                <PlatformTrustStrip variant="strip" tone="light" className="mb-8 max-w-xl" />

                <div className="mb-8 flex flex-wrap gap-3">
                  {PARTNER_TECHNICAL_PARTNER_HERO_CHIPS.map((text) => (
                    <div key={text} className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[0.75rem] text-emerald-800">
                      <Shield className="h-3.5 w-3.5 text-emerald-600" />
                      {text}
                    </div>
                  ))}
                  {[
                    { icon: Globe2, text: '47+ مدينة سعودية' },
                    { icon: Clock, text: 'حزمة 30 يوم مسبقة الدفع' },
                  ].map((b) => (
                    <div key={b.text} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[0.75rem] text-slate-700 shadow-sm">
                      <b.icon className="h-3.5 w-3.5 text-amber-600" />
                      {b.text}
                    </div>
                  ))}
                  <PlatformTlsTrustBadge variant="compact" tone="light" />
                </div>
              </>
            )}

            <div className={cn('flex flex-col gap-3 sm:flex-row', isMobile && 'sm:flex-col')}>
              <button
                onMouseEnter={warmRegisterRoute}
                onFocus={warmRegisterRoute}
                onPointerDown={warmRegisterRoute}
                onTouchStart={warmRegisterRoute}
                onClick={handleRegisterNavigate}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-8 py-4 font-bold text-white shadow-xl shadow-cyan-500/15 hover:from-teal-400"
              >
                <Scissors className="h-4 w-4" /> ابدأ رحلة الانضمام
              </button>
              <button
                onClick={() => navigate(isMobile ? ROUTE_PATHS.PARTNER_SALES_OFFICE : ROUTE_PATHS.PARTNER_WHY)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-4 font-semibold text-slate-800 shadow-sm hover:border-slate-300"
              >
                {isMobile ? 'مكتب مدير المبيعات' : 'لماذا نحن؟'} <ArrowLeft className="h-4 w-4" />
              </button>
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
                  <EndUserBarberBannerSim tier={activeBannerTier} startDelayMs={600} />
                </motion.div>
              );
            })()}
            <p className="mt-3 text-center text-[0.65rem] text-slate-500">
              محاكاة حقيقية لرحلة الزبون — اضغط التبويب لتغيير الباقة
            </p>

            {/* Floating indicators */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -left-5 top-16 rounded-xl border border-emerald-200 bg-white/95 px-3 py-2 shadow-[0_14px_32px_rgba(16,185,129,0.12)] backdrop-blur-md"
            >
              <div className="text-[0.6rem] text-slate-500">طلبات اليوم</div>
              <div className="text-sm font-black text-emerald-700">+١٢ زبون ↑</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.8 }}
              className="absolute -right-4 bottom-20 rounded-xl border border-amber-200 bg-white/95 px-3 py-2 shadow-[0_14px_32px_rgba(245,158,11,0.12)] backdrop-blur-md"
            >
              <div className="text-[0.6rem] text-slate-500">ظهرت في نتائج</div>
              <div className="text-sm font-black text-amber-700">٤٧ بحث 📍</div>
            </motion.div>
          </motion.div>
          ) : null}
        </div>

        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className={cn('absolute bottom-8 left-1/2 -translate-x-1/2 text-teal-500/50', isMobile && 'hidden')}>
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      {isMobile && !deferMobilePartnerContent ? null : (
      <>
      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 border-y border-sky-100 bg-white/65 py-12 backdrop-blur-sm">
        <div ref={statsRef} className="mx-auto max-w-4xl px-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: salons, suffix: '+', label: 'صالون على المنصة', color: 'text-amber-600' },
              { value: cities, suffix: '+', label: 'مدينة سعودية', color: 'text-teal-600' },
              { value: searches, suffix: '+', label: 'بحث شهرياً', color: 'text-cyan-700' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(148,163,184,0.08)]"
              >
                <div className={`text-3xl font-black tabular-nums ${s.color}`}>
                  {s.value.toLocaleString('ar-SA')}{s.suffix}
                </div>
                <div className="mt-1 text-xs text-slate-500">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technical partner doctrine ───────────────────────────────────── */}
      <section id="منطق-الشراكة" className="relative z-10 border-y border-slate-100 bg-slate-50/80 py-20">
        <div className="mx-auto max-w-5xl px-5">
          <PartnerTechnicalPartnerCompare variant="full" />
        </div>
      </section>

      {/* ── How to join ──────────────────────────────────────────────────── */}
      <section id="كيف تنضم" className="relative z-10 py-24">
        <div className="pointer-events-none absolute right-0 top-10 h-96 w-96 rounded-full bg-amber-300/10 blur-[72px]" />
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-14 text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700">
              <Zap className="h-3 w-3" /> رحلة الانضمام
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-black text-slate-900 md:text-4xl">
              ٤ خطوات — التسجيل ثم الدفع ثم التفعيل
            </motion.h2>
            <p className="mt-2 text-sm font-semibold text-emerald-700">✅ دفع رقمي واضح · تفعيل وفق حالة الطلب · لا عمولات على الخدمة</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '١', icon: Scissors, title: 'أكمل نموذج التسجيل', desc: 'بيانات صالونك الأساسية: الاسم، الموقع، الخدمات، صور الواجهة — في دقائق.', color: 'from-amber-500 to-yellow-500' },
              { step: '٢', icon: Crown, title: 'اختر حزمتك', desc: 'برونزي (١٠٠ ر.س) · ذهبي (١٥٠ ر.س) · ماسي (٢٠٠ ر.س) — حزم شهرية مسبقة الدفع وفق السياسة الحالية.', color: 'from-violet-500 to-purple-500' },
              { step: '٣', icon: Shield, title: 'ادفع بأمان', desc: 'عبر بوابة ميسر الآمنة (مدى · فيزا · ماستركارد) — اتصال HTTPS/TLS، مسبقة الدفع، لا تجديد تلقائي.', color: 'from-teal-500 to-cyan-500' },
              { step: '٤', icon: Wifi, title: 'يبدأ التفعيل', desc: 'بعد نجاح السداد يبدأ تفعيل صالونك وفق حالة الطلب داخل النظام.', color: 'from-emerald-500 to-green-500' },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(148,163,184,0.08)]"
                dir="rtl"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg`}>
                  <step.icon className="h-5 w-5 text-white" />
                </div>
                <div className={`absolute left-4 top-4 text-[3rem] font-black leading-none opacity-[0.06] bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                  {step.step}
                </div>
                <div className="mb-1 text-[0.6rem] font-bold uppercase tracking-widest text-slate-500">الخطوة {step.step}</div>
                <h3 className="mb-2 text-base font-bold text-slate-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="مزايا الباقات" className="relative z-10 border-y border-slate-100 bg-slate-50/80 py-24">
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-violet-300/8 blur-[84px]" />
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-black text-slate-900 md:text-4xl">
              أدوات الصالون الاحترافي
            </motion.h2>
            <p className="mt-3 text-slate-600">كل ما تحتاجه لإدارة حضورك الرقمي باستقلالية تامة</p>
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
            <FeatureCard icon={FileCheck} title="شهادة تفعيل رقمية" desc="وثيقة رقمية صادرة من المنصة بعد كل دفعة — تتضمن كود التفعيل وبيانات الرخصة وفق الحالة المعتمدة." color="from-amber-600 to-orange-500" delay={0.24} />
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="الأسعار" className="relative z-10 py-24">
        <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-amber-300/9 blur-[88px]" />
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-14 text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700">
              <Crown className="h-3 w-3" /> حزم رخصة النفاذ الرقمية
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mb-3 text-3xl font-black text-slate-900 md:text-4xl">
              سعر واضح · لا مفاجآت
            </motion.h2>
            <p className="text-slate-600">مسبقة الدفع · لا تجديد تلقائي · ISIC4 474151</p>
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
                'ظهور عند الطلب للزبائن القريبين',
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
                'بورتفوليو صور غير محدود',
                'تحليلات مفصّلة + تقارير أداء متقدمة',
                `${DIAMOND_PRODUCT_STANDARD_LABEL_AR} | +${DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س إضافة المكتب الخاص 🏛️`,
              ]}
            />
          </div>
          </div>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/85 px-5 py-4 text-right shadow-[0_12px_28px_rgba(245,158,11,0.08)]">
            <p className="text-[0.72rem] font-black tracking-[0.16em] text-amber-800">
              تنبيه امتثال لمحتوى الفيديو
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              عند تفعيل المزايا التي تتضمن عرض الفيديو، يلتزم الصالون بأن تكون المقاطع خالية من أي مخالفات تشريعية أو ملاحظات تمس الذوق العام، بما في ذلك الموسيقى الصاخبة أو تصوير أي زبون أو شخص آخر دون موافقته الخطية الصريحة. وتبقى المسؤولية كاملة على الصالون بوصفه الناشر والمتحكم بمحتوى ملفه، مع خضوع المواد المعروضة لرقابة تقنية صارمة من المنصة.
            </p>
          </div>
          <p className="mt-5 text-center text-[0.68rem] text-slate-700">
            كل حزمة صالحة ٣٠ يوماً · لا وساطة تجارية · لا عمولة على الخدمة · لا بيانات حكومية مطلوبة للتسجيل
          </p>
        </div>
      </section>

      {/* ── Banner preview showcase ───────────────────────────────────────── */}
      <section id="معاينة البنرات" className="relative z-10 border-y border-slate-100 bg-slate-50/75 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-black text-slate-900 md:text-4xl">
              هكذا يظهر صالونك
            </motion.h2>
            <p className="mt-3 text-slate-600">معاينة سريعة للبنرات الثلاث — التفاصيل الكاملة للمناوب والمكتب في صفحة المعاينة</p>
            <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-violet-700/80">{PARTNER_PRODUCT_HUB_OFFICE_ADDON_LINE}</p>
          </div>

          <div className="space-y-16">
            {PARTNER_BANNERS_PREVIEW_TIERS.map((tier, index) => (
              <BannerPreviewTierSection
                key={tier.id}
                tier={tier}
                index={index}
                showCta={false}
                className="border-b border-white/5 pb-16 last:border-b-0 last:pb-0"
              />
            ))}
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {PARTNER_PRODUCT_HUB_SUMMARY_CARDS.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() =>
                  navigate(`${ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW}#${card.sectionId}`)
                }
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-[0_16px_36px_rgba(148,163,184,0.08)] transition-all hover:border-violet-300 hover:bg-violet-50/70"
              >
                <p className="text-2xl">{card.emoji}</p>
                <p className="mt-2 text-base font-black text-slate-900 group-hover:text-violet-800">{card.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{card.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-700 group-hover:text-cyan-800">
                  شاهد المحاكاة
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                </span>
              </button>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => navigate(ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-6 py-3 text-sm font-semibold text-amber-800 transition-all hover:border-amber-300 hover:bg-amber-100"
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
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700">
                <FileCheck className="h-3 w-3" /> بعد كل دفعة — وفق حالة التفعيل
              </div>
              <h2 className="mb-5 text-3xl font-black text-slate-900">شهادة تفعيل تليق بشراكتك</h2>
              <p className="mb-6 text-base leading-relaxed text-slate-600">
                حلاق ماب لا تبيع «اشتراكاً» فقط — تُسلّمك وثيقة رقمية صادرة من المنصة تُثبت ملكيتك لرخصة النفاذ:
                اسم منشأتك، باقتك، تواريخ الصلاحية، و**كود تفعيل فريد** يُبرز كمفتاح رخصتك الرسمي.
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  'كود تفعيل بارز بتنسيق `HM-LIC-XXXX-XXXX-XXXX`',
                  'إصدار بعد اكتمال الدفع وفق حالة التفعيل الحالية',
                  'اسم المنشأة والباقة وصلاحية الرخصة موثّقة',
                  'مرجع رسمي للتحقق والدعم ولوحة التحكم',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600" />
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

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 border-t border-slate-100 py-20">
        <div className="mx-auto max-w-3xl px-5">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mb-10 text-center text-2xl font-black text-slate-900">
            أسئلة الشركاء الشائعة
          </motion.h2>
          <div className="flex flex-col gap-3">
            {[
              { q: 'هل حلاق ماب تأخذ عمولة على كل قصة شعر؟', a: 'لا — حلاق ماب شريكك التقني فقط. تدفع رخصة نفاذ شهرية ثابتة، والعلاقة بين صالونك والزبون مباشرة بدون وسيط أو عمولة.' },
              { q: 'ما معنى "الظهور عند الطلب"؟', a: 'يظهر صالونك في نتائج الاستعلام عندما تتوافق البيانات المتاحة معه مع طلب المستخدم وفلترته المختارة. وهذا يعني أن كل ظهور يمثل فرصة وصول فعلية إلى مستعلم يبحث عن الخدمة المناسبة.' },
              { q: 'كيف أشترك إذا لم تكن المنطقة مغطاة؟', a: 'يمكنك مراسلة الدعم لشرح حالة منطقتك والاطلاع على المسار الأنسب قبل التسجيل.' },
              { q: 'هل يمكنني تغيير باقتي لاحقاً؟', a: 'نعم — عند انتهاء الحزمة الحالية تشتري الباقة الجديدة التي تناسبك. لا عقد ملزم ولا رسوم ترقية.' },
              { q: 'ماذا يحدث عند انتهاء صلاحية الحزمة؟', a: 'يتوقف ظهورك حتى تُجدِّد — بياناتك محفوظة، وتفعيل حزمة جديدة يعيدك بعد اكتمال التفعيل الجديد داخل النظام.' },
              { q: 'هل أحتاج وثائق حكومية للتسجيل؟', a: 'لا — التسجيل يعتمد على بيانات الصالون الأساسية. تعهّدك بأن نشاطك ممتثل للأنظمة هو مسؤوليتك وفق الشروط.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_14px_30px_rgba(148,163,184,0.06)]"
              >
                <button
                  className="flex w-full items-center justify-between px-5 py-4 text-right text-sm font-semibold text-slate-800 hover:text-slate-950"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.q}
                  <ChevronDown className={`h-4 w-4 shrink-0 text-amber-600 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <p className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 overflow-hidden border-t border-slate-100 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-amber-300/10 blur-[96px]" />
          <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-teal-300/9 blur-[84px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="mb-6 text-6xl">✂️</div>
            <h2 className="mb-5 text-3xl font-black text-slate-900 md:text-4xl">
              صالونك جاهز — هل أنت كذلك؟
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-slate-600">
              ابدأ بحزمة برونزية بـ١٠٠ ر.س وجرّب بنفسك —
              إذا لم تُعجبك النتائج خلال ٣٠ يوماً لا يوجد تجديد تلقائي يُربطك.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                onMouseEnter={warmRegisterRoute}
                onFocus={warmRegisterRoute}
                onPointerDown={warmRegisterRoute}
                onTouchStart={warmRegisterRoute}
                onClick={handleRegisterNavigate}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-10 py-4 font-bold text-white shadow-2xl shadow-cyan-500/18 hover:from-teal-400 transition-all"
              >
                <Scissors className="h-5 w-5" /> سجّل صالونك الآن
              </button>
              <button
                onClick={() => navigate(ROUTE_PATHS.HOSPITALITY_B2B_REQUEST)}
                className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-8 py-4 font-semibold text-sky-800 hover:border-sky-300 hover:bg-sky-100 transition-all"
              >
                <QrCode className="h-4 w-4" /> طلب ضيافة B2B (فنادق/شقق)
              </button>
              <button
                onClick={() => navigate(ROUTE_PATHS.PARTNER_WHY)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-800 hover:border-slate-300 transition-all"
              >
                اقرأ قصة المنصة <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-100 bg-white/80 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
            <div dir="rtl">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-700">
                  <Scissors className="h-4 w-4 text-black" />
                </div>
                <span className="text-base font-black text-slate-900">حلاق ماب — مسار الشركاء</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                {PLATFORM_B2B_TECHNICAL_PARTNER_ROLE_AR}
                <span className="mt-2 block">
                  مزوّد حلول تقنية · {PARTNER_TECHNICAL_PARTNER_LABEL_AR} · ISIC4 474151 · المملكة العربية السعودية — ليست وسيطاً تجارياً.
                </span>
              </p>
            </div>
            <div dir="rtl">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">مسار الشركاء</h4>
              <div className="flex flex-col gap-2.5 text-sm text-slate-600">
                {[
                  { label: 'التسجيل', to: ROUTE_PATHS.REGISTER },
                  { label: 'الباقات والأسعار', to: ROUTE_PATHS.SUBSCRIPTION_POLICY },
                  { label: 'طلب ضيافة B2B (فنادق/شقق)', to: ROUTE_PATHS.HOSPITALITY_B2B_REQUEST },
                  { label: 'سياسة الحزم', to: ROUTE_PATHS.SUBSCRIPTION_POLICY },
                  { label: 'مكتب مدير المبيعات', to: ROUTE_PATHS.PARTNER_SALES_OFFICE },
                  { label: 'خدمة العملاء', to: ROUTE_PATHS.PARTNER_SUPPORT },
                  { label: 'خصوصية الشركاء', to: ROUTE_PATHS.PARTNER_PRIVACY },
                ].map((link) => (
                  <Link key={link.label} to={link.to} className="hover:text-amber-700 transition-colors">{link.label}</Link>
                ))}
              </div>
            </div>
            <div dir="rtl">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">المستخدمون</h4>
              <div className="flex flex-col gap-2.5">
                <Link
                  to={ROUTE_PATHS.HOME}
                  onMouseEnter={warmHomeRoute}
                  onFocus={warmHomeRoute}
                  onPointerDown={warmHomeRoute}
                  onTouchStart={warmHomeRoute}
                  className="text-sm text-slate-600 hover:text-teal-700 transition-colors"
                >
                  ابحث عن حلاق ↗
                </Link>
                <Link to={ROUTE_PATHS.USER_PRIVACY_POLICY} className="text-sm text-slate-600 hover:text-teal-700">سياسة الخصوصية</Link>
                <Link to={ROUTE_PATHS.TERMS_OF_SERVICE} className="text-sm text-slate-600 hover:text-teal-700">شروط الاستخدام</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center gap-2 border-t border-slate-100 pt-8 text-center text-[0.7rem] text-slate-500 md:flex-row md:justify-between">
            <span>© ٢٠٢٦ حلاق ماب — جميع الحقوق محفوظة</span>
            <span className="text-slate-500">مزوّد حلول تقنية · ISIC4 474151 · المملكة العربية السعودية</span>
          </div>
          <div className="mt-2 text-center text-sm font-bold text-slate-700 sm:text-base">
            تراخيص الهيئة العامة لتنظيم الإعلام 167220 - 167221 - 167222
          </div>
        </div>
      </footer>
      </>
      )}
    </div>
  );
}
