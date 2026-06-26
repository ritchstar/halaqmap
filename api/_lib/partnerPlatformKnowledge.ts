/**
 * مصدر معرفة التحديثات لمساعد الشركاء — **حدّث هذا الملف عند كل إطلاق ميزة**.
 * الحقائق التسعيرية/المنتج تُستورد تلقائياً من subscriptionPricingCopy و geospatialLicenseDoctrine.
 */
import {
  BARBER_NAME_LABEL_AR,
  GEOSPATIAL_LICENSE_ASSET_CLASS,
  ISIC_ACTIVITY_CODE,
  ISIC_ACTIVITY_CODE_LABEL_AR,
  MAP_INTEGRATION_PROTOCOL,
  PLATFORM_NAME_AR,
  UNIFIED_DIGITAL_LICENSE_LABEL_AR,
} from './geospatialLicenseDoctrine.js';
import {
  DIAMOND_PRODUCT_SMART_LABEL_AR,
  DIAMOND_PRODUCT_STANDARD_LABEL_AR,
  DIGITAL_SHIFT_ADDON_VALUE_AR,
  DIGITAL_SHIFT_MONTHLY_ADDON_SAR,
  DIGITAL_SHIFT_PRICING_ADDON_LABEL_AR,
  DIGITAL_SHIFT_PRODUCT_NAME_AR,
  DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR,
  OWNER_WATCH_FEATURE_DIAMOND_LINE_AR,
  OWNER_WATCH_FEATURE_GOLD_LINE_AR,
  OWNER_WATCH_FEATURE_INTRO_AR,
} from './subscriptionPricingCopy.js';
import {
  INVOICE_PRODUCT_DESCRIPTION_AR,
  TERM_ACTIVATE_NOW_AR,
  TERM_BUY_LICENSE_AR,
  TERM_GEOSPATIAL_DIGITAL_ASSET_AR,
  TERM_LICENSE_ACTIVATION_AR,
  TERM_PACKAGE_ACTIVATION_AR,
} from './softwareLicenseTerminology.js';
import {
  ON_DEMAND_VISIBILITY_FUNCTIONAL_DESCRIPTION_AR,
  ON_DEMAND_VISIBILITY_LABEL_EN,
  ON_DEMAND_VISIBILITY_LEGAL_DEFINITION_AR,
  ON_DEMAND_VISIBILITY_PARTNER_NOTE_AR,
  ON_DEMAND_VISIBILITY_PRODUCT_NAME_AR,
  SMART_RESPONSE_SYSTEM_LABEL_AR,
} from './onDemandVisibilityDoctrine.js';
import { composePartnerFieldSalesKnowledgePack } from './partnerFieldSalesCopy.js';

/** زِد هذا الرقم/التاريخ عند إضافة release note جديد — يظهر في GET /api/partner-assistant-chat */
export const PARTNER_ASSISTANT_KNOWLEDGE_VERSION = '2026-06-10.3' as const;

export type PartnerReleaseNote = {
  id: string;
  date: string;
  titleAr: string;
  summaryAr: string;
  bulletsAr: readonly string[];
  topics?: readonly string[];
};

/**
 * سجل التحديثات — أضف عنصراً جديداً في الأعلى عند كل إطلاق.
 * المساعد **ملزم** بالإجابة من هذا القسم عند السؤال عن التحديثات أو الميزات المذكورة.
 */
