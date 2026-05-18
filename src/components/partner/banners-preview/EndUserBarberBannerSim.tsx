import { MapPin, MessageCircle, Phone, Shield, Sparkles, Star } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { motion, useReducedMotion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { BannerPreviewTierConfig } from '@/config/partnerBannersPreviewCopy';
import { useBannerPreviewSim, type BannerSimPhase } from '@/hooks/useBannerPreviewSim';
import { cn } from '@/lib/utils';

const PHASE_LABEL: Record<BannerSimPhase, string> = {
  portfolio: 'محاكاة: العميل يتصفح معرض الصور',
  comms: 'محاكاة: نقر التواصل المباشر',
  map: 'محاكاة: فتح الموقع على تطبيق الجهاز',
};

type Props = {
  tier: BannerPreviewTierConfig;
  startDelayMs?: number;
};

export function EndUserBarberBannerSim({ tier, startDelayMs = 0 }: Props) {
  const reduceMotion = useReducedMotion();
  const { phase, portfolioIndex } = useBannerPreviewSim(
    tier.galleryVisibleSlots,
    reduceMotion,
    startDelayMs,
  );
  const isDiamond = tier.id === 'diamond';
  const isGold = tier.id === 'gold';
  const isBronze = tier.id === 'bronze';
  const simCounter = Math.min(
    tier.galleryMax,
    Math.floor((portfolioIndex / Math.max(1, tier.galleryVisibleSlots - 1)) * tier.galleryMax) + 1,
  );

  const heroSrc = tier.galleryImages[portfolioIndex % tier.galleryImages.length] ?? tier.heroImage;

  return (
    <div className="banner-sim-light-surface relative mx-auto w-full max-w-md" dir="rtl">
      <p className="mb-2 text-center text-[11px] font-medium text-cyan-200/80">{PHASE_LABEL[phase]}</p>

      <Card
        className={cn(
          'overflow-hidden border-border bg-gradient-to-br from-card via-card to-muted/20 shadow-xl',
          isGold && 'ring-1 ring-accent/25',
          isDiamond && 'banner-sim-diamond-neon ring-2 ring-cyan-400/30',
        )}
      >
        {(isGold || isDiamond) && (
          <div className={cn('relative overflow-hidden', isDiamond ? 'h-52' : 'h-44')}>
            {isDiamond && tier.hasVideoBanner ? (
              <>
                <img src={tier.heroImage} alt="" className="h-full w-full object-cover" />
                <motion.div
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center bg-black/25"
                >
                  <span className="rounded-full border border-white/30 bg-black/50 px-3 py-1 text-[10px] font-semibold text-white">
                    WebM · 10 ث · صامت · داخل الملف فقط
                  </span>
                </motion.div>
              </>
            ) : (
              <img src={heroSrc} alt="" className="h-full w-full object-cover transition-opacity duration-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
            {isBronze ? null : (
              <Badge
                className={cn(
                  'absolute top-3 left-3',
                  isDiamond
                    ? 'border-cyan-300/50 bg-gradient-to-r from-cyan-500/90 to-sky-400/90 text-white shadow-lg shadow-cyan-500/30'
                    : 'border-accent/50 bg-accent text-accent-foreground',
                )}
              >
                {isDiamond ? (
                  <>
                    <Sparkles className="ml-1 h-3 w-3 animate-pulse" />
                    ماسي
                  </>
                ) : (
                  <>
                    <Sparkles className="ml-1 h-3 w-3" />
                    ذهبي
                  </>
                )}
              </Badge>
            )}
            {isDiamond && (
              <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                <Shield className="ml-1 h-3 w-3" />
                VIP
              </Badge>
            )}
          </div>
        )}

        <div className="p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={cn('font-bold text-foreground', isDiamond ? 'text-xl' : 'text-lg')}>
                صالون العرض · {tier.name}
              </h3>
              <div className="mt-1 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                ))}
                <span className="text-xs text-muted-foreground">(128)</span>
              </div>
              <motion.div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>0.8 كم</span>
              </motion.div>
              <Badge className="mt-2 text-[10px]">مفتوح الآن</Badge>
            </div>
            {isBronze && (
              <Badge variant="outline" className="shrink-0 border-amber-500/40 bg-amber-500/10 text-amber-800">
                برونزي
              </Badge>
            )}
          </div>

          <div
            className={cn(
              'mb-4 rounded-xl border p-2 transition-all duration-300',
              phase === 'portfolio' ? 'border-primary/40 bg-primary/5 ring-2 ring-primary/20' : 'border-border/60',
            )}
          >
            <div className="mb-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>معرض الأعمال</span>
              <span>
                {simCounter} / {tier.galleryMax}
              </span>
            </div>
            <div className={cn('grid gap-1.5', isBronze ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-4')}>
              {tier.galleryImages.slice(0, tier.galleryVisibleSlots).map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-300',
                    portfolioIndex % tier.galleryVisibleSlots === idx
                      ? 'border-primary scale-[1.03] shadow-md'
                      : 'border-transparent opacity-80',
                  )}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex gap-2">
            <Button
              type="button"
              tabIndex={-1}
              className={cn(
                'relative flex-1 overflow-visible bg-primary text-primary-foreground',
                phase === 'map' && 'banner-sim-btn-active banner-sim-map-target',
              )}
            >
              {phase === 'map' && (
                <>
                  <span className="banner-sim-ripple" aria-hidden />
                  <span className="banner-sim-map-wave" aria-hidden />
                  <span className="banner-sim-map-wave banner-sim-map-wave-delayed" aria-hidden />
                </>
              )}
              <MapPin className="relative z-[1] ml-2 h-4 w-4" />
              <span className="relative z-[1]">الموقع</span>
            </Button>
            <Button
              type="button"
              tabIndex={-1}
              size="icon"
              className={cn(
                'relative overflow-hidden bg-[#25D366] text-white',
                phase === 'comms' && 'banner-sim-btn-active',
              )}
            >
              {phase === 'comms' && <span className="banner-sim-ripple" aria-hidden />}
              <SiWhatsapp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              tabIndex={-1}
              variant="outline"
              size="icon"
              className={cn(
                'relative overflow-hidden border-primary text-primary',
                phase === 'comms' && 'banner-sim-btn-active',
              )}
            >
              {phase === 'comms' && <span className="banner-sim-ripple" aria-hidden />}
              {isBronze ? <Phone className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
            </Button>
          </div>

          {phase === 'map' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="banner-sim-maps-toast mt-3 rounded-lg border border-cyan-400/30 bg-cyan-950/40 px-3 py-2 text-center text-[11px] font-medium text-cyan-100"
            >
              يفتح تطبيق الموقع على الجهاز — توجيه فوري لموقع الصالون
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
}
