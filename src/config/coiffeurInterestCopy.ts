/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';
import { COIFFEUR_BRAND_AR, COIFFEUR_INQUIRY_INTENTS } from '@/config/coiffeurMapUmbrella';
import { TIER_MONTHLY_SAR, DIGITAL_SHIFT_MONTHLY_ADDON_SAR } from '@/config/subscriptionPricing';
import { SubscriptionTier } from '@/lib/index';

export const COIFFEUR_INTEREST_ROLES = [
  { id: 'visitor', label: 'مستعلمة' },
  { id: 'salon', label: 'صاحبة مشغل أو صالون' },
  { id: 'investor', label: 'مستثمرة أو شريكة انتشار' },
] as const;

export const COIFFEUR_INTEREST_LANDING_COPY = {
  documentTitle: 'كوافير ماب — سجّلي اهتمامك وتلقّي التحديثات',
  badge: 'اهتمام مسبق · تحديثات بالبريد',
  title: 'تابعي كوافير ماب قبل الإطلاق الأوسع',
  lead:
    'هذه الصفحة لتسجيل الاهتمام وتلقّي التحديثات، وتحميل كروت برمجية جاهزة للمشاركة. ليست عقداً ولا دفعاً ولا طلب انضمام.',
  legalTitle: 'تنبيه قانوني',
  legalBody:
    'لا تُنشئ هذه الصفحة علاقة تعاقدية ولا تجمع بيانات رخصة ولا تُكمل مساراً مالياً. يقتصر الغرض على بريدك عند موافقتك الصريحة لإرسال تحديثات إعلامية، مع اسم عرض اختياري لاستخدامه على الكروت.',
  formTitle: 'سجّلي اهتمامك',
  formHint: 'البريد مطلوب. الاسم أو الاسم المستعار اختياري ويظهر على الكرت التعريفي.',
  kitTitle: 'أدوات المغادرة',
  kitLead:
    'حمّلي كرتاً تعريفياً باسمك أو باسم مستعار، أو كرتاً تشاركياً للصورة ووسائل التواصل، أو ملف شرح المنصة والتعاقد والأسعار.',
  introCardCta: 'تحميل الكرت التعريفي',
  shareCardCta: 'مشاركة أو حفظ الكرت التشاركي',
  briefCta: 'تحميل ملف الشرح والتعاقد',
  afterSubmit: 'تم التسجيل — نرسل التحديثات الرسمية عند توفرها.',
  already: 'بريدك مسجّل مسبقاً — شكراً لاهتمامك.',
} as const;

export function coiffeurInterestPageUrl(): string {
  if (typeof window === 'undefined') {
    return `https://coiffeur.halaqmap.com/#${ROUTE_PATHS.COIFFEUR_INTEREST}`;
  }
  const host = window.location.hostname.toLowerCase();
  const origin =
    host === 'coiffeur.halaqmap.com' || host.endsWith('.halaqmap.com')
      ? window.location.origin
      : 'https://coiffeur.halaqmap.com';
  return `${origin}/#${ROUTE_PATHS.COIFFEUR_INTEREST}`;
}

/** رابط وصف فيديو يوتيوب — التحويل إلى صفحة الاهتمام لا إلى الاستعلام */
export function coiffeurInterestYoutubeUrl(): string {
  return `${coiffeurInterestPageUrl()}?utm_source=youtube&utm_medium=video&utm_campaign=coiffeur_waitlist`;
}

export function buildCoiffeurInterestBriefAr(): string {
  const intents = COIFFEUR_INQUIRY_INTENTS.map((i) => i.label).join('، ');
  return [
    `${COIFFEUR_BRAND_AR} — ملف موجز للمغادرة والمشاركة`,
    '',
    'ما هي المنصة',
    'سطح قطاعي نسائي تحت مظلة حلاق ماب. الاستعلام مجاني للمستعلمة. المنشأة تشتري رخصة نفاذ رقمية مسبقة الدفع. لا عمولة على الخدمة.',
    '',
    'الكيان والدفع',
    'الكيان التجاري والتوثيق وميسر على www.halaqmap.com. لا حساب تاجر منفصل لكوافير ماب.',
    '',
    'التعاقد',
    `طلب الانضمام: نفس فورم الشركاء مع سطح كوافير — /#${ROUTE_PATHS.COIFFEUR_REGISTER}`,
    'بعد اكتمال التعهدات يتم الدفع على نطاق حلاق ماب.',
    '',
    'أسعار حزمة الرخصة (30 يوماً، ريال سعودي، قبل ض.ق.م إن فُعّلت)',
    `برونزي ${TIER_MONTHLY_SAR[SubscriptionTier.BRONZE]}`,
    `ذهبي ${TIER_MONTHLY_SAR[SubscriptionTier.GOLD]}`,
    `ماسي ${TIER_MONTHLY_SAR[SubscriptionTier.DIAMOND]}`,
    `إضافة المكتب الخاص للماسي فقط +${DIGITAL_SHIFT_MONTHLY_ADDON_SAR}`,
    '',
    'فئات الاستعلام',
    intents,
    '',
    'رابط الاهتمام والتحديثات',
    coiffeurInterestPageUrl(),
  ].join('\n');
}
