/**
 * EndUserBarberBannerSim — بطاقة الحلاق بستايل منصة حلاق ماب
 *
 * إعادة تصميم كاملة: خلفية داكنة متدرجة + حدود متوهجة + أيقونات جذابة
 * تُوحي بأن البطاقة تابعة لمنصة حلاق ماب بهويتها الكاملة
 * مشرقة وواضحة عبر التوهجات والتدرجات — ليست داكنة مطفأة
 */

import { MapPin, MessageCircle, Phone, Shield, Sparkles, Star, Navigation, Clock } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { motion, useReducedMotion } from 'framer-motion';
import type { BannerPreviewTierConfig } from '@/config/partnerBannersPreviewCopy';
import { useBannerPreviewSim, type BannerSimPhase } from '@/hooks/useBannerPreviewSim';
import { BannerRadiationField } from '@/components/BannerRadiationField';
import { cn } from '@/lib/utils';

// ── Phase labels ──────────────────────────────────────────────────────────────
const PHASE_LABEL: Record<BannerSimPhase, { text: string; color: string }> = {
  portfolio: { text: 'العميل يتصفح معرض الأعمال', color: 'border-teal-400/40 bg-teal-500/10 text-teal-200' },
  comms:     { text: 'العميل ينقر للتواصل المباشر',  color: 'border-amber-400/40 bg-amber-500/10 text-amber-200' },
  map:       { text: 'العميل يفتح الموقع على الخريطة', color: 'border-cyan-400/40 bg-cyan-500/10 text-cyan-200' },
};