export const PARTNER_PLATFORM_RELEASE_NOTES: readonly PartnerReleaseNote[] = [
  {
    id: 'partner-field-sales-copy-2026-06-10',
    date: '2026-06-10',
    titleAr: 'نصوص التفاوض B2B — تنويع العبارات',
    summaryAr:
      'مصدر موحّد لشعارات الهيرو، FAQ الشركاء، خطافات الباقات، مقارنة السوشيال vs الاستعلام، ومعالجة الاعتراضات — مُنقّح بمبدأ الظهور عند الطلب.',
    topics: ['تسويق', 'B2B', 'مدير المبيعات', 'FAQ', 'اعتراض السعر', 'أقرب حلاق', 'سمعة'],
    bulletsAr: [
      'شعارات متنوعة: سمعة · قرب · ثقة · ROI · إغلاق CTA.',
      'FAQ موسّع (11 سؤال) — بدون وعود بعدد زبائن.',
      'معالجات جاهزة: غالي · منطقة ضعيفة · منافس · أبي أجرّب.',
      'يجوز «أقرب حلاق / بالقرب مني / في منطقتك» بعد توثيق التجارة.',
    ],
  },
  {
    id: 'regulatory-framework-canonical-2026-06-10',
    date: '2026-06-10',
    titleAr: 'الإطار النظامي الموحّد — أنشطة · توثيق · إعلام',
    summaryAr:
      'رد canonical موحّد: ISIC4 474151 (النشاط المعتمد) + 620102 + 731011 + توثيق التجارة 0000291761 + تراخيص الإعلام 167220·167221·167222.',
    topics: ['ترخيص', 'ISIC', '474151', '620102', '731011', '167220', 'امتثال', 'الوضع النظامي'],
    bulletsAr: [
      'مدير المبيعات والناظر والمتحدث يردّون بالإطار النظامي الكامل عند سؤال الترخيص.',
      'لا تُحال أسئلة الإطار الموثّق — تُحال فقط الحالات الحساسة (تفتيش · معلّق · CITC).',
    ],
  },
  {
    id: 'ecommerce-auth-verified-2026-06-10',
    date: '2026-06-10',
    titleAr: 'توثيق التجارة الإلكترونية — مكتمل وساري',
    summaryAr:
      'المنصة موثّقة رسمياً للعمل بالتجارة الإلكترونية لدى المركز السعودي للتنافسية والأعمال — رقم التوثيق 0000291761 — معروض في تذييل الموقع وصفحات الخصوصية ومسار الشركاء.',
    topics: ['توثيق', 'التجارة الإلكترونية', 'امتثال', '0000291761', 'المركز السعودي للتنافسية والأعمال'],
    bulletsAr: [
      'شهادة توثيق التجارة الإلكترونية سارية — رقم 0000291761.',
      'الجهة: المركز السعودي للتنافسية والأعمال.',
      'رقم التوثيق يظهر في تذييل الرئيسية ومسار الشركاء وصفحات الخصوصية.',
      'مدير المبيعات والمتحدث الإعلامي والناظر القانوني ملزمون بذكر التوثيق بدقة — لا «تحت المعالجة».',
    ],
  },
  {
    id: 'owner-watch-salon-monitoring-2026-06-10',
    date: '2026-06-10',
    titleAr: 'غرفة المراقبة للمالك — Owner Watch (ذهبي/ماسي)',
    summaryAr:
      'طبقة إشراف منفصلة لصاحب الرخصة: يراقب تشغيل الصالون قراءة فقط من جواله — حالة المحل، نشاط الشات (عدّ فقط)، تنبيهات، ونبض تشغيلي في الماسي — دون قراءة نصوص الزبائن.',
    topics: [
      'غرفة المراقبة',
      'Owner Watch',
      'مالك',
      'ذهبي',
      'ماسي',
      'مراقبة',
      'إشراف',
      'بريد التفعيل',
    ],
    bulletsAr: [
      OWNER_WATCH_FEATURE_INTRO_AR,
      OWNER_WATCH_FEATURE_GOLD_LINE_AR,
      OWNER_WATCH_FEATURE_DIAMOND_LINE_AR,
      'البرونزي: لا تتضمّن غرفة مراقبة — للتشغيل اليومي استخدم لوحة التحكم فقط.',
      'المالك = نفس بريد تفعيل الرخصة؛ يصله رابط magic لمرة واحدة + رابط دائم للمفضلة في بريد التفعيل (ذهبي/ماسي).',
      'قراءة فقط: لا تعديل للمنيو، لا رد على الشات، ولا عرض لنصوص محادثات العملاء — خصوصية محفوظة.',
    ],
  },
  {
    id: 'package-benefits-marketing-refresh-2026-05-23',
    date: '2026-05-23',
    titleAr: 'تحديث مزايا الباقات — صياغة أوضح للحلاق',
    summaryAr:
      'تم تحويل مزايا البرونزي والذهبي والماسي من عبارات تقنية عامة إلى منافع مباشرة للحلاق: زبون قريب، ثقة أسرع، تواصل أسهل، وتنظيم أفضل.',
    topics: ['باقات', 'مزايا', 'برونزي', 'ذهبي', 'ماسي', 'تسويق', 'QR', 'شات', 'مواعيد'],
    bulletsAr: [
      'البرونزي: بداية رسمية بأقل تعقيد — ظهور عند الطلب، بطاقة صالون واضحة، صور أساسية، أوقات عمل، حالة مفتوح/مغلق، وشهادة تفعيل.',
      'الذهبي: لرفع الثقة والتحويل — معرض 20 صورة، QR تقييم، واتساب وشات مباشر، لوحة تحديث للصور والمنيو والأسعار، وخدمات كبار السن وذوي الاحتياجات.',
      'الماسي: للصدارة والتنظيم — معرض 40 صورة، بنر فاخر، شات مترجم، إدارة مواعيد، دعم مخصص، وإمكانية إضافة المناوب الرقمي الذكي.',
      'منطق الجرد: كل ميزة أضيفت لأنها تجذب طلباً قريباً، ترفع الثقة، تسرّع التواصل، تقلل الفوضى، أو تمنح الحلاق تحكماً ذاتياً في ملفه.',
    ],
  },
  {
    id: 'on-demand-visibility-doctrine-2026-05-23',
    date: '2026-05-23',
    titleAr: `${ON_DEMAND_VISIBILITY_PRODUCT_NAME_AR} — منطق الظهور عند الطلب`,
    summaryAr:
      'تمت ترقية تسمية المنتج وعقيدته الرسمية: حزمنا التقنية أصبحت رخصة نفاذ رقمية ضمن نظام الاستجابة الذكية. الظهور برمجي يُفعَّل عند تنشّط الطلب في محيط المزود — لا قائمة دائمة على الخريطة.',
    topics: [
      'تسمية',
      'رخصة',
      'نفاذ',
      'استجابة',
      'الظهور عند الطلب',
      'On-Demand Visibility',
      'حزم',
      'باقات',
      'قانوني',
      'حماية',
      'PDPL',
    ],
    bulletsAr: [
      `الاسم الرسمي الموحّد للمنتج: «${ON_DEMAND_VISIBILITY_PRODUCT_NAME_AR}» — يحلّ محل التسميات السابقة في الباقات والوصف.`,
      `النظام الذي تُبنى عليه الحزم: «${SMART_RESPONSE_SYSTEM_LABEL_AR}» (الظهور عند الطلب · ${ON_DEMAND_VISIBILITY_LABEL_EN}).`,
      `الوصف الوظيفي للجمهور: ${ON_DEMAND_VISIBILITY_FUNCTIONAL_DESCRIPTION_AR}`,
      `التعريف القانوني للامتثال والحماية: ${ON_DEMAND_VISIBILITY_LEGAL_DEFINITION_AR}`,
      `ما يُقال للشريك: ${ON_DEMAND_VISIBILITY_PARTNER_NOTE_AR}`,
      'ما يتغيّر عملياً للحلاق: لا تغيير في السعر (برونزي 100 · ذهبي 150 · ماسي 200) — يتغيّر فقط منطق الظهور: استجابة برمجية عند الطلب بدل قائمة دائمة، مع أولويات استجابة مختلفة لكل مستوى.',
      'الحماية القانونية: الصياغة تحمي المنصة من شكاوى عدم الظهور الدائم، لأن الرخصة لا تتضمّن التزاماً بالإشغال الدائم للمساحات الرقمية.',
    ],
  },
  {
    id: 'platform-cyber-defense-shield',
    date: '2026-05-23',
    titleAr: 'درع الدفاع السيبراني — حماية المنصة على مدار الساعة',
    summaryAr:
      'منصة حلاق ماب محميّة بدرع دفاع سيبراني متقدّم — إجراءات أمنية موحّدة على بياناتك وعلى المدفوعات بمعايير `PDPL` السعودية.',
    topics: ['أمان', 'حماية', 'سيبراني', 'PDPL', 'خصوصية', 'أمن'],
    bulletsAr: [
      'تشفير في النقل (`TLS 1.2+` / `TLS 1.3`) مع تقييم `SSL Labs A+` على `halaqmap.com` — وعند الراحة لقاعدة البيانات والملفات.',
      'فصل صارم لصلاحيات الإدارة — لا يستطيع أي مشغّل الوصول لبياناتك المالية إلا بضوابط الحوكمة.',
      'مراقبة مستمرة للسلوك الشاذ، تنبيهات تلقائية، واستجابة حادثة بمعايير `NIST 800-61`.',
      'الالتزام بنظام حماية البيانات الشخصية السعودي (`PDPL`) ومتطلبات الهيئة الوطنية للأمن السيبراني (`NCA ECC`).',
      'لن تُكشف لك تفاصيل عمليات الدفاع — هذا حماية لك ولمنصتك.',
    ],
  },
  {
    id: 'partner-agent-council-orchestration',
    date: '2026-05-19',
    titleAr: 'مجلس استشارة مساعد الشركاء — المناوب + التشغيل المركزي',
    summaryAr:
      'مساعد الشركاء يستشير داخلياً ملخصات المناوب الذكي والتشغيل المركزي (وقابل للتوسع لكل الوكلاء) ويجيب للشريك دون كشف العمل الداخلي.',
    topics: ['مساعد', 'مجلس', 'وكيل', 'أسطول', 'مناوب', 'استشارة'],
    bulletsAr: [
      'أسئلة المناوب والعملاء: إجابة من معرفة المناوب + معايير التشغيل المركزية للجودة.',
      'لا يُذكر للشريك: قائد أسطول، labs، migrations، أو مسارات API.',
      'للأسئلة المعقدة: استشارة مجلس داخلية ثم رد واحد بلغة منتج واضحة.',
    ],
  },
  {
    id: 'digital-shift-software-addon',
    date: '2026-05-19',
    titleAr: 'المناوب الرقمي الذكي — إضافة برمجية متقدمة (Software Add-on)',
    summaryAr:
      '«المناوب الرقمي الذكي 🌙» لم يعد مدمجاً ضمن الماسية؛ هو Add-on اختياري +25 ر.س/حزمة رخصة يعزّز الرخصة التقنية للماسية.',
    topics: ['المناوب', 'المناوب الرقمي', 'ماسي', 'Add-on', '225', '25'],
    bulletsAr: [
      `${DIAMOND_PRODUCT_STANDARD_LABEL_AR}: 200 ر.س/حزمة رخصة (30 يوم إدراج).`,
      `${DIAMOND_PRODUCT_SMART_LABEL_AR}: 225 ر.س/حزمة (= 200 + ${DIGITAL_SHIFT_MONTHLY_ADDON_SAR} Add-on).`,
      `${DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR} — ${DIGITAL_SHIFT_ADDON_VALUE_AR}`,
      'كيف يتعامل المناوب مع العملاء: يعترض الشات الخاص عند إغلاق المحل أو بعد مهلة تأخر الرد (افتراضي 3 دقائق)، يرد بأسلوب سعودي مهني، يكتشف لغة العميل ويرد بنفس اللغة (عربي · English · اردو · Türkçe · Français · Español · Tagalog).',
      'لا يغيّر أسعار الخدمة ولا يتعامل مع محفظة العميل — آداب وضيافة وجدولة فقط؛ رصيد محفظة المناوب (هللات) على صالون الحلاق.',
      'يُفعَّل من لوحة الحلاق ← تبويب «المناوب الذكي» بعد شراء Add-on مع رخصة ماسية.',
    ],
  },
  {
    id: 'payment-success-digital-certificate',
    date: '2026-05-19',
    titleAr: 'صفحة نجاح الدفع — شهادة تفعيل رقمية',
    summaryAr:
      'بعد تأكيد الدفع تُعرض لوحة نجاح تعرض اسم المنصة، رقم الرخصة الرقمية الموحد، كود النشاط 474151، واسم الحلاق/الصالون.',
    topics: ['نجاح الدفع', 'شهادة', 'رخصة', '474151', 'HM-CERT'],
    bulletsAr: [
      `اسم المنصة: ${PLATFORM_NAME_AR}.`,
      `${UNIFIED_DIGITAL_LICENSE_LABEL_AR}: صيغة HM-CERT-YYYYMMDD-XXXX.`,
      `${ISIC_ACTIVITY_CODE_LABEL_AR}: ${ISIC_ACTIVITY_CODE}.`,
      `${BARBER_NAME_LABEL_AR}: من الطلب أو من لقطة الجغرافيا في الشهادة.`,
      'بروتوكول الربط الآلي للخريطة (api_driven_v1) يُفعَّل بعد ربط الإحداثيات.',
    ],
  },
  {
    id: 'geospatial-license-manager',
    date: '2026-05-23',
    titleAr: `${ON_DEMAND_VISIBILITY_PRODUCT_NAME_AR} — Digital Access Licence`,
    summaryAr:
      'المنتج B2B هو رخصة نفاذ رقمية ضمن نظام الاستجابة الذكية (ISIC 474151) — حضور غير ثابت يُفعَّل عند الطلب، وليس وساطة حجز أو عمولة حلاقة.',
    topics: ['رخصة', '474151', 'ISIC', 'Geospatial', 'نفاذ', 'استجابة', 'On-Demand'],
    bulletsAr: [
      `التسمية الرسمية: ${TERM_PACKAGE_ACTIVATION_AR} و${TERM_LICENSE_ACTIVATION_AR}.`,
      `الأصل على الخريطة: ${TERM_GEOSPATIAL_DIGITAL_ASSET_AR} بدلاً من «إعلان».`,
      `أزرار الشراء: «${TERM_BUY_LICENSE_AR}» و«${TERM_ACTIVATE_NOW_AR}».`,
      `الفئة التقنية: ${GEOSPATIAL_LICENSE_ASSET_CLASS} · ${MAP_INTEGRATION_PROTOCOL}.`,
      INVOICE_PRODUCT_DESCRIPTION_AR,
    ],
  },
] as const;

