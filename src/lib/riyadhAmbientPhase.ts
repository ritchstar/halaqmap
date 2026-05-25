import {
  AMBIENT_PHASES_ORDER,
  RIYADH_TIMEZONE,
  type AmbientPhaseId,
} from '@/config/platformAmbientPhases';

function parseHm(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
}

/** دقائق من منتصف الليل — بتوقيت الرياض */
export function getRiyadhMinutesNow(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: RIYADH_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return hour * 60 + minute;
}

export function formatRiyadhTime(now = new Date()): string {
  return new Intl.DateTimeFormat('ar-SA', {
    timeZone: RIYADH_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
}

/** يحدّد الوضع من جدول AMBIENT_PHASES_ORDER (آخر start <= الآن). */
export function resolveAmbientPhaseFromRiyadhTime(now = new Date()): AmbientPhaseId {
  const minutes = getRiyadhMinutesNow(now);
  const ordered = [...AMBIENT_PHASES_ORDER].sort(
    (a, b) => parseHm(a.start) - parseHm(b.start),
  );

  let active = ordered[ordered.length - 1]?.id ?? 'layl';
  for (const phase of ordered) {
    if (minutes >= parseHm(phase.start)) active = phase.id;
  }
  return active;
}

export function getAmbientPhaseDefinition(phaseId: AmbientPhaseId) {
  return AMBIENT_PHASES_ORDER.find((p) => p.id === phaseId)!;
}
