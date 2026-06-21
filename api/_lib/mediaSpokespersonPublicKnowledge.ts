/**
 * معرفة المتحدث الإعلامي العام — مصدر الحقيقة للصفحة الرئيسية ومسار B2C/B2B.
 * يجب أن يعكس: onDemandVisibilityDoctrine · endUserExperiencePolicy · platformSmartTracking.
 */
import { PLATFORM_MANAGEMENT_EMAIL } from './agentPersonas.js';
import {
  FOUNDER_END_USER_ACTION_AR,
  FOUNDER_PARTNER_ACTION_AR,
  FOUNDER_PLATFORM_ACTION_DOCTRINE_AR,
  ON_DEMAND_VISIBILITY_END_USER_NOTE_AR,
  ON_DEMAND_VISIBILITY_FUNCTIONAL_DESCRIPTION_AR,
  ON_DEMAND_VISIBILITY_LABEL_EN,
  ON_DEMAND_VISIBILITY_PARTNER_NOTE_AR,
  SMART_RESPONSE_SYSTEM_LABEL_AR,
} from './onDemandVisibilityDoctrine.js';
import {
  ISIC_ACTIVITY_CODE,
  ISIC_ACTIVITY_CODE_LABEL_AR,
  PLATFORM_NAME_AR,
} from './geospatialLicenseDoctrine.js';
import {
  isPlatformRegulatoryInquiry,
  resolveRegulatoryReferral,
} from './platformManagementReferral.js';
import {
  ECOMMERCE_AUTH_DOCTRINE_AR,
  resolveEcommerceAuthCanonicalReply,
} from './ecommerceAuthDoctrine.js';

export type MediaSpokespersonAudience = 'consumer' | 'partner';

export type MediaSpokespersonResolvedReply = {
  reply: string;
  referredToManagement: boolean;
  source: 'regulatory' | 'specialist' | 'canonical' | 'model';
};

/** Mirror of `src/config/endUserExperiencePolicy.ts` — END_USER_TRANSPARENCY */
export const END_USER_TRANSPARENCY_AR =
  'لا توجد في المنصة وظيفة بحث بالمنطقة ولا أي طريقة بديلة لاكتشاف الحلاقين أو الصالونات. ' +
  'الطريقة الوحيدة هي منح إذن الموقع من المتصفح أو الجهاز — عندها يُفعَّل نظام الاستجابة الذكية ويُظهر فقط الشركاء المشتركين وفق بياناتك وفلترتك. ' +
  'بدون الإذن: لا نتائج. وإن لم يوجد شريك مشترك مناسب: لن يظهر أحد — لا وعود بحضور وهمي.';

export const PLATFORM_HOW_IT_WORKS_CONSUMER_AR: readonly string[] = [
  `**${FOUNDER_END_USER_ACTION_AR}:** تبدأ الاستعلام من الصفحة الرئيسية، وعند الحاجة تمنح إذن الموقع لتمكين العرض.`,
  '**معالجة وعرض فوري:** تعالج المنصة طلبك لحظياً وتقارنه ببيانات الشركاء المتاحة وفلترتك.',
  '**استعرض وتواصل:** تظهر بطاقة الصالون (صور، بنر، اتصال، واتساب، حالة مفتوح/مغلق) — التنسيق مباشرة مع الصالون بلا وساطة.',
] as const;

export const MEDIA_SPOKESPERSON_FORBIDDEN_AR: readonly string[] = [
  'ممنوع قول «اكتب اسم المدينة» أو «ابحث بالمنطقة» أو «ادخل اسم الحي» — لا توجد هذه الوظيفة.',
  'ممنوع وصف المنصة كدليل أصفر أو قائمة دائمة لكل الصالونات.',
  'ممنوع وعد ظهور دائم لأي صالون أو وعد بعدد زبائن.',
  'ممنوع قول «سجّل طلبك» للمستخدم النهائي B2C — الفعل الصحيح «ابدأ الاستعلام».',
  'ممنوع قول «ابدأ الاستعلام» لصاحب الصالون B2B — الفعل الصحيح «سجّل طلبك» أو «مسار المنشآت».',
  'ممنوع ادّعاء أن المنصة وسيط حجز أو تجمع عمولة على الحلاقة.',
  'ممنوع نفي أو تأجيل توثيق التجارة الإلكترونية للمنصة — التوثيق مكتمل وساري لدى المركز السعودي للتنافسية والأعمال (رقم 0000291761).',
  'ممنوع تأكيد/نفي ترخيص حكومي آخر غير الموثّق في عقيدة التجارة الإلكترونية — يُحال لإدارة المنصة.',
  'ممنوع استشارة قانونية أو ضريبية ملزمة — أحِل للناظر القانوني أو الإدارة.',
] as const;

