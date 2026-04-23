import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import {
  getPrivateConversation,
  listPrivateMessages,
  sendPrivateMessage,
  startPrivateConversationByBarberId,
  type PrivateConversationRow,
  type PrivateMessageRow,
} from '@/lib/privateChatRemote';
import { guessTranslateTarget, translateChatLineRemote } from '@/lib/diamondChatTranslateRemote';

export type CustomerBarberUiMessage = {
  id: string;
  role: 'customer' | 'barber';
  body: string;
  created_at: string;
  /** ترجمة عرضية للباقة الماسية (نص الطرف الآخر) */
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
  translations: Record<string, string>
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
  options: { enableDiamondTranslation: boolean; restartSignal?: number }
) {
  const restartSignal = options.restartSignal ?? 0;
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'ready' | 'no_supabase' | 'auth_failed' | 'start_failed' | 'expired_ui'
  >('idle');
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [conversation, setConversation] = useState<PrivateConversationRow | null>(null);
  const [rawMessages, setRawMessages] = useState<PrivateMessageRow[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [remainingMs, setRemainingMs] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const convIdRef = useRef<string | null>(null);
  const translationAttemptedRef = useRef(new Set<string>());

  const refreshConversationAndMessages = useCallback(async (conversationId: string) => {
    const convRes = await getPrivateConversation(conversationId);
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
    const msgRes = await listPrivateMessages(conversationId);
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
    const client = getSupabaseClient();
    if (!client) {
      setStatus('no_supabase');
      return;
    }

    (async () => {
      setStatus('loading');
      setErrorHint(null);

      let { data: sessionData } = await client.auth.getSession();
      let session = sessionData.session;
      if (!session) {
        const { error: anonErr } = await client.auth.signInAnonymously();
        if (anonErr || cancelled) {
          setStatus('auth_failed');
          setErrorHint(
            anonErr?.message ||
              'تعذّر إنشاء جلسة عميل مؤقتة. فعّل «Anonymous sign-ins» في مشروع Supabase أو وفّر تسجيل دخول للعملاء.'
          );
          return;
        }
        session = (await client.auth.getSession()).data.session;
      }

      if (!session || cancelled) {
        setStatus('auth_failed');
        setErrorHint('لا توجد جلسة مصادقة للعميل.');
        return;
      }

      const started = await startPrivateConversationByBarberId(barberId);
      if (!started.ok || cancelled) {
        setStatus('start_failed');
        setErrorHint(started.ok ? null : started.error);
        return;
      }

      const conversationId = started.conversationId;
      convIdRef.current = conversationId;

      await refreshConversationAndMessages(conversationId);
      if (cancelled) return;

      const ch = client
        .channel(`private_chat:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'private_messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const row = payload.new as PrivateMessageRow | null;
            if (!row?.id) return;
            setRawMessages((prev) => {
              if (prev.some((m) => m.id === row.id)) return prev;
              return [...prev, row].sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'private_conversations',
            filter: `id=eq.${conversationId}`,
          },
          (payload) => {
            const row = payload.new as Partial<PrivateConversationRow> | null;
            if (!row) return;
            if (row.status && row.status !== 'active') {
              setStatus('expired_ui');
              setRawMessages([]);
              setRemainingMs(0);
            }
            if (row.expires_at) {
              setConversation((c) => {
                if (!c) return c;
                return { ...c, ...row } as PrivateConversationRow;
              });
            }
          }
        )
        .subscribe();

      channelRef.current = ch;
    })();

    return () => {
      cancelled = true;
      translationAttemptedRef.current.clear();
      const ch = channelRef.current;
      channelRef.current = null;
      convIdRef.current = null;
      if (ch) void getSupabaseClient()?.removeChannel(ch);
    };
  }, [barberId, restartSignal, refreshConversationAndMessages]);

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

  /** ترجمة الباقة الماسية: جلب ترجمات للرسائل من الطرف الآخر */
  useEffect(() => {
    if (!options.enableDiamondTranslation || !conversation) return;
    const client = getSupabaseClient();
    if (!client) return;

    let cancelled = false;
    (async () => {
      const { data: s } = await client.auth.getSession();
      const uid = s.session?.user?.id;
      if (!uid) return;

      const updates: Record<string, string> = {};
      for (const m of rawMessages) {
        if (m.sender_id === uid) continue;
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
    [rawMessages, conversation, translations]
  );

  const send = useCallback(
    async (body: string) => {
      const client = getSupabaseClient();
      const cid = convIdRef.current;
      if (!client || !cid) return { ok: false as const, error: 'لا توجد محادثة.' };
      const { data: s } = await client.auth.getSession();
      const uid = s.session?.user?.id;
      if (!uid) return { ok: false as const, error: 'انتهت جلسة المصادقة.' };
      if (remainingMsFromExpiresAt(conversation?.expires_at ?? '') <= 0) {
        return { ok: false as const, error: 'انتهت الجلسة.' };
      }
      return sendPrivateMessage(cid, uid, body);
    },
    [conversation?.expires_at]
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
