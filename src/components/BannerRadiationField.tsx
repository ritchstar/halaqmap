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
  /** `high` — شبكات التسعير والبنرات المجمّعة */
  intensity?: 'default' | 'high';
  className?: string;
  children: ReactNode;
};

/**
 * غلاف إشعاع خلف البنر: النواة الساطعة تختبئ خلف جسم البطاقة،
 * والهالة الواسعة تنتشر على خلفية الصفحة.
 */
export function BannerRadiationField({
  tier,
  intensity = 'default',
  className,
  children,
}: Props) {
  return (
    <div
      className={cn(
        'banner-radiation-field',
        intensity === 'high' && 'banner-radiation-field--high',
        className,
      )}
      data-banner-radiation-tier={tier}
    >
      <div className="banner-radiation-ambient" aria-hidden />
      <div className="banner-radiation-floor" aria-hidden />
      <div className="banner-radiation-core" aria-hidden />
      <div className="banner-radiation-edge" aria-hidden />
      <div className="banner-radiation-body">{children}</div>
    </div>
  );
}
