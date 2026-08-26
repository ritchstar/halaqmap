/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مركز قيد مبيعات المتجر — متفرع من لوحة التحكم الرئيسية.
 */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCw, Wallet } from 'lucide-react';
import { getAdminDashboardPathFor, getAdminPortalBasePath } from '@/config/adminAuth';
import {
  STORE_SALES_LEDGER_BRANCHES,
  STORE_SALES_LEDGER_COPY,
} from '@/config/storeSalesLedger';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import { fetchAdminStoreSales, type StoreSalesSummary } from '@/lib/adminStoreSalesRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

type AuthPhase = 'loading' | 'ok' | 'denied';

export default function StoreSalesHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<AuthPhase>('loading');
  const [summaries, setSummaries] = useState<StoreSalesSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useDocumentTitle(STORE_SALES_LEDGER_COPY.documentTitle);

  const load = async () => {
    setBusy(true);
    const payload = await fetchAdminStoreSales();
    setBusy(false);
    if (payload.ok === false) {
      setNotice(payload.error);
      return;
    }
    setSummaries(payload.summaries);
    setNotice('');
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isSupabaseConfigured()) {
        if (!cancelled) setPhase('denied');
        return;
      }
      const client = getSupabaseClient();
      if (!client) {
        if (!cancelled) setPhase('denied');
        return;
      }
      const { data } = await client.auth.getSession();
      const email = data.session?.user?.email;
      if (!email) {
        if (!cancelled) setPhase('denied');
        return;
      }
      const access = await resolveAdminAccess(email);
      const allowed =
        access.allowed &&
        (access.bootstrap || access.permissions.view_overview || access.permissions.view_payments);
      if (!cancelled) setPhase(allowed ? 'ok' : 'denied');
      if (allowed && !cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#061223] text-teal-100">جاري فتح قيد المبيعات…</div>
    );
  }

  if (phase !== 'ok') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#061223] text-slate-100" dir="rtl">
        <p>{STORE_SALES_LEDGER_COPY.deniedAr}</p>
        <button
          type="button"
          onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
          className="rounded-xl border border-teal-400/30 px-5 py-2 text-sm"
        >
          {STORE_SALES_LEDGER_COPY.dashAr}
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#061223] text-slate-100" style={{ fontFamily: 'Tajawal, system-ui' }}>
      <header className="border-b border-[#e8c547]/20 px-5 py-4">
        <button
          type="button"
          onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
          className="mb-3 inline-flex items-center gap-1 text-sm text-[#e8c547]"
        >
          <ArrowRight className="h-4 w-4" />
          {STORE_SALES_LEDGER_COPY.dashAr}
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-wide text-[#e8c547]">{STORE_SALES_LEDGER_COPY.kickerAr}</p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-black">
              <Wallet className="h-6 w-6 text-[#e8c547]" />
              {STORE_SALES_LEDGER_COPY.titleAr}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">{STORE_SALES_LEDGER_COPY.leadAr}</p>
            <button
              type="button"
              onClick={() => navigate(`${getAdminPortalBasePath()}${ROUTE_PATHS.ADMIN_STORE_DESK}`)}
              className="mt-3 rounded-xl border border-[#e8c547]/35 bg-[#1a1508] px-4 py-2 text-sm font-bold text-[#e8c547]"
            >
              إصدار التجارب والمسدد المفعَّل
            </button>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
            {STORE_SALES_LEDGER_COPY.refreshAr}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-4 px-5 py-8">
        {notice ? (
          <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm">{notice}</p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {STORE_SALES_LEDGER_BRANCHES.map((branch) => {
            const summary = summaries.find((item) => item.id === branch.id);
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() =>
                  navigate(`${getAdminPortalBasePath()}${ROUTE_PATHS.ADMIN_STORE_SALES}/${branch.id}`)
                }
                className="rounded-2xl border border-[#e8c547]/25 bg-[#0c1a2e] p-5 text-right transition hover:bg-[#12243a]"
              >
                <p className="text-lg font-black text-white">{branch.titleAr}</p>
                <p className="mt-1 text-sm text-white/60">{branch.packAr}</p>
                <p className="mt-4 text-sm text-[#e8c547]">
                  {STORE_SALES_LEDGER_COPY.liveCountAr}: {summary?.liveCount ?? 0}
                  {' · '}
                  {STORE_SALES_LEDGER_COPY.totalAr}: {summary?.totalSar ?? 0} ر.س
                </p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
