/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { demoShowcaseBarbers } from '@/data/demoShowcaseBarbers';
import { SubscriptionTier, type Barber } from '@/lib/index';

export type InquiryTierSample = {
  barber: Barber;
  label: string;
};

function asInquirySample(barber: Barber): Barber {
  return {
    ...barber,
    showcasePreview: true,
    hasActiveSubscription: true,
  };
}

/**
 * عيّنتا الذهبي والبرونزي لبطاقة الاستعلام عند غياب صالون حقيقي.
 * تظهران تحت نموذج الماسي مباشرة — ليستا نتائج بحث ولا تُدمجان في القائمة الحيّة.
 */
export function inquiryEmptySearchGoldBronzeSamples(): InquiryTierSample[] {
  const gold = demoShowcaseBarbers.find((b) => b.subscription === SubscriptionTier.GOLD);
  const bronze = demoShowcaseBarbers.find((b) => b.subscription === SubscriptionTier.BRONZE);
  const out: InquiryTierSample[] = [];
  if (gold) out.push({ barber: asInquirySample(gold), label: 'نموذج الذهبي' });
  if (bronze) out.push({ barber: asInquirySample(bronze), label: 'نموذج البرونزي' });
  return out;
}

export function findInquiryTierSampleById(id: string): Barber | null {
  const hit = inquiryEmptySearchGoldBronzeSamples().find((row) => row.barber.id === id);
  return hit?.barber ?? null;
}
