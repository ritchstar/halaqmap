/**
 * LicenseRechargeWidget — شاحن رصيد رخصة النفاذ الرقمية
 *
 * ثلاثة أوضاع:
 *  - register   → يحيل لتعبئة طلب التسجيل مع الباقة والأشهر محددة مسبقاً
 *  - recharge   → يحيل لصفحة الدفع (للأعضاء القائمين)
 *  - auto       → يستخدم register إن لم يكن barberMode، recharge إن كان
 *
 * الاستخدام:
 *   <LicenseRechargeWidget />           ← تسجيل (صفحات عامة)
 *   <LicenseRechargeWidget mode="recharge" /> ← شحن (لوحة الحلاق)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { BannerRadiationField, bannerRadiationTierFromId } from '@/components/BannerRadiationField';

type Mode = 'register' | 'recharge' | 'auto';

type Props = {
  mode?: Mode;
  /** عرض الشعار والعنوان */
  showHeader?: boolean;
  className?: string;
};

type TierId = 'bronze' | 'gold' | 'diamond' | 'diamond_office';

const TIERS: {
  id: TierId;
  emoji: string;
  name: string;
  pricePerMonth: number;
  addonPrice: number;
  accentFrom: string;
  accentTo: string;
  border: string;
  glow: string;
  badge?: string;
  highlights: string[];
}[] = [
  {
    id: 'bronze', emoji: '🥉', name: 'برونزي', pricePerMonth: 100, addonPrice: 0,
    accentFrom: '#92400e', accentTo: '#d97706', border: 'rgba(217,119,6,0.35)', glow: 'rgba(217,119,6,0.18)',
    highlights: ['ظهور جغرافي على الرادار', 'بطاقة صالون رقمية', 'مفتوح/مغلق لحظي'],
  },
  {
    id: 'gold', emoji: '🥇', name: 'ذهبي', pricePerMonth: 150, addonPrice: 0,
    accentFrom: '#b45309', accentTo: '#fbbf24', border: 'rgba(251,191,36,0.40)', glow: 'rgba(251,191,36,0.22)',
    highlights: ['أولوية في نتائج البحث', 'معرض أعمال 20 صورة', 'QR تقييم موثّق'],
  },
  {
    id: 'diamond', emoji: '💎', name: 'ماسي', pricePerMonth: 200, addonPrice: 0,
    accentFrom: '#0891b2', accentTo: '#22d3ee', border: 'rgba(34,211,238,0.45)', glow: 'rgba(34,211,238,0.25)',
    badge: 'الأكثر اختياراً',
    highlights: ['صدارة المنطقة', 'شات مترجم 7 لغات', 'معرض 40 صورة + مواعيد'],
  },
  {
    id: 'diamond_office', emoji: '🏛️', name: 'ماسي + المكتب', pricePerMonth: 200, addonPrice: 25,
    accentFrom: '#4f46e5', accentTo: '#a78bfa', border: 'rgba(167,139,250,0.45)', glow: 'rgba(167,139,250,0.28)',
    badge: '✦ الأكمل',
    highlights: ['كل مزايا الماسي', 'مساعد داخلي بتعليماتك', 'مناوب شات ذكي 24/7'],
  },
];

const MONTH_PRESETS = [1, 3, 6, 12] as const;

function plural(n: number) {
  if (n === 1) return 'شهر واحد';
  if (n === 2) return 'شهران';
  if (n <= 10) return `${n} أشهر`;
  return `${n} شهراً`;
}

function saving(tier: typeof TIERS[number], months: number): number {
  if (months < 6) return 0;
  if (months === 6) return Math.round((tier.pricePerMonth + tier.addonPrice) * 0.5);
  if (months === 12) return Math.round((tier.pricePerMonth + tier.addonPrice) * 2);
  return 0;
}

