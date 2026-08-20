/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { normalizeSaudiMobileForWa } from '@/lib/saudiWhatsAppPhone';

/** عرض رقم سعودي مخفي بصرياً: 05••• ••123 */
export function maskSaudiMobileDisplay(raw: string): string {
  const n = normalizeSaudiMobileForWa(raw);
  if (!n) return '05••• •••••';
  const local = `0${n.slice(3)}`;
  return `${local.slice(0, 2)}••• ••${local.slice(-3)}`;
}
