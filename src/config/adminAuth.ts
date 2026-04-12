/** البريد الوحيد المسموح بدخول لوحة الإدارة (يمكن تجاوزه بـ VITE_ADMIN_EMAIL). */
export function getAdminAllowedEmail(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
  if (fromEnv?.trim()) return fromEnv.trim().toLowerCase();
  return 'ritchstar4@gmail.com';
}

export function isAllowedAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === getAdminAllowedEmail();
}