const CANONICAL_SEARCH_CONSUMER_AR =
  'هلا والله! 🌟\n\n' +
  `في ${PLATFORM_NAME_AR} **ما فيه بحث بالمدينة ولا تكتب اسم منطقة** — المنطق مختلف:\n\n` +
  `١. من الرئيسية اضغط **«${FOUNDER_END_USER_ACTION_AR}»**\n` +
  '٢. اسمح للمتصفح ب**إذن الموقع** (`Geolocation`)\n' +
  `٣. يُفعَّل **${SMART_RESPONSE_SYSTEM_LABEL_AR}** (${ON_DEMAND_VISIBILITY_LABEL_EN}) ويعرض شركاء مشتركين يناسبون موقعك وفلاترك — **عند الطلب**، وليست قائمة دائمة\n\n` +
  'بعدها صفِّ بالفلاتر (مفتوح الآن، نوع الخدمة…) وتواصل مباشرة (اتصال/واتساب).\n\n' +
  '**بدون إذن الموقع = لا نتائج.** الخدمة **مجانية** ولا تحتاج حساب.\n\n' +
  'لو ما ظهر أحد: وسّع النطاق أو ألغِ فلتر «مفتوح الآن» — أو ببساطة لا يوجد شريك مشترك قريب حالياً (شفافية كاملة).';

const CANONICAL_FREE_SERVICE_AR =
  'أيوه — **مجاني 100%** للمستخدم النهائي! 🌟\n\n' +
  'لا تسجيل إلزامي، لا بريد، ولا جوال لاكتشاف الصالونات. ' +
  'المنصة تربطك بالعرض اللحظي فقط — أي اتفاق أو دفع للحلاقة يتم **مباشرة** مع الصالون.';

const CANONICAL_SMART_RESPONSE_AR =
  `${SMART_RESPONSE_SYSTEM_LABEL_AR} (${ON_DEMAND_VISIBILITY_LABEL_EN}) يعني:\n\n` +
  `${ON_DEMAND_VISIBILITY_FUNCTIONAL_DESCRIPTION_AR}\n\n` +
  `**للزائر:** ${ON_DEMAND_VISIBILITY_END_USER_NOTE_AR}\n\n` +
  'ليست خريطة ثابتة — بل استجابة برمجية لحظية عند بدء الاستعلام.';

const CANONICAL_LOCATION_PRIVACY_AR =
  'سؤال مهم — ونحن شفافين فيه 🔒\n\n' +
  '• الموقع يُطلب **فقط** عند بدء الاستعلام — لتمكين العرض المناسب\n' +
  '• يُعالَج **لحظياً** ضمن الجلسة — لا تتبع دائم ولا سجل تاريخي مستقل للموقع\n' +
  '• **بدون إذن = لا نتائج** — لا بحث بديل بالمدينة\n' +
  '• يمكنك سحب الإذن من إعدادات المتصفح في أي وقت\n\n' +
  'للتفاصيل القانونية الكاملة: **الناظر القانوني** في صفحة الخصوصية.';

const CANONICAL_CONTACT_SALON_AR =
  'بعد ما يظهر لك الصالون المناسب:\n\n' +
  '• **اتصال** أو **واتساب** من بطاقة الصالون مباشرة\n' +
  '• بعض الباقات (ذهبي/ماسي) تتيح **شات خاص** داخل المنصة — جلسة محددة ثم تنتهي\n\n' +
  'حلاق ماب **لا تحجز ولا تتحصّل** — التنسيق والدفع مع الصالون مباشرة.';

const CANONICAL_WHAT_IS_HALAQMAP_AR =
  `${PLATFORM_NAME_AR} مزوّد **حلول تقنية** سعودي (${ISIC_ACTIVITY_CODE_LABEL_AR} **${ISIC_ACTIVITY_CODE}**) — يربط الباحث عن حلاق بالصالونات **المشتركة** عبر ${SMART_RESPONSE_SYSTEM_LABEL_AR}.\n\n` +
  '• للمستخدم: مجاني — ابدأ الاستعلام\n' +
  '• للصالون: حزم رخصة نفاذ (برونزي/ذهبي/ماسي) — لا عمولة على الحلاقة\n' +
  '• العلاقة بين الزبون والصالون **مباشرة** — المنصة طرف تقني فقط';

