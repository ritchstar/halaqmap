import { Barber, SubscriptionTier } from '@/lib/index';
import { canEnableChildrenSpecialist } from '@/config/childrenSpecialistPolicy';

export function isChildrenSpecialistBarber(
  barber: Pick<Barber, 'childrenSpecialist' | 'subscription'>,
): boolean {
  return (
    barber.childrenSpecialist === true && canEnableChildrenSpecialist(barber.subscription)
  );
}

export const CHILDREN_SPECIALIST_CARD_RING_CLASS =
  'ring-2 ring-sky-400/55 shadow-[0_0_36px_rgba(56,189,248,0.2)]';

export const CHILDREN_SPECIALIST_CARD_SURFACE_CLASS =
  'border-sky-400/35 bg-gradient-to-br from-sky-500/[0.08] via-card to-cyan-500/[0.06]';

export const CHILDREN_SPECIALIST_BANNER_TAGLINE_AR = 'صالون متخصص — بيئة طفولية آمنة';

export const CHILDREN_SPECIALIST_FILTER_LABEL_AR = 'متخصص أطفال';
