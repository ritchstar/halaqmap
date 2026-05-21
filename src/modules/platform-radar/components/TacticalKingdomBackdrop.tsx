const NIGHT_MAP = '/images/platform-radar-night-map.jpg';

/** Satellite night map of the Arabian Peninsula — reference-calibrated asset. */
export function TacticalKingdomBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#02040a]">
      <img
        src={NIGHT_MAP}
        alt=""
        className="absolute inset-0 h-full w-full scale-[1.03] object-cover object-center"
        style={{ filter: 'saturate(1.05) contrast(1.08) brightness(0.88)' }}
        draggable={false}
      />

      {/* Neon cyan border accent — matches reference tactical grid */}
      <svg className="absolute inset-0 h-full w-full opacity-80" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="tactical-neon-edge" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.22" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          x="1.2"
          y="1.2"
          width="97.6"
          height="97.6"
          fill="none"
          stroke="rgba(56,189,248,0.22)"
          strokeWidth="0.18"
        />
      </svg>

      {/* Subtle scan grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56,189,248,0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.35) 1px, transparent 1px)
          `,
          backgroundSize: 'clamp(28px, 4vw, 56px) clamp(28px, 4vw, 56px)',
        }}
      />

      {/* Edge vignette for HUD readability */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(0,0,0,0.55)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.45)_0%,transparent_16%,transparent_84%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}
