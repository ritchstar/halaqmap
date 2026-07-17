import { useCallback, useEffect, useState } from 'react';
import {
  barberListPrivateConversationsRemote,
  type BarberPrivateConversationRow,
  type BarberPrivateMessageRow,
} from '@/lib/barberCustomerPrivateChatRemote';
import { useBarberCommunicationAlerts } from '@/hooks/useBarberCommunicationAlerts';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';

/**
 * خلفية لوحة الحلاق — تنبيه صوتي + شارة فورية حتى خارج تبويب «شات العملاء».
 */
export function BarberPrivateChatInboxWatcher({
  barberId,
  barberEmail,
  activeTab,
  enabled = true,
  onUnreadChange,
}: {
  barberId: string;
  barberEmail: string;
  activeTab: string;
  enabled?: boolean;
  onUnreadChange?: (count: number) => void;
}) {
  const [conversations, setConversations] = useState<BarberPrivateConversationRow[]>([]);

  const pollConversations = useCallback(
    async (force = false) => {
      if (!enabled) return;
      if (!force && !isPollingTabActive()) return;
      const res = await barberListPrivateConversationsRemote({ barberId, email: barberEmail });
      if (!res.ok) return;
      setConversations(res.conversations);
      const total = res.conversations.reduce(
        (acc, row) => acc + Math.max(0, Number(row.unread_customer_count ?? 0)),
        0,
      );
      onUnreadChange?.(total);
    },
    [barberEmail, barberId, enabled, onUnreadChange],
  );

  useEffect(() => {
    if (!enabled) return;
    void pollConversations(true);
    const iv = window.setInterval(() => void pollConversations(), POLL_MS.PRIVATE_CHAT_LIST);
    return () => window.clearInterval(iv);
  }, [enabled, pollConversations]);

  const onRealtimeInbound = useCallback(
    (_message: BarberPrivateMessageRow, _conversationId: string) => {
      // المحرك يطلق حدث الشارة؛ هنا نزامن القائمة فوراً
      void pollConversations(true);
    },
    [pollConversations],
  );

  useBarberCommunicationAlerts(
    barberId,
    barberEmail,
    conversations,
    null,
    onRealtimeInbound,
    () => void pollConversations(true),
    enabled && activeTab !== 'messages',
  );

  return null;
}
