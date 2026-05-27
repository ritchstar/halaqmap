import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BannerRadiationTier = 'bronze' | 'gold' | 'diamond' | 'office';

/** تحويل معرّف باقة إلى طبقة إشعاع */
export function bannerRadiationTierFromId(id: string): BannerRadiationTier {
  if (id === 'gold') return 'gold';
  if (id === 'diamond') return 'diamond';
  if (id === 'diamond-office' || id === 'diamond_office' || id === 'office') return 'office';
  return 'bronze';
}

type Props = {
  tier: BannerRadiationTier;
  className?: string;
  children: ReactNode;
};

/**
 * منطق التوهج الموحّد للبنرات الكبرى:
 * — نواة ساطعة خلف البطاقة (مخفية بجسم معتم)
 * — هالة ناعمة تنتشر على الخلفية
 * — حافة خفيفة لا تتداخل مع محتوى البنر
 */
export function BannerRadiationField({ tier, className, children }: Props) {
  return (
    <div
      className={cn('banner-radiation-field', className)}
      data-banner-radiation-tier={tier}
    >
      <div className="banner-radiation-ambient" aria-hidden />
      <div className="banner-radiation-core" aria-hidden />
      <div className="banner-radiation-edge" aria-hidden />
      <div className="banner-radiation-body">{children}</div>
    </div>
  );
}
