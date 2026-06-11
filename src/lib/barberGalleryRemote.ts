const DEFAULT_SYNC_ENDPOINT = '/api/barber-gallery-sync';
const DEFAULT_PUBLIC_GALLERY_ENDPOINT = '/api/public-barber-gallery';

function syncEndpoint(): string {
  return String(import.meta.env.VITE_BARBER_GALLERY_SYNC_URL || DEFAULT_SYNC_ENDPOINT).trim();
}

function publicGalleryEndpoint(): string {
  return String(import.meta.env.VITE_PUBLIC_BARBER_GALLERY_URL || DEFAULT_PUBLIC_GALLERY_ENDPOINT).trim();
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

export type BarberGallerySyncResult = {
  galleryCount: number;
  featuredImages: string[];
  publicUrls: string[];
  maxAllowed: number;
};

export async function syncBarberGalleryRemote(input: {
  barberId: string;
  email: string;
  galleryUrls: string[];
}): Promise<{ ok: true; data: BarberGallerySyncResult } | { ok: false; error: string }> {
  const ep = syncEndpoint();
  if (!ep) return { ok: false, error: 'مسار مزامنة المعرض غير مضبوط.' };
  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        action: 'sync',
        barberId: input.barberId.trim(),
        email: input.email.trim(),
        galleryUrls: input.galleryUrls,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      galleryCount?: unknown;
      featuredImages?: unknown;
      publicUrls?: unknown;
      maxAllowed?: unknown;
    };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    const publicUrls = Array.isArray(payload.publicUrls)
      ? payload.publicUrls.map((u) => String(u ?? '').trim()).filter(Boolean)
      : [];
    const featuredImages = Array.isArray(payload.featuredImages)
      ? payload.featuredImages.map((u) => String(u ?? '').trim()).filter(Boolean)
      : publicUrls.slice(0, 4);
    return {
      ok: true,
      data: {
        galleryCount: Math.max(0, Math.floor(Number(payload.galleryCount) || publicUrls.length)),
        featuredImages,
        publicUrls,
        maxAllowed: Math.max(0, Math.floor(Number(payload.maxAllowed) || 0)),
      },
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function fetchBarberGalleryRemote(input: {
  barberId: string;
  email: string;
}): Promise<{ ok: true; publicUrls: string[]; galleryCount: number } | { ok: false; error: string }> {
  const ep = syncEndpoint();
  if (!ep) return { ok: false, error: 'مسار مزامنة المعرض غير مضبوط.' };
  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({
        action: 'list',
        barberId: input.barberId.trim(),
        email: input.email.trim(),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      publicUrls?: unknown;
      galleryCount?: unknown;
    };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    const publicUrls = Array.isArray(payload.publicUrls)
      ? payload.publicUrls.map((u) => String(u ?? '').trim()).filter(Boolean)
      : [];
    return {
      ok: true,
      publicUrls,
      galleryCount: Math.max(0, Math.floor(Number(payload.galleryCount) || publicUrls.length)),
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

export async function fetchPublicBarberGalleryRemote(
  barberId: string,
): Promise<{ ok: true; publicUrls: string[]; galleryCount: number } | { ok: false; error: string }> {
  const ep = publicGalleryEndpoint();
  if (!ep) return { ok: false, error: 'مسار معرض العميل غير مضبوط.' };
  try {
    const url = new URL(ep, window.location.origin);
    url.searchParams.set('barberId', barberId.trim());
    const headers: Record<string, string> = {};
    const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
    const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
    if (anonKey) headers['x-supabase-anon'] = anonKey;
    if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;

    const response = await fetch(url.toString(), { headers });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      publicUrls?: unknown;
      galleryCount?: unknown;
    };
    if (!response.ok) {
      return { ok: false, error: payload.error || `HTTP ${response.status}` };
    }
    const publicUrls = Array.isArray(payload.publicUrls)
      ? payload.publicUrls.map((u) => String(u ?? '').trim()).filter(Boolean)
      : [];
    return {
      ok: true,
      publicUrls,
      galleryCount: Math.max(0, Math.floor(Number(payload.galleryCount) || publicUrls.length)),
    };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بالخادم.' };
  }
}

/** تجميع روابط معرض الأعمال من بوستات نوع gallery — بترتيب ظهور البوستات */
export function collectGalleryUrlsFromPosts(
  postList: { type: string; images?: string[] }[],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of postList) {
    if (p.type !== 'gallery') continue;
    for (const raw of p.images ?? []) {
      const u = raw.trim();
      if (!u || seen.has(u)) continue;
      seen.add(u);
      out.push(u);
    }
  }
  return out;
}
