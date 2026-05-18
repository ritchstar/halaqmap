import { IMAGES } from '@/assets/images';

export const PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX = 20;
export const PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX = 40;
export const PARTNER_BANNERS_PREVIEW_CTA = 'انضم الآن وابدأ تعبئة طلبك 🚀';

const GALLERY_POOL = [
  IMAGES.BARBER_SHOP_1,
  IMAGES.BARBER_WORK_1,
  IMAGES.BARBER_INTERIOR_1,
  IMAGES.BARBER_CHAIR_1,
  IMAGES.BARBER_SHOP_3,
  IMAGES.BARBER_WORK_2,
  IMAGES.BARBER_INTERIOR_3,
  IMAGES.BARBER_CHAIR_3,
  IMAGES.BARBER_SHOP_5,
  IMAGES.BARBER_WORK_4,
  IMAGES.HALAQMAP_BARBER_BANNER_1_41,
] as const;

export type BannerPreviewTierId = 'bronze' | 'gold' | 'diamond';

export type BannerPreviewTierConfig = {
  id: BannerPreviewTierId;
  name: string;
  badge: string;
  premiumRibbon?: string;
  heroImage: string;
  galleryImages: readonly string[];
  galleryMax: number;
  galleryVisibleSlots: number;
  hasVideoBanner?: boolean;
  marketingTitle: string;
  marketingParagraphs: readonly string[];
};

export const PARTNER_BANNERS_PREVIEW_TIERS: readonly BannerPreviewTierConfig[] = [
  {
    id: 'bronze',
    name: 'الفئة البرونزية',
    badge: '🥉',
    heroImage: IMAGES.BARBER_SHOP_2,
    galleryImages: GALLERY_POOL.slice(0, 4),
    galleryMax: 4,
    galleryVisibleSlots: 4,
    marketingTitle: 'تثبيت أساسي على واجهة الرادار — بداية حضور موثوق',
    marketingParagraphs: [
      'عندما يبحث العميل عبر نظام الرصد الذكي في حيّك، يرى صالونك بدبوس برونزي كلاسيكي يثبت موقعك على واجهة الرادار الجغرافي — قرار وصول أسرع بلا تعقيد.',
      'تعرض بطاقتك البيانات الأساسية وقنوات التواصل المباشر (اتصال وواتساب) دون عمولات أو وساطة من المنصة: العميل يختارك، يتصل بك، ويصل مباشرة.',
      'هذه الفئة مثالية للصالون الذي يريد أول ظهور رسمي منظم يحوّل البحث الجغرافي إلى زيارات فعلية بأقل احتكاك تقني.',
    ],
  },
  {
    id: 'gold',
    name: 'الفئة الذهبية',
    badge: '🥇',
    heroImage: IMAGES.BARBER_INTERIOR_5,
    galleryImages: GALLERY_POOL.slice(0, 8),
    galleryMax: PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX,
    galleryVisibleSlots: 6,
    marketingTitle: 'بريق ذهبي + معرض 20 صورة — إقناع بصري قبل الزيارة',
    marketingParagraphs: [
      'الدبوس الذهبي المشع يجعل موقعك يلمع على واجهة نظام الرصد الذكي بين المنافسين — خطوة تسويقية واضحة لخطف أنظار من يتصفح واجهة الرادار الآن.',
      `معرض الأعمال المتكامل (حتى ${PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX} صورة) يتيح استعراض ديكور الصالون وقصات الشعر والتفاصيل التي ترفع متوسط قيمة الزيارة قبل أن يدق العميل بابك.`,
      'أزرار التواصل الفوري تُبقى العميل داخل مسار قرار سريع: يشاهد، يقتنع، يتصل — دون حواجز تسجيل أو دفع للمنصة.',
    ],
  },
  {
    id: 'diamond',
    name: 'الباقة الماسية',
    badge: '💎',
    premiumRibbon: 'نخبة الأعمال',
    heroImage: IMAGES.HALAQMAP_BARBER_BANNER_1_41,
    galleryImages: GALLERY_POOL,
    galleryMax: PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX,
    galleryVisibleSlots: 8,
    hasVideoBanner: true,
    marketingTitle: 'القمة البصرية — نيون، فيديو خفيف، ومعرض 40 صورة',
    marketingParagraphs: [
      'البنر المتوهج وإشعاع Neon Glow يمنح واجهتك طبقة تمييز بصري فورية على واجهة الرادار — إشارة VIP قبل قراءة أي سطر نص.',
      'بنر الفيديو الذكي (حتى 10 ثوانٍ، صامت، WebM مضغوط) يُحمَّل كسولاً داخل ملفك الداخلي فقط — يعرض مهارات الصالون دون إبطاء تصفح العملاء على المنصة.',
      `معرض الأعمال الملكي (${PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX} صورة) + شارة صالون النخبة المعتمد — حزمة إقناع كاملة لتحويل البحث الجغرافي إلى زيارات متكررة.`,
    ],
  },
] as const;
