/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * إعادة تدريجية لخريطة النبض العامة (/radar).
 * عطّل مؤقتاً عبر VITE_PUBLIC_PULSE_EXPERIENCE_ENABLED=false
 */
export const PUBLIC_PULSE_EXPERIENCE_ENABLED =
  import.meta.env.VITE_PUBLIC_PULSE_EXPERIENCE_ENABLED !== 'false';
