/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { normalizeSaudiMobileForWa } from '@/lib/saudiWhatsAppPhone';

/** Normalize Saudi mobile to 9665xxxxxxxx (12 digits). Shared with banner WhatsApp links. */
export function normalizePartnerProspectPhone(raw: string): string | null {
  return normalizeSaudiMobileForWa(raw);
}
