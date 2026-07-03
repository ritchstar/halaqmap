export type ShiftLanguage = 'ar' | 'en' | 'ur' | 'tr' | 'fr' | 'es' | 'tl';

export type DigitalShiftLanguageDef = {
  code: ShiftLanguage;
  labelAr: string;
  labelNative: string;
  customerReplyInstruction: string;
};

/** لغات اعتراض العملاء — مصدر واحد للخادم والواجهة */
export const DIGITAL_SHIFT_SUPPORTED_LANGUAGES: DigitalShiftLanguageDef[] = [
  { code: 'ar', labelAr: 'العربية', labelNative: 'العربية', customerReplyInstruction: 'Reply in Arabic.' },
  { code: 'en', labelAr: 'English', labelNative: 'English', customerReplyInstruction: 'Reply in English.' },
  { code: 'ur', labelAr: 'اردو', labelNative: 'اردو', customerReplyInstruction: 'Reply in Urdu script.' },
  { code: 'tr', labelAr: 'التركية', labelNative: 'Türkçe', customerReplyInstruction: 'Reply in Turkish.' },
  { code: 'fr', labelAr: 'الفرنسية', labelNative: 'Français', customerReplyInstruction: 'Reply in French.' },
  { code: 'es', labelAr: 'الإسبانية', labelNative: 'Español', customerReplyInstruction: 'Reply in Spanish.' },
  {
    code: 'tl',
    labelAr: 'التاغalog',
    labelNative: 'Tagalog',
    customerReplyInstruction: 'Reply in Tagalog (Filipino).',
  },
];

const TURKISH_MARKERS =
  /[çğıöşüÇĞİÖŞÜ]|(\b(merhaba|teşekkür|tesekkür|nasılsın|nasilsin|evet|hayır|hayir|lütfen|lutfen|günaydın|gunaydin)\b)/iu;
const SPANISH_MARKERS =
  /[ñ¿¡]|(\b(hola|gracias|buenos|qué|que|cómo|como|por favor|señor|senor|disculpe|habla|gustaría|gustaria|barba|pelo|cabello|ahora|puedo|venir|ir|cortar|barbero|barbería|barberia)\b)/iu;
