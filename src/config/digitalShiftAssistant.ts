import { DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR } from '@/config/subscriptionPricing';

export const DIGITAL_SHIFT_PRODUCT_TITLE = 'المناوب الرقمي الذكي 🌙';

/** وصف المنتج — إضافة برمجية متقدمة للماسية */
export const DIGITAL_SHIFT_PRODUCT_SUBTITLE_AR = DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR;

export const DIGITAL_SHIFT_RECOMMENDATIONS_TITLE = 'طاولة توصيات المساعد الرقمي 🌙';

export const DIGITAL_SHIFT_DEFAULT_ASSISTANT_NAME = 'المناوب الرقمي';

export const DIGITAL_SHIFT_REPLY_DELAY_MINUTES = 3;

/** تكلفة كل رد AI للعميل (هللات) */
export const DIGITAL_SHIFT_REPLY_COST_HALALAS = 150;

export const DIGITAL_SHIFT_CATEGORY_LABELS = {
  balance: 'توصيات الشحن والتأمين',
  banner: 'تقييم الأصول الرقمية الجغرافية',
  gallery: 'معرض الصور والوسائط',
  shift_chat: 'المناوبة والمحادثات',
} as const;

export const DIGITAL_SHIFT_SUPPORTED_LANGUAGES_LABEL_AR =
  'العربية · English · اردو · Türkçe · Français · Español · Tagalog';

/** كيف يكتشف المناوب لغة العميل */
export const DIGITAL_SHIFT_LANGUAGE_DETECTION_FEATURE_AR =
  'اكتشاف لغة المرسل تلقائياً: يحلّل آخر رسالة العميل (الحروف والكلمات الشائعة) لتحديد لغته قبل الرد.';

/** اللغات المدعومة — سطر ميزة */
export const DIGITAL_SHIFT_SUPPORTED_LANGUAGES_FEATURE_AR = `اللغات المدعومة (${DIGITAL_SHIFT_SUPPORTED_LANGUAGES_LABEL_AR}).`;

/** آلية الشات «المترجم» */
export const DIGITAL_SHIFT_TRANSLATED_CHAT_FEATURE_AR =
  'شات مترجم ذكي: يرد المناوب بنفس لغة العميل في الشات الخاص — ترجمة/صياغة آلية فورية بأسلوب مهني، دون تبديل يدوي من الحلاق.';

/** قائمة المزايا التسويقية/التشغيلية */
export const DIGITAL_SHIFT_PRODUCT_FEATURES_AR: readonly string[] = [
  'اعتراض تلقائي عند إغلاق المحل أو بعد مهلة تأخر الرد',
  DIGITAL_SHIFT_LANGUAGE_DETECTION_FEATURE_AR,
  DIGITAL_SHIFT_SUPPORTED_LANGUAGES_FEATURE_AR,
  DIGITAL_SHIFT_TRANSLATED_CHAT_FEATURE_AR,
  'تدقيق البنرات والمعرض وتوصيات الشحن والرصيد',
  'محفظة هللات شفافة — آداب وضيافة فقط، بدون تلاعب بأسعار الخدمة',
] as const;

export const DIGITAL_SHIFT_GREETING_PROMPT =
  'وش مهام اليوم اللي راح تضيفها عشان أشتغل معك يا عمنا؟';
