/**
 * صفحة مسار الخدمات التسويقية للشركاء — حلاق ماب
 * المسار: /preview-partners
 *
 * مسار مُخصَّص للحلاقين والصالونات فقط.
 * يعزل تجربة الانضمام عن تجربة المستخدم العادي تماماً.
 * يعتمد نفس نظام التصميم الداكن لصفحة /preview مع محتوى موجَّه للشريك.
 */

import { useState, useRef, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Scissors, Star, Shield, CheckCircle2, Clock, ArrowLeft,
  Sparkles, ChevronDown, Globe2, Users, Award, BarChart3,
  Crown, Zap, Navigation2, Phone, MessageCircle, Lock,
  TrendingUp, QrCode, ImageIcon, Brain, Moon, FileCheck,
  ChevronLeft, ArrowRight, Wifi, Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { KSACityClocksBar } from '@/components/KSACityClocksBar';
import { FloatingPlatformActions } from '@/components/FloatingPlatformActions';
import {
  TIER_MONTHLY_SAR,
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  DIAMOND_PRODUCT_STANDARD_LABEL_AR,
} from '@/config/subscriptionPricing';
import { SubscriptionTier } from '@/lib/index';
import { EndUserBarberBannerSim } from '@/components/partner/banners-preview/EndUserBarberBannerSim';
import { PARTNER_BANNERS_PREVIEW_TIERS } from '@/config/partnerBannersPreviewCopy';

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
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d1b2e] to-[#060d1a] p-5 hover:border-white/20 transition-all"
      dir="rtl"
    >
      {badge && (
        <div className="absolute left-3 top-3 rounded-full bg-amber-500/20 px-2 py-0.5 text-[0.55rem] font-bold text-amber-300">
          {badge}
        </div>
      )}
      <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} p-0.5`}>
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#060d1a]">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <h3 className="mb-1.5 text-base font-bold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
      <div className={`absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-15`} />
    </motion.div>
  );
}

// ─── Pricing card ────────────────────────────────────────────────────────────
function PricingCard({
  tier, price, name, badge, features, accent,
  ringColor, recommended = false, delay = 0, addOnAvailable = false, tierQuery
}: {
  tier: string; price: number; name: string; badge: string;
  features: string[]; accent: string; ringColor: string;
  recommended?: boolean; delay?: number; addOnAvailable?: boolean; tierQuery?: string;
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
      className={`relative flex flex-col rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-2xl
        ${recommended
          ? `border-amber-400/60 bg-gradient-to-b from-amber-500/10 to-[#0a1628] shadow-[0_0_40px_rgba(245,158,11,0.12)]`
          : 'border-white/10 bg-gradient-to-b from-white/5 to-[#060d1a]'
        }`}
      dir="rtl"
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-4 py-0.5 text-[0.65rem] font-bold text-black shadow">
          الأكثر طلباً
        </div>
      )}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">{badge}</span>
        <div>
          <div className={`text-lg font-black ${accent}`}>{name}</div>
          <div className="text-[0.62rem] text-slate-600">{tier} License · ISIC4 474151</div>
        </div>
      </div>
      <div className="mb-2 flex items-end gap-1">
        <span className={`text-4xl font-black tabular-nums ${accent}`}>{price}</span>
        <span className="mb-1 text-xs text-slate-400">ر.س / حزمة ٣٠ يوم</span>
      </div>
      {addOnAvailable && (
        <div className="mb-4 rounded-lg border border-violet-400/25 bg-violet-500/8 px-3 py-2 text-[0.65rem] text-violet-300">
          ✦ Add-on: المناوب الرقمي الذكي 🌙 (+{DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س/حزمة)
          <span className="ms-1 text-violet-400/60">= {price + DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س مع المناوب</span>
        </div>
      )}
      <ul className="mb-6 flex flex-col gap-2" dir="rtl">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[0.78rem] text-slate-300">
            <CheckCircle2 className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${accent}`} />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => navigate(`${ROUTE_PATHS.REGISTER}${tierQuery ? `?tier=${tierQuery}` : ''}`)}
        className={`mt-auto w-full rounded-xl py-3 text-sm font-bold transition-all
          ${recommended
            ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:from-amber-300'
            : `border ${ringColor} bg-white/5 text-white hover:bg-white/10`
          }`}
      >
        ابدأ بهذه الباقة →
      </button>
    </motion.div>
  );
}

