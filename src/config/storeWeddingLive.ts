/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دعوة الزواج التفاعلية — لا يُستورد من App.
 * السعر الافتتاحي 899 ر.س. ميسر يُربط بعد قول ادفع.
 */
import {
  LEGAL_ECOMMERCE_AUTH_NUMBER,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
} from '@/config/partnerLegal';

export const STORE_WEDDING_LIVE_PUBLIC_ENABLED = true;

export const STORE_WEDDING_LIVE_LAB_TOKEN = 'lab' as const;
export const STORE_WEDDING_LIVE_LAB_TOKEN_WOMEN = 'lab-women' as const;

export type StoreWeddingLiveVoice = 'men' | 'women';

export const STORE_WEDDING_LIVE_PRODUCT = 'store_wedding_live' as const;

export const STORE_WEDDING_LIVE_PRICE_SAR = 899 as const;
export const STORE_WEDDING_LIVE_PRICE_HALALAS = 89900 as const;
/** مدة تفعيل الدعوة بعد السداد — تُذكر في بطاقة الباقة والشروط. */
export const STORE_WEDDING_LIVE_ACTIVATION_DAYS = 90 as const;

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
  documentTitle: 'أفراحي1 — خريطة الحل',
  kickerAr: 'دعوة رقمية شخصية لكل مدعو',
  titleAr: 'أفراحي1',
  valueLineAr: 'تعديل واحد يظهر في جميع الروابط المرسلة، دون إعادة طباعة أو توزيع.',
  problemTitleAr: 'بين بطاقة تُطبع وأخرى تضيع',
  problemBodyAr:
    'الدعوة الورقية محدودة بعدد النسخ، وقد تضيع أو تصبح معلوماتها قديمة عند تغيير الموعد أو المكان. أما الرسالة النصية العادية فلا تمنح المدعو تجربة تليق بالمناسبة ولا تجمع له التفاصيل والموقع في مكان واحد.',
  solutionTitleAr: 'أكثر من بطاقة… تجربة دعوة متكاملة على الشاشة',
  leadAr:
    'أنشئ دعوة رقمية لمناسبتك، وحدّث الموعد والمكان من لوحة واحدة، ثم أرسل لكل مدعو رابطاً خاصاً يفتح له ترحيباً باسمه وتفاصيل المناسبة وموقع الحفل.',
  solutionBodyAr:
    'مع أفراحي1، تصبح الدعوة صفحة حيّة يمكن تحديثها من لوحة التحكم، ويفتحها كل مدعو من رابط خاص يحمل ترحيباً باسمه.',
  howTitleAr: 'كيف تعمل المنصة؟',
  howLeadAr: 'بخطوات بسيطة، بلا تعقيد.',
  howSteps: [
    'املأ بيانات المناسبة: صفة الداعي واسمه، اسم العريس والعروس، تاريخ المناسبة، وقت الاستقبال، ومكان الحفل.',
    'اكتب نص الدعوة أو اتركه يُصاغ تلقائياً من الأسماء والتاريخ.',
    'ألصق رابط موقع الحفل، وأضف فيديو ترحيبياً من يوتيوب إن رغبت، ورسالة توجيه للمدعوين.',
    'جرّب النتيجة في استوديو التجربة قبل الدفع.',
    'من لوحة روابط المدعوين أنشئ روابط على دفعات وأرسلها من واتساب جهازك. كل مدعو يفتح رابطه فيرى ترحيباً باسمه.',
  ],
  packageTitleAr: 'ماذا يشمل سعر التفعيل؟',
  packageLeadAr:
    '899 ر.س لتفعيل دعوة رقمية لمناسبة واحدة، وتشمل صفحة الدعوة ولوحة التعديل ولوحة إنشاء روابط المدعوين، وفق المدة وحدود الاستخدام الموضحة في شروط الخدمة.',
  packageItems: [
    'مناسبة زواج واحدة — نسخة رجالية أو نسائية حسب اختيارك عند الشراء.',
    `مدة التفعيل: ${STORE_WEDDING_LIVE_ACTIVATION_DAYS} يوماً من تاريخ السداد.`,
    'روابط مدعوين بلا سقف إجمالي ضمن مدة التفعيل، على دفعات من لوحتك.',
    'تعديل الموعد والمكان والفيديو والنصوص من لوحة واحدة ينعكس على جميع الروابط.',
    'لا رسوم على عدد مرات فتح الدعوة خلال مدة تفعيلها.',
  ],
  postPaymentTitleAr: 'الروابط التي تصل بعد السداد',
  postPaymentLeadAr: 'لا تشارك روابط الإدارة أو لوحة المدعوين مع أي شخص.',
  postPaymentLinks: [
    {
      titleAr: 'رابط لوحة تعديل الدعوة',
      bodyAr: 'خاص بصاحب المناسبة — لتعديل النصوص والوسائط والموعد.',
    },
    {
      titleAr: 'رابط لوحة المدعوين',
      bodyAr: 'خاص بصاحب المناسبة — لإنشاء روابط فردية وإحصاءات الفتح.',
    },
    {
      titleAr: 'رابط معاينة الدعوة',
      bodyAr: 'لمعاينة شكل الدعوة على الشاشة قبل إرسال روابط المدعوين.',
    },
  ],
  privacyTitleAr: 'خصوصية المناسبة وإدارة الروابط',
  privacyBodyAr:
    'ينشئ أفراحي1 رابطاً فريداً لكل مدعو، ويحتفظ بالبيانات اللازمة لتخصيص الدعوة وإدارة حالة الرابط وإظهار إحصاءات الفتح لصاحب المناسبة. لا يتتبع النظام حضور المدعو الفعلي إلى القاعة، ولا تستخدم خريطة الحل بيانات المناسبة أو المدعوين لأغراض إعلانية.',
  privacyDataTitleAr: 'ما الذي يُخزَّن؟',
  privacyDataBodyAr:
    'اسم المدعو كما تكتبه عند إنشاء الرابط، وحالة الرابط (لم يُفتح، أُرسل، فُتح، أُلغي)، ومعرّف ارتباط بالجهاز بعد أول فتح للحد من إعادة المشاركة. لا تُحفظ أرقام جوال المدعوين على المنصة. تُحذف بيانات المناسبة وفق مدة التفعيل وشروط الخدمة، ويمكنك حفظ أرشيف من لوحتك.',
  deviceLockBodyAr:
    'يمكن تقييد رابط المدعو ليعمل على جهاز واحد بعد أول فتح، للحد من إعادة مشاركته والوصول غير المصرح به. لا يمثل تقييد الجهاز ضماناً مطلقاً ضد نسخ الرابط أو محاولات الوصول غير المصرح بها. من لوحتك يمكنك إلغاء رابط المدعو أو إصدار بديل أو إعادة تهيئة ارتباط الجهاز.',
  legalTitleAr: 'منتج من منشأة موثّقة نظامياً',
  legalLeadBeforeAr: 'أفراحي1 أحد منتجات خريطة الحل ',
  legalLeadAfterAr: `، ويتبع المتجر لمنشأة موثقة نظامياً في المملكة العربية السعودية. الرقم الوطني الموحد ${LEGAL_NATIONAL_UNIFIED_NUMBER}، ورقم توثيق التجارة الإلكترونية ${LEGAL_ECOMMERCE_AUTH_NUMBER}. وتخضع معالجة بيانات المناسبة والمدعوين لشروط الخدمة وسياسة الخصوصية المنشورة.`,
  priceTitleAr: 'سعر التفعيل',
  priceLineAr: 'سعر التفعيل: 899 ر.س',
  priceBodyAr:
    'رسوم مرة واحدة لتفعيل دعوة المناسبة. يمكنك تعديل بيانات الدعوة على الرابط نفسه دون الحاجة إلى إعادة الطباعة أو التوزيع. لا رسوم على عدد مرات فتح الدعوة خلال مدة تفعيلها.',
  startTitleAr: 'جرّب دعوتك الآن قبل أن تدفع',
  closeAr:
    'جرّب استوديو التجربة مجاناً بلا حساب: أدخل الأسماء والتاريخ، وشاهد دعوتك على الشاشة خلال ثوانٍ. من لوحة واحدة تصل لكل مدعو برابطه الخاص، بثقة ووضوح في ما يُخزَّن وما لا يُخزَّن.',
  bannerTitleAr: 'أفراحي1',
  bannerLeadAr: 'دعوة رقمية شخصية لكل مدعو. سعر التفعيل 899 ر.س.',
  bannerCtaAr: 'جرّب إنشاء دعوتك',
  labKickerAr: 'استوديو التجربة الحية',
  labTitleAr: 'ثلاث مهام أمامك الآن',
  labLeadAr:
    'عدّل الأسماء والتاريخ، أرسل تهنئة، وغيّر التنويه. معاينة تجريبية على هذا الجهاز، ولا تُنشئ دعوة مدفوعة.',
  labStepsAr: [
    'عدّل الأسماء والتاريخ على لوحة المضيف.',
    'أرسل تهنئة من تبويب الضيف لتظهر على الشاشة.',
    'غيّر التنويه وشاهده ينبض في القاعة.',
  ],
  guestLabHintAr: 'أرسل تهنئة لتظهر على الشاشة أعلاه. هذه معاينة على جهازك، وليست دعوة مدفوعة.',
  hostLabCoreLeadAr: 'ثلاث مهام: الأسماء والتاريخ، التهنئة من تبويب الضيف، والتنويه على الشاشة.',
  hostLabAdvancedAr: 'أدوات القاعة الكاملة',
  stickyBuyLineAr: 'سعر التفعيل: 899 ر.س',
  stickyBuyCtaAr: 'فعّل دعوتك',
  hallStampAr: 'خريطة الحل - halaqmap',
  guestFormTitleAr: 'أرسل تهنئة تظهر على الشاشة',
  guestNameLabelAr: 'اسمك',
  guestExtraLabelAr: 'سطر إضافي من قلبك',
  guestSubmitAr: 'أظهر تهنئتي على القاعة',
  guestBlessingsTimingAr:
    'بمجرد وصول روابط الدعوة وفتحها ستبدأ التبريكات قبل وأثناء وبعد الزفاف.',
  guestOnlyHintAr: 'هكذا يرى المدعو الدعوة على جواله.',
  guestDeviceLockAr:
    'رابطكم صدر من لوحة المضيف ويمكن تقييده على هذا الجهاز بعد أول فتح. إعادة مشاركته قد تُقيَّد وفق شروط الخدمة.',
  resentPreviewKickerAr: 'تقييد الرابط (رابط مُستخدَم)',
  resentPreviewCaptionAr:
    'معاينة الصفحة التنبيهية التي تظهر عند فتح رابط أُرسل من جهاز آخر أو أُعيدت مشاركته، للحد من الوصول غير المصرح به.',
  hostInviteTitleAr: 'لوحة إنشاء روابط المدعوين',
  hostInviteLeadAr:
    'أنشئ روابط على دفعات بلا سقف إجمالي ضمن مدة التفعيل. كل رابط لمدعو واحد. أرسل من واتساب جهازك — المنصة لا تحفظ أرقام الجوال.',
  hostInviteCtaAr: 'جهّز دفعة روابط',
  inviteStatsDemoNoteAr: 'بيانات تجريبية لأغراض المعاينة',
  inviteStatsCreatedAr: 'روابط أُنشئت',
  inviteStatsOpenedAr: 'روابط فُتحت',
  inviteStatsPendingAr: 'روابط لم تُفتح',
  inviteStatsLockedAr: 'روابط مقيّدة بجهاز',
  inviteStatsRevokedAr: 'روابط أُلغيت',
  hostPanelTitleAr: 'لوحة تحكم الحفل',
  hostAnnouncementLabelAr: 'تنويه على الشاشة',
  hostYoutubeSoundAr: 'تشغيل الصوت',
  hostYoutubeHideAr: 'حجب الفيديو وإظهار البانوراما',
  hostYoutubeShowAr: 'إعادة عرض يوتيوب',
  hostYoutubeRemoveAr: 'إزالة الفيديو',
  invitationPreviewAr: 'نص الدعوة على الكرت والشاشة',
  invitationEditHintAr: 'عدّل الدعوة كما تشاؤون. إن أعدتم ربطها تُصاغ من الأسماء والتاريخ.',
  invitationRegenAr: 'أعد ربط الدعوة بالأسماء والتاريخ',
  invitationKickerLabelAr: 'عنوان الكرت والقاعة',
  invitationKickerHintAr: 'العبارة أعلى الأسماء. إن تُرك فارغاً يظهر عقد قران.',
  offspringKindLabelAr: 'نوع الدعوة',
  offspringSonAr: 'زواج ابننا',
  offspringDaughterAr: 'زواج ابنتنا',
  groomNameLabelAr: 'اسم العريس',
  brideNameLabelAr: 'اسم العروس — اختياري',
  brideDisplayLabelAr: 'طريقة عرض اسم العروس',
  brideDisplayFullAr: 'الاسم كاملاً',
  brideDisplayFirstAr: 'الاسم الأول فقط',
  brideDisplayKrimahAr: 'كريمة فلان',
  brideDisplayHiddenAr: 'عدم إظهار الاسم',
  hostRoleCustomLabelAr: 'صفة مخصصة',
  eventDateLabelAr: 'تاريخ المناسبة',
  eventDatePreviewHintAr: 'تُولَّد الصيغة العربية والإنجليزية تلقائياً في المعاينة.',
  eventDateEnLabelAr: 'التاريخ بالإنجليزية',
  venueKindLabelAr: 'نوع المكان',
  venueMapsHintAr: 'ألصق رابط موقع الحفل',
  venueMapsVerifyAr: 'فتح الموقع للتحقق',
  hostWelcomeSetsTitleAr: 'عبارات الترحيب على الشاشة',
  hostWelcomeSetsLeadAr: 'ثلاث عبارات على الشاشة. عدّلوهن كما تشاؤون، أو استدعوا مجموعة جاهزة.',
  hostWelcomeNextAr: 'ثلاث عبارات جديدة',
  hostWelcomeSetStatusAr: 'المجموعة',
  hostAudioLabelAr: 'صوت القاعة',
  hostUploadPhotoAr: 'رفع صورة للقاعة أو الكرت',
  hostUploadPanoramaAr: 'رفع صورة بانورامية',
  hostRoleLabelAr: 'صفة الداعي',
  hostNameLabelAr: 'اسم الداعي',
  eventTimeLabelAr: 'وقت الاستقبال',
  venueNameLabelAr: 'اسم المكان',
  venueMapsLabelAr: 'رابط موقع الحفل',
  hostYoutubeLabelAr: 'رابط فيديو ترحيبي — اختياري',
  hostYoutubeHintAr:
    'الفيديو مستضاف على يوتيوب. المعاينة بلا تشغيل صوت تلقائي. على شاشة العرض يبدأ التشغيل ثم يمكن رفع الصوت.',
  hostWelcomeLabelAr: 'رسالة للمدعوين — اختيارية',
  guestBlessingNoteAr:
    'قد تظهر رسالتك في صفحة المناسبة بعد مراجعتها واعتمادها من صاحب الدعوة.',
  downloadGoldAr: 'تحميل الكرت الذهبي',
  downloadIvoryAr: 'تحميل الكرت العاجي',
  archiveCtaAr: 'حفظ أرشيف الصفحة',
  orderCtaAr: 'فعّل دعوتك — 899 ر.س',
  orderEmailLabelAr: 'البريد لاستلام روابط التشغيل',
  orderLinksIntroAr: 'بعد السداد تصلك روابط لوحة التعديل ولوحة المدعوين ومعاينة الدعوة على البريد.',
  orderConsentAr:
    'أقرّ بقراءة شروط الخدمة والخصوصية، وأوافق على سداد قيمة تفعيل أفراحي1 لمناسبة واحدة وفق المدة وحدود الاستخدام الموضحة، بمبلغ 899 ر.س عبر بوابة الدفع التابعة لخريطة الحل.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  tryCtaAr: 'جرّب إنشاء دعوتك',
  activateCtaAr: 'فعّل دعوتك — 899 ر.س',
  womenLinkCtaAr: 'انتقل إلى نسخة أفراحي1 للنساء',
  displayLinkAr: 'شاشة القاعة',
  guestLinkAr: 'تجربة الضيف',
  hostLinkAr: 'تجربة المضيف',
  openCardAr: 'فعّل دعوتك',
  skipMotionAr: 'تخطي الافتتاح',
  mapsLabelAr: 'موقع الحفل',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldBodyAr:
    'دعوة زفاف حية: تهاني بمراجعة المضيف، صور أو يوتيوب، وكرت بأسماء العريس والعروس. سعر التفعيل 899 ر.س لمناسبة واحدة. روابط المدعوين تصدر من لوحتك فقط؛ يمكن تقييد كل رابط على جهاز بعد أول فتح. المنصة ليست دفتر حضور ولا تتبعاً للحضور الفعلي. التفاصيل في شروط الخدمة.',
} as const;

