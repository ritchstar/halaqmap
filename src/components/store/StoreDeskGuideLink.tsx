/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * زر وعبارة في لوحة التحكم تحيل إلى دليل التشغيل والتسويق.
 */
import { Link } from 'react-router-dom';

export function StoreDeskGuideLink({
  to,
  leadAr,
  ctaAr,
  accent,
}: {
  to: string;
  leadAr: string;
  ctaAr: string;
  accent: string;
}) {
  return (
    <aside className="rounded-2xl border p-4" style={{ borderColor: `${accent}66` }}>
      <p className="text-sm leading-7 text-white/75">{leadAr}</p>
      <Link
        to={to}
        className="mt-3 inline-flex rounded-full px-4 py-2 text-sm font-extrabold text-[#061018]"
        style={{ backgroundColor: accent }}
      >
        {ctaAr}
      </Link>
    </aside>
  );
}
