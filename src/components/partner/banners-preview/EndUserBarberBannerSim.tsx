/**
 * EndUserBarberBannerSim — بطاقة الحلاق بستايل منصة حلاق ماب
 *
 * إعادة تصميم كاملة: بطاقة صباحية مشرقة + حدود واضحة + أيقونات جذابة
 * تُوحي بأن البطاقة تابعة لمنصة حلاق ماب بهويتها الكاملة
 * وتحافظ على الفخامة دون الدخول في سواد بصري ثقيل
 */

import { MapPin, MessageCircle, Phone, Shield, Sparkles, Star, Navigation } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { motion, useReducedMotion } from 'framer-motion';
import type { BannerPreviewTierConfig } from '@/config/partnerBannersPreviewCopy';
import { useBannerPreviewSim, type BannerSimPhase } from '@/hooks/useBannerPreviewSim';
import { BannerRadiationField } from '@/components/BannerRadiationField';
import { cn } from '@/lib/utils';

// ── Phase labels ──────────────────────────────────────────────────────────────
const PHASE_LABEL: Record<BannerSimPhase, { text: string; color: string }> = {
  portfolio: { text: 'العميل يتصفح معرض الأعمال', color: 'border-teal-200 bg-teal-50 text-teal-800 shadow-sm' },
  comms:     { text: 'العميل ينقر للتواصل المباشر',  color: 'border-amber-200 bg-amber-50 text-amber-800 shadow-sm' },
  map:       { text: 'العميل يفتح الموقع على الخريطة', color: 'border-cyan-200 bg-cyan-50 text-cyan-800 shadow-sm' },
};