export const STORE_WEDDING_LIVE_HOST_ROLES = [
  { id: 'self', voice: 'men', labelAr: 'الداعي باسمه', linePrefixAr: 'الداعي' },
  { id: 'groom', voice: 'men', labelAr: 'العريس', linePrefixAr: 'العريس' },
  { id: 'groom_father', voice: 'men', labelAr: 'والد العريس', linePrefixAr: 'والد العريس' },
  { id: 'groom_mother', voice: 'men', labelAr: 'والدة العريس', linePrefixAr: 'والدة العريس' },
  { id: 'bride_father', voice: 'men', labelAr: 'والد العروس', linePrefixAr: 'والد العروس' },
  { id: 'bride_mother', voice: 'men', labelAr: 'والدة العروس', linePrefixAr: 'والدة العروس' },
  { id: 'groom_family', voice: 'men', labelAr: 'أسرة العريس', linePrefixAr: 'أسرة العريس' },
  { id: 'bride_family', voice: 'men', labelAr: 'أسرة العروس', linePrefixAr: 'أسرة العروس' },
  { id: 'custom', voice: 'men', labelAr: 'صفة مخصصة', linePrefixAr: '' },
  { id: 'self', voice: 'women', labelAr: 'الداعية باسمها', linePrefixAr: 'الداعية' },
  { id: 'groom', voice: 'women', labelAr: 'العريس', linePrefixAr: 'العريس' },
  { id: 'groom_father', voice: 'women', labelAr: 'والد العريس', linePrefixAr: 'والد العريس' },
  { id: 'groom_mother', voice: 'women', labelAr: 'والدة العريس', linePrefixAr: 'والدة العريس' },
  { id: 'bride_father', voice: 'women', labelAr: 'والد العروس', linePrefixAr: 'والد العروس' },
  { id: 'bride_mother', voice: 'women', labelAr: 'والدة العروس', linePrefixAr: 'والدة العروس' },
  { id: 'groom_family', voice: 'women', labelAr: 'أسرة العريس', linePrefixAr: 'أسرة العريس' },
  { id: 'bride_family', voice: 'women', labelAr: 'أسرة العروس', linePrefixAr: 'أسرة العروس' },
  { id: 'custom', voice: 'women', labelAr: 'صفة مخصصة', linePrefixAr: '' },
] as const;

