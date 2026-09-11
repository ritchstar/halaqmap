/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * فهرس خريطة الحل — كتالوج مصنع عربي (شاتلي). لا يُستورد من App.tsx.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

export const STORE_SOLUTION_CATALOG_LAB_ENABLED = true;
export const STORE_SOLUTION_CATALOG_LAB_PATH = '/store/catalog-lab' as const;
export const STORE_SOLUTION_CATALOG_MARK_BASE = '/images/store/catalog' as const;

export function solutionCatalogMarkSrc(code: string): string {
  return `${STORE_SOLUTION_CATALOG_MARK_BASE}/halaqmap-${code.toLowerCase()}.webp`;
}

export function solutionCatalogCardImageSrc(code: string): string {
  return `${STORE_SOLUTION_CATALOG_MARK_BASE}/cards/${code.toLowerCase()}.webp`;
}

export const STORE_SOLUTION_CATALOG_COLORS = {
  bg: '#e9e5dc',
  surface: '#fffaf4',
  card: '#fffdf8',
  header: '#1f2933',
  blue: '#1d4f69',
  brick: '#b84c3a',
  yellow: '#d1a728',
  index: '#d8d2c7',
  ink: '#1f2933',
  muted: '#566269',
  border: '#bdb5a7',
  light: '#f7f4ed',
} as const;

export type SolutionCatalogStripe = 'brick' | 'blue' | 'yellow';

export type SolutionCatalogCategory = {
  id: string;
  titleAr: string;
};

export type SolutionCatalogProduct = {
  code: string;
  nameAr: string;
  nameEn: string;
  categoryId: string;
  categoryAr: string;
  summaryAr: string;
  descriptionAr: string;
  tags: readonly string[];
  stripe: SolutionCatalogStripe;
  logoSrc: string | null;
  cardImageSrc: string;
  href: string;
  pathItems: readonly string[];
  external?: boolean;
};

export const STORE_SOLUTION_CATALOG_COPY = {
  documentTitle: 'خريطة الحل — متجر المنتجات الرقمية | معاينة الفهرس',
  brandAr: 'خريطة الحل',
  kickerAr: 'معاينة كتالوج الفهرس — داخلية، ليست الواجهة العامة بعد',
  heroTitleAr: 'شغلك بطريقتك، لا بقالب عام',
  heroLeadAr: 'من صفحة النشاط إلى الطلب والتشغيل — اختر مسارك من فهرس رقمي صُمّم للمنشآت والمهن والأعمال الفردية.',
  heroCountAr: '10 منتجات جاهزة لمسارات عمل مختلفة',
  indexTitleAr: 'الفهرس الحالي',
  searchPlaceholderAr: 'ابحث في الفهرس…',
  openCardAr: 'افتح بطاقة المنتج',
  emptyTitleAr: 'لا توجد نتائج مطابقة',
  emptyLeadAr: 'جرّب كلمة أخرى أو أعد ضبط الفهرس.',
  resetIndexAr: 'إعادة ضبط الفهرس',
  customTitleAr: 'لست مضطرًا لاختيار الحل من أول زيارة.',
  customLeadAr: 'ابدأ من طبيعة نشاطك، تعرّف على المنتج، ثم اطلب الخطوة المناسبة. كل صفحة تشرح ما تحصل عليه قبل أن تبدأ.',
  customCtaAr: 'اطلب حلاً خاصاً',
  journeyTitleAr: 'من الفهرس إلى التشغيل',
  modalPathAr: 'يشمل المسار',
  modalStartAr: 'ابدأ طلب',
  modalBrowseAr: 'أكمل التصفح',
  modalCloseAr: 'إغلاق',
} as const;

export const STORE_SOLUTION_CATALOG_CATEGORIES: readonly SolutionCatalogCategory[] = [
  { id: 'all', titleAr: 'الفهرس الكامل' },
  { id: 'trades', titleAr: 'مهن وخدمات' },
  { id: 'neighbor', titleAr: 'جار الحي' },
  { id: 'food', titleAr: 'طعام وضيافة' },
  { id: 'events', titleAr: 'مناسبات وضيافة' },
  { id: 'cards', titleAr: 'بطاقات ومناسبات' },
] as const;

export const STORE_SOLUTION_CATALOG_JOURNEY = [
  { step: '01', titleAr: 'عرّف احتياجك', leadAr: 'ابدأ من نوع النشاط والمشكلة اليومية التي تريد ترتيبها.' },
  { step: '02', titleAr: 'اختر مسارك', leadAr: 'قارن بين المنتجات الجاهزة وافتح صفحة الحل الأقرب لك.' },
  { step: '03', titleAr: 'ابدأ بوضوح', leadAr: 'اعرف ما تحصل عليه، ثم انتقل إلى الطلب أو التجربة.' },
] as const;

