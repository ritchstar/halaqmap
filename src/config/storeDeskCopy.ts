/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
export const STORE_DESK_COPY = {
  documentTitle: 'مكتب طلبات المتجر — داخلي',
  titleAr: 'مكتب طلبات المتجر',
  kickerAr: 'halaqmap · خريطة الحل',
  leadAr:
    'صفحة مستقلة من لوحة التحكم للتعامل مع طلبات الواجهة: اجتماع وكلاء مختصين في شات واحد، فرضيات، ومسودة عرض فاخر يستعرض البرمجيات قبل الرد.',
  listTitleAr: 'الطلبات الواردة',
  emptyAr: 'لا طلبات بعد. تصل من نموذج واجهة المتجر.',
  meetingTitleAr: 'اجتماع الوكلاء',
  meetingLeadAr: 'أربعة مختصين يناقشون الطلب في شات واحد ثم يقدّمون فرضيات ومسودة للعميل.',
  showcaseTitleAr: 'استعراض البرمجيات للعرض',
  replyTitleAr: 'مسودة الرد',
  notesTitleAr: 'ملاحظات الإدارة',
  saveAr: 'حفظ المسودة',
  meetAr: 'عقد الاجتماع',
  whatsappAr: 'واتساب',
  emailAr: 'بريد',
  deniedAr: 'هذه الصفحة لإدارة المنصة فقط.',
  openaiMissingAr: 'مفتاح النموذج غير مُعدّ. اكتب المسودة يدوياً ثم احفظها أو أرسلها من واتساب والبريد.',
  agentsAr: [
    'وكيل المنتجات السحابية',
    'وكيل الطلبات الخاصة',
    'وكيل العروض الفاخرة',
    'وكيل نطاق النشاط',
  ],
} as const;

export const STORE_DESK_STATUS_AR: Record<string, string> = {
  new: 'وارد',
  studying: 'تحت الدراسة',
  offered: 'عُرض',
  closed: 'مغلق',
};
