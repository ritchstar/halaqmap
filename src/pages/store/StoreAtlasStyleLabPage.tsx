/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معاينة أطلس الحلول خلف مسار داخلي. لا تُستورد الإعدادات من App.tsx.
 */
import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { AtlasDaylight } from '@/components/store/atlas/AtlasDaylight';
import { AtlasHome } from '@/components/store/atlas/AtlasHome';
import { AtlasProduceMock } from '@/components/store/atlas/AtlasProduceMock';
import {
  parseStoreAtlasDaylight,
  parseStoreAtlasLabView,
  STORE_ATLAS_COPY,
  STORE_ATLAS_LAB_VIEWS,
  STORE_ATLAS_STYLE_LAB_ENABLED,
  type StoreAtlasDaylightMode,
  type StoreAtlasLabView,
} from '@/config/storeAtlasTokens';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';
import '@/styles/storeAtlas.css';

export default function StoreAtlasStyleLabPage() {
  useDocumentTitle(STORE_ATLAS_COPY.documentTitle);
  const [params, setParams] = useSearchParams();
  const view = parseStoreAtlasLabView(params.get('view'));
  const daylight = parseStoreAtlasDaylight(params.get('daylight'));

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  if (!STORE_ATLAS_STYLE_LAB_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  const setView = (next: StoreAtlasLabView) => {
    setParams({ view: next, daylight }, { replace: true });
  };

  const setDaylight = (next: StoreAtlasDaylightMode) => {
    setParams({ view, daylight: next }, { replace: true });
  };

  return (
    <div
      dir="rtl"
      data-atlas-daylight={daylight}
      className={
        daylight === 'on'
          ? 'relative min-h-screen bg-[#EFF6F1] text-[#072530]'
          : 'relative min-h-screen bg-[#020912] text-[#F4EFE4]'
      }
    >
      <AtlasDaylight enabled={daylight === 'on'} />
      <div className="relative z-[1]">
        <div className="store-atlas-lab-bar sticky top-0 z-30 px-3 py-3">
          <p className="text-xs font-bold text-[#0D9488]">{STORE_ATLAS_COPY.labKickerAr}</p>
          <p className="mt-1 text-[0.7rem] text-[#9EABB3]">{STORE_ATLAS_COPY.daylightHintAr}</p>
          <p className="mt-1 text-[0.7rem] text-[#9EABB3]">{STORE_ATLAS_COPY.signalHintAr}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STORE_ATLAS_LAB_VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={view === item.id}
                onClick={() => setView(item.id)}
                className="min-h-11 rounded-full border border-[#1D3340] px-4 text-sm font-extrabold"
              >
                {item.titleAr}
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={daylight === 'off'}
              onClick={() => setDaylight('off')}
              className="min-h-11 rounded-full border border-[#1D3340] px-4 text-sm font-extrabold"
            >
              {STORE_ATLAS_COPY.daylightOffAr}
            </button>
            <button
              type="button"
              aria-pressed={daylight === 'on'}
              onClick={() => setDaylight('on')}
              className="min-h-11 rounded-full border border-[#1D3340] px-4 text-sm font-extrabold"
            >
              {STORE_ATLAS_COPY.daylightOnAr}
            </button>
          </div>
        </div>

        {view === 'home-mobile' ? (
          <div className="px-3 py-6">
            <div className="store-atlas__mobile-frame">
              <AtlasHome compact />
            </div>
          </div>
        ) : null}
        {view === 'produce' ? <AtlasProduceMock /> : null}
        {view === 'home-desktop' ? <AtlasHome /> : null}
      </div>
    </div>
  );
}
