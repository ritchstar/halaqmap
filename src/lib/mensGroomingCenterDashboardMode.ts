import { SubscriptionTier } from '@/lib/index';
import type { BarberPortalMensGroomingCenterSnapshot } from '@/lib/barberMensGroomingCenterRemote';

export function isMensGroomingCenterDashboardEligible(
  tier: SubscriptionTier | null | undefined,
): boolean {
  return tier === SubscriptionTier.DIAMOND;
}

export function isActiveMensGroomingCenterSession(input: {
  tier: SubscriptionTier | null | undefined;
  mensGroomingCenter?: BarberPortalMensGroomingCenterSnapshot | null;
}): boolean {
  if (!isMensGroomingCenterDashboardEligible(input.tier)) return false;
  return input.mensGroomingCenter?.mensGroomingCenter === true;
}
