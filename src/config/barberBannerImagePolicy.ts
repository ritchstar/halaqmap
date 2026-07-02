/** حد رفع صور بنر الحلاق بعد المعالجة — WebP عند الدعم، وإلا JPEG */
export const BARBER_BANNER_MAX_FILE_BYTES = 500 * 1024;

/** أبعاد عرض البطاقة/البنر على المنصة — تصغير ذكي مع الحفاظ على النسبة */
export const BARBER_BANNER_MAX_WIDTH = 1600;
export const BARBER_BANNER_MAX_HEIGHT = 640;

/** نسبة عرض البطاقة العامة (5:2) — تُطبَّق عند الضغط وفي إطار البطاقة */
export const BARBER_BANNER_DISPLAY_ASPECT_RATIO = BARBER_BANNER_MAX_WIDTH / BARBER_BANNER_MAX_HEIGHT;

/** إطار صورة البطاقة — ذهبي/ماسي على الجوال */
export const BARBER_CARD_HERO_FRAME_GOLD_CLASS =
  'relative w-full min-w-0 overflow-hidden aspect-[5/2] max-h-36 sm:max-h-44';
export const BARBER_CARD_HERO_FRAME_DIAMOND_CLASS =
  'relative w-full min-w-0 overflow-hidden aspect-[5/2] max-h-40 sm:max-h-48';
export const BARBER_CARD_HERO_FRAME_BRONZE_CLASS =
  'relative w-full min-w-0 overflow-hidden aspect-[5/2] max-h-32 sm:max-h-40';
export const BARBER_CARD_HERO_IMAGE_CLASS =
  'block h-full w-full max-w-full object-cover object-center';

/** صيغة الإخراج الاحتياطية عند عدم دعم WebP */
export const BARBER_BANNER_OUTPUT_MIME = 'image/jpeg' as const;
export const BARBER_BANNER_OUTPUT_EXT = '.jpg';

/** نصائح ثابتة تُعرض أثناء الرفع (تحسين جودة المشهد) */
export const BARBER_BANNER_IMAGE_ENHANCEMENT_TIPS_AR: readonly string[] = [
  'استخدم إضاءة طبيعية قريبة من النافذة، وتجنّب الظل القاسي على الواجهة.',
  'صوّر بزاوية مستقيمة قدر الإمكان؛ ميل بسيط يعطي عمقاً دون تشويه المحل.',
  'تأكد أن الشعار واسم الصالون واضحان في منتصف الإطار أو الثلث العلوي.',
  'تجنّب التصوير ليلاً بإضاءة صفراء شديدة — يصعب ضغط الصورة دون فقدان التفاصيل.',
  'اترك هامشاً حول العناصر المهمة؛ قد يُقتطع جزء بسيط عند العرض على شاشات مختلفة.',
];
