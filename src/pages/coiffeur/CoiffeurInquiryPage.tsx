/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * تجربة المستعلمة — بحث واستعلام بطابع نسائي.
 */
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import {
  fetchCoiffeurInquiryListings,
  type CoiffeurInquiryListing,
} from '@/lib/coiffeurInquiryIsolation';
import { type CoiffeurRadarPhase } from '@/components/coiffeur/CoiffeurRadarButton';
import { CoiffeurInquiryStage } from '@/components/coiffeur/CoiffeurInquiryStage';
import { CoiffeurInquiryResults } from '@/components/coiffeur/CoiffeurInquiryResults';
import { CoiffeurVisitorHowItWorks } from '@/components/coiffeur/CoiffeurVisitorHowItWorks';
import { CoiffeurBannerGallery } from '@/components/coiffeur/CoiffeurBannerGallery';
import { CoiffeurInterestCta } from '@/components/coiffeur/CoiffeurInterestCta';
import {
  CoiffeurMobileSearchDock,
  CoiffeurVisitorFooter,
  CoiffeurVisitorHeader,
  CoiffeurVisitorShell,
} from '@/components/coiffeur/CoiffeurVisitorChrome';
import {
  COIFFEUR_INQUIRY_COPY,
  type CoiffeurInquiryIntentId,
} from '@/config/coiffeurMapUmbrella';
import { readCoiffeurIntentFromQuery } from '@/config/summiCoiffeurRegistry';

type LocateState = 'idle' | 'pending' | 'ready' | 'denied';
type Coords = { lat: number; lng: number };

export default function CoiffeurInquiryPage() {
  useDocumentTitle(COIFFEUR_INQUIRY_COPY.documentTitle);
  const location = useLocation();
  const [intent, setIntent] = useState<CoiffeurInquiryIntentId>(
    () => readCoiffeurIntentFromQuery() ?? 'near_open',
  );
  const [locate, setLocate] = useState<LocateState>('idle');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [listings, setListings] = useState<CoiffeurInquiryListing[]>([]);

  useEffect(() => {
    const fromQuery = readCoiffeurIntentFromQuery();
    if (fromQuery) setIntent(fromQuery);
  }, [location.hash, location.search, location.pathname]);

  const runInquiry = useCallback(async (nextCoords: Coords | null, nextIntent: CoiffeurInquiryIntentId) => {
    const { listings: next, isolatedFromMensBarbers } = await fetchCoiffeurInquiryListings({
      lat: nextCoords?.lat,
      lng: nextCoords?.lng,
      intent: nextIntent,
    });
    setListings(isolatedFromMensBarbers ? next : []);
  }, []);

  useEffect(() => {
    if (!coords) {
      setListings([]);
      return;
    }
    void runInquiry(coords, intent);
  }, [coords, intent, runInquiry]);

  const radarPhase: CoiffeurRadarPhase =
    locate === 'pending' ? 'searching' : locate === 'ready' ? 'found' : locate === 'denied' ? 'denied' : 'idle';

  const requestSearch = () => {
    ProductEvents.coiffeurCtaClick({ source: 'inquiry' });
    document.getElementById('coiffeur-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!navigator.geolocation) {
      setLocate('denied');
      return;
    }
    setLocate('pending');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocate('ready');
      },
      () => setLocate('denied'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  };

  const locateMessage =
    locate === 'ready'
      ? COIFFEUR_INQUIRY_COPY.located
      : locate === 'denied'
        ? COIFFEUR_INQUIRY_COPY.locateDenied
        : null;

  const showEmpty = locate === 'ready' && listings.length === 0;

  return (
    <CoiffeurVisitorShell>
      <div id="coiffeur-search" className="absolute top-8" />
      <CoiffeurVisitorHeader brandTo={ROUTE_PATHS.COIFFEUR_LANDING} />
      <CoiffeurInquiryStage
        phase={radarPhase}
        intent={intent}
        onIntentChange={(id) => {
          setIntent(id);
          ProductEvents.coiffeurCategoryClick({ intent: id, source: 'inquiry' });
        }}
        onInquire={requestSearch}
        locateMessage={locateMessage}
      />
      <CoiffeurInquiryResults listings={listings} />
      <CoiffeurVisitorHowItWorks />
      <CoiffeurBannerGallery />

      {showEmpty || listings.length === 0 ? (
        <section className="relative mx-auto max-w-6xl px-5 pb-8 md:pb-20">
          <div className="overflow-hidden rounded-3xl border border-rose-200/15 bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-5 py-8 text-center shadow-[inset_0_1px_0_rgba(244,212,192,0.18)] md:rounded-[2rem] md:px-6 md:py-14">
            <Sparkles className="mx-auto h-6 w-6 text-[#f4d4c0] md:h-7 md:w-7" />
            <h2 className="mt-3 text-lg font-black text-white md:mt-4 md:text-2xl">{COIFFEUR_INQUIRY_COPY.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-lg text-base leading-7 text-[#f7efe8] md:mt-3 md:leading-8">{COIFFEUR_INQUIRY_COPY.emptyBody}</p>
            <CoiffeurInterestCta
              source="inquiry_empty"
              label="سجّلي اهتمامك وتلقّي التحديثات عند التسكين"
              className="px-0 pb-0 pt-6"
            />
          </div>
        </section>
      ) : null}

      <CoiffeurVisitorFooter />
      <CoiffeurMobileSearchDock busy={locate === 'pending'} onClick={requestSearch} />
    </CoiffeurVisitorShell>
  );
}
