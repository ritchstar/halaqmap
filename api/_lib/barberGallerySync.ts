import type { SupabaseClient } from '@supabase/supabase-js';

export const FEATURED_GALLERY_IMAGES_MAX = 4;
export const MAX_IMAGES_GOLD = 20;
export const MAX_IMAGES_DIAMOND = 40;

export function maxGalleryImagesForTier(tier: string): number {
  const t = String(tier ?? '').toLowerCase();
  if (t === 'diamond') return MAX_IMAGES_DIAMOND;
  if (t === 'gold') return MAX_IMAGES_GOLD;
  return 0;
}

/** يستخرج مسار الكائن من رابط barber-portfolio العام */
export function objectPathFromPortfolioPublicUrl(publicUrl: string, barberId: string): string | null {
  const u = publicUrl.trim();
  const marker = '/storage/v1/object/public/barber-portfolio/';
  const i = u.indexOf(marker);
  if (i < 0) return null;
  const path = decodeURIComponent(u.slice(i + marker.length).split('?')[0] ?? '');
  const prefix = `${barberId.trim()}/`;
  if (!path.startsWith(prefix)) return null;
  if (path.includes('..') || path.includes('\\')) return null;
  const rest = path.slice(prefix.length);
  if (!rest || rest.includes('/')) return null;
  if (!/^[a-zA-Z0-9._-]+\.webp$/i.test(rest)) return null;
  return path;
}

export function dedupeOrderedUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const u = raw.trim();
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

type BarberAuthRow = {
  id: string;
  email: string;
  tier: string;
  is_active: boolean | null;
};

export async function loadBarberForGalleryWrite(
  supabase: SupabaseClient,
  barberId: string,
  rawEmail: string,
): Promise<
  | { ok: true; barber: BarberAuthRow; maxAllowed: number }
  | { ok: false; status: number; error: string }
> {
  const emailNorm = rawEmail.trim().toLowerCase();
  if (!barberId || !emailNorm) {
    return { ok: false, status: 400, error: 'Missing barberId or email' };
  }

  const { data: row, error: selErr } = await supabase
    .from('barbers')
    .select('id, email, tier, is_active')
    .eq('id', barberId)
    .maybeSingle();

  if (selErr) {
    return { ok: false, status: 500, error: selErr.message || 'Lookup failed' };
  }
  if (!row) {
    return { ok: false, status: 404, error: 'Barber not found' };
  }

  const br = row as BarberAuthRow;
  const rowEmail = String(br.email ?? '').trim().toLowerCase();
  if (!rowEmail || rowEmail !== emailNorm) {
    return { ok: false, status: 403, error: 'Email does not match this barber account' };
  }
  if (br.is_active === false) {
    return { ok: false, status: 403, error: 'Account is not active' };
  }

  const maxAllowed = maxGalleryImagesForTier(String(br.tier ?? ''));
  if (maxAllowed <= 0) {
    return { ok: false, status: 403, error: 'معرض الأعمال متاح للباقة الذهبية والماسية فقط.' };
  }

  return { ok: true, barber: br, maxAllowed };
}

export type GallerySyncResult = {
  galleryCount: number;
  featuredImages: string[];
  publicUrls: string[];
};

export async function syncBarberGalleryItems(
  supabase: SupabaseClient,
  barberId: string,
  orderedPublicUrls: string[],
  maxAllowed: number,
): Promise<{ ok: true; data: GallerySyncResult } | { ok: false; status: number; error: string }> {
  const urls = dedupeOrderedUrls(orderedPublicUrls);
  if (urls.length > maxAllowed) {
    return {
      ok: false,
      status: 409,
      error: `عدد صور المعرض (${urls.length}) يتجاوز حد الباقة (${maxAllowed}).`,
    };
  }

  const rows: { barber_id: string; object_path: string; public_url: string; sort_order: number }[] = [];
  for (let i = 0; i < urls.length; i++) {
    const publicUrl = urls[i]!;
    const objectPath = objectPathFromPortfolioPublicUrl(publicUrl, barberId);
    if (!objectPath) {
      return { ok: false, status: 400, error: 'Invalid portfolio public URL for this barber' };
    }
    rows.push({
      barber_id: barberId,
      object_path: objectPath,
      public_url: publicUrl,
      sort_order: i,
    });
  }

  const keepPaths = rows.map((r) => r.object_path);

  const { data: existing, error: listErr } = await supabase
    .from('barber_gallery_items')
    .select('object_path')
    .eq('barber_id', barberId);

  if (listErr) {
    return { ok: false, status: 500, error: listErr.message || 'List failed' };
  }

  const toDelete = (existing ?? [])
    .map((r) => String((r as { object_path?: string }).object_path ?? ''))
    .filter((p) => p && !keepPaths.includes(p));

  if (toDelete.length > 0) {
    const { error: delErr } = await supabase
      .from('barber_gallery_items')
      .delete()
      .eq('barber_id', barberId)
      .in('object_path', toDelete);
    if (delErr) {
      return { ok: false, status: 500, error: delErr.message || 'Delete failed' };
    }
  }

  if (rows.length > 0) {
    const { error: upsErr } = await supabase.from('barber_gallery_items').upsert(rows, {
      onConflict: 'barber_id,object_path',
    });
    if (upsErr) {
      return { ok: false, status: 500, error: upsErr.message || 'Upsert failed' };
    }
  } else if ((existing ?? []).length > 0) {
    const { error: clearErr } = await supabase.from('barber_gallery_items').delete().eq('barber_id', barberId);
    if (clearErr) {
      return { ok: false, status: 500, error: clearErr.message || 'Clear failed' };
    }
  }

  const { error: snapErr } = await supabase.rpc('refresh_barber_gallery_public_snapshot', {
    p_barber_id: barberId,
  });
  if (snapErr) {
    return { ok: false, status: 500, error: snapErr.message || 'Snapshot refresh failed' };
  }

  const featuredImages = urls.slice(0, FEATURED_GALLERY_IMAGES_MAX);
  return {
    ok: true,
    data: {
      galleryCount: urls.length,
      featuredImages,
      publicUrls: urls,
    },
  };
}

export async function listBarberGalleryPublicUrls(
  supabase: SupabaseClient,
  barberId: string,
): Promise<{ ok: true; urls: string[] } | { ok: false; status: number; error: string }> {
  const { data, error } = await supabase
    .from('barber_gallery_items')
    .select('public_url, sort_order, created_at')
    .eq('barber_id', barberId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return { ok: false, status: 500, error: error.message || 'List failed' };
  }

  const urls = (data ?? [])
    .map((r) => String((r as { public_url?: string }).public_url ?? '').trim())
    .filter(Boolean);

  return { ok: true, urls: dedupeOrderedUrls(urls) };
}

export async function isBarberPubliclyListed(
  supabase: SupabaseClient,
  barberId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('barbers_public_directory')
    .select('id')
    .eq('id', barberId)
    .maybeSingle();
  if (error || !data) return false;
  return true;
}
