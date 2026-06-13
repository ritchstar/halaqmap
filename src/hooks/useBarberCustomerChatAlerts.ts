import { useCallback, useEffect, useRef } from 'react';
import {
  barberListPrivateMessagesRemote,
  type BarberPrivateConversationRow,
} from '@/lib/barberCustomerPrivateChatRemote';
import {
  readBarberChatAlertPrefs,
  readBarberChatAlertSeenIds,
  writeBarberChatAlertSeenIds,
} from '@/lib/barberDashboardChatAlertPrefs';
import { playBarberChatAlert } from '@/lib/barberDashboardChatAlertSound';
import { isHomeServiceContactChatBody } from '@/lib/homeServiceContactTemplate';
import { isPollingTabActive } from '@/lib/pollingPolicy';

const ALERT_COOLDOWN_MS = 20_000;

export function useBarberCustomerChatAlerts(
  barberId: string,
  barberEmail: string,
  conversations: BarberPrivateConversationRow[],
  selectedConversationId: string | null,
): void {
  const initializedRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const lastMessageAtRef = useRef<Map<string, string | null>>(new Map());
  const lastPlayedRef = useRef<{ message: number; home_visit: number }>({ message: 0, home_visit: 0 });
  const busyRef = useRef(false);

  useEffect(() => {
    initializedRef.current = false;
    lastMessageAtRef.current = new Map();
    seenIdsRef.current = readBarberChatAlertSeenIds(barberId);
    busyRef.current = false;
  }, [barberId]);

  const processConversations = useCallback(async () => {
    if (!barberId.trim() || !barberEmail.trim()) return;
    if (!isPollingTabActive()) return;
    if (busyRef.current) return;

    const prefs = readBarberChatAlertPrefs(barberId);
    busyRef.current = true;

    try {
      if (!initializedRef.current) {
        for (const c of conversations) {
          lastMessageAtRef.current.set(c.id, c.last_message_at);
          const res = await barberListPrivateMessagesRemote({
            barberId,
            email: barberEmail,
            conversationId: c.id,
          });
          if (!res.ok) continue;
          for (const m of res.messages) {
            if (m.sender_id === c.customer_id) seenIdsRef.current.add(m.id);
          }
        }
        initializedRef.current = true;
        writeBarberChatAlertSeenIds(barberId, seenIdsRef.current);
        return;
      }

      if (!prefs.enabled) return;

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

        const inbound = res.messages.filter(
          (m) => m.sender_id === c.customer_id && !seenIdsRef.current.has(m.id),
        );
        if (inbound.length === 0) continue;

        for (const m of inbound) {
          seenIdsRef.current.add(m.id);
        }
        writeBarberChatAlertSeenIds(barberId, seenIdsRef.current);

        if (prefs.muteWhenChatOpen && selectedConversationId === c.id) continue;

        const latest = inbound[inbound.length - 1];
        const kind = isHomeServiceContactChatBody(latest.body) ? 'home_visit' : 'message';
        const now = Date.now();
        if (now - lastPlayedRef.current[kind] < ALERT_COOLDOWN_MS) continue;
        lastPlayedRef.current[kind] = now;
        playBarberChatAlert(kind, prefs);
      }
    } finally {
      busyRef.current = false;
    }
  }, [barberEmail, barberId, conversations, selectedConversationId]);

  useEffect(() => {
    if (conversations.length === 0 && initializedRef.current) return;
    void processConversations();
  }, [conversations, processConversations]);
}
