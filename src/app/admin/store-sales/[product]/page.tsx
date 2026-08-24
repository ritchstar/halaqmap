/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قيد مبيعات فرع منتج واحد.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { getAdminDashboardPathFor, getAdminPortalBasePath } from '@/config/adminAuth';
import {
  STORE_SALES_LEDGER_COPY,
  STORE_SALES_LEDGER_STATUS_AR,
  isStoreSalesLedgerProduct,
  storeSalesLedgerBranch,
  storeSalesVoiceAr,
} from '@/config/storeSalesLedger';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import { fetchAdminStoreSales, type StoreSalesLedgerRow } from '@/lib/adminStoreSalesRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

type AuthPhase = 'loading' | 'ok' | 'denied';

function formatWhen(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function StoreSalesLedgerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { product = '' } = useParams<{ product: string }>();
  const [phase, setPhase] = useState<AuthPhase>('loading');
  const [rows, setRows] = useState<StoreSalesLedgerRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const valid = isStoreSalesLedgerProduct(product);
  const branch = valid ? storeSalesLedgerBranch(product) : null;
  useDocumentTitle(branch ? `${branch.titleAr} — قيد المبيعات` : STORE_SALES_LEDGER_COPY.documentTitle);

  const load = async () => {
    if (!valid) return;
    setBusy(true);
    const payload = await fetchAdminStoreSales(product);
    setBusy(false);
    if (payload.ok === false) {
      setNotice(payload.error);
      return;
    }
    setRows(payload.rows);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (!valid) {
    return <Navigate to={`${getAdminPortalBasePath()}${ROUTE_PATHS.ADMIN_STORE_SALES}`} replace />;
  }

  if (phase === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#061223] text-teal-100">جاري فتح القيد…</div>
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
          onClick={() => navigate(`${getAdminPortalBasePath()}${ROUTE_PATHS.ADMIN_STORE_SALES}`)}
          className="mb-3 inline-flex items-center gap-1 text-sm text-[#e8c547]"
        >
          <ArrowRight className="h-4 w-4" />
          {STORE_SALES_LEDGER_COPY.backAr}
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-wide text-[#e8c547]">{STORE_SALES_LEDGER_COPY.kickerAr}</p>
            <h1 className="mt-1 text-2xl font-black">{branch?.titleAr}</h1>
            <p className="mt-1 text-sm text-white/60">{branch?.packAr}</p>
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
      <main className="mx-auto max-w-6xl px-5 py-8">
        {notice ? (
          <p className="mb-4 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm">{notice}</p>
        ) : null}
        {rows.length === 0 ? (
          <p className="text-sm text-white/55">{STORE_SALES_LEDGER_COPY.emptyAr}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[52rem] text-right text-sm">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="px-3 py-2 font-bold">{STORE_SALES_LEDGER_COPY.buyerAr}</th>
                  <th className="px-3 py-2 font-bold">{STORE_SALES_LEDGER_COPY.subjectAr}</th>
                  <th className="px-3 py-2 font-bold">{STORE_SALES_LEDGER_COPY.packAr}</th>
                  {product === 'event' ? <th className="px-3 py-2 font-bold">{STORE_SALES_LEDGER_COPY.voiceAr}</th> : null}
                  <th className="px-3 py-2 font-bold">{STORE_SALES_LEDGER_COPY.amountAr}</th>
                  <th className="px-3 py-2 font-bold">{STORE_SALES_LEDGER_COPY.statusAr}</th>
                  <th className="px-3 py-2 font-bold">{STORE_SALES_LEDGER_COPY.paidAtAr}</th>
                  <th className="px-3 py-2 font-bold">{STORE_SALES_LEDGER_COPY.paymentAr}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-white/10">
                    <td className="px-3 py-3">
                      <p className="font-bold text-white">{row.buyerName}</p>
                      <p className="text-xs text-white/50" dir="ltr">
                        {row.buyerEmail}
                      </p>
                    </td>
                    <td className="px-3 py-3">{row.subjectAr}</td>
                    <td className="px-3 py-3">{row.packAr}</td>
                    {product === 'event' ? (
                      <td className="px-3 py-3">{storeSalesVoiceAr(row.voice)}</td>
                    ) : null}
                    <td className="px-3 py-3 font-bold text-[#e8c547]">{row.amountSar} ر.س</td>
                    <td className="px-3 py-3">{STORE_SALES_LEDGER_STATUS_AR[row.status] || row.status}</td>
                    <td className="px-3 py-3 text-xs">{formatWhen(row.createdAt)}</td>
                    <td className="px-3 py-3 text-xs" dir="ltr">
                      {row.paymentId || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
