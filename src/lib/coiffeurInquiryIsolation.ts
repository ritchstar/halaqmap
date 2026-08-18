/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * عزل استعلام كوافير ماب عن بحث حلاق ماب للرجال.
 * المصدر الوحيد: مسار كوافير العام. لا يُستدعى دليل الصالونات الرجالي.
 */
import { COIFFEUR_LISTING_SECTOR } from '@/config/coiffeurPartnerSector';

const PUBLIC_COIFFEUR_LISTINGS_API = '/api/public-coiffeur-listings';

export type CoiffeurInquiryListing = {
  id: string;
  name: string;
  sector: typeof COIFFEUR_LISTING_SECTOR;
  phone?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  coverImage?: string | null;
  specialties: string[];
  tier: 'bronze' | 'gold' | 'diamond';
  distanceKm?: number | null;
  openForCustomers?: boolean;
};

export function isCoiffeurWomenListing(row: { listing_sector?: unknown; sector?: unknown }): boolean {
  return row.listing_sector === COIFFEUR_LISTING_SECTOR || row.sector === COIFFEUR_LISTING_SECTOR;
}

function mapListing(raw: Record<string, unknown>): CoiffeurInquiryListing | null {
  if (!isCoiffeurWomenListing(raw)) return null;
  const id = typeof raw.id === 'string' ? raw.id.trim() : '';
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!id || !name) return null;
  const lat = typeof raw.latitude === 'number' ? raw.latitude : Number(raw.latitude);
  const lng = typeof raw.longitude === 'number' ? raw.longitude : Number(raw.longitude);
  const specialties = Array.isArray(raw.specialties)
    ? raw.specialties.filter((c): c is string => typeof c === 'string')
    : [];
  const tier = raw.tier === 'gold' || raw.tier === 'diamond' ? raw.tier : 'bronze';
  const distance =
    typeof raw.distance_km === 'number' && Number.isFinite(raw.distance_km) ? raw.distance_km : null;
  return {
    id,
    name,
    sector: COIFFEUR_LISTING_SECTOR,
    phone: typeof raw.phone === 'string' ? raw.phone : '',
    address: typeof raw.address === 'string' ? raw.address : '',
    latitude: Number.isFinite(lat) ? lat : null,
    longitude: Number.isFinite(lng) ? lng : null,
    coverImage:
      typeof raw.cover_image === 'string'
        ? raw.cover_image
        : typeof raw.profile_image === 'string'
          ? raw.profile_image
          : null,
    specialties,
    tier,
    distanceKm: distance,
    openForCustomers: raw.open_for_customers !== false,
  };
}

export async function fetchCoiffeurInquiryListings(input?: {
  lat?: number;
  lng?: number;
  intent?: string;
  radiusKm?: number;
}): Promise<{
  listings: CoiffeurInquiryListing[];
  isolatedFromMensBarbers: true;
}> {
  const lat = input?.lat;
  const lng = input?.lng;
  if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { listings: [], isolatedFromMensBarbers: true };
  }

  try {
    const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
    const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (anonKey) headers['x-supabase-anon'] = anonKey;
    if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;

    const url = new URL(PUBLIC_COIFFEUR_LISTINGS_API, window.location.origin);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lng', String(lng));
    url.searchParams.set('radius_km', String(input?.radiusKm ?? 25));
    if (input?.intent) url.searchParams.set('intent', input.intent);

    const response = await fetch(url.toString(), { headers });
    const payload = (await response.json().catch(() => ({}))) as { rows?: unknown };
    if (!response.ok || !Array.isArray(payload.rows)) {
      return { listings: [], isolatedFromMensBarbers: true };
    }
    const listings = payload.rows
      .map((row) => (row && typeof row === 'object' ? mapListing(row as Record<string, unknown>) : null))
      .filter((row): row is CoiffeurInquiryListing => Boolean(row));
    return { listings, isolatedFromMensBarbers: true };
  } catch {
    return { listings: [], isolatedFromMensBarbers: true };
  }
}
