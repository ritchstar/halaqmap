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
  /[ñ¿¡]|(\b(hola|gracias|buenos|qué|que|cómo|como|por favor|señor|senor|disculpe|habla)\b)/iu;
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

/** توزيع تقريبي للعرض الإداري (ليس بيانات حية) */
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