export type StoreWeddingLiveHostRole = (typeof STORE_WEDDING_LIVE_HOST_ROLES)[number]['id'];

export function weddingLiveHostRoles(voice: StoreWeddingLiveVoice) {
  return STORE_WEDDING_LIVE_HOST_ROLES.filter((item) => item.voice === voice);
}

export const STORE_WEDDING_LIVE_WOMEN = {
  documentTitle: 'أفراحي1 نسائي — خريطة الحل',
  kickerAr: 'دعوة رقمية شخصية لكل مدعوة',
  titleAr: 'أفراحي1 نسائي',
  problemBodyAr:
    'الدعوة الورقية محدودة بعدد النسخ، وقد تضيع أو تصبح معلوماتها قديمة عند تغيير الموعد أو المكان. أما الرسالة النصية العادية فلا تمنح المدعوة تجربة تليق بالمناسبة ولا تجمع لها التفاصيل والموقع في مكان واحد.',
  leadAr:
    'أنشئي دعوة رقمية لمناسبتك، وحدّثي الموعد والمكان من لوحة واحدة، ثم أرسلي لكل مدعوة رابطاً خاصاً يفتح لها ترحيباً باسمها وتفاصيل المناسبة وموقع الحفل.',
  solutionBodyAr:
    'مع أفراحي1، تصبح الدعوة صفحة حيّة يمكن تحديثها من لوحة التحكم، وتفتحها كل مدعوة من رابط خاص يحمل ترحيباً باسمها.',
  howSteps: [
    'املأي بيانات المناسبة: صفة الداعية واسمها، اسم العريس والعروس، تاريخ المناسبة، وقت الاستقبال، ومكان الحفل.',
    'اكتبي نص الدعوة أو اتركيه يُصاغ تلقائياً من الأسماء والتاريخ.',
    'ألصقي رابط موقع الحفل، وأضيفي فيديو ترحيبياً من يوتيوب إن رغبت، ورسالة توجيه للمدعوات.',
    'جرّبي النتيجة في استوديو التجربة قبل الدفع.',
    'من لوحة روابط المدعوين أنشئي روابط على دفعات وأرسليها من واتساب جهازك.',
  ],
  privacyBodyAr:
    'ينشئ أفراحي1 رابطاً فريداً لكل مدعوة، ويحتفظ بالبيانات اللازمة لتخصيص الدعوة وإدارة حالة الرابط وإظهار إحصاءات الفتح لصاحبة المناسبة. لا يتتبع النظام حضور المدعوة الفعلي إلى القاعة، ولا تستخدم خريطة الحل بيانات المناسبة أو المدعوات لأغراض إعلانية.',
  legalLeadAfterAr: `، ويتبع المتجر لمنشأة موثقة نظامياً في المملكة العربية السعودية. الرقم الوطني الموحد ${LEGAL_NATIONAL_UNIFIED_NUMBER}، ورقم توثيق التجارة الإلكترونية ${LEGAL_ECOMMERCE_AUTH_NUMBER}. وتخضع معالجة بيانات المناسبة والمدعوات لشروط الخدمة وسياسة الخصوصية المنشورة.`,
  priceBodyAr:
    'رسوم مرة واحدة لتفعيل دعوة المناسبة. يمكنك تعديل بيانات الدعوة على الرابط نفسه دون الحاجة إلى إعادة الطباعة أو التوزيع. لا رسوم على عدد مرات فتح الدعوة خلال مدة تفعيلها.',
  startTitleAr: 'جرّبي دعوتك الآن قبل أن تدفع',
  closeAr:
    'جرّبي استوديو التجربة مجاناً بلا حساب: أدخلي الأسماء والتاريخ، وشاهدي دعوتك على الشاشة خلال ثوانٍ. من لوحة واحدة تصل لكل مدعوة برابطها الخاص، بثقة ووضوح في ما يُخزَّن وما لا يُخزَّن.',
  labKickerAr: 'استوديو التجربة الحية',
  labTitleAr: 'ثلاث مهام أمامكن الآن',
  labLeadAr:
    'عدّلن الأسماء والتاريخ، أرسلن تهنئة، وغيّرن التنويه. معاينة تجريبية على هذا الجهاز، ولا تُنشئ دعوة مدفوعة.',
  labStepsAr: [
    'عدّلن الأسماء والتاريخ على لوحة المضيفة.',
    'أرسلن تهنئة من تبويب الضيفة لتظهر على الشاشة.',
    'غيّرن التنويه حتى يظهر نابضاً في القاعة.',
  ],
  guestLabHintAr: 'أرسلي تهنئة لتظهر على الشاشة أعلاه. هذه معاينة على جهازك، وليست دعوة مدفوعة.',
  hostLabCoreLeadAr: 'ثلاث مهام: الأسماء والتاريخ، التهنئة من تبويب الضيفة، والتنويه على الشاشة.',
  hostLabAdvancedAr: 'أدوات القاعة الكاملة',
  stickyBuyCtaAr: 'فعّلي دعوتك',
  hostRoleLabelAr: 'صفة الداعية',
  hostNameLabelAr: 'اسم الداعية',
  guestFormTitleAr: 'أرسلي تهنئة تظهر على الشاشة',
  guestDeviceLockAr:
    'رابطكن صدر من لوحة المضيفة ويمكن تقييده على هذا الجهاز بعد أول فتح. إعادة مشاركته قد تُقيَّد وفق شروط الخدمة.',
  guestOnlyHintAr: 'هكذا ترى المدعوة الدعوة على جوالها.',
  guestSubmitAr: 'أظهري تهنئتي على الشاشة',
  tryCtaAr: 'جرّبي إنشاء دعوتك',
  activateCtaAr: 'فعّلي دعوتك — 899 ر.س',
  womenLinkCtaAr: 'انتقلي إلى نسخة أفراحي1 للرجال',
  downloadGoldAr: 'تحميل الكرت الوردي الذهبي',
  downloadIvoryAr: 'تحميل الكرت اللؤلؤي',
  orderCtaAr: 'فعّلي دعوتك — 899 ر.س',
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
  { id: 'alf', textAr: 'ألف مبروك، أتمّ الله عليكما الفرح.' },
  { id: 'dawam', textAr: 'مبارك للعروسين، دامت دياركم عامرة.' },
  { id: 'mawadda', textAr: 'عقبال الدوام، وجعل بينكما مودة ورحمة.' },
  { id: 'thurriya', textAr: 'الله يتمم عليكم بالخير والذرية الصالحة.' },
  { id: 'layla', textAr: 'ليلة سعيدة، وفرح يدوم بإذن الله.' },
  { id: 'omr', textAr: 'أحلى تهنئة، والعمر كله أفراح.' },
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
    image: '/images/store/lab/lab-luxury-gold.jpg',
    accent: '#d4af67',
  },
  {
    id: 'ivory',
    voice: 'men',
    labelAr: 'عاجي',
    image: '/images/store/lab/lab-luxury-ivory.jpg',
    accent: '#e0c48a',
  },
  {
    id: 'rosegold',
    voice: 'women',
    labelAr: 'وردي ذهبي',
    image: '/images/store/lab/lab-luxury-rosegold.jpg',
    accent: '#d4a07a',
  },
  {
    id: 'pearl',
    voice: 'women',
    labelAr: 'لؤلؤي',
    image: '/images/store/lab/lab-luxury-pearl.jpg',
    accent: '#e8c4c8',
  },
] as const;