// ── Tier config ────────────────────────────────────────────────────────────────
const TIER_THEME = {
  bronze: {
    card:    'from-[#0d1c10] via-[#091410] to-[#060d0a]',
    border:  'border-amber-700/35',
    accent:  '#d4903a',
    badgeBg: 'bg-gradient-to-r from-amber-700/80 to-amber-600/80 text-amber-50',
    ring:    'ring-amber-700/20',
    btnPrimary: 'from-teal-600 to-teal-800 shadow-teal-500/20',
  },
  gold: {
    card:    'from-[#1a1400] via-[#120f00] to-[#0a0900]',
    border:  'border-amber-400/50',
    accent:  '#fbbf24',
    badgeBg: 'bg-gradient-to-r from-amber-400/90 to-yellow-500/90 text-black',
    ring:    'ring-amber-400/25',
    btnPrimary: 'from-amber-500 to-amber-700 shadow-amber-500/25',
  },
  diamond: {
    card:    'from-[#040f1a] via-[#050e1c] to-[#020912]',
    border:  'border-cyan-400/55',
    accent:  '#22d3ee',
    badgeBg: 'bg-gradient-to-r from-cyan-500/90 to-sky-400/90 text-white',
    ring:    'ring-cyan-400/30',
    btnPrimary: 'from-cyan-600 to-sky-700 shadow-cyan-500/25',
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
            'relative overflow-hidden rounded-2xl border bg-gradient-to-b',
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
              style={{ background: `linear-gradient(to top, #020912 0%, ${theme.accent}18 50%, transparent 100%)` }} />

            {/* Tier badge top-right */}
            <div className={cn('absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm', theme.badgeBg)}>
              {isDiamond ? <Sparkles className="h-3 w-3 animate-pulse" /> : <Sparkles className="h-3 w-3" />}
              {isDiamond ? 'ماسي 💎' : 'ذهبي 🥇'}
            </div>

            {/* VIP badge (diamond only) */}
            {isDiamond && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-cyan-400/50 bg-cyan-950/70 px-2.5 py-1 text-[10px] font-bold text-cyan-200 backdrop-blur-sm">
                <Shield className="h-3 w-3" />
                VIP
              </div>
            )}

            {/* Diamond video badge */}
            {isDiamond && tier.hasVideoBanner && (
              <div className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[9px] font-semibold text-white backdrop-blur-sm">
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
              <h3 className={cn('font-black leading-tight text-white', isDiamond ? 'text-[1.05rem]' : 'text-[0.95rem]')}>
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
                <div className="flex items-center gap-1 text-[0.65rem] text-slate-400">
                  <MapPin className="h-3 w-3" style={{ color: theme.accent }} />
                  <span>800م منك</span>
                </div>
                <div className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6rem] font-bold"
                  style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}12`, color: theme.accent }}>
                  <motion.div className="h-1 w-1 rounded-full" style={{ backgroundColor: theme.accent }}
                    animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  مفتوح الآن
                </div>
              </div>
            </div>

            {/* Bronze badge */}
            {isBronze && (
              <div className="shrink-0 flex flex-col items-center gap-1 rounded-xl border border-amber-700/40 bg-amber-800/15 px-2.5 py-2">
                <span className="text-base">🥉</span>
                <span className="text-[0.55rem] font-bold text-amber-600">برونزي</span>
              </div>
            )}
          </div>

          {/* ── Gallery ──────────────────────────────────── */}
          <motion.div
            className={cn(
              'mb-3.5 overflow-hidden rounded-xl border transition-all duration-500',
              phase === 'portfolio'
                ? `border-current bg-current/5 ring-1 ring-current/20`
                : 'border-white/8 bg-white/[0.03]',
            )}
            style={phase === 'portfolio' ? { borderColor: `${theme.accent}55`, backgroundColor: `${theme.accent}08`, boxShadow: `0 0 12px ${theme.accent}15` } : {}}
          >
            {/* Gallery header */}
            <div className="flex items-center justify-between px-2.5 py-2">
              <span className="text-[0.62rem] font-bold" style={{ color: `${theme.accent}cc` }}>
                معرض الأعمال
              </span>
              <span className="rounded-full px-2 py-0.5 text-[0.58rem] font-semibold"
                style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}>
                {simCounter} / {tier.galleryMax}
              </span>
            </div>

            {/* Image grid */}
            <div className={cn(
              'grid gap-1 px-1.5 pb-2',
              tier.galleryVisibleSlots <= 4 ? 'grid-cols-4' : 'grid-cols-4',
            )}>
              {tier.galleryImages.slice(0, Math.min(tier.galleryVisibleSlots, 8)).map((src, idx) => {
                const isActive = portfolioIndex % tier.galleryVisibleSlots === idx;
                return (
                  <motion.div
                    key={`${src}-${idx}`}
                    className="relative aspect-square overflow-hidden rounded-lg"
                    animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div className="absolute inset-0 rounded-lg"
                        style={{ boxShadow: `inset 0 0 0 2px ${theme.accent}`, background: `${theme.accent}10` }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                    )}
                    {/* Inactive overlay */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-black/30 rounded-lg" />
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
                'relative flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-xl py-2.5 text-[0.8rem] font-bold text-white bg-gradient-to-r',
                theme.btnPrimary,
                'shadow-lg transition-all',
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
              className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: phase === 'comms' ? '0 0 14px #25D36680' : '0 2px 8px rgba(37,211,102,0.25)' }}
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
              className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl"
              style={{
                background: isBronze
                  ? 'linear-gradient(135deg, #b45309, #78350f)'
                  : `linear-gradient(135deg, ${theme.accent}90, ${theme.accent}60)`,
                color: 'white',
                boxShadow: phase === 'comms' ? `0 0 14px ${theme.accent}60` : `0 2px 8px ${theme.accent}25`,
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
              className="mt-2.5 flex items-center gap-2 rounded-xl border px-3 py-2 text-[0.68rem] font-medium"
              style={{
                borderColor: `${theme.accent}35`,
                backgroundColor: `${theme.accent}10`,
                color: theme.accent,
              }}
            >
              <Navigation className="h-3 w-3 shrink-0" />
              يفتح تطبيق الخرائط — توجيه فوري للصالون 📍
            </motion.div>
          )}

          {/* Platform watermark */}
          <div className="mt-3 flex items-center justify-center gap-1.5 pt-2.5 border-t border-white/5">
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.accent, opacity: 0.7 }} />
            <span className="text-[0.55rem] font-semibold tracking-wider" style={{ color: `${theme.accent}70` }}>
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
