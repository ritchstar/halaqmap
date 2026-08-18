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

export const COIFFEUR_INTRO_CARD_COPY = {
  documentTitleStudio: 'كروت كوافير ماب — بطاقة للمشاركة',
  documentTitleView: 'كوافير ماب',
  studioKicker: 'بطاقة برمجية للمشاركة',
  studioTitle: 'كروت كوافير ماب',
  studioLead:
    'اكتبي الاسم أو اللقب والصفة، ثم ولّدي البطاقة وأرسليها عبر واتساب أو أي منصة. من يضغط البطاقة يدخل كوافير ماب.',
  nameLabel: 'الاسم / اللقب',
  namePlaceholder: 'مثال: نورة',
  roleLabel: 'الصفة',
  rolePlaceholder: 'مثال: صديقة',
  previewHint: 'هكذا تظهر البطاقة قبل الإرسال',
  generateHint:
    'الرابط المختصر يظهر في واتساب بصورة كوافير ماب. حمّلي الصورة أيضاً إن أردت إرسالها مع الرسالة.',
  downloadCta: 'تحميل الصورة',
  shareCta: 'مشاركة',
  whatsappCta: 'واتساب',
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
} as const;

/** اختصارات للصفة — يمكن استبدالها بنص حر */
export const COIFFEUR_CARD_ROLE_CHIPS = [
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
  return [
    COIFFEUR_BRAND_AR,
    input.name,
    input.role,
    '',
    COIFFEUR_INTRO_CARD_COPY.tagline,
    '',
    input.cardUrl,
  ].join('\n');
}

export { COIFFEUR_BRAND_AR, COIFFEUR_BRAND_EN, COIFFEUR_SATELLITE_HOST };
