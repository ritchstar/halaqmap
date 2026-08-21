/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * كروت كوافير ماب للمشاركة — عبارات للمستعلمة فقط، بلا أسماء منتجات داخلية.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';
import { encodeCoiffeurCardToken } from '@/lib/coiffeurCardShare';
import {
  COIFFEUR_BRAND_AR,
  COIFFEUR_BRAND_EN,
  COIFFEUR_SATELLITE_HOST,
} from '@/config/coiffeurMapUmbrella';

export const COIFFEUR_CARD_NAME_MAX = 40;
export const COIFFEUR_CARD_ROLE_MAX = 36;

/** نسبة واتساب الظاهرة في المحادثة دون قصّ أعلى البطاقة */
export const COIFFEUR_CARD_SHARE_ASPECT = '4 / 5' as const;

export const COIFFEUR_CARD_MARKETING_LEAD_ROLE = 'رئيسة مجموعة تسويقية' as const;

export const COIFFEUR_INTRO_CARD_COPY = {
  documentTitleStudio: 'كروت كوافير ماب — بطاقة للمشاركة',
  documentTitleView: 'كوافير ماب',
  studioKicker: 'بطاقة برمجية للمشاركة',
  studioTitle: 'كروت كوافير ماب',
  studioLead:
    'اكتبي الاسم أو اللقب والصفة، ثم ولّدي البطاقة وأرسليها عبر واتساب أو أي منصة. من يضغط البطاقة يدخل كوافير ماب.',
  studioLeadMarketing:
    'بطاقة انطلاق رئيسة المجموعة التسويقية: الاسم والصفة يظهران كاملين في واتساب، ومن تضغط البطاقة تدخل كوافير ماب.',
  nameLabel: 'الاسم / اللقب',
  namePlaceholder: 'مثال: نورة',
  roleLabel: 'الصفة',
  rolePlaceholder: 'مثال: صديقة',
  previewHint: 'هكذا تظهر البطاقة في واتساب قبل الإرسال',
  generateHint:
    'زر واتساب يرفق صورة البطاقة كاملة مع الرابط. المعاينة على الرابط مربّعة بالاسم والصفة حتى لا يُقصّ أعلى الكرت.',
  downloadCta: 'تحميل الصورة',
  shareCta: 'مشاركة',
  whatsappCta: 'واتساب',
  whatsappReady: 'أرسلي الصورة من واتساب — البطاقة تظهر كاملة في المحادثة.',
  whatsappFallback:
    'حُمّلت صورة البطاقة. أرفقيها في واتساب مع الرسالة حتى تظهر كاملة دون قصّ.',
  copyLinkCta: 'نسخ رابط البطاقة',
  openPreviewCta: 'فتح البطاقة',
  tapHint: 'اضغطي البطاقة لدخول كوافير ماب',
  scanHint: 'امسحي الرمز لدخول كوافير ماب',
  needFields: 'اكتبي الاسم والصفة أولاً.',
  headline: 'أقرب مشغل يناسبك',
  tagline: 'استعلمي من موقعك — مجاناً وبلا تطبيق',
  sectors: 'كوافير · تجميل · سبا · مكياج',
  cta: 'ادخلي كوافير ماب',
  privacyLine: 'الاسم والصفة يظهران على البطاقة فقط، ولا يُحفظان على الخادم.',
  marketingKicker: 'بداية المجموعة التسويقية',
  marketingHeadline: 'أدعوك إلى كوافير ماب',
  marketingInvite: 'بطاقة تعريف من رئيسة المجموعة التسويقية',
} as const;

export function coiffeurCardCenteredNameClass(name: string): string {
  const len = Array.from(name.trim()).length;
  if (len <= 10) return 'text-xl';
  if (len <= 18) return 'text-lg';
  if (len <= 28) return 'text-base';
  return 'text-sm';
}

export function isCoiffeurMarketingLeadRole(role: string): boolean {
  return role.trim() === COIFFEUR_CARD_MARKETING_LEAD_ROLE;
}

export function coiffeurCardPitch(role: string): {
  kicker: string | null;
  headline: string;
  tagline: string;
  invite: string | null;
} {
  if (isCoiffeurMarketingLeadRole(role)) {
    return {
      kicker: COIFFEUR_INTRO_CARD_COPY.marketingKicker,
      headline: COIFFEUR_INTRO_CARD_COPY.marketingHeadline,
      tagline: COIFFEUR_INTRO_CARD_COPY.tagline,
      invite: COIFFEUR_INTRO_CARD_COPY.marketingInvite,
    };
  }
  return {
    kicker: null,
    headline: COIFFEUR_INTRO_CARD_COPY.headline,
    tagline: COIFFEUR_INTRO_CARD_COPY.tagline,
    invite: null,
  };
}

/** اختصارات للصفة — يمكن استبدالها بنص حر */
export const COIFFEUR_CARD_ROLE_CHIPS = [
  COIFFEUR_CARD_MARKETING_LEAD_ROLE,
  'مسوّقة',
  'مستعلمة',
  'صديقة',
  'أخت',
  'زميلة',
  'صاحبة مشغل',
  'خبيرة تجميل',
  'مديرة صالون',
] as const;

export function coiffeurSatelliteOrigin(): string {
  if (typeof window === 'undefined') {
    return `https://${COIFFEUR_SATELLITE_HOST}`;
  }
  const host = window.location.hostname.toLowerCase();
  if (host === COIFFEUR_SATELLITE_HOST || host.endsWith('.halaqmap.com')) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return `https://${COIFFEUR_SATELLITE_HOST}`;
}

/** هبوط المنصة — مقصد الضغط ومسح الرمز */
export function coiffeurCardLandingUrl(): string {
  const origin = coiffeurSatelliteOrigin();
  const q = 'utm_source=intro_card&utm_medium=share&utm_campaign=coiffeur_card';
  return `${origin}/#${ROUTE_PATHS.COIFFEUR_LANDING}?${q}`;
}

export function coiffeurCardPublicUrl(name: string, role: string): string {
  const origin = coiffeurSatelliteOrigin();
  const token = encodeCoiffeurCardToken(name, role);
  if (!token) return `${origin}/#${ROUTE_PATHS.COIFFEUR_LANDING}`;
  return `${origin}${ROUTE_PATHS.COIFFEUR_CARD_SHARE}/${token}`;
}

export function buildCoiffeurCardWhatsAppText(input: {
  name: string;
  role: string;
  cardUrl: string;
}): string {
  const pitch = coiffeurCardPitch(input.role);
  const lines = [
    COIFFEUR_BRAND_AR,
    input.name,
    input.role,
    '',
    pitch.headline,
    pitch.tagline,
  ];
  if (pitch.invite) lines.push(pitch.invite);
  lines.push('', input.cardUrl);
  return lines.join('\n');
}

export { COIFFEUR_BRAND_AR, COIFFEUR_BRAND_EN, COIFFEUR_SATELLITE_HOST };
