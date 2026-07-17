/** أحداث فورية لشارة الشات/المواعيد في لوحة الحلاق — بدون انتظار دورة الاستطلاع. */

export const BARBER_CHAT_INBOUND_EVENT = 'halaqmap:barber-chat-inbound';
export const BARBER_CHAT_INBOX_SYNC_EVENT = 'halaqmap:barber-chat-inbox-sync';
export const BARBER_APPOINTMENT_PENDING_EVENT = 'halaqmap:barber-appointment-pending';

export type BarberChatInboundDetail = {
  barberId: string;
  conversationId: string;
  messageId: string;
  /** إن كانت المحادثة مفتوحة حالياً — لا نزيد الشارة */
  selectedConversationId?: string | null;
};

export type BarberAppointmentPendingDetail = {
  barberId: string;
  bookingId: string;
  pendingCount?: number;
};

function dispatch(name: string, detail: unknown): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function emitBarberChatInbound(detail: BarberChatInboundDetail): void {
  dispatch(BARBER_CHAT_INBOUND_EVENT, detail);
}

/** طلب مزامنة الشارة من السيرفر (بعد mark_read أو فتح الشات). */
export function emitBarberChatInboxSync(barberId: string): void {
  dispatch(BARBER_CHAT_INBOX_SYNC_EVENT, { barberId });
}

export function emitBarberAppointmentPending(detail: BarberAppointmentPendingDetail): void {
  dispatch(BARBER_APPOINTMENT_PENDING_EVENT, detail);
}
