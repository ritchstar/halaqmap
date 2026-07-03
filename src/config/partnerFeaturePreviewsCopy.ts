import { OWNER_WATCH_PARTNER_PREVIEW } from '@/config/ownerWatchFeatureCopy';

export const PARTNER_FEATURE_PREVIEW_DASHBOARD = {
  eyebrow: 'لوحة التشغيل · 🥇 ذهبي · 💎 ماسي',
  title: 'إدارة يومك بكفاءة — بلا محاسبة ولا تعقيد ورقي',
  lead:
    'لا نكتفي بجذب الزبائن — لوحة خفيفة للكراسي والورديات ومتابعة اليوم، دون سجلات مالية على المنصة.',
  bullets: [
    'تنظيم الكراسي والورديات — وقت أقل ضائعاً على الكرسي الفارغ',
    'متابعة أداء اليوم — تعرف ماذا يحدث الآن في صالونك',
    'تحديث البنر والتوفر — الزبون يراك جاهزاً في اللحظة المناسبة',
    'بلا محاسبة ثقيلة — لا مبالغ نقدية ولا محافظ مالية داخل اللوحة',
  ],
  tierNote:
    'اللوحة في الذهبي والماسي — جدولة المواعيد الحية في الماسي فقط — البرونزي بدون لوحة تحكم.',
} as const;

export const PARTNER_FEATURE_PREVIEW_OWNER_WATCH = OWNER_WATCH_PARTNER_PREVIEW;

export const PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT = {
  eyebrow: '🏛️ إضافة المكتب الخاص · مساعد داخلي + مناوب شات',
  title: 'مكتبك الخاص يأمر — مناوبك ينفّذ — والتقارير تصلك',
  paragraphs: [
    'اكتب «تعليمة: لا تقبل مواعيد بعد الساعة 10» في مكتبك الخاص — ينفّذها المناوب مع كل زبون فوراً بسرية تامة، بينما تصلك تقارير كل محادثة أجراها.',
    'المناوب يكتشف لغة العميل ويرد بها خلال نحو 5 ثوانٍ — ويتوقف تلقائياً عندما ترد أنت يدوياً حتى تعيده من شات العملاء.',
    'دليل استخدام مفصّل يُرسل مع بريد التفعيل — يشمل الشات، المكتب الخاص، المحفظة، وغرفة المراقبة.',
  ],
  clientMessage: 'أبي أحجز كرسي الحين عندك حلاق فاضي؟',
  bannerIdleStatus: 'متاح للضيافة — استفسارك مرحّب به',
  bannerActiveStatus: 'المناوب جاهز ومستعد للترحيب بك',
  assistantReply:
    'أهلاً فيك يا طويل العمر 🌟 عندنا كرسي فاضي الحين مع أحد فريقنا الجاهزين — ثبتّ لك الموعد على طول وأرسلت لك تأكيد الوصول. تشرفنا فيك ونكون بانتظارك!',
} as const;

export const PARTNER_FEATURE_PREVIEW_PRIVATE_OFFICE = {
  eyebrow: '🏛️ إضافة المكتب الخاص — Diamond حصراً',
  title: 'مكتبك يأمر · مناوبك ينفّذ · التقارير تصلك',
  bullets: [
    { icon: '📋', label: 'رمز التوجيه «تعليمة:»', desc: 'اكتبها في المكتب — تُنفَّذ فوراً مع كل زبون بسرية تامة' },
    { icon: '📡', label: 'تقارير المناوب', desc: 'كل محادثة أجراها المناوب تصلك تقريراً في المكتب' },
    { icon: '✅', label: 'قائمة مهام', desc: 'سجّل مهامك وأشّر الإنجاز — كل شيء في مكان واحد' },
    { icon: '💳', label: 'رصيد الحزمة + تجديد', desc: 'أيام الرخصة المتبقية + رابط التجديد الفوري' },
    { icon: '🔔', label: 'تنبيه قبل الانتهاء', desc: 'إنذار ذكي قبل انتهاء الرخصة بـ14 يوم' },
    { icon: '🔒', label: 'قناة خاصة حصرية', desc: 'بينك وبين مناوبك فقط — الزبائن لا يرونها' },
  ],
} as const;

export type DashboardNeonToolId = 'live_schedule' | 'chairs_staff' | 'shifts';

export type DashboardNeonToolConfig = {
  id: DashboardNeonToolId;
  label: string;
  tooltip: string;
  halo: 'cyan' | 'emerald';
};

export const DASHBOARD_NEON_OPERATIONAL_TOOLS: readonly DashboardNeonToolConfig[] = [
  {
    id: 'live_schedule',
    label: 'جدول المواعيد الحية',
    tooltip:
      'يربط الحجوزات الفورية بخريطة اليوم — تقلّل التداخل وتملأ الفجوات قبل أن يبرد الكرسي.',
    halo: 'cyan',
  },
  {
    id: 'chairs_staff',
    label: 'إدارة الكراسي والحلاقين',
    tooltip:
      'توزّع الضيوف على الكرسي الأنسب والحلاق المتاح — أقصى استغلال للطاقم بلا انتظار عشوائي.',
    halo: 'emerald',
  },
  {
    id: 'shifts',
    label: 'أوقات العمل والورديات',
    tooltip:
      'تنسّق الورديات مع أوقات الذروة — البنر يعكس التوفر الحقيقي وتقلّ فترات الكرسي الفارغ.',
    halo: 'cyan',
  },
] as const;

export const DASHBOARD_NEON_MUTED_TOOLS = [
  'معرض الأعمال والبنر',
  'حالة الضيافة على الرادار',
  'رسائل الضيوف والترحيب',
] as const;
