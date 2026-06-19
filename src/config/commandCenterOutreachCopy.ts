import {
  ON_DEMAND_VISIBILITY_PARTNER_NOTE_AR,
  SMART_RESPONSE_SYSTEM_LABEL_AR,
} from '@/config/onDemandVisibilityDoctrine';
import { buildAbsoluteGrowthPitchDeckUrl } from '@/config/siteOrigin';

export type CommandCenterOutreachTierFit = 'bronze' | 'gold' | 'diamond' | 'mixed';
export type CommandCenterOutreachVariant = 'initial' | 'followup';
/** deck = مقدمة + رابط عرض النمو (الافتراضي في غرفة القيادة) */
export type CommandCenterOutreachLength = 'deck' | 'full' | 'short';

export const COMMAND_CENTER_OUTREACH_DEFAULT_LENGTH: CommandCenterOutreachLength = 'deck';

const UNKNOWN_LOCATION = 'غير محدد';

export const COMMAND_CENTER_OUTREACH_DECK_LINK_INTRO_AR =
  'عرض مختصر يشرح المنصة والباقات و`نظام الاستجابة الذكية`:';

/** رابط الإحالة المعتمد — مصدر واحد لغرفة القيادة وواتساب. */
export function commandCenterGrowthPitchDeckUrl(variant: CommandCenterOutreachVariant = 'initial'): string {
  return buildAbsoluteGrowthPitchDeckUrl({
    src: 'cc',
    ref: variant === 'followup' ? 'whatsapp-followup' : 'whatsapp-initial',
  });
}

/** ترحيب — عنوان الصالون بجانب الاسم، لا بجانب «فريق حلاق ماب». */
export const COMMAND_CENTER_OUTREACH_SALUTATION_AR = (
  salonName: string,
  cityLabel?: string | null,
) => {
  const loc = cityLabel?.trim();
  if (loc) return `مرحباً ${salonName} — ${loc}،`;
  return `مرحباً ${salonName}،`;
};

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
  'يمكنكم التسجيل على المنصة مباشرة: سجّل طلبك، اختر الباقة (برونزي · ذهبي · ماسي)، وأكمل الدفع — يُستكمل التفعيل بعد السداد. «رخصة النفاذ» حزمة برمجية `B2B` للظهور عند الطلب، دون وساطة حجز أو عمولة على خدمة الحلاقة.',
  '',
  ON_DEMAND_VISIBILITY_PARTNER_NOTE_AR,
  '',
  'هل يناسبكم إرسال ملخص مختصر عن الباقات وخطوات التسجيل على المنصة؟',
].join('\n');

