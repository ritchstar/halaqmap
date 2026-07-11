import { ROUTE_PATHS } from '@/lib';
import { buildAbsoluteHashRoute, getSiteOrigin } from '@/config/siteOrigin';

/** حساب المنصة على X — للاستخدام في حقيبة السفير والتواصل. */
export const HALAQMAP_X_URL = 'https://x.com/halaqmap' as const;

/**
 * ملفات PDF لحقيبة السفير — تُوضع في public/docs/ambassadors/
 * بنفس أسلوب عقد الحلاقين: Halaqmap-…-AR.pdf
 */
export const AMBASSADOR_TRAINING_PDF_FILENAME =
  'Halaqmap-Ambassador-Field-Training-Application-AR.pdf' as const;

export const AMBASSADOR_SLIDES_PDF_FILENAME =
  'Halaqmap-Ambassador-Field-Slides-AR.pdf' as const;

export function ambassadorPublicDocUrl(filename: string): string {
  return `${getSiteOrigin()}/docs/ambassadors/${filename}`;
}

export type AmbassadorKitLinkKind = 'page' | 'pdf' | 'external';

export type AmbassadorKitLink = {
  id: string;
  titleAr: string;
  descriptionAr: string;
  /** مسار Hash داخلي أو URL مطلق */
  href: string;
  kind: AmbassadorKitLinkKind;
  /** إن true يُفتح في تبويب جديد */
  external?: boolean;
};

export type AmbassadorKitGroup = {
  id: string;
  titleAr: string;
  blurbAr: string;
  links: readonly AmbassadorKitLink[];
};

function page(path: string, id: string, titleAr: string, descriptionAr: string): AmbassadorKitLink {
  return {
    id,
    titleAr,
    descriptionAr,
    href: path,
    kind: 'page',
  };
}

