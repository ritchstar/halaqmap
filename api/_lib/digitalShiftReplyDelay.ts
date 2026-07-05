/** مصدر واحد لمهلة المناوب — الدقائق (واجهة الحلاق) تُترجم إلى ثوانٍ. */

export const SHIFT_REPLY_DELAY_SECONDS_MIN = 3;
export const SHIFT_REPLY_DELAY_SECONDS_MAX = 1800;

export const SHIFT_REPLY_DELAY_DEFAULT_MINUTES = 3;

export type ShiftReplyDelayConfig = {
  reply_delay_minutes?: number | null;
  reply_delay_seconds?: number | null;
};

export function resolveReplyDelaySeconds(
  cfg: ShiftReplyDelayConfig | null | undefined,
): number {
  const minutes = Number(cfg?.reply_delay_minutes);
  if (Number.isFinite(minutes) && minutes >= 1) {
    return Math.min(
      SHIFT_REPLY_DELAY_SECONDS_MAX,
      Math.max(SHIFT_REPLY_DELAY_SECONDS_MIN, Math.round(minutes * 60)),
    );
  }
  const seconds = Number(cfg?.reply_delay_seconds);
  if (Number.isFinite(seconds) && seconds >= SHIFT_REPLY_DELAY_SECONDS_MIN) {
    return Math.min(SHIFT_REPLY_DELAY_SECONDS_MAX, Math.round(seconds));
  }
  return Math.min(
    SHIFT_REPLY_DELAY_SECONDS_MAX,
    SHIFT_REPLY_DELAY_DEFAULT_MINUTES * 60,
  );
}
