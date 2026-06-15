import {
  ON_DEMAND_VISIBILITY_PARTNER_NOTE_AR,
  SMART_RESPONSE_SYSTEM_LABEL_AR,
} from '@/config/onDemandVisibilityDoctrine';

export type CommandCenterOutreachTierFit = 'bronze' | 'gold' | 'diamond' | 'mixed';
export type CommandCenterOutreachVariant = 'initial' | 'followup';
export type CommandCenterOutreachLength = 'full' | 'short';

const UNKNOWN_LOCATION = 'غير محدد';

/** مقدمة موحّدة — مرحلة ما قبل التشغيل الكامل للاستعلامات. */
export const COMMAND_CENTER_OUTREACH_SALUTATION_AR = (salonName: string) =>
  `مرحباً ${salonName}،`;

export const COMMAND_CENTER_OUTREACH_TIER_LABELS: Record<CommandCenterOutreachTierFit, string> = {
  bronze: 'برونزي',
  gold: 'ذهبي',
  diamond: 'ماسي',
  mixed: 'عام',
};

/** رسالة أول تواصل — عامة (ذهبي/ماسي أو غير محدد). */
export const COMMAND_CENTER_OUTREACH_PRELAUNCH_BODY_AR = [
  'السلام عليكم ورحمة الله وبركاته.',
  'معكم فريق حلاق ماب — منصة ربط ذكية بين طالب الخدمة ومقدّمها عبر `نظام الاستجابة الذكية`.',
  '',
  'نُعدّ حالياً قائمة شركاء صالونات في منطقتكم. عند بدء تشغيل الاستعلامات المناسبة، يُتابَع التواصل مباشرة من غرفة القيادة لدينا لترتيب «رخصة النفاذ» — حزمة برمجية `B2B` للظهور عند الطلب، دون وساطة حجز أو عمولة على خدمة الحلاقة.',
  '',
  ON_DEMAND_VISIBILITY_PARTNER_NOTE_AR,
  '',
  'هل يناسبكم إرسال ملخص مختصر عن الباقات (برونزي · ذهبي · ماسي) قبل التفعيل؟',
].join('\n');

/** رسالة أول تواصل — صالونات ملائمة للبرونزي. */
export const COMMAND_CENTER_OUTREACH_BRONZE_BODY_AR = [
  'السلام عليكم ورحمة الله وبركاته.',
  'معكم فريق حلاق ماب — منصة ربط ذكية بين طالب الخدمة ومقدّمها.',
  '',
  'نُجهّز في منطقتكم قائمة شركاء «برونزي» — نقطة دخول عملية لرخصة النفاذ الرقمية: ظهور برمجي عند الطلب ضمن `نظام الاستجابة الذكية`، دون وساطة حجز ولا عمولة على خدمة الحلاقة.',
  '',
  'عند بدء التشغيل، نتابع معكم مباشرة من غرفة القيادة لإتمام التفعيل.',
  '',
  'هل نرسل لكم ملخص البرونزي وخطوات التسجيل؟',
].join('\n');

/** رسالة أول تواصل — صالونات ملائمة للذهبي. */
export const COMMAND_CENTER_OUTREACH_GOLD_BODY_AR = [
  'السلام عليكم ورحمة الله وبركاته.',
  'معكم فريق حلاق ماب — منصة ربط ذكية بين طالب الخدمة ومقدّمها.',
  '',
  'رصدنا صالونكم كخيار مناسب لباقة «ذهبي»: معرض أعمال، تقييمات `QR`، ورسائل العملاء — مع ظهور برمجي عند تنشّط الاستعلام المناسب ضمن `نظام الاستجابة الذكية`.',
  '',
  'نُجهّز قائمة الشركاء حالياً. عند بدء التشغيل في منطقتكم، نتواصل معكم مباشرة من غرفة القيادة لإتمام التفعيل — التنسيق مباشرة معكم دون وساطة على الخدمة.',
  '',
  'هل نرسل لكم تفاصيل الباقة الذهبية وخطوات التسجيل؟',
].join('\n');

