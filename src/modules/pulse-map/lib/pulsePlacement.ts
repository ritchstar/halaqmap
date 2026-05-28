import type { PulseMapKind, PulseMapLink, PulseMapPulse, PulseMapSlot, PlacedLink, PlacedPulse } from '@/modules/pulse-map/types';

export function pulseJitter(id: string, kind: PulseMapKind): { dx: number; dy: number } {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  const spread = kind === 'link' ? 11 : 16;
  return {
    dx: (((h & 0xff) / 255) - 0.5) * spread * 2,
    dy: ((((h >> 8) & 0xff) / 255) - 0.5) * spread * 2,
  };
}

export function placePulses(
  pulses: PulseMapPulse[],
  slotById: Map<string, PulseMapSlot>,
): PlacedPulse[] {
  const placed: PlacedPulse[] = [];
  for (const pulse of pulses) {
    const slot = slotById.get(pulse.slotId);
    if (!slot) continue;
    const { dx, dy } = pulseJitter(pulse.id, pulse.kind);
    placed.push({
      ...pulse,
      x: slot.x + dx,
      y: slot.y + dy,
    });
  }
  return placed;
}

export function placeLinks(
  links: PulseMapLink[],
  slotById: Map<string, PulseMapSlot>,
  pulses: PlacedPulse[],
): PlacedLink[] {
  const pulseAtSlot = new Map<string, PlacedPulse>();
  for (const p of pulses) {
    if (!pulseAtSlot.has(p.slotId)) pulseAtSlot.set(p.slotId, p);
  }

  const placed: PlacedLink[] = [];
  for (const link of links) {
    const fromPulse = pulseAtSlot.get(link.fromSlotId);
    const toPulse = pulseAtSlot.get(link.toSlotId);
    const fromSlot = slotById.get(link.fromSlotId);
    const toSlot = slotById.get(link.toSlotId);
    if (!fromSlot || !toSlot) continue;

    placed.push({
      ...link,
      x1: fromPulse?.x ?? fromSlot.x,
      y1: fromPulse?.y ?? fromSlot.y,
      x2: toPulse?.x ?? toSlot.x,
      y2: toPulse?.y ?? toSlot.y,
    });
  }
  return placed;
}

export function linkPath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - 18;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}
