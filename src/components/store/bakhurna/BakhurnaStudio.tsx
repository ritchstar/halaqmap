/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * معاينة حيّة مدمجة لبخورنا1 — بنية تحتية أولية قيد التقييم والتطوير.
 * راجع docs/bakhurna1-backend-todo.md.
 */
import { useEffect, useState } from 'react';
import { STORE_BAKHURNA_LIVE, STORE_BAKHURNA_LIVE_LAB_TOKEN } from '@/config/storeBakhurnaLive';
import { BakhurnaChatlyDesk } from '@/components/store/bakhurna/BakhurnaChatlyDesk';
import { BakhurnaChatlyStorefront } from '@/components/store/bakhurna/BakhurnaChatlyStorefront';
import { readBakhurnaLabState, writeBakhurnaLabState, type BakhurnaLabState } from '@/lib/storeBakhurnaLiveLab';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

type StudioTab = 'shop' | 'desk';

export function StoreBakhurnaStudio({ token = STORE_BAKHURNA_LIVE_LAB_TOKEN }: { token?: string }) {
  const [state, setState] = useState<BakhurnaLabState>(() => readBakhurnaLabState(token));
  const [tab, setTab] = useState<StudioTab>('shop');
  const shopUrl =
    typeof window === 'undefined'
      ? `/#${ROUTE_PATHS.STORE_BAKHURNA_VIEW.replace(':token', token)}`
      : `${window.location.origin}/#${ROUTE_PATHS.STORE_BAKHURNA_VIEW.replace(':token', token)}`;

  useEffect(() => {
    setState(readBakhurnaLabState(token));
    const refresh = () => setState(readBakhurnaLabState(token));
    const timer = window.setInterval(refresh, 1500);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', refresh);
    };
  }, [token]);

  const commit = (next: BakhurnaLabState) => {
    writeBakhurnaLabState(token, next);
    setState(next);
  };

  return (
    <div id="live-preview" className="scroll-mt-8">
      <p className="inline-flex rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-100">
        {STORE_BAKHURNA_LIVE.labPreviewBadgeAr}
      </p>
      <p className="mt-2 text-xs leading-6 text-white/55">{STORE_BAKHURNA_LIVE.labPreviewEnvAr}</p>
      <p className="mt-4 text-sm font-bold text-[#6E4A26]">{STORE_BAKHURNA_LIVE.labKickerAr}</p>
      <h2 className="mt-2 text-2xl font-extrabold">{STORE_BAKHURNA_LIVE.labTitleAr}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-8 text-white/75">{STORE_BAKHURNA_LIVE.labLeadAr}</p>
      <div className="store-studio-switch mt-5">
        <button
          type="button"
          onClick={() => setTab('shop')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'shop' ? 'bg-[#6E4A26] text-white' : 'border border-white/20')}
        >
          {STORE_BAKHURNA_LIVE.shopLinkAr}
        </button>
        <button
          type="button"
          onClick={() => setTab('desk')}
          className={cn('rounded-full px-4 py-2 text-sm font-bold', tab === 'desk' ? 'bg-[#6E4A26] text-white' : 'border border-white/20')}
        >
          {STORE_BAKHURNA_LIVE.deskLinkAr}
        </button>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-[#6E4A26]/30">
        {tab === 'shop' ? (
          <BakhurnaChatlyStorefront state={state} onChange={commit} token={token} />
        ) : (
          <BakhurnaChatlyDesk state={state} onChange={commit} shopUrl={shopUrl} token={token} />
        )}
      </div>
    </div>
  );
}
