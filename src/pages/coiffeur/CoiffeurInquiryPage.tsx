/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * تجربة المستعلمة — بحث واستعلام بطابع نسائي.
 * الجوال: شرائح أفقية + رصيف بحث. سطح المكتب: رادار. النتائج الحية مرحلة لاحقة.
 */
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchCoiffeurInquiryListings } from '@/lib/coiffeurInquiryIsolation';
import { CoiffeurRadarButton, type CoiffeurRadarPhase } from '@/components/coiffeur/CoiffeurRadarButton';
import {
  CoiffeurMobileSearchDock,
  CoiffeurVisitorFooter,
  CoiffeurVisitorHeader,
  CoiffeurVisitorShell,
} from '@/components/coiffeur/CoiffeurVisitorChrome';
import {
  COIFFEUR_INQUIRY_COPY,
  COIFFEUR_INQUIRY_INTENTS,
  type CoiffeurInquiryIntentId,
} from '@/config/coiffeurMapUmbrella';

type LocateState = 'idle' | 'pending' | 'ready' | 'denied';

export default function CoiffeurInquiryPage() {
  useDocumentTitle(COIFFEUR_INQUIRY_COPY.documentTitle);
  const [intent, setIntent] = useState<CoiffeurInquiryIntentId>('near_open');
  const [locate, setLocate] = useState<LocateState>('idle');
  const [resultCount, setResultCount] = useState(0);

  const runInquiry = useCallback(async () => {
    const { listings, isolatedFromMensBarbers } = await fetchCoiffeurInquiryListings();
    setResultCount(isolatedFromMensBarbers ? listings.length : 0);
  }, []);

  useEffect(() => {
    void runInquiry();
  }, [intent, runInquiry]);

  const radarPhase: CoiffeurRadarPhase =
    locate === 'pending' ? 'searching' : locate === 'ready' ? 'found' : locate === 'denied' ? 'denied' : 'idle';

  const requestSearch = () => {
    document.getElementById('coiffeur-search')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!navigator.geolocation) {
      setLocate('denied');
      return;
    }
    setLocate('pending');
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocate('ready');
        void runInquiry();
      },
      () => setLocate('denied'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  };

  return (
    <CoiffeurVisitorShell>
      <CoiffeurVisitorHeader
        brandTo={ROUTE_PATHS.COIFFEUR_LANDING}
        searchBusy={locate === 'pending'}
        onSearch={requestSearch}
      />

      <section className="relative mx-auto max-w-6xl px-5 pb-6 pt-8 md:min-h-[72svh] md:pb-8 md:pt-24">
        <div id="coiffeur-search" className="absolute top-8" />
        <span className="inline-flex rounded-full border border-rose-200/25 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-100">
          {COIFFEUR_INQUIRY_COPY.badge}
        </span>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-[clamp(1.75rem,8vw,2.25rem)] font-black leading-[1.12] text-white md:mt-5 md:text-[clamp(2.1rem,7vw,4.2rem)]"
        >
          {COIFFEUR_INQUIRY_COPY.title}
          <span className="mt-1 block bg-gradient-to-l from-rose-200 via-[#f4d4c0] to-amber-200 bg-clip-text text-transparent">
            {COIFFEUR_INQUIRY_COPY.titleAccent}
          </span>
        </motion.h1>

        <div className="mt-8 grid items-start gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1.1fr)_auto] lg:gap-10">
          <div className="min-w-0 max-w-xl">
            <p className="mb-3 text-[0.7rem] font-black tracking-[0.18em] text-[#e8b4a2]">{COIFFEUR_INQUIRY_COPY.kicker}</p>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
              {COIFFEUR_INQUIRY_INTENTS.map((item) => {
                const active = intent === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIntent(item.id)}
                    className={
                      active
                        ? 'shrink-0 whitespace-nowrap rounded-full border border-[#f4d4c0]/70 bg-[#e8b4a2]/20 px-3.5 py-2 text-xs font-black text-[#f7efe8]'
                        : 'shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-rose-100/70'
                    }
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <p className="min-h-6 text-xs leading-6 text-rose-100/55">
              {locate === 'ready' ? COIFFEUR_INQUIRY_COPY.located : null}
              {locate === 'denied' ? COIFFEUR_INQUIRY_COPY.locateDenied : null}
            </p>
          </div>
          <div className="hidden justify-center overflow-x-clip md:flex">
            <CoiffeurRadarButton
              phase={radarPhase}
              onClick={requestSearch}
              idleTitle={COIFFEUR_INQUIRY_COPY.searchRadarIdle}
              idleHint={COIFFEUR_INQUIRY_COPY.searchHero}
            />
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-5 pb-8 md:pb-20">
        <div className="overflow-hidden rounded-3xl border border-rose-200/15 bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-5 py-8 text-center shadow-[inset_0_1px_0_rgba(244,212,192,0.18)] md:rounded-[2rem] md:px-6 md:py-14">
          <Sparkles className="mx-auto h-6 w-6 text-[#f4d4c0] md:h-7 md:w-7" />
          <h2 className="mt-3 text-lg font-black text-white md:mt-4 md:text-2xl">{COIFFEUR_INQUIRY_COPY.emptyTitle}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-rose-50/70 md:mt-3 md:leading-8">{COIFFEUR_INQUIRY_COPY.emptyBody}</p>
          {resultCount > 0 ? (
            <p className="mt-4 text-[11px] text-rose-100/35">نتائج هذا المسار حالياً: {resultCount}</p>
          ) : null}
        </div>
      </section>

      <CoiffeurVisitorFooter />
      <CoiffeurMobileSearchDock busy={locate === 'pending'} onClick={requestSearch} />
    </CoiffeurVisitorShell>
  );
}
