import type { Barber } from '@/lib/index';
import { SubscriptionTier } from '@/lib/index';
import { canEnableMensGroomingCenter } from '@/config/mensGroomingCenterPolicy';

export const MENS_GROOMING_CENTER_FILTER_LABEL_AR = 'مراكز العناية بالرجل';

export const MENS_GROOMING_CENTER_BANNER_TAGLINE_AR =
  'تجربة متكاملة — حلاقة وعناية واسترخاء';

export const MENS_GROOMING_CENTER_CARD_RING_CLASS =
  'ring-2 ring-amber-400/55 shadow-[0_0_24px_rgba(251,191,36,0.18)]';

export const MENS_GROOMING_CENTER_CARD_SURFACE_CLASS =
  'border-amber-500/35 bg-gradient-to-br from-amber-950/20 via-slate-950/40 to-amber-900/10';

export function isMensGroomingCenterBarber(
  barber: Pick<Barber, 'mensGroomingCenter' | 'subscription'>,
): boolean {
  return (
    barber.mensGroomingCenter === true && barber.subscription === SubscriptionTier.DIAMOND
  );
}

export function isMensGroomingCenterDashboardEligible(input: {
  tier: SubscriptionTier | null | undefined;
  digitalShiftAddonPurchased?: boolean;
}): boolean {
  return canEnableMensGroomingCenter({
    tier: input.tier ?? '',
    digitalShiftAddon: input.digitalShiftAddonPurchased === true,
  });
}
