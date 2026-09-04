/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مركز نمو وتسويق طبختنا1. لا يُستورد من App.tsx إلا كصفحة كسولة.
 */
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { StorePurchasedShell } from '@/components/store/StorePurchasedShell';
import {
  kitchenGrowthItemsByCategory,
  STORE_KITCHEN_GROWTH_CATEGORIES,
  STORE_KITCHEN_GROWTH_HUB_COPY,
  STORE_KITCHEN_GROWTH_HUB_PRODUCT_ID,
} from '@/config/storeKitchenGrowthHub';
import {
  STORE_KITCHEN_LIVE_LAB_TOKEN,
  STORE_KITCHEN_LIVE_PUBLIC_ENABLED,
} from '@/config/storeKitchenLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchKitchenLivePublic } from '@/lib/storeKitchenLiveRemote';
import { markKitchenGrowthHubSeen } from '@/lib/storeKitchenGrowthHubSeen';
import { ROUTE_PATHS } from '@/lib/routePaths';

type Gate = 'loading' | 'ok' | 'missing';

async function copyText(bodyAr: string) {
  try {
    await navigator.clipboard.writeText(bodyAr);
    toast.message(STORE_KITCHEN_GROWTH_HUB_COPY.copiedAr);
  } catch {
    toast.error('تعذر النسخ.');
  }
}

export default function StoreKitchenGrowthHubPage() {
  const { token = '' } = useParams<{ token: string }>();
  const safeToken = token.trim();
  const isLab = safeToken === STORE_KITCHEN_LIVE_LAB_TOKEN;
  const [gate, setGate] = useState<Gate>(isLab || !safeToken ? (safeToken ? 'ok' : 'missing') : 'loading');
  useDocumentTitle(STORE_KITCHEN_GROWTH_HUB_COPY.titleAr);

  useEffect(() => {
    if (!safeToken) return;
    if (isLab) {
      markKitchenGrowthHubSeen(safeToken);
      return;
    }
    let cancelled = false;
    void fetchKitchenLivePublic(safeToken, 'desk').then((result) => {
      if (cancelled) return;
      if (result.expired === true || !result.ok) {
        setGate('missing');
        return;
      }
      markKitchenGrowthHubSeen(safeToken);
      setGate('ok');
    });
    return () => {
      cancelled = true;
    };
  }, [safeToken, isLab]);

  if (!STORE_KITCHEN_LIVE_PUBLIC_ENABLED) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }
  if (!safeToken) {
    return <Navigate to={ROUTE_PATHS.STORE_KITCHEN} replace />;
  }

  const deskPath = ROUTE_PATHS.STORE_KITCHEN_DESK.replace(':token', encodeURIComponent(safeToken));

  return (
    <StorePurchasedShell life>
      <div className="mx-auto max-w-3xl space-y-6 px-3 py-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-bold tracking-wide text-[#b45a3c]">{STORE_KITCHEN_GROWTH_HUB_COPY.kickerAr}</p>
            <h1 className="text-lg font-extrabold text-[#f4efe4]">{STORE_KITCHEN_GROWTH_HUB_COPY.titleAr}</h1>
            <p className="mt-2 text-sm leading-7 text-white/70">{STORE_KITCHEN_GROWTH_HUB_COPY.leadAr}</p>
          </div>
          <Link to={deskPath} className="shrink-0 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white/80">
            {STORE_KITCHEN_GROWTH_HUB_COPY.backAr}
          </Link>
        </header>

        {gate === 'loading' ? <p className="text-sm text-white/60">جاري فتح المركز…</p> : null}
        {gate === 'missing' ? <p className="text-sm text-white/70">الرابط غير صالح.</p> : null}
        {gate === 'ok' ? (
          <div className="space-y-6">
            {STORE_KITCHEN_GROWTH_CATEGORIES.map((category) => {
              const items = kitchenGrowthItemsByCategory(category.id);
              if (!items.length) return null;
              return (
                <section key={category.id} className="space-y-3">
                  <h2 className="text-base font-extrabold text-[#f4efe4]">{category.titleAr}</h2>
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-[#0f0f14]/95 p-4"
                        data-product={STORE_KITCHEN_GROWTH_HUB_PRODUCT_ID}
                      >
                        <p className="text-sm font-extrabold text-[#f4efe4]">{item.titleAr}</p>
                        <p className="mt-2 text-sm leading-7 text-white/75">{item.bodyAr}</p>
                        {item.copyable ? (
                          <button
                            type="button"
                            className="mt-3 rounded-full bg-[#b45a3c] px-4 py-2 text-sm font-extrabold text-[#061018]"
                            onClick={() => void copyText(item.bodyAr)}
                          >
                            {STORE_KITCHEN_GROWTH_HUB_COPY.copyAr}
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        ) : null}
      </div>
    </StorePurchasedShell>
  );
}
