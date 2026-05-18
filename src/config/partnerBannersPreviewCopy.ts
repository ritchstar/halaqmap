/**
 * نصوص صفحة معاينة البنرات — للعملاء التجاريين (مسار مخفي).
 * حدود المعرض مُعرّفة في الخادم (ذهبي 20 / ماسي 40) — لا تُغيَّر هنا.
 */
export const PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX = 20;
export const PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX = 40;

export const PARTNER_BANNERS_PREVIEW_CTA = 'انضم الآن وابدأ تعبئة طلبك 🚀';

export const PARTNER_BANNERS_PREVIEW_TIERS = [
  {
    id: 'bronze',
    name: 'الفئة البرونزية',
    accent: 'bronze' as const,
    badge: '🥉',
    highlights: [
      'التثبيت الجغرافي الأساسي: تثبيت موقع صالونك بدبوس برونزي كلاسيكي على واجهة الرادار الجغرافي للعملاء',
      'عرض البيانات الأساسية والتواصل المباشر الحر بدون عمولات',
    ],
  },
  {
    id: 'gold',
    name: 'الفئة الذهبية',
    accent: 'gold' as const,
    badge: '🥇',
    highlights: [
      'الدبوس الذهبي المشع: ظهور موقعك ببريق مشع على واجهة نظام الرصد الذكي لخطف الأنظار',
      `معرض الأعمال المتكامل يتسع لـ ${PARTNER_BANNERS_PREVIEW_GOLD_GALLERY_MAX} صورة لاستعراض ديكورات الصالون وقصات الشعر لرفع المبيعات`,
    ],
  },
  {
    id: 'diamond',
    name: 'الباقة الماسية',
    accent: 'diamond' as const,
    badge: '💎',
    premiumRibbon: 'نخبة الأعمال',
    highlights: [
      'البنر المتوهج والإشعاع النبضي الذكي (Neon Glow Effect) لتمييز واجهتك بصرياً',
      'واجهة بنر الفيديو الذكي: شريط ترويجي صامت وفائق الخفة (WebM) يعرض مهارات صالونك في واجهتك الخاصة بكفاءة وسرعة مطلقة',
      `معرض الأعمال الملكي يتسع لـ ${PARTNER_BANNERS_PREVIEW_DIAMOND_GALLERY_MAX} صورة كاملة`,
      'شارة صالون النخبة المعتمد (VIP)',
    ],
    videoNote:
      'بنر الفيديو الماسي: ميكرو-فيديو في رأس الملف الداخلي فقط (حتى 10 ثوانٍ، صامت، تكرار تلقائي، WebM مضغوط) — يُحمَّل كسولاً داخل صفحة الملف الخاصة فقط لضمان أقصى سرعة لتصفح العملاء على المنصة.',
  },
] as const;
