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

function formatEnglishNumber(value: number): string {
  return value.toLocaleString('en-US');
}

// ─── Founders Offer Banner — العرض التشغيلي التأسيسي لمضاعفة الرخص ────────
const PRICE_B = 100, PRICE_G = 150, PRICE_D = 200, PRICE_DA = 225;

const PIONEER_TOTAL = 1000; // ألف الرواد — الحد التأسيسي الأقصى

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
  const [spots, setSpots] = useState(731);
  const [pulse, setPulse] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    const tick = () => {
      if (Math.random() < 0.45) {
        setPulse(true);
        setSpots(s => Math.max(1, s - 1));
        setTimeout(() => setPulse(false), 700);
      }
    };
    const t = setInterval(tick, 10000 + Math.random() * 8000);
    return () => clearInterval(t);
  }, []);

  const pct = Math.round(((PIONEER_TOTAL - spots) / PIONEER_TOTAL) * 100);

  const TIERS = [
    { n: 3,  emoji: '🎁', label: 'اشترِ 3 حزم', bonus: '+ 3 مجاناً', subtitle: '6 أشهر حضور رقمي',
      accentFrom: '#92400e', accentTo: '#d97706', border: 'rgba(217,119,6,0.38)', glow: 'rgba(217,119,6,0.22)' },
    { n: 6,  emoji: '🔥', label: 'اشترِ 6 حزم', bonus: '+ 6 مجاناً', subtitle: 'سنة كاملة على الرادار', best: true,
      accentFrom: '#b45309', accentTo: '#fbbf24', border: 'rgba(251,191,36,0.50)', glow: 'rgba(251,191,36,0.30)' },
    { n: 12, emoji: '⚡', label: 'اشترِ 12 حزمة', bonus: '+ 12 مجاناً', subtitle: 'سنتان بسعر سنة واحدة',
      accentFrom: '#1e3a5f', accentTo: '#06b6d4', border: 'rgba(6,182,212,0.40)', glow: 'rgba(6,182,212,0.22)' },
  ];

  const plans = [
    { name: 'برونزي',     price: PRICE_B,  color: '#b45309' },
    { name: 'ذهبي',       price: PRICE_G,  color: '#fbbf24' },
    { name: 'ماسي',       price: PRICE_D,  color: '#22d3ee' },
    { name: 'ماسي+مكتب', price: PRICE_DA, color: '#a78bfa' },
  ];

  return (
    <motion.div
      ref={ref}
      dir="rtl"
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative mb-12 overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(160deg,#fffdf8 0%,#f8fbff 52%,#fffaf1 100%)',
        border: '1px solid rgba(251,191,36,0.28)',
        boxShadow: '0 20px 50px rgba(148,163,184,0.12), inset 0 1px 0 rgba(255,255,255,0.88)',
      }}
    >
      {/* خلفية سديمية */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-1/4 h-64 w-96 rounded-full bg-amber-400/6 blur-[72px]" />
        <div className="absolute -bottom-16 left-1/4 h-48 w-80 rounded-full bg-cyan-400/5 blur-[64px]" />
        <motion.div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg,transparent 30%,rgba(251,191,36,0.03) 50%,transparent 70%)' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
        />
      </div>

      {/* ══ رأسية القسم ══ */}
      <div className="relative border-b border-amber-200/80 px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          {/* العنوان */}
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-[0.62rem] font-black tracking-[0.15em] text-amber-700">
              <motion.span animate={{ scale: [1,1.35,1], opacity:[0.6,1,0.6] }} transition={{ duration: 1.8, repeat: Infinity }}>⚡</motion.span>
              عرض تشغيلي مؤقت · الألف الرواد
            </div>
            <h3 className="text-2xl font-black text-slate-900 md:text-3xl">
              مضاعفة الرخص التأسيسية
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              اشترِ أي حزمة واحصل على ضعفها مجاناً — ينطبق على جميع الباقات
            </p>
          </div>

          {/* عداد المقاعد */}
          <motion.div
            animate={pulse ? { scale:[1,1.08,1] } : {}}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 overflow-hidden rounded-2xl border px-5 py-3.5 transition-all duration-500"
            style={{
              borderColor: pulse ? 'rgba(239,68,68,0.28)' : 'rgba(251,191,36,0.24)',
              background: pulse ? 'rgba(254,242,242,0.96)' : 'rgba(255,251,235,0.92)',
              boxShadow: pulse ? '0 12px 28px rgba(239,68,68,0.10)' : '0 12px 26px rgba(245,158,11,0.08)',
            }}
          >
            <div className="text-right leading-tight">
              <div className={`font-mono text-3xl font-black tabular-nums ${pulse ? 'text-red-600' : 'text-amber-700'}`}>
                {spots}
              </div>
              <div className="text-[0.6rem] text-slate-600">رائد متبقٍ</div>
              <div className="text-[0.52rem] text-slate-500">من ألف الرواد</div>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                className={`h-2.5 w-2.5 rounded-full ${pulse ? 'bg-red-400' : 'bg-amber-400'}`}
                animate={{ opacity:[0.3,1,0.3] }} transition={{ duration: 1.2, repeat: Infinity }}
                style={{ boxShadow: pulse ? '0 0 8px rgba(239,68,68,0.7)' : '0 0 8px rgba(251,191,36,0.7)' }}
              />
              <span className="rotate-90 text-[0.48rem] font-bold tracking-widest text-slate-500">LIVE</span>
            </div>
          </motion.div>
        </div>

        {/* شريط التقدم */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-[0.62rem]">
            <span className="text-slate-500">0 مشترك</span>
            <span className={`font-black ${pct >= 80 ? 'text-red-600' : 'text-amber-700'}`}>{pct}% مُحجوز</span>
            <span className="text-slate-500">1000 رائد</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: pct >= 80
                  ? 'linear-gradient(90deg,#ef4444,#f97316)'
                  : 'linear-gradient(90deg,#b45309,#fbbf24,#fde68a)',
                boxShadow: pct >= 80 ? '0 0 12px rgba(239,68,68,0.6)' : '0 0 12px rgba(251,191,36,0.55)',
              }}
              initial={{ width: 0 }}
              animate={inView ? { width: `${pct}%` } : {}}
              transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* ══ كروت مستويات المضاعفة ══ */}
      <div className="relative px-6 py-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left,rgba(251,191,36,0.25),transparent)' }} />
          <span className="text-[0.65rem] font-black tracking-[0.2em] text-amber-700/70">مستويات المضاعفة</span>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right,rgba(251,191,36,0.25),transparent)' }} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TIERS.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.55 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl"
              style={{
                border: `1px solid ${tier.border}`,
                background: `linear-gradient(155deg,${tier.accentFrom}12 0%,rgba(255,255,255,0.96) 48%,${tier.accentTo}10 100%)`,
                boxShadow: tier.best
                  ? `0 18px 42px rgba(148,163,184,0.14),0 0 22px ${tier.glow},inset 0 1px 0 rgba(255,255,255,0.9)`
                  : `0 16px 34px rgba(148,163,184,0.10),inset 0 1px 0 rgba(255,255,255,0.85)`,
                backdropFilter: 'blur(18px)',
              }}
            >
              {/* زجاج لامع — طبقة علوية */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl"
                style={{ background: `linear-gradient(180deg,${tier.accentTo}18 0%,transparent 100%)` }} />
              <div className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 50%,rgba(255,255,255,0.02) 100%)' }} />

              {/* شارة الأفضل */}
              {tier.best && (
                <div className="absolute left-0 right-0 top-0 flex justify-center">
                  <div className="rounded-b-xl px-5 py-1 text-[0.62rem] font-black text-black"
                    style={{ background: `linear-gradient(90deg,${tier.accentFrom},${tier.accentTo})`, boxShadow: `0 8px 18px ${tier.glow}` }}>
                    الأفضل
                  </div>
                </div>
              )}

              {/* توهج hover */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(ellipse 80% 80% at 50% 50%,${tier.accentTo}18,transparent)` }} />

              <div className={`relative flex flex-col gap-4 p-5 ${tier.best ? 'pt-8' : 'pt-5'}`}>
                {/* العنوان + المكافأة */}
                <div>
                  <p className="text-base font-black text-slate-900">{tier.label}</p>
                  <div className="mt-1 inline-flex rounded-full px-3 py-0.5 text-[0.68rem] font-black"
                    style={{ background: `${tier.accentTo}20`, color: tier.accentTo, border: `1px solid ${tier.border}` }}>
                    {tier.bonus}
                  </div>
                  <p className="mt-1 text-[0.68rem] text-slate-600">{tier.subtitle}</p>
                </div>

                {/* الفاصل */}
                <div className="h-px" style={{ background: `linear-gradient(90deg,transparent,${tier.border},transparent)` }} />

                {/* الأرقام — كبيرة بدون إيموجي */}
                <div className="grid grid-cols-2 gap-2">
                  {plans.map(plan => (
                    <div key={plan.name}
                      className="relative overflow-hidden flex flex-col items-center justify-center rounded-2xl py-3.5"
                      style={{
                        background: `linear-gradient(155deg,${plan.color}10 0%,rgba(255,255,255,0.98) 100%)`,
                        border: `1px solid ${plan.color}28`,
                        backdropFilter: 'blur(8px)',
                        boxShadow: `inset 0 1px 0 ${plan.color}20`,
                      }}
                    >
                      {/* بريق زجاجي داخلي */}
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
                        style={{ background: `linear-gradient(180deg,${plan.color}12 0%,transparent 100%)` }} />
                      <span
                        className="relative font-mono text-2xl font-black tabular-nums leading-none"
                        style={{ color: plan.color, textShadow: `0 0 20px ${plan.color}80` }}
                      >
                        {formatEnglishNumber(plan.price * tier.n)}
                      </span>
                      <span className="mt-1 text-[0.55rem] font-bold text-slate-500">ر.س · {plan.name}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <motion.button type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onRegister}
                  className="relative mt-1 w-full overflow-hidden rounded-xl py-3 text-sm font-black"
                  style={{
                    background: `linear-gradient(135deg,${tier.accentFrom},${tier.accentTo})`,
                    color: tier.best ? '#000' : '#fff',
                    boxShadow: `0 0 24px ${tier.glow},0 4px 12px ${tier.glow}`,
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    احجز مقعدك
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ══ الفوتر ══ */}
      <div className="relative border-t border-amber-400/10 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[0.65rem] text-slate-600">
            <span className="flex items-center gap-1.5"><span className="text-emerald-600">✅</span>ينطبق على جميع الباقات</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-600">✅</span>لا عمولات على خدماتك</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-600">✅</span>ظهور ذكي عند الطلب</span>
            <span className="flex items-center gap-1.5">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-px text-[0.6rem] font-bold text-amber-700">⭐ شارة رائد</span>
              لكل مشترك من ١ إلى ١٠٠٠ — حصرية للأبد
            </span>
          </div>
          <p className="text-[0.58rem] text-amber-700/70">
            🚨 يُغلق العرض فور اكتمال الألف رائد
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// BarberCardPreview حُذِف — يستخدم EndUserBarberBannerSim الحقيقي الآن

// ─── Feature card ────────────────────────────────────────────────────────────
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

// ─── قسم الحزم السنوية — تصميم موحّد وواضح ────────────────────────────────────
function AnnualPackagesSection({ navigate }: { navigate: (to: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const TIERS = [
    {
      id: 'bronze',
      icon: 'bronze' as const,
      name: 'البرونزي',
      nameEn: 'BRONZE',
      color: '#b45309',
      border: 'border-amber-700/35',
      bg: 'from-amber-950/40 to-[#060d1a]',
      glow: '0 0 30px rgba(180,83,9,0.12)',
      price: PRICE_B * 12,
      perMonth: PRICE_B,
      saving: PRICE_B * 12,
      features: ['ظهور عند الطلب', 'بطاقة صالون كاملة', 'حالة مفتوح/مغلق', 'شارة رائد ⭐'],
    },
    {
      id: 'gold',
      icon: 'gold' as const,
      name: 'الذهبي',
      nameEn: 'GOLD',
      color: '#f59e0b',
      border: 'border-amber-400/45',
      bg: 'from-amber-900/30 to-[#060d1a]',
      glow: '0 0 40px rgba(245,158,11,0.15)',
      price: PRICE_G * 12,
      perMonth: PRICE_G,
      saving: PRICE_G * 12,
      best: true,
      features: ['أولوية ذهبية في النتائج', 'معرض ٢٠ صورة + QR', 'إحصاءات شهرية', 'شارة رائد ⭐'],
    },
    {
      id: 'diamond',
      icon: 'diamond' as const,
      name: 'الماسي',
      nameEn: 'DIAMOND',
      color: '#22d3ee',
      border: 'border-cyan-400/35',
      bg: 'from-cyan-950/30 to-[#060d1a]',
      glow: '0 0 35px rgba(34,211,238,0.12)',
      price: PRICE_D * 12,
      perMonth: PRICE_D,
      saving: PRICE_D * 12,
      features: ['صدارة المنطقة', 'معرض ٤٠ صورة', 'بورتفوليو + شات', 'شارة رائد ⭐'],
    },
    {
      id: 'diamond-office',
      icon: 'office' as const,
      name: 'الماسي + المكتب',
      nameEn: 'DIAMOND PRO',
      color: '#a78bfa',
      border: 'border-violet-400/35',
      bg: 'from-violet-950/30 to-[#060d1a]',
      glow: '0 0 35px rgba(167,139,250,0.12)',
      price: PRICE_DA * 12,
      perMonth: PRICE_DA,
      saving: PRICE_DA * 12,
      addon: true,
      features: ['كل مزايا الماسي', 'مساعد داخلي 🏛️', 'مناوب شات ذكي', 'تقارير + تعليمات'],
    },
  ];

  const handleBuy = (tierId: string) => {
    const tierMap: Record<string, 'bronze' | 'gold' | 'diamond'> = {
      'bronze': 'bronze', 'gold': 'gold', 'diamond': 'diamond', 'diamond-office': 'diamond',
    };
    const tier = tierMap[tierId] ?? 'gold';
    const isOffice = tierId === 'diamond-office';
    setConfirming(true);
    setTimeout(() => {
      routeToBuyPackage(navigate, { tier, plan: 'annual', digitalShiftAddon: isOffice });
      setConfirming(false);
    }, 250);
  };

  const selectedTier = TIERS.find(t => t.id === selected);

  return (
    <section id="الحزم-السنوية" className="relative z-10 overflow-visible border-t border-sky-100 py-20 md:py-28">

      <div className="relative mx-auto max-w-6xl overflow-visible px-4 sm:px-5">
        {/* رأس القسم */}
        <div className="mb-14 text-center">
          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-black text-amber-700">
            ⚡ العرض التأسيسي لمضاعفة الرخص · الألف الرواد
          </motion.div>
          <motion.h2 initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="mb-3 text-3xl font-black text-slate-900 md:text-4xl">
            الحزمة السنوية — 360 يوم + 360 مجاناً
          </motion.h2>
          <p className="text-sm text-slate-600">اختر حزمتك · سجّل حسابك · ادفع وتفعَّل فوراً</p>

          {/* مراحل الشراء */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-0">
            {['اختر الحزمة','سجّل حسابك','أكمل الدفع','تفعيل فوري'].map((step, i, arr) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.62rem] font-bold ${
                  i === 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  i === 3 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  'bg-white text-slate-600 border border-slate-200'
                }`}>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-current/20 text-[0.5rem] font-black">{i+1}</span>
                  {step}
                </div>
                {i < arr.length - 1 && <span className="mx-1 text-slate-400 text-xs">›</span>}
              </div>
            ))}
          </div>
        </div>

        {/* البطاقات */}
        <div className="banner-radiation-stage">
        <div className="banner-radiation-grid relative z-[1] grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-5">
          {TIERS.map((t, i) => {
            const isSelected = selected === t.id;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay: i * 0.07 }}
                onClick={() => setSelected(t.id)}
                className="relative z-[1] cursor-pointer"
              >
              <BannerRadiationField tier={bannerRadiationTierFromId(t.id)}>
              <div
                className={`banner-major-card-face relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isSelected ? `${t.border} ring-2 ring-offset-2 ring-offset-[#f8fbff]` : `${t.border} opacity-95 hover:opacity-100`
                }`}
                dir="rtl"
              >
                {t.best && !isSelected && (
                  <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl px-2.5 py-0.5 text-[0.52rem] font-black text-black"
                    style={{ background: t.color }}>
                    الأعلى طلباً
                  </div>
                )}

                {/* بانر الأيقونة */}
                <div className="relative flex h-24 items-center justify-center overflow-hidden border-b border-slate-100"
                  style={{ background: `radial-gradient(ellipse at center, ${t.color}18 0%, transparent 70%)` }}>
                  <motion.div animate={isSelected ? { scale:[1,1.12,1] } : {}} transition={{ duration:1.5, repeat: isSelected ? Infinity : 0 }}>
                    <TierIcon tier={t.icon} />
                  </motion.div>
                  <div className="absolute bottom-2 right-3">
                    <span className="text-[0.48rem] font-black tracking-[0.3em] opacity-30" style={{ color: t.color }}>{t.nameEn}</span>
                  </div>
                  {/* مؤشر الاختيار */}
                  <div className={`absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected ? 'border-current bg-current/20' : 'border-slate-200 bg-white'
                  }`} style={{ borderColor: isSelected ? t.color : undefined }}>
                    {isSelected && <div className="h-2 w-2 rounded-full" style={{ background: t.color }} />}
                  </div>
                </div>

                {/* محتوى البطاقة */}
                <div className="banner-major-card-copy flex flex-1 flex-col p-4">
                  <p className="mb-0.5 text-xs font-black text-slate-900">{t.name}</p>
                  <p className="mb-3 text-[0.52rem] text-slate-500">360 يوم · ISIC4 474151</p>

                  {/* السعر */}
                  <div className="mb-1 flex items-end gap-1">
                    <span className="text-2xl font-black tabular-nums text-slate-900">
                      {formatEnglishNumber(t.price)}
                    </span>
                    <span className="mb-0.5 text-[0.58rem] text-slate-500">ر.س / سنة</span>
                  </div>
                  <p className="mb-3 text-[0.55rem] text-slate-500">{formatEnglishNumber(t.perMonth)} ر.س/شهر × 12 شهراً</p>

                  {/* مضاعفة العرض */}
                  <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-center">
                    <p className="mb-1 text-[0.52rem] font-black uppercase tracking-wider text-amber-700">⚡ عرض المضاعفة</p>
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-center">
                        <p className="text-[0.6rem] font-black text-slate-900">{formatEnglishNumber(t.price)}</p>
                        <p className="text-[0.45rem] text-slate-500">تدفع</p>
                      </div>
                      <span className="text-[0.6rem] text-slate-500">→</span>
                      <div className="text-center">
                        <p className="text-[0.6rem] font-black text-emerald-700">24 شهر</p>
                        <p className="text-[0.45rem] text-slate-500">تحصل</p>
                      </div>
                      <div className="rounded-lg border border-emerald-200 bg-white px-1.5 py-1">
                        <p className="text-[0.45rem] text-slate-500">توفير</p>
                        <p className="text-[0.62rem] font-black text-emerald-700">{formatEnglishNumber(t.saving)}</p>
                      </div>
                    </div>
                  </div>

                  {/* الميزات */}
                  <ul className="mb-4 flex flex-1 flex-col gap-1.5">
                    {t.features.map(f => (
                      <li key={f} className="flex items-center gap-1.5 text-[0.65rem] text-slate-700">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* زر الاختيار — نقرة واحدة → تحديد، والشراء من الشريط السفلي */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(t.id); }}
                    className={`mt-auto w-full rounded-xl py-2.5 text-[0.72rem] font-black transition-all hover:scale-[1.01] active:scale-[0.98] ${
                      isSelected ? '' : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                    style={
                      isSelected
                        ? {
                            background: t.color,
                            color: '#000',
                            border: `1.5px solid ${t.color}`,
                            boxShadow: `0 4px 20px ${t.color}45`,
                          }
                        : undefined
                    }
                  >
                    {isSelected ? '✓ محدد' : 'اختر هذه الحزمة'}
                  </button>
                </div>
              </div>
              </BannerRadiationField>
              </motion.div>
            );
          })}
        </div>
        </div>

        {/* ── شريط التأكيد والانتقال — يظهر عند الاختيار ── */}
        <AnimatePresence>
          {selected && selectedTier && (
            <motion.div
              initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:16 }}
              transition={{ type:'spring', stiffness:320, damping:28 }}
              className="sticky bottom-6 z-30 mt-6 overflow-hidden rounded-2xl border"
              style={{ borderColor: `${selectedTier.color}50`, boxShadow: `0 8px 40px ${selectedTier.color}25` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
                style={{ background: `linear-gradient(135deg, ${selectedTier.color}18 0%, rgba(255,255,255,0.96) 60%)` }}>
                <div className="flex items-center gap-3">
                  <TierIcon tier={selectedTier.icon} />
                  <div>
                    <p className="text-xs font-bold text-slate-500">الحزمة المختارة</p>
                    <p className="text-base font-black text-slate-900">{selectedTier.name} — {formatEnglishNumber(selectedTier.price)} ر.س/سنة</p>
                    <p className="text-[0.6rem] text-emerald-700">⚡ تدفع 12 شهراً وتحصل على 24 · توفير {formatEnglishNumber(selectedTier.saving)} ر.س</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelected(null)}
                    className="text-[0.65rem] text-slate-500 hover:text-slate-700 transition-colors">
                    تغيير
                  </button>
                  <motion.button
                    onClick={() => handleBuy(selected)}
                    disabled={confirming}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-black transition-all disabled:opacity-70"
                    style={{ background: selectedTier.color, boxShadow: `0 4px 20px ${selectedTier.color}50` }}
                  >
                    {confirming ? (
                      <span className="inline-block h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    ) : null}
                    ابدأ تعبئة الطلب ←
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* شارة رائد + ملاحظات */}
        <div className="mt-10 space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-5 py-2 text-[0.68rem] font-bold text-slate-950">
            ⭐ كل مشترك من ١ إلى ١٠٠٠ يحصل على شارة رائد لامعة على بنره — دون تمييز بين الباقات
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-[0.6rem] text-slate-600">
            {['لا عمولات على الخدمة','مسبقة الدفع','لا تجديد تلقائي','تفعيل فوري بعد السداد','ISIC4 474151'].map(n => (
              <span key={n} className="flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-slate-700" /> {n}
              </span>
            ))}
          </div>
          {/* تلميح مراحل الشراء */}
          <p className="mt-2 text-[0.82rem] text-slate-700">
            ✅ التفعيل بعد اتمام تعبئة طلب التسجيل وإتمام الدفع
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Digital certificate mockup ──────────────────────────────────────────────
type CertificateMockTier = 'bronze' | 'gold' | 'diamond';

const CERTIFICATE_MOCK_DATA: Record<
  CertificateMockTier,
  {
    activationCode: string;
    salonName: string;
    responseModel: string;
    issuedAt: string;
    validUntil: string;
    statusLabel: string;
    statusTone: string;
    accentBorder: string;
    accentGlow: string;
    badgeTone: string;
    footerTone: string;
  }
> = {
  bronze: {
    activationCode: 'HM-LIC-BRZ-4F2M-8Q1L',
    salonName: 'صالون الرواد للحلاقة',
    responseModel: 'الظهور الأساسي عند الطلب',
    issuedAt: '١٨ مايو ٢٠٢٦',
    validUntil: '١٧ يونيو ٢٠٢٦',
    statusLabel: 'مفعّلة — برونزي',
    statusTone: 'text-amber-200',
    accentBorder: 'border-amber-400/45',
    accentGlow: 'from-amber-950/45 via-[#120a00] to-black/60',
    badgeTone: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
    footerTone: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  },
  gold: {
    activationCode: 'HM-LIC-GLD-A3F9-K2M1',
    salonName: 'صالون ستايل برو للرجال',
    responseModel: 'الظهور الذهبي عند الطلب',
    issuedAt: '٢٣ مايو ٢٠٢٦',
    validUntil: '٢٢ يونيو ٢٠٢٦',
    statusLabel: 'مفعّلة — ذهبي',
    statusTone: 'text-amber-200',
    accentBorder: 'border-amber-400/45',
    accentGlow: 'from-amber-950/50 via-[#120a00] to-black/60',
    badgeTone: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
    footerTone: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-200',
  },
  diamond: {
    activationCode: 'HM-LIC-DMD-V8R2-X6P4',
    salonName: 'صالون العرض الماسي',
    responseModel: 'الصدارة الذكية + البورتفوليو الماسي',
    issuedAt: '٢٦ مايو ٢٠٢٦',
    validUntil: '٢٥ يونيو ٢٠٢٦',
    statusLabel: 'مفعّلة — ماسي',
    statusTone: 'text-cyan-200',
    accentBorder: 'border-cyan-400/40',
    accentGlow: 'from-cyan-950/35 via-[#07141a] to-black/55',
    badgeTone: 'border-cyan-400/25 bg-cyan-500/10 text-cyan-100',
    footerTone: 'border-cyan-300/28 bg-cyan-500/10 text-cyan-100',
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
                <h3 className="text-base font-black text-white sm:text-lg">شهادة تفعيل رقمية معتمدة</h3>
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
                    { label: 'الحزم السنوية', id: 'الحزم-السنوية' },
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
                          مكتب مستقل يشرح الباقات، مضاعفة الرخص، والعائد التجاري بلغة أقرب للصالونات والمنشآت.
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
                  منصة تجعل صالونك أقرب للعميل حين يبحث فعلاً عن حلاق قريب. ابدأ الآن بخطوة واضحة وسريعة.
                </p>
                <div className="mb-5 rounded-[1.35rem] border border-emerald-200 bg-white/92 p-4 shadow-sm">
                  <p className="text-[0.78rem] font-black text-emerald-700">قرار سريع</p>
                  <p className="mt-1 text-[0.9rem] leading-7 text-slate-600">
                    اختر التسجيل مباشرة، أو افتح مكتب المبيعات إذا أردت شرح الباقات والعائد قبل البدء.
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
              ٤ خطوات — التفعيل آلي وفوري
            </motion.h2>
            <p className="mt-2 text-sm font-semibold text-emerald-700">✅ لا مراجعة إدارية · لا انتظار · تفعيل فوري بعد السداد</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '١', icon: Scissors, title: 'أكمل نموذج التسجيل', desc: 'بيانات صالونك الأساسية: الاسم، الموقع، الخدمات، صور الواجهة — في دقائق.', color: 'from-amber-500 to-yellow-500' },
              { step: '٢', icon: Crown, title: 'اختر حزمتك', desc: 'برونزي (١٠٠ ر.س) · ذهبي (١٥٠ ر.س) · ماسي (٢٠٠ ر.س) — أو الحزمة السنوية بعرض المضاعفة.', color: 'from-violet-500 to-purple-500' },
              { step: '٣', icon: Shield, title: 'ادفع بأمان فوراً', desc: 'عبر بوابة ميسر الآمنة (مدى · فيزا · ماستركارد) — اتصال HTTPS/TLS بتقييم SSL Labs A+، مسبقة الدفع، لا تجديد تلقائي.', color: 'from-teal-500 to-cyan-500' },
              { step: '٤', icon: Wifi, title: 'ظهورك يبدأ فوراً ⚡', desc: 'بمجرد نجاح السداد يُفعَّل صالونك تلقائياً ويظهر للمستخدمين المناسبين ضمن الاستعلام اللحظي.', color: 'from-emerald-500 to-green-500' },
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
            <FeatureCard icon={Brain} title="إضافة المكتب الخاص 🏛️" desc="مساعد داخلي + مناوب شات مترابطان — أعطِ تعليماتك، المناوب ينفّذها، والتقارير تصلك فوراً." color="from-violet-600 to-indigo-600" delay={0.24} badge="Diamond Add-on" />
            <FeatureCard icon={Users} title="خدمة كبار السن وذوي الاحتياجات" desc="إعلان موجَّه لشريحة لا تجدها في أي منصة أخرى — ميزة تنافسية حقيقية." color="from-sky-500 to-blue-400" delay={0.08} badge="Gold +" />
            <FeatureCard icon={QrCode} title="بورتفوليو صور" desc="اعرض أعمالك الفعلية — المزيد من الصور = المزيد من الثقة قبل الزيارة." color="from-orange-500 to-red-500" delay={0.16} badge="Diamond +" />
            <FeatureCard icon={FileCheck} title="شهادة تفعيل معتمدة" desc="وثيقة رقمية رسمية بعد كل دفعة — كود تفعيل بارز، بيانات الرخصة، واهتمام حلاق ماب بمنتجها." color="from-amber-600 to-orange-500" delay={0.24} />
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

          {/* ── العرض التأسيسي لمضاعفة الرخص ── */}
          <FoundersOfferBanner onRegister={() => {
            document.getElementById('الحزم-السنوية')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }} />

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

      {/* ══ الحزم السنوية — مضاعفة الرخص التأسيسية ══════════════════════════ */}
      <AnnualPackagesSection navigate={navigate} />

      {/* ══ كان هنا قسم الحزم السنوية القديم — مُحذوف نهائياً ══ */}
      <section id="الحزم-السنوية_REMOVED" style={{ display: 'none' }}>
        <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-[50%] rounded-full bg-amber-400/4 blur-[84px]" />
        <div className="mx-auto max-w-6xl px-5">
          {/* رأس القسم */}
          <div className="mb-12 text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/12 px-4 py-1.5 text-xs font-black text-amber-300">
              ⚡ العرض التأسيسي لمضاعفة الرخص · رواد الألف
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mb-2 text-3xl font-black text-white md:text-4xl">
              الحزمة السنوية — ٣٦٠ يوم متواصل
            </motion.h2>
            <p className="text-slate-400">اشترِ سنة واحصل على سنة مجاناً — ٢ سنة بسعر ١</p>
          </div>

          {/* بطاقات الحزم السنوية */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                badge: '🥉', name: 'برونزي سنوي', price: PRICE_B * 12,
                accent: 'text-amber-700', ring: 'border-amber-700/30',
                saving: PRICE_B * 12, months: '٢٤', tierQuery: 'bronze',
                perMonth: PRICE_B,
              },
              {
                badge: '🥇', name: 'ذهبي سنوي', price: PRICE_G * 12,
                accent: 'text-amber-400', ring: 'border-amber-400/40',
                saving: PRICE_G * 12, months: '٢٤', tierQuery: 'gold',
                best: true, perMonth: PRICE_G,
              },
              {
                badge: '💎', name: 'ماسي سنوي', price: PRICE_D * 12,
                accent: 'text-cyan-400', ring: 'border-cyan-400/30',
                saving: PRICE_D * 12, months: '٢٤', tierQuery: 'diamond',
                perMonth: PRICE_D,
              },
              {
                badge: '💎🌙', name: 'ماسي + مناوب', price: PRICE_DA * 12,
                accent: 'text-violet-400', ring: 'border-violet-400/30',
                saving: PRICE_DA * 12, months: '٢٤', tierQuery: 'diamond',
                perMonth: PRICE_DA, addon: true,
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative flex flex-col rounded-2xl border p-5 transition-all hover:-translate-y-1
                  ${t.best
                    ? 'border-amber-400/50 bg-gradient-to-b from-amber-500/12 to-[#0a1020] shadow-[0_0_40px_rgba(251,191,36,0.10)]'
                    : `${t.ring} bg-gradient-to-b from-white/[0.04] to-[#060d1a]`}`}
                dir="rtl"
              >
                {t.best && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-3 py-0.5 text-[0.6rem] font-black text-black">
                    الأعلى طلباً
                  </div>
                )}
                {/* الرأس */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">{t.badge}</span>
                  <div>
                    <div className={`text-sm font-black ${t.accent}`}>{t.name}</div>
                    <div className="text-[0.55rem] text-slate-600">360 يوم · ISIC4 474151</div>
                  </div>
                </div>
                {/* السعر */}
                <div className="mb-1 flex items-end gap-1">
                  <span className={`text-3xl font-black tabular-nums ${t.accent}`}>
                    {t.price.toLocaleString('ar-SA')}
                  </span>
                  <span className="mb-0.5 text-[0.62rem] text-slate-400">ر.س / سنة</span>
                </div>
                <p className="mb-4 text-[0.6rem] text-slate-500">= {t.perMonth} ر.س/شهر × ١٢ شهراً</p>

                {/* صندوق مضاعفة العرض التأسيسي */}
                <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-500/8 px-3 py-3">
                  <div className="mb-1 text-[0.6rem] font-black uppercase tracking-wider text-amber-400/70">⚡ عرض المضاعفة</div>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-xs font-black text-white">تدفع</div>
                      <div className={`text-base font-black tabular-nums ${t.accent}`}>{t.price.toLocaleString('ar-SA')}</div>
                      <div className="text-[0.52rem] text-slate-500">ر.س</div>
                    </div>
                    <div className="text-amber-400 text-lg font-black">→</div>
                    <div className="text-center">
                      <div className="text-xs font-black text-white">تحصل</div>
                      <div className="text-base font-black text-emerald-400">{t.months} شهر</div>
                      <div className="text-[0.52rem] text-slate-500">حضور رقمي</div>
                    </div>
                    <div className="text-center rounded-lg bg-emerald-500/15 border border-emerald-400/25 px-2 py-1">
                      <div className="text-[0.5rem] text-emerald-400/70">توفير</div>
                      <div className="text-sm font-black text-emerald-400">{t.saving.toLocaleString('ar-SA')}</div>
                      <div className="text-[0.5rem] text-emerald-400/70">ر.س</div>
                    </div>
                  </div>
                </div>

                {t.addon && (
                  <div className="mb-3 rounded-lg border border-violet-400/20 bg-violet-500/8 px-2 py-1.5 text-[0.6rem] text-violet-300">
                    🏛️ إضافة المكتب الخاص — مساعد داخلي ومناوب شات مترابطان، تعليماتك تُنفَّذ والتقارير تصلك
                  </div>
                )}

                <button
                  onClick={() => navigate(`${ROUTE_PATHS.REGISTER}?tier=${t.tierQuery}&plan=annual`)}
                  className={`mt-auto w-full rounded-xl py-2.5 text-sm font-black transition-all
                    ${t.best
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:from-amber-300'
                      : `border ${t.ring} bg-white/5 text-white hover:bg-white/10`}`}
                >
                  احجز مقعدك ←
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 space-y-2 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-[0.65rem] font-bold text-amber-300">
              ⭐ كل مشترك من الأوائل الألف يحصل على شارة رائد لامعة على بنره — دون تمييز بين الباقات
            </div>
            <p className="text-[0.62rem] text-slate-700">
              العرض مؤقت · حصري للألف الرواد · لا عمولة · مسبقة الدفع · لا تجديد تلقائي
            </p>
          </div>
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
                <FileCheck className="h-3 w-3" /> بعد كل دفعة — فوراً
              </div>
              <h2 className="mb-5 text-3xl font-black text-slate-900">شهادة تفعيل تليق بشراكتك</h2>
              <p className="mb-6 text-base leading-relaxed text-slate-600">
                حلاق ماب لا تبيع «اشتراكاً» فقط — تُسلّمك وثيقة رقمية معتمدة تُثبت ملكيتك لرخصة النفاذ:
                اسم منشأتك، باقتك، تواريخ الصلاحية، و**كود تفعيل فريد** يُبرز كمفتاح رخصتك الرسمي.
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  'كود تفعيل بارز بتنسيق `HM-LIC-XXXX-XXXX-XXXX`',
                  'إصدار فوري بعد نجاح الدفع — دون انتظار',
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
              { q: 'كيف أشترك إذا لم تكن المنطقة مغطاة؟', a: 'لا تقلق، سوف نصلك قريباً — راسل الدعم.' },
              { q: 'هل يمكنني تغيير باقتي لاحقاً؟', a: 'نعم — عند انتهاء الحزمة الحالية تشتري الباقة الجديدة التي تناسبك. لا عقد ملزم ولا رسوم ترقية.' },
              { q: 'ماذا يحدث عند انتهاء صلاحية الحزمة؟', a: 'يتوقف ظهورك تلقائياً حتى تُجدِّد — بياناتك محفوظة، وتفعيل حزمة جديدة يعيدك فوراً.' },
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
