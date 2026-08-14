/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * تجربة المستعلمة — بحث واستعلام بطابع نسائي فاخر.
 * مرحلة أولى: الزر والنوايا والعزل عن بحث الرجال. النتائج الحية مرحلة لاحقة.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchCoiffeurInquiryListings } from '@/lib/coiffeurInquiryIsolation';
import { CoiffeurSearchButton, COIFFEUR_VISITOR_CANVAS_CLASS } from '@/components/coiffeur/CoiffeurSearchButton';
import { CoiffeurRadarButton, type CoiffeurRadarPhase } from '@/components/coiffeur/CoiffeurRadarButton';
import {
  COIFFEUR_BRAND_AR,
  COIFFEUR_FOOTER_ECOMMERCE_AR,
  COIFFEUR_FOOTER_LEGAL_AR,
  COIFFEUR_INQUIRY_COPY,
  COIFFEUR_INQUIRY_INTENTS,
  COIFFEUR_UMBRELLA_LINE_AR,
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
    <div dir="rtl" className={COIFFEUR_VISITOR_CANVAS_CLASS}>
      <div className="pointer-events-none absolute -left-24 top-24 h-[22rem] w-[22rem] rounded-full bg-rose-400/12 blur-[110px]" aria-hidden />
      <div className="pointer-events-none absolute -right-16 top-10 h-[26rem] w-[26rem] rounded-full bg-amber-200/10 blur-[120px]" aria-hidden />

      <header className="relative sticky top-0 z-40 border-b border-rose-200/10 bg-[#14080e]/88 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to={ROUTE_PATHS.COIFFEUR_LANDING} className="min-w-0">
            <p className="text-sm font-black tracking-wide text-[#f4d4c0]">{COIFFEUR_BRAND_AR}</p>
            <p className="text-[10px] text-rose-100/50">{COIFFEUR_INQUIRY_COPY.isolationBadge}</p>
          </Link>
          <CoiffeurSearchButton
            size="header"
            label={COIFFEUR_INQUIRY_COPY.searchHeaderLong}
            shortLabel={COIFFEUR_INQUIRY_COPY.searchHeader}
            busy={locate === 'pending'}
            onClick={requestSearch}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f4d4c0]/40 to-transparent" />
      </header>

      <section className="relative mx-auto max-w-6xl px-5 pb-8 pt-16 md:min-h-[72svh] md:pt-24">
        <div id="coiffeur-search" className="absolute top-8" />
        <span className="inline-flex rounded-full border border-rose-200/25 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-100">
          {COIFFEUR_INQUIRY_COPY.badge}
        </span>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 text-[clamp(2.1rem,7vw,4.2rem)] font-black leading-[1.12] text-white"
        >
          {COIFFEUR_INQUIRY_COPY.title}
          <span className="mt-1 block bg-gradient-to-l from-rose-200 via-[#f4d4c0] to-amber-200 bg-clip-text text-transparent">
            {COIFFEUR_INQUIRY_COPY.titleAccent}
          </span>
        </motion.h1>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_auto]">
          <div className="max-w-xl">
            <p className="mb-3 text-[0.7rem] font-black tracking-[0.18em] text-[#e8b4a2]">{COIFFEUR_INQUIRY_COPY.kicker}</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {COIFFEUR_INQUIRY_INTENTS.map((item) => {
                const active = intent === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIntent(item.id)}
                    className={
                      active
                        ? 'rounded-full border border-[#f4d4c0]/70 bg-[#e8b4a2]/20 px-3.5 py-2 text-xs font-black text-[#f7efe8]'
                        : 'rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-rose-100/70'
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
          <CoiffeurRadarButton
            phase={radarPhase}
            onClick={requestSearch}
            idleTitle={COIFFEUR_INQUIRY_COPY.searchHero}
            idleHint={COIFFEUR_INQUIRY_COPY.searchHeaderLong}
          />
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-5 pb-20">
        <div className="overflow-hidden rounded-[2rem] border border-rose-200/15 bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-6 py-14 text-center shadow-[inset_0_1px_0_rgba(244,212,192,0.18)]">
          <Sparkles className="mx-auto h-7 w-7 text-[#f4d4c0]" />
          <h2 className="mt-4 text-xl font-black text-white md:text-2xl">{COIFFEUR_INQUIRY_COPY.emptyTitle}</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-8 text-rose-50/70">{COIFFEUR_INQUIRY_COPY.emptyBody}</p>
          <p className="mt-4 text-[11px] text-rose-100/35">نتائج هذا المسار حالياً: {resultCount}</p>
        </div>
      </section>

      <footer className="border-t border-rose-200/10 px-5 py-8 text-center">
        <p className="text-xs leading-7 text-rose-100/45">{COIFFEUR_UMBRELLA_LINE_AR}</p>
        <p className="mt-2 text-[11px] text-rose-100/30">{COIFFEUR_FOOTER_LEGAL_AR}</p>
        <p className="mt-1 text-[11px] text-rose-100/30">{COIFFEUR_FOOTER_ECOMMERCE_AR}</p>
      </footer>
    </div>
  );
}
