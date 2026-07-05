import { useCallback, useEffect, useState } from 'react';
import { barberListPrivateConversationsRemote } from '@/lib/barberCustomerPrivateChatRemote';
import { isPollingTabActive, POLL_MS } from '@/lib/pollingPolicy';

export type BarberPrivateChatInboxBadgeState = {
  unreadCount: number;
  hasUnread: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

/**
 * يجمع عدد رسائل العملاء غير المقروءة من شات Supabase الحي — للشارة على تبويب «شات العملاء».
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

  return {
    unreadCount,
    hasUnread: unreadCount > 0,
    loading,
    refresh,
  };
}
