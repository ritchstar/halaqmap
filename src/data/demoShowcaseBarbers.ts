import { Barber, SubscriptionTier } from '@/lib/index';
import { IMAGES } from '@/assets/images';

/** حلاق واحد لكل باقة — للعرض التجريبي على الصفحة الرئيسية فقط */
export const demoShowcaseBarbers: Barber[] = [
  {
    id: 'demo-showcase-diamond',
    name: '[عرض] صالون النخبة الماسي',
    phone: '+966501111111',
    whatsapp: '+966501111111',
    location: {
      lat: 24.7136,
      lng: 46.6753,
      address: 'حي العليا، الرياض (عرض تصميم)',
    },
    subscription: SubscriptionTier.DIAMOND,
    rating: 4.9,
    reviewCount: 120,
    images: [
      IMAGES.HALAQMAP_BARBER_BANNER_1_41,
      IMAGES.BARBER_SHOP_1,
      IMAGES.BARBER_WORK_1,
    ],
    services: [
      { name: 'قصة شعر رجالي', price: 50 },
      { name: 'حلاقة ذقن', price: 30 },
    ],
    workingHours: [
      { day: 'السبت', open: '09:00', close: '23:00' },
      { day: 'الأحد', open: '09:00', close: '23:00' },
    ],
    isOpen: true,
    verified: true,
    categories: ['رجالي', 'أطفال', 'تقليدي'],
    ratingInviteToken: '7f9a2c4e8b1d0e3f6a5c9e2b7d4f1a08',
  },
  {
    id: 'demo-showcase-gold',
    name: '[عرض] حلاق الملوك الذهبي',
    phone: '+966502222222',
    whatsapp: '+966502222222',
    location: {
      lat: 24.65,
      lng: 46.72,
      address: 'حي الربوة، الرياض (عرض تصميم)',
    },
    subscription: SubscriptionTier.GOLD,
    rating: 4.7,
    reviewCount: 88,
    images: [
      IMAGES.BARBER_INTERIOR_3,
      IMAGES.BARBER_WORK_2,
      IMAGES.BARBER_CHAIR_3,
    ],
    services: [
      { name: 'قصة شعر رجالي', price: 45 },
      { name: 'حلاقة ذقن', price: 25 },
    ],
    workingHours: [
      { day: 'السبت', open: '10:00', close: '22:00' },
      { day: 'الأحد', open: '10:00', close: '22:00' },
    ],
    isOpen: true,
    verified: true,
    categories: ['رجالي', 'تقليدي'],
    ratingInviteToken: '9a0b1c2d3e4f5061728394a5b6c7d8e9',
  },
  {
    id: 'demo-showcase-bronze',
    name: '[عرض] صالون الأناقة البرونزي',
    phone: '+966503333333',
    whatsapp: '+966503333333',
    location: {
      lat: 24.78,
      lng: 46.62,
      address: 'حي النسيم، الرياض (عرض تصميم)',
    },
    subscription: SubscriptionTier.BRONZE,
    rating: 4.3,
    reviewCount: 42,
    images: [
      IMAGES.BARBER_INTERIOR_8,
      IMAGES.BARBER_WORK_4,
      IMAGES.BARBER_SHOP_3,
    ],
    services: [
      { name: 'قصة شعر رجالي', price: 35 },
      { name: 'حلاقة ذقن', price: 20 },
    ],
    workingHours: [
      { day: 'السبت', open: '11:00', close: '21:00' },
      { day: 'الأحد', open: '11:00', close: '21:00' },
    ],
    isOpen: true,
    verified: false,
    categories: ['رجالي'],
    showcaseTopBanner: true,
  },
];
