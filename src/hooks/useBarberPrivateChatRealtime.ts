import { useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/integrations/supabase/client';
import { barberChatRealtimeContextRemote } from '@/lib/barberChatPushRemote';
import type {
  BarberPrivateConversationRow,
  BarberPrivateMessageRow,
} from '@/lib/barberCustomerPrivateChatRemote';

export type BarberPrivateChatRealtimeStatus =
  | 'idle'
  | 'loading'
  | 'connected'
  | 'polling_fallback'
  | 'unavailable';

export function useBarberPrivateChatRealtime(input: {
  barberId: string;
  barberEmail: string;
  conversations: BarberPrivateConversationRow[];
  onInboundMessage: (message: BarberPrivateMessageRow, customerId: string) => void;
  onConversationTouched: (conversationId: string, lastMessageAt: string | null) => void;
  onNewConversation: () => void;
}): { status: BarberPrivateChatRealtimeStatus; barberUserId: string | null } {
  const [status, setStatus] = useState<BarberPrivateChatRealtimeStatus>('idle');
  const [barberUserId, setBarberUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const customerByConvRef = useRef<Map<string, string>>(new Map());
  const barberUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    for (const c of input.conversations) {
      customerByConvRef.current.set(c.id, c.customer_id);
    }
  }, [input.conversations]);

  useEffect(() => {
    if (!input.barberId.trim() || !input.barberEmail.trim()) {
      setStatus('unavailable');
      return;
    }
    if (!isSupabaseConfigured()) {
      setStatus('polling_fallback');
      return;
    }

    let cancelled = false;
    const client = getSupabaseClient();
    if (!client) {
      setStatus('polling_fallback');
      return;
    }

    (async () => {
      setStatus('loading');
      const ctx = await barberChatRealtimeContextRemote({
        barberId: input.barberId,
        email: input.barberEmail,
      });
      if (cancelled) return;
      if (!ctx.ok || !ctx.barberUserId) {
        setStatus('polling_fallback');
        return;
      }
      setBarberUserId(ctx.barberUserId);
      barberUserIdRef.current = ctx.barberUserId;

      const { data: sessionData } = await client.auth.getSession();
      const uid = sessionData.session?.user?.id ?? null;
      if (!uid || uid !== ctx.barberUserId) {
        setStatus('polling_fallback');
        return;
      }

      const ch = client
        .channel(`barber_private_chat:${ctx.barberUserId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'private_messages' },
          (payload) => {
            const row = payload.new as BarberPrivateMessageRow | null;
            if (!row?.id || !row.conversation_id) return;
            const barberUid = barberUserIdRef.current;
            if (barberUid && row.sender_id === barberUid) return;

            const customerId =
              customerByConvRef.current.get(row.conversation_id) ?? row.sender_id;
            input.onInboundMessage(row, customerId);
            input.onConversationTouched(row.conversation_id, row.created_at);
          },
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'private_conversations',
            filter: `barber_user_id=eq.${ctx.barberUserId}`,
          },
          (payload) => {
            const row = payload.new as {
              id?: string;
              customer_id?: string;
              last_message_at?: string | null;
            } | null;
            if (!row?.id) return;
            if (row.customer_id) customerByConvRef.current.set(row.id, row.customer_id);
            if (payload.eventType === 'INSERT') input.onNewConversation();
            input.onConversationTouched(row.id, row.last_message_at ?? null);
          },
        )
        .subscribe((state) => {
          if (cancelled) return;
          if (state === 'SUBSCRIBED') setStatus('connected');
          else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT') setStatus('polling_fallback');
        });

      channelRef.current = ch;
    })();

    return () => {
      cancelled = true;
      const ch = channelRef.current;
      channelRef.current = null;
      if (ch) void getSupabaseClient()?.removeChannel(ch);
    };
  }, [
    input.barberId,
    input.barberEmail,
    input.onConversationTouched,
    input.onInboundMessage,
    input.onNewConversation,
  ]);

  return { status, barberUserId };
}
