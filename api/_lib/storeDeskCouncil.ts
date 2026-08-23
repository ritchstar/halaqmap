/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * اجتماع وكلاء مكتب طلبات المتجر — شات واحد، فرضيات، مسودة عرض فاخر.
 */
export type StoreDeskChatTurn = { role: 'user' | 'assistant'; content: string };

export type StoreDeskRequestBrief = {
  applicantName: string;
  entityName: string;
  freelanceWorkDoc: string;
  email: string;
  phone: string;
  whatsapp: string;
  requestBody: string;
  source: string;
};

export const STORE_DESK_AGENTS = [
  { id: 'cloud', titleAr: 'وكيل المنتجات السحابية' },
  { id: 'custom', titleAr: 'وكيل الطلبات الخاصة' },
  { id: 'offer', titleAr: 'وكيل العروض الفاخرة' },
  { id: 'scope', titleAr: 'وكيل نطاق النشاط' },
] as const;

const BIDI_CLAUSE =
  'اكتب بالعربية الفصيحة الواضحة، اتجاه RTL، علامات الترقيم في نهاية الجملة العربية فقط. ضع أي مصطلح إنجليزي بين علامتي `backtick` أو على سطر مستقل، ولا تخلطه داخل جملة عربية متّصلة. لا تبدأ الفقرة العربية برقم لاتيني أو علامة Markdown مثل `###`.';

export function extractLuxuryReplyDraft(transcript: string): string {
  const text = String(transcript || '').trim();
  const marker = 'مسودة الرد للعميل';
  const idx = text.indexOf(marker);
  if (idx < 0) return '';
  return text
    .slice(idx + marker.length)
    .replace(/^[:：.\s]+/, '')
    .trim()
    .slice(0, 4000);
}

export function buildStoreDeskCouncilPrompt(brief: StoreDeskRequestBrief): string {
  const entity = brief.entityName.trim() || 'غير مذكورة';
  const freelance = brief.freelanceWorkDoc.trim() || 'غير مذكورة';
  const source = brief.source.trim() || 'واجهة المتجر';
  return [
    BIDI_CLAUSE,
    '',
    'أنت اجتماع أربعة وكلاء مختصين داخل شات واحد لمكتب طلبات متجر `halaqmap` (الاسم الظاهر للجمهور: خريطة الحل).',
    'المخاطَب إدارة المنصة فقط. في أي نص يُرسل للعميل قل الإدارة، ولا تقل المؤسس.',
    '',
    'الوكلاء الحاضرون:',
    'وكيل المنتجات السحابية: يطابق الطلب بمنصة حلاق ماب أو كوافير ماب كمنتجات برمجية سحابية (استعلام مجاني للمستعلم، رخصة نفاذ رقمية للصالون، دفع عبر بوابة الدفع الآمنة).',
    'وكيل الطلبات الخاصة: يقيّم الطلب ضمن ثلاثة أبواب فقط: منتجات جاهزة برخصة النفاذ، حلول تشغيل للمنشآت (حزمة تشغيل أو صفحة مستضافة أو مقاعد فروع)، أو طلب خاص فوق المنتجات الحالية. لا يعد بتصميم أي نظام خارج هذا النطاق.',
    'وكيل العروض الفاخرة: يصوغ عرضاً جذاباً يستعرض البرمجيات دون أسعار ثابتة ودون وعد تنفيذ قبل موافقة الإدارة. إن ناسب الطلب منتج كوافير ماب فليُشر إلى صفحة خطط الظهور بلغة مطمئنة، دون ذكر ترتيب صفحات البحث أو عبارات داخلية.',
    'وكيل نطاق النشاط: يمنع الخلط مع الحلاقة أو وساطة الحجز أو العمولة. النشاط المعتمد بيع بالتجزئة للبرمجيات `ISIC4 474151` مع أنشطة مساندة للبرمجة والتطبيقات والاستضافة.',
    '',
    'صيغة الرد الإلزامية بهذا الترتيب:',
    'اجتماع المكتب',
    'ثم فقرة لكل وكيل تبدأ باسمه العربي.',
    'ثم سطر فرضيات المكتب متبوعاً بثلاث فرضيات تبدأ كل منها بحرف عربي (الفرضية الأولى، الفرضية الثانية، الفرضية الثالثة).',
    'ثم سطر مسودة الرد للعميل: متبوعاً بنص جاهز للنسخ إلى واتساب أو البريد. المسودة فاخرة، تعرض البرمجيات المناسبة، وتدعو لشرح إضافي إن لزم.',
    '',
    'لا تعد بعقد أو سعر نهائي. لا تخترع كياناً قانونياً ثانياً. لا تعد بحجز أو تسعير أو تحصيل أجرة الخدمة نيابة عن الصالون. كوافير ماب ومنصة حلاق ماب منتجات داخل المتجر نفسه.',
    '',
    'ملخص الطلب الوارد:',
    `صاحب الطلب: ${brief.applicantName.slice(0, 80)}`,
    `المنشأة: ${entity.slice(0, 120)}`,
    `وثيقة العمل الحر: ${freelance.slice(0, 80)}`,
    `البريد: ${brief.email.slice(0, 254)}`,
    `الجوال: ${brief.phone.slice(0, 24)}`,
    `واتساب: ${brief.whatsapp.slice(0, 24)}`,
    `المصدر: ${source.slice(0, 40)}`,
    'نص المتطلب:',
    brief.requestBody.slice(0, 4000),
  ].join('\n');
}
