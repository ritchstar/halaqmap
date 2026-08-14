/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * عينات بنرات كوافير ماب — حزم بإطلالة أنثوية.
 */
import { COIFFEUR_BRAND_AR } from '@/config/coiffeurMapUmbrella';

export type CoiffeurBannerTierId = 'bronze' | 'gold' | 'diamond';

export const COIFFEUR_BANNER_GALLERY_COPY = {
  kicker: 'عينات للمستثمرة',
  title: 'ثلاث حزم برمجية',
  titleAccent: 'بإطلالة أنثوية',
  brand: COIFFEUR_BRAND_AR,
} as const;

export const COIFFEUR_BANNER_SAMPLES: ReadonlyArray<{
  id: CoiffeurBannerTierId;
  nameAr: string;
  sampleAtelier: string;
  ribbon: string;
  lines: ReadonlyArray<string>;
}> = [
  {
    id: 'bronze',
    nameAr: 'البرونزية',
    sampleAtelier: 'مشغل ندى',
    ribbon: 'حضور هادئ',
    lines: ['ظهور عند الطلب', 'بطاقة إطلالة واحدة', 'مناسبة للبداية الرسمية'],
  },
  {
    id: 'gold',
    nameAr: 'الذهبية',
    sampleAtelier: 'أتيليه لارا',
    ribbon: 'أولوية ذهبية',
    lines: ['أولوية في الظهور المناسب', 'معرض إطلالات', 'شارة ذهبية للمستعلمة'],
  },
  {
    id: 'diamond',
    nameAr: 'الماسية',
    sampleAtelier: 'دار ياسمين',
    ribbon: 'صدارة الماسية',
    lines: ['أعلى أولوية في النطاق', 'أتيليه إطلالات كامل', 'شارة ماسية للنخبة'],
  },
];
