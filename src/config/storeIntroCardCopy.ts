/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * كروت تعريفية وتسويقية لواجهة متجر halaqmap — خريطة الحل.
 * لا تُخلط بكاردي8 ولا بتهنئة المناسبات ولا بكروت كوافير ماب.
 * يُحمَّل كسولاً مع صفحة الاستوديو، لا يُستورد من App.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';
import { encodeStoreIntroCardToken } from '@/lib/storeIntroCardShare';
import {
  STORE_BRAND_LATIN,
  STORE_ORIGIN,
  STORE_PUBLIC_NAME_AR,
  STORE_SATELLITE_HOST,
} from '@/config/storeFront';

export const STORE_INTRO_CARD_NAME_MAX = 40;
export const STORE_INTRO_CARD_ROLE_MAX = 48;
export const STORE_INTRO_CARD_SHARE_ASPECT = '4 / 5' as const;

/** أسماء المنتجات الرسمية على الكرت — كل اسم معزول حتى لا ينفصل الرقم. بلا كاردي8. */
export const STORE_INTRO_CARD_SECTORS = [
  'افراحي1',
  'اجواء1',
  'تمويناتا1',
  'لاونجا1',
  'مطعمنا1',
] as const;

/** أضف صنفاً هنا لاحقاً دون تغيير الواجهة */
export const STORE_INTRO_CARD_ROLES = [
  { id: 'owner', labelAr: 'المالك' },
  { id: 'gm_sales', labelAr: 'المدير العام للتسويق والمبيعات' },
  { id: 'lead_m', labelAr: 'رئيس مجموعة تسويقية' },
  { id: 'lead_f', labelAr: 'رئيسة مجموعة تسويقية' },
  { id: 'marketer_m', labelAr: 'مسوق' },
  { id: 'marketer_f', labelAr: 'مسوقة' },
  { id: 'honorary', labelAr: 'عضوية فخرية' },
] as const;

export type StoreIntroCardRoleId = (typeof STORE_INTRO_CARD_ROLES)[number]['id'];

const FEMALE_ROLE_IDS = new Set<StoreIntroCardRoleId>(['lead_f', 'marketer_f']);

export const STORE_INTRO_CARD_COPY = {
  documentTitleStudio: 'كروت تعريفية — خريطة الحل',
  documentTitleView: 'خريطة الحل',
  studioKicker: 'بطاقة تعريف وتسويق لواجهة المتجر',
  studioTitle: 'كروت خريطة الحل',
  studioLead:
    'اكتب الاسم أو اللقب والصفة، ثم ولّد البطاقة وأرسلها عبر واتساب أو أي منصة. من يضغط البطاقة يدخل واجهة المتجر.',
  nameLabel: 'الاسم / اللقب',
  namePlaceholder: 'مثال: فهد',
  roleLabel: 'الصفة',
  rolePlaceholder: 'مثال: مسوق',
  previewHint: 'هكذا تظهر البطاقة في واتساب قبل الإرسال',
  generateHint:
    'زر واتساب يرفق صورة البطاقة كاملة مع الرابط. الاسم والصفة يظهران على الكرت فقط.',
  downloadCta: 'تحميل الصورة',
  downloadReady: 'تم تجهيز الصورة.',
  downloadIosHint: 'اضغط الصورة مطولاً ثم احفظها في الجهاز.',
  shareCta: 'مشاركة',
  whatsappCta: 'واتساب',
  whatsappReady: 'أرسل الصورة من واتساب — البطاقة تظهر كاملة في المحادثة.',
  whatsappFallback: 'حُمّلت صورة البطاقة. أرفقها في واتساب مع الرسالة حتى تظهر كاملة دون قصّ.',
  copyLinkCta: 'نسخ رابط البطاقة',
  openPreviewCta: 'فتح البطاقة',
  tapHint: 'اضغط البطاقة لدخول واجهة المتجر',
  scanHint: 'امسح الرمز لدخول واجهة المتجر',
  needFields: 'اكتب الاسم والصفة أولاً.',
  headline: 'واجهة المتجر الإلكتروني',
  tagline: 'منتجات برمجية جاهزة — من الواجهة بلا تطبيق',
  cta: 'ادخل خريطة الحل',
  ctaFemale: 'ادخلي خريطة الحل',
  privacyLine: 'الاسم والصفة يظهران على البطاقة فقط، ولا يُحفظان على الخادم.',
  landingDoorTitleAr: 'كروت تعريفية وتسويقية',
  landingDoorLeadAr:
    'بطاقة باسمك وصفتك لواجهة المتجر. المالك، المجموعة التسويقية، المسوقون، والعضوية الفخرية.',
  landingDoorCtaAr: 'افتح استوديو الكروت',
} as const;

