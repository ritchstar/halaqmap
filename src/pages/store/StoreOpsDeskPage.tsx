/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة المتجر الإلكتروني — مسار مستقل عن رخصة النفاذ ومحفظة الحلاق.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  type StoreOpsTrialLink,
  type StoreOpsTrialRow,
} from '@/lib/adminStoreOpsRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';

function statusLabel(status: string): string {
  const map = STORE_PRODUCT_TRIAL_COPY.statusAr as Record<string, string>;
  return map[status] || status;
}

function formatStamp(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function issuerLine(row: StoreOpsTrialRow): string {
  if (row.issuer_kind === 'admin') return STORE_PRODUCT_TRIAL_COPY.generatedByAr;
  const name = String(row.issued_by_label || '').trim();
  return name
    ? `${STORE_PRODUCT_TRIAL_COPY.referredFromAr}: ${name}`
    : STORE_PRODUCT_TRIAL_COPY.referredFromAr;
}

async function copyHref(href: string) {
  try {
    await navigator.clipboard.writeText(href);
    toast.success(STORE_PRODUCT_TRIAL_COPY.copyLinkAr);
  } catch {
    toast.error('تعذر نسخ الرابط.');
  }
}

function TrialLinks({ links }: { links: StoreOpsTrialLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {links.map((link) => (
        <button
          key={link.href}
          type="button"
          onClick={() => void copyHref(link.href)}
          className="rounded-lg border border-teal-300/30 bg-teal-400/10 px-3 py-1.5 text-xs font-bold text-teal-100"
        >
          نسخ {link.titleAr}
        </button>
      ))}
    </div>
  );
}

function TrialMeta({ row }: { row: StoreOpsTrialRow }) {
  const product = STORE_PRODUCT_TRIAL_PRODUCTS[row.product_key as StoreProductTrialKey];
  return (
    <>
      <p className="font-bold text-white">
        {product?.titleAr || row.product_key} · {statusLabel(row.status)}
      </p>
      <p className="mt-1 text-slate-300" dir="ltr">
        {row.beneficiary_email || '—'}
      </p>
      <p className="mt-1 text-slate-400">{issuerLine(row)}</p>
      {row.first_opened_at || row.trial_ends_at ? (
        <p className="mt-1 text-xs leading-6 text-slate-500">
          أول دخول: {formatStamp(row.first_opened_at)} · ينتهي: {formatStamp(row.trial_ends_at)}
        </p>
      ) : null}
      <TrialLinks links={row.links || []} />
    </>
  );
}

export default function StoreOpsDeskPage() {
  useDocumentTitle(STORE_PRODUCT_TRIAL_COPY.opsTitleAr);
  const [accessToken, setAccessToken] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const [rows, setRows] = useState<StoreOpsTrialRow[]>([]);
  const [issueKey, setIssueKey] = useState<StoreProductTrialKey>('wedding');
  const [issueEmail, setIssueEmail] = useState('');
  const [completeEmails, setCompleteEmails] = useState<Record<string, string>>({});
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
    const res = await adminListStoreTrialsRemote({ accessToken });
    if (!res.ok) {
      toast.error(res.error === 'not_authenticated' ? 'انتهت الجلسة. سجّل الدخول بصفة الإدارة.' : res.error);
      return;
    }
    setRows(res.rows);
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) void refresh();
  }, [accessToken, refresh]);

  const inbox = useMemo(() => rows.filter((row) => row.status === 'pending_review'), [rows]);
  const issued = useMemo(
    () => rows.filter((row) => row.status === 'issued' || row.status === 'activated' || row.status === 'expired'),
    [rows],
  );
  const paid = useMemo(() => rows.filter((row) => row.status === 'converted'), [rows]);
  const declinedCount = useMemo(() => rows.filter((row) => row.status === 'declined').length, [rows]);
  const issueProduct = STORE_PRODUCT_TRIAL_PRODUCTS[issueKey];

  async function issue() {
    setBusyKey('issue');
    const res = await adminStoreOpsActionRemote({
      accessToken,
      action: 'issue',
      productKey: issueKey,
      email: issueEmail,
    });
    setBusyKey('');
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(STORE_PRODUCT_TRIAL_COPY.issuedAr);
    setIssueEmail('');
    void refresh();
  }

  async function approve(row: StoreOpsTrialRow) {
    const email = (completeEmails[row.id] ?? row.beneficiary_email ?? '').trim();
    setBusyKey(row.id);
    const res = await adminStoreOpsActionRemote({
      accessToken,
      action: 'approve',
      trialId: row.id,
      email,
    });
    setBusyKey('');
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(STORE_PRODUCT_TRIAL_COPY.issuedAr);
    setCompleteEmails((prev) => {
      const next = { ...prev };
      delete next[row.id];
      return next;
    });
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
            <section className="space-y-4 rounded-2xl border border-teal-300/20 bg-teal-400/[0.04] p-5">
              <div>
                <h2 className="text-lg font-extrabold">{STORE_PRODUCT_TRIAL_COPY.inboxTitleAr}</h2>
                <p className="mt-1 text-sm leading-7 text-slate-400">{STORE_PRODUCT_TRIAL_COPY.inboxLeadAr}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm font-bold text-teal-200">{STORE_PRODUCT_TRIAL_COPY.generateCtaAr}</p>
                <p className="mt-1 text-sm leading-7 text-slate-400">{STORE_PRODUCT_TRIAL_COPY.emailHintAr}</p>
                <label className="mt-3 block text-sm">
                  المنتج
                  <select
                    className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3"
                    value={issueKey}
                    onChange={(event) => setIssueKey(event.target.value as StoreProductTrialKey)}
                  >
                    {STORE_PRODUCT_TRIAL_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {STORE_PRODUCT_TRIAL_PRODUCTS[key].titleAr}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mt-2 text-xs leading-6 text-slate-500">{issueProduct.opsNoteAr}</p>
                <label className="mt-3 block text-sm">
                  {STORE_PRODUCT_TRIAL_COPY.issueFieldAr}
                  <input
                    className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3"
                    dir="ltr"
                    type="email"
                    value={issueEmail}
                    onChange={(event) => setIssueEmail(event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  disabled={busyKey === 'issue'}
                  onClick={() => void issue()}
                  className="mt-3 rounded-xl bg-teal-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-60"
                >
                  {STORE_PRODUCT_TRIAL_COPY.issueCtaAr}
                </button>
              </div>
              {inbox.length === 0 ? (
                <p className="text-sm text-slate-400">لا طلبات محالة بانتظار الإتمام.</p>
              ) : (
                <ul className="space-y-2">
                  {inbox.map((row) => {
                    const product = STORE_PRODUCT_TRIAL_PRODUCTS[row.product_key as StoreProductTrialKey];
                    return (
                      <li key={row.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                        <p className="font-bold text-white">{product?.titleAr || row.product_key}</p>
                        <p className="mt-1 text-slate-400">{issuerLine(row)}</p>
                        <label className="mt-3 block text-sm">
                          {STORE_PRODUCT_TRIAL_COPY.issueFieldAr}
                          <input
                            className="mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3"
                            dir="ltr"
                            type="email"
                            value={completeEmails[row.id] ?? row.beneficiary_email ?? ''}
                            onChange={(event) =>
                              setCompleteEmails((prev) => ({ ...prev, [row.id]: event.target.value }))
                            }
                          />
                        </label>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busyKey === row.id}
                            onClick={() => void approve(row)}
                            className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-bold text-black disabled:opacity-60"
                          >
                            {STORE_PRODUCT_TRIAL_COPY.completeCtaAr}
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
              {declinedCount > 0 ? (
                <p className="text-xs text-slate-500">اعتذارات سابقة: {declinedCount}</p>
              ) : null}
            </section>
            <section className="space-y-3">
              <div>
                <h2 className="text-lg font-extrabold">{STORE_PRODUCT_TRIAL_COPY.trialListTitleAr}</h2>
                <p className="mt-1 text-sm leading-7 text-slate-400">{STORE_PRODUCT_TRIAL_COPY.trialListLeadAr}</p>
              </div>
              {issued.length === 0 ? (
                <p className="text-sm text-slate-400">لا منتجات مصدرة تجريبياً بعد.</p>
              ) : (
                <ul className="space-y-2">
                  {issued.map((row) => (
                    <li key={row.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                      <TrialMeta row={row} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="space-y-3">
              <div>
                <h2 className="text-lg font-extrabold">{STORE_PRODUCT_TRIAL_COPY.paidListTitleAr}</h2>
                <p className="mt-1 text-sm leading-7 text-slate-400">{STORE_PRODUCT_TRIAL_COPY.paidListLeadAr}</p>
              </div>
              {paid.length === 0 ? (
                <p className="text-sm text-slate-400">لا اشتراكات مسددة مفعّلة بعد.</p>
              ) : (
                <ul className="space-y-2">
                  {paid.map((row) => (
                    <li key={row.id} className="rounded-2xl border border-emerald-300/20 bg-emerald-400/[0.04] px-4 py-3 text-sm">
                      <TrialMeta row={row} />
                    </li>
                  ))}
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
