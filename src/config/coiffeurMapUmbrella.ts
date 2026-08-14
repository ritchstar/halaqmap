/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * كوافير ماب — سطح قطاعي تحت مظلة حلاق ماب.
 * الدومين واجهة فقط. الكيان التجاري، ميسر، وصفحات الدفع تبقى على www.halaqmap.com.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';
import {
  LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  LEGAL_TRADE_NAME_AR,
  LEGAL_UNIFIED_NUMBER_LABEL_AR,
} from '@/config/partnerLegal';

/** أصل الدفع الإلزامي — لا يُستبدل بأصل الدومين القمر الصناعي */
export const COIFFEUR_HALAQMAP_ORIGIN = 'https://www.halaqmap.com' as const;

export const COIFFEUR_HALAQMAP_PAYMENT_URL =
  `${COIFFEUR_HALAQMAP_ORIGIN}/#${ROUTE_PATHS.PAYMENT}` as const;

export const COIFFEUR_HALAQMAP_PAYMENT_SUCCESS_URL =
  `${COIFFEUR_HALAQMAP_ORIGIN}/#${ROUTE_PATHS.PAYMENT_SUCCESS}` as const;

export const COIFFEUR_SATELLITE_HOST = 'coiffeur.halaqmap.com' as const;

export const COIFFEUR_BRAND_AR = 'كوافير ماب' as const;

export const COIFFEUR_UMBRELLA_LINE_AR =
  'كوافير ماب سطح قطاعي تابع لمنصة حلاق ماب — الكيان التجاري والتوثيق ونظام الدفع جميعها لدى حلاق ماب.' as const;

export const COIFFEUR_FOOTER_LEGAL_AR =
  `${LEGAL_TRADE_NAME_AR} · ${LEGAL_UNIFIED_NUMBER_LABEL_AR}: ${LEGAL_NATIONAL_UNIFIED_NUMBER}` as const;

export const COIFFEUR_FOOTER_ECOMMERCE_AR = LEGAL_ECOMMERCE_AUTH_FOOTER_LINE_AR;

export const COIFFEUR_LANDING_META = {
  documentTitle: 'كوافير ماب — تابع لمنصة حلاق ماب',
  partnersTitle: 'انضمام صالون كوافير — تحت مظلة حلاق ماب',
} as const;

export const COIFFEUR_LANDING_COPY = {
  badge: 'مجاني للمستعلمة · بلا حساب',
  title: 'أقرب صالون كوافير يناسب حاجتك',
  lead:
    'استجابة ذكية تربط المستعلمة بصالونات التجميل والكوافير النسائي المفعّلة عند الطلب — حسب الموقع ونوع الخدمة. ليست وساطة حجز ولا عمولة على الخدمة.',
  searchCta: 'الاستعلام يُفعَّل مع تسكين الصالونات',
  searchHint: 'خريطة المستعلمات تُفتح بعد تفعيل صالونات نسائية مرخّصة — لا تُحوَّل إلى مسار الحلاقة الرجالية.',
  partnerCta: 'سجّلي صالونك الآن — دقيقتين',
  partnerSecondary: 'صاحبة صالون؟ مسار الانضمام هنا',
  trust: [
    {
      title: 'ظهور عند الطلب',
      body: 'الحضور الرقمي يُفعَّل برمجياً عند استعلام مناسب — لا قائمة دائمة عشوائية.',
    },
    {
      title: 'بلا عمولة على الخدمة',
      body: 'المنشأة تشتري رخصة نفاذ مسبقة الدفع. ريال الخدمة يبقى للصالون.',
    },
    {
      title: 'الدفع لدى حلاق ماب',
      body: 'بوابة ميسر وصفحة النجاح على www.halaqmap.com فقط — لا حساب تاجر لكوافير ماب.',
    },
  ],
} as const;

export const COIFFEUR_PARTNERS_COPY = {
  badge: 'سطح قطاعي تحت مظلة حلاق ماب',
  title: 'رخصة نفاذ رقمية لصالونك النسائي',
  lead:
    'نفس منتج حلاق ماب: رخصة نفاذ على نظام الاستجابة الذكية. نفس التعهدات، نفس الفورم، ثم الدفع على نطاق حلاق ماب بعد اكتمال الطلب.',
  stepsTitle: 'ثلاث خطوات — لا تُختصر',
  steps: [
    'أكمل طلب الانضمام والتعهدات في مسار الشركاء المعتمد.',
    'ادفع رخصة النفاذ عبر ميسر على www.halaqmap.com بعد اكتمال الطلب فقط.',
    'بعد نجاح الدفع يُفعَّل ظهور صالونك عند الطلب المناسب.',
  ],
  registerCta: 'ابدئي طلب الانضمام',
  paymentNote: 'لا بوابة دفع على دومين كوافير ماب، ولا callback جديد في ميسر.',
} as const;