const FRENCH_MARKERS =
  /[àâäæçéèêëïîôùûü]|(\b(bonjour|merci|oui|non|comment|s'il|je|vous|salut|excusez)\b)/iu;
const TAGALOG_MARKERS =
  /\b(kumusta|salamat|po|opo|mga|ako|ikaw|oo|hindi|magandang|paano|saan|ng|ko|mo|naman|lang|gusto|pwede)\b/iu;

export function formatSupportedLanguagesLabelAr(): string {
  return DIGITAL_SHIFT_SUPPORTED_LANGUAGES.map((l) =>
    l.code === 'ar' ? l.labelAr : l.labelNative,
  ).join(' · ');
}

export function formatSupportedLanguagesForPrompt(): string {
  return DIGITAL_SHIFT_SUPPORTED_LANGUAGES.map(
    (l) => `${l.labelNative} (${l.code})`,
  ).join(', ');
}

export function detectClientLanguage(text: string): ShiftLanguage {
  const t = text.trim();
  if (!t) return 'ar';

  if (/[\u0600-\u06FF]/.test(t)) {
    if (/[\u0679\u0688\u0691\u0698\u06AF\u06BA\u06BE\u06C1\u06C3\u06D2]/.test(t)) return 'ur';
    return 'ar';
  }
  if (/[\u0750-\u077F]/.test(t)) return 'ur';

  if (TURKISH_MARKERS.test(t)) return 'tr';
  if (SPANISH_MARKERS.test(t)) return 'es';
  if (FRENCH_MARKERS.test(t)) return 'fr';
  if (TAGALOG_MARKERS.test(t)) return 'tl';

  return 'en';
}

export function getCustomerReplyInstruction(lang: ShiftLanguage): string {
  const def = DIGITAL_SHIFT_SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  return def?.customerReplyInstruction ?? 'Reply in Arabic.';
}

/** يتحقق أن ردّ المناوب بلسان العميل — ويرفض الخلط مع العربية */
export function replyMatchesCustomerLanguage(reply: string, expected: ShiftLanguage): boolean {
  const trimmed = reply.trim();
  if (!trimmed) return false;
  if (expected !== 'ar' && /[\u0600-\u06FF\u0750-\u077F]/.test(trimmed)) return false;
  return detectClientLanguage(trimmed) === expected;
}

/** يزيل الحروف العربية من ردّ أجنبي (مثل «¡أرحب بك Sí…») */
export function stripArabicFromReply(reply: string): string {
  return reply
    .replace(/[\u0600-\u06FF\u0750-\u077F]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([!?.،])/g, '$1')
    .trim();
}

/** يستخرج تعليمة ترحيب من المكتب الخاص (مثل «ارحبو») */
export function extractSalonGreetingHint(instructions: string[]): string | null {
  for (const inst of instructions) {
    const t = inst.trim();
    if (!t) continue;
    if (/ارحب|أرحب|ترحيب|أهلا|اهلا|welcome|bienvenid/i.test(t)) return t;
  }
  return null;
}

/** ترحيب محلي — يحوّل «ارحبو» للإسبانية/الإنجليزية ولا ينسخ العربية */
export function resolveCustomerSalonGreeting(lang: ShiftLanguage, greetingHint?: string | null): string {
  if (lang === 'ar') {
    if (greetingHint && /ارحبو/i.test(greetingHint)) return 'أهلاً وسهلاً — ارحبو!';
    if (greetingHint && /أرحب|ارحب/i.test(greetingHint)) return 'أرحب بك!';
    return 'أرحب بك!';
  }
  switch (lang) {
    case 'es':
      return '¡Bienvenido!';
    case 'en':
      return 'Welcome!';
    case 'fr':
      return 'Bienvenue !';
    case 'tr':
      return 'Hoş geldiniz!';
    case 'ur':
      return 'خوش آمدید!';
    case 'tl':
      return 'Maligayang pagdating!';
    default:
      return 'Welcome!';
  }
}

/** قفل لغة صارم — بالإنجليزية لأن النماذج تلتزم به أفضل من العربية */
export function buildCustomerLanguageSystemLock(lang: ShiftLanguage): string {
  const def = DIGITAL_SHIFT_SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  const label = def?.labelNative ?? lang;
  return [
    '═══ LANGUAGE LOCK (HIGHEST PRIORITY — OVERRIDES ALL ARABIC INSTRUCTIONS) ═══',
    `Customer language: ${label} (${lang}).`,
    `Write your ENTIRE reply in ${label} only.`,
    'Do NOT reply in Arabic unless the customer wrote in Arabic.',
    'Private office notes may be in Arabic — translate their meaning into the customer language.',
    'If a greeting says «ارحبو» or «أرحب بك», use a natural welcome in the customer language only (e.g. Spanish: «¡Bienvenido!») — never paste Arabic letters.',
    'Never mix languages in one reply.',
  ].join('\n');
}

export function getCustomerShiftFallback(
  lang: ShiftLanguage,
  ctx: { assistantName: string; barberName: string; shopOpen: boolean },
  userText: string,
  greetingHint?: string | null,
): string {
  const greet = resolveCustomerSalonGreeting(lang, greetingHint);
  const wantsVisit = /\b(ahora|now|venir|come|visit|ir|puedo|today|hoy)\b/iu.test(userText);
  if (wantsVisit && ctx.shopOpen) {
    switch (lang) {
      case 'es':
        return `${greet} Sí, puedes venir ahora. Estamos abiertos y listos para atenderte con tu corte de pelo y barba. ¡Te esperamos en ${ctx.barberName}!`;
      case 'en':
        return `${greet} Yes, you can come now. We're open and ready for your haircut and beard trim. We look forward to seeing you at ${ctx.barberName}!`;
      case 'fr':
        return `${greet} Oui, vous pouvez venir maintenant. Nous sommes ouverts et prêts à vous accueillir. À bientôt chez ${ctx.barberName} !`;
      case 'tr':
        return `${greet} Evet, şimdi gelebilirsiniz. Açığız ve sizi ağırlamaya hazırız. ${ctx.barberName} sizi bekliyor!`;
      case 'ur':
        return `${greet} جی ہاں، آپ ابھی آ سکتے ہیں۔ ہم کھلے ہیں اور آپ کی خدمت کے لیے تیار ہیں — ${ctx.barberName}۔`;
      case 'tl':
        return `${greet} Oo, puwede kang pumunta ngayon. Bukas kami at handang tumanggap sa iyo sa ${ctx.barberName}!`;
      case 'ar':
        return `${greet} نعم، يمكنك الحضور الآن. نحن مفتوحون لاستقبال الزبائن. تفضل!`;
      default:
        break;
    }
  }
  if (wantsVisit && !ctx.shopOpen) {
    switch (lang) {
      case 'es':
        return `¡Hola! Ahora mismo estamos cerrados, pero en cuanto abramos te atenderemos con gusto. ¿Te gustaría saber nuestro horario?`;
      case 'en':
        return `Hello! We're currently closed, but we'll be happy to serve you when we open. Would you like our opening hours?`;
      default:
        break;
    }
  }
  return getFallbackCustomerReply(lang, ctx.assistantName, ctx.barberName);
}

/** تطهير نهائي لردّ المناوب قبل الإرسال للعميل */
export function finalizeCustomerShiftReply(
  raw: string,
  lang: ShiftLanguage,
  ctx: { assistantName: string; barberName: string; shopOpen: boolean },
  userText: string,
  greetingHint?: string | null,
): string {
  let reply = raw.trim();
  if (lang !== 'ar') reply = stripArabicFromReply(reply);
  if (!replyMatchesCustomerLanguage(reply, lang)) {
    reply = getCustomerShiftFallback(lang, ctx, userText, greetingHint);
  }
  return reply.slice(0, 2000);
}

export function getFallbackCustomerReply(
  lang: ShiftLanguage,
  assistantName: string,
  barberName: string,
): string {
  switch (lang) {
    case 'en':
      return `Hello! I'm ${assistantName}, the digital shift assistant for ${barberName} on Halaq Map. The barber will reply soon — how can I help you in the meantime?`;
    case 'ur':
      return `السلام علیکم! میں ${assistantName}، ${barberName} کا ڈیجیٹل اسسٹنٹ (Halaq Map)۔ باربر جلد جواب دیں گے — میں ابھی آپ کی کیسے مدد کر سکتا ہوں؟`;
    case 'tr':
      return `Merhaba! Ben ${assistantName}, Halaq Map üzerinde ${barberName} için dijital nöbetçi asistanıyım. Berber yakında yanıt verecek — bu arada size nasıl yardımcı olabilirim?`;
    case 'fr':
      return `Bonjour ! Je suis ${assistantName}, l'assistant de permanence numérique pour ${barberName} sur Halaq Map. Le barbier vous répondra bientôt — comment puis-je vous aider en attendant ?`;
    case 'es':
      return `¡Hola! Soy ${assistantName}, el asistente digital de turno de ${barberName} en Halaq Map. El barbero responderá pronto — ¿en qué puedo ayudarte mientras tanto?`;
    case 'tl':
      return `Kumusta! Ako si ${assistantName}, ang digital shift assistant para kay ${barberName} sa Halaq Map. Sasagot ang barbero sa lalong madaling panahon — paano kita matutulungan ngayon?`;
    default:
      return `يا هلا! أنا ${assistantName} — المناوب الرقمي لـ${barberName} على حلاق ماب. الحلاق يرد عليك قريباً يا عمنا، تفضل — كيف أقدر أساعدك الآن؟`;
  }
}

/** نص ميزة — اكتشاف اللغة */
export const DIGITAL_SHIFT_LANGUAGE_DETECTION_FEATURE_AR =
  'اكتشاف لغة المرسل تلقائياً: يحلّل آخر رسالة العميل (الحروف والكلمات الشائعة) لتحديد لغته قبل الرد.';

export const DIGITAL_SHIFT_TRANSLATED_CHAT_FEATURE_AR =
  'شات مترجم ذكي: يرد المناوب بنفس لغة العميل في الشات الخاص — ترجمة/صياغة آلية فورية بأسلوب مهني، دون تبديل يدوي من الحلاق.';

export const DIGITAL_SHIFT_LANGUAGE_OVERSIGHT_SHARES: {
  code: ShiftLanguage;
  label: string;
  sharePercent: number;
}[] = [
  { code: 'ar', label: 'العربية', sharePercent: 45 },
  { code: 'en', label: 'English', sharePercent: 18 },
  { code: 'ur', label: 'اردو', sharePercent: 8 },
  { code: 'tr', label: 'Türkçe', sharePercent: 12 },
  { code: 'fr', label: 'Français', sharePercent: 6 },
  { code: 'es', label: 'Español', sharePercent: 7 },
  { code: 'tl', label: 'Tagalog', sharePercent: 4 },
];
