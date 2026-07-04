const DEFAULT_PUSH_ENDPOINT = '/api/barber-chat-push';
const DEFAULT_CHAT_ENDPOINT = '/api/barber-customer-private-chat';

function pushEndpoint(): string {
  return String(import.meta.env.VITE_BARBER_CHAT_PUSH_URL || DEFAULT_PUSH_ENDPOINT).trim();
}

function chatEndpoint(): string {
  return String(import.meta.env.VITE_BARBER_CUSTOMER_PRIVATE_CHAT_URL || DEFAULT_CHAT_ENDPOINT).trim();
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  try {
    const raw = localStorage.getItem('barberAuth');
    if (raw) {
      const parsed = JSON.parse(raw) as { barberSessionToken?: unknown };
      const token = String(parsed.barberSessionToken ?? '').trim();
      if (token) headers['x-barber-portal-session'] = token;
    }
  } catch {
    /* ignore */
  }
  return headers;
}

export async function fetchBarberChatPushConfig(): Promise<
  | { ok: true; pushConfigured: boolean; vapidPublicKey: string | null }
  | { ok: false; error: string }
> {
  const ep = pushEndpoint();
  if (!ep) return { ok: false, error: 'مسار إشعارات الدفع غير مضبوط.' };
  try {
    const res = await fetch(ep, { method: 'GET', headers: baseHeaders() });
    const json = (await res.json().catch(() => ({}))) as {
      pushConfigured?: boolean;
      vapidPublicKey?: string | null;
      error?: string;
    };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return {
      ok: true,
      pushConfigured: Boolean(json.pushConfigured),
      vapidPublicKey: json.vapidPublicKey ?? null,
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بخادم الإشعارات.' };
  }
}

export async function barberChatPushSubscribeRemote(input: {
  barberId: string;
  email: string;
  subscription: PushSubscriptionJSON;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ep = pushEndpoint();
  if (!ep) return { ok: false, error: 'مسار إشعارات الدفع غير مضبوط.' };
  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        action: 'subscribe',
        barberId: input.barberId.trim(),
        email: input.email.trim(),
        subscription: input.subscription,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذر حفظ تفعيل الإشعار.' };
  }
}

export async function barberChatPushUnsubscribeRemote(input: {
  barberId: string;
  email: string;
  endpoint: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const ep = pushEndpoint();
  if (!ep) return { ok: false, error: 'مسار إشعارات الدفع غير مضبوط.' };
  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        action: 'unsubscribe',
        barberId: input.barberId.trim(),
        email: input.email.trim(),
        endpoint: input.endpoint.trim(),
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'تعذر إلغاء تفعيل الإشعار.' };
  }
}

export async function barberChatRealtimeContextRemote(input: {
  barberId: string;
  email: string;
}): Promise<
  | { ok: true; barberUserId: string | null; supabaseSessionMatches: boolean }
  | { ok: false; error: string }
> {
  const ep = chatEndpoint();
  if (!ep) return { ok: false, error: 'مسار الشات غير مضبوط.' };
  try {
    const res = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        action: 'realtime_context',
        barberId: input.barberId.trim(),
        email: input.email.trim(),
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      barberUserId?: string | null;
      supabaseSessionMatches?: boolean;
      error?: string;
    };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return {
      ok: true,
      barberUserId: json.barberUserId ?? null,
      supabaseSessionMatches: Boolean(json.supabaseSessionMatches),
    };
  } catch {
    return { ok: false, error: 'تعذر جلب سياق الشات الحي.' };
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

export async function ensureBarberPushSubscription(input: {
  barberId: string;
  email: string;
  vapidPublicKey: string;
}): Promise<{ ok: true; endpoint: string } | { ok: false; error: string }> {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, error: 'المتصفح لا يدعم إشعارات الدفع.' };
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { ok: false, error: 'لم يُمنح إذن الإشعارات.' };
  }
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(input.vapidPublicKey),
    });
  }
  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return { ok: false, error: 'تفعيل الإشعار غير صالح.' };
  }
  const saved = await barberChatPushSubscribeRemote({
    barberId: input.barberId,
    email: input.email,
    subscription: json,
  });
  if (!saved.ok) return { ok: false, error: saved.error };
  return { ok: true, endpoint: json.endpoint };
}

export async function removeBarberPushSubscription(input: {
  barberId: string;
  email: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!('serviceWorker' in navigator)) return { ok: true };
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return { ok: true };
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    return barberChatPushUnsubscribeRemote({ ...input, endpoint });
  } catch {
    return { ok: false, error: 'تعذر إلغاء تفعيل الإشعار.' };
  }
}
