import {
  PULSE_MAP_KINGDOM_OUTLINE_PATHS,
  PULSE_MAP_VIEWBOX,
} from '@/modules/pulse-map/lib/pulseMapGeo';

export function PulseMapBackdrop() {
  return (
    <>
      <defs>
        <linearGradient id="pm-sky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="55%" stopColor="#041018" />
          <stop offset="100%" stopColor="#030712" />
        </linearGradient>
        <linearGradient id="pm-land" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(14,116,144,0.28)" />
          <stop offset="100%" stopColor="rgba(6,78,59,0.16)" />
        </linearGradient>
        <filter id="pm-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={PULSE_MAP_VIEWBOX.width} height={PULSE_MAP_VIEWBOX.height} fill="url(#pm-sky)" />

      {Array.from({ length: 9 }, (_, i) => {
        const x = (i / 8) * PULSE_MAP_VIEWBOX.width;
        return (
          <line
            key={`v-${i}`}
            x1={x}
            y1={0}
            x2={x}
            y2={PULSE_MAP_VIEWBOX.height}
            stroke="rgba(56,189,248,0.035)"
            strokeWidth={1}
          />
        );
      })}
      {Array.from({ length: 7 }, (_, i) => {
        const y = (i / 6) * PULSE_MAP_VIEWBOX.height;
        return (
          <line
            key={`h-${i}`}
            x1={0}
            y1={y}
            x2={PULSE_MAP_VIEWBOX.width}
            y2={y}
            stroke="rgba(56,189,248,0.035)"
            strokeWidth={1}
          />
        );
      })}

      <g>
        {PULSE_MAP_KINGDOM_OUTLINE_PATHS.map((d, idx) => (
          <g key={`land-${idx}`}>
            <path
              d={d}
              fill="url(#pm-land)"
              stroke="rgba(56,189,248,0.55)"
              strokeWidth={2}
              strokeLinejoin="round"
              filter="url(#pm-glow)"
            />
            <path
              d={d}
              fill="none"
              stroke="rgba(125,211,252,0.22)"
              strokeWidth={4.5}
              strokeLinejoin="round"
              opacity={0.55}
            />
          </g>
        ))}
      </g>
    </>
  );
}
