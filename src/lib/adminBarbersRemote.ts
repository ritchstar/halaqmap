import { getSupabaseClient } from '@/integrations/supabase/client';
import {
  isBarberUpsertMissingInclusiveCareColumnError,
  stripInclusiveCareKeysFromBarberUpsertRow,
} from '@/lib/barberInclusiveCareUpsertGuard';
import { SubscriptionRequest, SubscriptionTier } from '@/lib/index';
import { resolveChildrenSpecialistFlag } from '@/config/childrenSpecialistPolicy';
import {
  normalizeGroomingCenterBannerLines,
  resolveMensGroomingCenterFlag,
} from '@/config/mensGroomingCenterPolicy';
import { resolveBarberPublicCoverAndFeatured } from '@/lib/barberPublicBannerImages';

const APPROVE_BARBER_API = '/api/approve-barber';

export type AdminBarberRow = {
  id: string;
  /** رقم عضوية ثابت على المنصة (1–999999) — للعرض مع pad 6 أرقام */
  memberNumber: number | null;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  tier: SubscriptionTier;
  is_active: boolean;
  is_verified: boolean;
  profile_image: string | null;
  cover_image: string | null;
  /** ISO من قاعدة البيانات — للعرض في لوحة الإدارة */
  createdAt: string | null;
};

function tierFromDb(t: string | null): SubscriptionTier {
  if (t === 'gold') return SubscriptionTier.GOLD;
  if (t === 'diamond') return SubscriptionTier.DIAMOND;
  return SubscriptionTier.BRONZE;
}

function getClientSupabaseUrl(): string {
  return String(import.meta.env.VITE_SUPABASE_URL || '').trim();
}

export async function listBarbersForAdmin(): Promise<AdminBarberRow[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('barbers')
    .select(
      'id, member_number, name, email, phone, city, address, latitude, longitude, tier, is_active, is_verified, profile_image, cover_image, created_at'
    )
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (import.meta.env.DEV) console.warn('[halaqmap] listBarbersForAdmin:', error?.message);
    return [];
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    memberNumber:
      row.member_number === null || row.member_number === undefined || row.member_number === ''
        ? null
        : Number(row.member_number),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    city: row.city != null ? String(row.city) : null,
    address: row.address != null ? String(row.address) : null,
    latitude:
      row.latitude === null || row.latitude === undefined || row.latitude === ''
        ? null
        : Number(row.latitude),
    longitude:
      row.longitude === null || row.longitude === undefined || row.longitude === ''
        ? null
        : Number(row.longitude),
    tier: tierFromDb(row.tier != null ? String(row.tier) : null),
    is_active: Boolean(row.is_active),
    is_verified: Boolean(row.is_verified),
    profile_image: row.profile_image != null ? String(row.profile_image) : null,
    cover_image: row.cover_image != null ? String(row.cover_image) : null,
    createdAt: row.created_at != null ? String(row.created_at) : null,
  }));
}

/**
 * حذف جميع صفوف الحلاقين (والمرتبطة CASCADE مثل subscriptions، reviews، …).
 * يتطلب صلاحية أدمن كاملة على جدول barbers. للمالك فقط في الواجهة.
 */
export async function purgeAllBarbersRemote(): Promise<
  { ok: true; deleted: number } | { ok: false; error: string; deletedPartial?: number }
> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };

  const { data: rows, error: selErr } = await client.from('barbers').select('id');
  if (selErr) return { ok: false, error: selErr.message };
  const ids = (rows ?? []).map((r: { id: string }) => String(r.id));
  let deleted = 0;
  for (const id of ids) {
    const { error } = await client.from('barbers').delete().eq('id', id);
    if (error) {
      return { ok: false, error: error.message, deletedPartial: deleted };
    }
    deleted += 1;
  }
  return { ok: true, deleted };
}

