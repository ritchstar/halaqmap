/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شروط الخدمة وخصوصية منتجات المتجر الرقمية.
 * يُحمَّل كسولاً مع صفحات المتجر، ولا يُستورد من App.
 */
import {
  LEGAL_ECOMMERCE_AUTH_NUMBER,
  LEGAL_ECOMMERCE_STORE_PUBLIC_NAME_AR,
  LEGAL_ENTITY_TYPE_AR,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  PARTNER_SUPPORT_EMAIL,
  PARTNER_SUPPORT_PHONE_E164,
} from '@/config/partnerLegal';
import { ISIC_ACTIVITY_CODE, ISIC_ACTIVITY_LABEL_AR } from '@/config/legalActivityScope';

export const STORE_ISSUED_CARDS_POLICY_VERSION = '2026-08-22';

export const STORE_ISSUED_CARDS_LEGAL_TITLE_AR =
  'شروط وأحكام وخصوصية منتجات المتجر الرقمية';

export const STORE_ISSUED_CARDS_LEGAL_SUBTITLE_AR =
  'قبل أن تبدأ: هذه الصفحة توضّح ماذا تشتري، كيف يظهر لضيوفك، وما الذي يبقى خاصاً. تُقرأ مع شروط الاستخدام وسياسة الخصوصية العامة.';

export type StoreIssuedCardTrack = 'paid' | 'bereavement';

export type StoreIssuedLegalSection = {
  id: string;
  title: string;
  content: string;
};

const CONTACT_PHONE_DISPLAY = '0559602685';