// ── Tier config ────────────────────────────────────────────────────────────────
const TIER_THEME = {
  bronze: {
    card:    'from-[#fffdf8] via-[#fff8ef] to-[#fdf0de]',
    border:  'border-amber-200/85',
    accent:  '#a16207',
    badgeBg: 'border border-amber-200/85 bg-gradient-to-r from-stone-50 via-amber-50 to-orange-50 text-amber-900',
    ring:    'ring-amber-100/90',
    btnPrimary: 'from-[#9f7a2b] to-[#7b5b1d] shadow-[0_14px_28px_rgba(161,98,7,0.18)]',
    heroOverlay: 'linear-gradient(to top, rgba(255,252,246,0.95) 0%, rgba(255,249,242,0.64) 12%, rgba(255,255,255,0.10) 24%, transparent 42%)',
  },
  gold: {
    card:    'from-[#fffefb] via-[#fdf8ee] to-[#faf1df]',
    border:  'border-[#ead7a9]/78',
    accent:  '#9b7a2f',
    badgeBg: 'border border-[#e9d8ad]/90 bg-gradient-to-r from-[#fbf6ec] via-[#f6ecda] to-[#fffaf1] text-[#725418]',
    ring:    'ring-[#f0e4c7]/70',
    btnPrimary: 'from-[#ba9243] to-[#8b6825] shadow-[0_12px_24px_rgba(155,122,47,0.18)]',
    heroOverlay: 'linear-gradient(to top, rgba(255,251,244,0.95) 0%, rgba(248,239,224,0.62) 12%, rgba(255,255,255,0.08) 24%, transparent 42%)',
  },
  diamond: {
    card:    'from-[#feffff] via-[#f7fcfd] to-[#edf8fb]',
    border:  'border-[#bedee8]/92',
    accent:  '#18687a',
    badgeBg: 'border border-[#cfe6ee]/92 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(239,248,251,0.95))] text-[#215d6a]',
    ring:    'ring-[#deeff4]/80',
    btnPrimary: 'from-[#336f7c] via-[#2b6270] to-[#214d57] shadow-[0_10px_22px_rgba(24,104,122,0.13)]',
    heroOverlay: 'linear-gradient(to top, rgba(247,252,255,0.72) 0%, rgba(234,245,249,0.22) 10%, rgba(255,255,255,0.03) 18%, transparent 32%)',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
type Props = { tier: BannerPreviewTierConfig; startDelayMs?: number };

export function EndUserBarberBannerSim({ tier, startDelayMs = 0 }: Props) {
  const reduceMotion = useReducedMotion();
  const { phase, portfolioIndex } = useBannerPreviewSim(tier.galleryVisibleSlots, reduceMotion, startDelayMs);

  const isDiamond = tier.id === 'diamond';
  const isGold    = tier.id === 'gold';
  const isBronze  = tier.id === 'bronze';
  const theme     = TIER_THEME[tier.id];

  const simCounter = Math.min(
    tier.galleryMax,
    Math.floor((portfolioIndex / Math.max(1, tier.galleryVisibleSlots - 1)) * tier.galleryMax) + 1,
  );
  const heroSrc = tier.galleryImages[portfolioIndex % tier.galleryImages.length] ?? tier.heroImage;
  const phaseInfo = PHASE_LABEL[phase];

  return (
    <div className="relative mx-auto w-full max-w-sm" dir="rtl">

      {/* Phase label */}
      <div className="mb-2 flex items-center justify-center">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold', phaseInfo.color)}
        >
          <motion.div className="h-1.5 w-1.5 rounded-full bg-current"
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }} />
          {phaseInfo.text}
        </motion.div>
      </div>

      {/* The card */}
      <BannerRadiationField tier={tier.id}>
        <motion.div
          className={cn(
            'relative overflow-hidden rounded-[1.7rem] border bg-gradient-to-b shadow-[0_22px_48px_rgba(148,163,184,0.12)]',
            theme.card, theme.border,
            'ring-1', theme.ring,
          )}
          layout
        >
        {/* Top scan line decoration */}
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}55, transparent)` }} />

        {/* ── Hero image (Gold & Diamond) ──────────────── */}
        {(isGold || isDiamond) && (
          <div className={cn('relative overflow-hidden', isDiamond ? 'h-48' : 'h-40')}>
            <motion.img
              key={heroSrc}
              src={heroSrc}
              alt=""
              className="h-full w-full object-cover"
              initial={{ opacity: 0.7, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            />
            {/* Gradient overlay — platform branded */}
            <div className="absolute inset-0"
              style={{ background: theme.heroOverlay }} />
            <div
              className="absolute inset-x-0 bottom-0 h-5"
              style={{ background: `linear-gradient(180deg, transparent 0%, ${theme.accent}05 100%)` }}
            />
            <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white/6 via-white/2 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/30" />

            {/* Tier badge top-right */}
            <div className={cn('absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-[0_6px_12px_rgba(15,23,42,0.05)] backdrop-blur-sm', theme.badgeBg)}>
              {isDiamond ? <Sparkles className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
              {isDiamond ? 'ماسي 💎' : 'ذهبي 🥇'}
            </div>

            {/* VIP badge (diamond only) */}
            {isDiamond && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[#d8ecf3]/95 bg-white/92 px-2.5 py-1 text-[9px] font-bold tracking-[0.08em] text-cyan-700 shadow-[0_4px_8px_rgba(15,23,42,0.04)] backdrop-blur-sm">
                <Shield className="h-3 w-3" />
                VIP
              </div>
            )}

            {/* Diamond video badge */}
            {isDiamond && tier.hasVideoBanner && (
              <div className="absolute bottom-3 left-3 rounded-full border border-[#d8ecf3]/90 bg-white/86 px-2.5 py-1 text-[8px] font-medium text-slate-600 shadow-[0_4px_8px_rgba(15,23,42,0.03)] backdrop-blur-sm">
                🎬 بنر فيديو · ماسي حصراً
              </div>
            )}
          </div>
        )}

        {/* ── Card body ────────────────────────────────── */}
        <div className="p-4">

          {/* Barber info header */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Name */}
              <h3 className={cn('font-black leading-tight text-slate-950', isDiamond ? 'text-[1rem]' : 'text-[0.92rem]')}>
                صالون العرض · {tier.name}
              </h3>

              {/* Stars + count */}
              <div className="mt-1 flex items-center gap-1.5">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3" style={{ color: theme.accent, fill: theme.accent }} />
                  ))}
                </div>
                <span className="text-[0.65rem] font-semibold" style={{ color: theme.accent }}>4.9</span>
                <span className="text-[0.65rem] text-slate-500">(128 تقييم)</span>
              </div>

              {/* Distance + status */}
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex items-center gap-1 text-[0.65rem] text-slate-500">
                  <MapPin className="h-3 w-3" style={{ color: theme.accent }} />
                  <span>800م منك</span>
                </div>
                <div className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6rem] font-bold shadow-[0_4px_10px_rgba(15,23,42,0.035)]"
                  style={{ borderColor: `${theme.accent}24`, backgroundColor: `${theme.accent}09`, color: theme.accent }}>
                  <motion.div className="h-1 w-1 rounded-full" style={{ backgroundColor: theme.accent }}
                    animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  مفتوح الآن
                </div>
              </div>
            </div>

            {/* Bronze badge */}
            {isBronze && (
              <div className="shrink-0 flex flex-col items-center gap-1 rounded-xl border border-amber-200/90 bg-white/90 px-2.5 py-2 shadow-[0_6px_14px_rgba(15,23,42,0.045)]">
                <span className="text-base">🥉</span>
                <span className="text-[0.55rem] font-bold text-amber-600">برونزي</span>
              </div>
            )}
          </div>

          {/* ── Gallery ──────────────────────────────────── */}
          <motion.div
            className={cn(
              'mb-3.5 overflow-hidden rounded-[1.15rem] border transition-all duration-500 shadow-[0_10px_22px_rgba(148,163,184,0.08)]',
              phase === 'portfolio'
                ? `border-current bg-current/5 ring-1 ring-current/20`
                : isDiamond
                  ? 'border-[#d5e9f0]/92 bg-[#fbfeff]'
                  : 'border-slate-200/90 bg-white/90',
            )}
            style={phase === 'portfolio' ? { borderColor: `${theme.accent}55`, backgroundColor: `${theme.accent}08`, boxShadow: `0 0 12px ${theme.accent}15` } : {}}
          >
            {/* Gallery header */}
            <div className={cn(
              'flex items-center justify-between border-b px-2.5 py-2.5',
              isDiamond ? 'border-[#deeff4]' : 'border-slate-100/90',
            )}>
              <span className="text-[0.62rem] font-bold" style={{ color: `${theme.accent}d8` }}>
                معرض الأعمال
              </span>
              <span className="rounded-full px-2 py-0.5 text-[0.58rem] font-semibold"
                style={{ backgroundColor: `${theme.accent}10`, color: `${theme.accent}` }}>
                {simCounter} / {tier.galleryMax}
              </span>
            </div>

            {/* Image grid */}
            <div className={cn(
              'grid gap-1.5 px-2 pb-2.5 pt-2.5',
              tier.galleryVisibleSlots <= 4 ? 'grid-cols-4' : 'grid-cols-4',
            )}>
              {tier.galleryImages.slice(0, Math.min(tier.galleryVisibleSlots, 8)).map((src, idx) => {
                const isActive = portfolioIndex % tier.galleryVisibleSlots === idx;
                return (
                  <motion.div
                    key={`${src}-${idx}`}
                    className={cn(
                      'relative aspect-square overflow-hidden rounded-[0.95rem] border shadow-[0_6px_14px_rgba(15,23,42,0.05)]',
                      isDiamond ? 'border-[#d5e9f0]' : 'border-white/85',
                    )}
                    animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div className="absolute inset-0 rounded-lg"
                        style={{ boxShadow: `inset 0 0 0 2px ${theme.accent}, 0 3px 10px ${theme.accent}08`, background: `${theme.accent}05` }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                    )}
                    {/* Inactive overlay */}
                    {!isActive && (
                      <div className="absolute inset-0 rounded-lg bg-white/10" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Action buttons ────────────────────────────── */}
          <div className="flex gap-2">
            {/* Location button */}
            <motion.button
              type="button" tabIndex={-1} aria-hidden
              className={cn(
                'relative flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-2xl py-2.5 text-[0.8rem] font-bold text-white bg-gradient-to-r',
                theme.btnPrimary,
                'transition-all',
              )}
              animate={phase === 'map' ? { scale: [1, 1.04, 1] } : { scale: 1 }}
              transition={{ duration: 0.6, repeat: phase === 'map' ? Infinity : 0 }}
            >
              {/* Map ripple */}
              {phase === 'map' && (
                <>
                  <motion.div className="absolute inset-0 rounded-xl border-2 border-white/50"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }} />
                  <motion.div className="absolute inset-0 rounded-xl border border-white/30"
                    animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                    transition={{ duration: 1, delay: 0.3, repeat: Infinity }} />
                </>
              )}
              <Navigation className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">الموقع</span>
            </motion.button>

            {/* WhatsApp */}
            <motion.button
              type="button" tabIndex={-1} aria-hidden
              className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] text-white"
              style={{ background: 'linear-gradient(135deg, #2bbd6a, #1c7d6a)', boxShadow: phase === 'comms' ? '0 0 12px #25D36644' : '0 8px 16px rgba(37,211,102,0.15)' }}
              animate={phase === 'comms' ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.5, repeat: phase === 'comms' ? Infinity : 0 }}
            >
              {phase === 'comms' && (
                <motion.div className="absolute inset-0 rounded-xl bg-white/30"
                  animate={{ opacity: [0.3, 0] }} transition={{ duration: 0.8, repeat: Infinity }} />
              )}
              <SiWhatsapp className="relative z-10 h-4.5 w-4.5" />
            </motion.button>

            {/* Phone / Chat */}
            <motion.button
              type="button" tabIndex={-1} aria-hidden
              className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[1rem]"
              style={{
                background: isBronze
                  ? 'linear-gradient(135deg, #b45309, #78350f)'
                  : `linear-gradient(135deg, ${theme.accent}90, ${theme.accent}60)`,
                color: 'white',
                boxShadow: isDiamond
                  ? phase === 'comms'
                    ? `0 0 8px ${theme.accent}18, inset 0 1px 0 rgba(255,255,255,0.12)`
                    : `0 7px 14px ${theme.accent}08, inset 0 1px 0 rgba(255,255,255,0.10)`
                  : phase === 'comms'
                    ? `0 0 10px ${theme.accent}28`
                    : `0 7px 14px ${theme.accent}11`,
              }}
              animate={phase === 'comms' ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, repeat: phase === 'comms' ? Infinity : 0 }}
            >
              {phase === 'comms' && (
                <motion.div className="absolute inset-0 rounded-xl bg-white/25"
                  animate={{ opacity: [0.25, 0] }} transition={{ duration: 0.8, delay: 0.1, repeat: Infinity }} />
              )}
              {isBronze
                ? <Phone className="relative z-10 h-4 w-4" />
                : <MessageCircle className="relative z-10 h-4 w-4" />}
            </motion.button>
          </div>

          {/* Map phase toast */}
          {phase === 'map' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="mt-2.5 flex items-center gap-2 rounded-xl border px-3 py-2 text-[0.68rem] font-medium shadow-[0_6px_12px_rgba(15,23,42,0.045)]"
              style={{
                borderColor: `${theme.accent}20`,
                backgroundColor: 'rgba(255,255,255,0.92)',
                color: theme.accent,
              }}
            >
              <Navigation className="h-3 w-3 shrink-0" />
              يفتح تطبيق الخرائط — توجيه فوري للصالون 📍
            </motion.div>
          )}

          {/* Platform watermark */}
          <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-slate-200/80 pt-2.5">
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.accent, opacity: 0.7 }} />
            <span className="text-[0.55rem] font-semibold tracking-[0.16em]" style={{ color: `${theme.accent}44` }}>
              حلاق ماب · HALAQ MAP
            </span>
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.accent, opacity: 0.7 }} />
          </div>
        </div>

        {/* Bottom glow line */}
        <div className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}40, transparent)` }} />
        </motion.div>
      </BannerRadiationField>
    </div>
  );
}
