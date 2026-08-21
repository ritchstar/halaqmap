/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دعوة الزواج التفاعلية — لا يُستورد من App.
 * السعر الافتتاحي 899 ر.س. ميسر يُربط بعد قول ادفع.
 */
export const STORE_WEDDING_LIVE_PUBLIC_ENABLED = true;

export const STORE_WEDDING_LIVE_LAB_TOKEN = 'lab' as const;
export const STORE_WEDDING_LIVE_LAB_TOKEN_WOMEN = 'lab-women' as const;

export type StoreWeddingLiveVoice = 'men' | 'women';

export const STORE_WEDDING_LIVE_PRODUCT = 'store_wedding_live' as const;

export const STORE_WEDDING_LIVE_PRICE_SAR = 899 as const;
export const STORE_WEDDING_LIVE_PRICE_HALALAS = 89900 as const;

function envEnabled(name: string, fallback: boolean): boolean {
  const raw = String((import.meta as { env?: Record<string, unknown> }).env?.[name] ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'off') return false;
  if (raw === 'true' || raw === '1' || raw === 'on') return true;
  return fallback;
}

export const STORE_WEDDING_LIVE_CHECKOUT_ENABLED = envEnabled('VITE_STORE_WEDDING_LIVE_CHECKOUT_ENABLED', true);

export const STORE_WEDDING_LIVE = {
  documentTitle: 'دعوة زواج تفاعلية — خريطة الحل',
  kickerAr: 'قاعة حفلك على الشاشة — حيّة من أول تجربة',
  titleAr: 'دعوة زواج تفاعلية',
  leadAr:
    'كرت فخم بأسماء العريس والعروس، يفتح إلى قاعة تتفاعل مع تهاني الضيوف والصورة والفيديو والتنويه. جرّب كل شيء هنا قبل أن تطلبها.',
  priceLineAr: 'السعر الافتتاحي 899 ر.س',
  bannerTitleAr: 'دعوة زواج تفاعلية',
  bannerLeadAr: 'شاشة القاعة، تهاني الضيوف، يوتيوب أو بانوراما، ولوحة تحكم كاملة. السعر الافتتاحي 899 ر.س.',
  bannerCtaAr: 'جرّب الدعوة الآن',
  labKickerAr: 'معاينة حيّة داخل الصفحة',
  labTitleAr: 'عش التجربة كما سيعيشها ضيوفك',
  labLeadAr: 'شغّل يوتيوب، ارفع صورة، اكتب تنويهاً، وأرسل تهنئة. كل ذلك أمامك الآن.',
  hallStampAr: 'halaqmap · خريطة الحل',
  guestFormTitleAr: 'أرسل تهنئة تظهر على الشاشة',
  guestNameLabelAr: 'اسمك',
  guestExtraLabelAr: 'سطر إضافي من قلبك',
  guestSubmitAr: 'أظهر تهنئتي على القاعة',
  guestOnlyHintAr: 'هكذا يرى المدعو الدعوة على جواله.',
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
  groomNameLabelAr: 'اسم العريس',
  brideNameLabelAr: 'اسم العروس أو كريمة فلان',
  eventDateLabelAr: 'تاريخ الحفل',
  eventTimeLabelAr: 'وقت الاستقبال',
  venueNameLabelAr: 'اسم القاعة أو الفندق',
  venueMapsLabelAr: 'رابط خرائط جوجل',
  downloadGoldAr: 'تحميل الكرت الذهبي',
  downloadIvoryAr: 'تحميل الكرت العاجي',
  archiveCtaAr: 'حفظ أرشيف الصفحة',
  orderCtaAr: 'ادفع 899 ر.س وافتح الدعوة',
  orderEmailLabelAr: 'البريد لاستلام الروابط السرية',
  orderConsentAr: 'قرأت شروط الخدمة وأوافق على بدء التحصيل عبر ميسر.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  tryCtaAr: 'ابدأ التجربة الآن',
  displayLinkAr: 'شاشة القاعة',
  guestLinkAr: 'تجربة الضيف',
  hostLinkAr: 'تجربة المضيف',
  openCardAr: 'افتح الدعوة',
  skipMotionAr: 'تخطي الافتتاح',
  mapsLabelAr: 'موقع الحفل',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldBodyAr:
    'المنتج مستقل عن رخصة النفاذ وعن بطاقة المناسبة. السعر الافتتاحي 899 ر.س، والدفع عبر ميسر على نطاق www.halaqmap.com. الروابط سرية ومؤقتة، ويمكن حفظ الصفحة قبل انتهائها. التهاني جدار عام من رابط ضيف واحد، بلا قائمة حضور وبلا إرسال جماعي وبلا شات. التفاصيل الكاملة في شروط إصدار البطاقات.',
} as const;

export const STORE_WEDDING_LIVE_HOST_ROLES = [
  { id: 'self', voice: 'men', labelAr: 'الداعي باسمه', linePrefixAr: 'الداعي' },
  { id: 'groom_father', voice: 'men', labelAr: 'والد العريس', linePrefixAr: 'والد العريس' },
  { id: 'bride_father', voice: 'men', labelAr: 'والد العروس', linePrefixAr: 'والد العروس' },
  { id: 'self', voice: 'women', labelAr: 'الداعية باسمها', linePrefixAr: 'الداعية' },
  { id: 'groom_mother', voice: 'women', labelAr: 'والدة العريس', linePrefixAr: 'والدة العريس' },
  { id: 'bride_mother', voice: 'women', labelAr: 'والدة العروس', linePrefixAr: 'والدة العروس' },
] as const;