/** رسالة أول تواصل — صالونات ملائمة للماسي. */
export const COMMAND_CENTER_OUTREACH_DIAMOND_BODY_AR = [
  'السلام عليكم ورحمة الله وبركاته.',
  'معكم فريق حلاق ماب — منصة ربط ذكية بين طالب الخدمة ومقدّمها.',
  '',
  'رصدنا صالونكم كخيار قوي لباقة «ماسي»: أولوية أعلى عند الاستعلام، لوحة تحكم كاملة، معرض موسّع، وخدمات متقدّمة — ضمن `نظام الاستجابة الذكية` (ظهور عند الطلب، لا حضور دائم).',
  '',
  'نُجهّز قائمة الشركاء حالياً. عند بدء التشغيل في منطقتكم، نتابع معكم مباشرة من غرفة القيادة لترتيب التفعيل والباقة المناسبة.',
  '',
  'هل نرسل لكم ملخص الماسي ومسار التسجيل؟',
].join('\n');

/** متابعة لطيفة — بعد عدم الرد. */
export const COMMAND_CENTER_OUTREACH_FOLLOWUP_BODY_AR = [
  'السلام عليكم مجدداً.',
  'تذكير لطيف من فريق حلاق ماب — ما زلنا نُكمل قائمة شركاء `نظام الاستجابة الذكية` في منطقتكم.',
  '',
  'إذا رغبتم بملخص الباقات أو توضيح كيف يعمل الظهور عند الطلب (دون وساطة حجز)، يسعدنا الرد من غرفة القيادة.',
  '',
  'شكراً لوقتكم.',
].join('\n');

/** @deprecated استخدم buildCommandCenterOutreachBody — للتوافق الخلفي. */
export const DEFAULT_OUTREACH_MESSAGE = COMMAND_CENTER_OUTREACH_PRELAUNCH_BODY_AR;

export function formatOutreachCityLabel(city?: string | null, region?: string | null): string | null {
  const c = city?.trim();
  const r = region?.trim();
  if (c && c !== UNKNOWN_LOCATION && r && r !== UNKNOWN_LOCATION && c !== r) {
    return `${c} — ${r}`;
  }
  if (c && c !== UNKNOWN_LOCATION) return c;
  if (r && r !== UNKNOWN_LOCATION) return r;
  return null;
}

export function applyCityToOutreachBody(body: string, cityLabel: string | null): string {
  if (!cityLabel) return body;
  return body.replace(/في منطقتكم/g, `في ${cityLabel}`).replace(/منطقتكم/g, cityLabel);
}

export function buildCommandCenterOutreachBody(tierFit: CommandCenterOutreachTierFit = 'mixed'): string {
  switch (tierFit) {
    case 'bronze':
      return COMMAND_CENTER_OUTREACH_BRONZE_BODY_AR;
    case 'gold':
      return COMMAND_CENTER_OUTREACH_GOLD_BODY_AR;
    case 'diamond':
      return COMMAND_CENTER_OUTREACH_DIAMOND_BODY_AR;
    default:
      return COMMAND_CENTER_OUTREACH_PRELAUNCH_BODY_AR;
  }
}

