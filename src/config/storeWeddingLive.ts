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
  documentTitle: 'افراحي1 — خريطة الحل',
  kickerAr: 'منصة احتفالية رقمية لقاعة الأفراح',
  titleAr: 'افراحي1',
  problemTitleAr: 'بين بطاقة تُطبع وأخرى تضيع',
  problemBodyAr:
    'الدعوة الورقية التقليدية تُطبع بعدد محدود، وتُوزَّع، وأحياناً تضيع من يد المدعو أو يُنسى فيها التاريخ. وإذا تغيّر موعد الاستقبال أو تبدّل المكان في اللحظة الأخيرة، لا سبيل لتصحيح ما وُزِّع فعلاً. المدعو نفسه يفتح رسالة نصية عادية بلا أجواء تليق بمناسبة كهذه، ولا رابطاً واضحاً لموقع القاعة، ولا لمسة ترحيبية تُشعره أنه منتظَر بالاسم. والنتيجة: مجهود وتكلفة طباعة، مقابل تجربة أقل من فخامة المناسبة التي تستحقها.',
  solutionTitleAr: 'افراحي1: ليست بطاقة، بل قاعة أفراح حيّة على الشاشة',
  leadAr:
    'افراحي1 منصة احتفالية رقمية تُحوّل الدعوة التقليدية إلى تجربة حيّة يفتحها كل مدعو من رابطه الخاص: تحمل اسمي العريس والعروسة، التاريخ والمكان، ورسالة ترحيب تُشعره بأنه مقصود بالدعوة لا مجرد رقم في القائمة. وبخلاف الطباعة، أي تعديل يطرأ على الموعد أو المكان ينعكس فوراً على الرابط نفسه، دون إعادة طباعة أو توزيع.',
  howTitleAr: 'كيف تعمل المنصة؟',
  howLeadAr: 'بخطوات بسيطة، بلا تعقيد.',
  howSteps: [
    'تملأ بيانات الحفل في لوحة تحكم واحدة: صفة الداعي واسمه، عنوان المناسبة، اسم الابن أو الابنة، التاريخ بالعربية والإنجليزية، نوع الاستقبال ووقته، ونوع المكان واسمه.',
    'تكتب نص الدعوة كما تريد.',
    'تضيف رابط موقع القاعة على الخريطة، ورابط فيديو ترحيب أو آيات من يوتيوب إن أردت، ورسالة توجيه على الشاشة مثل: تفضلوا العشاء الله يحييكم.',
    'تجرّب النتيجة مباشرة في استوديو التجربة الحية قبل الإرسال، لترى شكل الدعوة كما سيراها ضيوفك تماماً.',
    'من لوحة إرسال روابط المدعوين تُنشئ رابطاً خاصاً لكل ضيف بدفعات، خمسة وعشرين أو خمسين أو خمسة وسبعين أو مئة رابط دفعة واحدة، وتُرسلها عبر واتساب. كل مدعو يفتح رابطه فتظهر له شاشة ترحيب بالاسم.',
  ],
  privacyTitleAr: 'خصوصية صارمة تليق بمناسبة عائلية',
  privacyBodyAr:
    'افراحي1 مبني خصيصاً لحماية خصوصية المناسبات العائلية والخاصة: كل رابط دعوة مخصص لمدعو واحد فقط ويُربط بجهازه بعد أول دخول، وإعادة إرسال الرابط من أي مدعو محظورة برمجياً بالكامل. المنصة ليست دفتر حضور، ولا تتبعاً للمدعوين، ولا قائمة أسماء تُحفظ أو تُشارك. أنت من يقرر من يستلم الدعوة، ولا أحد غيرك.',
  legalTitleAr: 'منتج من منشأة موثّقة نظامياً',
  legalLeadBeforeAr: 'افراحي1 من متجر خريطة الحل ',
  legalLeadAfterAr: `، وهو مؤسسة موثّقة نظامياً في المملكة العربية السعودية. الرقم الوطني الموحد ${LEGAL_NATIONAL_UNIFIED_NUMBER}، ورقم توثيق التجارة الإلكترونية ${LEGAL_ECOMMERCE_AUTH_NUMBER}. تعمل ضمن الأنظمة السعودية ومبادئ حماية البيانات الشخصية. لا تُستخدم بيانات مناسبتك أو ضيوفك لأي غرض إعلاني.`,
  priceTitleAr: 'السعر',
  priceLineAr: 'السعر الافتتاحي 899 ر.س',
  priceBodyAr:
    'دفعة واحدة فقط: بلا كلفة قاعة، وبلا عمولة تكرار طباعة. بعد الدفع تصلك بطاقة الدعوة القابلة للمشاركة على رابط حي مباشرة إلى بريدك.',
  startTitleAr: 'جرّب دعوتك الآن قبل أن تدفع',
  closeAr:
    'جرّب استوديو التجربة الحية مجاناً بلا حساب: أدخل الأسماء والتاريخ، وشاهد دعوتك على الشاشة خلال ثوانٍ معدودة. لا حاجة لخبرة تقنية ولا تصميم معقّد. منصة واحدة تُخرج مناسبتك بالفخامة التي تستحقها، وتصل لكل ضيف برابطه الخاص، بثقة وخصوصية كاملة.',
  bannerTitleAr: 'افراحي1',
  bannerLeadAr: 'قاعة تفاعلية حية، وشريط تنويهات ووسائط، ولوحة تحكم فورية. السعر الافتتاحي 899 ر.س.',
  bannerCtaAr: 'جرّب الدعوة الآن',
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
  stickyBuyLineAr: 'السعر الافتتاحي 899 ر.س',
  stickyBuyCtaAr: 'انتقل إلى الدفع',
  hallStampAr: 'خريطة الحل - halaqmap',
  guestFormTitleAr: 'أرسل تهنئة تظهر على الشاشة',
  guestNameLabelAr: 'اسمك',
  guestExtraLabelAr: 'سطر إضافي من قلبك',
  guestSubmitAr: 'أظهر تهنئتي على القاعة',
  guestBlessingsTimingAr:
    'بمجرد وصول روابط الدعوة وفتحها ستبدأ التبريكات قبل وأثناء وبعد الزفاف.',
  guestOnlyHintAr: 'هكذا يرى المدعو الدعوة على جواله.',
  guestDeviceLockAr: 'رابطكم صدر من لوحة المضيف ويُربط بهذا الجهاز فقط. إعادة إرساله من مدعو تُحظر.',
  resentPreviewKickerAr: 'نظام الأمان ومنع التداول (رابط مُستخدَم)',
  resentPreviewCaptionAr:
    'معاينة الصفحة التنبيهية التي تظهر للزائر في حال فتح رابط تم تحويله أو إعادة إرساله من شخص آخر لحماية خصوصية المناسبة.',
  hostInviteTitleAr: 'لوحة إرسال روابط المدعوين',
  hostInviteLeadAr:
    'جهّزوا دفعة حتى مئتي رابط، بلا سقف إجمالي. كل رابط لمدعو واحد. أرسلوا واحداً واحداً، أو دفعة لمفوض من العائلة من واتساب جهازكم، بلا حفظ أرقام.',
  hostInviteCtaAr: 'جهّز دفعة روابط',
  hostPanelTitleAr: 'لوحة تحكم الحفل',
  hostAnnouncementLabelAr: 'تنويه على الشاشة',
  hostYoutubeLabelAr: 'رابط يوتيوب',
  hostYoutubeHintAr: 'الصق رابط المقطع أو البث. على شاشة القاعة يبدأ التشغيل، ثم اضغط لرفع الصوت.',
  hostYoutubeSoundAr: 'تشغيل الصوت',
  hostYoutubeHideAr: 'حجب الفيديو وإظهار البانوراما',
  hostYoutubeShowAr: 'إعادة عرض يوتيوب',
  hostWelcomeLabelAr: 'سطر إضافي على الكرت إن رغبت',
  invitationPreviewAr: 'نص الدعوة على الكرت والشاشة',
  invitationEditHintAr: 'عدّل الدعوة كما تشاؤون. إن أعدتم ربطها تُصاغ من الأسماء والتاريخ.',
  invitationRegenAr: 'أعد ربط الدعوة بالأسماء والتاريخ',
  invitationKickerLabelAr: 'عنوان الكرت والقاعة',
  invitationKickerHintAr: 'العبارة أعلى الأسماء. إن تُرك فارغاً يظهر عقد قران.',
  offspringKindLabelAr: 'الدعوة لزواج',
  offspringSonAr: 'ابننا',
  offspringDaughterAr: 'ابنتنا',
  offspringNameSonAr: 'اسم ابنكم',
  offspringNameDaughterAr: 'اسم ابنتكم',
  spouseNameSonAr: 'على فلانة أو كريمة',
  spouseNameDaughterAr: 'على فلان',
  eventDateEnLabelAr: 'التاريخ بالإنجليزية',
  venueKindLabelAr: 'نوع المكان',
  venueMapsHintAr: 'انسخ رابط الموقع',
  hostWelcomeSetsTitleAr: 'عبارات الترحيب على الشاشة',
  hostWelcomeSetsLeadAr: 'ثلاث عبارات على الشاشة. عدّلوهن كما تشاؤون، أو استدعوا مجموعة جاهزة.',
  hostWelcomeNextAr: 'ثلاث عبارات جديدة',
  hostWelcomeSetStatusAr: 'المجموعة',
  hostAudioLabelAr: 'صوت القاعة',
  hostUploadPhotoAr: 'رفع صورة للقاعة أو الكرت',
  hostUploadPanoramaAr: 'رفع صورة بانورامية',
  hostRoleLabelAr: 'صفة الداعي',
  hostNameLabelAr: 'اسم الداعي',
  groomNameLabelAr: 'اسم ابنكم',
  brideNameLabelAr: 'على فلانة أو كريمة',
  eventDateLabelAr: 'التاريخ بالعربية',
  eventTimeLabelAr: 'وقت الاستقبال',
  venueNameLabelAr: 'اسم المكان',
  venueMapsLabelAr: 'رابط موقع الحفل',
  downloadGoldAr: 'تحميل الكرت الذهبي',
  downloadIvoryAr: 'تحميل الكرت العاجي',
  archiveCtaAr: 'حفظ أرشيف الصفحة',
  orderCtaAr: 'ادفع 899 ر.س وافتح الدعوة',
  orderEmailLabelAr: 'البريد لاستلام الروابط السرية',
  orderConsentAr: 'قرأت شروط الخدمة وأوافق على بدء التحصيل عبر بوابة الدفع.',
  orderSubmitAr: 'الانتقال إلى الدفع',
  tryCtaAr: 'جرّب دعوتك الآن',
  displayLinkAr: 'شاشة القاعة',
  guestLinkAr: 'تجربة الضيف',
  hostLinkAr: 'تجربة المضيف',
  openCardAr: 'افتح الدعوة',
  skipMotionAr: 'تخطي الافتتاح',
  mapsLabelAr: 'موقع الحفل',
  termsFoldTitleAr: 'شروط الخدمة قبل الطلب',
  termsFoldTriggerAr: 'اقرأ شروط الخدمة',
  termsFoldBodyAr:
    'دعوة زفاف حيّة لضيوفك: تهاني، صور أو يوتيوب، وكرت بأسماء العريس والعروس. السعر 899 ر.س، والدفع عبر بوابة الدفع الآمنة. روابط المدعوين تصدر من لوحة المضيف فقط؛ كل رابط لمدعو واحد وجهاز واحد، وإعادة إرساله من مدعو تُحظر. حماية الخصوصية الصارمة للمناسبات العائلية هي منطلق النموذج، وليست دفتر حضور. التفاصيل في شروط الخدمة.',
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
  documentTitle: 'افراحي1 نسائي — خريطة الحل',
  kickerAr: 'منصة احتفالية رقمية لقاعة الأفراح',
  titleAr: 'افراحي1 نسائي',
  problemBodyAr:
    'الدعوة الورقية التقليدية تُطبع بعدد محدود، وتُوزَّع، وأحياناً تضيع من يد المدعوة أو يُنسى فيها التاريخ. وإذا تغيّر موعد الاستقبال أو تبدّل المكان في اللحظة الأخيرة، لا سبيل لتصحيح ما وُزِّع فعلاً. المدعوة نفسها تفتح رسالة نصية عادية بلا أجواء تليق بمناسبة كهذه، ولا رابطاً واضحاً لموقع القاعة، ولا لمسة ترحيبية تُشعرها أنها منتظَرة بالاسم. والنتيجة: مجهود وتكلفة طباعة، مقابل تجربة أقل من فخامة المناسبة التي تستحقها.',
  leadAr:
    'افراحي1 منصة احتفالية رقمية تُحوّل الدعوة التقليدية إلى تجربة حيّة تفتحها كل مدعوة من رابطها الخاص: تحمل اسمي العريس والعروسة، التاريخ والمكان، ورسالة ترحيب تُشعرها بأنها مقصودة بالدعوة لا مجرد رقم في القائمة. وبخلاف الطباعة، أي تعديل يطرأ على الموعد أو المكان ينعكس فوراً على الرابط نفسه، دون إعادة طباعة أو توزيع.',
  howSteps: [
    'تملأن بيانات الحفل في لوحة تحكم واحدة: صفة الداعية واسمها، عنوان المناسبة، اسم الابن أو الابنة، التاريخ بالعربية والإنجليزية، نوع الاستقبال ووقته، ونوع المكان واسمه.',
    'تكتبن نص الدعوة كما تريدن.',
    'تضفن رابط موقع القاعة على الخريطة، ورابط فيديو ترحيب أو آيات من يوتيوب إن أردتن، ورسالة توجيه على الشاشة مثل: تفضلوا العشاء الله يحييكم.',
    'تجرّبن النتيجة مباشرة في استوديو التجربة الحية قبل الإرسال، لترين شكل الدعوة كما ستراها ضيفاتكن تماماً.',
    'من لوحة إرسال روابط المدعوين تُنشئن رابطاً خاصاً لكل ضيفة بدفعات، خمسة وعشرين أو خمسين أو خمسة وسبعين أو مئة رابط دفعة واحدة، وتُرسلنها عبر واتساب. كل مدعوة تفتح رابطها فتظهر لها شاشة ترحيب بالاسم.',
  ],
  privacyBodyAr:
    'افراحي1 مبني خصيصاً لحماية خصوصية المناسبات العائلية والخاصة: كل رابط دعوة مخصص لمدعوة واحدة فقط ويُربط بجهازها بعد أول دخول، وإعادة إرسال الرابط من أي مدعوة محظورة برمجياً بالكامل. المنصة ليست دفتر حضور، ولا تتبعاً للمدعوات، ولا قائمة أسماء تُحفظ أو تُشارك. أنتِ من تقررين من يستلم الدعوة، ولا أحد غيرك.',
  legalLeadAfterAr: `، وهو مؤسسة موثّقة نظامياً في المملكة العربية السعودية. الرقم الوطني الموحد ${LEGAL_NATIONAL_UNIFIED_NUMBER}، ورقم توثيق التجارة الإلكترونية ${LEGAL_ECOMMERCE_AUTH_NUMBER}. تعمل ضمن الأنظمة السعودية ومبادئ حماية البيانات الشخصية. لا تُستخدم بيانات مناسبتك أو ضيفاتك لأي غرض إعلاني.`,
  priceBodyAr:
    'دفعة واحدة فقط: بلا كلفة قاعة، وبلا عمولة تكرار طباعة. بعد الدفع تصلك بطاقة الدعوة القابلة للمشاركة على رابط حي مباشرة إلى بريدك.',
  startTitleAr: 'جرّبي دعوتك الآن قبل أن تدفع',
  closeAr:
    'جرّبي استوديو التجربة الحية مجاناً بلا حساب: أدخلي الأسماء والتاريخ، وشاهدي دعوتك على الشاشة خلال ثوانٍ معدودة. لا حاجة لخبرة تقنية ولا تصميم معقّد. منصة واحدة تُخرج مناسبتك بالفخامة التي تستحقها، وتصل لكل ضيفة برابطها الخاص، بثقة وخصوصية كاملة.',
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
  stickyBuyCtaAr: 'انتقلن إلى الدفع',
  hostRoleLabelAr: 'صفة الداعية',
  hostNameLabelAr: 'اسم الداعية',
  guestFormTitleAr: 'أرسلي تهنئة تظهر على الشاشة',
  guestDeviceLockAr: 'رابطكن صدر من لوحة المضيفة ويُربط بهذا الجهاز فقط. إعادة إرساله من مدعوة تُحظر.',
  guestOnlyHintAr: 'هكذا ترى المدعوة الدعوة على جوالها.',
  guestSubmitAr: 'أظهري تهنئتي على القاعة',
  tryCtaAr: 'جرّبي دعوتك الآن',
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

