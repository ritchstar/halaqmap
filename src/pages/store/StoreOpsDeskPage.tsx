/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة المتجر الإلكتروني — مسار مستقل عن رخصة النفاذ ومحفظة الحلاق.
 */
import { useCallback, useEffect, useState } from 'react';
import { StoreAffiliateApplicationsPanel } from '@/components/admin/StoreAffiliateApplicationsPanel';
import { toast } from '@/components/ui/sonner';
import { getAdminLoginPath } from '@/config/adminAuth';
import {
  STORE_PRODUCT_TRIAL_COPY,
  STORE_PRODUCT_TRIAL_KEYS,
  STORE_PRODUCT_TRIAL_PRODUCTS,
  type StoreProductTrialKey,
} from '@/config/storeProductTrial';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getSupabaseClient } from '@/integrations/supabase/client';
import {
  adminListStoreTrialsRemote,
  adminStoreOpsActionRemote,
  type StoreOpsTrialRow,
} from '@/lib/adminStoreOpsRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';

const STATUS_FILTERS = ['', 'pending_review', 'issued', 'activated', 'expired', 'converted', 'declined'] as const;

function statusLabel(status: string): string {
  const map = STORE_PRODUCT_TRIAL_COPY.statusAr as Record<string, string>;
  return map[status] || status;
}

