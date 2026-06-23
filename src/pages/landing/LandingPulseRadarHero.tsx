import { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Radar } from 'lucide-react';
import { TacticalKingdomBackdrop } from '@/modules/platform-radar/components/TacticalKingdomBackdrop';
import { CITY_BEACONS, KSA_VIEWBOX } from '@/modules/platform-radar/lib/saudiKingdomGeo';
import { ShowcasePulseMarker } from '@/modules/showcase-radar/components/ShowcasePulseMarker';

const MAP_HEIGHT_PX = 300;

/**
 * رادار نبض خفيف ليمين هيرو LandingPreview (ديسكتوب فقط).
 * خريطة المملكة + نبضات مدن بألوان المنصة — بدون HUD ثقيل.
 */
export function LandingPulseRadarHero() {
  const reduceMotion = useReducedMotion();
  const kingdomAspect = `${KSA_VIEWBOX.width} / ${KSA_VIEWBOX.height}`;

  const citySignals = useMemo(
    () =>
      CITY_BEACONS.map((city, index) => ({
        id: `landing-hero-city-${city.nameAr}`,
        left: (city.view.x / KSA_VIEWBOX.width) * 100,
        top: (city.view.y / KSA_VIEWBOX.height) * 100,
        cityAr: city.nameAr,
        tier: city.tier,
        variantIndex: index,
      })),
    [],
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-teal-400/20 bg-[#030d1a] p-5 shadow-2xl shadow-teal-500/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-500/10 px-3 py-1 text-[0.72rem] font-bold text-teal-100">
            <span className="relative flex h-2 w-2">
              {!reduceMotion ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-50" />
              ) : null}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
            </span>
            نبض المنصة
          </div>
          <h3 className="mt-3 text-xl font-black leading-snug text-white">رادار المملكة — نبض حي</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            إشارات خفيفة من مدن المملكة — نظام الرصد الذكي يعمل في الخلفية بينما تبحث عن خدمتك.
          </p>
        </div>
        <Radar className="h-8 w-8 shrink-0 text-teal-400/55" aria-hidden />
      </div>

      <div
        className="relative mt-4 w-full overflow-hidden rounded-2xl border border-white/8 bg-black shadow-inner"
        style={{ height: MAP_HEIGHT_PX }}
      >
        <div
          className="tactical-radar-map absolute inset-0 flex items-center justify-center"
          dir="ltr"
          role="img"
          aria-label="خريطة المملكة العربية السعودية — نبضات مدن توضيحية"
        >
          <div
            className="tactical-radar-canvas relative h-full max-h-full w-full max-w-full"
            style={{
              aspectRatio: kingdomAspect,
              maxHeight: `min(100%, calc(100% * (${KSA_VIEWBOX.width} / ${KSA_VIEWBOX.height})))`,
            }}
          >
            <TacticalKingdomBackdrop
              showCompassRose={false}
              showTacticalSweep={!reduceMotion}
              showCapitalHeartbeat={!reduceMotion}
            />
            {citySignals.map((city) => (
              <ShowcasePulseMarker
                key={city.id}
                id={city.id}
                left={city.left}
                top={city.top}
                createdAt={new Date().toISOString()}
                labelAr={`إشارة مدينة — ${city.cityAr}`}
                pulseKind="city"
                signalTier={city.tier}
                variantIndex={city.variantIndex}
                opacity={city.tier === 'capital' ? 0.95 : city.tier === 'major' ? 0.82 : 0.68}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-slate-400">
        عرض توضيحي للنبض — البيانات التشغيلية من صالونات مفعّلة على المنصة.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[0.65rem] text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-cyan-200/60 bg-cyan-400/80 shadow-[0_0_6px_rgba(34,211,238,0.45)]" />
          عاصمة
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-emerald-200/50 bg-emerald-400/75 shadow-[0_0_5px_rgba(52,211,153,0.4)]" />
          مدن رئيسية
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-amber-200/50 bg-amber-400/75 shadow-[0_0_5px_rgba(251,191,36,0.38)]" />
          محطات نبض
        </span>
      </div>
    </div>
  );
}
