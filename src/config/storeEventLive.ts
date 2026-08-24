/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دعوة حرة تفاعلية — لا يُستورد من App.
 * السعر الافتتاحي 899 ر.س. مستقلة عن دعوة الزواج وعن بطاقة المناسبة.
 */
export const STORE_EVENT_LIVE_PUBLIC_ENABLED = true;

export const STORE_EVENT_LIVE_LAB_TOKEN = 'event-lab' as const;
export const STORE_EVENT_LIVE_LAB_TOKEN_WOMEN = 'event-lab-women' as const;

export type StoreEventLiveVoice = 'men' | 'women';

export const STORE_EVENT_LIVE_PRODUCT = 'store_event_live' as const;

export const STORE_EVENT_LIVE_PRICE_SAR = 899 as const;
export const STORE_EVENT_LIVE_PRICE_HALALAS = 89900 as const;

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

export const STORE_EVENT_LIVE_CHECKOUT_ENABLED = envEnabled('VITE_STORE_EVENT_LIVE_CHECKOUT_ENABLED', true);

export const STORE_EVENT_LIVE = {
  documentTitle: 'اجواء1 — خريطة الحل',
  kickerAr: 'منصة احتفالية رقمية لمناسبتك',
  titleAr: 'اجواء1',
  leadAr:
    'حوّل دعوة مناسبتك التقليدية إلى منصة احتفالية رقمية. لا تقتصر على تفاصيل الحفل فحسب، بل تصنع تجربة حية يشارك فيها الضيوف التهاني لتُعرض على شاشة القاعة.',
  priceLineAr: 'السعر الافتتاحي 899 ر.س',
  hallStampAr: 'خريطة الحل - halaqmap',
  guestFormTitleAr: 'أرسل تهنئة تظهر على الشاشة',
  guestNameLabelAr: 'اسمك',
  guestExtraLabelAr: 'سطر إضافي من قلبك',
  guestSubmitAr: 'أظهر تهنئتي على القاعة',
  guestOnlyHintAr: 'هكذا يرى المدعو الدعوة على جواله.',
  guestDeviceLockAr: 'رابطكم صدر من لوحة المضيف ويُربط بهذا الجهاز فقط. إعادة إرساله من مدعو تُحظر.',
  resentPreviewKickerAr: 'نظام الأمان ومنع التداول (رابط مُستخدَم)',
  resentPreviewCaptionAr:
    'معاينة الصفحة التنبيهية التي تظهر للزائر في حال فتح رابط تم تحويله أو إعادة إرساله من شخص آخر لحماية خصوصية المناسبة.',
  hostInviteTitleAr: 'لوحة إرسال روابط المدعوين',
  hostInviteLeadAr: 'جهّزوا من هذه اللوحة ما يكفي مناسبتكم من الروابط الخاصة. كل رابط لمدعو واحد. أرسلوا من واتساب جهازكم.',
  hostInviteCtaAr: 'جهّز دفعة روابط',
  hostPanelTitleAr: 'لوحة تحكم الحفل',
  hostAnnouncementLabelAr: 'تنويه على الشاشة',
  hostYoutubeLabelAr: 'رابط يوتيوب',
  hostYoutubeHideAr: 'حجب الفيديو وإظهار البانوراما',
  hostYoutubeShowAr: 'إعادة عرض يوتيوب',
  hostWelcomeLabelAr: 'نص الترحيب',
  hostAudioLabelAr: 'صوت القاعة',
  hostUploadPhotoAr: 'رفع صورة للقاعة أو الكرت',
  hostUploadPanoramaAr: 'رفع صورة بانورامية',
  hostRoleLabelAr: 'صفة الداعي',
  hostNameLabelAr: 'اسم الداعي',
  occasionLabelAr: 'اسم المناسبة',
  eventDateLabelAr: 'تاريخ الحفل',
  eventTimeLabelAr: 'وقت الاستقبال',
  venueKindLabelAr: 'نوع المكان',
  venueNameLabelAr: 'اسم المكان',
  venueMapsLabelAr: 'رابط موقع الحفل',
  venueMapsHintAr: 'انسخ رابط الموقع',
  downloadGoldAr: 'تحميل الكرت الذهبي',
  downloadIvoryAr: 'تحميل الكرت العاجي',
  archiveCtaAr: 'حفظ أرشيف الصفحة',
  orderCtaAr: 'ادفع 899 ر.س وافتح الدعوة',
  orderEmailLabelAr: 'البريد لاستلام الروابط السرية',
  orderConsentAr: 'قرأت شروط الخدمة وأوافق على بدء التحصيل عبر بوابة الدفع.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  tryCtaAr: 'ابدأ التجربة الآن',
  displayLinkAr: 'شاشة القاعة',
  guestLinkAr: 'تجربة الضيف',
  hostLinkAr: 'تجربة المضيف',
  mapsLabelAr: 'موقع الحفل',
  hallKickerAr: 'مناسبة خاصة',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldBodyAr:
    'قاعة حفل حيّة لمناسبة تسميها بنفسك: تهاني، صور أو يوتيوب، وكرت الدعوة. السعر 899 ر.س، والدفع عبر بوابة الدفع الآمنة. روابط المدعوين تصدر من لوحة المضيف فقط؛ كل رابط لمدعو واحد وجهاز واحد، وإعادة إرساله من مدعو تُحظر. حماية الخصوصية الصارمة هي منطلق النموذج. التفاصيل في شروط الخدمة.',
  hubKickerAr: 'صنّف الدعوة من البداية',
  hubTitleAr: 'اجواء1',
  hubLeadAr:
    'قاعة مناسبة حيّة تسميها أنت. اختر الشق الرجالي أو النسائي أولاً؛ الستايل يسري على الكرت والقاعة ولوحة التحكم.',
  hubMenTitleAr: 'دعوة رجالية',
  hubMenLeadAr: 'لحفل خاص ينشئه الداعي: أمسية، تخرج، تكريم أو أي مناسبة يسميها بنفسه.',
  hubMenCtaAr: 'افتح الشق الرجالي',
  hubWomenTitleAr: 'دعوة نسائية',
  hubWomenLeadAr: 'لحفل خاص تنشئه الداعية: أمسية نسائية، جلسة، تخرج أو أي مناسبة تسميها بنفسها.',
  hubWomenCtaAr: 'افتح الشق النسائي',
  labKickerAr: 'معاينة حيّة داخل الصفحة',
  labTitleAr: 'عش التجربة كما سيعيشها ضيوفك',
  labLeadAr: 'سمِّ مناسبتك، شغّل يوتيوب، ارفع صورة، اكتب تنويهاً، وأرسل تهنئة.',
} as const;

