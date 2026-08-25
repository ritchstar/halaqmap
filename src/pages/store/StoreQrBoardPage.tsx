/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة لوحة QR لمتجر خريطة الحل — عرض على شاشة الآيفون وتحميل.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StoreQrBoard } from '@/components/store/StoreQrBoard';
import { StoreVisitorShell } from '@/components/store/StoreChrome';
import { STORE_QR_BOARD_COPY } from '@/config/storeQrBoard';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreQrBoardPage() {
  useDocumentTitle(STORE_QR_BOARD_COPY.documentTitle);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <StoreVisitorShell>
      <div className="mx-auto flex min-h-[100svh] w-full max-w-lg flex-col px-4 pb-8 pt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            to={ROUTE_PATHS.STORE_LANDING}
            className="text-sm font-bold text-[#e8c547] underline decoration-[#e8c547]/40 underline-offset-4 hover:decoration-[#e8c547]"
          >
            العودة للمتجر
          </Link>
          <p className="text-xs font-bold text-white/45">لوحة QR</p>
        </div>
        <StoreQrBoard />
      </div>
    </StoreVisitorShell>
  );
}
