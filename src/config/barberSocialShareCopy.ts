import type { SubscriptionTier } from '@/lib/index';
import { SubscriptionTier as Tier } from '@/lib/index';

export type BarberShareTemplateId =
  | 'map_presence'
  | 'rating_invite'
  | 'partner_technical'
  | 'home_service';

export type BarberSocialPlatformId = 'instagram' | 'facebook' | 'x' | 'whatsapp';

export type BarberShareCardFormatId = 'square' | 'story';

export type BarberShareTemplateMeta = {
  id: BarberShareTemplateId;
  labelAr: string;
  headlineAr: string;
  sublineAr: string;
  cardKickerAr: string;
  cardFooterAr: string;
  /** يظهر فقط عند تفعيل زيارة منزلية (ذهبي/ماسي) */
  requiresHomeService?: boolean;
};

export const BARBER_SOCIAL_SHARE_KIT = {
  tabTitle: 'شارك ظهورك',
  lede:
    'منشور جاهز لحساباتك على فيسبوك وإنستقرام و`X` — نص + بطاقة مربعة 1080×1080 أو Story 1080×1920. شارك ظهور صالونك على المنصة بصيغة احترافية.',
  optionalNote: 'المشاركة اختيارية — تساعد عملاءك على إيجادك عبر الاستعلام الجغرافي على حلاق ماب.',
  instagramHint:
    'انستقرام لا يسمح بالنشر المباشر من المتصفح — حمّل صورة `Story` 1080×1920، انسخ النص، ثم أنشئ من تطبيق انستقرام.',
  storyHint:
    'صيغة Story 1080×1920 مناسبة لإنستقرام و`Facebook Stories` — المناطق العلوية والسفلية مُراعاة لتجنب تغطية واجهة التطبيق.',
} as const;

export const BARBER_SHARE_FORMAT_OPTIONS: readonly {
  id: BarberShareCardFormatId;
  labelAr: string;
  descriptionAr: string;
}[] = [
  {
    id: 'square',
    labelAr: 'منشور مربع',
    descriptionAr: '1080×1080 — Instagram · Facebook · X',
  },
  {
    id: 'story',
    labelAr: 'Story',
    descriptionAr: '1080×1920 — Instagram · Facebook Stories',
  },
] as const;

export const BARBER_SHARE_TEMPLATES: readonly BarberShareTemplateMeta[] = [
  {
    id: 'map_presence',
    labelAr: 'ظهور على الخريطة',
    headlineAr: 'تجدوننا على حلاق ماب',
    sublineAr: 'استعلم عن الحلاقين في منطقتك وتواصل مباشرة — بدون وسيط.',
    cardKickerAr: 'شريك على المنصة',
    cardFooterAr: 'امسح الرمز أو افتح الرابط للاستعلام',
  },
  {
    id: 'rating_invite',
    labelAr: 'دعوة التقييم',
    headlineAr: 'قيّم تجربتك معنا',
    sublineAr: 'رأيك يساعدنا على تحسين الخدمة ويظهر لعملاء جدد قد يصلون عبر المنصة.',
    cardKickerAr: 'تقييم عبر حلاق ماب',
    cardFooterAr: 'امسح الرمز لصفحة التقييم الآمنة',
  },
  {
    id: 'partner_technical',
    labelAr: 'شريك تقني',
    headlineAr: 'صالوننا على حلاق ماب',
    sublineAr: 'شريك تقني في الظهور والاستجابة — أنت تقود التشغيل ونحن نوفّر الرخصة الرقمية.',
    cardKickerAr: 'حلاق ماب · شريك تقني',
    cardFooterAr: 'تعرّف على المنصة عبر الرابط',
  },
  {
    id: 'home_service',
    labelAr: 'طلب تواصل — زيارة',
    headlineAr: 'خدمة زيارة منزلية',
    sublineAr: 'للتواصل وترتيب الزيارة — طلب تواصل عبر المنصة، وليس حجزاً آلياً.',
    cardKickerAr: 'طلب تواصل · ذهبي/ماسي',
    cardFooterAr: 'تواصل عبر حلاق ماب',
    requiresHomeService: true,
  },
] as const;