export const STORE_EVENT_LIVE_WOMEN = {
  documentTitle: 'اجواء1 نسائي — خريطة الحل',
  kickerAr: 'منصة احتفالية رقمية لمناسبتكن',
  titleAr: 'اجواء1 نسائي',
  leadAr:
    'حوّلي دعوة مناسبتك التقليدية إلى منصة احتفالية رقمية. لا تقتصر على تفاصيل الحفل فحسب، بل تصنع تجربة حية تشارك فيها الضيفات التهاني لتُعرض على شاشة القاعة.',
  hostRoleLabelAr: 'صفة الداعية',
  hostNameLabelAr: 'اسم الداعية',
  guestFormTitleAr: 'أرسلي تهنئة تظهر على الشاشة',
  guestDeviceLockAr: 'رابطكن صدر من لوحة المضيفة ويُربط بهذا الجهاز فقط. إعادة إرساله من مدعوة تُحظر.',
  guestOnlyHintAr: 'هكذا ترى المدعوة الدعوة على جوالها.',
  guestSubmitAr: 'أظهري تهنئتي على القاعة',
  tryCtaAr: 'ابدأن التجربة الآن',
  downloadGoldAr: 'تحميل الكرت الوردي الذهبي',
  downloadIvoryAr: 'تحميل الكرت اللؤلؤي',
  orderCtaAr: 'ادفع 899 ر.س وافتح الدعوة النسائية',
  labKickerAr: 'معاينة حيّة بثوب نسائي',
  labTitleAr: 'عشْن التجربة كما ستعيشها ضيفاتكن',
  labLeadAr: 'سمِّين مناسبتكن، شغّلن يوتيوب، ارفعن صورة، اكتبن تنويهاً، وأرسلن تهنئة.',
} as const;

export function eventLiveCopy(voice: StoreEventLiveVoice) {
  if (voice !== 'women') return STORE_EVENT_LIVE;
  return { ...STORE_EVENT_LIVE, ...STORE_EVENT_LIVE_WOMEN };
}

export function eventLiveAccent(voice: StoreEventLiveVoice): string {
  return voice === 'women' ? '#e4b7c5' : '#e8c547';
}

export function eventLiveFillClass(voice: StoreEventLiveVoice): string {
  return voice === 'women' ? 'bg-[#e4b7c5] text-[#1a0e12]' : 'bg-[#e8c547] text-[#061018]';
}

export function eventLiveTextClass(voice: StoreEventLiveVoice): string {
  return voice === 'women' ? 'text-[#e4b7c5]' : 'text-[#e8c547]';
}

export const STORE_EVENT_LIVE_HOST_ROLES = [
  { id: 'self', voice: 'men', labelAr: 'الداعي باسمه', linePrefixAr: 'الداعي' },
  { id: 'father', voice: 'men', labelAr: 'والد صاحب المناسبة', linePrefixAr: 'والد صاحب المناسبة' },
  { id: 'host', voice: 'men', labelAr: 'المضيف', linePrefixAr: 'المضيف' },
  { id: 'family', voice: 'men', labelAr: 'الأسرة', linePrefixAr: 'الأسرة' },
  { id: 'self', voice: 'women', labelAr: 'الداعية باسمها', linePrefixAr: 'الداعية' },
  { id: 'mother', voice: 'women', labelAr: 'والدة صاحبة المناسبة', linePrefixAr: 'والدة صاحبة المناسبة' },
  { id: 'host', voice: 'women', labelAr: 'المضيفة', linePrefixAr: 'المضيفة' },
  { id: 'family', voice: 'women', labelAr: 'الأسرة', linePrefixAr: 'الأسرة' },
] as const;

