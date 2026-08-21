/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لاونجا1 — تشغيل شاشات اللاونج. لا يُستورد من App.
 * السعر الافتتاحي 600 ر.س لثلاثة أشهر. مستقل عن الدعوة الحرة والزواج وبطاقة المناسبة.
 */
export const STORE_LOUNGE_LIVE_PUBLIC_ENABLED = true;

export const STORE_LOUNGE_LIVE_LAB_TOKEN = 'lounge-lab' as const;

export const STORE_LOUNGE_LIVE_PRODUCT = 'store_lounge_live' as const;

export const STORE_LOUNGE_LIVE_PRICE_SAR = 600 as const;
export const STORE_LOUNGE_LIVE_PRICE_HALALAS = 60000 as const;
export const STORE_LOUNGE_LIVE_DAYS = 90 as const;

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

export const STORE_LOUNGE_LIVE_CHECKOUT_ENABLED = envEnabled('VITE_STORE_LOUNGE_LIVE_CHECKOUT_ENABLED', true);

export const STORE_LOUNGE_LIVE_ACCENT = '#d4a574' as const;

export const STORE_LOUNGE_LIVE = {
  documentTitle: 'لاونجا1 — تشغيل شاشات اللاونج — خريطة الحل',
  kickerAr: 'شاشة اللاونج حيّة ثلاثة أشهر',
  titleAr: 'لاونجا1',
  leadAr:
    'منتج خاص باللاونجات: حزمة فعاليات تعرضونها على الشاشة، ولوحة تحكم لإدارتها، وروابط يوزّعها اللاونج على زبائنه لترحيبات باسمهم تظهر أمام الجميع. السعر الافتتاحي 600 ر.س لثلاثة أشهر، بلا أي تحصيل من الزائر غير سعر المنتج.',
  priceLineAr: '600 ر.س لثلاثة أشهر — شراء مرة واحدة',
  durationLineAr: 'بعد انتهاء المدة يبقى الرابط لديكم ويحوّلكم إلى هذه الصفحة لإعادة الشراء على نفس الشاشة.',
  hallStampAr: 'halaqmap · خريطة الحل',
  guestFormTitleAr: 'أرسل ترحيباً يظهر على شاشة اللاونج',
  guestNameLabelAr: 'اسمك',
  guestExtraLabelAr: 'سطر إضافي منك',
  guestSubmitAr: 'أظهر ترحيبي على الشاشة',
  guestOnlyHintAr: 'هكذا يرسل الزبون ترحيبه من جواله.',
  hostPanelTitleAr: 'لوحة تحكم اللاونج',
  hostAnnouncementLabelAr: 'تنويه على الشاشة',
  hostYoutubeLabelAr: 'رابط يوتيوب',
  hostYoutubeHideAr: 'حجب الفيديو وإظهار صورة الشاشة',
  hostYoutubeShowAr: 'إعادة عرض يوتيوب',
  hostWelcomeLabelAr: 'نص الترحيب على الشاشة',
  hostUploadPhotoAr: 'رفع صورة للشاشة',
  hostNameLabelAr: 'اسم المسؤول',
  loungeNameLabelAr: 'اسم اللاونج',
  eventPackTitleAr: 'فعاليات الشاشة',
  customEventLabelAr: 'اسم فعالية تضيفونها',
  customEventCtaAr: 'اعرض هذه الفعالية',
  orderCtaAr: 'اشترِ 600 ر.س لثلاثة أشهر',
  renewCtaAr: 'أعد الشراء 600 ر.س لثلاثة أشهر',
  orderEmailLabelAr: 'البريد لاستلام روابط الشاشة والضيف والمضيف',
  orderConsentAr: 'قرأت شروط الخدمة وأوافق على بدء التحصيل عبر ميسر. لا تحصيل من الزائر غير سعر هذا المنتج.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  tryCtaAr: 'عاين الشاشة الآن',
  displayLinkAr: 'شاشة اللاونج',
  guestLinkAr: 'رابط الزبون',
  hostLinkAr: 'لوحة المضيف',
  hallKickerAr: 'اللاونج على الشاشة',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldBodyAr:
    'شغّل شاشة اللاونج ثلاثة أشهر: فعاليات، لوحة تحكم، ورابط ترحيب باسم الزبون. السعر 600 ر.س مرة واحدة عبر ميسر على www.halaqmap.com. عند التجديد تبقى الروابط وتمتد المدة على الشاشة ذاتها. التفاصيل في شروط الخدمة.',
  labKickerAr: 'معاينة حيّة داخل الصفحة',
  labTitleAr: 'هكذا تظهر الشاشة لزبائن اللاونج',
  labLeadAr: 'اختَر فعالية، أرسل ترحيباً باسم الزبون، واكتب تنويهاً كما في ليلة التشغيل.',
  expiredTitleAr: 'انتهت مدة التشغيل',
  expiredLeadAr: 'الرابط ما زال لديكم. أتمّوا الشراء مرة أخرى لتمديد نفس الشاشة ثلاثة أشهر.',
} as const;

export const STORE_LOUNGE_LIVE_EVENTS = [
  {
    id: 'welcome',
    titleAr: 'ترحيب اللاونج',
    welcomeAr: 'حياكم الله في اللاونج. اكتبوا أسماءكم لتظهر الترحيبات على الشاشة.',
  },
  {
    id: 'birthday',
    titleAr: 'عيد ميلاد',
    welcomeAr: 'الليلة عيد ميلاد على الشاشة. باركوا لصاحب المناسبة باسمه ليظهر أمام الجميع.',
  },
  {
    id: 'cheers',
    titleAr: 'إهداء ترحيب',
    welcomeAr: 'أرسلوا ترحيباً باسمكم أو باسم من تودّون تكريمه. يظهر على الشاشة بلا أي دفع إضافي.',
  },
  {
    id: 'tonight',
    titleAr: 'افتتاحية الليلة',
    welcomeAr: 'افتتاحية هذه الليلة على الشاشة. شاركوا ترحيبكم ليُقرأ أمام الجميع.',
  },
  {
    id: 'custom',
    titleAr: 'فعالية من اللاونج',
    welcomeAr: 'فعالية يسمّيها اللاونج من لوحته وتعرض على الشاشة مع ترحيبات الزبائن.',
  },
] as const;

export type StoreLoungeLiveEventId = (typeof STORE_LOUNGE_LIVE_EVENTS)[number]['id'];

export function loungeLiveEventById(id: string) {
  return STORE_LOUNGE_LIVE_EVENTS.find((item) => item.id === id) || STORE_LOUNGE_LIVE_EVENTS[0];
}

export const STORE_LOUNGE_LIVE_CANNED = [
  { id: 'welcome', textAr: 'حياك الله، والشاشة ترحب بك في اللاونج.' },
  { id: 'birthday', textAr: 'عيد ميلاد سعيد، والليلة أجمل بوجودك.' },
  { id: 'mubarak', textAr: 'ألف مبارك، ليلة سعيدة وكل عام وأنتم بخير.' },
] as const;

export const STORE_LOUNGE_LIVE_DEMO = {
  loungeName: 'لاونج النخيل',
  hostName: 'الإدارة',
  activeEventId: 'welcome' as StoreLoungeLiveEventId,
  customEventTitle: '',
  welcomeAr: STORE_LOUNGE_LIVE_EVENTS[0].welcomeAr,
  youtubeUrl: '',
  youtubeHidden: true,
  announcement: '',
  photoSrc: '/images/store/lab/lab-lounge-interior.jpg',
  panoramaSrc: '/images/store/lab/lab-lounge-interior.jpg',
} as const;
