/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مكتب طلبات متجر halaqmap — متفرع من لوحة التحكم.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Mail,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
  Store,
} from 'lucide-react';
import { FounderCommandShell } from '@/components/admin/founder/FounderCommandShell';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { getAdminDashboardPathFor } from '@/config/adminAuth';
import { STORE_DESK_COPY, STORE_DESK_STATUS_AR } from '@/config/storeDeskCopy';
import { STORE_LIVE_PRODUCTS, STORE_SOFTWARE_SHOTS } from '@/config/storeFront';
import { StoreSeoProofCard } from '@/components/store/StoreSeoProofCard';
import { StoreShot } from '@/components/store/StoreShot';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import {
  fetchAdminStoreDesk,
  postAdminStoreDesk,
  type StoreDeskChatTurn,
  type StoreDeskRequestRow,
  type StoreDeskStatus,
} from '@/lib/adminStoreDeskRemote';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

type AuthPhase = 'loading' | 'ok' | 'denied';

function formatWhen(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
}

function whatsappHref(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('0') ? `966${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text.slice(0, 1800))}`;
}

export default function StoreDeskPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<AuthPhase>('loading');
  const [rows, setRows] = useState<StoreDeskRequestRow[]>([]);
  const [hint, setHint] = useState('');
  const [openaiConfigured, setOpenaiConfigured] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [replyDraft, setReplyDraft] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState<StoreDeskStatus>('new');
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState<StoreDeskChatTurn[]>([]);
  const [followUp, setFollowUp] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const autoMeetFor = useRef('');

  useDocumentTitle(STORE_DESK_COPY.documentTitle);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? null,
    [rows, selectedId],
  );

  const loadList = useCallback(async () => {
    const payload = await fetchAdminStoreDesk();
    if (payload.ok === false) {
      setNotice(payload.error);
      return;
    }
    setRows(payload.rows);
    setHint(payload.hint || (payload.tableMissing ? 'جدول الطلبات غير مطبّق بعد.' : ''));
    setOpenaiConfigured(payload.openaiConfigured);
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
          access.permissions.includes('view_overview') ||
          access.permissions.includes('view_requests') ||
          access.permissions.includes('review_requests'));
      if (!allowed) {
        if (!cancelled) setPhase('denied');
        return;
      }
      if (!cancelled) setPhase('ok');
      await loadList();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadList]);

  useEffect(() => {
    if (!selected) return;
    setReplyDraft(selected.replyDraft);
    setAdminNotes(selected.adminNotes);
    setStatus((selected.status as StoreDeskStatus) || 'new');
    setTranscript(selected.councilTranscript);
    setHistory(
      selected.councilTranscript
        ? [{ role: 'assistant', content: selected.councilTranscript }]
        : [],
    );
    setFollowUp('');
    setNotice('');
    // hydrate only when switching requests — not after every list refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const runCouncil = useCallback(
    async (message?: string, historyOverride?: StoreDeskChatTurn[]) => {
      if (!selectedId || busy) return;
      const convo = historyOverride ?? history;
      setBusy(true);
      setNotice('');
      const payload = await postAdminStoreDesk({
        action: 'council',
        requestId: selectedId,
        userMessage: message || '',
        conversationHistory: convo,
      });
      setBusy(false);
      if (payload.ok !== true) {
        setNotice(String(payload.error || 'تعذّر اجتماع الوكلاء'));
        return;
      }
      const nextTranscript = String(payload.transcript || '');
      const nextDraft = String(payload.replyDraft || replyDraft);
      setTranscript(nextTranscript);
      if (nextDraft) setReplyDraft(nextDraft);
      setHistory([
        ...convo,
        ...(message ? [{ role: 'user' as const, content: message }] : []),
        { role: 'assistant', content: nextTranscript },
      ]);
      await loadList();
    },
    [selectedId, busy, history, replyDraft, loadList],
  );

  useEffect(() => {
    if (phase !== 'ok' || !selectedId || !openaiConfigured) return;
    if (!selected || selected.councilTranscript) return;
    if (autoMeetFor.current === selected.id) return;
    autoMeetFor.current = selected.id;
    void runCouncil(undefined, []);
    // first meeting only — do not retrigger when history/runCouncil identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, selectedId, openaiConfigured]);

  const saveDesk = async () => {
    if (!selectedId) return;
    setBusy(true);
    const payload = await postAdminStoreDesk({
      action: 'save',
      requestId: selectedId,
      replyDraft,
      adminNotes,
      status,
    });
    setBusy(false);
    if (payload.ok !== true) {
      setNotice(String(payload.error || 'تعذّر الحفظ'));
      return;
    }
    setNotice('حُفظت المسودة.');
    await loadList();
  };

  if (phase === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#050505] text-white/70" dir="rtl">
        يجري فتح المكتب…
      </div>
    );
  }

  if (phase === 'denied') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#050505] px-6 text-center text-white/70" dir="rtl">
        {STORE_DESK_COPY.deniedAr}
      </div>
    );
  }

  return (
    <FounderCommandShell
      header={
        <header className={founderTheme.header}>
          <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <button
              type="button"
              onClick={() => navigate(getAdminDashboardPathFor(location.pathname))}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80"
            >
              <ArrowRight className="h-4 w-4" />
              لوحة التحكم
            </button>
            <div className="min-w-0 text-center">
              <p className="text-[0.7rem] font-bold tracking-wide text-[#e8c547]">{STORE_DESK_COPY.kickerAr}</p>
              <h1 className="truncate text-lg font-extrabold text-white">{STORE_DESK_COPY.titleAr}</h1>
            </div>
            <button
              type="button"
              onClick={() => void loadList()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#e8c547]/30 px-3 py-2 text-sm text-[#e8c547]"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث
            </button>
          </div>
        </header>
      }
    >
      <p className="max-w-3xl text-sm leading-7 text-white/70">{STORE_DESK_COPY.leadAr}</p>
      {hint ? <p className="mt-2 text-sm text-amber-200/80">{hint}</p> : null}
      {!openaiConfigured ? (
        <p className="mt-2 text-sm text-amber-200/80">{STORE_DESK_COPY.openaiMissingAr}</p>
      ) : null}
      {notice ? <p className="mt-2 text-sm text-[#e8c547]">{notice}</p> : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
        <section className={cn(founderTheme.glassCard, 'p-4')}>
          <h2 className="text-lg font-extrabold text-white">{STORE_DESK_COPY.listTitleAr}</h2>
          <ul className="mt-4 space-y-2">
            {rows.length === 0 ? (
              <li className="text-sm text-white/55">{STORE_DESK_COPY.emptyAr}</li>
            ) : (
              rows.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(row.id)}
                    className={cn(
                      'w-full rounded-xl border px-3 py-3 text-right transition',
                      selectedId === row.id
                        ? 'border-[#e8c547]/50 bg-[#e8c547]/10'
                        : 'border-white/10 bg-black/20 hover:border-[#e8c547]/30',
                    )}
                  >
                    <p className="font-extrabold text-white">{row.applicantName}</p>
                    <p className="mt-1 truncate text-xs text-white/55">{row.requestBody}</p>
                    <p className="mt-2 text-[0.7rem] text-[#e8c547]">
                      {STORE_DESK_STATUS_AR[row.status] || row.status} · {formatWhen(row.createdAt)}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <div className="space-y-6">
          <StoreSeoProofCard tone="desk" eager />
          {selected ? (
            <>
              <section className={cn(founderTheme.glassCard, 'p-5')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#e8c547]">{selected.entityName || 'فرد'}</p>
                    <h2 className="mt-1 text-2xl font-extrabold text-white">{selected.applicantName}</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/75">{selected.requestBody}</p>
                    <p className="mt-3 text-xs text-white/45">
                      {selected.email}
                      {selected.freelanceWorkDoc ? ` · وثيقة العمل الحر: ${selected.freelanceWorkDoc}` : ''}
                      {selected.source ? ` · ${selected.source}` : ''}
                    </p>
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StoreDeskStatus)}
                    className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                  >
                    {Object.entries(STORE_DESK_STATUS_AR).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <a
                    className="inline-flex items-center gap-1 rounded-full border border-[#e8c547]/35 px-3 py-1.5 text-[#e8c547]"
                    href={whatsappHref(selected.whatsapp, replyDraft || selected.requestBody)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {STORE_DESK_COPY.whatsappAr}
                  </a>
                  <a
                    className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-white/80"
                    href={`mailto:${selected.email}?subject=${encodeURIComponent('رد متجر halaqmap')}&body=${encodeURIComponent(replyDraft)}`}
                  >
                    <Mail className="h-4 w-4" />
                    {STORE_DESK_COPY.emailAr}
                  </a>
                  <span className="rounded-full border border-white/10 px-3 py-1.5 text-white/55" dir="ltr">
                    {selected.phone}
                  </span>
                </div>
              </section>

              <section className={cn(founderTheme.glassCard, 'p-5')}>
                <h3 className="text-lg font-extrabold text-white">{STORE_DESK_COPY.showcaseTitleAr}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {STORE_SOFTWARE_SHOTS.map((shot) => (
                    <figure key={shot.src} className="overflow-hidden rounded-xl border border-white/10">
                      <StoreShot src={shot.src} alt={shot.alt} className="aspect-[16/10]" />
                      <figcaption className="px-3 py-2 text-xs font-bold text-[#e8c547]">{shot.caption}</figcaption>
                    </figure>
                  ))}
                </div>
                <ul className="mt-4 space-y-2">
                  {STORE_LIVE_PRODUCTS.map((product) => (
                    <li key={product.id} className="text-sm leading-6 text-white/70">
                      <span className="font-extrabold text-[#e8c547]">{product.nameAr}</span>
                      <span className="mx-2 text-white/25">·</span>
                      {product.blurb}
                    </li>
                  ))}
                </ul>
              </section>

              <section className={cn(founderTheme.glassCard, 'p-5')}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{STORE_DESK_COPY.meetingTitleAr}</h3>
                    <p className="mt-1 text-sm text-white/60">{STORE_DESK_COPY.meetingLeadAr}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {STORE_DESK_COPY.agentsAr.map((agent) => (
                        <span
                          key={agent}
                          className="rounded-full border border-[#e8c547]/25 bg-[#e8c547]/10 px-2.5 py-0.5 text-[0.7rem] font-bold text-[#e8c547]"
                        >
                          {agent}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busy || !openaiConfigured}
                    onClick={() => void runCouncil(followUp.trim() || undefined)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#e8c547] px-4 py-2 text-sm font-extrabold text-[#061018] disabled:opacity-40"
                  >
                    <Sparkles className="h-4 w-4" />
                    {STORE_DESK_COPY.meetAr}
                  </button>
                </div>
                <div
                  dir="rtl"
                  className="chat-arabic-text mt-4 max-h-[28rem] overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white/80"
                >
                  {busy && !transcript ? 'يجتمع الوكلاء الآن…' : transcript || 'اختر طلباً ليُعقد الاجتماع تلقائياً.'}
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <textarea
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    rows={2}
                    placeholder="سؤال متابعة لاجتماع الوكلاء…"
                    className="min-h-[44px] flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                  <button
                    type="button"
                    disabled={busy || !followUp.trim()}
                    onClick={() => {
                      const msg = followUp.trim();
                      setFollowUp('');
                      void runCouncil(msg);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8c547]/40 text-[#e8c547]"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </section>

              <section className={cn(founderTheme.glassCard, 'p-5')}>
                <h3 className="text-lg font-extrabold text-white">{STORE_DESK_COPY.replyTitleAr}</h3>
                <textarea
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  rows={8}
                  className="mt-3 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm leading-7 text-white"
                />
                <h3 className="mt-5 text-lg font-extrabold text-white">{STORE_DESK_COPY.notesTitleAr}</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="mt-3 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void saveDesk()}
                  className="mt-4 rounded-full bg-[#e8c547] px-5 py-2 text-sm font-extrabold text-[#061018]"
                >
                  {STORE_DESK_COPY.saveAr}
                </button>
              </section>
            </>
          ) : (
            <section className={cn(founderTheme.glassCard, 'flex min-h-[20rem] items-center justify-center p-8 text-white/45')}>
              <Store className="me-2 h-5 w-5 text-[#e8c547]" />
              اختر طلباً من القائمة للتعامل معه والرد عليه.
            </section>
          )}
        </div>
      </div>
    </FounderCommandShell>
  );
}
