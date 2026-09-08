/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حملة اليوم الوطني — صفحة هبوط موسمية. لا تُستورد من App.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

export const STORE_NATIONAL_DAY_PUBLIC_ENABLED = true as const;

/** نهاية الحملة الرئيسية — بعدها تظهر خاتمة الشكر */
export const STORE_NATIONAL_DAY_CAMPAIGN_END_ISO = '2026-09-26';

export type NationalDaySegmentId =
  | 'daily_retail'
  | 'home_made'
  | 'hospitality'
  | 'venues'
  | 'occasions'
  | 'trades';

export type NationalDayProductId =
  | 'produce'
  | 'grocers'
  | 'kitchen'
  | 'halana'
  | 'restaurant'
  | 'cafe'
  | 'lounge'
  | 'wedding'
  | 'event'
  | 'occasion_card'
  | 'barber_map';

export type NationalDayProductStory = {
  id: NationalDayProductId;
  labelAr: string;
  headlineAr: string;
  storyAr: string;
  href: string;
  trialEligible: boolean;
  segmentIds: readonly NationalDaySegmentId[];
};

export const STORE_NATIONAL_DAY_COPY = {
  documentTitle: 'عزّ شغلك من طبعك | اليوم الوطني | خريطة الحل',
  kickerAr: 'اليوم الوطني السعودي الـ96',
  heroTitleAr: 'عزّنا بطبعنا',
  heroLeadAr:
    'تهنئكم خريطة الحل بمناسبة اليوم الوطني السعودي الـ96، ونحتفل بكل صاحب نشاط يبني عمله ويخدم حيه ويصنع أثره بطريقته.',
  brandLineAr: 'شغلك بطريقتك… وحضورك في جوالات زبائنك',
  heroCtaAr: 'اكتشف المنتج المناسب لنشاطك',
  thanksTitleAr: 'كل عام ووطننا بخير',
  thanksLeadAr:
    'شكراً لزيارتكم صفحة احتفالنا باليوم الوطني. تبقى روابط منتجاتنا متاحة لتجد النشاط المناسب لعملك.',
  ownersTitleAr: 'أصحاب النشاط جزء من الوطن',
  ownersLeadAr:
    'من البسطة والمطبخ المنزلي، إلى المحل والمطعم والمقهى؛ كل نشاط يخدم الناس بطريقته، ويستحق أداة رقمية تناسب طبيعة عمله.',
  ownersTilesAr: [
    'بائع الخضار في الحي',
    'صاحبة الطبخ المنزلي',
    'صاحب التموينات',
    'صاحب المطعم',
    'صاحب المقهى',
    'مختصة الحلويات',
    'صاحب اللاونج',
    'أصحاب المناسبات والخدمات',
  ] as const,
  explorerTitleAr: 'وش طبيعة شغلك؟',
  explorerLeadAr: 'اختر الأقرب لنشاطك لنقترح المنتجات المناسبة — بلا قائمة طويلة ولا أسعار في البداية.',
  journeyTitleAr: 'من الانتظار إلى جوالاتهم',
  journeyLeadAr:
    'لا تنتظر أن يعثر عليك الزبون بالمصادفة. مرّر نشاطك في الحي، واعرض ما لديك في المكان الذي يتصفحه زبائنك كل يوم.',
  journeyTaglineAr: 'منتجاتنا تنقلك من انتظارهم… إلى جوالاتهم',
  journeyStepsAr: ['نشاطك', 'صفحتك الرقمية', 'جوالات الحي', 'الطلب أو التواصل'] as const,
  productCtaAr: 'اكتشف كيف يخدم نشاطك',
  trialTitleAr: 'فرصة الحضور الوطني',
  trialLeadAr:
    'قدّم طلب تجربة للمنتج المشمول بنظام التجربة العامة، وسنراجع طلبك ونرسل لك خطوات البدء وفق سياسة المنتج — بلا تفعيل تلقائي.',
  trialCtaAr: 'اطلب تجربة لنشاطك',
  trialNoteAr: 'التجربة ستون يوماً من أول دخول بعد الإتمام، وتخضع لمراجعة الإدارة.',
  packTitleAr: 'حزمة الحضور الوطني',
  packLeadAr:
    'للطلبات أو التجارب المقبولة خلال الحملة — عند جاهزية الأدوات — تمنح خريطة الحل صاحب النشاط أدوات عرض موسمية لا خصماً على السعر:',
  packItemsAr: [
    'شريط تهنئة وطني داخل صفحة النشاط',
    'قالب عرض وطني يفعّله صاحب النشاط',
    'رمز QR موسمي للصفحة',
    'بطاقة مشاركة للنشاط',
    'نص جاهز لمشاركة العرض عبر واتساب',
    'تحديد مدة العرض وإيقافه تلقائياً',
  ] as const,
  packFootnoteAr: 'خريطة الحل لا تحدد عرض نشاطك — بل تمنحك الأداة لتقديمه بطريقتك.',
  greetingTitleAr: 'تهاني أصحاب الأنشاط',
  greetingLeadAr:
    'نماذج لعبارات تهنئة من أصحاب أنشطة — المحتوى المنشور لاحقاً يخضع للمراجعة ولا يُنشر تلقائياً.',
  greetingShareCtaAr: 'شارك تهنيتك عبر طلب الخدمة',
  greetingSamplesAr: [
    { shopAr: 'مطبخ أم نورة · الرياض', lineAr: 'كل عام ووطننا بعز وخير.' },
    { shopAr: 'تموينات الوفاء · جدة', lineAr: 'تهنئ أهالي الحي باليوم الوطني الـ96.' },
    { shopAr: 'مقهى الحي · الدمام', lineAr: 'نخدم الحي بطريقتنا… وكل عام وبلادنا تعلو.' },
  ] as const,
  cardsTitleAr: 'بطاقة تهنئة لليوم الوطني',
  cardsLeadAr: 'أصدر بطاقة تهنئة مجانية باسم نشاطك — من أدوات المتجر، بلا خلط بمنتجات الحي المدفوعة.',
  cardsCtaAr: 'أصدر بطاقة تهنئة',
  closingTitleAr: 'وطن يبنيه أهله… وأعمال تكبر بطريقتها',
  closingLeadAr:
    'في خريطة الحل نصمم منتجات رقمية تراعي اختلاف الأنشطة، وتساعد أصحابها على عرض أعمالهم وتنظيم وصولهم إلى زبائنهم.',
  closingPrimaryCtaAr: 'اكتشف منتجك',
  closingSecondaryCtaAr: 'اطلب تجربة',
  backStoreAr: 'واجهة المتجر',
  identityNoteAr:
    'الهوية الوطنية الرسمية «عزّنا بطبعنا» للهيئة العامة للترفيه — تُستخدم في المواد المعتمدة وفق دليلها، من دون تعديل الشعار أو دمجه في شعار خريطة الحل.',
} as const;

