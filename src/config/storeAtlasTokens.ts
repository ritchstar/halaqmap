/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أطلس الحلول — رموز معاينة بصرية. لا يُستورد من App.tsx.
 * لا يغيّر المتجر العام ولا الأسعار ولا منطق الطلب.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';
import { STORE_VISUALS } from '@/config/storeFront';

export const STORE_ATLAS_STYLE_LAB_ENABLED = true;

export const STORE_ATLAS_STYLE_LAB_PATH = '/store/style-lab' as const;

export const STORE_ATLAS_COLORS = {
  canvas: '#020912',
  raised: '#061018',
  card: '#0B1A24',
  ivory: '#F4EFE4',
  gold: '#E8C547',
  teal: '#0D9488',
  muted: '#9EABB3',
  line: '#1D3340',
} as const;

export const STORE_ATLAS_SPACE = {
  sectionDesktop: 96,
  sectionMobile: 64,
  cardRadius: 24,
  chipRadius: 16,
  touch: 44,
} as const;

export type StoreAtlasLabView = 'home-desktop' | 'home-mobile' | 'produce';

export const STORE_ATLAS_LAB_VIEWS: readonly {
  id: StoreAtlasLabView;
  titleAr: string;
}[] = [
  { id: 'home-desktop', titleAr: 'الرئيسية — سطح المكتب' },
  { id: 'home-mobile', titleAr: 'الرئيسية — الجوال' },
  { id: 'produce', titleAr: 'صفحة خضارنا1' },
] as const;

export const STORE_ATLAS_COPY = {
  documentTitle: 'معاينة أطلس الحلول — خريطة الحل',
  labKickerAr: 'معاينة داخلية — ليست الواجهة العامة',
  labTitleAr: 'أطلس الحلول',
  noindexNoteAr: 'هذه الصفحة للمعاينة البصرية فقط.',
  headerProductsAr: 'المنتجات',
  headerSystemAr: 'كيف تعمل المنظومة؟',
  headerWorksAr: 'المصنفات المسجلة',
  headerRequestAr: 'طلب حل خاص',
  headerTrialAr: 'جرّب قبل أن تشتري',
  heroTitleAr: 'منتجات رقمية تُشغّل مهنتك',
  heroLeadAr:
    'حلول سحابية متخصصة تساعدك على العرض واستقبال الطلبات وتنظيم العمل، من رابط واحد يناسب طبيعة نشاطك.',
  heroPrimaryAr: 'جرّب قبل أن تشتري',
  heroSecondaryAr: 'استكشف الحلول',
  trustProfessionAr: 'منتجات متخصصة حسب المهنة',
  trustDirectAr: 'علاقة مباشرة بين المشغّل وعميله',
  trustWorksAr: 'مصنفات برمجية مسجلة للمنتجات المشمولة',
  sectorAskAr: 'ما طبيعة عملك؟',
  journeyTitleAr: 'كيف تعمل المنظومة؟',
  requestTitleAr: 'مهنتك لها تفاصيل مختلفة؟',
  requestLeadAr: 'اشرحها، ونرسم معك المسار الرقمي المناسب.',
  requestCtaAr: 'طلب حل خاص',
  discoverPrefixAr: 'اكتشف',
  statusTrialAr: 'متاح للتجربة',
  statusBriefAr: 'اطلب عرضاً',
  stickyTrialAr: 'جرّب قبل أن تشتري',
  produceForWhomAr: 'لصاحب صندوق الخضار والفواكه في الحي',
  produceResultAr: 'جار الحي يطلب من الجوال، والطلب يصل للوحة الصندوق مكتوباً.',
  produceCtaAr: 'افتح خضارنا1',
  produceProblemBeforeAr: 'تشتت وعمل المذكرة باليد',
  produceProblemMidAr: 'مسار عرض وطلب منظم',
  produceProblemAfterAr: 'تشغيل أوضح لصندوق اليوم',
  produceGuestTitleAr: 'مسار جار الحي',
  produceDeskTitleAr: 'غرفة عمليات الصندوق',
  produceOfferTitleAr: 'ما تحصل عليه',
  producePriceTitleAr: 'السعر',
  produceTrustTitleAr: 'الثقة والأسئلة',
  produceFinalCtaAr: 'ابدأ من صفحة خضارنا1',
  produceSaipLineAr: 'مصنف برمجي مسجّل. رقم الشهادة 26-12-103276978.',
} as const;

