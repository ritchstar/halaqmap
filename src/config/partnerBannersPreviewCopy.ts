import { IMAGES } from '@/assets/images';

export const PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX = 20;
export const PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX = 40;
export const PARTNER_BANNERS_PREVIEW_CTA = 'شراء رخصة — ابدأ الآن';

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
    marketingTitle: 'استجابة برونزية موثوقة — بداية واضحة في حيّك',
    marketingParagraphs: [
      'عندما يصدر العميل طلباً في محيطه، تمنحك البرونزية حضوراً واضحاً عند الحاجة: اسم الصالون، الموقع، المسافة، والاتصال في بطاقة سهلة القرار.',
      'تعرض بطاقتك صوراً أساسية للواجهة والداخل، مع زر اتصال وواتساب وحالة «مفتوح الآن» حتى لا يضيع العميل بين التخمين والسؤال.',
      'هذه الفئة مثالية للبداية: نفاذ رسمي منظم، تكلفة خفيفة، وتجربة تقيس طلب الحي قبل أن توسّع استثمارك.',
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
    marketingTitle: 'استجابة ذهبية + معرض 20 صورة — ثقة قبل أول اتصال',
    marketingParagraphs: [
      'الذهبية لا تكتفي بتفعيلك؛ بل تجعل صالونك أكثر بروزاً وثقة عند استجابة النظام للطلبات القريبة، مع مساحة أكبر لعرض جودة المكان قبل أن يضغط العميل زر التواصل.',
      `معرض الأعمال حتى ${PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX} صورة يبرز القصات، الديكور، التعقيم، الكراسي، والخدمات الخاصة — لأن الصورة القوية تختصر نصف قرار الزيارة.`,
      'رمز QR للتقييمات، واتساب، شات مباشر، وتحديثات من لوحة التحكم تجعل العميل ينتقل من المشاهدة إلى الثقة ثم التواصل في مسار قصير ومريح.',
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
    marketingTitle: 'واجهة ماسية فاخرة — بنر متوهج، فيديو، ومعرض 40 صورة',
    marketingParagraphs: [
      'الماسية مصممة للصالون الذي يريد انطباع نخبة من أول نظرة: بنر متوهج، شارة مميزة، وحضور بصري يقول للعميل إن هذا المكان يستحق التجربة.',
      'الفيديو القصير الصامت يعرض مهارة الصالون بسرعة، بينما يفتح الشات الخاص والترجمة الذكية مساحة تواصل أسهل مع عملاء من لغات وخلفيات مختلفة.',
      `معرض الأعمال حتى ${PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX} صورة وإدارة المواعيد تكمل رخصة النفاذ الماسية — و«إضافة المكتب الخاص 🏛️» (Add-on اختياري +25 ر.س) تمنحك مساعداً داخلياً يستقبل تعليماتك ومناوباً على الشات ينفّذها أمام الزبائن — والتقارير تصلك تلقائياً.`,
    ],
  },
] as const;
