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
      { kind: 'text', value: 'صورتان أساسيتان (خارجي وداخل) وأربع صور للبنر مع طلب الحزمة البرمجية' },
      { kind: 'text', value: 'جدول أسبوعي كامل لأوقات العمل مع الطلب (إلزامي ويُعرَض للعملاء)' },
      { kind: 'text', value: 'رقم الهاتف وبيانات التواصل من بطاقة المحل' },
      { kind: 'text', value: 'ظهور في نتائج البحث عبر نظام الرصد الذكي' },
      { kind: 'text', value: 'تحديث المعلومات الأساسية' },
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
      { kind: 'text', value: 'كل مميزات البرونزي' },
      { kind: 'text', value: 'بنر موسع بصور متعددة' },
      { kind: 'text', value: 'إدارة صور المحل والبنر من لوحة التحكم بعد التفعيل' },
      { kind: 'text', value: 'جدول أسبوعي لأوقات العمل من لوحة التحكم (كل يوم على حدة)' },
      { kind: 'text', value: 'رابط واتساب مباشر' },
      { kind: 'text', value: 'شات مباشر مع العملاء' },
      { kind: 'text', value: 'جلسة شات خاصة لكل عميل تنتهي تلقائياً بعد 60 دقيقة لخصوصية أعلى' },
      { kind: 'text', value: 'أولوية في نتائج البحث' },
      { kind: 'text', value: 'إحصائيات المشاهدات' },
      { kind: 'text', value: SHOP_OPEN_STATUS_FEATURE_GOLD_DIAMOND },
      { kind: 'text', value: BARBER_DASHBOARD_GOLD_LINE },
      {
        kind: 'text',
        value:
          'خدمة كبار السن والمرضى وذوي الاحتياجات (محل/منزل): تحكم كامل بعد التفعيل من لوحة التحكم — السعر المعروض، إظهار أو إخفاء الخدمة للعملاء، تقييد أيام الإعلان أو تركها مرنة، وملاحظة للعميل',
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
      { kind: 'text', value: 'كل مميزات الذهبي' },
      { kind: 'text', value: 'شارة ماسية مميزة' },
      { kind: 'text', value: 'إدارة صور المحل والبنر من لوحة التحكم بعد التفعيل' },
      { kind: 'text', value: 'جدول أسبوعي لأوقات العمل من لوحة التحكم (كل يوم على حدة)' },
      { kind: 'text', value: 'أولوية قصوى في الظهور' },
      { kind: 'text', value: BARBER_DASHBOARD_DIAMOND_PORTAL_LINE },
      { kind: 'text', value: BARBER_DIAMOND_APPOINTMENTS_FROM_DASHBOARD_LINE },
      { kind: 'text', value: 'ترجمة تلقائية في الشات' },
      { kind: 'text', value: 'شات خاص لكل عميل مع ترجمة ذكية فورية للطرفين وانتهاء تلقائي بعد 60 دقيقة' },
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
  `كل بطاقة = ${SOFTWARE_PACKAGE_VALIDITY_LABEL_AR} — دفع لمرة واحدة عبر moyasar، تفعيل تلقائي بعد نجاح الدفع، دون تجديد تلقائي أو خصم دوري.`;

export const SUBSCRIPTION_POLICY_PACKAGE_RENEWAL = {
  title: 'تجديد الحزمة أو تغيير المستوى',
  lead:
    'الحزم البرمجية مسبقة الدفع بمدة محددة. لا يوجد ترقية تناسبية أو تخفيض منتصف المدة — عند الرغبة في مستوى أعلى أو تجديد الإدراج، تُشترى حزمة برمجية جديدة.',
  items: [
    {
      title: 'انتهاء المدة',
      body: 'عند انتهاء الـ30 يوم تتوقف صلاحية الإدراج عبر نظام الرصد الذكي حتى شراء حزمة جديدة أو استرداد كود تفعيل.',
    },
    {
      title: 'ترقية المستوى',
      body: 'للانتقال من برونزي/ذهبي إلى مستوى أعلى: اشترِ حزمة المستوى الجديد (100 / 150 / 200 ر.س) عند الحاجة — التفعيل وفق مسار الدفع المعتاد.',
    },
    {
      title: 'إضافة المناوب الرقمي',
      body: 'متاحة للباقة الماسية فقط — +25 ر.س لكل بطاقة 30 يوم عند اختيار «الماسية الذكية» في صفحة الدفع.',
    },
  ],
} as const;

export const SUBSCRIPTION_POLICY_EXPIRY = {
  title: 'انتهاء الصلاحية وإخفاء الإدراج',
  items: [
    {
      title: 'نهاية مدة الحزمة',
      body: 'بانتهاء الـ30 يوم تُخفى بطاقة الصالون من نتائج نظام الرصد الذكي — دون حذف تلقائي للبيانات إلا وفق طلب صريح.',
    },
    {
      title: 'لا تجديد تلقائي',
      body: 'لا يُخصم أي مبلغ دورياً من بطاقتك. كل عملية شراء = حزمة جديدة بمدة محددة.',
    },
    {
      title: 'إعادة التفعيل',
      body: 'يمكنك شراء حزمة برمجية جديدة أو استرداد كود تفعيل في أي وقت لاستعادة الظهور.',
    },
  ],
} as const;