export const NATIONAL_DAY_SEGMENTS: readonly {
  id: NationalDaySegmentId;
  labelAr: string;
}[] = [
  { id: 'daily_retail', labelAr: 'أبيع منتجات يومية' },
  { id: 'home_made', labelAr: 'أطبخ أو أصنع حسب الطلب' },
  { id: 'hospitality', labelAr: 'أدير مطعماً أو مقهى' },
  { id: 'venues', labelAr: 'أدير مكاناً أو تجربة' },
  { id: 'occasions', labelAr: 'أعمل في المناسبات' },
  { id: 'trades', labelAr: 'أقدم مهنة أو خدمة' },
];

export const NATIONAL_DAY_PRODUCTS: readonly NationalDayProductStory[] = [
  {
    id: 'produce',
    labelAr: 'خضارنا1',
    headlineAr: 'خير الحي يصل إلى جوالات أهله',
    storyAr: 'اعرض المتوفر، وحدّث صفحتك، ودع زبائن الحي يتسوقون ويتواصلون معك للتوصيل أو الاستلام.',
    href: ROUTE_PATHS.STORE_PRODUCE,
    trialEligible: true,
    segmentIds: ['daily_retail'],
  },
  {
    id: 'grocers',
    labelAr: 'تمويناتا1',
    headlineAr: 'احتياجات الحي أقرب من جواله',
    storyAr: 'صفحة رقمية تساعد التموينات على عرض المنتجات واستقبال طلبات سكان الحي.',
    href: ROUTE_PATHS.STORE_GROCERS,
    trialEligible: true,
    segmentIds: ['daily_retail'],
  },
  {
    id: 'kitchen',
    labelAr: 'طبختنا1',
    headlineAr: 'طبخك يستحق أن يصل إلى من يبحث عنه',
    storyAr: 'اعرضي طبخاتك، نظّمي استقبال الطلبات، ودعي العميلة تبدأ طلبها من صفحتك.',
    href: ROUTE_PATHS.STORE_KITCHEN,
    trialEligible: true,
    segmentIds: ['home_made'],
  },
  {
    id: 'halana',
    labelAr: 'حلانا1',
    headlineAr: 'حرفتك الحلوة تظهر كما تستحق',
    storyAr: 'اعرضي أعمالك، واستقبلي طلبات التنفيذ الخاص، وراجعي التفاصيل قبل تثبيت الموعد.',
    href: ROUTE_PATHS.STORE_HALANA,
    trialEligible: true,
    segmentIds: ['home_made'],
  },
  {
    id: 'restaurant',
    labelAr: 'مطعمنا1',
    headlineAr: 'من مطبخك إلى طلب الزبون',
    storyAr: 'قائمة وطلب وتشغيل بطريقة مصممة لطبيعة المطعم، لا لقالب متجر عام.',
    href: ROUTE_PATHS.STORE_RESTAURANT,
    trialEligible: true,
    segmentIds: ['hospitality'],
  },
  {
    id: 'cafe',
    labelAr: 'كافينا1',
    headlineAr: 'قهوتك حاضرة قبل وصول الزبون',
    storyAr: 'صفحة طلب، وأدوات تشغيل وعرض تساعد المقهى على تنظيم تجربة زبائنه.',
    href: ROUTE_PATHS.STORE_CAFE,
    trialEligible: true,
    segmentIds: ['hospitality'],
  },
  {
    id: 'lounge',
    labelAr: 'لاونجا1',
    headlineAr: 'تجربة المكان تبدأ من الشاشة',
    storyAr: 'شاشات العرض ولوحة المضيف ورابط الضيف — لإدارة فعاليات اللاونج بطريقة واضحة.',
    href: ROUTE_PATHS.STORE_LOUNGE,
    trialEligible: true,
    segmentIds: ['venues'],
  },
  {
    id: 'wedding',
    labelAr: 'افراحي1',
    headlineAr: 'دعوة الزواج تفتح إلى قاعة حيّة',
    storyAr: 'كرت وقاعة ولوحة مضيف — لمناسبة واحدة بروابط سرية للضيف والعرض.',
    href: ROUTE_PATHS.STORE_WEDDING,
    trialEligible: false,
    segmentIds: ['occasions'],
  },
  {
    id: 'event',
    labelAr: 'اجواء1',
    headlineAr: 'مناسبتك باسمك وبطابعك',
    storyAr: 'دعوة حرة تفاعلية تفتح قاعة حفل حيّة — بلا قائمة ضيوف ولا حجز جماعي.',
    href: ROUTE_PATHS.STORE_EVENT,
    trialEligible: false,
    segmentIds: ['occasions'],
  },
  {
    id: 'occasion_card',
    labelAr: 'كاردي8',
    headlineAr: 'بطاقة مناسبة حيّة للمشاركة',
    storyAr: 'بطاقة مدفوعة خفيفة للتهنئة والمناسبات — معاينة ثم مشاركة وتحميل.',
    href: ROUTE_PATHS.STORE_INVITES,
    trialEligible: false,
    segmentIds: ['occasions'],
  },
  {
    id: 'barber_map',
    labelAr: 'حلاق ماب',
    headlineAr: 'حضور الصالون في خريطة الحل',
    storyAr: 'منتج ضمن أعمال المتجر — للحلاقين وصالونات الحل. تجربة حلاق ماب مسار مستقل بمدة وشروط مختلفة.',
    href: ROUTE_PATHS.BARBERS_LANDING,
    trialEligible: false,
    segmentIds: ['trades'],
  },
];

export function nationalDayProductsForSegment(segmentId: NationalDaySegmentId): NationalDayProductStory[] {
  return NATIONAL_DAY_PRODUCTS.filter((item) => item.segmentIds.includes(segmentId));
}

export function nationalDayTrialProductLabels(): string[] {
  return NATIONAL_DAY_PRODUCTS.filter((p) => p.trialEligible).map((p) => p.labelAr);
}

export function nationalDayCampaignPhase(now = new Date()): 'active' | 'thanks' {
  const end = new Date(`${STORE_NATIONAL_DAY_CAMPAIGN_END_ISO}T00:00:00+03:00`);
  return now >= end ? 'thanks' : 'active';
}

export const STORE_NATIONAL_DAY_CARDS_HREF = `${ROUTE_PATHS.STORE_CARDS}?kind=national_day`;
