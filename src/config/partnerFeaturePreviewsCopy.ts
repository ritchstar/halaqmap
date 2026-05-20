export const PARTNER_FEATURE_PREVIEW_DASHBOARD = {
  eyebrow: 'مركز إدارة الصالون',
  title: 'لوحة التحكم — مسار تشغيلي بلا أي سجلات مالية',
  paragraphs: [
    'واجهة داخلية زجاجية داكنة تركّز على ضبط التشغيل اليومي: مواعيد حية، توزيع الكراسي، وورديات العمل — دون عرض أو تخزين أي مبالغ نقدية أو محافظ على المنصة.',
    'الإضاءة النيونية تُوجّه نظرك فقط إلى الأدوات التي تقلّل وقت الكرسي الفارغ وتسرّع استقبال الضيوف.',
  ],
} as const;

export const PARTNER_FEATURE_PREVIEW_DIGITAL_SHIFT = {
  eyebrow: 'المناوب الذكي · أثر الضيافة',
  title: 'محاكاة استجابة المناوب على الشات وحالة البنر',
  paragraphs: [
    'عندما يسأل العميل عن كرسي متاح، يفعّل المناوب حالة الضيافة على البنر فوراً — «جاهز للترحيب» — ثم يرد بأسلوب سعودي دافئ يثبت الموعد ويؤكد التوفر الحي.',
    'يكتشف لغة العميل من رسالته ويرد بنفس اللغة في الشات (عربي · English · اردو · Türkçe · Français · Español · Tagalog) — شات مترجم ذكي بلا تبديل يدوي.',
    'المحاكاة تقتصر على العلاقة والجدولة والترحيب: لا أسعار، لا محفظة، ولا أي بيانات مالية للصالون.',
  ],
  clientMessage: 'أبي أحجز كرسي الحين عندك حلاق فاضي؟',
  bannerIdleStatus: 'متاح للضيافة — استفسارك مرحّب به',
  bannerActiveStatus: 'المناوب جاهز ومستعد للترحيب بك',
  assistantReply:
    'أهلاً فيك يا طويل العمر 🌟 عندنا كرسي فاضي الحين مع أحد فريقنا الجاهزين — ثبتّ لك الموعد على طول وأرسلت لك تأكيد الوصول. تشرفنا فيك ونكون بانتظارك!',
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
