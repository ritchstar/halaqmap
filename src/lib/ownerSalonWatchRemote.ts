const DEFAULT_ENDPOINT = '/api/owner-salon-watch';

export type OwnerSalonWatchAlert = {
  severity: 'info' | 'watch' | 'urgent';
  titleAr: string;
  bodyAr: string;
  createdAt: string;
};

export type OwnerSalonWatchSnapshot = {
  collectedAt: string;
  salonName: string;
  tier: string;
  shopOpen: boolean;
  profileUpdatedAt: string | null;
  activeConversations: number;
  conversationsStartedToday: number;
  operationalPulse: {
    severity: 'info' | 'watch' | 'urgent';
    frictionScore: number;
    summaryAr: string;
    reportedAt: string;
    listingDaysRemaining: number | null;
    shopOpen: boolean;
    walletLow: boolean;
    stagnant: boolean;
  } | null;
  alerts: OwnerSalonWatchAlert[];
  recentEvents: OwnerSalonWatchAlert[];
};

function endpoint(): string {
  return String(import.meta.env.VITE_OWNER_SALON_WATCH_URL || DEFAULT_ENDPOINT).trim();
}

function readStoredBarberSessionToken(): string {
  try {
    const raw = localStorage.getItem('barberAuth');
    if (!raw) return '';
    const parsed = JSON.parse(raw) as { barberSessionToken?: unknown };
    return String(parsed.barberSessionToken ?? '').trim();
  } catch {
    return '';
  }
}

function baseHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (anonKey) headers['x-supabase-anon'] = anonKey;
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  const token = readStoredBarberSessionToken();
  if (token) headers['x-barber-portal-session'] = token;
  return headers;
}

export async function fetchOwnerSalonWatchRemote(input: {
  barberId: string;
  email: string;
}): Promise<
  | { ok: true; salonRole: 'owner' | 'operator'; snapshot: OwnerSalonWatchSnapshot }
  | { ok: false; error: string; code?: string }
> {
  const barberId = input.barberId.trim();
  const email = input.email.trim();
  if (!barberId || !email) {
    return { ok: false, error: 'بيانات الجلسة ناقصة.' };
  }
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار غرفة المراقبة غير مضبوط.' };

  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({ barberId, email }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      salonRole?: 'owner' | 'operator';
      snapshot?: OwnerSalonWatchSnapshot;
    };
    if (!response.ok) {
      const code = typeof payload.code === 'string' && payload.code.trim() ? payload.code.trim() : undefined;
      return {
        ok: false,
        error: payload.error || `HTTP ${response.status}`,
        ...(code ? { code } : {}),
      };
    }
    if (!payload.snapshot) {
      return { ok: false, error: 'استجابة غير صالحة من الخادم.' };
    }
    return {
      ok: true,
      salonRole: payload.salonRole === 'operator' ? 'operator' : 'owner',
      snapshot: payload.snapshot,
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بخدمة المراقبة.' };
  }
}
