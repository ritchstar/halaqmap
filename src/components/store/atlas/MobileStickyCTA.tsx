/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';

export function MobileStickyCTA({ to, labelAr }: { to: string; labelAr: string }) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-[var(--atlas-line)] bg-[var(--atlas-raised)]/95 px-3 py-3 backdrop-blur-sm">
      <Link to={to} className="store-atlas__btn store-atlas__btn--gold w-full min-h-12">
        {labelAr}
      </Link>
    </div>
  );
}
