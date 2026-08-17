/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FounderDeskBanner } from '@/components/partner/FounderDeskBanner';
import { FOUNDER_DESK_COPY } from '@/config/founderDeskCopy';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function FounderDeskVisitorChatPage() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = FOUNDER_DESK_COPY.visitorPageTitleAr;
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      meta.remove();
    };
  }, []);

  return (
    <div className="min-h-dvh bg-[#061223] px-4 py-6" dir="rtl" style={{ fontFamily: 'Tajawal, system-ui' }}>
      <div className="mx-auto flex max-w-sm flex-col gap-4">
        <p className="text-center text-xs leading-6 text-slate-400">{FOUNDER_DESK_COPY.standaloneHintAr}</p>
        <FounderDeskBanner startOpen standalone />
        <Link
          to={ROUTE_PATHS.BARBERS_LANDING}
          className="text-center text-xs font-bold text-teal-200/80"
        >
          {FOUNDER_DESK_COPY.backToPartnersAr}
        </Link>
      </div>
    </div>
  );
}
