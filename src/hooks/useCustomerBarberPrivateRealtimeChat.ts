import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import type { PrivateConversationRow, PrivateMessageRow } from '@/lib/privateChatRemote';
import {
  getCustomerPrivateChatServer,
  listCustomerPrivateMessagesServer,
  sendCustomerPrivateMessageServer,
  startCustomerPrivateChatServer,
} from '@/lib/customerPrivateChatServerRemote';
import { guessTranslateTarget, translateChatLineRemote } from '@/lib/diamondChatTranslateRemote';
import { customerDigitalShiftInterceptRemote } from '@/lib/customerDigitalShiftInterceptRemote';

export type CustomerBarberUiMessage = {
  id: string;
  role: 'customer' | 'barber';
  body: string;
  created_at: string;
  translated?: string | null;
};

function remainingMsFromExpiresAt(expiresAtIso: string | null): number {
  if (!expiresAtIso) return 0;
  const t = new Date(expiresAtIso).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, t - Date.now());
}

function mapRowsToUi(
  rows: PrivateMessageRow[],
  conversation: PrivateConversationRow | null,
  translations: Record<string, string>,
): CustomerBarberUiMessage[] {
  if (!conversation) return [];
  return rows.map((m) => {
    const role: 'customer' | 'barber' =
      m.sender_id === conversation.customer_id ? 'customer' : 'barber';
    return {
      id: m.id,
      role,
      body: m.body,
      created_at: m.created_at,
      translated: translations[m.id] ?? null,
    };
  });
}

export function useCustomerBarberPrivateRealtimeChat(
  barberId: string | undefined,
  options: { enableDiamondTranslation: boolean; restartSignal?: number },
) {
  const restartSignal = options.restartSignal ?? 0;
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'ready' | 'no_supabase' | 'start_failed' | 'expired_ui'
  >('idle');
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [conversation, setConversation] = useState<PrivateConversationRow | null>(null);
  const [rawMessages, setRawMessages] = useState<PrivateMessageRow[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [remainingMs, setRemainingMs] = useState(0);
  const convIdRef = useRef<string | null>(null);
  const translationAttemptedRef = useRef(new Set<string>());

  const refreshConversationAndMessages = useCallback(async (conversationId: string) => {
    const convRes = await getCustomerPrivateChatServer(conversationId);
    if (!convRes.ok) {
      setStatus('expired_ui');
      setRawMessages([]);
      setRemainingMs(0);
      return;
    }
    const conv = convRes.conversation;
    setConversation(conv);
    const open =
      conv.status === 'active' && !conv.closed_at && new Date(conv.expires_at).getTime() > Date.now();
    setRemainingMs(remainingMsFromExpiresAt(conv.expires_at));
    if (!open) {
      setStatus('expired_ui');
      setRawMessages([]);
      return;
    }
    const msgRes = await listCustomerPrivateMessagesServer(conversationId);
    if (!msgRes.ok) {
      setRawMessages([]);
      setStatus('expired_ui');
      return;
    }
    setRawMessages(msgRes.messages);
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (!barberId || !isSupabaseConfigured()) {
      setStatus('no_supabase');
      return;
    }

    let cancelled = false;

    (async () => {
      setStatus('loading');
      setErrorHint(null);

      const started = await startCustomerPrivateChatServer(barberId);
      if (!started.ok || cancelled) {
        setStatus('start_failed');
        setErrorHint(started.ok ? null : started.error);
        return;
      }

      const conversationId = started.conversationId;
      convIdRef.current = conversationId;
      setConversation(started.conversation);

      await refreshConversationAndMessages(conversationId);
    })();

    return () => {
      cancelled = true;
      translationAttemptedRef.current.clear();
      convIdRef.current = null;
    };
  }, [barberId, restartSignal, refreshConversationAndMessages]);

  useEffect(() => {
    const cid = convIdRef.current;
    if (!cid || status !== 'ready') return;

    const poll = window.setInterval(() => {
      void listCustomerPrivateMessagesServer(cid).then((msgRes) => {
        if (!msgRes.ok) return;
        if (msgRes.expired) {
          setStatus('expired_ui');
          setRawMessages([]);
          setRemainingMs(0);
          return;
        }
        setRawMessages(msgRes.messages);
      });
    }, 3000);

    return () => window.clearInterval(poll);
  }, [status, conversation?.id]);

  useEffect(() => {
    if (!conversation?.expires_at) return;
    const tick = () => {
      const ms = remainingMsFromExpiresAt(conversation.expires_at);
      setRemainingMs(ms);
      if (ms <= 0) {
        setStatus('expired_ui');
        setRawMessages([]);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [conversation?.expires_at]);

  useEffect(() => {
    if (!options.enableDiamondTranslation || !conversation) return;

    let cancelled = false;
    (async () => {
      const updates: Record<string, string> = {};
      for (const m of rawMessages) {
        if (m.sender_id === conversation.customer_id) continue;
        if (translationAttemptedRef.current.has(m.id)) continue;
        translationAttemptedRef.current.add(m.id);
        const target = guessTranslateTarget(m.body);
        const tr = await translateChatLineRemote({ text: m.body, target });
        if (cancelled) return;
        if (tr.ok && tr.text && tr.text !== m.body) updates[m.id] = tr.text;
      }
      if (Object.keys(updates).length > 0) {
        setTranslations((prev) => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(updates)) {
            if (!next[k]) next[k] = v;
          }
          return next;
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rawMessages, conversation, options.enableDiamondTranslation]);

  const uiMessages = useMemo(
    () => mapRowsToUi(rawMessages, conversation, translations),
    [rawMessages, conversation, translations],
  );

  useEffect(() => {
    const cid = convIdRef.current;
    if (!cid || status !== 'ready') return;

    const runIntercept = async () => {
      const r = await customerDigitalShiftInterceptRemote(cid);
      if (r.ok && r.replied) {
        await refreshConversationAndMessages(cid);
      }
    };

    void runIntercept();
    const iv = window.setInterval(() => void runIntercept(), 25_000);
    return () => window.clearInterval(iv);
  }, [status, conversation?.id, refreshConversationAndMessages]);

  const send = useCallback(
    async (body: string) => {
      const cid = convIdRef.current;
      if (!cid) return { ok: false as const, error: 'لا توجد محادثة.' };
      if (remainingMsFromExpiresAt(conversation?.expires_at ?? '') <= 0) {
        return { ok: false as const, error: 'انتهت الجلسة.' };
      }
      const result = await sendCustomerPrivateMessageServer(cid, body);
      if (result.ok) {
        setRawMessages((prev) => {
          if (prev.some((m) => m.id === result.message.id)) return prev;
          return [...prev, result.message].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          );
        });
        window.setTimeout(() => {
          void customerDigitalShiftInterceptRemote(cid).then((r) => {
            if (r.ok && r.replied) void refreshConversationAndMessages(cid);
          });
        }, 500);
      }
      return result;
    },
    [conversation?.expires_at, refreshConversationAndMessages],
  );

  const expiredUi = status === 'expired_ui';

  return {
    status,
    errorHint,
    conversation,
    messages: uiMessages,
    remainingMs,
    expiredUi,
    send,
    refresh: async () => {
      const id = convIdRef.current;
      if (id) await refreshConversationAndMessages(id);
    },
  };
}
