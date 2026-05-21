import { projectKsaToPercent, KSA_MAJOR_CITIES } from '@/modules/platform-radar/lib/saudiKingdomProjection';

/** Procedural satellite-style night map — no baked UI artifacts. */
export function TacticalKingdomBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#010101]">
      {/* Deep ocean */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_48%_42%,#0c1424_0%,#030508_42%,#000000_100%)]" />

      {/* Landmass texture */}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Regional land silhouettes + neon borders */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="ksa-neon" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="0.28" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="land-fill" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#141c2a" />
            <stop offset="55%" stopColor="#0a1018" />
            <stop offset="100%" stopColor="#04060a" />
          </radialGradient>
        </defs>

        {/* Arabian Peninsula landmass */}
        <path
          d="M57 16 L69 20 L76 27 L80 35 L81 44 L79 54 L75 63 L69 72 L61 79 L52 83 L43 81 L36 74 L31 64 L29 53 L30 42 L35 31 L43 23 L52 18 Z"
          fill="url(#land-fill)"
          stroke="rgba(56,189,248,0.62)"
          strokeWidth="0.24"
          filter="url(#ksa-neon)"
        />
        <path
          d="M57 16 L69 20 L76 27 L80 35 L81 44 L79 54 L75 63 L69 72 L61 79 L52 83 L43 81 L36 74 L31 64 L29 53 L30 42 L35 31 L43 23 L52 18 Z"
          fill="none"
          stroke="rgba(125,211,252,0.12)"
          strokeWidth="0.9"
        />

        {/* Neighbor borders — UAE, Kuwait, Red Sea coast */}
        <path d="M69 72 L76 76 L81 82 L79 88" fill="none" stroke="rgba(56,189,248,0.38)" strokeWidth="0.16" filter="url(#ksa-neon)" />
        <path d="M35 31 L28 34 L23 42 L24 50" fill="none" stroke="rgba(56,189,248,0.3)" strokeWidth="0.14" />
        <path d="M43 81 L38 86 L36 92" fill="none" stroke="rgba(56,189,248,0.28)" strokeWidth="0.12" />
        <path d="M52 83 L48 88 L46 94" fill="none" stroke="rgba(56,189,248,0.25)" strokeWidth="0.12" />
      </svg>

      {/* Golden urban light clusters */}
      {KSA_MAJOR_CITIES.map((city) => {
        const { left, top } = projectKsaToPercent(city.lat, city.lng);
        const spread =
          city.tier === 'capital' ? 'clamp(3.2rem,6.5vw,5.5rem)' : city.tier === 'major' ? 'clamp(2rem,4.2vw,3.6rem)' : 'clamp(1.1rem,2.2vw,1.8rem)';
        const alpha = city.tier === 'capital' ? 0.92 : city.tier === 'major' ? 0.68 : 0.42;
        return (
          <div
            key={city.nameAr}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <div
              className="rounded-full"
              style={{
                width: spread,
                height: spread,
                background: `radial-gradient(circle, rgba(255,214,120,${alpha}) 0%, rgba(251,191,36,0.35) 28%, rgba(180,83,9,0.08) 55%, transparent 72%)`,
                boxShadow: `0 0 ${city.tier === 'capital' ? '42px' : '24px'} rgba(251,191,36,${alpha * 0.4})`,
              }}
            />
          </div>
        );
      })}

      {/* Atmospheric vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_32%,rgba(0,0,0,0.62)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.5)_0%,transparent_18%,transparent_82%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}
