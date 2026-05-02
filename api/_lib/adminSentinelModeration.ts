/**
 * فحص خادمي خفيف للرسائل (روابط / التفاف / مفردات عالية الخطورة) — لا يُخزّن المحتوى كاملاً في الردود العامة.
 * الهدف: تقليل إرسال محتوى ضار إلى نموذج الدردشة وليس بديلاً عن مراجعة بشرية.
 */

const URL_RE = /\bhttps?:\/\/[^\s]+|www\.[^\s]+/i;
const PHONE_RE = /(\+966|00966|05)\d{8,9}\b|\b05\d{8}\b/;
const BYPASS_RE =
  /واتس|واتساب|تيليجرام|تلغرام|انستا|instagram|snap|سناب|رقمي|خاص|dm\b|direct/i;
const PROFANITY_RE =
  /\b(fuck|shit|bitch)\b|\b(كس|طيز|زب|خرا|لعن|قحب|منيوك)\b/i;

export type ModerationOutcome = {
  blocked: boolean;
  reasons: string[];
};

export function moderateUserPlaintext(text: string): ModerationOutcome {
  const t = text.trim();
  const reasons: string[] = [];
  if (URL_RE.test(t)) reasons.push('link');
  if (BYPASS_RE.test(t)) reasons.push('circumvention_hint');
  if (PHONE_RE.test(t)) reasons.push('phone_share');
  if (PROFANITY_RE.test(t)) reasons.push('profanity');
  return { blocked: reasons.length > 0, reasons };
}
