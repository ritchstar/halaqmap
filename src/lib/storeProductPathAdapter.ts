/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يحوّل كتالوج الحلول الحقيقي (storeSolutionCatalog.ts) + ثيمات المنتجات
 * الحقيقية (storeProductThemes.ts) + المحتوى التحريري (storeProductPathContent.ts)
 * إلى ProductPathDefinition[] لصفحة المسارات (store/paths-lab).
 *
 * لا نسخ بيانات: كل تعديل على الكتالوج الأصلي أو الثيمات ينعكس هنا تلقائياً.
 * operatingFacts لا تُملأ إلا لمنتج تحقّقنا من حقوله الفعلية في كوده —
 * التحقق: api/_lib/store*Live.ts — kitchen وحدها فيها scheduleEnabled/qrStamp/
 * deliveryFee كحقول payload صريحة؛ الستة الباقية (بما فيها بخورنا1) بلا هذه
 * الحقول، لكن جميع السبعة تشترك في StoreLiveShopShareDesk (رابط + QR)
 * وStoreDeskArchiveDock (لوحة تذاكر الطلبات) وparseStoreShopHours (ساعات
 * العمل) — تحقّقتُ من الجميع بالبحث المباشر في الكود، لا افتراضاً.
 */
import { STORE_SOLUTION_CATALOG_PRODUCTS, type SolutionCatalogProduct } from '@/config/storeSolutionCatalog';
import { STORE_PRODUCT_PATH_CONTENT } from '@/config/storeProductPathContent';
import type {
  ProductPathDefinition,
  ProductPathOperatingFacts,
  ProductPathOperatingModel,
  ProductPathOperatingModelOption,
} from '@/config/storeProductPathTypes';
import { productThemeTokens, type StoreProductId } from '@/lib/storeProductThemes';

/** ربط code الكتالوج بمعرّف الثيم الحقيقي — فقط للمنتجات التي لها صفحة "حيّة" فعلية. */
const CODE_TO_PRODUCT_ID: Record<string, StoreProductId> = {
  'B-01': 'produce',
  'B-02': 'grocers',
  'B-03': 'kitchen',
  'B-04': 'halana',
  'C-01': 'restaurant',
  'C-02': 'cafe',
  'D-01': 'lounge',
  'D-02': 'wedding',
  'D-03': 'event',
  'E-01': 'occasion_card',
  'B-05': 'dates',
  'B-06': 'bakhurna',
};

/** نموذج التشغيل من فئة الكتالوج الحقيقية categoryId — لا تصنيف من الاسم. */
const CATEGORY_TO_OPERATING_MODEL: Record<string, ProductPathOperatingModel> = {
  trades: 'trade-discovery',
  neighbor: 'neighbor-fixed', // يُدقَّق لكل منتج أدناه — الطبخ والحلا مجدولان لا ثابتان
  food: 'food-service',
  events: 'event-hosting',
  cards: 'digital-card',
};

/** داخل فئة "جار الحي" نفسها: طبختنا1/حلانا1 مجدولان، خضارنا1/تمويناتا1 ثابتان — من وصفهما الحقيقي في الكتالوج. */
const SCHEDULED_NEIGHBOR_CODES = new Set(['B-03', 'B-04']);

/** حقائق تشغيلية مُتحقَّق منها بالكود مباشرة — انظر تعليق أعلى الملف. */
const LIVE_ORDER_DESK_FACTS: Record<string, ProductPathOperatingFacts> = {
  kitchen: { hasScheduledOrders: true, hasDeliveryFeeOption: true, hasShopHours: true, hasDeskTicketBoard: true, hasQrShare: true },
  grocers: { hasScheduledOrders: false, hasDeliveryFeeOption: false, hasShopHours: true, hasDeskTicketBoard: true, hasQrShare: true },
  produce: { hasScheduledOrders: false, hasDeliveryFeeOption: false, hasShopHours: true, hasDeskTicketBoard: true, hasQrShare: true },
  restaurant: { hasScheduledOrders: false, hasDeliveryFeeOption: false, hasShopHours: true, hasDeskTicketBoard: true, hasQrShare: true },
  dates: { hasScheduledOrders: false, hasDeliveryFeeOption: false, hasShopHours: true, hasDeskTicketBoard: true, hasQrShare: true },
  cafe: { hasScheduledOrders: false, hasDeliveryFeeOption: false, hasShopHours: true, hasDeskTicketBoard: true, hasQrShare: true },
  bakhurna: { hasScheduledOrders: false, hasDeliveryFeeOption: false, hasShopHours: true, hasDeskTicketBoard: true, hasQrShare: true },
};

