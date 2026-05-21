import { projectKsaToPercent, KSA_MAJOR_CITIES } from '@/modules/platform-radar/lib/saudiKingdomProjection';

/** Deep black KSA tactical map — neon border + major city glows. */
export function TacticalKingdomBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Deep void */}
      <div className="absolute inset-0 bg-[#000205]" />

      {/* Subtle scan lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(56,189,248,0.15) 3px, rgba(56,189,248,0.15) 4px)',
        }}
      />

      {/* Tactical grid — faint neon blue */}
      <div
        className="absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56,189,248,0.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.14) 1px, transparent 1px)
          `,
          backgroundSize: 'clamp(32px, 4.5vw, 64px) clamp(32px, 4.5vw, 64px)',
        }}
      />

      {/* Kingdom silhouette — neon perimeter */}
      <div className="absolute inset-[5%] flex items-center justify-center">
        <svg
          viewBox="0 0 420 520"
          className="h-[82%] w-[72%] max-h-[92%] drop-shadow-[0_0_48px_rgba(56,189,248,0.12)]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="ksa-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(8,14,28,0.92)" />
              <stop offset="50%" stopColor="rgba(2,6,14,0.88)" />
              <stop offset="100%" stopColor="rgba(4,10,22,0.95)" />
            </linearGradient>
            <filter id="neon-edge">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Stylized KSA outline */}
          <path
            d="M210 18 L318 42 L372 98 L398 168 L388 248 L362 318 L328 398 L268 468 L198 502 L128 478 L72 418 L38 338 L28 258 L42 178 L78 108 L138 52 Z"
            fill="url(#ksa-fill)"
            stroke="rgba(56,189,248,0.35)"
            strokeWidth="1.8"
            filter="url(#neon-edge)"
          />
          <path
            d="M210 18 L318 42 L372 98 L398 168 L388 248 L362 318 L328 398 L268 468 L198 502 L128 478 L72 418 L38 338 L28 258 L42 178 L78 108 L138 52 Z"
            fill="none"
            stroke="rgba(125,211,252,0.08)"
            strokeWidth="6"
          />
        </svg>
      </div>

      {/* Major city glow nodes */}
      {KSA_MAJOR_CITIES.map((city) => {
        const { left, top } = projectKsaToPercent(city.lat, city.lng);
        const size =
          city.tier === 'capital' ? 'clamp(2.5rem,5vw,4rem)' : city.tier === 'major' ? 'clamp(1.5rem,3vw,2.5rem)' : 'clamp(1rem,2vw,1.5rem)';
        const opacity = city.tier === 'capital' ? 0.55 : city.tier === 'major' ? 0.38 : 0.22;
        return (
          <div
            key={city.nameAr}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background: `radial-gradient(circle, rgba(56,189,248,${opacity}) 0%, rgba(56,189,248,0.08) 45%, transparent 70%)`,
              boxShadow: `0 0 ${city.tier === 'capital' ? '48px' : '28px'} rgba(56,189,248,${opacity * 0.6})`,
            }}
          />
        );
      })}

      {/* HUD corner brackets */}
      <div className="absolute left-3 top-3 h-10 w-10 border-l-2 border-t-2 border-sky-400/25" />
      <div className="absolute right-3 top-3 h-10 w-10 border-r-2 border-t-2 border-sky-400/25" />
      <div className="absolute bottom-3 left-3 h-10 w-10 border-b-2 border-l-2 border-sky-400/25" />
      <div className="absolute bottom-3 right-3 h-10 w-10 border-b-2 border-r-2 border-sky-400/25" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.72)_100%)]" />
    </div>
  );
}