export const STORE_ISSUED_CARDS_LEGAL_SECTIONS: readonly StoreIssuedLegalSection[] = [
  {
    id: 'intro',
    title: 'مرحباً بك',
    content:
      `تعمل هذه الوثيقة ضمن متجر **halaqmap** الإلكتروني، والاسم الظاهر للجمهور: **${LEGAL_ECOMMERCE_STORE_PUBLIC_NAME_AR}**.\n\n` +
      'نقدّم منتجات رقمية جاهزة تضيف حضوراً حيّاً لمناسبتك أو لشاشتك:\n' +
      '- **بطاقة مناسبة:** كرت أنيق تشاركه برابط، مع تحميل صورة.\n' +
      '- **دعوة زواج تفاعلية:** قاعة حفل على الشاشة بأسماء العريس والعروس.\n' +
      '- **دعوة حرة تفاعلية:** قاعة حيّة لمناسبة تسميها بنفسك.\n' +
      '- **لاونجا1:** تشغيل شاشات اللاونج ثلاثة أشهر، مع ترحيب باسم الزبون.\n' +
      '- **تموينات الحي:** صفحة للحي ولوحة كاشير، 599 ر.س لستة أشهر أو 899 ر.س لاثني عشر شهراً.\n\n' +
      `**آخر تحديث:** ${STORE_ISSUED_CARDS_POLICY_VERSION.replace(/-/g, '/')} · **القانون الواجب:** أنظمة المملكة العربية السعودية · **النشاط:** ${ISIC_ACTIVITY_LABEL_AR} (${ISIC_ACTIVITY_CODE}).`,
  },
  {
    id: 'entity',
    title: 'من يقدّم الخدمة',
    content:
      `المتجر الموثّق هو **halaqmap**. نوع الكيان: **${LEGAL_ENTITY_TYPE_AR}**. الرقم الوطني الموحد: **${LEGAL_NATIONAL_UNIFIED_NUMBER}**. رقم توثيق التجارة الإلكترونية: **${LEGAL_ECOMMERCE_AUTH_NUMBER}**.\n\n` +
      'الدفع عبر بوابة **ميسر** على النطاق **www.halaqmap.com**.\n\n' +
      'نحن نقدّم الأداة التقنية. أنت صاحب المناسبة أو الشاشة، وأنت من يشارك الرابط مع من يشاء.',
  },
  {
    id: 'products',
    title: 'منتجاتك الجاهزة',
    content:
      '**بطاقة مناسبة.** جرّب المعاينة مجاناً بلا حساب. ثلاث طبقات بالريال السعودي: **سريعة 12** للتهنئة السريعة، **مميزة 29** للميلاد والتخرج والعيد واستقبال المولود، **فاخرة 59** للقران والملكة والاستقبال العائلي. بعد الدفع تحصل على رابط حي وصورة جاهزة للمشاركة. تظهر على البطاقة علامة: **صُممت عبر halaqmap · خريطة الحل**.\n\n' +
      '**دعوة زواج تفاعلية.** قاعة حفل حيّة: تهاني الضيوف، صور أو يوتيوب، وكرت بأسماء العريس والعروس. السعر **899 ر.س**. رابط للضيوف، ورابط لك لإدارة الصفحة.\n\n' +
      '**دعوة حرة تفاعلية.** نفس روح القاعة، لمناسبة تختار اسمها: أمسية، تخرج، تكريم أو غير ذلك. صنّف الدعوة رجالية أو نسائية من البداية. السعر **899 ر.س**.\n\n' +
      '**لاونجا1.** حزمة فعاليات على شاشة اللاونج، ولوحة تحكم، ورابط ترحيب باسم الزبون. السعر **600 ر.س** لمدة **ثلاثة أشهر**. عند التجديد تبقى الروابط نفسها وتمتدّ المدة على الشاشة ذاتها.\n\n' +
      '**تموينات الحي.** متجر للحي ولوحة كاشير: بنك سلع جاهز، طلب من الجوال، ومذكرة واتساب للتوصيل. **599 ر.س** لستة أشهر، أو **899 ر.س** لاثني عشر شهراً. طلب الزبون نقداً أو شبكة عند الباب، بلا تحصيل سلّته عبر ميسر. اشتراك صاحب التموينات عبر ميسر بوسم مستقل.',
  },
  {
    id: 'experience',
    title: 'كيف تعمل الخدمة',
    content:
      'المعاينة مجانية. الرابط الحي يُفتح بعد نجاح الدفع عبر ميسر.\n\n' +
      'من يحمل الرابط يرى صفحتك. أنت تقرر من ترسله له.\n\n' +
      'نترك لك التحكم الكامل: لا نرسل الدعوات عنك، ولا نجمع قائمة ضيوف، ولا نتتبّع الحضور. لا محادثة داخل الصفحة، ولا بيع على شاشة الضيف.\n\n' +
      'في القاعات والشاشات: يمكن للضيف ترك تهنئة أو ترحيب باسمه من رابط واحد مشترك. تظهر الرسائل على الشاشة، ويمكنك إخفاء ما لا يناسب المناسبة.',
  },
  {
    id: 'payment',
    title: 'الأسعار والدفع',
    content:
      'الأسعار المعتمدة بالريال السعودي كما تظهر على صفحة كل منتج. التحصيل عبر **ميسر** على **www.halaqmap.com**.\n\n' +
      'المعاينة تبقى مجانية. لا يُفتح الرابط الحي إلا بعد نجاح الدفع.',
  },
  {
    id: 'refund',
    title: 'الاسترجاع',
    content:
      '- بعد نجاح الدفع وتسليم الرابط الحي: **لا استرداد**، لأن المنتج رقمي وصل إليك.\n' +
      '- دفع ناجح دون تسليم الرابط بسبب خلل تقني موثّق: استرداد كامل خلال سبعة إلى أربعة عشر يوم عمل.\n' +
      '- دفع مكرر بالخطأ: نعيد المبلغ الزائد بعد المراجعة.',
  },
  {
    id: 'privacy',
    title: 'خصوصية بياناتك',
    content:
      'نلتزم بمبادئ **نظام حماية البيانات الشخصية** والإرشادات ذات الصلة من **سدايا**. هذه المادة تخص منتجات المتجر الرقمية، وتُقرأ مع سياسة الخصوصية العامة.\n\n' +
      '**ما نحتاجه لتشغيل صفحتك:**\n' +
      '- النصوص والصور والروابط التي تدخلها.\n' +
      '- نوع المنتج وسعره.\n' +
      '- سجل الدفع عبر ميسر.\n' +
      '- معرّفات تقنية للجلسة والأمان بقدر ما يلزم لحماية الصفحة.\n\n' +
      'لا نستخدم بيانات ضيوفك لبناء جمهور إعلاني أو إعادة استهداف.\n\n' +
      '**من يرى ماذا:** من يحمل الرابط يرى ما نشرته. أنت مسؤول عن نطاق المشاركة.\n\n' +
      '**المعالجون:** الاستضافة السحابية، وميسر للدفع.\n\n' +
      '**الاحتفاظ:** تُحذف المعاينات غير المنشورة خلال ثلاثين يوماً. يبقى الرابط الحي حتى توقفه أو تنتهي مدته أو يُطلب حذفه وفق النظام. سجلات الدفع تُحفظ وفق المتطلبات المحاسبية.\n\n' +
      '**حقوقك:** الاطلاع والتصحيح والحذف ضمن ما يسمح به النظام، عبر البريد أدناه. للشكاوى: https://dgp.sdaia.gov.sa/',
  },
  {
    id: 'content',
    title: 'محتوى صفحتك',
    content:
      'أنت مسؤول عن صحة ما تنشره، وعن إذن أصحاب الأسماء والصور والأرقام.\n\n' +
      'يُحظر: انتحال؛ تشهير؛ محتوى مخلّ أو محرّض؛ أرقام هوية؛ حسابات بنكية؛ روابط مالية غير مصرّح بها؛ صور أشخاص دون موافقتهم أو موافقة ولي الأمر إن كانوا قصّراً.\n\n' +
      'يجوز للإدارة إيقاف الصفحة عند المخالفة أو الطلب النظامي. إيقاف صفحة مدفوعة لمحتوى مخالف **لا يُرتّب استرداداً**.',
  },
  {
    id: 'liability',
    title: 'حدود المسؤولية',
    content:
      'تُقدَّم الخدمة بجهد تقني معقول. لا تتحمل المنشأة مسؤولية صحة الأسماء أو الأوقات أو المواقع التي تدخلها، ولا انقطاع الاستضافة أو بوابة الدفع.\n\n' +
      'هذه الوثيقة ليست استشارة شرعية أو قانونية شخصية.',
  },
  {
    id: 'updates',
    title: 'تحديث الشروط',
    content:
      'يجوز تحديث هذه السياسات. يظهر رقم النسخة أعلى الصفحة. استمرار استخدام الخدمة بعد التحديث يُعد قبولاً حيث ينطبق ذلك نظاماً.\n\n' +
      'يحق للمنصة إيقاف صفحة لحماية الأشخاص أو للامتثال.',
  },
  {
    id: 'contact',
    title: 'التواصل',
    content:
      'للاستفسار أو طلب حذف صفحتك:\n\n' +
      `**البريد:** ${PARTNER_SUPPORT_EMAIL}\n` +
      `**الهاتف:** ${CONTACT_PHONE_DISPLAY}\n` +
      `**الرقم الدولي:** +${PARTNER_SUPPORT_PHONE_E164}\n\n` +
      'في الواجهة العامة يُشار إلى **الإدارة**.',
  },
];

