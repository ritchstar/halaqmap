import { PULSE_MAP_CITY_MARKERS, type PulseMapCityMarker } from '@/modules/pulse-map/lib/pulseMapCities';

const TIER_STYLE: Record<
  PulseMapCityMarker['tier'],
  { r: number; fill: string; stroke: string; labelSize: number; labelWeight: number }
> = {
  capital: {
    r: 5.5,
    fill: '#fbbf24',
    stroke: 'rgba(254,243,199,0.85)',
    labelSize: 13,
    labelWeight: 800,
  },
  major: {
    r: 4.2,
    fill: '#38bdf8',
    stroke: 'rgba(186,230,253,0.75)',
    labelSize: 11.5,
    labelWeight: 700,
  },
  hub: {
    r: 3.2,
    fill: '#2dd4bf',
    stroke: 'rgba(153,246,228,0.65)',
    labelSize: 10,
    labelWeight: 600,
  },
  city: {
    r: 2,
    fill: 'rgba(148,163,184,0.85)',
    stroke: 'rgba(226,232,240,0.35)',
    labelSize: 0,
    labelWeight: 500,
  },
};

function labelOffset(tier: PulseMapCityMarker['tier']): number {
  if (tier === 'capital') return 14;
  if (tier === 'major') return 12;
  return 10;
}

export function PulseMapCityMarkers() {
  return (
    <g aria-label="مواقع المدن">
      {PULSE_MAP_CITY_MARKERS.map((city) => {
        const style = TIER_STYLE[city.tier];
        return (
          <g key={city.id}>
            <circle
              cx={city.x}
              cy={city.y}
              r={style.r}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={1.2}
            />
            {city.showLabel ? (
              <text
                x={city.x}
                y={city.y - labelOffset(city.tier)}
                textAnchor="middle"
                fill="rgba(226,232,240,0.92)"
                fontSize={style.labelSize}
                fontWeight={style.labelWeight}
                fontFamily="system-ui"
                style={{ pointerEvents: 'none' }}
              >
                {city.nameAr}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}
