import type { PulseMapSlot } from '@/modules/pulse-map/types';

type Props = {
  slots: PulseMapSlot[];
};

/** نقاط anchor ثابتة — المرحلة 1 فقط (بدون تسميات على الخريطة). */
export function PulseMapSlotAnchors({ slots }: Props) {
  return (
    <g aria-hidden className="pulse-map-slot-anchors">
      {slots.map((slot) => (
        <g key={`anchor-${slot.id}`}>
          <circle
            cx={slot.x}
            cy={slot.y}
            r={10}
            fill="rgba(56,189,248,0.06)"
            stroke="rgba(56,189,248,0.12)"
            strokeWidth={1}
          />
          <circle cx={slot.x} cy={slot.y} r={2.2} fill="rgba(148,163,184,0.35)" />
        </g>
      ))}
    </g>
  );
}
