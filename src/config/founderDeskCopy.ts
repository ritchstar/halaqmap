/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/** رقم واتساب مكتب المؤسس — نفس خط الدعم، بدون سحب `partnerLegal`. */
export const FOUNDER_DESK_WHATSAPP_E164 = '966559602685' as const;

export const FOUNDER_DESK_MAX_BODY = 800;
export const FOUNDER_DESK_TTL_MS = 60 * 60 * 1000;

export const FOUNDER_DESK_COPY = {
  brandLatin: 'halaqmap',
  publicNameAr: 'خريطة الحل',
  badgeAr: 'شات مباشر ٦٠ دقيقة',
  statusAr: 'متاح للمحادثة',
  subtitleAr: 'محادثة خاصة مع الإدارة',
  whatsappAriaAr: 'واتساب مباشر',
  chatAriaAr: 'شات مباشر ستون دقيقة',
  chatCtaAr: 'محادثة ٦٠ دقيقة',
  whatsappPrefillAr: 'مرحباً، أريد محادثة مباشرة مع halaqmap — خريطة الحل.',
  chatTitleAr: 'محادثة خاصة مع الإدارة',
  chatIntroAr: 'جلسة مستقلة تنتهي تلقائياً بعد ستين دقيقة. الرد يصلك هنا من الإدارة مباشرة.',
  privacyNoticeAr: 'هذه المحادثة خاصة لكل عميل على حدة. لا يراها إلا أنت والإدارة، وفق',
  privacyShortAr: 'محادثة مستقلة لكل عميل. لا يراها إلا أنت والإدارة.',
  privacyPolicyLinkAr: 'سياسة الخصوصية',
  whatsappPrefillStoreAr: 'مرحباً، أكتب من واجهة المتجر الإلكتروني.',
  emptyAr: 'ابدأ برسالتك، ويصلك الرد هنا.',
  expiredAr: 'انتهت الجلسة. يمكنك فتح واتساب أو بدء جلسة جديدة لاحقاً.',
  unavailableAr: 'الشات غير جاهز الآن. تواصل عبر واتساب.',
  sendAr: 'إرسال',
  youAr: 'أنت',
  visitorAr: 'الزائر',
  /** ظاهر للعامة فقط — لا تُذكر كلمة المؤسس خارج الإدارة. */
  deskReplyAr: 'الإدارة',
  remainingAr: 'متبقّي من الجلسة',
  startFailedAr: 'تعذّر بدء المحادثة.',
  sendFailedAr: 'تعذّر إرسال الرسالة.',
  limitAr: 'بلغت حد الرسائل لهذه الجلسة.',
  visitorLandingHintAr: 'هذه صفحة هبوط غير معلنة. المحادثة هنا تصل مباشرة إلى الإدارة.',
  visitorPageTitleAr: 'halaqmap — خريطة الحل — محادثة خاصة',
  openStandaloneAr: 'فتح المحادثة في صفحة مستقلة',
  standaloneHintAr: 'صفحة هادئة للتركيز. المحادثة خاصة بك وحدك مع الإدارة.',
  backToPartnersAr: 'العودة لمسار الشركاء',
} as const;

/** لقب داخلي — صندوق الإدارة ومركز القيادة فقط. */
export const FOUNDER_DESK_ADMIN_COPY = {
  founderAr: 'المؤسس',
  inboxTitleAr: 'مكتب المؤسس — مستقبل المحادثات',
  inboxHintAr: 'صفحة داخلية غير مفهرسة. المحادثات تصل من مسار الشركاء ومن واجهة المتجر إلى الصندوق نفسه.',
  inboxEmptyAr: 'لا محادثات بعد.',
  tableMissingAr: 'طبّق ترحيل القاعدة `161_founder_desk_chat.sql` ثم `164_founder_desk_origin.sql` وأعد التحميل.',
  originPartnersAr: 'مسار الشركاء',
  originStoreAr: 'واجهة المتجر',
  pageTitleAr: 'حلاق ماب — مكتب المؤسس',
  newArrivalAr: 'وصلت محادثة جديدة.',
  newReplyAr: 'وصلت رسالة جديدة من زائر.',
  enableSoundAr: 'تفعيل الصوت',
  soundReadyAr: 'الصوت جاهز',
  unreadLabelAr: 'غير مقروء',
  loginGateTitleAr: 'صندوق محادثات الإدارة',
  loginGateBodyAr: 'هذه الصفحة لمتابعة الرد من متصفح الجوال. المحادثات من مسار الشركاء وواجهة المتجر. يلزم دخول الإدارة أولاً.',
  loginGateCtaAr: 'دخول الصندوق',
  backToListAr: 'المحادثات',
} as const;
