/**
 * قفل هوية المنصة: حلاق ماب = حلاقة رجالية فقط.
 * يمنع هلوسة النماذج عن صالون «رجالي ونسائي» / unisex في ردود المناوب للعملاء.
 */

/** يُحقَن في system prompt (إنجليزي أولاً — النماذج تلتزم به أقوى). */
export const DIGITAL_SHIFT_MENS_ONLY_SYSTEM_LOCK = [
  '═══ SALON IDENTITY LOCK (ABSOLUTE — NEVER VIOLATE) ═══',
  'Halaq Map (حلاق ماب) is a MEN\'S barbershop platform only.',
  'This salon serves MEN only: men\'s haircut, beard, mustache, and men\'s grooming.',
  'NEVER say or imply that the salon serves women, ladies, girls, or is unisex / for both genders.',
  'Forbidden claims (any language): women\'s salon, ladies barber, unisex, men and women, peluquería de damas/mujeres, hombres y mujeres, صالون نسائي، رجالي ونسائي، للجنسين، سيدات.',
  'If asked about women\'s services: politely clarify this is a men\'s barbershop only — do not invent women\'s services.',
  'Do not invent service categories not listed in private-office directives or salon context.',
].join('\n');

/** أنماط تدل على ادّعاء خدمات نسائية / unisex في رد العميل. */
const WOMEN_SALON_CLAIM_RE =
  /نسائي|نسائية|للسيدات|سيدات|نساء|للجنسين|رجالي\s*و\s*نسائي|صالون\s*نسائي|حلاق(?:ة)?\s*نسائي|women'?s?\s+(?:salon|barber|hair|grooming|services?)|ladies(?:'|\s)+(?:salon|barber|hair|cut)|for\s+women|unisex|men\s+and\s+women|both\s+(?:genders?|sexes)|hombres\s+y\s+mujeres|mujeres\s+y\s+hombres|peluquer[ií]a\s+(?:de\s+)?(?:damas|mujeres|femenina)|barber[ií]a\s+(?:de\s+)?(?:damas|mujeres)|para\s+(?:damas|mujeres|señoras)|salon\s+(?:pour\s+)?(?:dames|femmes)|unisexe|kadın(?:lar)?\s+(?:kuaför|berber)|bayan\s+(?:kuaför|berber)/iu;

export function replyClaimsWomenSalonServices(text: string): boolean {
  const t = String(text ?? '').trim();
  if (!t) return false;
  return WOMEN_SALON_CLAIM_RE.test(t);
}

export function instructionMentionsWomenSalonServices(text: string): boolean {
  return replyClaimsWomenSalonServices(text);
}

/** احذف تعليمات المكتب الخاص التي تذكر خدمات نسائية قبل حقنها في برومبت العميل. */
export function filterMensOnlySafeInstructions(instructions: string[] | undefined): string[] {
  if (!instructions?.length) return [];
  return instructions.filter((line) => !instructionMentionsWomenSalonServices(line));
}