export async function setBarberActiveRemote(
  barberId: string,
  isActive: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };

  const { error } = await client.from('barbers').update({ is_active: isActive }).eq('id', barberId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteBarberRemote(
  barberId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };

  const { error } = await client.from('barbers').delete().eq('id', barberId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateBarberRecordRemote(
  barberId: string,
  patch: Partial<
    Pick<
      AdminBarberRow,
      | 'name'
      | 'email'
      | 'phone'
      | 'city'
      | 'address'
      | 'latitude'
      | 'longitude'
      | 'tier'
      | 'is_active'
      | 'is_verified'
      | 'profile_image'
      | 'cover_image'
    >
  >
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };

  const payload: Record<string, unknown> = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.email !== undefined) payload.email = patch.email;
  if (patch.phone !== undefined) payload.phone = patch.phone;
  if (patch.city !== undefined) payload.city = patch.city;
  if (patch.address !== undefined) payload.address = patch.address;
  if (patch.latitude !== undefined) payload.latitude = patch.latitude;
  if (patch.longitude !== undefined) payload.longitude = patch.longitude;
  if (patch.tier !== undefined) payload.tier = patch.tier;
  if (patch.is_active !== undefined) payload.is_active = patch.is_active;
  if (patch.is_verified !== undefined) payload.is_verified = patch.is_verified;
  if (patch.profile_image !== undefined) payload.profile_image = patch.profile_image;
  if (patch.cover_image !== undefined) payload.cover_image = patch.cover_image;

  if (Object.keys(payload).length === 0) {
    return { ok: false, error: 'لا توجد حقول للتحديث' };
  }

  const { error } = await client.from('barbers').update(payload).eq('id', barberId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function findDuplicateBarbersByContact(
  email: string,
  phone: string
): Promise<AdminBarberRow[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const emailTrim = email.trim();
  const phoneTrim = phone.trim();
  if (!emailTrim && !phoneTrim) return [];

  let query = client
    .from('barbers')
    .select(
      'id, member_number, name, email, phone, city, address, latitude, longitude, tier, is_active, is_verified, profile_image, cover_image, created_at'
    );
  if (emailTrim && phoneTrim) {
    query = query.or(`email.eq.${emailTrim},phone.eq.${phoneTrim}`);
  } else if (emailTrim) {
    query = query.eq('email', emailTrim);
  } else {
    query = query.eq('phone', phoneTrim);
  }
  const { data, error } = await query.limit(20);
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    memberNumber:
      row.member_number === null || row.member_number === undefined || row.member_number === ''
        ? null
        : Number(row.member_number),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    city: row.city != null ? String(row.city) : null,
    address: row.address != null ? String(row.address) : null,
    latitude:
      row.latitude === null || row.latitude === undefined || row.latitude === ''
        ? null
        : Number(row.latitude),
    longitude:
      row.longitude === null || row.longitude === undefined || row.longitude === ''
        ? null
        : Number(row.longitude),
    tier: tierFromDb(row.tier != null ? String(row.tier) : null),
    is_active: Boolean(row.is_active),
    is_verified: Boolean(row.is_verified),
    profile_image: row.profile_image != null ? String(row.profile_image) : null,
    cover_image: row.cover_image != null ? String(row.cover_image) : null,
    createdAt: row.created_at != null ? String(row.created_at) : null,
  }));
}

export async function upsertBarberFromApprovedRequest(
  request: SubscriptionRequest
): Promise<
  | { ok: true; barberId: string; memberNumber: number | null; warning?: string; shopOpenQuickHashLink?: string }
  | { ok: false; error: string }
