import { SubscriptionTier } from '@/lib/index';
import { canEnableChildrenSpecialist } from '@/config/childrenSpecialistPolicy';
import type { BarberPortalChildrenServicesSnapshot } from '@/lib/barberChildrenServicesRemote';

export function isChildrenSpecialistDashboardEligible(
  tier: SubscriptionTier | null | undefined,
): boolean {
  return canEnableChildrenSpecialist(tier);
}

export function isActiveChildrenSpecialistSession(input: {
  tier: SubscriptionTier | null | undefined;
  childrenServices?: BarberPortalChildrenServicesSnapshot | null;
}): boolean {
  if (!canEnableChildrenSpecialist(input.tier)) return false;
  return (
    input.childrenServices?.acceptsChildren === true &&
    input.childrenServices?.childrenSpecialist === true
  );
}
