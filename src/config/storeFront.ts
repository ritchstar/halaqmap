/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * واجهة متجر halaqmap — نصوص العرض فقط.
 * يُحمَّل كسولاً مع صفحات المتجر، لا يُستورد من App.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';
import { STORE_SATELLITE_HOST } from '@/lib/storeHostRedirect';
import {
  LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR,
  LEGAL_ECOMMERCE_STORE_ENGLISH_LINE,
  LEGAL_ECOMMERCE_STORE_NAME,
  LEGAL_ECOMMERCE_STORE_PUBLIC_NAME_AR,
  LEGAL_FIRST_SOFTWARE_PRODUCT_AR,
} from '@/config/partnerLegal';

export { STORE_SATELLITE_HOST };

export const STORE_ORIGIN = `https://${STORE_SATELLITE_HOST}` as const;
export const STORE_BRAND_LATIN = LEGAL_ECOMMERCE_STORE_NAME;
export const STORE_PUBLIC_NAME_AR = LEGAL_ECOMMERCE_STORE_PUBLIC_NAME_AR;
export const STORE_ENGLISH_LINE = LEGAL_ECOMMERCE_STORE_ENGLISH_LINE;

export const COIFFEUR_PRODUCT_AR = 'كوافير ماب' as const;

export const STORE_LANDING_COPY = {
  documentTitle: `${STORE_BRAND_LATIN} — ${STORE_PUBLIC_NAME_AR}`,
  cardsTitle: `${STORE_PUBLIC_NAME_AR} — بطاقة تهنئة مجانية`,
  kicker: STORE_ENGLISH_LINE,
  publicName: STORE_PUBLIC_NAME_AR,
  latinMark: STORE_BRAND_LATIN,
  heroLead:
    'متجر إلكتروني للبيع بالتجزئة للبرمجيات. تقدّم طلبك هنا لتُدرس الخدمة ويُرد عليك لاحقاً. المنتجات الحالية معروضة للتعريف، وخدمات برمجية أخرى تُجهَّز ثم تُعرض على هذه الواجهة.',
  roleLine: 'متجر إلكتروني للبيع بالتجزئة للبرمجيات.',
  requestTitle: 'طلب خدمات المتجر',
  requestLead:
    'اكتب اسمك وبيانات التواصل، واسم المنشأة إن وُجد أو رقم وثيقة العمل الحر، ثم اشرح طلبك بوضوح مبدئي أو مفصّل. تدرسه الإدارة وترد لاحقاً.',
  requestSuccess: 'وصل الطلب. ستدرسه الإدارة وترد عبر البريد أو الجوال أو واتساب.',
  comingSoonTitle: 'خدمات برمجية لاحقة',
  comingSoonLead: 'ستُعرض هنا عند الجاهزية. لا أسعار ولا حزم في هذه المرحلة.',
  freeCardsTitle: 'خدمات برمجية مجانية الآن',
  freeCardsLead:
    'أصدر بطاقة تهنئة لنفسك: الاسم ورقم الجوال والبريد ورابط صورة شخصية. يوم وطني، تخرج، أو معايدة. نسخة أولى قابلة للتعديل لاحقاً.',
  footerLegal: LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR,
  consentLabel: 'أوافق على دراسة الطلب والرد عبر البريد أو الجوال أو واتساب.',
} as const;

export const STORE_LIVE_PRODUCTS = [
  {
    id: 'halaq-map',
    nameAr: LEGAL_FIRST_SOFTWARE_PRODUCT_AR,
    blurb: 'المنتج البرمجي الأول للمتجر. استعلام مجاني للمستعلم، وحزم نفاذ برمجية للصالون.',
    href: 'https://www.halaqmap.com',
  },
  {
    id: 'coiffeur-map',
    nameAr: COIFFEUR_PRODUCT_AR,
    blurb: 'منتج قطاعي نسائي ضمن المتجر نفسه. بوابة الدفع واحدة على النطاق الأم.',
    href: 'https://coiffeur.halaqmap.com',
  },
] as const;

export type StoreGreetingOccasion = 'national_day' | 'graduation' | 'greeting';

export const STORE_GREETING_OCCASIONS: ReadonlyArray<{
  id: StoreGreetingOccasion;
  titleAr: string;
  subtitleAr: string;
}> = [
  {
    id: 'national_day',
    titleAr: 'تهنئة باليوم الوطني',
    subtitleAr: 'بطاقة خضراء باسمك وبياناتك.',
  },
  {
    id: 'graduation',
    titleAr: 'تهنئة بالتخرج',
    subtitleAr: 'بطاقة تخرج باسمك وبياناتك.',
  },
  {
    id: 'greeting',
    titleAr: 'بطاقة معايدة',
    subtitleAr: 'بطاقة معايدة تصدرها لنفسك.',
  },
];

export function storeCardsPath(occasion?: StoreGreetingOccasion): string {
  if (!occasion) return ROUTE_PATHS.STORE_CARDS;
  return `${ROUTE_PATHS.STORE_CARDS}?kind=${occasion}`;
}
