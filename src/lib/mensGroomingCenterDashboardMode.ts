import { SubscriptionTier } from '@/lib/index';
import type { BarberPortalMensGroomingCenterSnapshot } from '@/lib/barberMensGroomingCenterRemote';

export function isMensGroomingCenterDashboardEligible(input: {
  tier: SubscriptionTier | null | undefined;
  digitalShiftUnlocked: boolean;
}): boolean {
  return input.tier === SubscriptionTier.DIAMOND && input.digitalShiftUnlocked;
}

export function isActiveMensGroomingCenterSession(input: {
  tier: SubscriptionTier | null | undefined;
  digitalShiftUnlocked?: boolean;
  mensGroomingCenter?: BarberPortalMensGroomingCenterSnapshot | null;
}): boolean {
  if (!isMensGroomingCenterDashboardEligible({
    tier: input.tier,
    digitalShiftUnlocked: input.digitalShiftUnlocked === true,
  })) {
    return false;
  }
  return input.mensGroomingCenter?.mensGroomingCenter === true;
}
