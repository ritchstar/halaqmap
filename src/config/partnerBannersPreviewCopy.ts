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
    marketingTitle: 'حضور برونزي موثوق — بداية واضحة في حيّك',
    marketingParagraphs: [
      'عندما يبحث العميل في محيطه، تمنحك البرونزية حضوراً واضحاً على الخريطة: اسم الصالون، الموقع، المسافة، والاتصال في بطاقة سهلة القرار.',
      'تعرض بطاقتك صوراً أساسية للواجهة والداخل، مع زر اتصال وواتساب وحالة «مفتوح الآن» حتى لا يضيع العميل بين التخمين والسؤال.',
      'هذه الفئة مثالية للبداية: ظهور رسمي منظم، تكلفة خفيفة، وتجربة تسويقية تقيس طلب الحي قبل أن توسّع استثمارك.',
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
    marketingTitle: 'إبراز ذهبي + معرض 20 صورة — ثقة قبل أول اتصال',
    marketingParagraphs: [
      'الذهبية لا تكتفي بظهورك؛ بل تجعل صالونك أكثر بروزاً وثقة داخل نتائج القرب، مع مساحة أكبر لعرض جودة المكان قبل أن يضغط العميل زر التواصل.',
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
      `معرض الأعمال حتى ${PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX} صورة، إدارة المواعيد، وخيار المناوب الرقمي الذكي تجعل الباقة الماسية أقرب إلى واجهة نمو كاملة لا مجرد بطاقة ظهور.`,
    ],
  },
] as const;
