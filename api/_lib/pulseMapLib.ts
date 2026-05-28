/**
 * Pulse Map — public API aggregation (slot-based, no raw GPS on wire).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { PULSE_MAP_PHASE } from './pulseMapConfig.js';
import { buildPulseMapLivePayload } from './pulseMapLive.js';
import { PULSE_MAP_PILOT_REGIONS } from './pulseMapSlots.js';
import type { PulseMapPayload } from './pulseMapTypes.js';

export type {
  PulseMapKind,
  PulseMapLink,
  PulseMapMode,
  PulseMapPayload,
  PulseMapPulse,
} from './pulseMapTypes.js';

export async function buildPulseMapPayload(
  supabase: SupabaseClient<any>,
): Promise<PulseMapPayload> {
  return buildPulseMapLivePayload(supabase, PULSE_MAP_PHASE, PULSE_MAP_PILOT_REGIONS);
}
