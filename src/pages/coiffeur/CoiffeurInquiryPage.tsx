/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * استعلام كوافير ماب — قطاع نسائي فقط (مشغل / كوافير / سبا / تجميل).
 * لا يستخدم بحث حلاق ماب للرجال ولا /api/public-barbers.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Scissors, Search, Sparkles } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchCoiffeurInquiryListings } from '@/lib/coiffeurInquiryIsolation';
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
    if (!isolatedFromMensBarbers) {
      setResultCount(0);
      return;
    }
    setResultCount(listings.length);
  }, []);

  useEffect(() => {
    void runInquiry();
  }, [intent, runInquiry]);

  const requestLocation = () => {
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
    <div dir="rtl" className="relative min-h-screen overflow-x-clip bg-[linear-gradient(165deg,#020912_0%,#041422_48%,#020912_100%)] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#020912]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to={ROUTE_PATHS.COIFFEUR_LANDING} className="text-sm font-black text-teal-300">
            {COIFFEUR_BRAND_AR}
          </Link>
          <span className="rounded-full border border-teal-400/35 bg-teal-500/10 px-3 py-1 text-[11px] font-bold text-teal-100">
            {COIFFEUR_INQUIRY_COPY.badge}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <p className="text-xs font-black tracking-wide text-teal-200">{COIFFEUR_INQUIRY_COPY.badge}</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white">{COIFFEUR_INQUIRY_COPY.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300">{COIFFEUR_INQUIRY_COPY.lead}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {COIFFEUR_INQUIRY_INTENTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIntent(item.id)}
              className={
                intent === item.id
                  ? 'rounded-full border border-teal-300 bg-teal-500/20 px-3.5 py-2 text-xs font-black text-teal-50'
                  : 'rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-300'
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={requestLocation}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-5 py-3 text-sm font-black text-white"
          >
            <MapPin className="h-4 w-4" />
            {locate === 'pending' ? COIFFEUR_INQUIRY_COPY.locating : COIFFEUR_INQUIRY_COPY.locateCta}
          </button>
          <p className="text-xs leading-6 text-slate-500">
            {locate === 'ready' ? 'تم تحديد الموقع — النتائج تبقى داخل القطاع النسائي فقط.' : null}
            {locate === 'denied' ? COIFFEUR_INQUIRY_COPY.locateDenied : null}
          </p>
        </div>

        <section className="mt-10 rounded-3xl border border-teal-400/25 bg-white/[0.03] px-5 py-10 text-center">
          <Search className="mx-auto h-8 w-8 text-teal-300" />
          <h2 className="mt-4 text-xl font-black text-white">{COIFFEUR_INQUIRY_COPY.emptyTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-slate-300">{COIFFEUR_INQUIRY_COPY.emptyBody}</p>
          <p className="mt-3 text-xs text-slate-500">النتائج المعروضة في هذا المسار: {resultCount}</p>
          <p className="mx-auto mt-2 max-w-lg text-[11px] leading-6 text-slate-600">{COIFFEUR_INQUIRY_COPY.isolationNote}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={ROUTE_PATHS.COIFFEUR_PARTNERS}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-500/10 px-5 py-3 text-sm font-black text-amber-100"
            >
              <Scissors className="h-4 w-4" />
              سجّلي منشأتك النسائية
            </Link>
            <Link
              to={ROUTE_PATHS.COIFFEUR_LANDING}
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-200"
            >
              <Sparkles className="h-4 w-4" />
              العودة لهبوط كوافير ماب
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 text-center">
        <p className="text-xs leading-7 text-slate-400">{COIFFEUR_UMBRELLA_LINE_AR}</p>
        <p className="mt-2 text-[11px] text-slate-500">{COIFFEUR_FOOTER_LEGAL_AR}</p>
        <p className="mt-1 text-[11px] text-slate-500">{COIFFEUR_FOOTER_ECOMMERCE_AR}</p>
        <p className="mt-3 text-[11px] text-slate-600">
          بحث الرجال يبقى على حلاق ماب فقط —
          <Link to={ROUTE_PATHS.HOME} className="mx-1 font-bold text-slate-500 underline">
            www.halaqmap.com
          </Link>
        </p>
      </footer>
    </div>
  );
}
