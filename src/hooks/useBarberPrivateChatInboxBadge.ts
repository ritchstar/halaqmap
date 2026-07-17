import { useCallback, useEffect, useState } from 'react';
import { barberListPrivateConversationsRemote } from '@/lib/barberCustomerPrivateChatRemote';
import {
  BARBER_CHAT_INBOUND_EVENT,
  BARBER_CHAT_INBOX_SYNC_EVENT,
  type BarberChatInboundDetail,
} from '@/lib/barberInboxEvents';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';

export type BarberPrivateChatInboxBadgeState = {
  unreadCount: number;
  hasUnread: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

/**
 * شارة «شات العملاء» — استطلاع + زيادة فورية عند حدث وصول رسالة.
 */
export function useBarberPrivateChatInboxBadge(
  barberId: string | undefined,
  barberEmail: string | undefined,
  enabled = true,
): BarberPrivateChatInboxBadgeState {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const id = barberId?.trim();
    const email = barberEmail?.trim();
    if (!enabled || !id || !email) {
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    try {
      const res = await barberListPrivateConversationsRemote({ barberId: id, email });
      if (!res.ok) return;
      const total = res.conversations.reduce(
        (acc, row) => acc + Math.max(0, Number(row.unread_customer_count ?? 0)),
        0,
      );
      setUnreadCount(total);
    } finally {
      setLoading(false);
    }
  }, [barberEmail, barberId, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled || !barberId?.trim() || !barberEmail?.trim()) return;
    const poll = () => {
      if (!isPollingTabActive()) return;
      void refresh();
    };
    const iv = window.setInterval(poll, POLL_MS.PRIVATE_CHAT_LIST);
    return () => window.clearInterval(iv);
  }, [barberEmail, barberId, enabled, refresh]);

  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;
    const id = barberId?.trim();
    if (!id) return;

    const onInbound = (ev: Event) => {
      const detail = (ev as CustomEvent<BarberChatInboundDetail>).detail;
      if (!detail || detail.barberId !== id) return;
      // لا تزد الشارة إن كان الحلاق يقرأ نفس المحادثة
      if (
        detail.selectedConversationId &&
        detail.selectedConversationId === detail.conversationId
      ) {
        return;
      }
      setUnreadCount((n) => Math.min(99, n + 1));
      // مزامنة دقيقة بعد لحظة قصيرة
      window.setTimeout(() => void refresh(), 900);
    };

    const onSync = (ev: Event) => {
      const detail = (ev as CustomEvent<{ barberId?: string }>).detail;
      if (detail?.barberId && detail.barberId !== id) return;
      void refresh();
    };

    window.addEventListener(BARBER_CHAT_INBOUND_EVENT, onInbound);
    window.addEventListener(BARBER_CHAT_INBOX_SYNC_EVENT, onSync);
    return () => {
      window.removeEventListener(BARBER_CHAT_INBOUND_EVENT, onInbound);
      window.removeEventListener(BARBER_CHAT_INBOX_SYNC_EVENT, onSync);
    };
  }, [barberId, enabled, refresh]);

  return {
    unreadCount,
    hasUnread: unreadCount > 0,
    loading,
    refresh,
  };
}