export default function StoreOpsDeskPage() {
  useDocumentTitle(STORE_PRODUCT_TRIAL_COPY.opsTitleAr);
  const [accessToken, setAccessToken] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const [rows, setRows] = useState<StoreOpsTrialRow[]>([]);
  const [filter, setFilter] = useState('pending_review');
  const [emails, setEmails] = useState<Record<StoreProductTrialKey, string>>({
    wedding: '',
    event: '',
    lounge: '',
    grocers: '',
    restaurant: '',
  });
  const [busyKey, setBusyKey] = useState('');
  const [declineId, setDeclineId] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const client = getSupabaseClient();
      if (!client) {
        setAuthReady(true);
        return;
      }
      const { data } = await client.auth.getSession();
      if (cancelled) return;
      setAccessToken(data.session?.access_token || '');
      setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    const res = await adminListStoreTrialsRemote({ accessToken, status: filter || undefined });
    if (!res.ok) {
      toast.error(res.error === 'not_authenticated' ? 'انتهت الجلسة. سجّل الدخول بصفة الإدارة.' : res.error);
      return;
    }
    setRows(res.rows);
  }, [accessToken, filter]);

  useEffect(() => {
    if (accessToken) void refresh();
  }, [accessToken, refresh]);

  async function issue(productKey: StoreProductTrialKey) {
    const email = emails[productKey].trim();
    setBusyKey(productKey);
    const res = await adminStoreOpsActionRemote({ accessToken, action: 'issue', productKey, email });
    setBusyKey('');
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(STORE_PRODUCT_TRIAL_COPY.issuedAr);
    setEmails((prev) => ({ ...prev, [productKey]: '' }));
    void refresh();
  }

  async function approve(row: StoreOpsTrialRow) {
    setBusyKey(row.id);
    const res = await adminStoreOpsActionRemote({ accessToken, action: 'approve', trialId: row.id });
    setBusyKey('');
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(STORE_PRODUCT_TRIAL_COPY.issuedAr);
    void refresh();
  }

  async function decline(row: StoreOpsTrialRow) {
    setBusyKey(row.id);
    const res = await adminStoreOpsActionRemote({
      accessToken,
      action: 'decline',
      trialId: row.id,
      reason: declineReason,
    });
    setBusyKey('');
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('أُرسل الاعتذار.');
    setDeclineId('');
    setDeclineReason('');
    void refresh();
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100" dir="rtl">
      <header className="border-b border-white/8 bg-black/40">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <p className="text-xs font-bold tracking-wide text-teal-300">{STORE_PRODUCT_TRIAL_COPY.opsKickerAr}</p>
          <h1 className="mt-1 text-2xl font-black">{STORE_PRODUCT_TRIAL_COPY.opsTitleAr}</h1>
          <p className="mt-2 text-sm leading-7 text-slate-400">{STORE_PRODUCT_TRIAL_COPY.opsLeadAr}</p>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl space-y-8 px-4 py-8 pb-16">
        {!authReady ? <p className="text-sm text-slate-400">جاري التحقق من الجلسة…</p> : null}
        {authReady && !accessToken ? (
          <section className="rounded-2xl border border-amber-300/25 bg-amber-400/5 p-5 text-sm leading-8">
            <p>سجّل الدخول بصفة الإدارة ثم افتح هذه الصفحة.</p>
            <a
              className="mt-3 inline-block font-bold text-teal-200 underline"
              href={`https://www.halaqmap.com/#${getAdminLoginPath()}?next=${encodeURIComponent(ROUTE_PATHS.STORE_OPS)}`}
            >
              دخول الإدارة
            </a>
          </section>
        ) : null}
        {accessToken ? (
          <>
            <section className="space-y-4">
              <h2 className="text-lg font-extrabold">إصدار نموذج إلى إيميل</h2>
              <p className="text-sm leading-7 text-slate-400">{STORE_PRODUCT_TRIAL_COPY.emailHintAr}</p>
              {STORE_PRODUCT_TRIAL_KEYS.map((key) => {
                const product = STORE_PRODUCT_TRIAL_PRODUCTS[key];
                return (
                  <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="font-extrabold text-white">{product.titleAr}</p>
                    <p className="mt-1 text-sm leading-7 text-slate-400">{product.opsNoteAr}</p>
                    <label className="mt-3 block text-sm">
                      {STORE_PRODUCT_TRIAL_COPY.issueFieldAr}
                      <input
                        className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3"
                        dir="ltr"
                        type="email"
                        value={emails[key]}
                        onChange={(event) => setEmails((prev) => ({ ...prev, [key]: event.target.value }))}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={busyKey === key}
                      onClick={() => void issue(key)}
                      className="mt-3 rounded-xl bg-teal-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-60"
                    >
                      {STORE_PRODUCT_TRIAL_COPY.issueCtaAr}
                    </button>
                  </div>
                );
              })}
            </section>
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold">طلبات التجربة</h2>
                <select
                  className="h-10 rounded-md border border-white/15 bg-[#061018] px-3 text-sm"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  {STATUS_FILTERS.map((item) => (
                    <option key={item || 'all'} value={item}>
                      {item ? statusLabel(item) : 'الكل'}
                    </option>
                  ))}
                </select>
              </div>
              {rows.length === 0 ? (
                <p className="text-sm text-slate-400">لا طلبات في هذا التصفية.</p>
              ) : (
                <ul className="space-y-2">
                  {rows.map((row) => {
                    const product = STORE_PRODUCT_TRIAL_PRODUCTS[row.product_key as StoreProductTrialKey];
                    return (
                      <li key={row.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                        <p className="font-bold text-white">
                          {product?.titleAr || row.product_key} · {statusLabel(row.status)}
                        </p>
                        <p className="mt-1 text-slate-300" dir="ltr">
                          {row.beneficiary_email}
                        </p>
                        <p className="mt-1 text-slate-400">
                          {row.issuer_kind === 'admin'
                            ? STORE_PRODUCT_TRIAL_COPY.issuerAdminAr
                            : `${STORE_PRODUCT_TRIAL_COPY.issuerMarketerAr}: ${row.issued_by_label || ''}`}
                        </p>
                        {row.status === 'pending_review' ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={busyKey === row.id}
                              onClick={() => void approve(row)}
                              className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-bold text-black disabled:opacity-60"
                            >
                              موافقة وإصدار
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeclineId(row.id);
                                setDeclineReason(row.review_note || '');
                              }}
                              className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold"
                            >
                              اعتذار
                            </button>
                          </div>
                        ) : null}
                        {declineId === row.id ? (
                          <div className="mt-3 space-y-2">
                            <textarea
                              className="h-20 w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2"
                              value={declineReason}
                              onChange={(event) => setDeclineReason(event.target.value)}
                              placeholder="سبب الاعتذار"
                            />
                            <button
                              type="button"
                              disabled={busyKey === row.id}
                              onClick={() => void decline(row)}
                              className="rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-bold disabled:opacity-60"
                            >
                              تأكيد الاعتذار
                            </button>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
            <section>
              <h2 className="mb-3 text-lg font-extrabold">طلبات مسوّقي المتجر</h2>
              <StoreAffiliateApplicationsPanel accessToken={accessToken} />
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