export const PRODUCT_PATH_OPERATING_MODEL_OPTIONS: readonly ProductPathOperatingModelOption[] = [
  { id: 'neighbor-fixed', labelAr: 'أبيع منتجات داخل الحي' },
  { id: 'home-scheduled', labelAr: 'أستقبل طلبات تجهيز مسبق' },
  { id: 'food-service', labelAr: 'لدي موقع تجاري ثابت (مطعم/مقهى)' },
  { id: 'event-hosting', labelAr: 'أعمل في المناسبات والضيافة' },
  { id: 'digital-card', labelAr: 'أحتاج بطاقة مناسبة رقمية' },
  { id: 'trade-discovery', labelAr: 'أقدّم خدمات بالحجز والاكتشاف' },
];

const EMPTY_EDITORIAL = {
  fitForAr: [],
  notFitForAr: [],
  problemsAr: [],
  outcomesAr: [],
  marketingStepsAr: [],
  faq: [],
} as const;

function operatingModelFor(product: SolutionCatalogProduct): ProductPathOperatingModel {
  if (product.categoryId === 'neighbor' && SCHEDULED_NEIGHBOR_CODES.has(product.code)) {
    return 'home-scheduled';
  }
  return CATEGORY_TO_OPERATING_MODEL[product.categoryId] ?? 'trade-discovery';
}

function accentFor(product: SolutionCatalogProduct, productId: StoreProductId | undefined): string {
  if (productId) return productThemeTokens(productId, 'storefront').accent;
  // لا ثيم حيّ لهذا المنتج (خارجي) — نستخدم لون شريط الكتالوج نفسه بدل اختراع لون جديد.
  return product.stripe === 'brick' ? '#b84c3a' : product.stripe === 'blue' ? '#1d4f69' : '#d1a728';
}

function ctaLabelFor(product: SolutionCatalogProduct): string {
  if (product.external) return 'استكشف المسار';
  return `اطلب ${product.nameAr}`;
}

function toDefinition(product: SolutionCatalogProduct): ProductPathDefinition {
  const productId = CODE_TO_PRODUCT_ID[product.code];
  return {
    slug: product.code.toLowerCase(),
    code: product.code,
    productId,
    titleAr: `مسار ${product.nameAr}`,
    shortTitleAr: product.nameAr,
    nameEn: product.nameEn,
    categoryAr: product.categoryAr,
    operatingModel: operatingModelFor(product),
    summaryAr: product.summaryAr,
    descriptionAr: product.descriptionAr,
    tags: product.tags,
    deliverables: product.pathItems.map((titleAr) => ({ titleAr })),
    href: product.href,
    external: product.external === true,
    logoSrc: product.logoSrc,
    cardImageSrc: product.cardImageSrc,
    accent: accentFor(product, productId),
    ctaLabelAr: ctaLabelFor(product),
    editorial: STORE_PRODUCT_PATH_CONTENT[product.code] ?? EMPTY_EDITORIAL,
    operatingFacts: productId ? LIVE_ORDER_DESK_FACTS[productId] : undefined,
  };
}

export const STORE_PRODUCT_PATHS: readonly ProductPathDefinition[] = STORE_SOLUTION_CATALOG_PRODUCTS.map(toDefinition);

export function findProductPathBySlug(slug: string): ProductPathDefinition | undefined {
  const normalized = slug.trim().toLowerCase();
  return STORE_PRODUCT_PATHS.find((path) => path.slug === normalized);
}

export function productPathsByOperatingModel(model: ProductPathOperatingModel | 'all'): readonly ProductPathDefinition[] {
  if (model === 'all') return STORE_PRODUCT_PATHS;
  return STORE_PRODUCT_PATHS.filter((path) => path.operatingModel === model);
}

export function productPathSearchHaystack(path: ProductPathDefinition): string {
  return [path.code, path.shortTitleAr, path.nameEn, path.categoryAr, path.summaryAr, path.descriptionAr, ...path.tags]
    .join(' ')
    .toLowerCase();
}

