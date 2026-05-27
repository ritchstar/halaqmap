import { ROUTE_PATHS } from '@/lib';
import {
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  TIER_MONTHLY_SAR,
} from '@/config/subscriptionPricing';
import { SubscriptionTier } from '@/lib/index';
import {
  PARTNER_BANNERS_PREVIEW_TIERS,
} from '@/config/partnerBannersPreviewCopy';
import {
  PARTNER_FEATURE_PREVIEW_DASHBOARD,
  PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT,
  PARTNER_FEATURE_PREVIEW_PRIVATE_OFFICE,
} from '@/config/partnerFeaturePreviewsCopy';

/** معرّفات أقسام مركز المعاينة — للفهرس والتمرير */
export const PARTNER_PRODUCT_HUB_SECTION_IDS = {
  banners: 'hub-banners',
  dashboard: 'hub-dashboard',
  diamondCompare: 'hub-diamond-compare',
  digitalShift: 'hub-digital-shift',
  privateOffice: 'hub-private-office',
  nextStep: 'hub-next-step',
} as const;

export type PartnerProductHubSection = {
  id: string;
  label: string;
  shortLabel?: string;
};

export const PARTNER_PRODUCT_HUB_SECTIONS: readonly PartnerProductHubSection[] = [
  { id: PARTNER_PRODUCT_HUB_SECTION_IDS.banners, label: 'البنرات', shortLabel: 'بنرات' },
  { id: PARTNER_PRODUCT_HUB_SECTION_IDS.dashboard, label: 'لوحة التحكم', shortLabel: 'لوحة' },
  { id: PARTNER_PRODUCT_HUB_SECTION_IDS.diamondCompare, label: 'مقارنة الماسي', shortLabel: 'مقارنة' },
  { id: PARTNER_PRODUCT_HUB_SECTION_IDS.digitalShift, label: 'المناوب الذكي', shortLabel: 'مناوب' },
  { id: PARTNER_PRODUCT_HUB_SECTION_IDS.privateOffice, label: 'المكتب الخاص', shortLabel: 'مكتب' },
  { id: PARTNER_PRODUCT_HUB_SECTION_IDS.nextStep, label: 'الخطوة التالية', shortLabel: 'شراء' },
];

export const PARTNER_PRODUCT_HUB_TITLE = 'معاينة الباقات وإضافة المكتب الخاص 🏛️';

export const PARTNER_PRODUCT_HUB_TAGLINE =
  `إضافة المكتب الخاص = مساعد داخلي 🏛️ + مناوب شات 🌙 — للماسي فقط (+${DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س/حزمة)`;

export const PARTNER_PRODUCT_HUB_INTRO =
  'محاكاة تلقائية لرحلة الزبون على الرادار، ثم أدوات التشغيل والماسي وإضافة المكتب — في صفحة واحدة مفهرسة.';

export type PartnerTierComparisonColumn = {
  id: string;
  name: string;
  badge: string;
  color: string;
  badgeColor: string;
  features: readonly string[];
  note: string;
  recommended?: boolean;
};

export const PARTNER_TIER_COMPARISON_COLUMNS: readonly PartnerTierComparisonColumn[] = [
  {
    id: 'bronze-gold',
    name: 'برونزي وذهبي',
    badge: '🥉🥇',
    color: 'border-slate-700/50 bg-slate-800/20',
    badgeColor: 'text-slate-400',
    features: [
      '❌ المناوب الذكي غير متاح',
      '❌ المكتب الخاص غير متاح',
      '✅ ظهور جغرافي عند الطلب',
      '✅ بطاقة صالون كاملة على الرادار',
    ],
    note: 'يمكن الترقية للماسي في أي وقت',
  },
  {
    id: 'diamond',
    name: 'ماسي — بدون إضافة',
    badge: '💎',
    color: 'border-cyan-500/25 bg-cyan-950/15',
    badgeColor: 'text-cyan-300',
    features: [
      '❌ المناوب غير مفعّل',
      '❌ المكتب الخاص غير مفعّل',
      '✅ صدارة النتائج القريبة',
      '✅ معرض حتى 40 صورة',
      '✅ جدولة مواعيد (ماسي)',
    ],
    note: `يمكن إضافة المكتب لاحقاً (+${DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س/حزمة)`,
  },
  {
    id: 'diamond-office',
    name: 'ماسي + المكتب الخاص',
    badge: '💎🏛️',
    color: 'border-violet-500/35 bg-violet-950/20',
    badgeColor: 'text-violet-300',
    features: [
      '✅ مناوب شات ذكي للزبائن',
      '✅ مكتب خاص للحلاق',
      '✅ تعليمات + مهام + تقارير',
      '✅ رصيد الحزمة + تجديد فوري',
      '✅ كل مزايا الماسي',
    ],
    note: `${TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND] + DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س/حزمة — الأقوى`,
    recommended: true,
  },
];

export const PARTNER_PRODUCT_HUB_SUMMARY_CARDS = [
  {
    id: 'shift',
    emoji: '🌙',
    title: 'المناوب الذكي',
    desc: 'يرد عنك عند الإغلاق أو الانشغال — بلغة الزبون (7 لغات) ويُنفّذ تعليماتك بسرية.',
    sectionId: PARTNER_PRODUCT_HUB_SECTION_IDS.digitalShift,
  },
  {
    id: 'office',
    emoji: '🏛️',
    title: 'المكتب الخاص',
    desc: 'محادثة داخلية حصرية — اكتب «تعليمة:» والمناوب ينفّذها، والتقارير تصلك في مكان واحد.',
    sectionId: PARTNER_PRODUCT_HUB_SECTION_IDS.privateOffice,
  },
] as const;

export const PARTNER_PRODUCT_HUB_CTA = {
  title: 'جاهز لتفعيل رخصة تناسب صالونك؟',
  subtitle:
    'ابدأ من التسجيل أو شحن رصيدك — واطّلع على دليل المكتب الخاص إن اخترت إضافة الماسي.',
  registerPath: ROUTE_PATHS.REGISTER,
  guidePath: ROUTE_PATHS.PRIVATE_OFFICE_GUIDE,
  marketingPath: ROUTE_PATHS.BARBERS_LANDING,
  deepDivePath: ROUTE_PATHS.DIGITAL_SHIFT_FEATURE,
} as const;

/** إعادة تصدير المصادر الموحّدة — لتجنّب تكرار النصوص في الصفحات */
export {
  PARTNER_BANNERS_PREVIEW_TIERS,
  PARTNER_FEATURE_PREVIEW_DASHBOARD,
  PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT,
  PARTNER_FEATURE_PREVIEW_PRIVATE_OFFICE,
};