export const STORE_ATLAS_PRODUCE_TRANSFORM = [
  { id: 'before', titleAr: STORE_ATLAS_COPY.produceProblemBeforeAr },
  { id: 'mid', titleAr: STORE_ATLAS_COPY.produceProblemMidAr },
  { id: 'after', titleAr: STORE_ATLAS_COPY.produceProblemAfterAr },
] as const;

export const STORE_ATLAS_PRODUCE_GUEST = [
  'يفتح جار الحي صفحة الصندوق من الرمز أو الرابط.',
  'يرى ما وصل اليوم ويختار حبة أو كيلو.',
  'يكتب اسمه وجواله ويختار توصيلاً أو استلاماً.',
] as const;

export const STORE_ATLAS_PRODUCE_DESK = [
  'التذكرة تصل للوحة مكتوبة: الأصناف والإجمالي والجوال.',
  'صاحب الصندوق يضبط ما وصل وما نفذ وساعات العمل.',
  'مذكرة واتساب تُفتح من جهاز المحل فقط.',
] as const;

export const STORE_ATLAS_PRODUCE_FAQ = [
  {
    qAr: 'هل يُحصَّل من جار الحي عبر المنصة؟',
    aAr: 'لا. المحاسبة نقداً أو شبكة عند التسليم أو الاستلام من الصندوق.',
  },
  {
    qAr: 'هل المصنف مسجّل؟',
    aAr: 'خضارنا1 مصنف برمجي مسجّل. رقم الشهادة 26-12-103276978.',
  },
] as const;

export const STORE_ATLAS_JOURNEY = [
  { id: 'show', titleAr: 'اعرض' },
  { id: 'receive', titleAr: 'استقبل الطلب' },
  { id: 'run', titleAr: 'نظّم التشغيل' },
  { id: 'loyalty', titleAr: 'ابنِ الولاء' },
] as const;

export type StoreAtlasSectorId = 'local' | 'food' | 'screens' | 'occasions' | 'trades';

export const STORE_ATLAS_SECTORS: readonly {
  id: StoreAtlasSectorId;
  titleAr: string;
}[] = [
  { id: 'local', titleAr: 'البيع المحلي' },
  { id: 'food', titleAr: 'الطعام والضيافة' },
  { id: 'screens', titleAr: 'الشاشات والتجارب' },
  { id: 'occasions', titleAr: 'المناسبات' },
  { id: 'trades', titleAr: 'المهن والخدمات' },
] as const;

export type StoreAtlasCard = {
  id: string;
  sector: StoreAtlasSectorId;
  nameAr: string;
  resultAr: string;
  caps: readonly [string, string, string];
  status: 'trial' | 'brief';
  href: string;
  image: string;
  imageAlt: string;
};