export const STORE_WEDDING_VENUE_KINDS = [
  { id: 'hall', labelAr: 'قاعة' },
  { id: 'resthouse', labelAr: 'استراحة' },
  { id: 'hotel', labelAr: 'فندق' },
  { id: 'other', labelAr: 'مكان آخر' },
] as const;

export type StoreWeddingVenueKind = (typeof STORE_WEDDING_VENUE_KINDS)[number]['id'];
export type StoreWeddingOffspringKind = 'son' | 'daughter';

export const STORE_WEDDING_LIVE_DEMO = {
  voice: 'men' as StoreWeddingLiveVoice,
  hostRole: 'groom_father' as StoreWeddingLiveHostRole,
  hostName: 'أحمد',
  offspringKind: 'son' as StoreWeddingOffspringKind,
  groomName: 'عبدالله',
  brideName: 'فهدة',
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
  photoSrc: '/images/store/lab/lab-luxury-gold.png',
  panoramaSrc: '/images/store/lab/lab-wedding-panorama.png',
} as const;

export const STORE_WEDDING_LIVE_DEMO_WOMEN = {
  ...STORE_WEDDING_LIVE_DEMO,
  voice: 'women' as StoreWeddingLiveVoice,
  hostRole: 'groom_mother' as StoreWeddingLiveHostRole,
  hostName: 'نورة',
  welcomeAr: '',
  photoSrc: '/images/store/lab/lab-luxury-rosegold.png',
} as const;