// ─── Digital certificate mockup ──────────────────────────────────────────────
function CertificateMockup() {
  return (
    <div
      className="relative mx-auto max-w-sm overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-b from-[#0d1b0d] to-[#030d03] p-6 shadow-xl shadow-amber-500/10"
      dir="rtl"
    >
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }} />
      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 shadow-lg">
            <Scissors className="h-6 w-6 text-black" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-400">حلاق ماب — HALAQ MAP</div>
            <div className="text-[0.6rem] text-slate-500">شهادة التفعيل الرقمية</div>
          </div>
        </div>
        <div className="mb-4 rounded-xl border border-amber-400/20 bg-black/40 p-4">
          <div className="mb-2 text-[0.6rem] text-slate-500 uppercase tracking-wider">رخصة النفاذ الرقمية</div>
          <div className="text-sm font-bold text-white">صالون ستايل برو للرجال</div>
          <div className="mt-1 font-mono text-[0.65rem] text-amber-400">HM-LIC-A3F9-K2M1-7X4P</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[0.62rem]">
          {[
            { label: 'الباقة', value: 'ذهبي 🥇' },
            { label: 'النظام', value: 'الاستجابة الذكية' },
            { label: 'تاريخ التفعيل', value: '٢٣ مايو ٢٠٢٦' },
            { label: 'انتهاء الصلاحية', value: '٢٢ يونيو ٢٠٢٦' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-white/8 bg-white/5 p-2">
              <div className="text-slate-500">{item.label}</div>
              <div className="font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-2">
          <FileCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-[0.65rem] text-emerald-300">مُفعَّلة ومُسجَّلة على نظام المنصة</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function PartnerMarketingPreview() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'bronze' | 'gold' | 'diamond'>('gold');
  const [scrolled, setScrolled] = useState(false);

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });
  const salons = useCounter(2300, 1800, statsInView);
  const cities = useCounter(47, 1400, statsInView);
  const searches = useCounter(18000, 2000, statsInView);

  return (
    <div dir="rtl" className="relative min-h-screen overflow-x-hidden bg-[#020912] text-slate-100" style={{ fontFamily: 'Tajawal, system-ui' }}>

      {/* أزرار عائمة */}
      <FloatingPlatformActions />

      {/* ── شبكة التكتير الخلفية ──────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,1) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* ══════════════════════════════════════════════════════════════════
          الهيدر الموحّد — شريط المدن + التنقل (مسار الشركاء)
          ══════════════════════════════════════════════════════════════════ */}
      <header className="fixed inset-x-0 top-0 z-50 transition-all duration-500">

        {/* خلفية زجاجية */}
        <div className="absolute inset-0 bg-[#020912]/94 backdrop-blur-2xl shadow-[0_4px_40px_rgba(0,0,0,0.5)]" />

        {/* ── شريط مدن المملكة ────────────────────────────────────────── */}
        <div className="relative border-b border-amber-400/10">
          <KSACityClocksBar />
        </div>

        {/* ── التنقل الرئيسي ──────────────────────────────────────────── */}
        <div className="relative">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3">

            {/* الشعار */}
            <a href={`/#${ROUTE_PATHS.HOME}`} className="flex items-center gap-3 no-underline">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-700/20 blur-sm" />
                <motion.div
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-gradient-to-br from-[#2a1a00] to-[#020912] shadow-[0_0_20px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(251,191,36,0.15)]"
                  whileHover={{ scale: 1.08, rotate: -12 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Scissors className="h-4 w-4 text-amber-300" />
                </motion.div>
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[0.95rem] font-black tracking-wide text-white">حلاق ماب</span>
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-amber-400"
                  />
                </div>
                <div className="text-[0.48rem] font-bold tracking-[0.25em] text-amber-400/55">مسار الشركاء · B2B</div>
              </div>
              {/* شارة الشركاء */}
              <div className="hidden items-center gap-1 rounded-full border border-amber-400/20 bg-amber-500/8 px-2.5 py-1 sm:flex">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full bg-amber-400"
                />
                <span className="text-[0.55rem] font-bold text-amber-300/80">مسار نشط</span>
              </div>
            </a>

            {/* ── روابط التنقل ──────────────────────────────────────────── */}
            <nav className="hidden items-center gap-1 md:flex" dir="rtl">
              {[
                { label: 'كيف تنضم',      id: 'كيف تنضم',      icon: Navigation2 },
                { label: 'مزايا الباقات', id: 'مزايا الباقات', icon: Sparkles },
                { label: 'الأسعار',       id: 'الأسعار',       icon: Crown },
                { label: 'البنرات والمناوب 🌙', id: 'معاينة البنرات', icon: ImageIcon },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="group flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[0.78rem] font-semibold text-slate-400 transition-all hover:bg-amber-500/8 hover:text-amber-200 cursor-pointer"
                >
                  <item.icon className="h-3.5 w-3.5 text-amber-500/45 transition-colors group-hover:text-amber-400" />
                  {item.label}
                </button>
              ))}

              <div className="mx-1 h-5 w-px bg-white/10" />

              {/* رابط المستخدمين */}
              <a
                href={`/#${ROUTE_PATHS.HOME}`}
                className="group flex items-center gap-1.5 rounded-xl border border-teal-400/15 bg-teal-500/5 px-3.5 py-2 text-[0.78rem] font-semibold text-teal-400/65 transition-all hover:border-teal-400/35 hover:bg-teal-500/10 hover:text-teal-300"
              >
                <Globe2 className="h-3.5 w-3.5" />
                للمستخدمين
                <ArrowRight className="h-3 w-3 opacity-50 group-hover:opacity-100" />
              </a>
            </nav>

            {/* ── زر التسجيل ───────────────────────────────────────────── */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => navigate(ROUTE_PATHS.REGISTER)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-l from-amber-500 to-amber-700 px-4 py-2.5 text-xs font-black text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
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
                onClick={() => setScrolled((s) => !s)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 md:hidden"
                aria-label="القائمة"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* خط التوهج السفلي — ذهبي */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] overflow-hidden pt-24">
        <div className="pointer-events-none absolute -right-80 top-0 h-[700px] w-[700px] rounded-full bg-amber-500/6 blur-[150px]" />
        <div className="pointer-events-none absolute -left-60 bottom-0 h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-[130px]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
          {/* Text */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300">
              <Sparkles className="h-3 w-3" /> مسار الخدمات التسويقية للشركاء
            </motion.div>

            <h1 className="mb-6 text-[clamp(2.4rem,5.5vw,3.8rem)] font-black leading-[1.1] text-white">
              اجعل صالونك
              <span className="block bg-gradient-to-l from-amber-300 to-yellow-400 bg-clip-text text-transparent">
                يُكتشف بذكاء
              </span>
            </h1>

            <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-400">
              رخصة نفاذ رقمية تُفعِّل وجودك الجغرافي على منصة حلاق ماب —
              تظهر عندما يبحث زبون قريب، وتختفي حين لا يوجد طلب.
              <span className="block mt-2 text-[0.85rem] text-amber-400/70">
                لا عمولة · لا وسيط · لا عقد مُلزِم
              </span>
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              {[
                { icon: Shield, text: 'لا عمولة على الخدمة' },
                { icon: Lock, text: 'تحكم كامل في بياناتك' },
                { icon: Globe2, text: '47+ مدينة سعودية' },
                { icon: Clock, text: 'حزمة 30 يوم مسبقة الدفع' },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.75rem] text-slate-300">
                  <b.icon className="h-3.5 w-3.5 text-amber-400" />
                  {b.text}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate(ROUTE_PATHS.REGISTER)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-700 px-8 py-4 font-bold text-black shadow-xl shadow-amber-500/25 hover:from-amber-400"
              >
                <Scissors className="h-4 w-4" /> ابدأ رحلة الانضمام
              </button>
              <button
                onClick={() => navigate(ROUTE_PATHS.PARTNER_WHY)}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-4 font-semibold text-slate-200 hover:border-white/30"
              >
                لماذا نحن؟ <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* Card preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="relative"
          >
            <div className="mb-4 flex items-center justify-center gap-2">
              {PARTNER_BANNERS_PREVIEW_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setActiveTab(tier.id)}
                  className={`rounded-lg border px-4 py-2 text-xs font-semibold transition-all ${
                    activeTab === tier.id
                      ? tier.id === 'diamond' ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200'
                        : tier.id === 'gold' ? 'border-amber-400/60 bg-amber-500/15 text-amber-200'
                        : 'border-amber-700/50 bg-amber-800/15 text-amber-600'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {tier.badge} {tier.id === 'bronze' ? 'برونزي' : tier.id === 'gold' ? 'ذهبي' : 'ماسي'}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              {PARTNER_BANNERS_PREVIEW_TIERS.filter((t) => t.id === activeTab).map((tier) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* المحاكاة الحقيقية من صفحة معاينة البنرات */}
                  <EndUserBarberBannerSim tier={tier} startDelayMs={600} />
                </motion.div>
              ))}
            </AnimatePresence>
            <p className="mt-3 text-center text-[0.65rem] text-slate-500">
              محاكاة حقيقية لرحلة الزبون — اضغط التبويب لتغيير الباقة
            </p>

            {/* Floating indicators */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -left-5 top-16 rounded-xl border border-emerald-400/30 bg-[#0a1628]/90 px-3 py-2 backdrop-blur-md"
            >
              <div className="text-[0.6rem] text-slate-400">طلبات اليوم</div>
              <div className="text-sm font-black text-emerald-300">+١٢ زبون ↑</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.8 }}
              className="absolute -right-4 bottom-20 rounded-xl border border-amber-400/30 bg-[#0a1628]/90 px-3 py-2 backdrop-blur-md"
            >
              <div className="text-[0.6rem] text-slate-400">ظهرت في نتائج</div>
              <div className="text-sm font-black text-amber-300">٤٧ بحث 📍</div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-amber-400/40">
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-12">
        <div ref={statsRef} className="mx-auto max-w-4xl px-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: salons, suffix: '+', label: 'صالون على المنصة', color: 'text-amber-400' },
              { value: cities, suffix: '+', label: 'مدينة سعودية', color: 'text-teal-400' },
              { value: searches, suffix: '+', label: 'بحث شهرياً', color: 'text-cyan-400' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/8 bg-white/5 p-5"
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

      {/* ── How to join ──────────────────────────────────────────────────── */}
      <section id="كيف تنضم" className="relative z-10 py-24">
        <div className="pointer-events-none absolute right-0 top-10 h-96 w-96 rounded-full bg-amber-500/5 blur-[100px]" />
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-14 text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300">
              <Zap className="h-3 w-3" /> رحلة الانضمام
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-black text-white md:text-4xl">
              ٤ خطوات لتفعيل وجودك
            </motion.h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '١', icon: Scissors, title: 'أكمل النموذج', desc: 'بيانات صالونك الأساسية: الاسم، الموقع، الخدمات، صور الواجهة.', color: 'from-amber-500 to-yellow-500' },
              { step: '٢', icon: Shield, title: 'مراجعة الإدارة', desc: 'نتحقق من البيانات خلال 24-48 ساعة ونُخطرك بالقبول.', color: 'from-teal-500 to-cyan-500' },
              { step: '٣', icon: Crown, title: 'اختر الباقة وادفع', desc: 'برونزي أو ذهبي أو ماسي — ادفع مسبقاً عبر بوابة ميسر الآمنة.', color: 'from-violet-500 to-purple-500' },
              { step: '٤', icon: Wifi, title: 'ظهورك يبدأ فوراً', desc: 'بعد تفعيل الكود تظهر في نتائج البحث لأقرب الزبائن منك.', color: 'from-emerald-500 to-green-500' },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-5"
                dir="rtl"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg`}>
                  <step.icon className="h-5 w-5 text-white" />
                </div>
                <div className={`absolute left-4 top-4 text-[3rem] font-black leading-none opacity-[0.06] bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                  {step.step}
                </div>
                <div className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-600 mb-1">الخطوة {step.step}</div>
                <h3 className="mb-2 text-base font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="مزايا الباقات" className="relative z-10 border-y border-white/5 bg-white/[0.015] py-24">
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-violet-500/5 blur-[120px]" />
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-black text-white md:text-4xl">
              أدوات الصالون الاحترافي
            </motion.h2>
            <p className="mt-3 text-slate-400">كل ما تحتاجه لإدارة حضورك الرقمي باستقلالية تامة</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Navigation2} title="ظهور عند الطلب" desc="تُفعَّل برمجياً فقط عند وجود طلب نشط في محيطك — لا إشغال دائم للمساحة الرقمية." color="from-amber-500 to-yellow-500" delay={0} />
            <FeatureCard icon={ImageIcon} title="بطاقة + بنر احترافي" desc="صفحة صالونك كاملة: صور واجهة، بنر تسويقي، خدمات، أسعار، وساعات العمل." color="from-teal-500 to-cyan-500" delay={0.08} />
            <FeatureCard icon={Clock} title="مفتوح/مغلق لحظياً" desc="اضبط حالة صالونك في أي وقت عبر رابط سري — بدون دخول لوحة التحكم." color="from-emerald-500 to-green-500" delay={0.16} />
            <FeatureCard icon={Star} title="تقييمات موثّقة + QR" desc="كود QR يُرسل لزبونك لتقييمك بعد الخدمة — تقييمات حقيقية لا وهمية." color="from-rose-500 to-pink-500" delay={0.08} badge="Gold +" />
            <FeatureCard icon={BarChart3} title="إحصاءات الأداء" desc="كم بحث عنك، من أي حي، وفي أي وقت — خريطة حرارية لفهم زبائنك." color="from-violet-500 to-purple-500" delay={0.16} badge="Gold +" />
            <FeatureCard icon={Brain} title="المناوب الرقمي الذكي 🌙" desc="Add-on للماسية — يرد على الشات عند إغلاق الصالون أو الانشغال، يرحّب ويُنظّم." color="from-indigo-500 to-blue-500" delay={0.24} badge="Diamond Add-on" />
            <FeatureCard icon={Users} title="خدمة كبار السن وذوي الاحتياجات" desc="إعلان موجَّه لشريحة لا تجدها في أي منصة أخرى — ميزة تنافسية حقيقية." color="from-sky-500 to-blue-400" delay={0.08} badge="Gold +" />
            <FeatureCard icon={QrCode} title="بورتفوليو صور" desc="اعرض أعمالك الفعلية — المزيد من الصور = المزيد من الثقة قبل الزيارة." color="from-orange-500 to-red-500" delay={0.16} badge="Diamond +" />
            <FeatureCard icon={FileCheck} title="شهادة التفعيل الرقمية" desc="وثيقة رسمية بعد كل دفعة: رقم الرخصة، تاريخ التفعيل، نوع الباقة." color="from-amber-600 to-orange-500" delay={0.24} />
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="الأسعار" className="relative z-10 py-24">
        <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-amber-500/6 blur-[130px]" />
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-14 text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300">
              <Crown className="h-3 w-3" /> حزم رخصة النفاذ الرقمية
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mb-3 text-3xl font-black text-white md:text-4xl">
              سعر واضح · لا مفاجآت
            </motion.h2>
            <p className="text-slate-400">مسبقة الدفع · لا تجديد تلقائي · ISIC4 474151</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* ── برونزي ── من TIER_MONTHLY_SAR مباشرة */}
            <PricingCard
              tier="Bronze" tierQuery="bronze"
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
              price={TIER_MONTHLY_SAR[SubscriptionTier.GOLD]}
              name="ذهبي" badge="🥇"
              accent="text-amber-400" ringColor="border-amber-400/40"
              recommended delay={0.1}
              features={[
                'كل مزايا البرونزي +',
                'ظهور أولوية في نتائج المنطقة',
                'بنر تسويقي احترافي بصري',
                'إحصاءات أداء شهرية + خريطة حرارية',
                'خدمة كبار السن وذوي الاحتياجات الخاصة',
                'QR تقييم موثّق + رابط الصالون',
              ]}
            />

            {/* ── ماسي + Add-on اختياري ── */}
            <PricingCard
              tier="Diamond" tierQuery="diamond"
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
                `${DIAMOND_PRODUCT_STANDARD_LABEL_AR} | +${DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س للمناوب الذكي 🌙`,
              ]}
            />
          </div>
          <p className="mt-5 text-center text-[0.68rem] text-slate-700">
            كل حزمة صالحة ٣٠ يوماً · لا وساطة تجارية · لا عمولة على الخدمة · لا بيانات حكومية مطلوبة للتسجيل
          </p>
        </div>
      </section>

      {/* ── Banner preview showcase ───────────────────────────────────────── */}
      <section id="معاينة البنرات" className="relative z-10 border-y border-white/5 bg-white/[0.015] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl font-black text-white md:text-4xl">
              هكذا يظهر صالونك
            </motion.h2>
            <p className="mt-3 text-slate-400">معاينة حقيقية لبطاقات الباقات الثلاث على المنصة</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {PARTNER_BANNERS_PREVIEW_TIERS.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className={`mb-3 text-center text-xs font-bold ${tier.id === 'diamond' ? 'text-cyan-400' : tier.id === 'gold' ? 'text-amber-400' : 'text-amber-700'}`}>
                  {tier.badge} {tier.id === 'bronze' ? 'البرونزي' : tier.id === 'gold' ? 'الذهبي' : 'الماسي'}
                </div>
                {/* محاكاة حقيقية مع صور وتفاعل */}
                <EndUserBarberBannerSim
                  tier={tier}
                  startDelayMs={i * 800}
                />
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <button
              onClick={() => navigate(ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-300 hover:border-amber-400/70 transition-all"
            >
              <ImageIcon className="h-4 w-4" /> معاينة البنرات والمناوب الذكي 🌙
            </button>
          </div>
        </div>
      </section>

      {/* ── Digital certificate ───────────────────────────────────────────── */}
      <section className="relative z-10 py-24">
        <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-amber-500/5 blur-[100px]" />
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} dir="rtl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300">
                <FileCheck className="h-3 w-3" /> بعد كل دفعة
              </div>
              <h2 className="mb-5 text-3xl font-black text-white">شهادة تفعيل رقمية رسمية</h2>
              <p className="mb-6 text-base leading-relaxed text-slate-400">
                مع كل حزمة مدفوعة تصلك شهادة تفعيل رقمية تتضمن:
                رقم الرخصة الفريد، نوع الباقة، تاريخ التفعيل وانتهاء الصلاحية — وثيقة رسمية تُثبت حضورك على المنصة.
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  'رقم رخصة فريد بتنسيق HM-LIC-XXXX-XXXX',
                  'تاريخ التفعيل وانتهاء الصلاحية',
                  'اسم المنشأة والباقة المشتراة',
                  'مرجع مقبول للتحقق الإداري الرسمي',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <CertificateMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 border-t border-white/5 py-20">
        <div className="mx-auto max-w-3xl px-5">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mb-10 text-center text-2xl font-black text-white">
            أسئلة الشركاء الشائعة
          </motion.h2>
          <div className="flex flex-col gap-3">
            {[
              { q: 'هل حلاق ماب تأخذ عمولة على كل قصة شعر؟', a: 'لا — حلاق ماب مزوّد حلول تقنية فقط. تدفع رخصة نفاذ شهرية ثابتة، والعلاقة بين صالونك والزبون مباشرة بدون وسيط أو عمولة.' },
              { q: 'ما معنى "الظهور عند الطلب"؟', a: 'يظهر صالونك في نتائج البحث فقط عندما يبحث زبون فعلي قريب منك — هذا يعني أن كل ظهور هو فرصة حقيقية، لا وجود شكلي.' },
              { q: 'كيف أشترك إذا لم تكن المنطقة مغطاة؟', a: 'التغطية تتوسع باستمرار. سجّل اهتمامك المسبق وسنُخطرك فور فتح منطقتك — الأولوية للمسجلين المسبقين.' },
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
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
              >
                <button
                  className="flex w-full items-center justify-between px-5 py-4 text-right text-sm font-semibold text-slate-200 hover:text-white"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.q}
                  <ChevronDown className={`h-4 w-4 shrink-0 text-amber-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <p className="border-t border-white/8 px-5 py-4 text-sm leading-relaxed text-slate-400">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 overflow-hidden border-t border-white/5 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-amber-500/7 blur-[140px]" />
          <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="mb-6 text-6xl">✂️</div>
            <h2 className="mb-5 text-3xl font-black text-white md:text-4xl">
              صالونك جاهز — هل أنت كذلك؟
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-slate-400">
              ابدأ بحزمة برونزية بـ١٠٠ ر.س وجرّب بنفسك —
              إذا لم تُعجبك النتائج خلال ٣٠ يوماً لا يوجد تجديد تلقائي يُربطك.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={() => navigate(ROUTE_PATHS.REGISTER)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-700 px-10 py-4 font-bold text-black shadow-2xl shadow-amber-500/25 hover:from-amber-400 transition-all"
              >
                <Scissors className="h-5 w-5" /> سجّل صالونك الآن
              </button>
              <button
                onClick={() => navigate(ROUTE_PATHS.PARTNER_WHY)}
                className="flex items-center gap-2 rounded-xl border border-white/15 px-8 py-4 font-semibold text-slate-200 hover:border-white/30 transition-all"
              >
                اقرأ قصة المنصة <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/8 bg-black/40 py-12">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
            <div dir="rtl">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-700">
                  <Scissors className="h-4 w-4 text-black" />
                </div>
                <span className="text-base font-black text-white">حلاق ماب — مسار الشركاء</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                مزوّد حلول تقنية (Technical Solutions Provider) — رخصة نفاذ رقمية ضمن نظام الاستجابة الذكية.
                ليست وسيطاً تجارياً ولا تتقاضى عمولة على خدمة الحلاقة.
              </p>
            </div>
            <div dir="rtl">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">مسار الشركاء</h4>
              <div className="flex flex-col gap-2.5 text-sm text-slate-500">
                        {[
                  { label: 'التسجيل', href: `/#${ROUTE_PATHS.REGISTER}` },
                  { label: 'الباقات والأسعار', href: `/#${ROUTE_PATHS.BARBERS_LANDING}` },
                  { label: 'سياسة الحزم', href: `/#${ROUTE_PATHS.SUBSCRIPTION_POLICY}` },
                  { label: 'لوحة الشريك', href: `/#${ROUTE_PATHS.BARBER_LOGIN}` },
                  { label: 'خدمة العملاء', href: `/#${ROUTE_PATHS.PARTNER_SUPPORT}` },
                  { label: 'خصوصية الشركاء', href: `/#${ROUTE_PATHS.PARTNER_PRIVACY}` },
                ].map((link) => (
                  <a key={link.label} href={link.href} className="hover:text-amber-400 transition-colors">{link.label}</a>
                ))}
              </div>
            </div>
            <div dir="rtl">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">المستخدمون</h4>
              <div className="flex flex-col gap-2.5">
                <a href={`/#${ROUTE_PATHS.HOME}`} className="text-sm text-slate-500 hover:text-teal-400 transition-colors">ابحث عن حلاق ↗</a>
                <a href={`/#${ROUTE_PATHS.PARTNER_PRIVACY}`} className="text-sm text-slate-500 hover:text-teal-400">سياسة الخصوصية</a>
                <a href={`/#${ROUTE_PATHS.TERMS_OF_SERVICE}`} className="text-sm text-slate-500 hover:text-teal-400">شروط الاستخدام</a>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/8 pt-8 text-center text-[0.7rem] text-slate-600 md:flex-row md:justify-between">
            <span>© ٢٠٢٦ حلاق ماب — جميع الحقوق محفوظة</span>
            <span className="text-slate-700">مزوّد حلول تقنية · ISIC4 474151 · المملكة العربية السعودية</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
