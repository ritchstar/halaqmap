import { CHILDREN_SPECIALIST_BANNER_TAGLINE_AR } from '@/lib/childrenSpecialistDisplay';

export const CHILDREN_SPECIALIST_DASHBOARD_TAB_AR = 'متخصص أطفال';

export const CHILDREN_SPECIALIST_DASHBOARD_LEDE_AR =
  'لوحة مخصّصة لصالونات الأطفال — إعدادات الظهور، معاينة البطاقة، ونسخ جاهز للعائلات على السوشيال.';

export const CHILDREN_SPECIALIST_DASHBOARD_ONBOARDING_AR =
  'فعّل «متخصص أطفال» أدناه ليظهر بنرك الطفولي على الخريطة وفي فلتر «متخصص أطفال».';

export const CHILDREN_SPECIALIST_DASHBOARD_STATUS_ITEMS = [
  {
    id: 'banner',
    titleAr: 'البنر الطفولي',
    bodyAr: 'شريط sky/cyan أعلى بطاقة صالونك على الخريطة.',
  },
  {
    id: 'filter',
    titleAr: 'فلتر «متخصص أطفال»',
    bodyAr: 'يظهر صالونك عندما يفعّل العائلات هذا الفلتر في البحث.',
  },
  {
    id: 'category',
    titleAr: 'تصنيف «حلاقة أطفال»',
    bodyAr: 'يُضاف تلقائياً لملفك عند تفعيل استقبال الأطفال.',
  },
] as const;

export const CHILDREN_SPECIALIST_DASHBOARD_TIPS_AR = [
  'ارفع صوراً من بيئة الصالون المناسبة للعائلات — ألوان هادئة وزوايا واضحة.',
  'اذكر في الردود السريعة أنك متخصص بالأطفال لتطمئن ولي الأمر.',
  'استخدم نسخ السوشيال أدناه لدعوة العائلات في الحي — المشاركة اختيارية.',
] as const;

export function buildChildrenSpecialistWhatsAppCopy(salonName: string): string {
  return [
    `مرحباً — ${salonName} صالون متخصّص بحلاقة الأطفال على حلاق ماب.`,
    CHILDREN_SPECIALIST_BANNER_TAGLINE_AR,
    'ابحث عنا على المنصة أو تواصل مباشرة — بيئة مناسبة للعائلات.',
  ].join('\n');
}

export function buildChildrenSpecialistInstagramCopy(salonName: string): string {
  return [
    `${salonName} — متخصص أطفال`,
    'صالون يركّز على حلاقة الأطفال ببيئة آمنة ومريحة للعائلات.',
    'جدّدنا ظهورنا على `halaqmap` — ابحث عنا في منطقتك.',
    '#حلاق_أطفال #صالون_أطفال #حلاق_ماب',
  ].join('\n');
}
