/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هدية خريطة الحل — نصوص الزائر والشروط. لا يُستورد من App.
 */
export const STORE_GIFT_CAMPAIGN_PUBLIC_ENABLED = true as const;
export const STORE_GIFT_SLOT_COUNT = 5 as const;
export const STORE_GIFT_CYCLE_CAP = 50 as const;
export const STORE_GIFT_TERMS_VERSION = 'gift-1' as const;
export const STORE_GIFT_OPEN_HOURS = 72 as const;

export type StoreGiftProductChoice = 'wedding_men' | 'wedding_women' | 'event';
export type StoreGiftVoice = 'men' | 'women';
export type StoreGiftSource = 'google' | 'youtube' | 'x' | 'snapchat' | 'friend';

export const STORE_GIFT_PRODUCT_OPTIONS: readonly {
  id: StoreGiftProductChoice;
  labelAr: string;
}[] = [
  { id: 'wedding_men', labelAr: 'افراحي1 رجالي' },
  { id: 'wedding_women', labelAr: 'افراحي1 نسائي' },
  { id: 'event', labelAr: 'اجواء1' },
] as const;

export const STORE_GIFT_EVENT_VOICE_OPTIONS: readonly {
  id: StoreGiftVoice;
  labelAr: string;
}[] = [
  { id: 'men', labelAr: 'اجواء1 رجالي' },
  { id: 'women', labelAr: 'اجواء1 نسائي' },
] as const;

export const STORE_GIFT_SOURCE_OPTIONS: readonly {
  id: StoreGiftSource;
  labelAr: string;
}[] = [
  { id: 'google', labelAr: 'بحث قوقل' },
  { id: 'youtube', labelAr: 'اليوتيوب' },
  { id: 'x', labelAr: 'منصة اكس' },
  { id: 'snapchat', labelAr: 'السناب شات' },
  { id: 'friend', labelAr: 'عن طريق صديق' },
] as const;

export const STORE_GIFT_COPY = {
  documentTitle: 'هدية خريطة الحل | متجر خريطة الحل',
  kickerAr: 'هدية خريطة الحل',
  titleAr: 'خمسة نماذج مناسبات تُهدى بالسحب التقني',
  leadAr:
    'شارك باسمك وبريدك واختر النموذج الأقرب إلى مناسبتك من افراحي1 أو اجواء1. عند اكتمال خمسين مشاركاً مؤكَّد البريد يُغلق الباب ويُجري النظام سحباً تقنياً فورياً فيُرشَّح مشاركاً واحداً تُرسل إليه روابط التشغيل، ثم تُفتح مشاركة جديدة حتى نفاذ النماذج الخمسة.',
  differenceTitleAr: 'الفرق بين النموذجين',
  weddingDiffAr: 'افراحي1 لدعوة الزواج: كرت فخم يفتح إلى قاعة حفل حيّة بستايل رجالي أو نسائي.',
  eventDiffAr: 'اجواء1 لدعوة حرة: مناسبة يسميها المشارك بنفسه، ويُصنَّف شقها رجالياً أو نسائياً من البداية.',
  formTitleAr: 'نموذج المشاركة',
  productLabelAr: 'النموذج المطلوب',
  eventVoiceLabelAr: 'شق اجواء1',
  nameLabelAr: 'الاسم الأول والثاني',
  cityLabelAr: 'المنطقة / المدينة',
  dateLabelAr: 'التاريخ المتوقع للمناسبة',
  sourceLabelAr: 'كيف سمعت بنا',
  emailLabelAr: 'البريد الإلكتروني',
  emailHintAr: 'ستُرسل رسالة لتأكيد البريد. لا يُحسب المشارك في السحب إلا بعد التأكيد. روابط التشغيل تُرسل إلى هذا البريد إن رُشّح.',
  opinionBeforeLabelAr: 'رأيك في المنتج قبل الاستخدام',
  opinionAfterLabelAr: 'رأيك في المنتج بعد استخدامه',
  optionalAr: 'اختياري',
  termsFoldTriggerAr: 'شروط هدايا خريطة الحل',
  termsLinkAr: 'اقرأ شروط هدايا خريطة الحل',
  consentAr: 'اطلعت على شروط هدايا خريطة الحل وأوافق عليها التزاماً بمبادئ الإهداء.',
  submitAr: 'أرسل طلب المشاركة',
  confirmSentAr: 'وصل الطلب. افتح رسالة التأكيد على بريدك حتى تُحتسب مشاركتك.',
  closedAr: 'أُغلقت المشاركة الحالية لإجراء السحب التقني.',
  exhaustedAr: 'أُهديت النماذج الخمسة. أسماء المرشحين باقية في هذه الصفحة.',
  nomineesTitleAr: 'المرشحون',
  cycleLabelAr: 'الدورة الحالية',
  ofSlotsAr: 'من خمسة',
  qualifiedLabelAr: 'المشاركون المؤكَّدون',
  ofCapAr: 'من خمسين',
  confirmTitleAr: 'تأكيد البريد',
  confirmLeadAr: 'يجري التحقق من رابط التأكيد.',
  confirmOkAr: 'تأكد بريدك. أنت ضمن المشاركين المؤكَّدين لهذه الدورة.',
  confirmFailAr: 'تعذر تأكيد الرابط. اطلب المشاركة من الصفحة إن لم يُحتسب بريدك.',
  needNameAr: 'اكتب الاسم الأول والثاني.',
  needCityAr: 'اكتب المنطقة أو المدينة.',
  needDateAr: 'اختر التاريخ المتوقع للمناسبة.',
  needEmailAr: 'أدخل بريداً صالحاً.',
  needProductAr: 'اختر النموذج المطلوب.',
  needEventVoiceAr: 'اختر الشق الرجالي أو النسائي لاجواء1.',
  needSourceAr: 'اختر كيف سمعت بنا.',
  needConsentAr: 'الموافقة على شروط هدايا خريطة الحل مطلوبة.',
  headerShortAr: 'هدية',
  promoBadgeAr: 'هدية خريطة الحل',
  promoTitleAr: 'خمسة نماذج مناسبات تُهدى بالسحب التقني',
  promoLeadAr: 'اختر افراحي1 أو اجواء1 وشارك. عند اكتمال الخمسين يُرشَّح مشارك وتُرسل إليه روابط التشغيل.',
  promoCtaAr: 'شارك في الهدية',
  promoAriaAr: 'إعلان هدية خريطة الحل',
} as const;

