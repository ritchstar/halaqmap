import { useReducedMotion } from 'framer-motion';
import { PULSE_MAP_KINGDOM_OUTLINE_PATHS } from '@/modules/pulse-map/lib/pulseMapGeo';

type Props = {
  cx: number;
  cy: number;
};

const SWEEP_RADIUS = 520;

/** مسح راداري محوري من الرياض — طبقة SVG زخرفية فقط */
export function PulseMapKingdomSweep({ cx, cy }: Props) {
  const reduceMotion = useReducedMotion();
  const sweepDur = reduceMotion ? '0s' : '22s';
  const pulseDur = reduceMotion ? '0s' : '4.8s';

  return (
    <g aria-hidden clipPath="url(#pm-sweep-kingdom-clip)">
      <defs>
        <clipPath id="pm-sweep-kingdom-clip">
          {PULSE_MAP_KINGDOM_OUTLINE_PATHS.map((d, idx) => (
            <path key={`clip-${idx}`} d={d} />
          ))}
        </clipPath>

        <radialGradient id="pm-sweep-hub" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="pm-sweep-beam" cx="0%" cy="50%" r="100%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#22d3ee" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
        </radialGradient>

        <filter id="pm-sweep-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* حلقات إشعاع ثابتة — عمق بصري */}
      {[140, 240, 340, 440].map((r, i) => (
        <circle
          key={`ring-${r}`}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(56,189,248,0.14)"
          strokeWidth={1.2 - i * 0.15}
          opacity={0.85 - i * 0.12}
        />
      ))}

      {/* نبضات إشعاع متحركة */}
      {!reduceMotion
        ? [180, 300, 420].map((baseR, i) => (
            <circle
              key={`pulse-${baseR}`}
              cx={cx}
              cy={cy}
              r={baseR}
              fill="none"
              stroke="rgba(125,211,252,0.35)"
              strokeWidth={1.5}
            >
              <animate attributeName="r" values={`${baseR};${baseR + 90};${baseR}`} dur={pulseDur} begin={`${i * 1.6}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.45;0;0.45" dur={pulseDur} begin={`${i * 1.6}s`} repeatCount="indefinite" />
            </circle>
          ))
        : null}

      {/* ذراع المسح — sector دوّار */}
      <g filter="url(#pm-sweep-glow)">
        <g transform={`translate(${cx} ${cy})`}>
          {!reduceMotion ? (
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur={sweepDur} repeatCount="indefinite" />
              <path
                d={`M 0 0 L 0 ${-SWEEP_RADIUS} A ${SWEEP_RADIUS} ${SWEEP_RADIUS} 0 0 1 ${SWEEP_RADIUS * Math.sin((28 * Math.PI) / 180)} ${-SWEEP_RADIUS * Math.cos((28 * Math.PI) / 180)} Z`}
                fill="url(#pm-sweep-beam)"
                opacity={0.72}
              />
              <path
                d={`M 0 0 L 0 ${-SWEEP_RADIUS} A ${SWEEP_RADIUS} ${SWEEP_RADIUS} 0 0 1 ${SWEEP_RADIUS * Math.sin((12 * Math.PI) / 180)} ${-SWEEP_RADIUS * Math.cos((12 * Math.PI) / 180)} Z`}
                fill="url(#pm-sweep-beam)"
                opacity={0.38}
              />
              <line x1={0} y1={0} x2={0} y2={-SWEEP_RADIUS} stroke="#a5f3fc" strokeWidth={1.4} opacity={0.85} />
            </g>
          ) : (
            <circle cx={0} cy={0} r={SWEEP_RADIUS * 0.55} fill="url(#pm-sweep-beam)" opacity={0.12} />
          )}
        </g>
      </g>

      {/* توهج محوري — نقطة الرياض تُرسم فوقه من PulseMapCityMarkers */}
      <circle cx={cx} cy={cy} r={22} fill="url(#pm-sweep-hub)" opacity={0.28} />
      <ellipse cx={cx} cy={cy + 4} rx={12} ry={4} fill="rgba(8,47,73,0.35)" opacity={0.6} />
    </g>
  );
}
