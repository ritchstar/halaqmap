/**
 * نسخ الرئيسية للزائر — فلاتر خدمة + ثقة (لا سردية «حرية الحلاق» هنا).
 */

export const VISITOR_HERO_BADGE_AR = 'مجاني · بلا تسجيل';

export const VISITOR_HERO_TITLE_AR = 'حلاق قريب';

export const VISITOR_HERO_TITLE_ACCENT_AR = 'يناسب حاجتك';

/** سطح المكتب — الواجهة تشرح نفسها؛ لا فقرة إضافية */
export const VISITOR_HERO_LEAD_DESKTOP_AR = '';

export const VISITOR_HERO_LEAD_MOBILE_AR = 'فلتر · موقع · نتائج — مجاناً.';

export const VISITOR_INTENT_RAIL_TITLE_AR = 'ماذا تبحث عنه؟';

export const VISITOR_INTENT_RAIL_HINT_NO_LOCATION_AR = 'ثم حدّد موقعك.';

export const VISITOR_INTENT_RAIL_HINT_WITH_LOCATION_AR = 'تُطبَّق فوراً على النتائج.';

export const VISITOR_TRUST_TRIAD = [
  {
    id: 'direct',
    title: 'تواصل مباشر',
    description: 'اتصال أو واتساب مع الصالون — المنصة للاكتشاف لا للحجز بالعمولة.',
  },
  {
    id: 'ratings',
    title: 'تقييمات موثّقة',
    description: 'تقييمات مرتبطة بزيارات حقيقية — لا نجوم وهمية.',
  },
  {
    id: 'match',
    title: 'مطابقة عند الطلب',
    description: 'يظهر من يناسب فلترك وموقعك الآن — لا قائمة عشوائية ثابتة.',
  },
] as const;

export const VISITOR_SERVICE_SPOTLIGHT_TITLE_AR = 'خدمات تُختار — لا تُدفَن في قوائم';

export const VISITOR_SERVICE_SPOTLIGHT_SUBTITLE_AR =
  'كل بطاقة تمثّل حاجة حقيقية لزائر حلاق ماب — اضغط لتفعيل الفلتر ثم ابدأ الاستعلام.';

export const VISITOR_SERVICE_SPOTLIGHT_CARDS = [
  {
    intentId: 'home_visit' as const,
    title: 'زيارة منزلية',
    benefit: 'حلاق يأتي إليك — تنسيق مباشر دون حجز آلي عبر المنصة.',
    accent: 'from-sky-500/20 to-blue-600/10',
    border: 'border-sky-400/25',
  },
  {
    intentId: 'elderly_care' as const,
    title: 'كبار السن وذوي الاحتياجات',
    benefit: 'تسهيلات بالمحل أو منزلية بحسب ما يعلنه الصالون.',
    accent: 'from-violet-500/20 to-purple-600/10',
    border: 'border-violet-400/25',
  },
  {
    intentId: 'groom_prep' as const,
    title: 'تجهيز عريس',
    benefit: 'باقة ماسية متخصصة — راجع التفاصيل وتواصل قبل الموعد.',
    accent: 'from-amber-500/20 to-orange-600/10',
    border: 'border-amber-400/25',
  },
  {
    intentId: 'children_specialist' as const,
    title: 'متخصص أطفال',
    benefit: 'حلاق ماسي مؤهل لرعاية أطفال — فلتر مخصص للعائلات.',
    accent: 'from-pink-500/20 to-rose-600/10',
    border: 'border-pink-400/25',
  },
  {
    intentId: 'mens_grooming' as const,
    title: 'مركز عناية بالرجل',
    benefit: 'تجربة متكاملة للعناية — ليس قصّ شعر فقط.',
    accent: 'from-teal-500/20 to-cyan-600/10',
    border: 'border-teal-400/25',
  },
  {
    intentId: 'top_rated' as const,
    title: 'الأعلى تقييماً',
    benefit: '4.5+ نجوم ضمن نطاقك — للمن يبحث عن جودة مؤكدة.',
    accent: 'from-yellow-500/20 to-amber-600/10',
    border: 'border-yellow-400/25',
  },
] as const;
