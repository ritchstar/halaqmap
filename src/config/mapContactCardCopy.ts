/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقة تواصل ماب — أداة نمو عضوي (بلا صور شخصية).
 */
export const MAP_CONTACT_CARD_PRODUCT_NAME_AR = 'بطاقة تواصل ماب' as const;
export const MAP_CONTACT_CARD_ROUTE = '/map-contact-card' as const;

export const MAP_CONTACT_CARD_META = {
  titleAr: 'بطاقة تواصل ماب — بطاقتك لدعوة أي صالون',
  descriptionAr:
    'صمّم بطاقتك المفضلة واحفظها على جهازك، ثم أرسلها واتساب أو سناب أو أي منصة لدعوة أي صالون حلاقة لمسار الشركاء — بلا صور شخصية.',
} as const;

export const MAP_CONTACT_CARD_LEAD_AR =
  'احتفظ ببطاقتك الخاصة: حمّلها كصورة، احفظها كمفضلة على جهازك، وأرسلها واتساب أو سناب أو أي منصة — لدعوة أي صالون حلاقة يظهر على حلاق ماب. بلا صور شخصية — أيقونة + ختم مدينة + رمز QR لمسار الشركاء.' as const;

export const MAP_CONTACT_CARD_CTA_AR = 'بطاقة تواصل ماب' as const;
export const MAP_CONTACT_CARD_CTA_HINT_AR = 'بطاقتك المفضلة — ادعُ أي صالون' as const;

export const MAP_CONTACT_CARD_KEEP_HINT_AR =
  'البطاقة ملكك: احفظها مرّة، وأعد إرسالها لأي صالون تفضّله. الرابط والـ QR يوجّهان لمسار الشركاء.' as const;

export const MAP_CONTACT_CARD_FAVORITE_SAVED_AR = 'حُفظت كبطاقتك المفضلة على هذا الجهاز' as const;
export const MAP_CONTACT_CARD_DOWNLOAD_HINT_AR =
  'حمّل الصورة إلى الاستوديو ثم شاركها من سناب أو إنستقرام أو أي تطبيق.' as const;

export const MAP_CONTACT_CARD_FILTER_LABEL_AR = 'بطاقة تواصل' as const;

/** قوالب رسالة قابلة للتعديل */
export const MAP_CONTACT_MESSAGE_TEMPLATES = [
  {
    id: 'prefer-platform',
    labelAr: 'أفضل التواصل عبر المنصة',
    textAr: 'أبي أتواصل معكم عبر حلاق ماب — المنصة تبرزكم بأفضل الطرق وأرغب بالتواصل من خلالها.',
  },
  {
    id: 'find-you',
    labelAr: 'أبي ألاقيكم من موقعي',
    textAr: 'أبحث عنكم من موقعي على حلاق ماب — فعّلوا ظهوركم عشان ألاقيكم وأتواصل معكم بسهولة.',
  },
  {
    id: 'loyal',
    labelAr: 'عميل يفضّل القناة',
    textAr: 'عميل يفضّل التواصل عبر حلاق ماب. بطاقة تواصل ماب — انضموا عشان نكمل معنا من هناك.',
  },
  {
    id: 'best-search',
    labelAr: 'أفضل البحث عبر حلاق ماب',
    textAr: 'أفضل البحث عبر حلاق ماب. أتمنى أشوف صالونكم ظاهر هناك وأتواصل معكم من المنصة.',
  },
] as const;

/** أيقونات تعبيرية محدودة — بلا صور أشخاص */
export const MAP_CONTACT_ICON_OPTIONS = [
  { id: 'scissors', labelAr: 'مقص', glyph: '✂️' },
  { id: 'pin', labelAr: 'موقع', glyph: '📍' },
  { id: 'star', labelAr: 'تقييم', glyph: '⭐' },
  { id: 'crescent', labelAr: 'هلال', glyph: '🌙' },
  { id: 'flag', labelAr: 'علم', glyph: '🇸🇦' },
  { id: 'spark', labelAr: 'لمعة', glyph: '✦' },
] as const;

/** أختام مدن مزخرفة — أبرز المدن أولاً */
export const MAP_CONTACT_CITY_SEALS = [
  { id: 'riyadh', nameAr: 'الرياض' },
  { id: 'jeddah', nameAr: 'جدة' },
  { id: 'makkah', nameAr: 'مكة' },
  { id: 'madinah', nameAr: 'المدينة' },
  { id: 'dammam', nameAr: 'الدمام' },
  { id: 'khobar', nameAr: 'الخبر' },
  { id: 'taif', nameAr: 'الطائف' },
  { id: 'tabuk', nameAr: 'تبوك' },
  { id: 'abha', nameAr: 'أبها' },
  { id: 'buraidah', nameAr: 'بريدة' },
  { id: 'hail', nameAr: 'حائل' },
  { id: 'jazan', nameAr: 'جازان' },
  { id: 'najran', nameAr: 'نجران' },
  { id: 'neom', nameAr: 'نيوم' },
] as const;

export const MAP_CONTACT_WHATSAPP_INTRO_AR =
  'السلام عليكم، هذه بطاقة تواصل ماب من زبون يرغب بالتواصل عبر المنصة:' as const;

export const MAP_CONTACT_PRIVACY_NOTE_AR =
  'لا نطلب ولا نخزّن صوراً شخصية. البطاقة تعتمد على اسم مستعار وأيقونة وختم مدينة فقط.' as const;

export function buildMapContactPartnerUrl(origin: string, cityId: string): string {
  const base = origin.replace(/\/+$/, '');
  const u = new URL(`${base}/partners/interest`);
  u.searchParams.set('ref', 'map-contact-card');
  if (cityId) u.searchParams.set('city', cityId);
  return u.toString();
}

export function buildMapContactWhatsAppText(opts: {
  alias: string;
  message: string;
  cityNameAr: string;
  partnerUrl: string;
}): string {
  const alias = opts.alias.trim() || 'زائر';
  return [
    MAP_CONTACT_WHATSAPP_INTRO_AR,
    '',
    `من: ${alias}`,
    `المدينة: ${opts.cityNameAr}`,
    '',
    opts.message.trim(),
    '',
    `رابط الانضمام / الظهور: ${opts.partnerUrl}`,
  ].join('\n');
}