> {
  const publicImages = resolveBarberPublicCoverAndFeatured({
    bannerUrls: request.registrationAttachmentUrls?.banners ?? [],
    shopExterior: request.registrationAttachmentUrls?.shopExterior,
    shopInterior: request.registrationAttachmentUrls?.shopInterior,
    shopImages: request.shopImages ?? [],
  });

  const row = {
    name: request.barberName.trim() || 'صالون بدون اسم',
    email: request.email.trim(),
    phone: request.phone.trim(),
    latitude: Number.isFinite(request.location?.lat) ? request.location.lat : null,
    longitude: Number.isFinite(request.location?.lng) ? request.location.lng : null,
    address: request.location?.address?.trim() || 'غير محدد',
    city: request.location?.address?.trim() || null,
    tier: request.tier,
    is_active: true,
    is_verified: true,
    cover_image: publicImages.cover_image,
    profile_image: publicImages.profile_image,
    ...(publicImages.featured_images.length
      ? { featured_images: publicImages.featured_images }
      : {}),
    specialties: request.categories?.length ? request.categories : null,
    inclusive_care_offered: request.inclusiveAccessibleCare?.offered === true,
    inclusive_care_price_sar:
      request.inclusiveAccessibleCare?.offered === true &&
      request.inclusiveAccessibleCare.displayedPriceSar != null &&
      Number.isFinite(request.inclusiveAccessibleCare.displayedPriceSar) &&
      request.inclusiveAccessibleCare.displayedPriceSar > 0
        ? request.inclusiveAccessibleCare.displayedPriceSar
        : null,
    inclusive_care_public_visible: true,
    inclusive_care_restrict_days: false,
    inclusive_care_days: {},
    inclusive_care_customer_note: null,
    children_specialist: resolveChildrenSpecialistFlag({
      requested: request.childrenSpecialist === true,
      acceptsChildren:
        request.categories?.some((c) => c === 'حلاقة أطفال' || c === 'أطفال') ?? false,
      tier: request.tier,
    }),
    ...(() => {
      const categories = request.categories ?? [];
      const bannerLines = normalizeGroomingCenterBannerLines(request.groomingCenterBannerLines);
      const mensGroomingRequested =
        request.mensGroomingCenter === true && request.digitalShiftAddonSelected === true;
      const hasMensHaircut =
        categories.some((c) => c === 'حلاقة رجالي' || c.includes('حلاقة رجال')) ||
        bannerLines.some((line) => line === 'حلاقة رجالي' || line.includes('حلاقة رجال'));
      const mensGroomingCenter = resolveMensGroomingCenterFlag({
        requested: mensGroomingRequested,
        tier: request.tier,
        hasMensHaircutInSpecialties: hasMensHaircut,
        digitalShiftAddon: request.digitalShiftAddonSelected === true,
      });
      return {
        mens_grooming_center: mensGroomingCenter,
        grooming_center_banner_lines: mensGroomingCenter ? bannerLines : [],
      };
    })(),
  };

  const endpoint = String(import.meta.env.VITE_APPROVE_BARBER_URL || APPROVE_BARBER_API).trim();
  const client = getSupabaseClient();
  const accessToken = (await client?.auth.getSession())?.data.session?.access_token?.trim() || '';

  if (accessToken && client) {
    try {
      const postRow = async (payload: Record<string, unknown>) => {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            'x-client-supabase-url': getClientSupabaseUrl(),
          },
          body: JSON.stringify({
            row: payload,
            legalDisclaimerAccepted: request.legalDisclaimerAccepted === true,
            legalDisclaimerAcceptedAtIso:
              typeof request.legalDisclaimerAcceptedAtIso === 'string'
                ? request.legalDisclaimerAcceptedAtIso.trim()
                : undefined,
          }),
        });
        const json = (await resp.json().catch(() => ({}))) as {
          barberId?: string;
          memberNumber?: number | null;
          error?: string;
          warning?: string;
          shopOpenQuickHashLink?: string;
        };
        return { resp, json };
      };

      let { resp, json } = await postRow(row as Record<string, unknown>);
      if (
        !resp.ok &&
        json.error &&
        isBarberUpsertMissingInclusiveCareColumnError(String(json.error))
      ) {
        ({ resp, json } = await postRow(stripInclusiveCareKeysFromBarberUpsertRow(row as Record<string, unknown>)));
      }
      if (resp.ok && json.barberId) {
        const mn = json.memberNumber;
        const memberNumber =
          mn != null && Number.isFinite(Number(mn)) ? Math.floor(Number(mn)) : null;
        const warning = typeof json.warning === 'string' && json.warning.trim() ? json.warning.trim() : undefined;
        const shopOpenQuickHashLink =
          typeof json.shopOpenQuickHashLink === 'string' && json.shopOpenQuickHashLink.trim()
            ? json.shopOpenQuickHashLink.trim()
            : undefined;
        return {
          ok: true,
          barberId: json.barberId,
          memberNumber,
          ...(warning ? { warning } : {}),
          ...(shopOpenQuickHashLink ? { shopOpenQuickHashLink } : {}),
        };
      }
      // إن لم يكن مسار السيرفر متاحاً بعد، نرجع fallback.
      if (resp.status !== 404 && resp.status !== 405 && resp.status !== 503) {
        return { ok: false, error: json.error || `HTTP ${resp.status}` };
      }
    } catch {
      // fallback below
    }
  }

  // Fallback (محلي/تطوير أو بدون جلسة): يعتمد على صلاحيات RLS للمستخدم.
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };
  let upsertBody: Record<string, unknown> = row as Record<string, unknown>;
  let { data, error } = await client
    .from('barbers')
    .upsert(upsertBody, { onConflict: 'email' })
    .select('id, member_number')
    .single();
  if (error && isBarberUpsertMissingInclusiveCareColumnError(error.message)) {
    upsertBody = stripInclusiveCareKeysFromBarberUpsertRow(row as Record<string, unknown>);
    const second = await client
      .from('barbers')
      .upsert(upsertBody, { onConflict: 'email' })
      .select('id, member_number')
      .single();
    data = second.data;
    error = second.error;
  }
  if (error || !data) return { ok: false, error: error?.message ?? 'فشل upsert للحلاق' };
  const d = data as { id: string; member_number?: number | null };
  const memberNumber =
    d.member_number != null && Number.isFinite(Number(d.member_number))
      ? Math.floor(Number(d.member_number))
      : null;
  const usedStrip =
    Object.keys(upsertBody).length < Object.keys(row as Record<string, unknown>).length;
  return {
    ok: true,
    barberId: String(d.id),
    memberNumber,
    ...(usedStrip
      ? {
          warning:
            'تم حفظ الحلاق دون حقول «رعاية شاملة» لأن الأعمدة غير موجودة في المشروع. نفّذ ترحيل 32 أو 38 في Supabase.',
        }
      : {}),
  };
}