const CANONICAL_NO_RESULTS_AR =
  'طبيعي يحصل — ونحن صريحين 🌟\n\n' +
  'أسباب محتملة:\n' +
  '• لم تُمنح إذن الموقع\n' +
  '• فلتر «مفتوح الآن» أو نطاق ضيق\n' +
  '• **لا يوجد شريك مشترك** في محيطك حالياً\n\n' +
  'جرّب: وسّع النطاق، ألغِ بعض الفلاتر، أو حدّث الصفحة. ' +
  'الظهور **عند الطلب** — ليس قائمة دائمة لكل محل في المدينة.';

const CANONICAL_PARTNER_ON_DEMAND_AR =
  `${ON_DEMAND_VISIBILITY_PARTNER_NOTE_AR}\n\n` +
  'حلاق ماب **مزوّد حلول تقنية** — تبيع **رخصة نفاذ رقمية** (30 يوم/حزمة)، لا عمولة على قصة الزبون. ' +
  `للانضمام: **«${FOUNDER_PARTNER_ACTION_AR}»** من مسار المنشآت — ومدير مبيعات B2B يفصّل الباقات.`;

function buildGeneralThenReferralReply(general: string, referral: string): string {
  return `${general}\n\n${referral}`;
}

function normalizeInquiry(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export function resolveMediaSpokespersonSpecialistReferral(
  message: string,
  audience: MediaSpokespersonAudience,
): string | null {
  const m = normalizeInquiry(message);
  if (!m) return null;

  if (isPlatformRegulatoryInquiry(m)) {
    return null;
  }

  if (audience === 'consumer' && /(?:سجّ?ل|اشتر(?:اك|ك)|باق(?:ة|ات)|رخص(?:ة|ة)|(?:برونز|ذهب|ماس)|add-?on|المناوب|المكتب\s*الخاص|انضم|شريك|صاحب\s*صالون|للمنشآت|B2B|كيف\s*(?:أ|ا)سجّ?ل\s*صالون)/iu.test(m)) {
    return buildGeneralThenReferralReply(
      'مسار الانضمام للصالونات منفصل عن تجربة الباحث عن حلاق — وهو **B2B** (حزم رخصة نفاذ برمجية).',
      'انتقل ل**مسار المنشآت** في الموقع — هناك **مدير مبيعات B2B** و**مساعد الشركاء** يشرحان الباقات (برونزي/ذهبي/ماسي) والإضافات. الفعل الصحيح للشريك: «سجّل طلبك» — لا «ابدأ الاستعلام».',
    );
  }

  if (/(?:ضريب|زكاة|vat|zatca|فاتور(?:ة|ه)\s*رسم)/iu.test(m)) {
    return buildGeneralThenReferralReply(
      'الضريبة والفوترة الرسمية خارج نطاق المتحدث الإعلامي.',
      'للتفاصيل الضريبية: **خبير ZATCA** في غرفة القيادة — وللمستندات الرسمية `admin@halaqmap.com`.',
    );
  }

  if (/(?:قضي[ةه]|محكم|دعوى|استشارة\s*قانونية\s*شخصية|تمثيل\s*قانوني|نزاع\s*قانوني)/iu.test(m)) {
    return buildGeneralThenReferralReply(
      'أشرح سياسات المنصة بشكل عام — لكن التقييم القانوني الشخصي يحتاج مختصاً.',
      'تواصل مع **الناظر القانوني** في صفحات الخصوصية/الشروط — أو `admin@halaqmap.com` للسجلات الرسمية.',
    );
  }

  if (/(?:استرداد|refund|فشل\s*سداد|moyasar|ميسر|عملية\s*مالية|تحويل\s*بنكي)/iu.test(m)) {
    return buildGeneralThenReferralReply(
      'المدفوعات تتم عبر ميسر — الحزم مسبقة الدفع ولا تُسترد بعد التفعيل إلا في خلل تقني مثبت.',
      `لمراجعة عملية محددة: ` + `\`${PLATFORM_MANAGEMENT_EMAIL}\`` + ` مع رقم الطلب.`,
    );
  }

  if (/(?:اختراق|ثغر|hack|security|cyber|تسريب|هجوم\s*سيبر)/iu.test(m)) {
    return buildGeneralThenReferralReply(
      'بلاغات الأمن تُعامل بأولوية عالية.',
      `أرسل فوراً إلى \`${PLATFORM_MANAGEMENT_EMAIL}\` بعنوان «بلاغ أمني».`,
    );
  }

  if (audience === 'partner' && /(?:كيف\s*(?:أ|ا)بحث|ابحث\s*عن\s*حلاق|مستخدم\s*نهائي|زبون\s*يبحث)/iu.test(m)) {
    return buildGeneralThenReferralReply(
      'تجربة المستخدم النهائي مختلفة عن مسار الشريك.',
      `للزائر: «${FOUNDER_END_USER_ACTION_AR}» + إذن الموقع — لا بحث بالمدينة. ${ON_DEMAND_VISIBILITY_PARTNER_NOTE_AR}`,
    );
  }

  return null;
}

export function resolveMediaSpokespersonCanonicalReply(
  message: string,
  audience: MediaSpokespersonAudience,
): string | null {
  const m = normalizeInquiry(message);
  if (!m) return null;

  if (
    /(?:كيف\s*(?:أ|ا)بحث|ابحث\s*عن\s*حلاق|طريقة\s*(?:البحث|الاستعلام)|وين\s*(?:أ|ا)بحث|بحث\s*بالمدينة|اكتب\s*(?:اسم\s*)?(?:المدينة|مدينة|حي)|أدخل\s*المدينة)/iu.test(
      m,
    )
  ) {
    return audience === 'partner'
      ? buildGeneralThenReferralReply(
          CANONICAL_PARTNER_ON_DEMAND_AR,
          `تذكير للشريك: المستخدم يبدأ بـ «${FOUNDER_END_USER_ACTION_AR}» + إذن موقع — ${END_USER_TRANSPARENCY_AR}`,
        )
      : CANONICAL_SEARCH_CONSUMER_AR;
  }

  if (/(?:هل\s*(?:الخدمة|المنصة)\s*مجان|مجاني|مجان(?:اً|ا)|(?:أ|ا)دفع\s*شي)/iu.test(m)) {
    return CANONICAL_FREE_SERVICE_AR;
  }

  if (
    /(?:نظام\s*الاستجابة|الاستجابة\s*الذكية|on-?demand|الظهور\s*عند\s*الطلب|كيف\s*يعمل\s*النظام|smart\s*response)/iu.test(
      m,
    )
  ) {
    return CANONICAL_SMART_RESPONSE_AR;
  }

  if (/(?:تحفظ(?:ون)?\s*موقع|خصوص(?:ية)?\s*الموقع|موقعي|geolocation|إذن\s*الموقع|تتبع\s*موقع)/iu.test(m)) {
    return CANONICAL_LOCATION_PRIVACY_AR;
  }

  if (/(?:أ|ا)تواصل\s*مع\s*(?:الصالون|الحلاق)|كيف\s*(?:أ|ا)تصل|واتساب|اتصال\s*مباشر/iu.test(m)) {
    return CANONICAL_CONTACT_SALON_AR;
  }

  if (/(?:ما\s*(?:هي|و)\s*حلاق\s*ماب|ما\s*هو\s*حلاق\s*ماب|عرفني\s*على\s*حلاق\s*ماب|وش\s*حلاق\s*ماب)/iu.test(m)) {
    return CANONICAL_WHAT_IS_HALAQMAP_AR;
  }

  const ecommerceAuth = resolveEcommerceAuthCanonicalReply(m);
  if (ecommerceAuth) {
    return ecommerceAuth;
  }

  if (/(?:لم\s*يظهر|ما\s*ظهر|لا\s*(?:توجد|يوجد)\s*نتائج|فارغ|بدون\s*نتائج|ليش\s*ما\s*طلع)/iu.test(m)) {
    return CANONICAL_NO_RESULTS_AR;
  }

  if (
    audience === 'partner' &&
    /(?:لماذا\s*الاستجابة|مسار\s*الشرك|قصة\s*المنص|وسيط|عمولة|ISIC|474151)/iu.test(m)
  ) {
    return CANONICAL_PARTNER_ON_DEMAND_AR;
  }

  return null;
}

export function resolvePublicMediaSpokespersonReply(
  message: string,
  audience: MediaSpokespersonAudience,
): { reply: string | null; referredToManagement: boolean; source: MediaSpokespersonResolvedReply['source'] } {
  const ecommerceAuth = resolveEcommerceAuthCanonicalReply(message);
  if (ecommerceAuth) {
    return { reply: ecommerceAuth, referredToManagement: false, source: 'canonical' };
  }

  const regulatory = resolveRegulatoryReferral(message);
  if (regulatory) {
    return { reply: regulatory, referredToManagement: true, source: 'regulatory' };
  }

  const specialist = resolveMediaSpokespersonSpecialistReferral(message, audience);
  if (specialist) {
    return { reply: specialist, referredToManagement: false, source: 'specialist' };
  }

  const canonical = resolveMediaSpokespersonCanonicalReply(message, audience);
  if (canonical) {
    return { reply: canonical, referredToManagement: false, source: 'canonical' };
  }

  return { reply: null, referredToManagement: false, source: 'model' };
}

export function buildPublicMediaSpokespersonSystemPrompt(
  basics: { activeBarbers: number; cities: number },
  audience: MediaSpokespersonAudience,
): string {
  const statsLine =
    basics.activeBarbers > 0
      ? `${basics.activeBarbers.toLocaleString('ar-SA')} شريك/صالون نشط${basics.cities > 0 ? ` في ${basics.cities} مدينة` : ''}`
      : 'شبكة شركاء تنمو في مدن المملكة';

  const audienceBlock =
    audience === 'partner'
      ? [
          '═══════════════════════════════════════',
          'جمهورك الآن: صاحب صالون / مسار B2B',
          '═══════════════════════════════════════',
          `- الفعل الصحيح: «${FOUNDER_PARTNER_ACTION_AR}» — **ممنوع** «${FOUNDER_END_USER_ACTION_AR}»`,
          `- ${ON_DEMAND_VISIBILITY_PARTNER_NOTE_AR}`,
          '- المنتج: رخصة نفاذ (برونزي 100 · ذهبي 150 · ماسي 200 ر.س/حزمة · 30 يوم) — لا عمولة',
          '- للتفاصيل التجارية: وجّه لمدير مبيعات B2B أو مساعد الشركاء',
        ].join('\n')
      : [
          '═══════════════════════════════════════',
          'جمهورك الآن: مستخدم نهائي B2C (باحث عن حلاق)',
          '═══════════════════════════════════════',
          `- الفعل الصحيح: «${FOUNDER_END_USER_ACTION_AR}» — **ممنوع** «${FOUNDER_PARTNER_ACTION_AR}»`,
          `- ${END_USER_TRANSPARENCY_AR}`,
          '- الخدمة مجانية — لا تسجيل إلزامي',
          ...PLATFORM_HOW_IT_WORKS_CONSUMER_AR.map((line) => `- ${line}`),
        ].join('\n');

  return `أنت «المتحدثة الإعلامية» لمنصة ${PLATFORM_NAME_AR} — شخصية سعودية ودودة تشرح المنصة **بدقة** لا بتخمين.

اكتب بالعربية الواضحة RTL. ضع المصطلحات الإنجليزية بين \`backticks\`. لا تبدأ فقرة عربية برقم لاتيني.

═══════════════════════════════════════
【عقيدة المنصة — ملزمة】
═══════════════════════════════════════
- ${PLATFORM_NAME_AR} **مزوّد حلول تقنية** — ${ISIC_ACTIVITY_CODE_LABEL_AR} ${ISIC_ACTIVITY_CODE}
- ${ON_DEMAND_VISIBILITY_FUNCTIONAL_DESCRIPTION_AR}
- ${FOUNDER_PLATFORM_ACTION_DOCTRINE_AR}
- لا وساطة تجارية · لا عمولة على الحلاقة · لا حجز نيابي
- ${statsLine}

${ECOMMERCE_AUTH_DOCTRINE_AR}

${audienceBlock}

═══════════════════════════════════════
【ممنوعات — لا تخالفها】
═══════════════════════════════════════
${MEDIA_SPOKESPERSON_FORBIDDEN_AR.map((line) => `- ${line}`).join('\n')}

═══════════════════════════════════════
【إحالات — متى تحيل】
═══════════════════════════════════════
- ترخيص/امتثال حكومي **آخر** (غير توثيق التجارة الإلكترونية الموثّق أعلاه) → \`${PLATFORM_MANAGEMENT_EMAIL}\` «استفسار تنظيمي»
- ضريبة/ZATCA → خبير ZATCA + الإدارة
- خصوصية/قانون تفصيلي → الناظر القانوني
- مدفوعات/استرداد → سياسة ميسر + \`${PLATFORM_MANAGEMENT_EMAIL}\` برقم الطلب
- أمن سيبراني → \`${PLATFORM_MANAGEMENT_EMAIL}\` «بلاغ أمني»
- B2B تفصيلي (من B2C) → مسار المنشآت + مدير مبيعات B2B

═══════════════════════════════════════
شخصيتك:
═══════════════════════════════════════
- سعودي دافئ: «هلا والله»، «حيّاك» — بلا إفراط
- 2–5 جمل في الغالب — أوضح من أطول
- إيموجي باعتدال: 🌟 📍 🔒 🇸🇦
- لا دين/سياسة/مزاح حساس`;
}
