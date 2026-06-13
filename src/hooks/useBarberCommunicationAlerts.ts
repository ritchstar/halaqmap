import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  barberListPrivateMessagesRemote,
  type BarberPrivateConversationRow,
  type BarberPrivateMessageRow,
} from '@/lib/barberCustomerPrivateChatRemote';
import {
  createBarberCommunicationAlertEngine,
  type BarberCommunicationAlertEngine,
} from '@/lib/barberCommunicationAlertEngine';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';
import { useBarberPrivateChatRealtime } from '@/hooks/useBarberPrivateChatRealtime';

const POLL_FALLBACK_MS = POLL_MS.PRIVATE_CHAT_LIST;

export type BarberCommunicationAlertsState = {
  deliveryMode: 'realtime' | 'polling';
  realtimeStatus: 'idle' | 'loading' | 'connected' | 'polling_fallback' | 'unavailable';
};

export function useBarberCommunicationAlerts(
  barberId: string,
  barberEmail: string,
  conversations: BarberPrivateConversationRow[],
  selectedConversationId: string | null,
  onRealtimeInbound?: (message: BarberPrivateMessageRow, conversationId: string) => void,
  onRefreshConversations?: () => void,
): BarberCommunicationAlertsState {
  const engineRef = useRef<BarberCommunicationAlertEngine | null>(null);
  const lastMessageAtRef = useRef<Map<string, string | null>>(new Map());
  const pollBusyRef = useRef(false);

  if (!engineRef.current) {
    engineRef.current = createBarberCommunicationAlertEngine(barberId);
  }

  useEffect(() => {
    engineRef.current = createBarberCommunicationAlertEngine(barberId);
    lastMessageAtRef.current = new Map();
  }, [barberId]);

  const handleInbound = useCallback(
    (message: BarberPrivateMessageRow, customerId: string) => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.handleInbound(
        {
          messageId: message.id,
          conversationId: message.conversation_id,
          customerId,
          body: message.body,
          createdAt: message.created_at,
        },
        {
          selectedConversationId,
          deliveryMode: 'realtime',
        },
      );
      onRealtimeInbound?.(message, message.conversation_id);
    },
    [onRealtimeInbound, selectedConversationId],
  );

  const onConversationTouched = useCallback((conversationId: string, lastMessageAt: string | null) => {
    lastMessageAtRef.current.set(conversationId, lastMessageAt);
  }, []);

  const onNewConversation = useCallback(() => {
    onRefreshConversations?.();
  }, [onRefreshConversations]);

  const { status: realtimeStatus } = useBarberPrivateChatRealtime({
    barberId,
    barberEmail,
    conversations,
    onInboundMessage: handleInbound,
    onConversationTouched,
    onNewConversation,
  });

  const deliveryMode = realtimeStatus === 'connected' ? 'realtime' : 'polling';

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || engine.isInitialized()) return;
    void engine.bootstrapFromMessages(conversations, async (conversationId) => {
      const res = await barberListPrivateMessagesRemote({
        barberId,
        email: barberEmail,
        conversationId,
      });
      return res.ok ? res.messages : [];
    });
  }, [barberEmail, barberId, conversations]);

  const pollForAlerts = useCallback(async () => {
    if (realtimeStatus === 'connected') return;
    if (!barberId.trim() || !barberEmail.trim()) return;
    if (!isPollingTabActive()) return;
    if (pollBusyRef.current) return;
    const engine = engineRef.current;
    if (!engine?.isInitialized()) return;

    pollBusyRef.current = true;
    try {
      for (const c of conversations) {
        const prevAt = lastMessageAtRef.current.get(c.id);
        if (prevAt === c.last_message_at) continue;
        lastMessageAtRef.current.set(c.id, c.last_message_at);
        if (!c.last_message_at) continue;

        const res = await barberListPrivateMessagesRemote({
          barberId,
          email: barberEmail,
          conversationId: c.id,
        });
        if (!res.ok) continue;

        const inbound = res.messages.filter((m) => m.sender_id === c.customer_id);
        for (const m of inbound) {
          engine.handleInbound(
            {
              messageId: m.id,
              conversationId: c.id,
              customerId: c.customer_id,
              body: m.body,
              createdAt: m.created_at,
            },
            { selectedConversationId, deliveryMode: 'polling' },
          );
        }
      }
    } finally {
      pollBusyRef.current = false;
    }
  }, [barberEmail, barberId, conversations, realtimeStatus, selectedConversationId]);

  useEffect(() => {
    if (realtimeStatus === 'connected') return;
    void pollForAlerts();
  }, [conversations, pollForAlerts, realtimeStatus]);

  useEffect(() => {
    if (realtimeStatus === 'connected') return;
    const id = window.setInterval(() => void pollForAlerts(), POLL_FALLBACK_MS);
    return () => window.clearInterval(id);
  }, [pollForAlerts, realtimeStatus]);

  return useMemo(
    () => ({
      deliveryMode,
      realtimeStatus,
    }),
    [deliveryMode, realtimeStatus],
  );
}