export const STORE_ATLAS_CARDS: readonly StoreAtlasCard[] = [
  {
    id: 'produce',
    sector: 'local',
    nameAr: 'خضارنا1',
    resultAr: 'صندوق اليوم يصل لجار الحي من الجوال.',
    caps: ['شريط ما وصل', 'طلب حبة أو كيلو', 'لوحة الصندوق'],
    status: 'trial',
    href: ROUTE_PATHS.STORE_PRODUCE,
    image: '/images/store/produce/produce-01.jpg',
    imageAlt: 'واجهة خضارنا1 لجار الحي',
  },
  {
    id: 'grocers',
    sector: 'local',
    nameAr: 'تمويناتا1',
    resultAr: 'تموينات الحي تُطلب من الصفحة وتصل للكاشير.',
    caps: ['بنك أصناف', 'مذكرة توصيل', 'ملصق QR'],
    status: 'trial',
    href: ROUTE_PATHS.STORE_GROCERS,
    image: '/images/store/grocers/grocers-01.jpg',
    imageAlt: 'واجهة تمويناتا1 لجار الحي',
  },
  {
    id: 'kitchen',
    sector: 'food',
    nameAr: 'طبختنا1',
    resultAr: 'الأسرة المنتجة تستقبل الطلب منظماً من الجوال.',
    caps: ['أصناف منزلية', 'تذكرة نشاط', 'رمز المتجر'],
    status: 'trial',
    href: ROUTE_PATHS.STORE_KITCHEN,
    image: '/images/store/kitchen/kitchen-01.jpg',
    imageAlt: 'واجهة طبختنا1 للزبون',
  },
  {
    id: 'restaurant',
    sector: 'food',
    nameAr: 'مطعمنا1',
    resultAr: 'ضيف الحي يطلب والأطباق تصل للمطبخ تذكرة.',
    caps: ['طبق اليوم', 'توصيل أو استلام', 'صندوق محادثة'],
    status: 'trial',
    href: ROUTE_PATHS.STORE_RESTAURANT,
    image: '/images/store/restaurant/restaurant-02.jpg',
    imageAlt: 'واجهة مطعمنا1 لضيف الحي',
  },
  {
    id: 'cafe',
    sector: 'food',
    nameAr: 'كافينا1',
    resultAr: 'جار الحي يطلب، والشاشات ترحّب داخل المقهى.',
    caps: ['مشروبات وعروض', 'ثلاث شاشات', 'رابط ضيف'],
    status: 'trial',
    href: ROUTE_PATHS.STORE_CAFE,
    image: '/images/store/lounge-hero-marketing.jpg',
    imageAlt: 'واجهة كافينا1 لجار الحي',
  },
  {
    id: 'lounge',
    sector: 'screens',
    nameAr: 'لاونجا1',
    resultAr: 'شاشة اللاونج تعرض الترحيب من رابط الضيف.',
    caps: ['حزمة فعاليات', 'لوحة مضيف', 'رابط ترحيب'],
    status: 'trial',
    href: ROUTE_PATHS.STORE_LOUNGE,
    image: '/images/store/lounge/lounge-01.jpg',
    imageAlt: 'شاشة لاونجا1',
  },
  {
    id: 'wedding',
    sector: 'occasions',
    nameAr: 'افراحي1',
    resultAr: 'كرت الدعوة يفتح قاعة حفل حيّة للمدعوين.',
    caps: ['كرت فخم', 'قاعة حية', 'روابط سرية'],
    status: 'brief',
    href: ROUTE_PATHS.STORE_WEDDING,
    image: STORE_VISUALS.cardStudio,
    imageAlt: 'كرت افراحي1',
  },
  {
    id: 'event',
    sector: 'occasions',
    nameAr: 'اجواء1',
    resultAr: 'دعوة حرة لمناسبة يسميها العميل بنفسه.',
    caps: ['شق رجالي أو نسائي', 'قاعة حية', 'تهاني على الشاشة'],
    status: 'brief',
    href: ROUTE_PATHS.STORE_EVENT,
    image: '/images/store/lab/lab-lounge-interior.jpg',
    imageAlt: 'قاعة اجواء1',
  },
  {
    id: 'card',
    sector: 'occasions',
    nameAr: 'كاردي8',
    resultAr: 'بطاقة مناسبة حيّة تُشارك برابط واضح.',
    caps: ['معاينة مجانية', 'ثلاث طبقات', 'تحميل الصورة'],
    status: 'brief',
    href: ROUTE_PATHS.STORE_INVITES,
    image: STORE_VISUALS.cardMark,
    imageAlt: 'كاردي8',
  },
  {
    id: 'halaq',
    sector: 'trades',
    nameAr: 'حلاق ماب',
    resultAr: 'استعلام للحي ورخصة نفاذ للصالون.',
    caps: ['رادار القرب', 'صفحة الصالون', 'حجز من الخريطة'],
    status: 'brief',
    href: 'https://www.halaqmap.com',
    image: STORE_VISUALS.radar,
    imageAlt: 'رادار حلاق ماب',
  },
  {
    id: 'coiffeur',
    sector: 'trades',
    nameAr: 'كوافير ماب',
    resultAr: 'منتج قطاعي للنساء ضمن أعمال المتجر.',
    caps: ['استعلام', 'بوابة الشريكات', 'تغطية متدرجة'],
    status: 'brief',
    href: 'https://coiffeur.halaqmap.com',
    image: STORE_VISUALS.coiffeurHero,
    imageAlt: 'كوافير ماب',
  },
] as const;

export function storeAtlasCardsBySector(sector: StoreAtlasSectorId): StoreAtlasCard[] {
  return STORE_ATLAS_CARDS.filter((card) => card.sector === sector);
}

export function parseStoreAtlasLabView(raw: string | null): StoreAtlasLabView {
  if (raw === 'home-mobile' || raw === 'produce') return raw;
  return 'home-desktop';
}
