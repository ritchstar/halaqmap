type ShiftInterceptMessage = {
  sender_id: string;
  created_at: string;
  is_digital_shift_reply?: boolean;
};

/** هل آخر رسالة من العميل بلا رد بشري أو مناوب بعدها؟ */
export function customerMessageNeedsShiftIntercept(input: {
  messages: ShiftInterceptMessage[];
  customerId: string;
  barberUserId: string;
}): boolean {
  const customerId = input.customerId.trim();
  const barberUserId = input.barberUserId.trim();
  if (!customerId || !barberUserId || input.messages.length === 0) return false;

  let lastCustomerAt: string | null = null;
  let lastBarberHumanAt: string | null = null;
  let lastShiftAt: string | null = null;

  for (const m of input.messages) {
    if (m.sender_id === customerId) {
      lastCustomerAt = m.created_at;
    } else if (m.sender_id === barberUserId) {
      if (m.is_digital_shift_reply) lastShiftAt = m.created_at;
      else lastBarberHumanAt = m.created_at;
    }
  }

  if (!lastCustomerAt) return false;
  const customerMs = new Date(lastCustomerAt).getTime();
  if (!Number.isFinite(customerMs)) return false;
  if (lastBarberHumanAt) {
    const barberMs = new Date(lastBarberHumanAt).getTime();
    if (Number.isFinite(barberMs) && barberMs > customerMs) return false;
  }
  if (lastShiftAt) {
    const shiftMs = new Date(lastShiftAt).getTime();
    if (Number.isFinite(shiftMs) && shiftMs > customerMs) return false;
  }
  return true;
}

/** محاولات احتياطية بعد إرسال العميل — تغطي مهلة المناوب حتى 3 دقائق. */
export const SHIFT_INTERCEPT_BURST_DELAYS_MS = [
  800, 3_500, 8_000, 15_000, 25_000, 40_000, 60_000, 90_000, 120_000, 180_000,
] as const;
