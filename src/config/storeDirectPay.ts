/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نظام موحّد لتمرير تعليمات الدفع. شريك تقني: لا عمولة على الحرفة، لا تحصيل عبر المنصة.
 * لا يُستورد من App.
 */
export const STORE_DIRECT_PAY_PRODUCTS = [
  'store_halana_live',
  'store_kitchen_live',
  'store_grocers_live',
  'store_produce_live',
  'store_restaurant_live',
  'store_cafe_live',
  'store_wedding_live',
  'store_event_live',
  'store_lounge_live',
] as const;

export type StoreDirectPayProduct = (typeof STORE_DIRECT_PAY_PRODUCTS)[number];

/** كشف التفاصيل للعميل بعد طلب أو عرض سعر. القاعات والبطاقات بلا تحصيل من الضيف. */
export const STORE_DIRECT_PAY_GUEST_PRODUCTS = [
  'store_halana_live',
  'store_kitchen_live',
  'store_grocers_live',
  'store_produce_live',
  'store_restaurant_live',
  'store_cafe_live',
] as const;

export const STORE_DIRECT_PAY_SARIE_KINDS = ['mobile', 'email', 'entity'] as const;
export type StoreDirectPaySarieKind = (typeof STORE_DIRECT_PAY_SARIE_KINDS)[number];

export const STORE_DIRECT_PAY_COPY = {
  titleAr: 'وسائل التحويل',
  leadAr:
    'خريطة الحل شريك تقني: تعرض تعليمات أدخلها المشغّل، ولا تستلم المبلغ ولا تؤكد وصوله ولا تأخذ عمولة على الحرفة. العلاقة المالية بين المشغّل وعميله بمسؤوليتهما.',
  deskLeadAr:
    'الآيبان ومعرّف سريع ورقم STC Bank والرابط الخارجي لا تظهر في الصفحة العامة. تظهر بعد الطلب أو عرض السعر. النقد والشبكة عند الاستلام إن فعّلتهما.',
  waitAr: 'بعد قبول العرض أو إرسال الطلب تظهر هنا تعليمات التحويل لهذا الطلب فقط.',
  bankAr: 'البنك',
  beneficiaryAr: 'اسم المستفيد',
  ibanAr: 'الآيبان',
  stcAr: 'STC Bank',
  stcMobileAr: 'جوال التحويل في STC Bank',
  sarieAr: 'معرّف سريع',
  sarieKindAr: 'نوع المعرّف',
  sarieMobileAr: 'جوال',
  sarieEmailAr: 'بريد',
  sarieEntityAr: 'الرقم الموحّد للمنشأة',
  externalAr: 'رابط دفع خارجي',
  externalHintAr: 'رابط HTTPS أنشأته في حسابك لدى مزوّد مرخّص. بلا اختصار وبلا رابط حر.',
  copyAr: 'نسخ بيانات التحويل',
  openLinkAr: 'الانتقال للدفع',
  proofAr: 'إثبات العملية المرتبطة بهذا الطلب',
  proofCtaAr: 'رفع الإثبات',
  proofSavedAr: 'وُفع الإثبات. الوصول لا يُؤكَّد حتى يراجعه المشغّل.',
  proofHintAr: 'لا ترفع كشف حساب كاملاً ولا رمز تحقق ولا بيانات دخول.',
  cashAr: 'نقد عند الاستلام',
  networkAr: 'شبكة عند الاستلام',
  saveAr: 'حفظ وسائل التحويل',
  savedAr: 'حُفظت وسائل التحويل.',
  publicBankAr: 'تحويل بنكي',
  publicStcAr: 'STC Bank',
  publicSarieAr: 'سريع',
  publicExternalAr: 'رابط دفع',
  publicCashAr: 'نقد عند الاستلام',
  publicNetworkAr: 'شبكة عند الاستلام',
  policyCtaAr: 'سياسة وسائل الدفع المباشر',
  enableIbanAr: 'إظهار التحويل البنكي',
  enableStcAr: 'إظهار STC Bank',
  enableSarieAr: 'إظهار معرّف سريع',
  enableExternalAr: 'إظهار الرابط الخارجي',
} as const;

export const STORE_DIRECT_PAY_TRUSTED_HOSTS = [
  'moyasar.com',
  'tap.company',
  'hyperpay.com',
  'paytabs.com',
  'geidea.net',
  'payfort.com',
  'stcpay.com.sa',
  'stcpay.com',
  'urpay.com.sa',
  'myfatoorah.com',
  'edfaapay.com',
  'stripe.com',
  'checkout.com',
] as const;
