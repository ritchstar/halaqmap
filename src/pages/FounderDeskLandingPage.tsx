/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo, useState } from 'react';
import { Hourglass, Loader2, MessageCircle, Send } from 'lucide-react';
import { FounderDeskBanner } from '@/components/partner/FounderDeskBanner';
import { FOUNDER_DESK_COPY, FOUNDER_DESK_MAX_BODY } from '@/config/founderDeskCopy';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { resolveAdminAccess } from '@/lib/adminAccessRemote';
import {
  fetchFounderDeskInbox,
  listFounderDeskInboxMessages,
  sendFounderDeskInboxReply,
} from '@/lib/adminFounderDeskRemote';
import type { FounderDeskConversation, FounderDeskMessage } from '@/lib/founderDeskChatRemote';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';
import { cn } from '@/lib/utils';

type Phase = 'loading' | 'visitor' | 'inbox';

function formatWhen(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' });
}

function remainingLabel(expiresAt: string): string {
  const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function useNoIndexTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      meta.remove();
    };
  }, [title]);
}

function FounderDeskInbox() {
  const [conversations, setConversations] = useState<FounderDeskConversation[]>([]);
  const [tableMissing, setTableMissing] = useState(false);
  const [hint, setHint] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<FounderDeskMessage[]>([]);
  const [expired, setExpired] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const selected = useMemo(
    () => conversations.find((row) => row.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const loadInbox = async () => {
    const payload = await fetchFounderDeskInbox();
    if (!payload.ok) {
      setNotice(payload.error);
      return;
    }
    setTableMissing(payload.tableMissing);
    setHint(payload.hint || '');
    setConversations(payload.conversations);
    setSelectedId((prev) => {
      if (prev && payload.conversations.some((row) => row.id === prev)) return prev;
      return payload.conversations[0]?.id ?? null;
    });
  };

  const loadMessages = async (id: string) => {
    const result = await listFounderDeskInboxMessages(id);
    if (!result.ok) {
      setNotice(result.error);
      return;
    }
    setMessages(result.messages);
    setExpired(result.expired);
  };

  useEffect(() => {
    void loadInbox();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    void loadMessages(selectedId);
  }, [selectedId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!isPollingTabActive()) return;
      void loadInbox();
      if (selectedId) void loadMessages(selectedId);
    }, POLL_MS.PRIVATE_CHAT_LIST);
    return () => window.clearInterval(timer);
  }, [selectedId]);

  const reply = async () => {
    if (!selectedId || !draft.trim() || busy || expired) return;
    setBusy(true);
    const result = await sendFounderDeskInboxReply(selectedId, draft.trim());
    setBusy(false);
    if (!result.ok) {
      setNotice(result.error);
      return;
    }
    setDraft('');
    setNotice('');
    setMessages((prev) => [...prev, result.message]);
    await loadInbox();
  };

  return (
    <section className="rounded-[1.6rem] border border-[#bedee8] bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black text-[#184955]">
            <MessageCircle className="h-5 w-5" />
            {FOUNDER_DESK_COPY.inboxTitleAr}
          </h1>
          <p className="mt-1 text-xs leading-6 text-slate-600">{FOUNDER_DESK_COPY.inboxHintAr}</p>
        </div>
        {selected ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#18687a]/10 px-2 py-1 text-[0.65rem] font-bold text-[#18687a]">
            <Hourglass className="h-3 w-3" />
            {remainingLabel(selected.expires_at)}
          </span>
        ) : null}
      </div>

      {tableMissing ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {hint || FOUNDER_DESK_COPY.tableMissingAr}
        </p>
      ) : null}
      {notice ? <p className="mb-3 text-sm text-rose-700">{notice}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <aside className="space-y-2">
          {conversations.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-xs text-slate-500">
              {FOUNDER_DESK_COPY.inboxEmptyAr}
            </p>
          ) : (
            conversations.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedId(row.id)}
                className={cn(
                  'w-full rounded-xl border px-3 py-2 text-right text-xs',
                  selectedId === row.id
                    ? 'border-[#18687a] bg-[#18687a]/8 text-[#184955]'
                    : 'border-slate-200 bg-white text-slate-700',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{formatWhen(row.last_message_at || row.started_at)}</span>
                  {(row.unread_visitor ?? 0) > 0 ? (
                    <span className="rounded-full bg-rose-600 px-1.5 text-[10px] font-black text-white">
                      {row.unread_visitor}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-slate-500">{row.visitor_preview || '—'}</p>
              </button>
            ))
          )}
        </aside>

        <div className="flex min-h-[22rem] flex-col rounded-xl border border-[#d5e9f0] bg-[#fbfeff]">
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.length === 0 ? (
              <p className="py-10 text-center text-xs text-slate-500">{FOUNDER_DESK_COPY.emptyAr}</p>
            ) : (
              messages.map((message) => {
                const mine = message.sender === 'founder';
                return (
                  <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                        mine
                          ? 'rounded-bl-md bg-[#18687a] text-white'
                          : 'rounded-br-md bg-white text-slate-800 ring-1 ring-[#d5e9f0]',
                      )}
                    >
                      <p className="mb-1 text-[10px] opacity-80">
                        {mine ? FOUNDER_DESK_COPY.founderAr : FOUNDER_DESK_COPY.visitorAr}
                      </p>
                      <p dir="rtl" className="chat-arabic-text whitespace-pre-wrap break-words">
                        {message.body}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-[#deeff4] p-2.5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, FOUNDER_DESK_MAX_BODY))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void reply();
                }
              }}
              disabled={busy || expired || !selectedId}
              maxLength={FOUNDER_DESK_MAX_BODY}
              placeholder={expired ? FOUNDER_DESK_COPY.expiredAr : FOUNDER_DESK_COPY.emptyAr}
              className="h-10 flex-1 rounded-xl border border-[#cfe6ee] bg-white px-3 text-sm outline-none focus:border-[#18687a]"
            />
            <button
              type="button"
              onClick={() => void reply()}
              disabled={busy || expired || !selectedId || !draft.trim()}
              className="inline-flex h-10 items-center gap-1 rounded-xl bg-[#18687a] px-3 text-sm font-bold text-white disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {FOUNDER_DESK_COPY.sendAr}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function FounderDeskLandingPage() {
  const [phase, setPhase] = useState<Phase>('loading');
  useNoIndexTitle('حلاق ماب — مكتب المؤسس');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isSupabaseConfigured()) {
        if (!cancelled) setPhase('visitor');
        return;
      }
      const client = getSupabaseClient();
      if (!client) {
        if (!cancelled) setPhase('visitor');
        return;
      }
      const { data } = await client.auth.getSession();
      const email = data.session?.user?.email;
      if (!email) {
        if (!cancelled) setPhase('visitor');
        return;
      }
      const access = await resolveAdminAccess(email);
      const allowed =
        access.allowed &&
        (access.bootstrap || access.permissions.view_overview || access.permissions.view_partner_marketing);
      if (!cancelled) setPhase(allowed ? 'inbox' : 'visitor');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#061223] px-4 py-8" dir="rtl" style={{ fontFamily: 'Tajawal, system-ui' }}>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <p className="text-center text-xs text-slate-400">{FOUNDER_DESK_COPY.visitorLandingHintAr}</p>
        {phase === 'loading' ? (
          <div className="flex justify-center py-16 text-teal-100">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : phase === 'inbox' ? (
          <FounderDeskInbox />
        ) : (
          <FounderDeskBanner startOpen />
        )}
      </div>
    </div>
  );
}
