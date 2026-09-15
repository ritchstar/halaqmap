/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { SubscriptionTier } from '@/lib';

/** يُعيد المستوى فقط إن كان المعامل صريحاً وصالحاً — بلا افتراض صامت. */
export function parseSubscriptionTierParam(raw: string | null | undefined): SubscriptionTier | null {
  const t = (raw ?? '').trim().toLowerCase();
  if (t === SubscriptionTier.BRONZE || t === SubscriptionTier.GOLD || t === SubscriptionTier.DIAMOND) {
    return t as SubscriptionTier;
  }
  return null;
}

export function isSubscriptionTierParamValid(raw: string | null | undefined): boolean {
  return parseSubscriptionTierParam(raw) != null;
}
