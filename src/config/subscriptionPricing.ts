import { SubscriptionTier } from '@/lib/index';

/** أسعار البطاقة الواحدة (30 يوم إدراج) بالريال السعودي */
export const TIER_MONTHLY_SAR: Record<SubscriptionTier, number> = {
  [SubscriptionTier.BRONZE]: 100,
  [SubscriptionTier.GOLD]: 150,
  [SubscriptionTier.DIAMOND]: 200,
};