export function storeIntroCardRoleByLabel(role: string) {
  const label = role.trim();
  return STORE_INTRO_CARD_ROLES.find((item) => item.labelAr === label) || null;
}

export function storeIntroCardCta(role: string): string {
  const found = storeIntroCardRoleByLabel(role);
  if (found && FEMALE_ROLE_IDS.has(found.id)) return STORE_INTRO_CARD_COPY.ctaFemale;
  return STORE_INTRO_CARD_COPY.cta;
}

export function storeIntroCardPitch(role: string): {
  kicker: string | null;
  headline: string;
  tagline: string;
  invite: string | null;
} {
  const found = storeIntroCardRoleByLabel(role);
  if (found?.id === 'honorary') {
    return {
      kicker: 'عضوية فخرية',
      headline: STORE_INTRO_CARD_COPY.headline,
      tagline: STORE_INTRO_CARD_COPY.tagline,
      invite: 'بطاقة عضوية فخرية من واجهة المتجر',
    };
  }
  if (found?.id === 'owner' || found?.id === 'gm_sales') {
    return {
      kicker: 'بطاقة تعريف رسمية',
      headline: STORE_INTRO_CARD_COPY.headline,
      tagline: STORE_INTRO_CARD_COPY.tagline,
      invite: null,
    };
  }
  if (found?.id === 'lead_m' || found?.id === 'lead_f') {
    return {
      kicker: 'المجموعة التسويقية',
      headline: STORE_INTRO_CARD_COPY.headline,
      tagline: STORE_INTRO_CARD_COPY.tagline,
      invite: found.id === 'lead_f' ? 'بطاقة تعريف من رئيسة المجموعة التسويقية' : 'بطاقة تعريف من رئيس المجموعة التسويقية',
    };
  }
  return {
    kicker: null,
    headline: STORE_INTRO_CARD_COPY.headline,
    tagline: STORE_INTRO_CARD_COPY.tagline,
    invite: null,
  };
}

export function storeIntroCardCenteredNameClass(name: string): string {
  const len = Array.from(name.trim()).length;
  if (len <= 10) return 'text-xl';
  if (len <= 18) return 'text-lg';
  if (len <= 28) return 'text-base';
  return 'text-sm';
}

export function storeIntroCardOrigin(): string {
  if (typeof window === 'undefined') return STORE_ORIGIN;
  const host = window.location.hostname.toLowerCase();
  if (host === STORE_SATELLITE_HOST || host.endsWith('.halaqmap.com')) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return STORE_ORIGIN;
}

const STORE_LANDING_PATH =
  (ROUTE_PATHS as { STORE_LANDING?: string }).STORE_LANDING || '/store';
const STORE_INTRO_CARD_VIEW_PATH =
  (ROUTE_PATHS as { STORE_INTRO_CARD_VIEW?: string }).STORE_INTRO_CARD_VIEW || '/store/id-card';

export function storeIntroCardLandingUrl(): string {
  const origin = storeIntroCardOrigin();
  return `${origin}${STORE_LANDING_PATH}`;
}

export function storeIntroCardPublicUrl(name: string, role: string): string {
  const origin = storeIntroCardOrigin();
  const token = encodeStoreIntroCardToken(name, role);
  if (!token) return `${origin}${STORE_LANDING_PATH}`;
  return `${origin}${STORE_INTRO_CARD_VIEW_PATH}?c=${encodeURIComponent(token)}`;
}

export function buildStoreIntroCardWhatsAppText(input: {
  name: string;
  role: string;
  cardUrl: string;
}): string {
  const pitch = storeIntroCardPitch(input.role);
  const lines = [
    STORE_PUBLIC_NAME_AR,
    STORE_BRAND_LATIN,
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

export { STORE_BRAND_LATIN, STORE_PUBLIC_NAME_AR, STORE_SATELLITE_HOST };