/** رسالة أول تواصل — صالونات ملائمة للبرونزي. */
export const COMMAND_CENTER_OUTREACH_BRONZE_BODY_AR = [
  'السلام عليكم ورحمة الله وبركاته.',
  'معكم فريق حلاق ماب — منصة ربط ذكية بين طالب الخدمة ومقدّمها.',
  '',
  'نُجهّز في منطقتكم قائمة شركاء «برونزي» — نقطة دخول عملية لرخصة النفاذ الرقمية: ظهور برمجي عند الطلب ضمن `نظام الاستجابة الذكية`، دون وساطة حجز ولا عمولة على خدمة الحلاقة.',
  '',
  'يمكنكم البدء من المنصة: تسجيل، اختيار «برونزي»، الدفع، ثم التفعيل بعد السداد — وغرفة القيادة للأسئلة والمساندة عند الحاجة.',
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
  'يمكنكم التسجيل على المنصة واختيار باقة «ذهبي»، ثم الدفع لاستكمال التفعيل. ننسّق معكم من غرفة القيادة للأسئلة والتوضيح — دون وساطة على الخدمة.',
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
  'يمكنكم التسجيل على المنصة واختيار باقة «ماسي»، ثم الدفع لاستكمال التفعيل. ننسّق معكم من غرفة القيادة للأسئلة والتوضيح.',
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

function buildShortInitialBody(tierFit: CommandCenterOutreachTierFit): string {
  switch (tierFit) {
    case 'bronze':
      return [
        'السلام عليكم ورحمة الله وبركاته.',
        'معكم فريق حلاق ماب. نُجهّز شركاء «برونزي» للظهور عند الطلب عبر `نظام الاستجابة الذكية` — دون وساطة حجز.',
        'هل نرسل ملخص نقطة الدخول وخطوات التسجيل؟',
      ].join('\n');
    case 'gold':
      return [
        'السلام عليكم ورحمة الله وبركاته.',
        `معكم فريق حلاق ماب. باقة «ذهبي»: معرض أعمال + تقييمات \`QR\` + ظهور عند الطلب.`,
        'التسجيل على المنصة متاح — نرسل ملخص الباقة وخطوات الدفع؟',
      ].join('\n');
    case 'diamond':
      return [
        'السلام عليكم ورحمة الله وبركاته.',
        `معكم فريق حلاق ماب. باقة «ماسي»: أولوية أعلى + لوحة كاملة + ظهور عند الطلب.`,
        'التسجيل على المنصة متاح — نرسل ملخص الماسي وخطوات الدفع؟',
      ].join('\n');
    default:
      return [
        'السلام عليكم ورحمة الله وبركاته.',
        `معكم فريق حلاق ماب — \`نظام الاستجابة الذكية\`: ظهور عند الطلب، دون وساطة حجز.`,
        'نرسل ملخص الباقات (برونزي · ذهبي · ماسي) وخطوات التسجيل على المنصة؟',
      ].join('\n');
  }
}

function buildShortFollowupBody(): string {
  return [
    'السلام عليكم مجدداً.',
    'تذكير لطيف من فريق حلاق ماب — ما زلنا نُكمل قائمة `نظام الاستجابة الذكية`.',
    'نرسل ملخص الباقات أو نوضّح الظهور عند الطلب؟',
  ].join('\n');
}

function buildDeckTierLine(tierFit: CommandCenterOutreachTierFit): string {
  switch (tierFit) {
    case 'bronze':
      return 'نُجهّز شركاء «برونزي» — ظهور عند الطلب ضمن `نظام الاستجابة الذكية`، دون وساطة حجز.';
    case 'gold':
      return 'رصدنا صالونكم كخيار مناسب لباقة «ذهبي» — معرض أعمال وتقييمات `QR` وظهور عند الطلب.';
    case 'diamond':
      return 'رصدنا صالونكم كخيار قوي لباقة «ماسي» — أولوية أعلى ولوحة تحكم كاملة وظهور عند الطلب.';
    default:
      return 'نُجهّز قائمة شركاء `نظام الاستجابة الذكية` — ظهور عند الطلب، دون وساطة حجز ولا عمولة على الخدمة.';
  }
}

function buildDeckInitialBody(
  tierFit: CommandCenterOutreachTierFit,
  variant: CommandCenterOutreachVariant,
): string {
  const url = commandCenterGrowthPitchDeckUrl(variant);
  return [
    'السلام عليكم ورحمة الله وبركاته.',
    `معكم فريق حلاق ماب.`,
    buildDeckTierLine(tierFit),
    '',
    COMMAND_CENTER_OUTREACH_DECK_LINK_INTRO_AR,
    url,
    '',
    'ننتظر رأيكم — ونسعد بالرد على أي سؤال.',
  ].join('\n');
}

function buildDeckFollowupBody(variant: CommandCenterOutreachVariant): string {
  const url = commandCenterGrowthPitchDeckUrl(variant);
  return [
    'السلام عليكم مجدداً.',
    `تذكير لطيف من فريق حلاق ماب — ما زلنا نُكمل قائمة الشركاء.`,
    '',
    COMMAND_CENTER_OUTREACH_DECK_LINK_INTRO_AR,
    url,
    '',
    'شكراً لوقتكم.',
  ].join('\n');
}

export function appendGrowthPitchDeckLinkToOutreachBody(body: string, variant: CommandCenterOutreachVariant): string {
  const trimmed = body.trim();
  const url = commandCenterGrowthPitchDeckUrl(variant);
  return `${trimmed}\n\n${COMMAND_CENTER_OUTREACH_DECK_LINK_INTRO_AR}\n${url}`;
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
  const length = input.length ?? COMMAND_CENTER_OUTREACH_DEFAULT_LENGTH;
  const cityLabel = formatOutreachCityLabel(input.city, input.region);

  let body: string;
  if (length === 'deck') {
    body =
      variant === 'followup'
        ? buildDeckFollowupBody(variant)
        : buildDeckInitialBody(tierFit, variant);
  } else if (length === 'short') {
    body =
      variant === 'followup'
        ? buildShortFollowupBody()
        : buildShortInitialBody(tierFit);
  } else {
    body =
      variant === 'followup'
        ? applyCityToOutreachBody(COMMAND_CENTER_OUTREACH_FOLLOWUP_BODY_AR, cityLabel)
        : applyCityToOutreachBody(buildCommandCenterOutreachBody(tierFit), cityLabel);
  }

  return `${COMMAND_CENTER_OUTREACH_SALUTATION_AR(input.salonName, cityLabel)}\n\n${body}`;
}

export function commandCenterOutreachPreviewLabel(input: {
  tierFit?: CommandCenterOutreachTierFit;
  variant?: CommandCenterOutreachVariant;
  length?: CommandCenterOutreachLength;
  usesSuggestedPitch?: boolean;
}): string {
  if (input.usesSuggestedPitch) {
    return input.length === 'deck' ? 'رسالة مخصّصة (B2B) + رابط' : 'رسالة مخصّصة (B2B)';
  }
  const tier = COMMAND_CENTER_OUTREACH_TIER_LABELS[input.tierFit ?? 'mixed'];
  const variant = input.variant === 'followup' ? 'متابعة' : 'أولى';
  const length =
    input.length === 'deck'
      ? 'عرض + رابط'
      : input.length === 'short'
        ? 'مختصرة'
        : 'كاملة';
  return `${tier} · ${variant} · ${length}`;
}

/** تذكير داخلي للفريق — لا يُنسخ للعميل. */
export const COMMAND_CENTER_OUTREACH_INTERNAL_NOTE_AR =
  `الرسائل الجاهزة تتماشى مع ${SMART_RESPONSE_SYSTEM_LABEL_AR} — لا تعد بظهور دائم ولا وساطة حجز. مسار التسجيل ذاتي على المنصة (تسجيل → باقة → دفع → تفعيل). غرفة القيادة للتواصل والعرض المختصر، لا «ترتيب يدوي» للباقة أو التفعيل. الإحالة الافتراضية: عرض النمو (Growth Pitch Deck) عبر رابط واحد — لا تكرار الشرح الطويل في واتساب.`;