export function weddingLiveStyles(voice: StoreWeddingLiveVoice) {
  return STORE_WEDDING_LIVE_STYLES.filter((item) => item.voice === voice);
}

export const STORE_WEDDING_VENUE_KINDS = [
  { id: 'hall', labelAr: 'قاعة' },
  { id: 'resthouse', labelAr: 'استراحة' },
  { id: 'hotel', labelAr: 'فندق' },
  { id: 'other', labelAr: 'مكان آخر' },
] as const;

export type StoreWeddingVenueKind = (typeof STORE_WEDDING_VENUE_KINDS)[number]['id'];
export type StoreWeddingOffspringKind = 'son' | 'daughter';
export type StoreWeddingBrideDisplayMode = 'full' | 'first' | 'krimah' | 'hidden';

export const STORE_WEDDING_LIVE_DEMO = {
  voice: 'men' as StoreWeddingLiveVoice,
  hostRole: 'groom_father' as StoreWeddingLiveHostRole,
  hostName: 'أحمد',
  hostRoleCustomAr: '',
  offspringKind: 'son' as StoreWeddingOffspringKind,
  groomName: 'عبدالله',
  brideName: 'فهدة',
  brideDisplayMode: 'full' as StoreWeddingBrideDisplayMode,
  eventDateIso: '2026-09-24',
  eventDate: '٢٤ سبتمبر ٢٠٢٦',
  eventDateEn: '24 September 2026',
  eventTime: 'استقبال الضيوف من الساعة 8 مساءً',
  venueKind: 'hall' as StoreWeddingVenueKind,
  venueName: 'قاعة النخيل، الرياض',
  venueMapsUrl: 'https://maps.google.com/?q=%D9%82%D8%A7%D8%B9%D8%A9+%D8%A7%D9%84%D9%86%D8%AE%D9%8A%D9%84+%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6',
  welcomeAr: '',
  youtubeUrl: 'https://www.youtube.com/watch?v=F-DNzLPph-k',
  youtubeHidden: false,
  announcement: 'حياكم الله على العشاء',
  photoSrc: '/images/store/lab/lab-luxury-gold.jpg',
  panoramaSrc: '/images/store/lab/lab-wedding-panorama.jpg',
} as const;

export const STORE_WEDDING_LIVE_DEMO_WOMEN = {
  ...STORE_WEDDING_LIVE_DEMO,
  voice: 'women' as StoreWeddingLiveVoice,
  hostRole: 'groom_mother' as StoreWeddingLiveHostRole,
  hostName: 'نورة',
  welcomeAr: '',
  photoSrc: '/images/store/lab/lab-luxury-rosegold.jpg',
} as const;
