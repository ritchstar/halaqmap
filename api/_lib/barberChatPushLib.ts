import webpush from 'web-push';

export type BarberChatPushPayload = {
  title: string;
  body: string;
  tag: string;
  url: string;
  kind: 'message' | 'home_visit';
};

function readVapidPublicKey(): string {
  return (
    process.env.VITE_VAPID_PUBLIC_KEY ||
    process.env.VAPID_PUBLIC_KEY ||
    ''
  ).trim();
}

function readVapidPrivateKey(): string {
  return (process.env.VAPID_PRIVATE_KEY || '').trim();
}

function readVapidSubject(): string {
  const raw = (process.env.VAPID_SUBJECT || process.env.VITE_SITE_ORIGIN || 'https://halaqmap.com').trim();
  if (raw.startsWith('mailto:') || raw.startsWith('https://')) return raw;
  return `mailto:support@${raw.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'halaqmap.com'}`;
}

let vapidConfigured = false;

export function isBarberChatPushConfigured(): boolean {
  return Boolean(readVapidPublicKey() && readVapidPrivateKey());
}

export function getBarberChatPushVapidPublicKey(): string | null {
  const key = readVapidPublicKey();
  return key || null;
}

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;
  const publicKey = readVapidPublicKey();
  const privateKey = readVapidPrivateKey();
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(readVapidSubject(), publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth_key: string;
};

export async function sendBarberChatPushToSubscription(
  row: PushSubscriptionRow,
  payload: BarberChatPushPayload,
): Promise<{ ok: true } | { ok: false; gone: boolean; error: string }> {
  if (!ensureVapidConfigured()) {
    return { ok: false, gone: false, error: 'VAPID not configured' };
  }
  try {
    await webpush.sendNotification(
      {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth_key },
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 4, urgency: 'high' },
    );
    return { ok: true };
  } catch (err: unknown) {
    const status = typeof err === 'object' && err && 'statusCode' in err ? Number((err as { statusCode?: number }).statusCode) : 0;
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, gone: status === 404 || status === 410, error: message };
  }
}

export function buildBarberChatPushPayload(input: {
  body: string;
  conversationId: string;
  kind: 'message' | 'home_visit';
}): BarberChatPushPayload {
  const site = (process.env.VITE_SITE_ORIGIN || process.env.APP_PUBLIC_ORIGIN || 'https://halaqmap.com').replace(/\/$/, '');
  const isHome = input.kind === 'home_visit';
  const preview = input.body.replace(/\s+/g, ' ').trim().slice(0, 120);
  return {
    kind: input.kind,
    title: isHome ? 'طلب زيارة منزلية — حلاق ماب' : 'رسالة عميل جديدة — حلاق ماب',
    body: preview || (isHome ? 'طلب تواصل جديد من عميل' : 'رسالة جديدة في المحادثة الخاصة'),
    tag: `barber-chat-${input.conversationId}`,
    url: `${site}/#/barber/dashboard?tab=messages&conv=${encodeURIComponent(input.conversationId)}`,
  };
}

export function verifyBarberChatPushWebhookSecret(request: Request): boolean {
  const expected = (
    process.env.BARBER_CHAT_PUSH_WEBHOOK_SECRET ||
    process.env.ONBOARDING_INTERNAL_WEBHOOK_SECRET ||
    ''
  ).trim();
  if (!expected) return false;
  const got = request.headers.get('x-barber-chat-push-secret')?.trim() || '';
  return got.length > 0 && got === expected;
}
