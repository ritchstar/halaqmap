import { PULSE_MAP_COLORS } from '@/config/pulseMapConfig';
import type { PlacedPulse } from '@/modules/pulse-map/types';

type Props = {
  pulses: PlacedPulse[];
};

export function PulseMapDots({ pulses }: Props) {
  return (
    <g role="presentation">
      {pulses.map((pulse) => {
        const colors = PULSE_MAP_COLORS[pulse.kind];
        const r = pulse.kind === 'demand' ? 5.5 : 4.5;
        return (
          <g key={pulse.id} className="pulse-map-dot">
            <circle
              cx={pulse.x}
              cy={pulse.y}
              r={r + 7}
              fill={colors.glow}
              opacity={0.45}
              className="pulse-map-dot-halo"
            />
            <circle
              cx={pulse.x}
              cy={pulse.y}
              r={r + 2.5}
              fill="none"
              stroke={colors.ring}
              strokeWidth={1.2}
              className="pulse-map-dot-ring"
            />
            <circle
              cx={pulse.x}
              cy={pulse.y}
              r={r}
              fill={colors.fill}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={1}
            />
          </g>
        );
      })}
    </g>
  );
}