export const STORE_GIFT_TERMS_COPY = {
  documentTitle: 'شروط هدايا خريطة الحل | متجر خريطة الحل',
  kickerAr: 'شروط هدايا خريطة الحل',
  titleAr: 'مبادئ الإهداء',
  subtitleAr:
    'هذه الشروط خاصة بهدية خريطة الحل، ومستقلة عن شروط كاردي8 وعن رخصة النفاذ وعن عمولة المسوّق. الموافقة عليها من نموذج المشاركة التزام بمبادئ الإهداء.',
  versionLabelAr: 'نسخة الشروط',
  backAr: 'العودة إلى الهدية',
  sections: [
    {
      titleAr: 'موضوع الهدية',
      bodyAr:
        'الهدية نموذج تشغيل واحد لمناسبة واحدة من افراحي1 أو اجواء1 حسب اختيار المشارك عند التسجيل: كرت الدعوة، قاعة الحفل، لوحة المضيف، وروابط الضيف التي يصدرها المستفيد من لوحته. ليست نقداً، ولا ترخيصاً مفتوحاً، ولا تفعيلاً لمناسبات متعددة، ولا كاردي8 ولا منتجات الحي.',
    },
    {
      titleAr: 'الدخول إلى السحب التقني',
      bodyAr:
        'لا يُحتسب المشارك ضمن الخمسين إلا بعد تأكيد البريد من الرابط المرسل إليه. بريد واحد لكل حملة. عند اكتمال الخمسين يُغلق الباب ويُجري النظام سحباً تقنياً فورياً فيُرشَّح مشاركاً واحداً يأخذ النموذج الذي اختاره. ثم تُفتح دورة جديدة حتى نفاذ خمسة نماذج. الأسماء الظاهرة هي الاسم الأول والثاني فقط.',
    },
    {
      titleAr: 'التشغيل والروابط',
      bodyAr:
        'تُرسل روابط التشغيل إلى بريد المرشَّح. رابط الضيف يصدر من لوحة المضيف لكل مدعو ويُرسل من واتساب جهاز المستفيد. المنصة لا تحفظ أرقام المدعوين ولا ترسل نيابة عنه ولا تمسك دفتر حضور ولا RSVP.',
    },
    {
      titleAr: 'المدة والمرجعية',
      bodyAr:
        'ساعة التشغيل ستون يوماً من أول دخول إلى الرابط. البيانات تبقى بمرجعية الإيميل. إن رغب المستفيد بتشغيل دائم بعد ذلك يشتري المنتج نفسه على `www.halaqmap.com` بوسم افراحي1 أو اجواء1 دون خلط بفاتورة الرخصة.',
    },
    {
      titleAr: 'إن لم يُفتح البريد',
      bodyAr:
        'إن لم يُفتح إيميل المرشَّح خلال اثنتين وسبعين ساعة من الإرسال، يُرشَّح بديل من المشاركين المؤكَّدين في الدورة نفسها. لا تُعلن قائمة البدلاء للجمهور.',
    },
    {
      titleAr: 'الخصوصية والنشر',
      bodyAr:
        'الحقول المجموعة لتشغيل الهدية وإرسال الروابط ومعرفة القناة التي وصل منها المشارك. لا تُستخدم لدفتر عرسان ولا لحملة خصم تلقائية. لا يُنشر تقييم ولا تفاصيل المناسبة إلا بموافقة لاحقة مستقلة. الرأي قبل الاستخدام وبعده اختياري ولا يُشترط للحصول على الهدية.',
    },
  ],
} as const;

export function giftProductLabelAr(choice: StoreGiftProductChoice, eventVoice?: StoreGiftVoice | null): string {
  if (choice === 'wedding_men') return 'افراحي1 رجالي';
  if (choice === 'wedding_women') return 'افراحي1 نسائي';
  if (eventVoice === 'women') return 'اجواء1 نسائي';
  if (eventVoice === 'men') return 'اجواء1 رجالي';
  return 'اجواء1';
}

export function giftTrialKey(choice: StoreGiftProductChoice): 'wedding' | 'event' {
  return choice === 'event' ? 'event' : 'wedding';
}

export function giftTrialVoice(choice: StoreGiftProductChoice, eventVoice?: StoreGiftVoice | null): StoreGiftVoice {
  if (choice === 'wedding_women') return 'women';
  if (choice === 'wedding_men') return 'men';
  return eventVoice === 'women' ? 'women' : 'men';
}
