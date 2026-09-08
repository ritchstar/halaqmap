/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هوية قطاعية لمنتجات المتجر — خلفية التشغيل وجار الحي.
 * لا تُستورد من App.
 */
import { STORE_CAFE_LIVE_ACCENT } from '@/config/storeCafeLive';
import { STORE_GROCERS_LIVE_ACCENT } from '@/config/storeGrocersLive';
import { STORE_HALANA_LIVE_ACCENT } from '@/config/storeHalanaLive';
import { STORE_KITCHEN_LIVE_ACCENT } from '@/config/storeKitchenLive';
import { STORE_PRODUCE_LIVE_ACCENT } from '@/config/storeProduceLive';
import { STORE_RESTAURANT_LIVE_ACCENT } from '@/config/storeRestaurantLive';

export type StoreLiveSectorId = 'grocers' | 'produce' | 'kitchen' | 'restaurant' | 'cafe' | 'halana';

export type StoreSectorIdentity = {
  id: StoreLiveSectorId;
  accent: string;
  /** إضاءة قطاعية خافتة في لوحة التشغيل */
  workspaceGlow: string;
  /** خلفية افتراضية لجار الحي عند عدم تخصيص المشغّل */
  storefrontPageBg: string;
  /** قناع البطل فوق صورة الغلاف */
  storefrontHeroVeil: string;
  /** سطح المحتوى تحت البطل */
  storefrontSurface: string;
};

export const STORE_SECTOR_IDENTITY: Record<StoreLiveSectorId, StoreSectorIdentity> = {
  grocers: {
    id: 'grocers',
    accent: STORE_GROCERS_LIVE_ACCENT,
    workspaceGlow: 'rgba(13, 148, 136, 0.09)',
    storefrontPageBg: 'linear-gradient(165deg, #0a1218 0%, #071018 40%, #050308 100%)',
    storefrontHeroVeil: 'linear-gradient(180deg, rgba(10,18,24,0.18), rgba(5,3,8,0.9))',
    storefrontSurface: '#070c10',
  },
  produce: {
    id: 'produce',
    accent: STORE_PRODUCE_LIVE_ACCENT,
    workspaceGlow: 'rgba(66, 154, 92, 0.09)',
    storefrontPageBg: 'linear-gradient(165deg, #0a1810 0%, #061208 38%, #050308 100%)',
    storefrontHeroVeil: 'linear-gradient(180deg, rgba(10,24,16,0.15), rgba(5,3,8,0.9))',
    storefrontSurface: '#08100a',
  },
  kitchen: {
    id: 'kitchen',
    accent: STORE_KITCHEN_LIVE_ACCENT,
    workspaceGlow: 'rgba(180, 90, 60, 0.09)',
    storefrontPageBg: 'linear-gradient(165deg, #1a0e08 0%, #120806 38%, #050308 100%)',
    storefrontHeroVeil: 'linear-gradient(180deg, rgba(26,14,8,0.15), rgba(5,3,8,0.92))',
    storefrontSurface: '#0f0a08',
  },
  restaurant: {
    id: 'restaurant',
    accent: STORE_RESTAURANT_LIVE_ACCENT,
    workspaceGlow: 'rgba(198, 106, 50, 0.09)',
    storefrontPageBg: 'linear-gradient(165deg, #180808 0%, #120606 40%, #050308 100%)',
    storefrontHeroVeil: 'linear-gradient(180deg, rgba(24,8,8,0.12), rgba(5,3,8,0.92))',
    storefrontSurface: '#100808',
  },
  cafe: {
    id: 'cafe',
    accent: STORE_CAFE_LIVE_ACCENT,
    workspaceGlow: 'rgba(185, 117, 69, 0.09)',
    storefrontPageBg: 'linear-gradient(165deg, #140c08 0%, #0e0806 42%, #050308 100%)',
    storefrontHeroVeil: 'linear-gradient(180deg, rgba(20,12,8,0.14), rgba(5,3,8,0.9))',
    storefrontSurface: '#0c0806',
  },
  halana: {
    id: 'halana',
    accent: STORE_HALANA_LIVE_ACCENT,
    workspaceGlow: 'rgba(182, 83, 114, 0.08)',
    storefrontPageBg: 'linear-gradient(165deg, #2a1018 0%, #14080c 55%, #0a0608 100%)',
    storefrontHeroVeil: 'linear-gradient(180deg, rgba(42,16,24,0.12), rgba(20,8,12,0.92))',
    storefrontSurface: '#14080c',
  },
};
