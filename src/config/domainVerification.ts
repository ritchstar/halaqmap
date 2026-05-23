/** رمز إثبات ملكية النطاق (وسم meta name="domain-verification") — يجب أن يطابق لوحة التحقق. */
export const DOMAIN_VERIFICATION_META_CONTENT =
  '05f735e4039c7d290a5f41d188fdc7995352fb2a7f8a211015099614270dd06f';

/** يضمن الوسم في head (مفيد لمسارات SPA؛ الزواحف تقرأ index.html الثابت أولاً). */
export function ensureDomainVerificationMeta(): void {
  if (typeof document === 'undefined') return;
  const name = 'domain-verification';
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.insertBefore(meta, document.head.firstChild);
  }
  meta.setAttribute('content', DOMAIN_VERIFICATION_META_CONTENT);
}
