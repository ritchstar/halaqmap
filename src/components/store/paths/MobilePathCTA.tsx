/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شريط دعوة ثابت أسفل الشاشة على الجوال فقط — لا يغطي منطقة اللمس السفلية
 * لأنظمة iOS (safe-area-inset-bottom)، ويختفي على sm فأعلى حيث CTA داخل المحتوى مرئي أصلاً.
 */
import { Link } from 'react-router-dom';

export function MobilePathCTA({
  href,
  external,
  label,
  accent,
}: {
  href: string;
  external: boolean;
  label: string;
  accent: string;
}) {
  const commonClassName =
    'flex min-h-12 w-full items-center justify-center rounded-full px-4 text-sm font-extrabold text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#bdb5a7] bg-[#fffdf8]/95 px-3 py-3 backdrop-blur sm:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={commonClassName} style={{ backgroundColor: accent }}>
          {label}
        </a>
      ) : (
        <Link to={href} className={commonClassName} style={{ backgroundColor: accent }}>
          {label}
        </Link>
      )}
    </div>
  );
}
