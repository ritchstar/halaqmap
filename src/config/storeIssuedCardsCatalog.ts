/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * كتالوج البطاقات المدفوعة — أسعار معتمدة. التحصيل الحي يتبع وضع ميسر في المنصة.
 * لا يُستورد من App.
 */
export const STORE_PAID_INVITE_PRICES_SAR = {
  quick: 12,
  featured: 29,
  luxury: 59,
} as const;

/** وسم ميسر — لا يُخلط برخصة النفاذ ولا بشحن المحفظة. */
export const STORE_OCCASION_CARD_PRODUCT = 'store_occasion_card';

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

/** التحصيل مفتوح. يُغلق بـ VITE_STORE_PAID_INVITE_CHECKOUT_ENABLED=false. */
export const STORE_PAID_INVITE_CHECKOUT_ENABLED = envEnabled(
  'VITE_STORE_PAID_INVITE_CHECKOUT_ENABLED',
  true,
);

export type StorePaidInviteTier = keyof typeof STORE_PAID_INVITE_PRICES_SAR;

export type StorePaidInviteFamily = 'seasons' | 'personal' | 'achievements' | 'luxury';

export type StorePaidInviteTemplate = {
  id: string;
  family: StorePaidInviteFamily;
  tier: StorePaidInviteTier;
  titleAr: string;
  subtitleAr: string;
};

export const STORE_PAID_INVITE_FAMILIES: ReadonlyArray<{
  id: StorePaidInviteFamily;
  titleAr: string;
  leadAr: string;
}> = [
  { id: 'seasons', titleAr: 'المواسم والتهاني', leadAr: 'طبقة سريعة — 12 ر.س عند النشر.' },
  { id: 'personal', titleAr: 'المناسبات الشخصية', leadAr: 'طبقة مميزة — 29 ر.س عند النشر.' },
  { id: 'achievements', titleAr: 'الإنجازات', leadAr: 'طبقة مميزة — 29 ر.س عند النشر.' },
  { id: 'luxury', titleAr: 'الأفراح والاستقبال', leadAr: 'طبقة فاخرة — 59 ر.س عند النشر.' },
];

export const STORE_PAID_INVITE_TEMPLATES: readonly StorePaidInviteTemplate[] = [
  { id: 'season-short', family: 'seasons', tier: 'quick', titleAr: 'تهنئة موسمية', subtitleAr: 'قالب قصير للمشاركة السريعة.' },
  { id: 'season-eid-note', family: 'seasons', tier: 'quick', titleAr: 'معايدة موجزة', subtitleAr: 'بطاقة عيد قصيرة.' },
  { id: 'season-thanks', family: 'seasons', tier: 'quick', titleAr: 'شكر سريع', subtitleAr: 'بطاقة شكر بلا تفاصيل حفل.' },
  { id: 'personal-birthday', family: 'personal', tier: 'featured', titleAr: 'ميلاد', subtitleAr: 'بطاقة ميلاد باسم المحتفى به.' },
  { id: 'personal-newborn', family: 'personal', tier: 'featured', titleAr: 'استقبال مولود', subtitleAr: 'بطاقة استقبال للمولود.' },
  { id: 'personal-eid', family: 'personal', tier: 'featured', titleAr: 'عيد', subtitleAr: 'بطاقة عيد أوضح من المختصر.' },
  { id: 'achieve-grad', family: 'achievements', tier: 'featured', titleAr: 'تخرج', subtitleAr: 'بطاقة تخرج.' },
  { id: 'achieve-role', family: 'achievements', tier: 'featured', titleAr: 'ترقية أو منصب', subtitleAr: 'بطاقة إنجاز مهني شخصي.' },
  { id: 'achieve-general', family: 'achievements', tier: 'featured', titleAr: 'إنجاز شخصي', subtitleAr: 'بطاقة إنجاز عام.' },
  { id: 'luxury-wedding', family: 'luxury', tier: 'luxury', titleAr: 'قران', subtitleAr: 'بطاقة قران — لا تُسعَّر بـ 12.' },
  { id: 'luxury-milka', family: 'luxury', tier: 'luxury', titleAr: 'ملكة', subtitleAr: 'بطاقة ملكة.' },
  { id: 'luxury-family', family: 'luxury', tier: 'luxury', titleAr: 'استقبال عائلي', subtitleAr: 'دعوة استقبال أسري.' },
];

export const STORE_PAID_INVITE_COPY = {
  documentTitle: 'بطاقة مناسبة مدفوعة — خريطة الحل',
  kicker: 'إصدار فوري لبطاقة مناسبة',
  titleAr: 'بطاقة مناسبة قابلة للمشاركة',
  leadAr:
    'معاينة مجانية بلا حساب. الأسعار المعتمدة: 12 و29 و59 ر.س. الدفع عبر ميسر على `www.halaqmap.com` عند النشر، كفاتورة منتج بطاقة مناسبة مستقلة عن رخصة النفاذ. المنصة لا ترسل الدعوة نيابة عنك ولا تدير قائمة ضيوف.',
  stampAr: 'صُممت عبر halaqmap · خريطة الحل',
  createCtaAr: 'أنشئ بطاقتك',
  downloadCtaAr: 'تحميل بطاقتك',
  copyLinkCtaAr: 'نسخ رابط المشاركة',
  paidLiveHintAr: 'تم الدفع. حمّل الصورة أو انسخ الرابط للمشاركة.',
  payAtPublishAr: 'ادفع للنشر',
  checkoutClosedAr:
    'بوابة الدفع غير مفتوحة لهذه البطاقة بعد. السعر ظاهر للمعاينة فقط، حتى يُسجَّل المنتج في ميسر ويُربط بفاتورته.',
  checkoutClosedCtaAr: 'النشر بعد ربط الفاتورة',
  testCheckoutHintAr:
    'التحصيل الآن في البيئة التجريبية لميسر. لا خصم حقيقي، وبطاقة الاختبار `4111 1111 1111 1111`.',
  noPackAr: 'باقة الثلاث بطاقات غير متاحة في هذه النسخة.',
  deferredCommercialAr: 'افتتاح النشاط التجاري مؤجّل إلى موجة لاحقة.',
  legalGateAr: 'الموافقة على شروط إصدار البطاقات مطلوبة قبل الإنشاء.',
} as const;

export function templateById(id: string): StorePaidInviteTemplate | null {
  return STORE_PAID_INVITE_TEMPLATES.find((item) => item.id === id) ?? null;
}

export function priceSarForTemplate(id: string): number | null {
  const item = templateById(id);
  if (!item) return null;
  return STORE_PAID_INVITE_PRICES_SAR[item.tier];
}

export function priceHalalasForTemplate(id: string): number | null {
  const sar = priceSarForTemplate(id);
  return sar == null ? null : sar * 100;
}
