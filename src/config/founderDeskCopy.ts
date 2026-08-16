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
  subtitleAr: 'محادثة خاصة مع المؤسس',
  whatsappAriaAr: 'واتساب مباشر',
  chatAriaAr: 'شات مباشر ستون دقيقة',
  chatCtaAr: 'محادثة ٦٠ دقيقة',
  whatsappPrefillAr: 'مرحباً، أريد محادثة مباشرة مع حلاق ماب.',
  chatTitleAr: 'محادثة خاصة مع المؤسس',
  chatIntroAr: 'جلسة خاصة تنتهي تلقائياً بعد ستين دقيقة. الرد يصلك هنا من المؤسس مباشرة.',
  emptyAr: 'ابدأ برسالتك، ويصلك الرد هنا.',
  expiredAr: 'انتهت الجلسة. يمكنك فتح واتساب أو بدء جلسة جديدة لاحقاً.',
  unavailableAr: 'الشات غير جاهز الآن. تواصل عبر واتساب.',
  sendAr: 'إرسال',
  youAr: 'أنت',
  visitorAr: 'الزائر',
  founderAr: 'المؤسس',
  remainingAr: 'متبقّي من الجلسة',
  startFailedAr: 'تعذّر بدء المحادثة.',
  sendFailedAr: 'تعذّر إرسال الرسالة.',
  limitAr: 'بلغت حد الرسائل لهذه الجلسة.',
  inboxTitleAr: 'مكتب المؤسس — مستقبل المحادثات',
  inboxHintAr: 'صفحة داخلية غير مفهرسة. المحادثات تصل من بنر مسار الشركاء.',
  inboxEmptyAr: 'لا محادثات بعد.',
  tableMissingAr: 'طبّق ترحيل القاعدة `161_founder_desk_chat.sql` ثم أعد التحميل.',
  visitorLandingHintAr: 'هذه صفحة هبوط غير معلنة. المحادثة هنا تصل مباشرة إلى مكتب المؤسس.',
} as const;
