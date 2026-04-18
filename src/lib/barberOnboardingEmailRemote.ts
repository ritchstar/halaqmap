import { SubscriptionTier } from '@/lib';

const ONBOARDING_EMAIL_API = '/api/send-barber-onboarding';

/** نفس أصل Vercel المستخدم لرفع المرفقات وحفظ الطلب — يوجّه POST البريد عندما تكون لوحة الإدارة على استضافة ثابتة. */
function splitDeployApiOrigin(): string {
  return String(import.meta.env.VITE_REGISTRATION_API_ORIGIN || '').trim().replace(/\/$/, '');
}

function getEndpoint(): string {
  const explicit = String(import.meta.env.VITE_BARBER_ONBOARDING_EMAIL_URL || '').trim();
  if (explicit) return explicit;
  const origin = splitDeployApiOrigin();
  if (!origin) return ONBOARDING_EMAIL_API;
  return `${origin}${ONBOARDING_EMAIL_API}`;
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  return headers;
}

export async function sendBarberOnboardingEmailRemote(input: {
  barberName: string;
  barberEmail: string;
  tier?: SubscriptionTier | string | null;
  /** بعد الاعتماد — يُفضّل لإرفاق QR التقييم دون جلب إضافي من السيرفر */
  barberId?: string | null;
  ratingInviteToken?: string | null;
  /** مطابق لـ `id` في `registration_submissions` — نفس رقم الطلب الذي رآه العميل عند التقديم */
  registrationOrderId?: string | null;
}): Promise<{ ok: true; messageId?: string } | { ok: false; error: string }> {
  const endpoint = getEndpoint();
  if (!endpoint) return { ok: false, error: 'لم يتم ضبط مسار API للإرسال البريدي.' };

  try {
    const body: Record<string, unknown> = {
      mode: 'single',
      barberName: input.barberName,
      barberEmail: input.barberEmail,
      tier: input.tier ?? null,
    };
    const bid = String(input.barberId ?? '').trim();
    if (bid) body.barberId = bid;
    const tok = String(input.ratingInviteToken ?? '').trim();
    if (tok) body.ratingInviteToken = tok;
    const ord = String(input.registrationOrderId ?? '').trim();
    if (ord) body.registrationOrderId = ord;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; messageId?: string };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    const mid = typeof payload.messageId === 'string' && payload.messageId.trim() ? payload.messageId.trim() : undefined;
    return { ok: true, ...(mid ? { messageId: mid } : {}) };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بخدمة الإرسال البريدي.' };
  }
}

export type BulkOnboardingEmailResult =
  | { ok: false; error: string }
  | {
      ok: true;
      attempted: number;
      uniqueRecipients: number;
      sent: number;
      failed: number;
      skippedInvalid: number;
      skippedDuplicate: number;
      failedDetails?: Array<{ email: string; error: string }>;
      invalidSamples?: string[];
    };

export async function sendOnboardingEmailsForActiveBarbersRemote(
  limit = 200
): Promise<BulkOnboardingEmailResult> {
  const endpoint = getEndpoint();
  if (!endpoint) return { ok: false, error: 'لم يتم ضبط مسار API للإرسال البريدي.' };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        mode: 'bulk_active',
        limit,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      attempted?: number;
      uniqueRecipients?: number;
      sent?: number;
      failed?: number;
      skippedInvalid?: number;
      skippedDuplicate?: number;
      failedDetails?: Array<{ email: string; error: string }>;
      invalidSamples?: string[];
      error?: string;
    };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    return {
      ok: true,
      attempted: Number(payload.attempted) || 0,
      uniqueRecipients: Number(payload.uniqueRecipients) || 0,
      sent: Number(payload.sent) || 0,
      failed: Number(payload.failed) || 0,
      skippedInvalid: Number(payload.skippedInvalid) || 0,
      skippedDuplicate: Number(payload.skippedDuplicate) || 0,
      failedDetails: payload.failedDetails,
      invalidSamples: payload.invalidSamples,
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بخدمة الإرسال البريدي.' };
  }
}
