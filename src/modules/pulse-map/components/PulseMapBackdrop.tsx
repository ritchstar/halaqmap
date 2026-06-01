import {
  PULSE_MAP_KINGDOM_OUTLINE_PATHS,
  PULSE_MAP_VIEWBOX,
} from '@/modules/pulse-map/lib/pulseMapGeo';

type PulseMapBackdropTone = 'tactical' | 'comfort';

type LayerProps = {
  tone?: PulseMapBackdropTone;
};

export function PulseMapBackdropLayer({ tone = 'tactical' }: LayerProps) {
  const isComfort = tone === 'comfort';
  const skyStops = isComfort
    ? ['#eefaff', '#e8f7ff', '#f4fbff']
    : ['#020617', '#041018', '#030712'];
  const landStops = isComfort
    ? ['rgba(20,184,166,0.2)', 'rgba(56,189,248,0.14)']
    : ['rgba(14,116,144,0.28)', 'rgba(6,78,59,0.16)'];
  const gridStroke = isComfort ? 'rgba(14,165,233,0.065)' : 'rgba(56,189,248,0.035)';
  const outlineStroke = isComfort ? 'rgba(14,165,233,0.42)' : 'rgba(56,189,248,0.55)';
  const haloStroke = isComfort ? 'rgba(45,212,191,0.22)' : 'rgba(125,211,252,0.22)';

  return (
    <>
      <defs>
        <linearGradient id="pm-sky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={skyStops[0]} />
          <stop offset="55%" stopColor={skyStops[1]} />
          <stop offset="100%" stopColor={skyStops[2]} />
        </linearGradient>
        <linearGradient id="pm-land" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={landStops[0]} />
          <stop offset="100%" stopColor={landStops[1]} />
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
            stroke={gridStroke}
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
            stroke={gridStroke}
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
              stroke={outlineStroke}
              strokeWidth={2}
              strokeLinejoin="round"
              filter="url(#pm-glow)"
            />
            <path
              d={d}
              fill="none"
              stroke={haloStroke}
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

export function PulseMapBackdrop({ tone = 'tactical' }: LayerProps) {
  return <PulseMapBackdropLayer tone={tone} />;
}
