/** قيم مبدئية للنموذج — تُحدَّث لاحقاً حسب تغذية السوق. */
export const SEMAT_HAIR_PRESET_OPTIONS = [
  { value: 'fade_2', label: 'مدرج ماكينة 2' },
  { value: 'fade_3', label: 'مدرج ماكينة 3' },
  { value: 'scissor_top', label: 'مقص من الأعلى' },
  { value: 'uniform', label: 'نمرة واحدة متساوية' },
  { value: 'custom', label: 'أخرى — أحدد في النص' },
] as const;

export const SEMAT_BEARD_STYLE_OPTIONS = [
  { value: 'laser_outline', label: 'تحديد ليزر' },
  { value: 'guard_1', label: 'عوارض نمرة 1' },
  { value: 'lock', label: 'قفل' },
  { value: 'full_razor', label: 'موس كامل' },
  { value: 'custom', label: 'أخرى — أحدد في الملاحظات' },
] as const;