function buildShortInitialBody(tierFit: CommandCenterOutreachTierFit, cityLabel: string | null): string {
  const loc = cityLabel ? ` في ${cityLabel}` : '';
  switch (tierFit) {
    case 'bronze':
      return [
        'السلام عليكم ورحمة الله وبركاته.',
        `معكم فريق حلاق ماب${loc}. نُجهّز شركاء «برونزي» للظهور عند الطلب عبر \`نظام الاستجابة الذكية\` — دون وساطة حجز.`,
        'هل نرسل ملخص نقطة الدخول وخطوات التسجيل؟',
      ].join('\n');
    case 'gold':
      return [
        'السلام عليكم ورحمة الله وبركاته.',
        `معكم فريق حلاق ماب${loc}. باقة «ذهبي»: معرض أعمال + تقييمات \`QR\` + ظهور عند الطلب.`,
        'نُتابع من غرفة القيادة عند التشغيل. نرسل التفاصيل؟',
      ].join('\n');
    case 'diamond':
      return [
        'السلام عليكم ورحمة الله وبركاته.',
        `معكم فريق حلاق ماب${loc}. باقة «ماسي»: أولوية أعلى + لوحة كاملة + ظهور عند الطلب.`,
        'نُتابع من غرفة القيادة عند التشغيل. نرسل ملخص الماسي؟',
      ].join('\n');
    default:
      return [
        'السلام عليكم ورحمة الله وبركاته.',
        `معكم فريق حلاق ماب${loc} — \`نظام الاستجابة الذكية\`: ظهور عند الطلب، دون وساطة حجز.`,
        'نُكمل قائمة الشركاء قبل التشغيل. نرسل ملخص الباقات (برونزي · ذهبي · ماسي)؟',
      ].join('\n');
  }
}

function buildShortFollowupBody(cityLabel: string | null): string {
  const loc = cityLabel ? ` في ${cityLabel}` : '';
  return [
    'السلام عليكم مجدداً.',
    `تذكير لطيف من حلاق ماب${loc} — ما زلنا نُكمل قائمة \`نظام الاستجابة الذكية\`.`,
    'نرسل ملخص الباقات أو نوضّح الظهور عند الطلب؟',
  ].join('\n');
}

export function buildCommandCenterOutreachMessage(input: {
  salonName: string;
  tierFit?: CommandCenterOutreachTierFit;
  variant?: CommandCenterOutreachVariant;
  length?: CommandCenterOutreachLength;
  city?: string | null;
  region?: string | null;
}): string {
  const tierFit = input.tierFit ?? 'mixed';
  const variant = input.variant ?? 'initial';
  const length = input.length ?? 'full';
  const cityLabel = formatOutreachCityLabel(input.city, input.region);

  let body: string;
  if (length === 'short') {
    body =
      variant === 'followup'
        ? buildShortFollowupBody(cityLabel)
        : buildShortInitialBody(tierFit, cityLabel);
  } else {
    body =
      variant === 'followup'
        ? applyCityToOutreachBody(COMMAND_CENTER_OUTREACH_FOLLOWUP_BODY_AR, cityLabel)
        : applyCityToOutreachBody(buildCommandCenterOutreachBody(tierFit), cityLabel);
  }

  return `${COMMAND_CENTER_OUTREACH_SALUTATION_AR(input.salonName)}\n\n${body}`;
}

export function commandCenterOutreachPreviewLabel(input: {
  tierFit?: CommandCenterOutreachTierFit;
  variant?: CommandCenterOutreachVariant;
  length?: CommandCenterOutreachLength;
  usesSuggestedPitch?: boolean;
}): string {
  if (input.usesSuggestedPitch) return 'رسالة مخصّصة (B2B)';
  const tier = COMMAND_CENTER_OUTREACH_TIER_LABELS[input.tierFit ?? 'mixed'];
  const variant = input.variant === 'followup' ? 'متابعة' : 'أولى';
  const length = input.length === 'short' ? 'مختصرة' : 'كاملة';
  return `${tier} · ${variant} · ${length}`;
}

/** تذكير داخلي للفريق — لا يُنسخ للعميل. */
export const COMMAND_CENTER_OUTREACH_INTERNAL_NOTE_AR =
  `الرسائل الجاهزة تتماشى مع ${SMART_RESPONSE_SYSTEM_LABEL_AR} — لا تعد بظهور دائم ولا وساطة حجز. التواصل المباشر يُدار من غرفة القيادة عند التشغيل.`;
