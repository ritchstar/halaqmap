/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/** رقم واتساب مكتب المؤسس — نفس خط الدعم، بدون سحب `partnerLegal`. */
export const FOUNDER_DESK_WHATSAPP_E164 = '966559602685' as const;

export const FOUNDER_DESK_MAX_BODY = 800;
export const FOUNDER_DESK_TTL_MS = 60 * 60 * 1000;

export const FOUNDER_DESK_COPY = {
  nameAr: 'حلاق ماب',
  badgeAr: 'شات مباشر ٦٠ دقيقة',
  statusAr: 'متاح للمحادثة',
  subtitleAr: 'محادثة خاصة مع الإدارة',
  whatsappAriaAr: 'واتساب مباشر',
  chatAriaAr: 'شات مباشر ستون دقيقة',
  chatCtaAr: 'محادثة ٦٠ دقيقة',
  whatsappPrefillAr: 'مرحباً، أريد محادثة مباشرة مع حلاق ماب.',
  chatTitleAr: 'محادثة خاصة مع الإدارة',
  chatIntroAr: 'جلسة خاصة تنتهي تلقائياً بعد ستين دقيقة. الرد يصلك هنا من الإدارة مباشرة.',
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
  visitorPageTitleAr: 'حلاق ماب — محادثة خاصة',
  openStandaloneAr: 'فتح المحادثة في صفحة مستقلة',
  standaloneHintAr: 'صفحة هادئة للتركيز على المحادثة مع الإدارة.',
  backToPartnersAr: 'العودة لمسار الشركاء',
} as const;

/** لقب داخلي — صندوق الإدارة ومركز القيادة فقط. */
export const FOUNDER_DESK_ADMIN_COPY = {
  founderAr: 'المؤسس',
  inboxTitleAr: 'مكتب المؤسس — مستقبل المحادثات',
  inboxHintAr: 'صفحة داخلية غير مفهرسة. المحادثات تصل من بنر مسار الشركاء.',
  inboxEmptyAr: 'لا محادثات بعد.',
  tableMissingAr: 'طبّق ترحيل القاعدة `161_founder_desk_chat.sql` ثم أعد التحميل.',
  pageTitleAr: 'حلاق ماب — مكتب المؤسس',
  newArrivalAr: 'وصلت محادثة جديدة.',
  newReplyAr: 'وصلت رسالة جديدة من زائر.',
  enableSoundAr: 'تفعيل الصوت',
  soundReadyAr: 'الصوت جاهز',
  unreadLabelAr: 'غير مقروء',
  loginGateTitleAr: 'صندوق محادثات الشركاء',
  loginGateBodyAr: 'هذه الصفحة لمتابعة الرد على محادثات بنر الشركاء من متصفح الجوال. يلزم دخول الإدارة أولاً.',
  loginGateCtaAr: 'دخول الصندوق',
  backToListAr: 'المحادثات',
} as const;
