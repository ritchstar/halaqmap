/**
 * محرك موحّد لتنبيهات تواصل الحلاق — صوت داخل اللوحة + تتبع الرسائل الم seen.
 */
import {
  readBarberChatAlertPrefs,
  readBarberChatAlertSeenIds,
  writeBarberChatAlertSeenIds,
} from '@/lib/barberDashboardChatAlertPrefs';
import { playBarberChatAlert } from '@/lib/barberDashboardChatAlertSound';
import { isHomeServiceContactChatBody } from '@/lib/homeServiceContactTemplate';
import { isPollingTabActive } from '@/lib/pollingPolicy';

export type BarberInboundChatAlertEvent = {
  messageId: string;
  conversationId: string;
  customerId: string;
  body: string;
  createdAt: string;
};

export type BarberAlertDeliveryMode = 'realtime' | 'polling';

const ALERT_COOLDOWN_MS = 20_000;

export type BarberCommunicationAlertEngine = {
  bootstrapFromMessages: (
    conversations: Array<{ id: string; customer_id: string }>,
    fetchMessages: (conversationId: string) => Promise<Array<{ id: string; sender_id: string }>>,
  ) => Promise<void>;
  handleInbound: (
    event: BarberInboundChatAlertEvent,
    context: {
      selectedConversationId: string | null;
      deliveryMode: BarberAlertDeliveryMode;
    },
  ) => void;
  isInitialized: () => boolean;
};

export function createBarberCommunicationAlertEngine(barberId: string): BarberCommunicationAlertEngine {
  let initialized = false;
  const seenIds = new Set(readBarberChatAlertSeenIds(barberId));
  const lastPlayed: { message: number; home_visit: number } = { message: 0, home_visit: 0 };

  return {
    isInitialized: () => initialized,

    async bootstrapFromMessages(conversations, fetchMessages) {
      for (const c of conversations) {
        const msgs = await fetchMessages(c.id);
        for (const m of msgs) {
          if (m.sender_id === c.customer_id) seenIds.add(m.id);
        }
      }
      writeBarberChatAlertSeenIds(barberId, seenIds);
      initialized = true;
    },

    handleInbound(event, context) {
      if (!initialized) return;
      if (seenIds.has(event.messageId)) return;
      seenIds.add(event.messageId);
      writeBarberChatAlertSeenIds(barberId, seenIds);

      const prefs = readBarberChatAlertPrefs(barberId);
      if (!prefs.enabled) return;
      if (!isPollingTabActive()) return;
      if (prefs.muteWhenChatOpen && context.selectedConversationId === event.conversationId) return;

      const kind = isHomeServiceContactChatBody(event.body) ? 'home_visit' : 'message';
      const now = Date.now();
      if (now - lastPlayed[kind] < ALERT_COOLDOWN_MS) return;
      lastPlayed[kind] = now;
      playBarberChatAlert(kind, prefs);
    },
  };
}