/** حقيبة روابط التسويق للسفير — مصدر واحد لرئيسية السفراء ولوحة التحكم. */
export function getAmbassadorMarketingKitGroups(): AmbassadorKitGroup[] {
  const trainingPdf = ambassadorPublicDocUrl(AMBASSADOR_TRAINING_PDF_FILENAME);
  const slidesPdf = ambassadorPublicDocUrl(AMBASSADOR_SLIDES_PDF_FILENAME);

  return [
    {
      id: 'downloads',
      titleAr: 'ملفات للتحميل',
      blurbAr: 'دليل التدريب والتقديم + ملف الشرائح بالشروحات والصور — بعد رفعها إلى مجلد المستندات.',
      links: [
        {
          id: 'pdf-training',
          titleAr: 'دليل التدريب والتقديم (PDF)',
          descriptionAr:
            'نص التدريب، جداول العمولة، مسار الاستهداف، ونموذج التقديم. استخدمه ميدانياً أو اطبعه.',
          href: trainingPdf,
          kind: 'pdf',
          external: true,
        },
        {
          id: 'pdf-slides',
          titleAr: 'شرائح الشرح الميداني (PDF)',
          descriptionAr:
            'ملف شرائح بالصور والشروحات لعرض الباقات على الصالون — جهّزه ثم ضعه بنفس التسمية أدناه.',
          href: slidesPdf,
          kind: 'pdf',
          external: true,
        },
      ],
    },
    {
      id: 'decks',
      titleAr: 'شرائح وصفحات عرض داخل المنصة',
      blurbAr: 'عروض جاهزة للاجتماعات والواتساب — افتحها من الجوال أمام صاحب الصالون.',
      links: [
        page(
          ROUTE_PATHS.GROWTH_PITCH_DECK,
          'growth-pitch',
          'عرض النمو التقديمي (Pitch Deck)',
          'شرائح مقارنة تسويقية وجذب الشركاء — مناسبة للعروض الميدانية والاجتماعات.',
        ),
        page(
          ROUTE_PATHS.PLATFORM_DISCOVER,
          'discover',
          'اكتشف المنصة — شرائح القصة',
          'عرض شرائح قصة المنصة (حملات ومشاركة) لشرح الفكرة بسرعة.',
        ),
        page(
          ROUTE_PATHS.PARTNER_STORY,
          'partner-story',
          'قصة المنصة ومنطق المسار',
          'سرد أعمق لمسار الشريك ولماذا الظهور عند الطلب.',
        ),
        page(
          ROUTE_PATHS.PARTNER_WHY,
          'partner-why',
          'لماذا حلاق ماب؟',
          'إقناع عميق: لماذا المنصة وليست مجرد «حجز» أو عمولة على القص.',
        ),
      ],
    },
    {
      id: 'partner-landings',
      titleAr: 'صفحات هبوط الشركاء والتسجيل',
      blurbAr: 'أرسل هذه الروابط للصالون أو افتحها معه أثناء الزيارة.',
      links: [
        page(
          ROUTE_PATHS.BARBERS_LANDING,
          'partners',
          'مسار الخدمات البرمجية للشركاء',
          'الصفحة الرئيسية لعرض القيمة والحزم لأصحاب الصالونات.',
        ),
        page(
          ROUTE_PATHS.PARTNERS_B2B_LANDING,
          'partners-b2b',
          'هبوط B2B',
          'صفحة هبوط مخصّصة للشركاء التجاريين (نطاق partners عند التفعيل).',
        ),
        page(
          ROUTE_PATHS.REGISTER,
          'register',
          'تسجيل الشريك',
          'نموذج التسجيل — اربط عليه كود/رابط إسنادك عند الإرسال للصالون.',
        ),
        page(
          ROUTE_PATHS.PARTNER_INTEREST,
          'interest',
          'تسجيل اهتمام مسبق',
          'لمن يريد ترك بياناته قبل إتمام الاشتراك فوراً.',
        ),
        page(
          ROUTE_PATHS.PARTNER_SALES_OFFICE,
          'sales-office',
          'مكتب المبيعات B2B',
          'صفحة تفاوض وشرح وانضمام — مفيدة عند الاعتراضات.',
        ),
        page(
          ROUTE_PATHS.SUBSCRIPTION_POLICY,
          'subscription-policy',
          'سياسة الحزم والأسعار',
          'الأسعار، الشروط، والاسترجاع — مرجع شفاف أمام الصالون.',
        ),
      ],
    },
    {
      id: 'features',
      titleAr: 'صفحات شرح الميزات',
      blurbAr: 'استخدمها عندما يسأل الصالون عن ميزة محددة.',
      links: [
        page(
          ROUTE_PATHS.DIGITAL_SHIFT_FEATURE,
          'digital-shift',
          'المناوب الرقمي الذكي',
          'شرح مفصّل لإضافة المناوب — مناسب للماسي والمكتب الخاص.',
        ),
        page(
          ROUTE_PATHS.PRIVATE_OFFICE_GUIDE,
          'private-office',
          'دليل المكتب الخاص',
          'تعليمات استخدام إضافة المكتب الخاص بعد الاشتراك.',
        ),
        page(
          ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW,
          'banners-preview',
          'معاينة البنرات والواجهات',
          'عرض بصري للبنرات حسب الباقات — يقنع بالصورة قبل الدفع.',
        ),
        page(
          ROUTE_PATHS.PARTNER_TUTORIALS,
          'tutorials',
          'دروس تفعيل الرخصة',
          'فيديوهات/شروحات تفعيل الرخصة للشركاء بعد الاشتراك.',
        ),
        page(
          ROUTE_PATHS.RADAR_SHOWCASE,
          'radar',
          'معاينة نظام الرصد',
          'عرض تقني لنظام الرصد — للحوارات المتقدمة فقط.',
        ),
      ],
    },
    {
      id: 'hospitality',
      titleAr: 'الشقق المفروشة والضيافة',
      blurbAr: 'مسار المكافأة 25 ر.س بعد الاستلام بلا شكوى.',
      links: [
        page(
          ROUTE_PATHS.HOSPITALITY_B2B_REQUEST,
          'hospitality',
          'طلب بنرات للمنشآت الفندقية/المفروشة',
          'نموذج طلب B2B للبنرات مع الشحن — اربطه بطلب استهداف مفروشات.',
        ),
      ],
    },
    {
      id: 'trust',
      titleAr: 'ثقة وهوية المنصة',
      blurbAr: 'روابط قانونية وهوية — عند الأسئلة عن الخصوصية أو طبيعة المنصة.',
      links: [
        page(
          ROUTE_PATHS.ABOUT,
          'about',
          'عن حلاق ماب',
          'تعريف عام بالمنصة.',
        ),
        page(
          ROUTE_PATHS.TERMS_OF_SERVICE,
          'terms',
          'شروط الاستخدام',
          'الشروط العامة للمنصة.',
        ),
        page(
          ROUTE_PATHS.PARTNER_PRIVACY,
          'partner-privacy',
          'خصوصية الشركاء',
          'سياسة خصوصية مسار الشركاء.',
        ),
        page(
          ROUTE_PATHS.AMBASSADOR_RULES,
          'ambassador-rules',
          'وثيقة قواعد السفراء',
          'مرجعك التشغيلي والمالي الكامل داخل المنصة.',
        ),
      ],
    },
    {
      id: 'social',
      titleAr: 'التواصل الاجتماعي',
      blurbAr: 'انشر وتابع حساب المنصة الرسمي.',
      links: [
        {
          id: 'x-halaqmap',
          titleAr: 'حساب حلاق ماب على X',
          descriptionAr: 'المنصة الرسمية على X — شارك المنشورات وروابط الباقات مع الصالونات.',
          href: HALAQMAP_X_URL,
          kind: 'external',
          external: true,
        },
      ],
    },
  ];
}

/** رابط مطلق لصفحة داخلية — للنسخ في واتساب. */
export function absoluteAmbassadorKitHref(link: AmbassadorKitLink): string {
  if (link.kind === 'pdf' || link.kind === 'external' || link.href.startsWith('http')) {
    return link.href;
  }
  return buildAbsoluteHashRoute(link.href);
}
