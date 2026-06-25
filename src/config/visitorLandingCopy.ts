/**
 * نسخ الرئيسية للزائر — فلاتر خدمة + ثقة (لا سردية «حرية الحلاق» هنا).
 */

export const VISITOR_HERO_BADGE_AR = 'مجاني · بلا تسجيل';

export const VISITOR_HERO_TITLE_AR = 'حلاق قريب';

export const VISITOR_HERO_TITLE_ACCENT_AR = 'يناسب حاجتك';

/** سطح المكتب — الواجهة تشرح نفسها؛ لا فقرة إضافية */
export const VISITOR_HERO_LEAD_DESKTOP_AR = '';

export const VISITOR_HERO_LEAD_MOBILE_AR = '';

export const VISITOR_INTENT_RAIL_TITLE_AR = 'ماذا تبحث عنه؟';

export const VISITOR_INTENT_RAIL_HINT_NO_LOCATION_AR = 'ثم حدّد موقعك.';

export const VISITOR_INTENT_RAIL_HINT_WITH_LOCATION_AR = 'تُطبَّق فوراً على النتائج.';

export const VISITOR_TRUST_TRIAD = [
  {
    id: 'direct',
    title: 'تواصل مباشر',
    chipLabel: 'اتصال مباشر',
    description: 'اتصال أو واتساب مع الصالون.',
  },
  {
    id: 'ratings',
    title: 'تقييمات موثّقة',
    chipLabel: 'تقييمات حقيقية',
    description: 'مرتبطة بزيارات حقيقية.',
  },
  {
    id: 'match',
    title: 'مطابقة فورية',
    chipLabel: 'مطابقة فورية',
    description: 'حسب فلترك وموقعك الآن.',
  },
] as const;

export const VISITOR_SERVICE_SPOTLIGHT_TITLE_AR = 'طلبك سريع';

export const VISITOR_SERVICE_SPOTLIGHT_SUBTITLE_AR = 'اختر حاجتك — النتائج فوراً.';

export const VISITOR_SERVICE_SPOTLIGHT_ACTIVE_CTA_AR = 'مُفعَّل ←';

export const VISITOR_SERVICE_SPOTLIGHT_CTA_AR = 'اختر ←';

export const VISITOR_SERVICE_SPOTLIGHT_CARDS = [
  {
    intentId: 'home_visit' as const,
    title: 'زيارة منزلية',
    benefit: 'حلاق يأتي إليك.',
    accent: 'from-sky-500/20 to-blue-600/10',
    border: 'border-sky-400/25',
  },
  {
    intentId: 'elderly_care' as const,
    title: 'كبار السن وذوي الاحتياجات',
    benefit: 'تسهيلات للكبار وذوي الاحتياجات.',
    accent: 'from-violet-500/20 to-purple-600/10',
    border: 'border-violet-400/25',
  },
  {
    intentId: 'groom_prep' as const,
    title: 'تجهيز عريس',
    benefit: 'باقة تجهيز عريس.',
    accent: 'from-amber-500/20 to-orange-600/10',
    border: 'border-amber-400/25',
  },
  {
    intentId: 'children_specialist' as const,
    title: 'متخصص أطفال',
    benefit: 'حلاق أطفال مؤهل.',
    accent: 'from-pink-500/20 to-rose-600/10',
    border: 'border-pink-400/25',
  },
  {
    intentId: 'mens_grooming' as const,
    title: 'مركز عناية بالرجل',
    benefit: 'عناية رجل متكاملة.',
    accent: 'from-teal-500/20 to-cyan-600/10',
    border: 'border-teal-400/25',
  },
  {
    intentId: 'top_rated' as const,
    title: 'الأعلى تقييماً',
    benefit: '4.5+ ضمن نطاقك.',
    accent: 'from-yellow-500/20 to-amber-600/10',
    border: 'border-yellow-400/25',
  },
] as const;
