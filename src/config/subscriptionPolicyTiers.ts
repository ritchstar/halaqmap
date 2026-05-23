import { SubscriptionTier } from '@/lib';
import {
  BARBER_DASHBOARD_DIAMOND_PORTAL_LINE,
  BARBER_DASHBOARD_GOLD_LINE,
  BARBER_DIAMOND_APPOINTMENTS_FROM_DASHBOARD_LINE,
  SHOP_OPEN_STATUS_FEATURE_BRONZE,
  SHOP_OPEN_STATUS_FEATURE_GOLD_DIAMOND,
} from '@/config/subscriptionPlanHero';
import { RATING_QR_PLAN_LINE } from '@/config/ratingQrInvite';
import {
  DIGITAL_SHIFT_PRICING_ADDON_LABEL_AR,
  SOFTWARE_PACKAGE_UNIT_LABEL_AR,
  SOFTWARE_PACKAGE_VALIDITY_LABEL_AR,
  TIER_MONTHLY_SAR,
} from '@/config/subscriptionPricing';

export type SubscriptionPolicyTierFeature = { kind: 'map_hero' } | { kind: 'text'; value: string };

export type SubscriptionPolicyTier = {
  tier: SubscriptionTier;
  name: string;
  priceSar: number;
  periodLabelAr: string;
  color: string;
  features: SubscriptionPolicyTierFeature[];
};

/** بطاقات سياسة الحزم — مصدر واحد مع التسجيل والدفع (30 يوم · moyasar · دون تجديد تلقائي). */
export const SUBSCRIPTION_POLICY_TIERS: readonly SubscriptionPolicyTier[] = [
  {
    tier: SubscriptionTier.BRONZE,
    name: 'برونزي',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.BRONZE],
    periodLabelAr: `ر.س / ${SOFTWARE_PACKAGE_UNIT_LABEL_AR} · 30 يوم`,
    color: 'bg-gradient-to-br from-amber-700 to-amber-900',
    features: [
      { kind: 'map_hero' },
      { kind: 'text', value: 'ظهور محلي موثوق عندما يبحث العميل عن صالون قريب من موقعه' },
      { kind: 'text', value: 'صورتان أساسيتان للواجهة والداخل + أربع صور للبنر مع طلب الباقة' },
      { kind: 'text', value: 'بطاقة تعريف واضحة تعرض الاسم، الموقع، رقم التواصل، والواتساب' },
      { kind: 'text', value: 'جدول أسبوعي كامل لأوقات العمل يظهر للعملاء بوضوح' },
      { kind: 'text', value: 'تحديث المعلومات الأساسية عند الحاجة للحفاظ على دقة الظهور' },
      { kind: 'text', value: 'مناسبة كبداية منخفضة التعقيد لاختبار الطلب داخل الحي' },
      { kind: 'text', value: SHOP_OPEN_STATUS_FEATURE_BRONZE },
    ],
  },
  {
    tier: SubscriptionTier.GOLD,
    name: 'ذهبي',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.GOLD],
    periodLabelAr: `ر.س / ${SOFTWARE_PACKAGE_UNIT_LABEL_AR} · 30 يوم`,
    color: 'bg-gradient-to-br from-accent to-yellow-600',
    features: [
      { kind: 'map_hero' },
      { kind: 'text', value: RATING_QR_PLAN_LINE },
      { kind: 'text', value: 'كل مميزات البرونزي مع إبراز ذهبي أقوى في نتائج القرب' },
      { kind: 'text', value: 'معرض أعمال موسّع حتى 20 صورة لعرض القصات، الديكور، والتفاصيل' },
      { kind: 'text', value: 'إدارة صور المحل والبنر من لوحة التحكم بعد التفعيل' },
      { kind: 'text', value: 'تحديث المنيو والأسعار وأوقات العمل من لوحة تحكم سهلة' },
      { kind: 'text', value: 'رابط واتساب مباشر وشات فوري لتقليل تردد العميل' },
      { kind: 'text', value: 'جلسة شات خاصة لكل عميل تنتهي تلقائياً بعد 60 دقيقة لخصوصية أعلى' },
      { kind: 'text', value: 'أولوية أعلى في الظهور مع إحصائيات تساعدك على فهم تفاعل العملاء' },
      { kind: 'text', value: SHOP_OPEN_STATUS_FEATURE_GOLD_DIAMOND },
      { kind: 'text', value: BARBER_DASHBOARD_GOLD_LINE },
      {
        kind: 'text',
        value:
          'خدمة كبار السن والمرضى وذوي الاحتياجات (محل/منزل): تحكم كامل بعد التفعيل من لوحة التحكم — السعر المعروض، إظهار أو إخفاء الخدمة للعملاء، تقييد الأصل الرقمي الجغرافي بأيام أو تركها مرنة، وملاحظة للعميل',
      },
    ],
  },
  {
    tier: SubscriptionTier.DIAMOND,
    name: 'ماسي',
    priceSar: TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND],
    periodLabelAr: `ر.س / ${SOFTWARE_PACKAGE_UNIT_LABEL_AR} · 30 يوم`,
    color: 'bg-gradient-to-br from-primary to-cyan-600',
    features: [
      { kind: 'map_hero' },
      { kind: 'text', value: RATING_QR_PLAN_LINE },
      { kind: 'text', value: 'كل مميزات الذهبي مع تمييز ماسي فاخر في الواجهة' },
      { kind: 'text', value: 'معرض أعمال حتى 40 صورة مع بنر بصري أقوى وشارة نخبة' },
      { kind: 'text', value: 'إدارة صور المحل والبنر والمنيو والأسعار من لوحة التحكم بعد التفعيل' },
      { kind: 'text', value: 'جدول أسبوعي لأوقات العمل من لوحة التحكم (كل يوم على حدة)' },
      { kind: 'text', value: 'أولوية قصوى في الظهور للصالونات التي تستهدف صدارة المنطقة' },
      { kind: 'text', value: BARBER_DASHBOARD_DIAMOND_PORTAL_LINE },
      { kind: 'text', value: BARBER_DIAMOND_APPOINTMENTS_FROM_DASHBOARD_LINE },
      { kind: 'text', value: 'شات خاص لكل عميل مع ترجمة ذكية فورية للطرفين وانتهاء تلقائي بعد 60 دقيقة' },
      { kind: 'text', value: 'تجربة تواصل مناسبة للعملاء متعددي اللغات والزوار الجدد' },
      {
        kind: 'text',
        value:
          'التنبيه على معالجة الترجمة: تُعرض بين المستخدم والصالون كمزوّد خدمة وفق سياسة الخصوصية — ليست ترجمة رسمية أو استشارة',
      },
      { kind: 'text', value: DIGITAL_SHIFT_PRICING_ADDON_LABEL_AR },
      { kind: 'text', value: 'دعم فني مخصص 24/7' },
    ],
  },
] as const;

