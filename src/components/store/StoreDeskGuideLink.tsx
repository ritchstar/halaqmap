/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رابط دليل التشغيل والتسويق — ضمن ركن النمو والدعم أسفل يسار اللوحة.
 *
 * يفتح عمداً في تبويب متصفح جديد (بدل التنقل الداخلي عبر react-router) حتى
 * لا يغادر المشغّل لوحة التشغيل نفسها: صفحة الدليل لا تملك زر عودة إلى
 * اللوحة، وكانت `StoreDeskCornerLink` (تنقّل داخلي عبر `<Link>`) تستبدل
 * لوحة التشغيل بالكامل بصفحة الدليل بلا طريقة للرجوع إليها.
 */
export function StoreDeskGuideLink({
  to,
  leadAr,
  labelAr,
}: {
  to: string;
  leadAr: string;
  labelAr: string;
  accent?: string;
  ctaAr?: string;
}) {
  const label = leadAr || labelAr;
  /*
   * HashRouter: المسار التقني مثل `/store/.../support` يجب أن يُفتح كـ
   * `/#/store/...` وإلا يغادر المتصفح الهاش ويفقد مسار React.
   */
  const href =
    to.startsWith('http') || to.startsWith('#')
      ? to
      : `#${to.startsWith('/') ? to : `/${to}`}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="store-live-store-link pointer-events-auto relative inline-flex items-center gap-1.5"
      aria-label={`${label} (يفتح في تبويب جديد)`}
      title={label}
    >
      {labelAr}
    </a>
  );
}
