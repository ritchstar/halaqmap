/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حلانا1 — نسخة تشغيل خاصة غير معلنة. لا تُستورد من App.
 */
export const STORE_HALANA_LIVE_PUBLIC_CATALOG = false as const;
export const STORE_HALANA_LIVE_PRODUCT = 'store_halana_live' as const;
export const STORE_HALANA_LIVE_ACCENT = '#c45c7a' as const;
export const STORE_HALANA_GALLERY_MAX = 12;
export const STORE_HALANA_YOUTUBE_MAX = 6;
export const STORE_HALANA_IMAGE_MAX_CHARS = 180_000;
export const STORE_HALANA_CAPTION_MAX = 180;
export const STORE_HALANA_ATMOSPHERE = {
  hero: '/images/store/halana/halana-hero-table.jpg',
  fieldGlow: '/images/store/halana/halana-field-glow.jpg',
  cake: '/images/store/halana/halana-cake-light.jpg',
} as const;

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
  showcaseKickerAr: 'أعمال المتخصصة',
  shopLeadAr:
    'اختاري من المعرض ثم اطلبِ حلوى خاصة: وقت الوصول والعدد والنوع والحشوات. الموعد يُثبَّت بعد عربون الجدية.',
  showcaseLeadAr: 'معرض أعمال المتخصصة: صور ووصف مكتوب ولقطات. الطلب من الأيقونة أسفل الصفحة.',
  promoSectionAr: 'من المتخصصة',
  worksLeadAr: 'كل صورة عمل مكتمل، بوصف تكتبه المتخصصة من لوحتها.',
  promoTitleLabelAr: 'عنوان دعائي ظاهر في المعرض',
  promoBodyLabelAr: 'نص دعائي أو إعلاني، فقرات قصيرة',
  youtubeLabelAr: 'روابط يوتيوب: قناة أو لقطة، سطراً لكل رابط',
  youtubeTitleAr: 'لقطات من الأعمال',
  youtubeChannelAr: 'قناة المتخصصة',
  shareTitleAr: 'الرمز والقنوات',
  shareLeadAr: 'اطبعي الملصق أو افتحي كرت الجوال أو انشري رابط المعرض. الإرسال من جهازك.',
  qrPhraseAr: 'امسحي لمعرض الأعمال ثم اطلبي مسبقاً.',
  qrPrintAr: 'طباعة الملصق',
  passWhatsappAr: 'أرسل كرت الرمز على واتساب',
  instagramHintAr: 'لإنستغرام: انسخي النص ثم الصقيه في المنشور أو البايو مع صورة عمل.',
  shareCopyAr: 'انسخ النص الجاهز',
  shareCopiedAr: 'نُسخ النص.',
  shareCopyFailAr: 'تعذر النسخ. انسخي النص يدوياً.',
  shareWhatsappAr: 'واتساب',
  shareInstagramAr: 'إنستغرام',
  shareSnapAr: 'سناب',
  shareTiktokAr: 'تيك توك',
  shareTelegramAr: 'تلجرام',
  shareXAr: 'إكس',
  galleryCaptionSaveAr: 'حفظ الوصف',
  orderCtaAr: 'اطلبي حلوى خاصة',
  orderBackAr: 'العودة إلى المعرض',
  orderKickerAr: 'طلب تسعير',
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
  galleryTitleAr: 'أعمال المتخصصة',
  galleryEmptyAr: 'ستظهر أعمال المتخصصة هنا بعد رفع الصور من اللوحة.',
  galleryDeskTitleAr: 'صور المنتجات المعروضة للعميلات',
  galleryDeskLeadAr: 'ارفعي صور أعمالك واكتبي وصف كل عمل. تظهر في الصفحة الرئيسية التي توجّهين إليها العميلات، بلا وصفات.',
  galleryUploadAr: 'رفع صورة منتج',
  galleryCaptionAr: 'وصف مختصر اختياري',
  galleryRemoveAr: 'إخفاء',
  galleryFullAr: 'بلغت الصور الحد الأعلى.',
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
