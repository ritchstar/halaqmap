/** مصدر واحد لبيانات التحويل البنكي — يفضّل ضبطها من .env للإنتاج */
function envOrFallback(key: string, fallback: string): string {
  const value = String(import.meta.env[key] ?? '').trim();
  return value || fallback;
}

export const BANK_TRANSFER = {
  // عند صدور حساب البنك النهائي غيّر هذه القيم في .env بدون تعديل الكود.
  bankDisplayAr: envOrFallback('VITE_BANK_TRANSFER_BANK_NAME_AR', 'البنك العربي الوطني (ANB)'),
  iban: envOrFallback('VITE_BANK_TRANSFER_IBAN', 'SA5430400108037273420021'),
  beneficiaryDisplay: envOrFallback('VITE_BANK_TRANSFER_BENEFICIARY', 'AHMED ABDULLAH'),
} as const;
