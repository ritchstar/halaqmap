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
  ink: '#020912',
} as const;

export const STORE_ATLAS_LAB_VERSION = 3 as const;

export const STORE_ATLAS_SPACE = {
  shell: 1260,
  sectionDesktop: 72,
  sectionMobile: 48,
  cardRadius: 24,
  chipRadius: 16,
  touch: 44,
  cardMin: 340,
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
  labKickerAr: 'معاينة V3 — داخلية، ليست الواجهة العامة',
  daylightOnAr: 'ضوء الأطلس',
  daylightOffAr: 'خلفية داكنة ثابتة',
  daylightHintAr: 'طبقة ضوء نهاري هادئة خلف الليل، ليست وضعاً نهارياً.',
  signalHintAr: 'القشرة طبقة تشغيل رقمية. الإشارات نموذج توضيحي لتجربة المنتج، ليست بيانات حية.',
  signalCaptionAr: 'نموذج توضيحي لتجربة المنتج',
  mockCaptionAr: 'نموذج توضيحي للواجهة، ليس لقطة إنتاج',
  orderColItemAr: 'الصنف',
  orderColQtyAr: 'الكمية',
  orderColPriceAr: 'السعر',
  discoverArrowAr: 'اكتشف المنتج ←',
  footerIntroAr: 'تعريف المتجر',
  footerIntroLeadAr: 'منتجات رقمية متخصصة تشغّل مهنة العرض والطلب من رابط واحد.',
  footerProductsAr: 'المنتجات والقطاعات',
  footerTrialServicesAr: 'التجربة والخدمات',
  footerLegalAr: 'السياسات والمصنفات',
  footerContactAr: 'التواصل',
  labTitleAr: 'أطلس الحلول',
  noindexNoteAr: 'هذه الصفحة للمعاينة البصرية فقط.',
  discoverProductAr: 'اكتشف المنتج',
  tryNowAr: 'جرّب الآن',
  forWhomLabelAr: 'لمن صُمم؟',
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
  trustWorksAr: 'تضم المنظومة مصنفات برمجية مسجلة لدى الهيئة السعودية للملكية الفكرية',
  sectorAskAr: 'ما طبيعة عملك؟',
  journeyTitleAr: 'كيف تعمل المنظومة؟',
  journeyLeadAr: 'كل منتج نقطة على مسار واحد: من العرض إلى الولاء.',
  servicesTitleAr: 'المهن والخدمات',
  servicesLeadAr: 'استعلام قطاعي وخريطة عمل، لا صفحة طلب حي.',
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
  { id: 'show', titleAr: 'العرض' },
  { id: 'receive', titleAr: 'الطلب' },
  { id: 'run', titleAr: 'التشغيل' },
  { id: 'loyalty', titleAr: 'الولاء' },
] as const;

export const STORE_ATLAS_SERVICES = [
  {
    id: 'halaq',
    nameAr: 'حلاق ماب',
    forWhomAr: 'لصالون الحي وصاحب الرخصة',
    resultAr: 'استعلام قرب، ثم صفحة صالون وحجز من الخريطة.',
    href: 'https://www.halaqmap.com',
  },
  {
    id: 'coiffeur',
    nameAr: 'كوافير ماب',
    forWhomAr: 'لصالون النساء ضمن أعمال المتجر',
    resultAr: 'استعلام قطاعي وبوابة شريكات بتغطية متدرجة.',
    href: 'https://coiffeur.halaqmap.com',
  },
] as const;

export type StoreAtlasSectorId = 'local' | 'food' | 'screens' | 'occasions';
export type StoreAtlasUiKind =
  | 'produce'
  | 'grocers'
  | 'kitchen'
  | 'restaurant'
  | 'cafe'
  | 'lounge'
  | 'wedding'
  | 'event'
  | 'card';

export const STORE_ATLAS_SECTORS: readonly {
  id: StoreAtlasSectorId;
  titleAr: string;
}[] = [
  { id: 'local', titleAr: 'البيع المحلي' },
  { id: 'food', titleAr: 'الطعام والضيافة' },
  { id: 'screens', titleAr: 'الشاشات والتجارب' },
  { id: 'occasions', titleAr: 'المناسبات' },
] as const;

export type StoreAtlasCard = {
  id: string;
  sector: StoreAtlasSectorId;
  uiKind: StoreAtlasUiKind;
  nameAr: string;
  forWhomAr: string;
  resultAr: string;
  caps: readonly [string, string, string];
  status: 'trial' | 'brief';
  href: string;
  sectorImage: string;
  imageAlt: string;
};