export const STORE_SOLUTION_CATALOG_PRODUCTS: readonly SolutionCatalogProduct[] = [
  {
    code: 'A-01',
    nameAr: 'حلاق ماب',
    nameEn: 'HalaqMap',
    categoryId: 'trades',
    categoryAr: 'مهن وخدمات',
    summaryAr: 'حضور الصالون في خريطة الحل',
    descriptionAr:
      'صفحة رقمية تساعد العميل على اكتشاف الصالون والوصول إليه، وتمنحك حضورًا واضحًا وأدوات تشغيل بحسب الخدمة المشتركة.',
    tags: ['اكتشاف', 'تواصل', 'صالونات الرجال'],
    stripe: 'brick',
    logoSrc: solutionCatalogMarkSrc('A-01'),
    cardImageSrc: solutionCatalogCardImageSrc('A-01'),
    href: 'https://www.halaqmap.com',
    external: true,
    pathItems: ['استعلام قرب على الخريطة', 'صفحة صالون واضحة', 'حجز أو تواصل مباشر'],
  },
  {
    code: 'A-02',
    nameAr: 'كوافير ماب',
    nameEn: 'CoiffeurMap',
    categoryId: 'trades',
    categoryAr: 'مهن وخدمات',
    summaryAr: 'ظهور الصالون النسائي في المكان الصحيح',
    descriptionAr:
      'واجهة قطاعية للصالونات النسائية تساعد العميلة على التعرف على النشاط والوصول إلى القناة المناسبة للتواصل.',
    tags: ['اكتشاف', 'صالونات النساء', 'قطاعي'],
    stripe: 'brick',
    logoSrc: solutionCatalogMarkSrc('A-02'),
    cardImageSrc: solutionCatalogCardImageSrc('A-02'),
    href: 'https://coiffeur.halaqmap.com',
    external: true,
    pathItems: ['استعلام قطاعي', 'بوابة شريكات', 'تغطية متدرجة'],
  },
  {
    code: 'B-01',
    nameAr: 'خضارنا1',
    nameEn: 'Khodarna1',
    categoryId: 'neighbor',
    categoryAr: 'جار الحي',
    summaryAr: 'اعرض المتوفر وحدّث صفحتك',
    descriptionAr:
      'واجهة للعميل ولوحة للمشغّل وطلبات منظمة بلا عمولة على قيمة السلة، للنشاط الثابت أو المتحرك.',
    tags: ['صندوق اليوم', 'طلب من الجوال', 'لوحة تشغيل'],
    stripe: 'yellow',
    logoSrc: solutionCatalogMarkSrc('B-01'),
    cardImageSrc: solutionCatalogCardImageSrc('B-01'),
    href: ROUTE_PATHS.STORE_PRODUCE,
    pathItems: ['شريط ما وصل اليوم', 'طلب حبة أو كيلو', 'لوحة الصندوق'],
  },
  {
    code: 'B-02',
    nameAr: 'تمويناتا1',
    nameEn: 'Tamwinata1',
    categoryId: 'neighbor',
    categoryAr: 'جار الحي',
    summaryAr: 'احتياجات الحي أقرب من جواله',
    descriptionAr:
      'صفحة رقمية تساعد التموينات على عرض المنتجات واستقبال طلبات سكان الحي بطريقة سهلة ومباشرة.',
    tags: ['سلة جار الحي', 'كاشير', 'QR'],
    stripe: 'yellow',
    logoSrc: solutionCatalogMarkSrc('B-02'),
    cardImageSrc: solutionCatalogCardImageSrc('B-02'),
    href: ROUTE_PATHS.STORE_GROCERS,
    pathItems: ['بنك أصناف', 'مذكرة توصيل', 'ملصق QR'],
  },
  {
    code: 'C-01',
    nameAr: 'مطعمنا1',
    nameEn: 'Matamna1',
    categoryId: 'food',
    categoryAr: 'طعام وضيافة',
    summaryAr: 'من مطبخك إلى طلب الزبون',
    descriptionAr: 'قائمة وطلب وتشغيل بطريقة مصممة لطبيعة المطعم، لا لقالب متجر عام.',
    tags: ['طبق اليوم', 'توصيل', 'لوحة مطبخ'],
    stripe: 'blue',
    logoSrc: solutionCatalogMarkSrc('C-01'),
    cardImageSrc: solutionCatalogCardImageSrc('C-01'),
    href: ROUTE_PATHS.STORE_RESTAURANT,
    pathItems: ['قائمة أطباق', 'طلب ضيف الحي', 'تذكرة مطبخ'],
  },
  {
    code: 'C-02',
    nameAr: 'كافينا1',
    nameEn: 'Cafena1',
    categoryId: 'food',
    categoryAr: 'طعام وضيافة',
    summaryAr: 'قهوتك حاضرة قبل وصول الزبون',
    descriptionAr: 'صفحة طلب وأدوات تشغيل وعرض تساعد المقهى على تنظيم تجربة زبائنه قبل الوصول.',
    tags: ['مشروبات', 'شاشات', 'رابط ضيف'],
    stripe: 'blue',
    logoSrc: solutionCatalogMarkSrc('C-02'),
    cardImageSrc: solutionCatalogCardImageSrc('C-02'),
    href: ROUTE_PATHS.STORE_CAFE,
    pathItems: ['قائمة مشروبات', 'ثلاث شاشات', 'لوحة كاشير'],
  },
  {
    code: 'D-01',
    nameAr: 'لاونجا1',
    nameEn: 'Launja1',
    categoryId: 'events',
    categoryAr: 'مناسبات وضيافة',
    summaryAr: 'تجربة المكان تبدأ من الشاشة',
    descriptionAr: 'شاشات عرض ولوحة مضيف ورابط ضيف لإدارة فعاليات اللاونج بطريقة واضحة.',
    tags: ['شاشات', 'مضيف', 'فعاليات'],
    stripe: 'blue',
    logoSrc: solutionCatalogMarkSrc('D-01'),
    cardImageSrc: solutionCatalogCardImageSrc('D-01'),
    href: ROUTE_PATHS.STORE_LOUNGE,
    pathItems: ['حزمة فعاليات', 'لوحة مضيف', 'رابط ترحيب'],
  },
  {
    code: 'D-02',
    nameAr: 'أفراحي1',
    nameEn: 'Afrahi1',
    categoryId: 'events',
    categoryAr: 'مناسبات وضيافة',
    summaryAr: 'دعوة الزواج تفتح إلى قاعة حيّة',
    descriptionAr: 'كرت وقاعة ولوحة مضيف لمناسبة واحدة بروابط منظمة للضيف والعرض.',
    tags: ['زواج', 'قاعة حية', 'دعوة'],
    stripe: 'yellow',
    logoSrc: solutionCatalogMarkSrc('D-02'),
    cardImageSrc: solutionCatalogCardImageSrc('D-02'),
    href: ROUTE_PATHS.STORE_WEDDING,
    pathItems: ['كرت فخم', 'قاعة حية', 'روابط سرية'],
  },
  {
    code: 'D-03',
    nameAr: 'أجواء1',
    nameEn: 'Ajwa1',
    categoryId: 'events',
    categoryAr: 'مناسبات وضيافة',
    summaryAr: 'مناسبتك باسمك وبطابعك',
    descriptionAr: 'دعوة تفاعلية تفتح قاعة حفل حيّة، وتمنح المناسبة مسارًا واضحًا للمشاركة.',
    tags: ['مناسبة حرة', 'تهاني', 'قاعة'],
    stripe: 'yellow',
    logoSrc: solutionCatalogMarkSrc('D-03'),
    cardImageSrc: solutionCatalogCardImageSrc('D-03'),
    href: ROUTE_PATHS.STORE_EVENT,
    pathItems: ['شق رجالي أو نسائي', 'قاعة حية', 'تهاني على الشاشة'],
  },
  {
    code: 'E-01',
    nameAr: 'كاردي8',
    nameEn: 'Cardi8',
    categoryId: 'cards',
    categoryAr: 'بطاقات ومناسبات',
    summaryAr: 'بطاقة مناسبة حيّة للمشاركة',
    descriptionAr: 'بطاقة مدفوعة خفيفة للتهنئة والمناسبات، مع معاينة ثم مشاركة وتحميل.',
    tags: ['تهنئة', 'مشاركة', 'بطاقة'],
    stripe: 'yellow',
    logoSrc: solutionCatalogMarkSrc('E-01'),
    cardImageSrc: solutionCatalogCardImageSrc('E-01'),
    href: ROUTE_PATHS.STORE_INVITES,
    pathItems: ['معاينة قبل الإرسال', 'مشاركة فورية', 'تحميل للطباعة'],
  },
] as const;

export function solutionCatalogProductHash(code: string): string {
  return `product-${code}`;
}

export function parseSolutionCatalogProductHash(raw: string): string {
  const match = raw.match(/^#?product-([A-Z]-\d{2})$/);
  return match?.[1] || '';
}

export function solutionCatalogSearchHaystack(product: SolutionCatalogProduct): string {
  return [
    product.code,
    product.nameAr,
    product.nameEn,
    product.categoryAr,
    product.summaryAr,
    product.descriptionAr,
    ...product.tags,
  ]
    .join(' ')
    .toLowerCase();
}
