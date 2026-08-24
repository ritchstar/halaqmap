/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقة واجهة المتجر العامة — الضغط يدخل الواجهة.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { StoreGoldFrame } from '@/components/store/StoreGoldFrame';
import { StoreIntroCardPreview } from '@/components/store/StoreIntroCardPreview';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import {
  STORE_INTRO_CARD_COPY as COPY,
  storeIntroCardCta,
  storeIntroCardLandingUrl,
} from '@/config/storeIntroCardCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import {
  decodeStoreIntroCardToken,
  sanitizeStoreIntroCardName,
  sanitizeStoreIntroCardRole,
} from '@/lib/storeIntroCardShare';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreIntroCardViewPage() {
  const [params] = useSearchParams();
  const token = readHashQueryParam('c') || params.get('c') || '';
  const decoded = decodeStoreIntroCardToken(token);
  const name = sanitizeStoreIntroCardName(
    decoded?.name || readHashQueryParam('n') || params.get('n') || '',
  );
  const role = sanitizeStoreIntroCardRole(
    decoded?.role || readHashQueryParam('r') || params.get('r') || '',
  );
  const landingUrl = useMemo(() => storeIntroCardLandingUrl(), []);
  const landingPath = `${ROUTE_PATHS.STORE_LANDING}?utm_source=intro_card&utm_medium=share&utm_campaign=store_card`;
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useDocumentTitle(name ? `${name} — ${COPY.documentTitleView}` : COPY.documentTitleView);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    ProductEvents.storeIntroCardView();
  }, []);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(landingUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: { dark: '#061018', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [landingUrl]);

  const goLanding = () => {
    ProductEvents.storeIntroCardOpenLanding();
  };

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />

      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-8">
        <p className="mb-4 text-center text-sm font-bold text-[#e8c547]">{COPY.tapHint}</p>
        <Link
          to={landingPath}
          onClick={goLanding}
          className="block w-full max-w-[340px] cursor-pointer no-underline outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#e8c547] focus-visible:ring-offset-2 focus-visible:ring-offset-[#061018]"
          aria-label={COPY.tapHint}
        >
          <StoreGoldFrame>
            <StoreIntroCardPreview
              displayName={name}
              role={role}
              qrDataUrl={qrDataUrl}
            />
          </StoreGoldFrame>
        </Link>
        <Link
          to={landingPath}
          onClick={goLanding}
          className="mt-6 inline-flex min-h-12 w-full max-w-[340px] items-center justify-center rounded-2xl bg-gradient-to-l from-[#f4efe4] via-[#e8c547] to-[#b8860b] px-5 text-center text-base font-black text-[#061018] no-underline shadow-[0_0_28px_rgba(232,197,71,0.45)]"
        >
          {storeIntroCardCta(role)}
        </Link>
      </div>

      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
