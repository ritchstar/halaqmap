/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بنرات افتراضية لمعاينة الباقات الثلاث — ليست نتائج بحث ولا مشاغل مفعّلة.
 */
import { COIFFEUR_BRAND_AR } from '@/config/coiffeurMapUmbrella';
import { COIFFEUR_VISUALS } from '@/config/coiffeurVisuals';

export type CoiffeurBannerTierId = 'bronze' | 'gold' | 'diamond';

export const COIFFEUR_BANNER_GALLERY_COPY = {
  kicker: 'معاينة البنرات',
  title: 'هكذا تظهر الباقات',
  titleAccent: 'للمستعلمة',
  brand: COIFFEUR_BRAND_AR,
  hint: 'عينات تصميم: اسم افتراضي وصورة وتواصل وزر الموقع. ليست مشاغل مفعّلة في نطاقك.',
} as const;

export type CoiffeurBannerSample = {
  id: CoiffeurBannerTierId;
  nameAr: string;
  sampleAtelier: string;
  ribbon: string;
  phone: string;
  lat: number;
  lng: number;
  address: string;
  image: string;
  gallery: readonly string[];
};

export const COIFFEUR_BANNER_SAMPLES: readonly CoiffeurBannerSample[] = [
  {
    id: 'bronze',
    nameAr: 'البرونزية',
    sampleAtelier: 'مشغل ندى',
    ribbon: 'حضور هادئ',
    phone: '+966501111111',
    lat: 24.7136,
    lng: 46.6753,
    address: 'عرض تصميم — إحداثيات نموذجية',
    image: COIFFEUR_VISUALS.cardIntro,
    gallery: [COIFFEUR_VISUALS.cardIntro, COIFFEUR_VISUALS.spa],
  },
  {
    id: 'gold',
    nameAr: 'الذهبية',
    sampleAtelier: 'أتيليه لارا',
    ribbon: 'أولوية ذهبية',
    phone: '+966502222222',
    lat: 24.72,
    lng: 46.68,
    address: 'عرض تصميم — إحداثيات نموذجية',
    image: COIFFEUR_VISUALS.makeup,
    gallery: [COIFFEUR_VISUALS.makeup, COIFFEUR_VISUALS.cardShare, COIFFEUR_VISUALS.spa],
  },
  {
    id: 'diamond',
    nameAr: 'الماسية',
    sampleAtelier: 'دار ياسمين',
    ribbon: 'صدارة الماسية',
    phone: '+966503333333',
    lat: 24.73,
    lng: 46.69,
    address: 'عرض تصميم — إحداثيات نموذجية',
    image: COIFFEUR_VISUALS.hero,
    gallery: [COIFFEUR_VISUALS.hero, COIFFEUR_VISUALS.makeup, COIFFEUR_VISUALS.spa, COIFFEUR_VISUALS.story],
  },
];