export type StoreEventLiveHostRole = (typeof STORE_EVENT_LIVE_HOST_ROLES)[number]['id'];

export function eventLiveHostRoles(voice: StoreEventLiveVoice) {
  return STORE_EVENT_LIVE_HOST_ROLES.filter((item) => item.voice === voice);
}

export const STORE_EVENT_LIVE_OCCASIONS = {
  men: ['أمسية خاصة', 'تخرج', 'تكريم', 'مجلس', 'عيد ميلاد'] as const,
  women: ['أمسية نسائية', 'تخرج', 'جلسة خاصة', 'عيد ميلاد', 'تكريم'] as const,
} as const;

export const STORE_EVENT_LIVE_CANNED = [
  { id: 'baraka', textAr: 'بارك الله فيكم وجعل هذه المناسبة نوراً.' },
  { id: 'alf', textAr: 'ألف مبارك، دامت أفراحكم.' },
  { id: 'dawam', textAr: 'مبارك المناسبة، وأسعد الله أيامكم.' },
  { id: 'noor', textAr: 'حضوركم أنار المكان، وكل عام وأنتم بخير.' },
  { id: 'izz', textAr: 'دام عزكم، ودامت مناسباتكم سعيدة.' },
  { id: 'layla', textAr: 'ليلة موفقة، وفرح يدوم.' },
  { id: 'tawfiq', textAr: 'بالتوفيق، وأجمل الأمنيات لكم.' },
] as const;

export const STORE_EVENT_LIVE_AUDIO = [
  { id: 'none', labelAr: 'صامت' },
  { id: 'welcome', labelAr: 'نغمة ترحيب' },
  { id: 'notice', labelAr: 'نغمة تنويه' },
] as const;

export const STORE_EVENT_LIVE_STYLES = [
  {
    id: 'gold',
    voice: 'men',
    labelAr: 'ذهبي',
    image: '/images/store/lab/lab-luxury-gold.png',
    accent: '#d4af67',
  },
  {
    id: 'ivory',
    voice: 'men',
    labelAr: 'عاجي',
    image: '/images/store/lab/lab-luxury-ivory.png',
    accent: '#e0c48a',
  },
  {
    id: 'rosegold',
    voice: 'women',
    labelAr: 'وردي ذهبي',
    image: '/images/store/lab/lab-luxury-rosegold.png',
    accent: '#d4a07a',
  },
  {
    id: 'pearl',
    voice: 'women',
    labelAr: 'لؤلؤي',
    image: '/images/store/lab/lab-luxury-pearl.png',
    accent: '#e8c4c8',
  },
] as const;

export function eventLiveStyles(voice: StoreEventLiveVoice) {
  return STORE_EVENT_LIVE_STYLES.filter((item) => item.voice === voice);
}

export const STORE_EVENT_VENUE_KINDS = [
  { id: 'hall', labelAr: 'قاعة' },
  { id: 'resthouse', labelAr: 'استراحة' },
  { id: 'hotel', labelAr: 'فندق' },
  { id: 'other', labelAr: 'مكان آخر' },
] as const;

export type StoreEventVenueKind = (typeof STORE_EVENT_VENUE_KINDS)[number]['id'];

export const STORE_EVENT_LIVE_DEMO = {
  voice: 'men' as StoreEventLiveVoice,
  hostRole: 'self' as StoreEventLiveHostRole,
  hostName: 'أحمد',
  occasionTitle: 'أمسية خاصة',
  eventDate: 'الخميس 24 سبتمبر 2026',
  eventTime: 'استقبال الضيوف من الساعة 8 مساءً',
  venueKind: 'hall' as StoreEventVenueKind,
  venueName: 'قاعة النخيل، الرياض',
  venueMapsUrl: 'https://maps.google.com/?q=%D9%82%D8%A7%D8%B9%D8%A9+%D8%A7%D9%84%D9%86%D8%AE%D9%8A%D9%84+%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6',
  welcomeAr: 'يسعدنا دعوتكم لمشاركتنا هذه الأمسية، ومباركتكم تُزهر على الشاشة أمام الجميع.',
  youtubeUrl: 'https://www.youtube.com/watch?v=F-DNzLPph-k&list=RDF-DNzLPph-k&start_radio=1',
  youtubeHidden: false,
  announcement: 'حياكم الله على العشاء',
  photoSrc: '/images/store/lab/lab-luxury-gold.png',
  panoramaSrc: '/images/store/lab/lab-wedding-panorama.png',
} as const;

export const STORE_EVENT_LIVE_DEMO_WOMEN = {
  ...STORE_EVENT_LIVE_DEMO,
  voice: 'women' as StoreEventLiveVoice,
  hostName: 'نورة',
  occasionTitle: 'أمسية نسائية',
  welcomeAr: 'يسعدنا دعوتكن لمشاركتنا هذه الأمسية، ومباركتكن تُزهر على الشاشة أمام الجميع.',
  photoSrc: '/images/store/lab/lab-luxury-rosegold.png',
} as const;
