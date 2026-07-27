/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/** Pulse Map rollout phase — 2 = live slot pulses from Supabase */
export const PULSE_MAP_PHASE = 2 as const;

export type PulseMapPhase = typeof PULSE_MAP_PHASE;