export type StoreWeddingLiveHostRole = (typeof STORE_WEDDING_LIVE_HOST_ROLES)[number]['id'];

export function weddingLiveHostRoles(voice: StoreWeddingLiveVoice) {
  return STORE_WEDDING_LIVE_HOST_ROLES.filter((item) => item.voice === voice);
}

export const STORE_WEDDING_LIVE_WOMEN = {
  documentTitle: 'دعوة زواج تفاعلية نسائية — خريطة الحل',
  kickerAr: 'قاعة حفلكن على الشاشة — حيّة من أول تجربة',
  titleAr: 'دعوة زواج تفاعلية نسائية',
  leadAr:
    'كرت فاخر بطابع نسائي، تدعو منه والدة العريس أو والدة العروس. يفتح إلى قاعة تتفاعل مع تهاني الضيفات والصورة والفيديو والتنويه.',
  labKickerAr: 'معاينة حيّة بثوب نسائي',
  labTitleAr: 'عشْن التجربة كما ستعيشها ضيفاتكن',
  labLeadAr: 'شغّلن يوتيوب، ارفعن صورة، اكتبن تنويهاً، وأرسلن تهنئة. كل ذلك أمامكن الآن.',
  hostRoleLabelAr: 'صفة الداعية',
  hostNameLabelAr: 'اسم الداعية',
  guestFormTitleAr: 'أرسلي تهنئة تظهر على الشاشة',
  guestOnlyHintAr: 'هكذا ترى المدعوة الدعوة على جوالها.',
  guestSubmitAr: 'أظهري تهنئتي على القاعة',
  tryCtaAr: 'ابدأن التجربة الآن',
  downloadGoldAr: 'تحميل الكرت الوردي الذهبي',
  downloadIvoryAr: 'تحميل الكرت اللؤلؤي',
  orderCtaAr: 'ادفع 899 ر.س وافتح الدعوة النسائية',
} as const;

export function weddingLiveCopy(voice: StoreWeddingLiveVoice) {
  if (voice !== 'women') return STORE_WEDDING_LIVE;
  return { ...STORE_WEDDING_LIVE, ...STORE_WEDDING_LIVE_WOMEN };
}

export function weddingLiveAccent(voice: StoreWeddingLiveVoice): string {
  return voice === 'women' ? '#e4b7c5' : '#e8c547';
}

export function weddingLiveFillClass(voice: StoreWeddingLiveVoice): string {
  return voice === 'women' ? 'bg-[#e4b7c5] text-[#1a0e12]' : 'bg-[#e8c547] text-[#061018]';
}

export function weddingLiveTextClass(voice: StoreWeddingLiveVoice): string {
  return voice === 'women' ? 'text-[#e4b7c5]' : 'text-[#e8c547]';
}

export const STORE_WEDDING_LIVE_CANNED = [
  { id: 'baraka', textAr: 'بارك الله لكما وبارك عليكما وجمع بينكما في خير.' },
  { id: 'alf', textAr: 'ألف مبروك، أتمّ الله عليكما الفرح وجعل أيامكم بركة وسعادة.' },
  { id: 'dawam', textAr: 'مبارك للعروسين، دامت دياركم عامرة بالأفراح والسرور.' },
] as const;

export const STORE_WEDDING_LIVE_AUDIO = [
  { id: 'none', labelAr: 'صامت' },
  { id: 'welcome', labelAr: 'نغمة ترحيب' },
  { id: 'notice', labelAr: 'نغمة تنويه' },
] as const;

export const STORE_WEDDING_LIVE_STYLES = [
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

export function weddingLiveStyles(voice: StoreWeddingLiveVoice) {
  return STORE_WEDDING_LIVE_STYLES.filter((item) => item.voice === voice);
}

export const STORE_WEDDING_LIVE_DEMO = {
  voice: 'men' as StoreWeddingLiveVoice,
  hostRole: 'groom_father' as StoreWeddingLiveHostRole,
  hostName: 'أحمد',
  groomName: 'عبدالله',
  brideName: 'فهدة',
  eventDate: 'الخميس 24 سبتمبر 2026',
  eventTime: 'استقبال الضيوف من الساعة 8 مساءً',
  venueName: 'قاعة النخيل، الرياض',
  venueMapsUrl: 'https://maps.google.com/?q=%D9%82%D8%A7%D8%B9%D8%A9+%D8%A7%D9%84%D9%86%D8%AE%D9%8A%D9%84+%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6',
  welcomeAr: 'يسعدنا دعوتكم لمشاركتنا عقد القران، ومباركتكم تُزهر على شاشة القاعة أمام الجميع.',
  youtubeUrl: 'https://www.youtube.com/watch?v=F-DNzLPph-k&list=RDF-DNzLPph-k&start_radio=1',
  youtubeHidden: false,
  announcement: '',
  photoSrc: '/images/store/lab/lab-luxury-gold.png',
  panoramaSrc: '/images/store/lab/lab-wedding-panorama.png',
} as const;

export const STORE_WEDDING_LIVE_DEMO_WOMEN = {
  ...STORE_WEDDING_LIVE_DEMO,
  voice: 'women' as StoreWeddingLiveVoice,
  hostRole: 'groom_mother' as StoreWeddingLiveHostRole,
  hostName: 'نورة',
  welcomeAr: 'يسعدنا دعوتكن لمشاركتنا عقد القران، ومباركتكن تُزهر على شاشة القاعة أمام الجميع.',
  photoSrc: '/images/store/lab/lab-luxury-rosegold.png',
} as const;
