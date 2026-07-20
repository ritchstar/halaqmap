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
import {
  customerMessageNeedsShiftIntercept,
  SHIFT_INTERCEPT_BURST_DELAYS_MS,
} from '@/lib/digitalShiftInterceptPolicy';
import { POLL_MS } from '@/lib/pollingPolicy';

export type CustomerBarberUiMessage = {
  id: string;
  role: 'customer' | 'barber';
  body: string;
  created_at: string;
  translated?: string | null;
  isDigitalShiftReply?: boolean;
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
      isDigitalShiftReply: Boolean(m.is_digital_shift_reply),
    };
  });
}

function isOptimisticMessageId(id: string): boolean {
  return id.startsWith('temp-');
}

/** دمج نتائج السيرفر مع الرسائل المتفائلة التي لم تُؤكَّد بعد */
function mergeServerMessagesWithOptimistic(
  server: PrivateMessageRow[],
  previous: PrivateMessageRow[],
): PrivateMessageRow[] {
  const optimistic = previous.filter((m) => isOptimisticMessageId(m.id));
  const stillPending = optimistic.filter(
    (o) => !server.some((s) => s.sender_id === o.sender_id && s.body === o.body),
  );
  return [...server, ...stillPending].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
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
  const interceptTimersRef = useRef<number[]>([]);
  const interceptInFlightRef = useRef(false);
  const rawMessagesRef = useRef<PrivateMessageRow[]>([]);
  const conversationRef = useRef<PrivateConversationRow | null>(null);

  useEffect(() => {
    rawMessagesRef.current = rawMessages;
  }, [rawMessages]);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

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
    setRawMessages((prev) => mergeServerMessagesWithOptimistic(msgRes.messages, prev));
    setStatus('ready');
  }, []);

  const needsShiftIntercept = useCallback((): boolean => {
    const conv = conversationRef.current;
    if (!conv) return false;
    return customerMessageNeedsShiftIntercept({
      messages: rawMessagesRef.current,
      customerId: conv.customer_id,
      barberUserId: conv.barber_user_id,
    });
  }, []);

  const runIntercept = useCallback(async (conversationId: string) => {
    if (interceptInFlightRef.current || !needsShiftIntercept()) return;
    interceptInFlightRef.current = true;
    try {
      const r = await customerDigitalShiftInterceptRemote({ conversationId });
      if (r.ok && r.replied) {
        await refreshConversationAndMessages(conversationId);
      }
    } finally {
      interceptInFlightRef.current = false;
    }
  }, [needsShiftIntercept, refreshConversationAndMessages]);

  const scheduleInterceptBurst = useCallback(
    (conversationId: string) => {
      for (const id of interceptTimersRef.current) window.clearTimeout(id);
      interceptTimersRef.current = [];
      for (const delay of SHIFT_INTERCEPT_BURST_DELAYS_MS) {
        const timerId = window.setTimeout(() => {
          void runIntercept(conversationId);
        }, delay);
        interceptTimersRef.current.push(timerId);
      }
    },
    [runIntercept],
  );

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
        setRawMessages((prev) => mergeServerMessagesWithOptimistic(msgRes.messages, prev));
      });
    }, POLL_MS.CUSTOMER_CHAT_MESSAGES);

    return () => window.clearInterval(poll);
  }, [status, conversation?.id]);

  useEffect(() => {
    return () => {
      for (const id of interceptTimersRef.current) window.clearTimeout(id);
      interceptTimersRef.current = [];
    };
  }, []);

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

    for (const m of rawMessages) {
      if (m.sender_id === conversation.customer_id) continue;
      if (translationAttemptedRef.current.has(m.id)) continue;
      if (!guessTranslateTarget(m.body)) continue;

      translationAttemptedRef.current.add(m.id);
      void (async (messageId: string, body: string) => {
        const target = guessTranslateTarget(body);
        if (!target) return;
        const tr = await translateChatLineRemote({ text: body, target, messageId });
        if (tr.ok && tr.text && tr.text !== body) {
          setTranslations((prev) => (prev[messageId] ? prev : { ...prev, [messageId]: tr.text }));
        }
      })(m.id, m.body);
    }
  }, [rawMessages, conversation, options.enableDiamondTranslation]);

  const uiMessages = useMemo(
    () => mapRowsToUi(rawMessages, conversation, translations),
    [rawMessages, conversation, translations],
  );

  useEffect(() => {
    const cid = convIdRef.current;
    if (!cid || status !== 'ready') return;

    const runInterceptPoll = async () => {
      if (!needsShiftIntercept()) return;
      await runIntercept(cid);
    };

    void runInterceptPoll();
    const iv = window.setInterval(() => void runInterceptPoll(), POLL_MS.CUSTOMER_CHAT_INTERCEPT);
    return () => window.clearInterval(iv);
  }, [status, conversation?.id, runIntercept, needsShiftIntercept]);

  const send = useCallback(
    async (body: string) => {
      const cid = convIdRef.current;
      const conv = conversationRef.current;
      if (!cid || !conv) return { ok: false as const, error: 'لا توجد محادثة.' };
      if (remainingMsFromExpiresAt(conv.expires_at ?? '') <= 0) {
        return { ok: false as const, error: 'انتهت الجلسة.' };
      }
      const text = body.trim();
      if (!text) return { ok: false as const, error: 'الرسالة فارغة.' };

      const tempId = `temp-${crypto.randomUUID()}`;
      const optimistic: PrivateMessageRow = {
        id: tempId,
        conversation_id: cid,
        sender_id: conv.customer_id,
        body: text,
        created_at: new Date().toISOString(),
        read_at: null,
      };
      setRawMessages((prev) =>
        [...prev, optimistic].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        ),
      );

      const result = await sendCustomerPrivateMessageServer(cid, text);
      if (result.ok) {
        setRawMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempId);
          if (withoutTemp.some((m) => m.id === result.message.id)) return withoutTemp;
          return [...withoutTemp, result.message].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          );
        });
        scheduleInterceptBurst(cid);
      } else {
        setRawMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
      return result;
    },
    [scheduleInterceptBurst],
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
      if (!id) return;
      await refreshConversationAndMessages(id);
      if (needsShiftIntercept()) await runIntercept(id);
    },
  };
}
