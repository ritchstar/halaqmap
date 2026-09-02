/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حلانا1 — نسخة تشغيل خاصة غير معلنة. لا تُستورد من App.
 */
export const STORE_HALANA_LIVE_PUBLIC_CATALOG = false as const;
export const STORE_HALANA_LIVE_PRODUCT = 'store_halana_live' as const;
export const STORE_HALANA_LIVE_ACCENT = '#c45c7a' as const;

export const STORE_HALANA_REQUEST_STATUSES = [
  'new',
  'quoted',
  'awaiting_deposit',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'declined',
] as const;

export type StoreHalanaRequestStatus = (typeof STORE_HALANA_REQUEST_STATUSES)[number];

export const STORE_HALANA_LIVE_COPY = {
  documentTitle: 'حلانا1 | متجر خريطة الحل',
  kickerAr: 'حلانا1 — نسخة تشغيل خاصة',
  titleAr: 'حلانا1',
  shopLeadAr:
    'اختاري من المعرض أو املئي طلب حلوى خاصة: وقت الوصول والعدد والنوع والحشوات. الموعد يُثبَّت بعد عربون الجدية.',
  refWarnAr:
    'الصورة المرجعية توضح التغليف أو الصينية أو الترتيب. التنفيذ يتبع أسلوب المتخصصة وخاماتها، وليس نسخاً حرفياً.',
  depositWarnAr:
    'لا يُحجز اليوم إلا بعد تحويل عربون الجدية وتأكيد المتخصصة من اللوحة. أرسلي صورة التحويل على واتساب.',
  pickupWarnAr:
    'إن تأخّر الاستلام أو التوصيل بعد جهوز الطلب فقد تتأثر الجودة، وذلك خارج عهدة المتخصصة إن كان الطلب جاهزاً في موعده.',
  changeWarnAr: 'يُقبل تعديل النكهة أو الشكل أو اللون قبل بدء التجهيز بوقت كافٍ فقط.',
  formTitleAr: 'طلب حلوى خاصة',
  deliverAtAr: 'وقت الوصول المطلوب',
  quantityAr: 'العدد',
  sweetTypeAr: 'النوع',
  fillingsAr: 'الحشوات المفضلة',
  refNoteAr: 'وصف التغليف أو الصينية أو الترتيب',
  guestNameAr: 'الاسم',
  guestWhatsappAr: 'واتساب للتواصل',
  submitAr: 'إرسال طلب التسعير',
  sentAr: 'وصل الطلب. المتخصصة تراجعه ثم ترسل عرض السعر.',
  flavorsTitleAr: 'النكهات المتوفرة',
  policyTitleAr: 'سياسة الطلب المسبق',
  readyTitleAr: 'جاهز لتاريخ معيّن',
  quotesTitleAr: 'آراء تختارها المتخصصة',
  deskTitleAr: 'لوحة حلانا1',
  deskLeadAr: 'طلبات التسعير، عرض السعر، ثم تأكيد العربون لقفل الموعد.',
  quoteCtaAr: 'إرسال عرض السعر',
  depositCtaAr: 'تأكيد العربون وقفل الموعد',
  whatsappCtaAr: 'واتساب من الجهاز',
  issueTitleAr: 'إصدار حلانا1',
  issueLeadAr:
    'نسخة غير معلنة تُرسل إلى بريد المتخصصة بالاسم. ليست منتج متجر معلناً، ولا سلة ميسر، ولا تجربة عامة.',
  issueNameAr: 'اسم المتخصصة',
  issueEmailAr: 'البريد',
  issueCtaAr: 'إصدار النسخة وإرسال الروابط',
  issuedAr: 'أُرسلت روابط الصفحة واللوحة إلى البريد.',
  statusAr: {
    new: 'جديد',
    quoted: 'عُرض السعر',
    awaiting_deposit: 'بانتظار العربون',
    confirmed: 'مؤكد والموعد مقفول',
    preparing: 'قيد التجهيز',
    ready: 'جاهز',
    completed: 'مكتمل',
    declined: 'اعتذار',
  } as const,
} as const;

export const STORE_HALANA_DEFAULT_POLICY_AR =
  'يُطلب الطلب مسبقاً. يُثبَّت اليوم بعد عربون جدية بصورة تحويل بنكي. التعديل في النكهة أو الشكل أو اللون قبل التجهيز فقط. الجودة بعد تأخر الاستلام أو المندوب خارج العهدة إن جهز الطلب في موعده.';

export const STORE_HALANA_DEFAULT_FLAVORS_AR = 'فانيليا\nشوكولاتة\nفستق\nتمر';
