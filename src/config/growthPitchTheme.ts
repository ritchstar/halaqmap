/**
 * Growth Pitch Deck — طبقة التجميل والعرض (Presenter Theme).
 *
 * ═══ عقد التصميم — TEXT LOCK ═══
 * • النصوص المعتمدة في `growthPitchSlides.ts` فقط — لا إضافة ولا حذف ولا إعادة صياغة.
 * • هذا الملف + `GrowthPitchSlideDeck.tsx`: ترتيب بصري، أحجام، ألوان، زخارف، عمودين، حركة.
 * • المرجع البصري: LandingPreview · PartnerMarketingPreview (داكن + teal/cyan).
 * • الهدف: عرض 16:9 / بروjector — قراءة من 3–5 أمتار.
 */
import type { GrowthPitchSlideAccent } from '@/config/growthPitchSlides';

export const GROWTH_PITCH_DESIGN_CONTRACT_AR = [
  'النصوص مقفلة في growthPitchSlides.ts — المختص يجمّل ويرتّب فقط.',
  'لا تغيير في عقيدة On-Demand أو صياغة B2C/B2B.',
  'مسموح: typography، grid، أيقونات، خلفيات، تقسيم أعمدة، spacing، motion.',
  'ممنوع: تعديل strings، حذف bullets، إضافة claims تسويقية جديدة.',
] as const;

/** تخطيط الشريحة — بدون لمس النص */
export type GrowthPitchSlideLayout =
  | 'default'
  | 'two-column-bullets'
  | 'hero-spotlight'
  | 'comparison-wide'
  | 'cta-spotlight';

export const GROWTH_PITCH_SLIDE_LAYOUT: Record<string, GrowthPitchSlideLayout> = {
  opening: 'hero-spotlight',
  problem: 'default',
  'attract-b2c': 'two-column-bullets',
  transparency: 'two-column-bullets',
  'how-it-works': 'default',
  trust: 'default',
  'tier-compare': 'comparison-wide',
  'partner-growth': 'default',
  cta: 'cta-spotlight',
};

export type GrowthPitchLane = 'b2c' | 'b2b' | 'neutral';

export const GROWTH_PITCH_SLIDE_LANE: Record<string, GrowthPitchLane> = {
  opening: 'b2b',
  problem: 'b2b',
  'attract-b2c': 'b2c',
  transparency: 'b2b',
  'how-it-works': 'b2c',
  trust: 'b2b',
  'tier-compare': 'b2b',
  'partner-growth': 'b2b',
  cta: 'b2b',
};

export const GROWTH_PITCH_LANE_LABEL: Record<GrowthPitchLane, string> = {
  b2c: 'رحلة الزبون',
  b2b: 'صالونك ونموّك',
  neutral: 'حلاق ماب',
};

export const GROWTH_PITCH_TYPO = {
  eyebrow: 'text-[clamp(0.68rem,1.05vw,0.82rem)] font-bold tracking-[0.2em] uppercase',
  heroTitle: 'text-[clamp(2rem,4.8vw,3.85rem)] font-black leading-[1.1] text-white',
  slideTitle: 'text-[clamp(1.45rem,3.4vw,2.85rem)] font-black leading-snug text-white',
  slideSubtitle: 'text-[clamp(0.95rem,1.65vw,1.3rem)] leading-relaxed text-slate-300/95',
  body: 'text-[clamp(0.92rem,1.55vw,1.22rem)] leading-[1.75] text-slate-100/95',
  bodyMuted: 'text-[clamp(0.85rem,1.35vw,1.05rem)] leading-relaxed text-slate-400',
  stepNumber: 'text-[clamp(1.75rem,3vw,2.5rem)] font-black text-teal-300',
  stepTitle: 'text-[clamp(1rem,1.6vw,1.2rem)] font-bold text-white',
  stepBody: 'text-[clamp(0.8rem,1.25vw,0.95rem)] leading-relaxed text-slate-400',
  tierPrice: 'text-[clamp(0.95rem,1.5vw,1.15rem)] font-bold text-teal-300',
  tierHighlight: 'text-[clamp(0.72rem,1.15vw,0.88rem)] leading-relaxed text-slate-200/90',
  footnote: 'text-[clamp(0.7rem,1.05vw,0.82rem)] text-slate-500',
  ctaButton: 'text-[clamp(0.88rem,1.35vw,1.05rem)] font-bold',
} as const;

export type GrowthPitchAccentStyle = {
  ring: string;
  panel: string;
  eyebrow: string;
  glow: string;
  btn: string;
  lane: string;
  gradient: string;
};

export const GROWTH_PITCH_ACCENT: Record<GrowthPitchSlideAccent, GrowthPitchAccentStyle> = {
  teal: {
    ring: 'border-teal-400/40',
    panel: 'bg-teal-500/[0.06]',
    eyebrow: 'text-teal-300',
    glow: 'shadow-[0_0_80px_-20px_rgba(45,212,191,0.35)]',
    btn: 'bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500',
    lane: 'border-teal-400/50 bg-teal-500/15 text-teal-100',
    gradient: 'from-teal-500/20 via-transparent to-cyan-500/10',
  },
  amber: {
    ring: 'border-amber-400/40',
    panel: 'bg-amber-500/[0.06]',
    eyebrow: 'text-amber-300',
    glow: 'shadow-[0_0_80px_-20px_rgba(251,191,36,0.3)]',
    btn: 'bg-gradient-to-l from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
    lane: 'border-amber-400/50 bg-amber-500/15 text-amber-100',
    gradient: 'from-amber-500/15 via-transparent to-orange-500/10',
  },
  violet: {
    ring: 'border-violet-400/40',
    panel: 'bg-violet-500/[0.06]',
    eyebrow: 'text-violet-300',
    glow: 'shadow-[0_0_80px_-20px_rgba(167,139,250,0.3)]',
    btn: 'bg-gradient-to-l from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500',
    lane: 'border-violet-400/50 bg-violet-500/15 text-violet-100',
    gradient: 'from-violet-500/15 via-transparent to-fuchsia-500/10',
  },
  slate: {
    ring: 'border-slate-400/30',
    panel: 'bg-white/[0.03]',
    eyebrow: 'text-slate-300',
    glow: 'shadow-[0_0_60px_-25px_rgba(148,163,184,0.2)]',
    btn: 'bg-gradient-to-l from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600',
    lane: 'border-slate-400/40 bg-slate-500/15 text-slate-200',
    gradient: 'from-slate-500/10 via-transparent to-slate-600/5',
  },
};

/** أبعاد الحاوية — نسبة عرض تقديمي */
export const GROWTH_PITCH_FRAME_CLASS =
  'mx-auto w-full max-w-[min(92vw,1280px)] rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm px-[clamp(1.25rem,4vw,3rem)] py-[clamp(1.5rem,4vh,2.75rem)]';

export function layoutForSlide(slideId: string): GrowthPitchSlideLayout {
  return GROWTH_PITCH_SLIDE_LAYOUT[slideId] ?? 'default';
}

export function laneForSlide(slideId: string): GrowthPitchLane {
  return GROWTH_PITCH_SLIDE_LANE[slideId] ?? 'neutral';
}
