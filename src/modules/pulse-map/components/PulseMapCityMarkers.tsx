import { PULSE_MAP_CITY_COLORS } from '@/config/pulseMapConfig';
import { PULSE_MAP_CITY_MARKERS, type PulseMapCityMarker } from '@/modules/pulse-map/lib/pulseMapCities';

const TIER_STYLE: Record<
  PulseMapCityMarker['tier'],
  { r: number; labelSize: number; labelWeight: number; labelDy: number }
> = {
  capital: { r: 7.5, labelSize: 20, labelWeight: 800, labelDy: -18 },
  major: { r: 6, labelSize: 16.5, labelWeight: 750, labelDy: -15 },
  hub: { r: 4.8, labelSize: 14.5, labelWeight: 700, labelDy: -13 },
  city: { r: 3.2, labelSize: 12.5, labelWeight: 650, labelDy: -11 },
};

/**
 * إزاحة تسمية بالبكسلات داخل viewBox — تفادي التراكب في التجمعات الكثيفة
 * دون تحريك نقطة المدينة عن إحداثياتها الحقيقية.
 */
const LABEL_NUDGE: Partial<Record<string, { dx: number; dy: number }>> = {
  // غرب: جدة / مكة / الطائف
  jeddah: { dx: -34, dy: 4 },
  makkah: { dx: 36, dy: -2 },
  taif: { dx: 28, dy: 14 },
  rabigh: { dx: -22, dy: -8 },
  // شرق: الدمام / الخبر / الجبيل / الأحساء
  dammam: { dx: -8, dy: -16 },
  khobar: { dx: 40, dy: 6 },
  jubail: { dx: 8, dy: -14 },
  ahsa: { dx: 10, dy: 16 },
  // جنوب غرب: أبها / خميس / جازان / نجران / الباحة
  abha: { dx: -42, dy: -4 },
  'khamis-mushait': { dx: 48, dy: -2 },
  jazan: { dx: -28, dy: 16 },
  najran: { dx: 36, dy: 4 },
  baha: { dx: -24, dy: -10 },
  // شمال
  tabuk: { dx: 8, dy: -12 },
  arar: { dx: 10, dy: -12 },
  sakaka: { dx: 28, dy: 4 },
  // وسط
  hail: { dx: -8, dy: -12 },
  buraidah: { dx: 18, dy: -10 },
  madinah: { dx: -12, dy: -14 },
  yanbu: { dx: -30, dy: 4 },
  'hafar-al-batin': { dx: 12, dy: -12 },
  riyadh: { dx: 0, dy: -20 },
};

export function PulseMapCityMarkers() {
  return (
    <g aria-label="مواقع المدن">
      {PULSE_MAP_CITY_MARKERS.map((city) => {
        const style = TIER_STYLE[city.tier];
        const colors = PULSE_MAP_CITY_COLORS[city.tier];
        const nudge = LABEL_NUDGE[city.id] ?? { dx: 0, dy: 0 };
        const labelX = city.x + nudge.dx;
        const labelY = city.y + style.labelDy + nudge.dy;
        return (
          <g key={city.id}>
            {/* هالة خفيفة للنقطة — وضوح على الخلفية الداكنة */}
            <circle
              cx={city.x}
              cy={city.y}
              r={style.r + 3.5}
              fill={colors.dot}
              opacity={0.18}
            />
            <circle
              cx={city.x}
              cy={city.y}
              r={style.r}
              fill={colors.dot}
              stroke={colors.dotStroke}
              strokeWidth={1.6}
            />
            {city.showLabel ? (
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fill={colors.label}
                fontSize={style.labelSize}
                fontWeight={style.labelWeight}
                fontFamily="IBM Plex Sans Arabic, Tajawal, system-ui, sans-serif"
                stroke="rgba(2, 6, 23, 0.88)"
                strokeWidth={3.2}
                paintOrder="stroke fill"
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