export const BARBER_SOCIAL_PLATFORMS: readonly {
  id: BarberSocialPlatformId;
  labelAr: string;
}[] = [
  { id: 'instagram', labelAr: 'Instagram' },
  { id: 'facebook', labelAr: 'Facebook' },
  { id: 'x', labelAr: 'X' },
  { id: 'whatsapp', labelAr: 'WhatsApp' },
] as const;

function tierHashtag(tier: SubscriptionTier): string {
  if (tier === Tier.GOLD) return '#حلاق_ذهبي';
  if (tier === Tier.DIAMOND) return '#حلاق_ماسي';
  return '#حلاق_ماب';
}

export function buildBarberShareHashtags(input: {
  salonName: string;
  tier: SubscriptionTier;
  cityLabel?: string;
}): string {
  const cityTag = input.cityLabel
    ? `#${input.cityLabel.replace(/\s+/g, '_').replace(/[^\w\u0600-\u06FF_]/g, '')}`
    : '';
  const parts = ['#حلاق_ماب', '#حلاق', tierHashtag(input.tier), cityTag].filter(Boolean);
  return parts.join(' ');
}

export function buildBarberShareCaption(input: {
  templateId: BarberShareTemplateId;
  platform: BarberSocialPlatformId;
  salonName: string;
  tier: SubscriptionTier;
  shareUrl: string;
  cityLabel?: string;
}): string {
  const template = BARBER_SHARE_TEMPLATES.find((t) => t.id === input.templateId);
  const salon = input.salonName.trim() || 'صالوننا';
  const city = input.cityLabel?.trim();
  const cityLine = city ? `\n📍 ${city}` : '';
  const tags = buildBarberShareHashtags({
    salonName: salon,
    tier: input.tier,
    cityLabel: city,
  });

  const baseByTemplate: Record<BarberShareTemplateId, string> = {
    map_presence: `صالون ${salon} متاح على حلاق ماب 📍\nاستعلم عن الحلاقين في منطقتك وتواصل مباشرة.${cityLine}\n\n${input.shareUrl}`,
    rating_invite: `زرت صالون ${salon}؟ قيّم تجربتك عبر حلاق ماب ⭐\nرأيك يساعد عملاء جدد على الوصول.${cityLine}\n\n${input.shareUrl}`,
    partner_technical: `صالون ${salon} — شريك تقني على حلاق ماب ✂️\nظهور واستجابة عند الطلب؛ أنت تقود التشغيل.${cityLine}\n\n${input.shareUrl}`,
    home_service: `صالون ${salon} — طلب تواصل للزيارة المنزلية 🏠\nتواصل عبر المنصة لترتيب الزيارة (طلب تواصل — ليس حجزاً آلياً).${cityLine}\n\n${input.shareUrl}`,
  };

  let body = baseByTemplate[input.templateId] ?? baseByTemplate.map_presence;

  if (input.platform === 'x') {
    const short = `${salon} على حلاق ماب 📍 — استعلم وتواصل مباشرة.\n${input.shareUrl}`;
    return short.length <= 280 ? short : `${salon} · حلاق ماب\n${input.shareUrl}`;
  }

  if (input.platform === 'whatsapp') {
    body = body.replace(/\n\n/g, '\n');
  }

  if (input.platform === 'instagram' || input.platform === 'facebook') {
    body = `${body}\n\n${tags}`;
  }

  return body.trim();
}

export function subscriptionTierShareLabelAr(tier: SubscriptionTier): string {
  if (tier === Tier.GOLD) return 'ذهبي';
  if (tier === Tier.DIAMOND) return 'ماسي';
  return 'برونزي';
}
