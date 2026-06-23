import { SubscriptionTier } from '@/lib';
import { CHILDREN_BARBER_CATEGORY } from '@/lib/barberCategoryLexicon';

/** مسار التخصص عند التسجيل — عام أو متخصص أطفال أو مركز عناية بالرجل. */
export type BarberSpecialtyTrack = 'general' | 'children' | 'mens_grooming_center';

export const CHILDREN_SPECIALIST_DIAMOND_ONLY_AR =
  'مسار «متخصص أطفال» متاح للباقة الماسية فقط — بطاقة وبنر مميزان على الخريطة وفلتر «متخصص أطفال» ولوحة تحكم مخصصة في تبويب «متخصص أطفال».';

export const CHILDREN_HAIRCUT_ALL_TIERS_AR =
  'خدمة «حلاقة أطفال» متاحة للبرونزي والذهبي والماسي — أضفها ضمن التخصص العام.';

export function canEnableChildrenSpecialist(tier: SubscriptionTier | '' | string | null | undefined): boolean {
  return tier === SubscriptionTier.DIAMOND || String(tier ?? '').toLowerCase() === 'diamond';
}

export function resolveRegistrationChildrenFields(input: {
  specialtyTrack: BarberSpecialtyTrack;
  tier: SubscriptionTier;
  categories: string[];
}): { categories: string[]; childrenSpecialist: boolean } {
  if (input.specialtyTrack === 'children' && canEnableChildrenSpecialist(input.tier)) {
    return {
      categories: [CHILDREN_BARBER_CATEGORY],
      childrenSpecialist: true,
    };
  }
  return {
    categories: [...input.categories],
    childrenSpecialist: false,
  };
}

export function resolveChildrenSpecialistFlag(input: {
  requested: boolean;
  acceptsChildren: boolean;
  tier: string | null | undefined;
}): boolean {
  if (!input.requested || !input.acceptsChildren) return false;
  return canEnableChildrenSpecialist(input.tier);
}