function composePartnerProductFactsPack(): string {
  return [
    '### حقائق المنتج والتسعير (مُحدَّثة تلقائياً — مصدر تشغيلي)',
    `- ${PLATFORM_NAME_AR} — ${ON_DEMAND_VISIBILITY_PRODUCT_NAME_AR}.`,
    `- النظام التقني: ${SMART_RESPONSE_SYSTEM_LABEL_AR} (${ON_DEMAND_VISIBILITY_LABEL_EN}).`,
    `- الوصف الوظيفي للجمهور: ${ON_DEMAND_VISIBILITY_FUNCTIONAL_DESCRIPTION_AR}`,
    `- التعريف القانوني: ${ON_DEMAND_VISIBILITY_LEGAL_DEFINITION_AR}`,
    `- ${ISIC_ACTIVITY_CODE_LABEL_AR}: **${ISIC_ACTIVITY_CODE}** (${GEOSPATIAL_LICENSE_ASSET_CLASS}).`,
    '- أسعار حزمة رخصة النفاذ (30 يوم نفاذ / حزمة واحدة):',
    '  · برونزي: 100 ر.س/حزمة',
    '  · ذهبي: 150 ر.س/حزمة',
    '  · ماسي (رخصة نفاذ): 200 ر.س/حزمة',
    `  · ${DIGITAL_SHIFT_PRICING_ADDON_LABEL_AR} — للماسية فقط (اختياري).`,
    `  · ${DIAMOND_PRODUCT_SMART_LABEL_AR}: **225 ر.س/حزمة** (= 200 + ${DIGITAL_SHIFT_MONTHLY_ADDON_SAR}).`,
    '',
    '### مزايا الباقات — صياغة مقنعة للحلاق',
    '- **البرونزي:** بداية رسمية بأقل تعقيد: ظهور عند الطلب للمستخدمين المناسبين، بطاقة صالون فيها موقع/اتصال/واتساب/صور أساسية، أوقات عمل وحالة مفتوح/مغلق، وشهادة تفعيل بعد الدفع.',
    '- **الذهبي:** مناسب لتحويل الظهور إلى ثقة: كل مزايا البرونزي + معرض حتى 20 صورة، QR تقييم رسمي، واتساب وشات مباشر بجلسة خاصة 60 دقيقة، لوحة تحديث للصور والبنر والمنيو والأسعار، وخدمات كبار السن وذوي الاحتياجات عند توفرها.',
    `- **الذهبي — غرفة المراقبة:** ${OWNER_WATCH_FEATURE_GOLD_LINE_AR}`,
    '- **الماسي:** مناسب للصالون الطموح للصدارة: كل مزايا الذهبي + أعلى أولوية ماسية، معرض حتى 40 صورة، بنر فاخر وشارة نخبة، شات مترجم فورياً، إدارة مواعيد وحجوزات، ودعم فني مخصص 24/7.',
    `- **الماسي — غرفة المراقبة:** ${OWNER_WATCH_FEATURE_DIAMOND_LINE_AR}`,
    '- **المناوب الرقمي Add-on:** للماسية فقط؛ يرد في الشات عند الإغلاق أو تأخر الرد، يرحّب بالعميل، ويخفف ضغط التشغيل دون تغيير أسعار الخدمات أو تحصيل أموال.',
    '',
    '### رد جاهز على «لماذا لا يظهر اسمي دائماً على الخريطة؟»',
    `- ${ON_DEMAND_VISIBILITY_PARTNER_NOTE_AR}`,
    '- التفسير المهني: الرخصة لا تشمل التزاماً بالظهور الدائم؛ هي رخصة استجابة برمجية عند الطلب — كفاءة استهداف لا قائمة دائمة.',
    '',
    '### المناوب الرقمي الذكي — إجابة جاهزة (استخدمها عند السؤال)',
    `- **ما هو؟** ${DIGITAL_SHIFT_PRODUCT_NAME_AR} — ${DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR}.`,
    `- **السعر:** +${DIGITAL_SHIFT_MONTHLY_ADDON_SAR} ر.س لكل حزمة رخصة نفاذ ماسية (منفصل عن 200 ر.س).`,
    `- **القيمة:** ${DIGITAL_SHIFT_ADDON_VALUE_AR}`,
    '- **التشغيل مع العملاء:**',
    '  1) يشتغل في الشات الخاص مع العميل (وليس واتساب خارجي).',
    '  2) عند إغلاق المحل: يتولى الردود تلقائياً.',
    '  3) أثناء الدوام: يتدخل بعد مهلة تأخير (افتراضي 3 دقائق) إذا لم يرد الحلاق.',
    '  4) يرد بلغة العميل تلقائياً (7 لغات مدعومة).',
    '  5) يدير الضيافة والآداب — **لا** يعدّل أسعار الخدمات ولا يتحصّل من العميل.',
    '- **التفعيل:** شراء Add-on مع الماسية → لوحة الحلاق → تبويب المناوب الذكي → تفعيل وضبط الاسم ومهلة الرد.',
    '',
    '### صفحة نجاح الدفع',
    `- بعد الدفع الناجح: ${UNIFIED_DIGITAL_LICENSE_LABEL_AR}، ${ISIC_ACTIVITY_CODE_LABEL_AR} ${ISIC_ACTIVITY_CODE}، ${BARBER_NAME_LABEL_AR}، و${PLATFORM_NAME_AR}.`,
  ].join('\n');
}

