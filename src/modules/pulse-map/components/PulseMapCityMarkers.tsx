import { PULSE_MAP_CITY_COLORS } from '@/config/pulseMapConfig';
import { PULSE_MAP_CITY_MARKERS, type PulseMapCityMarker } from '@/modules/pulse-map/lib/pulseMapCities';

const TIER_STYLE: Record<
  PulseMapCityMarker['tier'],
  { r: number; labelSize: number; labelWeight: number }
> = {
  capital: { r: 5.5, labelSize: 13, labelWeight: 800 },
  major: { r: 4.2, labelSize: 11.5, labelWeight: 700 },
  hub: { r: 3.2, labelSize: 10, labelWeight: 600 },
  city: { r: 2, labelSize: 0, labelWeight: 500 },
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
        const colors = PULSE_MAP_CITY_COLORS[city.tier];
        const labelSize = city.showLabel && style.labelSize === 0 ? 9.5 : style.labelSize;
        const labelWeight = city.showLabel && style.labelSize === 0 ? 600 : style.labelWeight;
        const labelY = city.y - (city.tier === 'city' && city.showLabel ? 9 : labelOffset(city.tier));
        return (
          <g key={city.id}>
            <circle
              cx={city.x}
              cy={city.y}
              r={style.r}
              fill={colors.dot}
              stroke={colors.dotStroke}
              strokeWidth={1.2}
            />
            {city.showLabel ? (
              <text
                x={city.x}
                y={labelY}
                textAnchor="middle"
                fill={colors.label}
                fontSize={labelSize}
                fontWeight={labelWeight}
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