export const STORE_ATLAS_CARDS: readonly StoreAtlasCard[] = [
  {
    id: 'produce',
    sector: 'local',
    uiKind: 'produce',
    nameAr: 'خضارنا1',
    forWhomAr: 'لصاحب صندوق الخضار والفواكه في الحي',
    resultAr: 'جار الحي يطلب من الجوال، والطلب يصل للوحة الصندوق مكتوباً.',
    caps: ['شريط ما وصل', 'طلب حبة أو كيلو', 'لوحة الصندوق'],
    status: 'trial',
    href: ROUTE_PATHS.STORE_PRODUCE,
    sectorImage: '/images/store/produce/produce-01.jpg',
    imageAlt: 'رحلة طلب خضارنا1 من الجوال إلى اللوحة',
  },
  {
    id: 'grocers',
    sector: 'local',
    uiKind: 'grocers',
    nameAr: 'تمويناتا1',
    forWhomAr: 'لتموينات الحي والكاشير',
    resultAr: 'جار الحي يبني السلة، والكاشير يستقبل التذكرة.',
    caps: ['بنك أصناف', 'مذكرة توصيل', 'ملصق QR'],
    status: 'trial',
    href: ROUTE_PATHS.STORE_GROCERS,
    sectorImage: '/images/store/grocers/grocers-01.jpg',
    imageAlt: 'واجهة طلب تمويناتا1',
  },
  {
    id: 'kitchen',
    sector: 'food',
    uiKind: 'kitchen',
    nameAr: 'طبختنا1',
    forWhomAr: 'للأسرة المنتجة',
    resultAr: 'الزبون يحجز الطبق، والنشاط يستقبل تذكرة جاهزة.',
    caps: ['أصناف منزلية', 'طلبك جاهز', 'رمز المتجر'],
    status: 'trial',
    href: ROUTE_PATHS.STORE_KITCHEN,
    sectorImage: '/images/store/kitchen/kitchen-01.jpg',
    imageAlt: 'واجهة طلب طبختنا1',
  },
  {
    id: 'restaurant',
    sector: 'food',
    uiKind: 'restaurant',
    nameAr: 'مطعمنا1',
    forWhomAr: 'لمطبخ الحي وضيفه',
    resultAr: 'الضيف يطلب، والمطبخ يستلم تذكرة الطبق.',
    caps: ['طبق اليوم', 'توصيل أو استلام', 'صندوق ملاحظة'],
    status: 'trial',
    href: ROUTE_PATHS.STORE_RESTAURANT,
    sectorImage: '/images/store/restaurant/restaurant-02.jpg',
    imageAlt: 'واجهة طلب مطعمنا1',
  },
  {
    id: 'cafe',
    sector: 'food',
    uiKind: 'cafe',
    nameAr: 'كافينا1',
    forWhomAr: 'لمقهى الحي',
    resultAr: 'الجار يطلب، والشاشة ترحّب من رابط الضيف.',
    caps: ['مشروبات اليوم', 'ثلاث شاشات', 'رابط ضيف'],
    status: 'trial',
    href: ROUTE_PATHS.STORE_CAFE,
    sectorImage: '/images/store/lounge-hero-marketing.jpg',
    imageAlt: 'واجهة طلب كافينا1',
  },
  {
    id: 'lounge',
    sector: 'screens',
    uiKind: 'lounge',
    nameAr: 'لاونجا1',
    forWhomAr: 'لصالة الضيافة والشاشة',
    resultAr: 'رابط الضيف يظهر الترحيب على شاشة اللاونج.',
    caps: ['حزمة فعاليات', 'لوحة مضيف', 'رابط ترحيب'],
    status: 'trial',
    href: ROUTE_PATHS.STORE_LOUNGE,
    sectorImage: '/images/store/lounge/lounge-01.jpg',
    imageAlt: 'شاشة لاونجا1',
  },
  {
    id: 'wedding',
    sector: 'occasions',
    uiKind: 'wedding',
    nameAr: 'افراحي1',
    forWhomAr: 'لصاحب الحفل ومدعويه',
    resultAr: 'كرت الدعوة يفتح قاعة حيّة بروابط سرية.',
    caps: ['كرت فخم', 'قاعة حية', 'روابط سرية'],
    status: 'brief',
    href: ROUTE_PATHS.STORE_WEDDING,
    sectorImage: STORE_VISUALS.cardStudio,
    imageAlt: 'كرت افراحي1',
  },
  {
    id: 'event',
    sector: 'occasions',
    uiKind: 'event',
    nameAr: 'اجواء1',
    forWhomAr: 'لصاحب المناسبة الحرة',
    resultAr: 'دعوة يسميها العميل، بشقين وتهاني على الشاشة.',
    caps: ['شق رجالي أو نسائي', 'قاعة حية', 'تهاني'],
    status: 'brief',
    href: ROUTE_PATHS.STORE_EVENT,
    sectorImage: '/images/store/lab/lab-lounge-interior.jpg',
    imageAlt: 'قاعة اجواء1',
  },
  {
    id: 'card',
    sector: 'occasions',
    uiKind: 'card',
    nameAr: 'كاردي8',
    forWhomAr: 'لمن يرسل بطاقة مناسبة',
    resultAr: 'بطاقة حيّة تُشارك برابط واضح.',
    caps: ['معاينة مجانية', 'ثلاث طبقات', 'تحميل الصورة'],
    status: 'brief',
    href: ROUTE_PATHS.STORE_INVITES,
    sectorImage: STORE_VISUALS.cardMark,
    imageAlt: 'كاردي8',
  },
] as const;

export function storeAtlasCardsBySector(sector: StoreAtlasSectorId): StoreAtlasCard[] {
  return STORE_ATLAS_CARDS.filter((card) => card.sector === sector);
}

export function storeAtlasCardCtaAr(status: StoreAtlasCard['status']): string {
  return status === 'trial' ? STORE_ATLAS_COPY.tryNowAr : STORE_ATLAS_COPY.discoverProductAr;
}

export function storeAtlasGridFeatured(count: number): boolean {
  return count === 1 || count % 2 === 1;
}

export type StoreAtlasDaylightMode = 'on' | 'off';

export function parseStoreAtlasDaylight(raw: string | null): StoreAtlasDaylightMode {
  return raw === 'off' ? 'off' : 'on';
}

export function storeAtlasCardGlow(id: string): string {
  if (id === 'produce') return '#3d8b4a';
  if (id === 'grocers' || id === 'cafe') return '#0D9488';
  if (id === 'lounge') return '#d4af67';
  if (id === 'kitchen' || id === 'restaurant') return '#c4a574';
  return '#E8C547';
}

export function parseStoreAtlasLabView(raw: string | null): StoreAtlasLabView {
  if (raw === 'home-mobile' || raw === 'produce') return raw;
  return 'home-desktop';
}