function composePartnerReleaseNotesPack(): string {
  const lines = [
    `### سجل التحديثات (Knowledge v${PARTNER_ASSISTANT_KNOWLEDGE_VERSION})`,
    'عند سؤال «ما الجديد؟» أو «كيف يعمل المناوب في الماسية؟» أو أي موضوع مذكور أدناه — **أجب بثقة من هذا القسم** ولا تعتذر عن نقص معلومات.',
    '',
  ];
  for (const note of PARTNER_PLATFORM_RELEASE_NOTES) {
    lines.push(`#### [${note.date}] ${note.titleAr}`);
    lines.push(note.summaryAr);
    for (const b of note.bulletsAr) lines.push(`- ${b}`);
    lines.push('');
  }
  return lines.join('\n').trim();
}

export function composePartnerPlatformKnowledgePack(): string {
  return [
    composePartnerProductFactsPack(),
    composePartnerFieldSalesKnowledgePack(),
    composePartnerReleaseNotesPack(),
  ].join('\n\n');
}

export function getPartnerAssistantKnowledgeMeta() {
  return {
    version: PARTNER_ASSISTANT_KNOWLEDGE_VERSION,
    releaseNoteCount: PARTNER_PLATFORM_RELEASE_NOTES.length,
    latestReleaseId: PARTNER_PLATFORM_RELEASE_NOTES[0]?.id ?? null,
    latestReleaseDate: PARTNER_PLATFORM_RELEASE_NOTES[0]?.date ?? null,
  };
}