export type StoreIssuedConsentCheckId =
  | 'termsRead'
  | 'paidNoRefund'
  | 'paidContent'
  | 'paidStamp';

export type StoreIssuedConsentCheck = {
  id: StoreIssuedConsentCheckId;
  track: StoreIssuedCardTrack | 'both';
  label: string;
  required: boolean;
};

export const STORE_ISSUED_CARDS_CONSENT_CHECKS: readonly StoreIssuedConsentCheck[] = [
  {
    id: 'termsRead',
    track: 'both',
    required: true,
    label: 'قرأت شروط الخدمة والخصوصية أعلاه وأوافق عليها.',
  },
  {
    id: 'paidContent',
    track: 'paid',
    required: true,
    label: 'أتعهد أن النصوص والأسماء والصور التي أنشرها صحيحة، ولي حق عرضها.',
  },
  {
    id: 'paidNoRefund',
    track: 'paid',
    required: true,
    label:
      'أفهم أن المعاينة مجانية، وأن الرابط الحي يُفتح بعد الدفع عبر ميسر بالمبلغ المعروض، وأنه لا استرداد بعد تسليم الرابط.',
  },
  {
    id: 'paidStamp',
    track: 'paid',
    required: true,
    label: 'أوافق على بقاء علامة خريطة الحل على بطاقة المناسبة.',
  },
];

export function consentsForTrack(_track: StoreIssuedCardTrack): readonly StoreIssuedConsentCheck[] {
  return STORE_ISSUED_CARDS_CONSENT_CHECKS;
}

export const STORE_ISSUED_CARDS_LEGAL_FOLD_TRIGGER_AR =
  'قراءة الشروط والأحكام والتعهدات';

export const STORE_ISSUED_CARDS_LEGAL_FOLD_HINT_AR =
  'التفاصيل مطوية لتبقى الصفحة قصيرة. افتحها إن أحببت القراءة قبل الموافقة.';

export function unifiedConsentLabelForTrack(_track: StoreIssuedCardTrack): string {
  return 'أوافق على شروط الخدمة، وصحة ما أنشره، وأن المنتج رقمي بلا استرداد بعد تسليم الرابط، وبقاء علامة خريطة الحل على البطاقة.';
}

export function acceptedChecksForTrack(
  track: StoreIssuedCardTrack,
): Partial<Record<StoreIssuedConsentCheckId, boolean>> {
  const next: Partial<Record<StoreIssuedConsentCheckId, boolean>> = {};
  for (const item of consentsForTrack(track)) {
    if (item.required) next[item.id] = true;
  }
  return next;
}

export function storeIssuedCardsLegalPath(_track?: StoreIssuedCardTrack): string {
  return '/store/cards/legal';
}
