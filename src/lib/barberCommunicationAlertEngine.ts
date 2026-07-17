/**
 * محرك موحّد لتنبيهات تواصل الحلاق — صوت داخل اللوحة + تتبع الرسائل الم seen.
 */
import {
  readBarberChatAlertPrefs,
  readBarberChatAlertSeenIds,
  writeBarberChatAlertSeenIds,
} from '@/lib/barberDashboardChatAlertPrefs';
import { playBarberChatAlert } from '@/lib/barberDashboardChatAlertSound';
import { emitBarberChatInbound } from '@/lib/barberInboxEvents';
import { isHomeServiceContactChatBody } from '@/lib/homeServiceContactTemplate';
import { isGroomPrepContactChatBody } from '@/lib/groomPrepContactTemplate';
import { isPollingTabActive } from '@/lib/pollingPolicy';

export type BarberInboundChatAlertEvent = {
  messageId: string;
  conversationId: string;
  customerId: string;
  body: string;
  createdAt: string;
};

export type BarberAlertDeliveryMode = 'realtime' | 'polling';

/** تبريد قصير — الأولوية لسرعة التنبيه دون إزعاج متواصل */
const ALERT_COOLDOWN_MS: Record<'message' | 'home_visit' | 'groom_prep' | 'appointment', number> = {
  message: 4_000,
  home_visit: 8_000,
  groom_prep: 8_000,
  appointment: 6_000,
};

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
  const lastPlayed: {
    message: number;
    home_visit: number;
    groom_prep: number;
    appointment: number;
  } = {
    message: 0,
    home_visit: 0,
    groom_prep: 0,
    appointment: 0,
  };

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
      if (seenIds.has(event.messageId)) return;
      seenIds.add(event.messageId);
      writeBarberChatAlertSeenIds(barberId, seenIds);

      // شارة حمراء فوراً — حتى قبل اكتمال التهيئة الصوتية
      emitBarberChatInbound({
        barberId,
        conversationId: event.conversationId,
        messageId: event.messageId,
        selectedConversationId: context.selectedConversationId,
      });

      if (!initialized) return;

      const prefs = readBarberChatAlertPrefs(barberId);
      if (!prefs.enabled) return;
      if (!isPollingTabActive()) return;
      if (prefs.muteWhenChatOpen && context.selectedConversationId === event.conversationId) return;

      const kind = isGroomPrepContactChatBody(event.body)
        ? 'groom_prep'
        : isHomeServiceContactChatBody(event.body)
          ? 'home_visit'
          : 'message';
      const now = Date.now();
      if (now - lastPlayed[kind] < ALERT_COOLDOWN_MS[kind]) return;
      lastPlayed[kind] = now;
      void playBarberChatAlert(kind, prefs);
    },
  };
}
