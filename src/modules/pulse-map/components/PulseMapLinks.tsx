import { PULSE_MAP_COLORS } from '@/config/pulseMapConfig';
import { linkPath } from '@/modules/pulse-map/lib/pulsePlacement';
import type { PlacedLink } from '@/modules/pulse-map/types';

type Props = {
  links: PlacedLink[];
};

export function PulseMapLinks({ links }: Props) {
  if (links.length === 0) return null;

  return (
    <g aria-hidden>
      {links.map((link) => {
        if (link.fromSlotId === link.toSlotId) return null;
        return (
          <path
            key={link.id}
            d={linkPath(link.x1, link.y1, link.x2, link.y2)}
            fill="none"
            stroke="rgba(45,212,191,0.35)"
            strokeWidth={1.4}
            strokeDasharray="4 6"
            className="pulse-map-link"
          />
        );
      })}
    </g>
  );
}

export function PulseMapSameSlotRings({
  links,
}: {
  links: PlacedLink[];
}) {
  return (
    <g aria-hidden>
      {links
        .filter((l) => l.fromSlotId === l.toSlotId)
        .map((link) => (
          <circle
            key={`ring-${link.id}`}
            cx={link.x1}
            cy={link.y1}
            r={18}
            fill="none"
            stroke={PULSE_MAP_COLORS.link.ring}
            strokeWidth={1.2}
            className="pulse-map-ring"
          />
        ))}
    </g>
  );
}
