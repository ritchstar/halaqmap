/**
 * برامج النمو الموحّدة — مدار · نبض · محيط
 * مصدر الحقيقة لأسماء وشرح خطط التسويق B2B/B2C للشركاء.
 */
import {
  PARTNER_EARLY_WAVE_SUBLINE_AR,
  PARTNER_EARLY_WAVE_TAGLINE_AR,
} from '@/config/partnerEarlyWaveCopy';
import { PARTNER_HERO_TAGLINE_REPUTATION_AR } from '@/config/partnerFieldSalesCopy';

export type PlatformGrowthProgramPhaseId =
  | 'orbit_readiness'
  | 'pulse_stations'
  | 'orbit_perimeter';

export type PlatformGrowthProgramPhase = {
  id: PlatformGrowthProgramPhaseId;
  order: 1 | 2 | 3;
  titleAr: string;
  shortTitleAr: string;
  /** فهم سريع — سطر أو سطران */
  simpleExplainAr: string;
  /** تفصيل أطول للعرض التسويقي */
  detailAr: string;
  internalCode: string;
};

/** الشعار الموحّد للمنظومة الثلاثية */
export const PLATFORM_GROWTH_UNIFIED_TAGLINE_AR =
  'مدار · نبض · محيط — ثلاث مراحل، خطة واحدة، استثمار لا يُترك.';

export const PLATFORM_GROWTH_SUITE_TITLE_AR = 'منظومة نمو حلاق ماب';

export const PLATFORM_GROWTH_SUITE_LEAD_AR =
  'ثلاث برامج متزامنة — لا نبيعك رخصة ونختفي؛ نبني حضورك ونصل بالطلب وندعمك محلياً.';

/** الموجة الأولى تحت برنامج محطات النبض (B2C) */
export const PLATFORM_GROWTH_PULSE_STATIONS_PHASE1 = {
  titleAr: 'محطات الإقامة',
  bodyAr:
    'الموجة الأولى: فنادق · شقق مفروشة · بنرات QR — حيث يحتاج الزائر للحلاقة قبل أن يبدأ الاستعلام بنفسه.',
} as const;

/** شعار رسمي — برنامج محيط المدار (ما بعد التفعيل) */
export const PLATFORM_GROWTH_PERIMETER_TAGLINE_AR =
  'لن نتركك وحيداً في حيّك — حلاق ماب تُسوّق معك، وتبني قنوات الوصول — لا رخصة مفتوحة بلا حدود ولا وعوداً فارغة.';

export const PLATFORM_GROWTH_PROGRAM_PHASES: readonly PlatformGrowthProgramPhase[] = [
  {
    id: 'orbit_readiness',
    order: 1,
    titleAr: 'برنامج تحضير المدار',
    shortTitleAr: 'تحضير المدار',
    simpleExplainAr: 'تثبّت حضورك في شبكة الشركاء قبل موجة الطلب.',
    detailAr:
      'انضمامك ليس «إعلاناً» — مقعد في خطة تشغيل: المنصة تُجهّز شبكة الصالونات قبل أن يصل الطلب. السؤال: «هل صالونك جاهز حين يبحث عنك الزبون؟»',
    internalCode: 'orbit_readiness_program',
  },
  {
    id: 'pulse_stations',
    order: 2,
    titleAr: 'برنامج محطات النبض',
    shortTitleAr: 'محطات النبض',
    simpleExplainAr: 'الطلب يُبنى من قنوات مدروسة — لا من موقع واحد فقط.',
    detailAr:
      'بالتوازي مع انضمامك، المنصة تفتح قنوات وصول للمستخدم: محطات الإقامة أولاً (فنادق وشقق مفروشة)، ثم قنوات تالية — منطق، لا حظ.',
    internalCode: 'pulse_stations_program',
  },
  {
    id: 'orbit_perimeter',
    order: 3,
    titleAr: 'برنامج محيط المدار',
    shortTitleAr: 'محيط المدار',
    simpleExplainAr:
      'لن نتركك وحيداً في حيّك — تُسوّق معك وتبني قنوات الوصول.',
    detailAr: PLATFORM_GROWTH_PERIMETER_TAGLINE_AR,
    internalCode: 'orbit_perimeter_program',
  },
] as const;

/** فقرة كاملة — تسجيل / لماذا تنضم */
export const PLATFORM_GROWTH_PARTNER_FULL_PITCH_AR =
  '**الانضمام بداية — لا نهاية.**\n\n' +
  '**تحضير المدار** يضعك في الشبكة قبل موجة الطلب. **محطات النبض** تجلب الباحثين من قنوات مدروسة — فنادق وشقق مفروشة أولاً. ' +
  'وبعد تفعيلك يبدأ **محيط المدار** — ' +
  PLATFORM_GROWTH_PERIMETER_TAGLINE_AR +
  '\n\n' +
  '**لا نتركك تنتظر الحظ.** من يفعّل مبكراً يبني موضعاً قبل اتساع الطلب في منطقته — لا وعود بعدد زبائن مضمون.';

/** سطر الهيرو القصير */
export const PLATFORM_GROWTH_PARTNER_HERO_LINE_AR = PARTNER_HERO_TAGLINE_REPUTATION_AR;

/** تسجيل الحلاق — مقدمة مختصرة (تُستورد في platformGrowthNarrative) */
export const PLATFORM_GROWTH_REGISTER_INTRO_AR =
  `${PARTNER_EARLY_WAVE_TAGLINE_AR} — ${PARTNER_EARLY_WAVE_SUBLINE_AR}`;

/** ما بعد تسجيل الطلب — قبل الدفع */
export const PLATFORM_GROWTH_REGISTER_SUCCESS_NOTE_AR =
  'بعد اكتمال الدفع والتفعيل — ' + PLATFORM_GROWTH_PERIMETER_TAGLINE_AR;

/** لوحة الحلاق — تركيز ما بعد التفعيل */
export const PLATFORM_GROWTH_DASHBOARD_PERIMETER_NOTE_AR =
  PLATFORM_GROWTH_PERIMETER_TAGLINE_AR;

/** سطر امتثال — يُعرض بخط صغير */
export const PLATFORM_GROWTH_COMPLIANCE_NOTE_AR =
  'الظهور يُفعَّل برمجياً عند وجود طلب نشط مناسب — البرامج أعلاه تعني التجهيز والتغطية التسويقية والتشغيلية، لا التزاماً بعدد زيارات.';

/** زر CTA للشريك */
export const PLATFORM_GROWTH_PARTNER_CTA_AR = PARTNER_EARLY_WAVE_TAGLINE_AR;

export const PLATFORM_GROWTH_LANDING_SECTION = {
  titleAr: 'مدار · نبض · محيط',
  leadAr: PLATFORM_GROWTH_SUITE_LEAD_AR,
} as const;