export const SUBSCRIPTION_POLICY_TIERS_INTRO =
  `كل حزمة = ${SOFTWARE_PACKAGE_VALIDITY_LABEL_AR} نفاذ ضمن نظام الاستجابة الذكية — دفع لمرة واحدة عبر moyasar، تفعيل تلقائي بعد نجاح الدفع، دون تجديد تلقائي أو خصم دوري. الظهور برمجي يُفعَّل عند وجود طلب نشط في محيطك الجغرافي.`;

export const SUBSCRIPTION_POLICY_PACKAGE_RENEWAL = {
  title: 'تجديد حزمة رخصة النفاذ أو تغيير المستوى',
  lead:
    'حزم رخصة النفاذ مسبقة الدفع بمدة محددة. لا يوجد ترقية تناسبية أو تخفيض منتصف المدة — عند الرغبة في مستوى أعلى أو تجديد النفاذ، تُشترى حزمة رخصة جديدة.',
  items: [
    {
      title: 'انتهاء المدة',
      body: 'عند انتهاء الـ30 يوم تتوقف صلاحية النفاذ ضمن نظام الاستجابة الذكية حتى شراء حزمة جديدة أو استرداد كود تفعيل.',
    },
    {
      title: 'ترقية المستوى',
      body: 'للانتقال من برونزي/ذهبي إلى مستوى أعلى: اشترِ حزمة المستوى الجديد (100 / 150 / 200 ر.س) عند الحاجة — التفعيل وفق مسار الدفع المعتاد.',
    },
    {
      title: 'إضافة المناوب الرقمي (Add-on)',
      body: 'إضافة برمجية متقدمة للباقة الماسية فقط — +25 ر.س لكل حزمة نفاذ عند اختيار «المناوب الرقمي الذكي» في التسعير أو الدفع. منفصلة عن رخصة النفاذ وتعزّز كفاءة الاستجابة بأتمتة الضيافة والشات.',
    },
  ],
} as const;

export const SUBSCRIPTION_POLICY_EXPIRY = {
  title: 'انتهاء صلاحية النفاذ وإيقاف الاستجابة',
  items: [
    {
      title: 'نهاية مدة الحزمة',
      body: 'بانتهاء الـ30 يوم يُوقَف ظهور صالونك البرمجي ضمن نظام الاستجابة الذكية — دون حذف تلقائي للبيانات إلا وفق طلب صريح.',
    },
    {
      title: 'لا تجديد تلقائي',
      body: 'لا يُخصم أي مبلغ دورياً من بطاقتك. كل عملية شراء = حزمة نفاذ جديدة بمدة محددة.',
    },
    {
      title: 'إعادة التفعيل',
      body: 'يمكنك شراء حزمة رخصة نفاذ جديدة أو استرداد كود تفعيل في أي وقت لاستعادة الاستجابة عند الطلب.',
    },
  ],
} as const;
