/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقة كوافير ماب العامة — الضغط يدخل المنصة.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { CoiffeurIntroCardPreview } from '@/components/coiffeur/CoiffeurIntroCardPreview';
import { CoiffeurGlowFrame } from '@/components/coiffeur/CoiffeurGlowFrame';
import {
  CoiffeurVisitorFooter,
  CoiffeurVisitorHeader,
  CoiffeurVisitorShell,
} from '@/components/coiffeur/CoiffeurVisitorChrome';
import {
  COIFFEUR_INTRO_CARD_COPY as COPY,
  coiffeurCardLandingUrl,
} from '@/config/coiffeurIntroCardCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { readHashQueryParam } from '@/lib/hashQueryParams';
import {
  decodeCoiffeurCardToken,
  sanitizeCoiffeurCardName,
  sanitizeCoiffeurCardRole,
} from '@/lib/coiffeurCardShare';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function CoiffeurCardViewPage() {
  const [params] = useSearchParams();
  const routeParams = useParams();
  const token =
    routeParams.token ||
    readHashQueryParam('c') ||
    params.get('c') ||
    '';
  const decoded = decodeCoiffeurCardToken(token);
  const name = sanitizeCoiffeurCardName(
    decoded?.name || readHashQueryParam('n') || params.get('n') || '',
  );
  const role = sanitizeCoiffeurCardRole(
    decoded?.role || readHashQueryParam('r') || params.get('r') || '',
  );
  const landingUrl = useMemo(() => coiffeurCardLandingUrl(), []);
  const landingPath = `${ROUTE_PATHS.COIFFEUR_LANDING}?utm_source=intro_card&utm_medium=share&utm_campaign=coiffeur_card`;
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
    ProductEvents.coiffeurCardView();
  }, []);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(landingUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 384,
      color: { dark: '#14080e', light: '#ffffff' },
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
    ProductEvents.coiffeurCardOpenLanding();
  };

  return (
    <CoiffeurVisitorShell withMobileDock={false}>
      <CoiffeurVisitorHeader brandTo={landingPath} sticky={false} />

      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-8">
        <p className="mb-4 text-center text-sm font-bold text-[#f4d4c0]">{COPY.tapHint}</p>
        <Link
          to={landingPath}
          onClick={goLanding}
          className="block w-full max-w-[340px] cursor-pointer no-underline outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#f4d4c0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14080e]"
          aria-label={COPY.tapHint}
        >
          <CoiffeurGlowFrame>
            <CoiffeurIntroCardPreview
              displayName={name}
              role={role}
              qrDataUrl={qrDataUrl}
            />
          </CoiffeurGlowFrame>
        </Link>
        <Link
          to={landingPath}
          onClick={goLanding}
          className="mt-6 inline-flex min-h-12 w-full max-w-[340px] items-center justify-center rounded-2xl bg-gradient-to-l from-[#f7efe8] via-[#f4d4c0] to-[#c98b96] px-5 text-center text-base font-black text-[#2a1218] no-underline shadow-[0_0_28px_rgba(244,212,192,0.45)]"
        >
          {COPY.cta}
        </Link>
      </div>

      <CoiffeurVisitorFooter showPartnersLater showInterest />
    </CoiffeurVisitorShell>
  );
}
