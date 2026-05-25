/**
 * صفحة مسار الخدمات التسويقية للشركاء — حلاق ماب
 * المسار: /preview-partners
 *
 * مسار مُخصَّص للحلاقين والصالونات فقط.
 * يعزل تجربة الانضمام عن تجربة المستخدم العادي تماماً.
 * يعتمد نفس نظام التصميم الداكن لصفحة /preview مع محتوى موجَّه للشريك.
 */

import { useState, useRef, useMemo, useEffect } from 'react';
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
import { B2BSalesManagerChat } from '@/components/B2BSalesManagerChat';
import {
  TIER_MONTHLY_SAR,
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  DIAMOND_PRODUCT_STANDARD_LABEL_AR,
} from '@/config/subscriptionPricing';
import { SubscriptionTier } from '@/lib/index';
import { EndUserBarberBannerSim } from '@/components/partner/banners-preview/EndUserBarberBannerSim';
import { PARTNER_BANNERS_PREVIEW_TIERS } from '@/config/partnerBannersPreviewCopy';
import { routeToBuyPackage } from '@/lib/buyPackageRouter';
import { PlatformAmbientBackground } from '@/components/PlatformAmbientBackground';
import { PlatformAmbientToggle } from '@/components/PlatformAmbientToggle';
import { PlatformTlsTrustBadge } from '@/components/PlatformTlsTrustBadge';
import { usePlatformAmbient } from '@/context/PlatformAmbientContext';

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

// ─── Founders Offer Banner — العرض التشغيلي التأسيسي لمضاعفة الرخص ────────
const PRICE_B = 100, PRICE_G = 150, PRICE_D = 200, PRICE_DA = 225;

const PIONEER_TOTAL = 1000; // ألف الرواد — الحد التأسيسي الأقصى

