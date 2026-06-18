import { SubscriptionTier } from '@/lib';
import {
  BARBER_DASHBOARD_DIAMOND_PORTAL_LINE,
  BARBER_DASHBOARD_GOLD_LINE,
  BARBER_DIAMOND_APPOINTMENTS_FROM_DASHBOARD_LINE,
  SHOP_OPEN_STATUS_FEATURE_BRONZE,
  SHOP_OPEN_STATUS_FEATURE_GOLD_DIAMOND,
} from '@/config/subscriptionPlanHero';
import {
  OWNER_WATCH_FEATURE_DIAMOND_LINE,
  OWNER_WATCH_FEATURE_GOLD_LINE,
} from '@/config/ownerWatchFeatureCopy';
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
      { kind: 'text', value: 'ظهور عند الطلب للمستخدمين المناسبين عند وجود استعلام نشط يطابق بيانات صالونك' },
      { kind: 'text', value: 'بطاقة صالون مختصرة تجمع الموقع، الاتصال، الواتساب، والصور الأساسية' },
      { kind: 'text', value: 'صورتان أساسيتان للواجهة والداخل + أربع صور بنر مع طلب الباقة' },
      { kind: 'text', value: 'جدول أسبوعي لأوقات العمل حتى يعرف العميل متى يتواصل معك' },
      { kind: 'text', value: 'شهادة تفعيل ورقم رخصة نفاذ بعد الدفع لإثبات حضورك الرسمي' },
      { kind: 'text', value: 'مناسبة كبداية منخفضة التكلفة لاختبار طلب الحي قبل التوسع' },
      { kind: 'text', value: SHOP_OPEN_STATUS_FEATURE_BRONZE },
      { kind: 'text', value: 'حلاقة أطفال (برونزي): يمكن اختيار «حلاقة أطفال» ضمن التخصص عند التسجيل' },
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
      { kind: 'text', value: 'كل مميزات البرونزي مع أولوية ذهبية عند تنشّط الاستعلام المناسب' },
      { kind: 'text', value: 'معرض أعمال حتى 20 صورة لعرض القصات، الديكور، النظافة، والتفاصيل' },
      { kind: 'text', value: 'إدارة صور المحل والبنر من لوحة التحكم بعد التفعيل دون انتظار تعديل يدوي' },
      { kind: 'text', value: 'تحديث المنيو والأسعار وأوقات العمل من لوحة سهلة تخفف الأسئلة المتكررة' },
      { kind: 'text', value: 'رابط واتساب مباشر وشات فوري لتقليل تردد العميل بعد ظهورك' },
      { kind: 'text', value: 'جلسة شات خاصة لكل عميل تنتهي تلقائياً بعد 60 دقيقة لخصوصية أعلى' },
      { kind: 'text', value: 'إحصائيات تساعدك تفهم تفاعل العملاء وتعرف ما الذي يجذبهم' },
      { kind: 'text', value: SHOP_OPEN_STATUS_FEATURE_GOLD_DIAMOND },
      { kind: 'text', value: BARBER_DASHBOARD_GOLD_LINE },
      { kind: 'text', value: OWNER_WATCH_FEATURE_GOLD_LINE },
      {
        kind: 'text',
        value:
          'زيارة منزلية (ذهبي/ماسي): إعلان + طلب تواصل عبر الشات أو واتساب — التنسيق والتنفيذ مباشرة مع العميل دون وساطة المنصة',
      },
      {
        kind: 'text',
        value:
          'خدمة كبار السن والمرضى وذوي الاحتياجات (محل/منزل): تحكم كامل بعد التفعيل من لوحة التحكم — السعر المعروض، إظهار أو إخفاء الخدمة للعملاء، تقييد الأصل الرقمي الجغرافي بأيام أو تركها مرنة، وملاحظة للعميل',
      },
      {
        kind: 'text',
        value: 'حلاقة أطفال (ذهبي/ماسي): إعلان «يستقبل أطفالاً» من لوحة الرسائل — ضمن التخصص العام',
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
      { kind: 'text', value: 'كل مميزات الذهبي مع أعلى أولوية ماسية عند تنشّط الاستعلام المناسب' },
      { kind: 'text', value: 'معرض أعمال حتى 40 صورة مع بنر فاخر وشارة ماسية ترفع الانطباع' },
      { kind: 'text', value: 'إدارة صور المحل والبنر والمنيو والأسعار من لوحة التحكم بعد التفعيل' },
      { kind: 'text', value: 'جدول أسبوعي لأوقات العمل من لوحة التحكم (كل يوم على حدة)' },
      { kind: 'text', value: 'أولوية قصوى للصالونات التي تستهدف صدارة المنطقة لا مجرد حضور عادي' },
      { kind: 'text', value: BARBER_DASHBOARD_DIAMOND_PORTAL_LINE },
      { kind: 'text', value: OWNER_WATCH_FEATURE_DIAMOND_LINE },
      { kind: 'text', value: BARBER_DIAMOND_APPOINTMENTS_FROM_DASHBOARD_LINE },
      { kind: 'text', value: 'شات خاص لكل عميل مع ترجمة ذكية فورية للطرفين وانتهاء تلقائي بعد 60 دقيقة' },
      { kind: 'text', value: 'تجربة تواصل مناسبة للسياح والمقيمين والعملاء متعددي اللغات' },
      {
        kind: 'text',
        value:
          'التنبيه على معالجة الترجمة: تُعرض بين المستخدم والصالون كمزوّد خدمة وفق سياسة الخصوصية — ليست ترجمة رسمية أو استشارة',
      },
      { kind: 'text', value: DIGITAL_SHIFT_PRICING_ADDON_LABEL_AR },
      {
        kind: 'text',
        value:
          'تجهيز عريس (ماسي): إعلان + طلب تواصل عبر الشات أو واتساب — التنسيق والتنفيذ مباشرة مع العميل دون وساطة المنصة',
      },
      {
        kind: 'text',
        value:
          'متخصص أطفال (ماسي): بطاقة وبنر طفولي على الخريطة + فلتر «متخصص أطفال» + لوحة تحكم مخصصة — للصالونات المتخصصة بالأطفال فقط',
      },
      { kind: 'text', value: 'دعم فني مخصص 24/7 للصالونات التي تعتمد على المنصة كقناة تشغيل' },
    ],
  },
] as const;

export const SUBSCRIPTION_POLICY_TIERS_INTRO =
  `كل حزمة = ${SOFTWARE_PACKAGE_VALIDITY_LABEL_AR} نفاذ ضمن نظام الاستجابة الذكية — دفع لمرة واحدة عبر moyasar، تفعيل تلقائي بعد نجاح الدفع، دون تجديد تلقائي أو خصم دوري. الظهور برمجي يُفعَّل عند وجود استعلام نشط يطابق بيانات الصالون وفلترة المستخدم.`;

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
