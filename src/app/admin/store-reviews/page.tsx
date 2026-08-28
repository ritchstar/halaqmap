/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قائمة تقييمات المتجر — متفرعة من لوحة التحكم الرئيسية.
 */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCw, Star } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { getAdminDashboardPathFor } from '@/config/adminAuth';
import { STORE_REVIEWS_ADMIN_COPY } from '@/config/storeReviews';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import {
  fetchAdminStoreReviews,
  setAdminStoreReviewHidden,
  type StoreReviewAdmin,
} from '@/lib/adminStoreReviewsRemote';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

type AuthPhase = 'loading' | 'ok' | 'denied';
type Filter = 'all' | 'unseen' | 'published' | 'hidden';

function formatStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function StoreReviewsAdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const copy = STORE_REVIEWS_ADMIN_COPY;
  const [phase, setPhase] = useState<AuthPhase>('loading');
  const [rows, setRows] = useState<StoreReviewAdmin[]>([]);
  const [counts, setCounts] = useState({ total: 0, unseen: 0 });
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  useDocumentTitle(copy.documentTitle);

  const load = async () => {
    setBusy(true);
    const payload = await fetchAdminStoreReviews();
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
      if (filter === 'unseen') return row.unseen;
      if (filter === 'published') return row.status === 'published';
      if (filter === 'hidden') return row.status === 'hidden';
      return true;
    });
  }, [rows, filter]);

  async function toggle(row: StoreReviewAdmin) {
    const result = await setAdminStoreReviewHidden(row.id, row.status !== 'hidden');
    if (!result.ok) {
      toast.error(result.error || 'تعذر التحديث.');
      return;
    }
    await load();
  }

  if (phase === 'loading') {
    return <div className="flex h-screen items-center justify-center bg-[#061223] text-teal-100">جاري فتح التقييمات…</div>;
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
          <Star className="h-6 w-6 fill-[#e8c547] text-[#e8c547]" />
          {copy.titleAr}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">{copy.leadAr}</p>
        <p className="mt-3 text-sm font-bold text-[#e8c547]">
          الكل {counts.total}
          {' · '}
          {copy.unseenAr} {counts.unseen}
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
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {([
            ['all', copy.allAr],
            ['unseen', copy.unseenAr],
            ['published', copy.publishedAr],
            ['hidden', copy.hiddenAr],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={
                filter === id
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
          <article key={row.id} className="rounded-2xl border border-white/10 bg-[#0b1a24] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-extrabold text-[#f4efe4]">
                  {row.displayName || 'زائر'}
                  {row.unseen ? <span className="mr-2 text-xs font-bold text-[#e8c547]">{copy.unseenAr}</span> : null}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-[#e8c547]">
                  {Array.from({ length: row.stars }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#e8c547]" />
                  ))}
                </p>
                <p className="mt-2 text-sm leading-7 text-white/75">{row.comment}</p>
                <p className="mt-2 text-xs text-white/40">{formatStamp(row.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => void toggle(row)}
                className="rounded-full border border-[#e8c547]/40 px-4 py-2 text-sm font-bold text-[#e8c547]"
              >
                {row.status === 'hidden' ? copy.showAr : copy.hideAr}
              </button>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