export function LicenseRechargeWidget({ mode = 'register', showHeader = true, className = '' }: Props) {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<TierId>('diamond');
  const [months, setMonths] = useState(1);

  const tier = TIERS.find((t) => t.id === selectedTier)!;
  const unitPrice = tier.pricePerMonth + tier.addonPrice;
  const total = unitPrice * months;
  const saved = saving(tier, months);
  const isAnnual = months === 12;

  const tierQuery = selectedTier === 'diamond_office' ? 'diamond' : selectedTier;
  const addonParam = selectedTier === 'diamond_office' ? '&addon=office' : '';

  const registerTo = `${ROUTE_PATHS.REGISTER}?tier=${tierQuery}&months=${months}${addonParam}`;
  const rechargeTo = `${ROUTE_PATHS.PAYMENT}?tier=${tierQuery}&qty=${months}${addonParam}`;
  const ctaTo = mode === 'recharge' ? rechargeTo : registerTo;
  const ctaLabel = mode === 'recharge' ? 'شحن الرصيد الآن' : 'سجّل وابدأ الآن';
  const handleCta = () => {
    navigate(ctaTo);
  };

  return (
    <div dir="rtl" className={`relative overflow-hidden rounded-3xl ${className}`}
      style={{
        background: 'linear-gradient(160deg,#040d1a 0%,#020810 50%,#040d1a 100%)',
        border: '1px solid rgba(20,184,166,0.12)',
      }}
    >
      {/* خلفية سديمية */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-1/3 h-64 w-64 rounded-full bg-teal-500/8 blur-[100px]" />
        <div className="absolute -bottom-16 left-1/3 h-48 w-80 rounded-full bg-violet-500/8 blur-[90px]" />
      </div>

      <div className="relative p-6 md:p-8">
        {/* الرأسية */}
        {showHeader && (
          <div className="mb-8 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-[0.7rem] font-black tracking-wider text-teal-300">
              <Sparkles className="h-3.5 w-3.5" />
              {mode === 'recharge' ? 'شحن رصيد رخصة النفاذ' : 'رخصة نفاذ رقمية · احجز موقعك'}
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              {mode === 'recharge' ? 'اختر باقتك وعدد الأشهر' : 'اختر باقتك وابدأ الآن'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              مسبقة الدفع · لا تجديد تلقائي · لا عمولة · كل حزمة = 30 يوم نفاذ
            </p>
          </div>
        )}

        <div className="banner-radiation-stage">
        <div className="banner-radiation-grid relative z-[1] grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* عمود اليمين: اختيار الباقة */}
          <div className="flex flex-col gap-3">
            <p className="text-[0.7rem] font-black tracking-widest text-slate-500">① اختر مستوى الرخصة</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TIERS.map((t) => (
                <motion.button
                  key={t.id}
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedTier(t.id)}
                  className="relative flex h-[6.5rem] flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl px-2 text-center transition-all duration-300"
                  style={{
                    border: selectedTier === t.id ? `1.5px solid ${t.border}` : '1.5px solid rgba(255,255,255,0.07)',
                    background: selectedTier === t.id
                      ? `linear-gradient(155deg,${t.accentFrom}22 0%,#040d1a 70%,${t.accentTo}0e 100%)`
                      : 'rgba(255,255,255,0.02)',
                    boxShadow: selectedTier === t.id ? `0 0 24px ${t.glow}` : 'none',
                  }}
                >
                  {t.badge && (
                    <div className="absolute left-0 right-0 top-0 flex justify-center">
                      <span
                        className="rounded-b-xl px-2 py-0.5 text-[0.5rem] font-black text-black"
                        style={{ background: `linear-gradient(90deg,${t.accentFrom},${t.accentTo})` }}
                      >
                        {t.badge}
                      </span>
                    </div>
                  )}
                  {/* مسافة ثابتة للبادج — موجودة أم لا */}
                  <span className="block h-3.5 w-full shrink-0" />
                  <span className="text-xl leading-none">{t.emoji}</span>
                  <span className="text-xs font-black leading-tight text-white">{t.name}</span>
                  <span
                    className="text-[0.62rem] font-bold tabular-nums"
                    style={{ color: t.accentTo }}
                  >
                    {t.pricePerMonth + t.addonPrice} ر.س
                  </span>
                  {selectedTier === t.id && (
                    <motion.div
                      layoutId="tier-sel"
                      className="absolute inset-0 rounded-2xl"
                      style={{ border: `1.5px solid ${t.accentTo}40` }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* مميزات الباقة المختارة */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTier}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="flex flex-wrap gap-2 pt-1"
              >
                {tier.highlights.map((h) => (
                  <span
                    key={h}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold text-slate-300"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: tier.accentTo }} />
                    {h}
                  </span>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* ② اختيار عدد الأشهر */}
            <div className="mt-2">
              <p className="mb-3 text-[0.7rem] font-black tracking-widest text-slate-500">② اختر عدد الأشهر</p>

              {/* أزرار سريعة */}
              <div className="flex flex-wrap gap-2">
                {MONTH_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setMonths(n)}
                    className="relative rounded-xl px-4 py-2 text-sm font-bold transition-all"
                    style={{
                      border: months === n ? `1.5px solid ${tier.border}` : '1.5px solid rgba(255,255,255,0.1)',
                      background: months === n
                        ? `linear-gradient(135deg,${tier.accentFrom}28,${tier.accentTo}18)`
                        : 'rgba(255,255,255,0.03)',
                      color: months === n ? tier.accentTo : 'rgb(148,163,184)',
                      boxShadow: months === n ? `0 0 16px ${tier.glow}` : 'none',
                    }}
                  >
                    {n === 12 ? '🗓️ سنة كاملة' : plural(n)}
                    {n === 6 && <span className="mr-1 text-[0.55rem] opacity-70">·توفير</span>}
                  </button>
                ))}
              </div>

              {/* شريط سحب دقيق */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[0.6rem] font-bold text-slate-600">1</span>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full"
                  style={{
                    background: `linear-gradient(to right,${tier.accentTo} ${((months - 1) / 11) * 100}%,rgba(255,255,255,0.1) ${((months - 1) / 11) * 100}%)`,
                  }}
                />
                <span className="text-[0.6rem] font-bold text-slate-600">12</span>
              </div>
              <p className="mt-1 text-center text-[0.65rem] text-slate-500">{plural(months)}</p>
            </div>
          </div>

          {/* عمود اليسار: ملخص + CTA */}
          <div className="flex flex-col justify-between overflow-visible">
            <AnimatePresence mode="wait">
              <BannerRadiationField tier={bannerRadiationTierFromId(selectedTier)} className="h-full">
              <motion.div
                key={`${selectedTier}-${months}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="banner-major-card-face flex h-full flex-col gap-4 overflow-hidden rounded-2xl border p-5"
                style={{ borderColor: tier.border }}
              >
                <div className="banner-major-card-copy flex flex-1 flex-col gap-4">
                {/* شعار الباقة */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: `linear-gradient(135deg,${tier.accentFrom}30,${tier.accentTo}20)`, border: `1px solid ${tier.border}` }}
                  >
                    {tier.emoji}
                  </div>
                  <div>
                    <p className="banner-glow-safe-text text-base font-black leading-tight">{tier.name}</p>
                    <p className="banner-glow-safe-text-muted text-[0.62rem]">{plural(months)} نفاذ متواصل</p>
                  </div>
                </div>

                {/* الفاصل */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                {/* السعر */}
                <div className="text-center">
                  <div className="flex items-end justify-center gap-1">
                    <span className="banner-glow-safe-price font-mono text-4xl tabular-nums">
                      {total.toLocaleString('ar-SA')}
                    </span>
                    <div className="mb-1 flex flex-col text-right leading-none">
                      <span className="banner-glow-safe-text text-sm font-bold">ر.س</span>
                      <span className="banner-glow-safe-text-muted text-[0.52rem]">إجمالي</span>
                    </div>
                  </div>
                  <p className="banner-glow-safe-text-muted mt-1 text-[0.65rem]">
                    {unitPrice} ر.س × {months} {months === 1 ? 'شهر' : 'أشهر'}
                  </p>
                  {saved > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="banner-glow-safe-accent mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-950/50 px-3 py-1 text-[0.62rem] font-black"
                    >
                      <Zap className="h-3 w-3" />
                      {isAnnual ? 'سنة كاملة — قيمة مضافة' : `توفير ${saved} ر.س إضافي`}
                    </motion.div>
                  )}
                </div>

                {/* ضمانات مختصرة */}
                <div className="banner-glow-safe-text-muted space-y-1.5 text-[0.62rem]">
                  <p>✅ دفع لمرة واحدة · لا تجديد تلقائي</p>
                  <p>✅ تفعيل فوري بعد الدفع</p>
                  <p>✅ شهادة رخصة نفاذ رقمية</p>
                </div>

                {/* زر CTA */}
                <motion.button
                    type="button"
                    onClick={handleCta}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative w-full overflow-hidden rounded-xl py-3.5 text-center text-sm font-black cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg,${tier.accentFrom},${tier.accentTo})`,
                      boxShadow: `0 0 28px ${tier.glow},0 4px 14px ${tier.glow}`,
                      color: selectedTier === 'gold' ? '#000' : '#fff',
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {ctaLabel}
                      <ChevronRight className="h-4 w-4" />
                    </span>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                </motion.button>
                </div>
              </motion.div>
              </BannerRadiationField>
            </AnimatePresence>
          </div>
        </div>
        </div>

        {/* الفوتر */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right,transparent,rgba(20,184,166,0.18),transparent)' }} />
          <p className="text-[0.58rem] font-bold tracking-widest text-slate-700">HALAQ MAP · DIGITAL LICENSE · B2B · ISIC4 474151</p>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left,transparent,rgba(20,184,166,0.18),transparent)' }} />
        </div>
      </div>
    </div>
  );
}
