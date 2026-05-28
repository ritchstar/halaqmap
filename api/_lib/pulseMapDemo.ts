/**
 * Pulse Map — demo pulses (step 3 preview before live Supabase wiring).
 */

type DemoPulse = {
  id: string;
  kind: 'demand' | 'link';
  slotId: string;
  createdAt: string;
};

/** نبض مستخدم — spread across the kingdom for visual calibration. */
export const DEMO_USER_PULSE_SLOTS = [
  'riyadh',
  'jeddah',
  'makkah',
  'madinah',
  'dammam',
  'abha',
  'jazan',
  'tabuk',
  'hail',
  'buraidah',
  'arar',
  'sakaka',
] as const;

/** نبض حلاق — distinct cities from user pulses where possible. */
export const DEMO_BARBER_PULSE_SLOTS = [
  'khobar',
  'taif',
  'khamis-mushait',
  'najran',
  'baha',
  'yanbu',
  'jubail',
  'neom',
] as const;

export function buildDemoPulses(): DemoPulse[] {
  const now = Date.now();
  const pulses: DemoPulse[] = [];

  for (const [i, slotId] of DEMO_USER_PULSE_SLOTS.entries()) {
    pulses.push({
      id: `demo-user-${slotId}`,
      kind: 'demand',
      slotId,
      createdAt: new Date(now - (4 + i * 6) * 60_000).toISOString(),
    });
  }

  for (const [i, slotId] of DEMO_BARBER_PULSE_SLOTS.entries()) {
    pulses.push({
      id: `demo-barber-${slotId}`,
      kind: 'link',
      slotId,
      createdAt: new Date(now - (3 + i * 8) * 60_000).toISOString(),
    });
  }

  return pulses;
}
