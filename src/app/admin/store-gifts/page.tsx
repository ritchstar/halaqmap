/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قائمة مشاركات هدايا المتجر — متفرعة من لوحة التحكم الرئيسية.
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Copy, Gift, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { getAdminDashboardPathFor } from '@/config/adminAuth';
import { STORE_GIFT_ROSTER_COPY, STORE_GIFT_ROSTER_SOURCE_AR } from '@/config/storeGiftRoster';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import {
  fetchAdminStoreGiftRoster,
  resendAdminStoreGiftConfirm,
  type StoreGiftRosterCampaign,
  type StoreGiftRosterMailState,
  type StoreGiftRosterRow,
} from '@/lib/adminStoreGiftRosterRemote';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

type AuthPhase = 'loading' | 'ok' | 'denied';
type CampaignFilter = 'all' | StoreGiftRosterCampaign;
type MailFilter = 'all' | StoreGiftRosterMailState;

function formatStamp(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function mailLabel(state: StoreGiftRosterMailState): string {
  if (state === 'active') return STORE_GIFT_ROSTER_COPY.activeAr;
  if (state === 'expired_link') return STORE_GIFT_ROSTER_COPY.expiredLinkAr;
  return STORE_GIFT_ROSTER_COPY.pendingAr;
}

export default function StoreGiftRosterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const copy = STORE_GIFT_ROSTER_COPY;
  const [phase, setPhase] = useState<AuthPhase>('loading');
  const [rows, setRows] = useState<StoreGiftRosterRow[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, active: 0, expiredLink: 0 });
  const [busy, setBusy] = useState(false);
  const [resendId, setResendId] = useState('');
  const [campaign, setCampaign] = useState<CampaignFilter>('all');
  const [mail, setMail] = useState<MailFilter>('all');

  useDocumentTitle(copy.documentTitle);

  const load = async () => {
    setBusy(true);
    const payload = await fetchAdminStoreGiftRoster();
    setBusy(false);
    if (payload.ok === false) {
      toast.error(payload.error === 'no_session' ? 'انتهت الجلسة.' : payload.error);
      return;
    }
    setRows(payload.rows);
    setCounts(payload.counts);
  };

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
        (access.bootstrap ||
          access.permissions.view_overview ||
          access.permissions.view_payments ||
          access.permissions.manage_partner_marketing);
      if (!cancelled) setPhase(allowed ? 'ok' : 'denied');
      if (allowed && !cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    return rows.filter((row) => {
      if (campaign !== 'all' && row.campaign !== campaign) return false;
      if (mail !== 'all' && row.mailState !== mail) return false;
      return true;
    });
  }, [rows, campaign, mail]);

  async function copyActive() {
    const emails = rows.filter((row) => row.mailState === 'active').map((row) => row.email);
    if (!emails.length) {
      toast.error('لا بريد مفعَّل بعد.');
      return;
    }
    try {
      await navigator.clipboard.writeText(emails.join('\n'));
      toast.success(copy.copiedAr);
    } catch {
      toast.error('تعذر النسخ.');
    }
  }

  async function resend(row: StoreGiftRosterRow) {
    if (row.mailState === 'active' || resendId) return;
    setResendId(row.id);
    const result = await resendAdminStoreGiftConfirm({ campaign: row.campaign, entryId: row.id });
    setResendId('');
    if (!result.ok) {
      toast.error(result.error || 'تعذر الإرسال.');
      return;
    }
    toast.success(copy.resendOkAr);
    await load();
  }

  if (phase === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#061223] text-teal-100">جاري فتح القائمة…</div>
    );
  }

  if (phase !== 'ok') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#061223] text-slate-100" dir="rtl">
        <p>{copy.deniedAr}</p>
        <button
          type="button"
          onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
          className="rounded-xl border border-teal-400/30 px-5 py-2 text-sm"
        >
          {copy.dashAr}
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
          {copy.dashAr}
        </button>
        <p className="text-xs font-bold tracking-wide text-[#e8c547]">{copy.kickerAr}</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-black">
          <Gift className="h-6 w-6 text-[#e8c547]" />
          {copy.titleAr}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">{copy.leadAr}</p>
        <p className="mt-3 text-sm font-bold text-[#e8c547]">
          {copy.countsAr} {counts.total}
          {' · '}
          {copy.pendingAr} {counts.pending}
          {' · '}
          {copy.activeAr} {counts.active}
          {' · '}
          {copy.expiredLinkAr} {counts.expiredLink}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-xl border border-[#e8c547]/35 bg-[#1a1508] px-4 py-2 text-sm font-bold text-[#e8c547] disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" />
            {copy.refreshAr}
          </button>
          <button
            type="button"
            onClick={() => void copyActive()}
            className="inline-flex items-center gap-1 rounded-xl border border-[#e8c547]/35 bg-[#1a1508] px-4 py-2 text-sm font-bold text-[#e8c547]"
          >
            <Copy className="h-4 w-4" />
            {copy.copyActiveAr}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {([
            ['all', copy.allAr],
            ['occasion', copy.occasionAr],
            ['kitchen', copy.kitchenAr],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCampaign(id)}
              className={
                campaign === id
                  ? 'rounded-full bg-[#e8c547] px-3 py-1.5 text-xs font-extrabold text-[#061018]'
                  : 'rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-white/70'
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {([
            ['all', copy.allAr],
            ['pending', copy.pendingAr],
            ['active', copy.activeAr],
            ['expired_link', copy.expiredLinkAr],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMail(id)}
              className={
                mail === id
                  ? 'rounded-full bg-[#e8c547] px-3 py-1.5 text-xs font-extrabold text-[#061018]'
                  : 'rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-white/70'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-3 px-5 py-6">
        {visible.length === 0 ? <p className="text-sm text-white/60">{copy.emptyAr}</p> : null}
        {visible.map((row) => (
          <article key={`${row.campaign}-${row.id}`} className="rounded-2xl border border-white/10 bg-[#0b1a24] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-extrabold text-[#f4efe4]">
                  {row.givenName}
                  {' · '}
                  <span className="text-[#e8c547]">{mailLabel(row.mailState)}</span>
                </p>
                <p className="mt-1 text-sm" dir="ltr">
                  {row.email}
                </p>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  {row.campaignLabelAr} · {copy.productAr}: {row.productLabelAr}
                  {row.slotNo ? ` · دورة ${row.slotNo}` : ''}
                </p>
                <p className="text-sm leading-7 text-white/70">
                  {copy.cityAr}: {row.city || '—'} · {copy.sourceAr}: {STORE_GIFT_ROSTER_SOURCE_AR[row.source] || row.source || '—'}
                </p>
                <p className="text-xs leading-6 text-white/45">
                  {copy.joinedAr}: {formatStamp(row.createdAt)} · {copy.deadlineAr}: {formatStamp(row.linkDeadlineAt)}
                </p>
              </div>
              {row.mailState !== 'active' ? (
                <button
                  type="button"
                  disabled={resendId === row.id}
                  onClick={() => void resend(row)}
                  className="rounded-full bg-[#e8c547] px-4 py-2 text-sm font-extrabold text-[#061018] disabled:opacity-60"
                >
                  {copy.resendAr}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