function FoundersOfferBanner({ onRegister }: { onRegister: () => void }) {
  const [spots, setSpots] = useState(731); // متبقٍ من الألف
  const [pulse, setPulse] = useState(false);
  const [activeRow, setActiveRow] = useState<number | null>(null);
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

  // صفوف المضاعفة — مرتّبة من الأبسط للأقوى
  const ROWS = [
    { n: 3,  icon: '🎁', label: 'اشترِ ٣ حزم', bonus: '+ ٣ حزم مجاناً', months: '٦ أشهر حضور رقمي' },
    { n: 6,  icon: '🔥', label: 'اشترِ ٦ حزم', bonus: '+ ٦ حزم مجاناً', months: 'سنة كاملة على الرادار', best: true },
    { n: 12, icon: '⚡', label: 'اشترِ ١٢ حزمة', bonus: '+ ١٢ حزمة مجاناً', months: 'سنتان بسعر سنة واحدة' },
  ];

  // جدول التوفير الكامل لكل تركيبة
  const savings = (price: number, n: number) => (price * n).toLocaleString('ar-SA');

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative mb-12 overflow-hidden rounded-3xl"
      style={{
        background: 'linear-gradient(135deg, #0c0800 0%, #130d00 40%, #0a0600 100%)',
        border: '1px solid rgba(251,191,36,0.22)',
        boxShadow: '0 0 80px rgba(251,191,36,0.10), 0 0 160px rgba(251,191,36,0.04), inset 0 1px 0 rgba(251,191,36,0.15)',
      }}
    >
      {/* ── خلفية توهج ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-24 left-1/4 h-48 w-96 rounded-full bg-amber-500/8 blur-[80px]" />
        <div className="absolute -bottom-12 right-1/4 h-40 w-80 rounded-full bg-yellow-500/6 blur-[70px]" />
        <motion.div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(251,191,36,0.025) 50%, transparent 60%)' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
        />
      </div>

      {/* ══ الرأس ══ */}
      <div className="relative border-b border-amber-400/12 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* العنوان */}
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="text-lg"
              >⚡</motion.span>
              <span className="rounded-full border border-amber-400/30 bg-amber-500/12 px-3 py-0.5 text-[0.6rem] font-black uppercase tracking-[0.2em] text-amber-400">
                ⭐ عرض تشغيلي مؤقت · الألف الرواد
              </span>
            </div>
            <h3 className="text-xl font-black leading-tight text-white md:text-2xl">
              مضاعفة الرخص التأسيسية
            </h3>
            <p className="mt-0.5 text-sm text-amber-300/70">
              اشترِ أي حزمة واحصل على ضعفها مجاناً — ينطبق على جميع الباقات
            </p>
          </div>
          {/* عداد المقاعد المتبقية */}
          <motion.div
            animate={pulse ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-3 rounded-2xl border px-5 py-3 transition-all duration-500 ${
              pulse ? 'border-red-400/50 bg-red-500/12 shadow-[0_0_20px_rgba(239,68,68,0.20)]'
                    : 'border-amber-400/25 bg-amber-500/8'
            }`}
          >
            <div className="text-right">
              <div className={`text-3xl font-black tabular-nums leading-none ${pulse ? 'text-red-300' : 'text-amber-300'}`}>
                {spots}
              </div>
              <div className="text-[0.58rem] text-slate-400">رائد متبقٍ</div>
              <div className="text-[0.55rem] text-slate-600">من ألف الرواد</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className={`h-2.5 w-2.5 rounded-full ${pulse ? 'bg-red-400' : 'bg-amber-400'}`}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-[0.5rem] text-slate-500 rotate-90 mt-1">LIVE</span>
            </div>
          </motion.div>
        </div>

        {/* شريط التقدم */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[0.62rem]">
            <span className="text-slate-600">٠ مشترك</span>
            <span className={`font-bold ${pct >= 80 ? 'text-red-400' : 'text-amber-400/80'}`}>
              {pct}% مُحجوز
            </span>
            <span className="text-slate-600">١٠٠٠ رائد</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: pct >= 80
                  ? 'linear-gradient(90deg, #ef4444, #f97316)'
                  : 'linear-gradient(90deg, #d97706, #fbbf24, #fde68a)',
                boxShadow: '0 0 8px rgba(251,191,36,0.5)',
              }}
              initial={{ width: 0 }}
              animate={inView ? { width: `${pct}%` } : {}}
              transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* ══ صفوف مستويات المضاعفة ══ */}
      <div className="relative px-6 py-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-l from-amber-400/20 to-transparent" />
          <span className="text-[0.65rem] font-bold tracking-widest text-amber-400/50">مستويات المضاعفة</span>
          <div className="h-px flex-1 bg-gradient-to-r from-amber-400/20 to-transparent" />
        </div>

        <div className="space-y-3">
          {ROWS.map((row, i) => (
            <motion.div
              key={i}
              onHoverStart={() => setActiveRow(i)}
              onHoverEnd={() => setActiveRow(null)}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-default ${
                row.best
                  ? 'border-amber-400/45 bg-amber-500/10 shadow-[0_0_24px_rgba(251,191,36,0.10)]'
                  : activeRow === i
                    ? 'border-amber-400/25 bg-amber-500/5'
                    : 'border-white/6 bg-white/[0.02]'
              }`}
            >
              {row.best && (
                <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-amber-400 px-3 py-0.5 text-[0.58rem] font-black text-black">
                  الأفضل قيمةً ✦
                </div>
              )}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* الأيقونة */}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                  row.best ? 'bg-amber-500/20 shadow-[0_0_16px_rgba(251,191,36,0.20)]' : 'bg-white/5'
                }`}>
                  {row.icon}
                </div>
                {/* النص الرئيسي */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-white">{row.label}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                      row.best ? 'bg-amber-400/20 text-amber-300' : 'bg-white/8 text-slate-300'
                    }`}>{row.bonus}</span>
                  </div>
                  <p className="mt-0.5 text-[0.7rem] text-slate-400">{row.months}</p>
                </div>
                {/* التوفير لكل باقة */}
                <div className="hidden shrink-0 items-center gap-3 lg:flex">
                  {[
                    { label: '🥉', price: PRICE_B, color: 'text-amber-700' },
                    { label: '🥇', price: PRICE_G, color: 'text-amber-400' },
                    { label: '💎', price: PRICE_D, color: 'text-cyan-400' },
                    { label: '💎🌙', price: PRICE_DA, color: 'text-violet-400' },
                  ].map(t => (
                    <div key={t.label} className="text-center">
                      <div className="text-[0.55rem]">{t.label}</div>
                      <div className={`text-xs font-black tabular-nums ${t.color}`}>
                        {savings(t.price, row.n)} ر.س
                      </div>
                      <div className="text-[0.48rem] text-slate-600">توفير</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* جوال: التوفير في صف منفصل */}
              <div className="flex items-center gap-3 border-t border-white/5 px-4 py-2 lg:hidden">
                <span className="text-[0.6rem] text-slate-500">التوفير:</span>
                {[
                  { label: '🥉 برونزي', price: PRICE_B, color: 'text-amber-700' },
                  { label: '🥇 ذهبي', price: PRICE_G, color: 'text-amber-400' },
                  { label: '💎 ماسي', price: PRICE_D, color: 'text-cyan-400' },
                  { label: '💎🌙 ماسي+مناوب', price: PRICE_DA, color: 'text-violet-400' },
                ].map(t => (
                  <div key={t.label} className="text-center">
                    <div className={`text-[0.6rem] font-black ${t.color}`}>{savings(t.price, row.n)}</div>
                    <div className="text-[0.5rem] text-slate-600">{t.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* أعمدة التوفير — تعليق توضيحي desktop */}
        <div className="mt-2 hidden justify-end gap-3 pr-5 lg:flex">
          {['🥉 برونزي', '🥇 ذهبي', '💎 ماسي', '💎🌙 +مناوب'].map(l => (
            <div key={l} className="w-14 text-center text-[0.5rem] text-slate-600">{l}</div>
          ))}
        </div>
      </div>

      {/* ══ الفوتر: الشروط + CTA ══ */}
      <div className="relative border-t border-amber-400/10 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.67rem] text-slate-400">
              <span>✅ ينطبق على جميع الباقات — برونزي وذهبي وماسي</span>
              <span>✅ لا عمولات على خدماتك</span>
              <span>✅ ظهور جغرافي ذكي عند الطلب</span>
              <span className="flex items-center gap-1">
                <span className="inline-block rounded-full border border-amber-400/50 bg-amber-500/15 px-2 py-0.5 text-amber-300 font-bold">⭐ شارة رائد</span>
                لكل مشترك من ١ إلى ١٠٠٠ — لامعة على البنر · لا تُمنح بعد اكتمال الألف
              </span>
            </div>
            <p className="text-[0.62rem] text-amber-500/50">
              ⭐ كل مشترك من ١ إلى ١٠٠٠ يحصل على <strong className="text-amber-300">شارة رائد</strong> لامعة على بنره — حصرية لا تُمنح لغير الألف الأوائل &nbsp;·&nbsp; 🚨 يُغلق فور اكتمال العدد
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRegister}
            className="relative overflow-hidden rounded-2xl px-8 py-3.5 text-sm font-black text-black shadow-[0_4px_28px_rgba(251,191,36,0.40)]"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24, #fde68a)' }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            />
            <span className="relative flex items-center gap-2">
              احجز مقعدك الآن
              <ArrowLeft className="h-4 w-4" />
            </span>
          </motion.button>
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
        <div className="mb-4 rounded-xl border border-violet-400/25 bg-violet-500/8 px-3 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[0.6rem] font-black uppercase tracking-wider text-violet-400/70">🏛️ إضافة المكتب الخاص</span>
            <span className="rounded-full bg-violet-500/20 border border-violet-400/25 px-2 py-0.5 text-[0.55rem] font-black text-violet-300">+{DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س/حزمة</span>
          </div>
          <p className="mb-1.5 text-[0.72rem] font-bold text-violet-200">مساعد داخلي + مناوب شات — مترابطان</p>
          <div className="space-y-1">
            {[
              '📋 أعطِ تعليماتك بـ«تعليمة:» — المناوب ينفّذها مع كل زبون',
              '🌙 المناوب يرد بذكاء بـ7 لغات عند الإغلاق أو الانشغال',
              '📡 تقارير كل محادثة تصلك تلقائياً في المكتب',
              '💳 رصيد حزمتك + رابط التجديد في ثانية',
            ].map(f => (
              <div key={f} className="flex items-center gap-1.5 text-[0.65rem] text-violet-300/80">
                {f}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <button onClick={() => navigate(ROUTE_PATHS.PRIVATE_OFFICE_GUIDE)}
              className="text-[0.6rem] text-violet-400/55 hover:text-violet-300 underline transition-colors">
              دليل الاستخدام ←
            </button>
            <span className="text-violet-500/30">·</span>
            <button onClick={() => navigate(ROUTE_PATHS.DIGITAL_SHIFT_FEATURE)}
              className="text-[0.6rem] text-violet-400/55 hover:text-violet-300 underline transition-colors">
              شرح تقني ←
            </button>
          </div>
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
        onClick={() => routeToBuyPackage(navigate, {
          tier: (tierQuery as 'bronze' | 'gold' | 'diamond') ?? 'gold',
          plan: 'monthly',
        })}
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
    <section id="الحزم-السنوية" className="relative z-10 border-t border-white/5 py-20 md:py-28">
      {/* خلفية */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-950/10 via-transparent to-transparent" />

      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        {/* رأس القسم */}
        <div className="mb-14 text-center">
          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-black text-amber-300">
            ⚡ العرض التأسيسي لمضاعفة الرخص · الألف الرواد
          </motion.div>
          <motion.h2 initial={{ opacity:0, y:14 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="mb-3 text-3xl font-black text-white md:text-4xl">
            الحزمة السنوية — ٣٦٠ يوم + ٣٦٠ مجاناً
          </motion.h2>
          <p className="text-slate-400 text-sm">اختر حزمتك · سجّل حسابك · ادفع وتفعَّل فوراً</p>

          {/* مراحل الشراء */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-0">
            {['اختر الحزمة','سجّل حسابك','أكمل الدفع','تفعيل فوري'].map((step, i, arr) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.62rem] font-bold ${
                  i === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                  i === 3 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/25' :
                  'bg-white/5 text-slate-400 border border-white/8'
                }`}>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-current/20 text-[0.5rem] font-black">{i+1}</span>
                  {step}
                </div>
                {i < arr.length - 1 && <span className="mx-1 text-slate-700 text-xs">›</span>}
              </div>
            ))}
          </div>
        </div>

        {/* البطاقات */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((t, i) => {
            const isSelected = selected === t.id;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay: i * 0.07 }}
                onClick={() => setSelected(t.id)}
                className={`relative flex flex-col overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 ${
                  isSelected ? `${t.border} ring-2 ring-offset-2 ring-offset-[#060d1a]` : `${t.border} opacity-90 hover:opacity-100`
                } bg-gradient-to-b ${t.bg}`}
                style={{ boxShadow: isSelected ? t.glow : 'none' }}
                dir="rtl"
              >
                {t.best && !isSelected && (
                  <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl px-2.5 py-0.5 text-[0.52rem] font-black text-black"
                    style={{ background: t.color }}>
                    الأعلى طلباً
                  </div>
                )}

                {/* بانر الأيقونة */}
                <div className="relative flex h-24 items-center justify-center overflow-hidden border-b border-white/5"
                  style={{ background: `radial-gradient(ellipse at center, ${t.color}18 0%, transparent 70%)` }}>
                  <motion.div animate={isSelected ? { scale:[1,1.12,1] } : {}} transition={{ duration:1.5, repeat: isSelected ? Infinity : 0 }}>
                    <TierIcon tier={t.icon} />
                  </motion.div>
                  <div className="absolute bottom-2 right-3">
                    <span className="text-[0.48rem] font-black tracking-[0.3em] opacity-30" style={{ color: t.color }}>{t.nameEn}</span>
                  </div>
                  {/* مؤشر الاختيار */}
                  <div className={`absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected ? 'border-current bg-current/30' : 'border-white/20 bg-transparent'
                  }`} style={{ borderColor: isSelected ? t.color : undefined }}>
                    {isSelected && <div className="h-2 w-2 rounded-full" style={{ background: t.color }} />}
                  </div>
                </div>

                {/* محتوى البطاقة */}
                <div className="flex flex-1 flex-col p-4">
                  <p className="mb-0.5 text-xs font-black" style={{ color: t.color }}>{t.name}</p>
                  <p className="text-[0.52rem] text-slate-600 mb-3">360 يوم · ISIC4 474151</p>

                  {/* السعر */}
                  <div className="mb-1 flex items-end gap-1">
                    <span className="text-2xl font-black tabular-nums" style={{ color: t.color }}>
                      {t.price.toLocaleString('ar-SA')}
                    </span>
                    <span className="mb-0.5 text-[0.58rem] text-slate-400">ر.س / سنة</span>
                  </div>
                  <p className="mb-3 text-[0.55rem] text-slate-500">{t.perMonth} ر.س/شهر × ١٢ شهراً</p>

                  {/* مضاعفة العرض */}
                  <div className="mb-3 rounded-xl border border-white/8 bg-black/25 p-2.5 text-center">
                    <p className="text-[0.52rem] font-black uppercase tracking-wider mb-1" style={{ color: t.color, opacity:.7 }}>⚡ عرض المضاعفة</p>
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-center">
                        <p className="text-[0.6rem] font-black text-white">{t.price.toLocaleString('ar-SA')}</p>
                        <p className="text-[0.45rem] text-slate-600">تدفع</p>
                      </div>
                      <span className="text-[0.6rem]" style={{ color: t.color }}>→</span>
                      <div className="text-center">
                        <p className="text-[0.6rem] font-black text-emerald-400">٢٤ شهر</p>
                        <p className="text-[0.45rem] text-slate-600">تحصل</p>
                      </div>
                      <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-1.5 py-1">
                        <p className="text-[0.45rem] text-emerald-400/60">توفير</p>
                        <p className="text-[0.62rem] font-black text-emerald-400">{t.saving.toLocaleString('ar-SA')}</p>
                      </div>
                    </div>
                  </div>

                  {/* الميزات */}
                  <ul className="mb-4 flex flex-col gap-1.5 flex-1">
                    {t.features.map(f => (
                      <li key={f} className="flex items-center gap-1.5 text-[0.65rem] text-slate-300">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: t.color, opacity:.7 }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* زر الاختيار — نقرة واحدة → تحديد، والشراء من الشريط السفلي */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(t.id); }}
                    className="mt-auto w-full rounded-xl py-2.5 text-[0.72rem] font-black transition-all hover:scale-[1.01] active:scale-[0.98]"
                    style={{
                      background: isSelected ? t.color : 'rgba(255,255,255,0.04)',
                      color: isSelected ? '#000' : t.color,
                      border: `1.5px solid ${isSelected ? t.color : t.color + '44'}`,
                      boxShadow: isSelected ? `0 4px 20px ${t.color}45` : 'none',
                    }}
                  >
                    {isSelected ? '✓ محدد' : 'اختر هذه الحزمة'}
                  </button>
                </div>
              </motion.div>
            );
          })}
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
                style={{ background: `linear-gradient(135deg, ${selectedTier.color}18 0%, rgba(6,13,26,0.97) 60%)` }}>
                <div className="flex items-center gap-3">
                  <TierIcon tier={selectedTier.icon} />
                  <div>
                    <p className="text-xs font-bold text-slate-400">الحزمة المختارة</p>
                    <p className="text-base font-black text-white">{selectedTier.name} — {selectedTier.price.toLocaleString('ar-SA')} ر.س/سنة</p>
                    <p className="text-[0.6rem] text-emerald-400">⚡ تدفع ١٢ شهراً وتحصل على ٢٤ · توفير {selectedTier.saving.toLocaleString('ar-SA')} ر.س</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelected(null)}
                    className="text-[0.65rem] text-slate-500 hover:text-slate-300 transition-colors">
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
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-5 py-2 text-[0.68rem] font-bold text-amber-300">
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
          <p className="text-[0.58rem] text-slate-700 mt-2">
            💡 إذا كنت جديداً — ستُحوَّل لصفحة إنشاء الحساب أولاً، ثم يتواصل معك فريقنا لإتمام الدفع
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Digital certificate mockup ──────────────────────────────────────────────
const DEMO_ACTIVATION_CODE = 'HM-LIC-A3F9-K2M1-7X4P';

function CertificateMockup() {
  return (
    <div className="relative mx-auto max-w-md" dir="rtl">
      {/* هالة خارجية */}
      <div className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-amber-400/25 via-amber-600/10 to-emerald-500/15 blur-xl" />

      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/45 bg-gradient-to-b from-[#0f1a0f] via-[#071007] to-[#030803] p-6 shadow-2xl shadow-amber-500/15 sm:p-7">
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
                <h3 className="text-base font-black text-white sm:text-lg">شهادة تفعيل رقمية فاخرة</h3>
                <p className="mt-0.5 text-[0.68rem] leading-relaxed text-slate-400">
                  وثيقة رسمية تُثبت ملكيتك لمنتج حلاق ماب الرقمي
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-1 text-[0.55rem] font-black text-amber-200">
              موثّقة
            </span>
          </div>

          {/* صاحب الرخصة */}
          <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
            <p className="text-[0.58rem] font-semibold tracking-wide text-slate-500">صاحب الرخصة · رخصة النفاذ الرقمية</p>
            <p className="mt-1 text-base font-bold text-white sm:text-lg">صالون ستايل برو للرجال</p>
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
                {DEMO_ACTIVATION_CODE}
              </p>
              <p className="mt-2 text-[0.62rem] leading-relaxed text-amber-100/55">
                احفظ هذا الرمز — مرجعك الوحيد للتحقق، الدعم، وربط لوحة التحكم
              </p>
            </div>
          </motion.div>

          {/* التفاصيل */}
          <div className="grid grid-cols-2 gap-2.5 text-[0.62rem] sm:gap-3">
            {[
              { label: 'الباقة المختارة', value: 'ذهبي 🥇' },
              { label: 'نظام الاستجابة', value: 'الظهور عند الطلب' },
              { label: 'تاريخ الإصدار', value: '٢٣ مايو ٢٠٢٦' },
              { label: 'صلاحية الرخصة', value: '٢٢ يونيو ٢٠٢٦' },
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
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-3 py-2.5">
            <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <div>
              <p className="text-[0.68rem] font-bold text-emerald-200">
                مُصدَرة ومُسجَّلة على نظام حلاق ماب
              </p>
              <p className="mt-0.5 text-[0.58rem] leading-relaxed text-emerald-100/60">
                منتج رقمي رسمي — يصلك فور نجاح الدفع؛ نعتني بكل رخصة كأصلٍ يستحق الفخر
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
  const { effectivePhase, control } = usePlatformAmbient();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'bronze' | 'gold' | 'diamond'>('gold');
  const [scrolled, setScrolled] = useState(false);

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });
  const salons = useCounter(2300, 1800, statsInView);
  const cities = useCounter(47, 1400, statsInView);
  const searches = useCounter(18000, 2000, statsInView);

  return (
    <div
      dir="rtl"
      className="platform-dark platform-ambient relative min-h-screen overflow-x-hidden bg-background text-slate-100"
      style={{ fontFamily: 'Tajawal, system-ui' }}
      data-ambient-phase={effectivePhase}
      data-ambient-control={control}
    >

      {/* أزرار عائمة */}
      <FloatingPlatformActions />
      {/* B2BSalesManagerChat مُدمَج في الهيرو بـ mode="inline" — لا حاجة لطائر ثانٍ */}

      {/* ── شبكة التكتير الخلفية ──────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,1) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <PlatformAmbientBackground variant="partner" />

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
                { label: 'البنرات والمكتب الخاص 🏛️', id: 'معاينة البنرات', icon: ImageIcon },
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
              <PlatformAmbientToggle variant="partner" className="hidden md:inline-flex" />
              <PlatformAmbientToggle variant="partner" className="inline-flex md:hidden" />
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

          {/* ── قائمة موبايل ──────────────────────────────────────────── */}
          <AnimatePresence>
            {scrolled && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="relative border-t border-white/5 bg-[#020912]/97 px-4 py-3 md:hidden"
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
                      onClick={() => { setScrolled(false); document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                      className="rounded-xl px-4 py-2.5 text-right text-sm font-semibold text-slate-300 hover:bg-amber-500/8 hover:text-amber-200 transition-all">
                      {item.label}
                    </button>
                  ))}
                  <button onClick={() => { setScrolled(false); navigate(ROUTE_PATHS.REGISTER); }}
                    className="mt-1 w-full rounded-xl bg-amber-500/15 border border-amber-400/30 py-2.5 text-sm font-black text-amber-300">
                    سجّل صالونك ←
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] overflow-hidden pt-24">
        <div className="pointer-events-none absolute -right-80 top-0 h-[700px] w-[700px] rounded-full bg-amber-500/6 blur-[150px]" />
        <div className="pointer-events-none absolute -left-60 bottom-0 h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-[130px]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
          {/* Text */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>

            {/* ── مدير مبيعات B2B — تحت الهيدر وفوق النص ── */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-5"
            >
              <B2BSalesManagerChat mode="inline" />
            </motion.div>

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
              <PlatformTlsTrustBadge variant="compact" tone="dark" />
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
            className="relative flex flex-col gap-4"
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
              ٤ خطوات — التفعيل آلي وفوري
            </motion.h2>
            <p className="mt-2 text-sm text-emerald-400/70 font-semibold">✅ لا مراجعة إدارية · لا انتظار · تفعيل فوري بعد السداد</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '١', icon: Scissors, title: 'أكمل نموذج التسجيل', desc: 'بيانات صالونك الأساسية: الاسم، الموقع، الخدمات، صور الواجهة — في دقائق.', color: 'from-amber-500 to-yellow-500' },
              { step: '٢', icon: Crown, title: 'اختر حزمتك', desc: 'برونزي (١٠٠ ر.س) · ذهبي (١٥٠ ر.س) · ماسي (٢٠٠ ر.س) — أو الحزمة السنوية بعرض المضاعفة.', color: 'from-violet-500 to-purple-500' },
              { step: '٣', icon: Shield, title: 'ادفع بأمان فوراً', desc: 'عبر بوابة ميسر الآمنة (مدى · فيزا · ماستركارد) — اتصال HTTPS/TLS بتقييم SSL Labs A+، مسبقة الدفع، لا تجديد تلقائي.', color: 'from-teal-500 to-cyan-500' },
              { step: '٤', icon: Wifi, title: 'ظهورك يبدأ فوراً ⚡', desc: 'بمجرد نجاح السداد يُفعَّل صالونك تلقائياً ويظهر لأقرب الزبائن منك على الرادار.', color: 'from-emerald-500 to-green-500' },
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
            <FeatureCard icon={Brain} title="إضافة المكتب الخاص 🏛️" desc="مساعد داخلي + مناوب شات مترابطان — أعطِ تعليماتك، المناوب ينفّذها، والتقارير تصلك فوراً." color="from-violet-600 to-indigo-600" delay={0.24} badge="Diamond Add-on" />
            <FeatureCard icon={Users} title="خدمة كبار السن وذوي الاحتياجات" desc="إعلان موجَّه لشريحة لا تجدها في أي منصة أخرى — ميزة تنافسية حقيقية." color="from-sky-500 to-blue-400" delay={0.08} badge="Gold +" />
            <FeatureCard icon={QrCode} title="بورتفوليو صور" desc="اعرض أعمالك الفعلية — المزيد من الصور = المزيد من الثقة قبل الزيارة." color="from-orange-500 to-red-500" delay={0.16} badge="Diamond +" />
            <FeatureCard icon={FileCheck} title="شهادة تفعيل فاخرة" desc="وثيقة رقمية رسمية بعد كل دفعة — كود تفعيل بارز، بيانات الرخصة، واهتمام حلاق ماب بمنتجها." color="from-amber-600 to-orange-500" delay={0.24} />
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

          {/* ── العرض التأسيسي لمضاعفة الرخص ── */}
          <FoundersOfferBanner onRegister={() => {
            document.getElementById('الحزم-السنوية')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }} />

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
                `${DIAMOND_PRODUCT_STANDARD_LABEL_AR} | +${DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س إضافة المكتب الخاص 🏛️`,
              ]}
            />
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
        <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-[50%] rounded-full bg-amber-500/6 blur-[120px]" />
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
              <ImageIcon className="h-4 w-4" /> معاينة البنرات والمكتب الخاص 🏛️
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
                <FileCheck className="h-3 w-3" /> بعد كل دفعة — فوراً
              </div>
              <h2 className="mb-5 text-3xl font-black text-white">شهادة تفعيل تليق بشراكتك</h2>
              <p className="mb-6 text-base leading-relaxed text-slate-400">
                حلاق ماب لا تبيع «اشتراكاً» فقط — تُسلّمك وثيقة رقمية فاخرة تُثبت ملكيتك لرخصة النفاذ:
                اسم منشأتك، باقتك، تواريخ الصلاحية، و**كود تفعيل فريد** يُبرز كمفتاح رخصتك الرسمي.
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  'كود تفعيل بارز بتنسيق `HM-LIC-XXXX-XXXX-XXXX`',
                  'إصدار فوري بعد نجاح الدفع — دون انتظار',
                  'اسم المنشأة والباقة وصلاحية الرخصة موثّقة',
                  'مرجع رسمي للتحقق والدعم ولوحة التحكم',
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
