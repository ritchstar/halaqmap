/** سياسة ترجمة شات العميل — مصدر واحد للواجهة */

export function countScriptChars(text: string): { latin: number; arabic: number } {
  return {
    latin: (text.match(/[A-Za-zÀ-ÿ]/g) || []).length,
    arabic: (text.match(/[\u0600-\u06FF]/g) || []).length,
  };
}

export function isPrimarilyArabicScript(text: string): boolean {
  const { latin, arabic } = countScriptChars(text);
  return arabic > 0 && arabic >= latin;
}

/** للعميل — يُترجم ردّ الصالون/المناوب للطرف الآخر */
export function guessTranslateTarget(text: string): 'ar' | 'en' {
  const { latin, arabic } = countScriptChars(text);
  if (arabic >= latin) return 'en';
  return 'ar';
}

/** للحلاق — أي رسالة أجنبية تُعرَض مع ترجمة عربية */
export function barberDashboardTranslateTarget(text: string): 'ar' | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return isPrimarilyArabicScript(trimmed) ? null : 'ar';
}
