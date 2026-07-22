import type { SupabaseClient } from '@supabase/supabase-js';
import { whitelistBarberUpsertRow } from './approveBarberUpsertWhitelist.js';
import {
  isBarberUpsertMissingInclusiveCareColumnError,
  stripInclusiveCareKeysFromBarberUpsertRow,
} from './barberInclusiveCareUpsertRetry.js';
import { resolveChildrenSpecialistFlag } from './childrenSpecialistPolicy.js';
import {
  normalizeGroomingCenterBannerLines,
  resolveMensGroomingCenterFlag,
} from './mensGroomingCenterPolicy.js';
import {
  readRegistrationBannerUrls,
  resolveBarberPublicCoverAndFeatured,
} from './barberPublicBannerImages.js';
import { buildBarberMagicEnterUrl } from './barberPortalMagicUrl.js';
import { resolveResendFromAddress, readResendFromEmailEnv } from './resendFrom.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** يفرض www.halaqmap.com في روابط البريد والـ magic حتى لا يضيع #/barber/enter عند تحويل النطاق. */
export function canonicalSiteOrigin(raw: string): string {
  const trimmed = String(raw || '').trim().replace(/\/+$/, '');
  if (!trimmed) return 'https://www.halaqmap.com';
  try {
    const u = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (u.hostname === 'halaqmap.com') u.hostname = 'www.halaqmap.com';
    return u.origin;
  } catch {
    return trimmed.includes('halaqmap.com') && !trimmed.includes('www.')
      ? trimmed.replace('halaqmap.com', 'www.halaqmap.com')
      : trimmed;
  }
}

export function siteBaseUrlFromEnv(): string {
  const fromEnv = (
    process.env.VITE_SITE_ORIGIN ||
    process.env.VITE_PUBLIC_APP_ORIGIN ||
    process.env.PUBLIC_SITE_ORIGIN ||
    ''
  ).trim();
  return canonicalSiteOrigin(fromEnv || 'https://www.halaqmap.com');
}

export function generateBarberTempPassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(22);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) out += chars[bytes[i]! % chars.length];
  return out;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendBarberCredentialsViaResend(input: {
  to: string;
  dashboardUrl: string;
  email: string;
  password: string;
  barberName: string;
  apiKey: string;
  fromEmail: string;
  magicDashboardUrl?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const primaryUrl = input.magicDashboardUrl?.trim() || input.dashboardUrl;
  const usesMagic = Boolean(input.magicDashboardUrl?.trim());
  const subject = 'حلاق ماب | بيانات الدخول — لوحة تحكم الحلاق';
  const text = [
    `أهلًا ${input.barberName}،`,
    '',
    usesMagic
      ? 'تم إنشاء حسابك على حلاق ماب. افتح الرابط السريع أدناه للدخول المباشر إلى لوحة التحكم:'
      : 'تم إنشاء حسابك على حلاق ماب. يمكنك تسجيل الدخول بالبيانات التالية:',
    '',
    usesMagic ? `رابط الدخول السريع: ${primaryUrl}` : `رابط لوحة التحكم: ${primaryUrl}`,
    '',
    `البريد: ${input.email}`,
    `كلمة المرور (احتياطي): ${input.password}`,
    '',
    usesMagic
      ? 'يمكنك أيضاً تسجيل الدخول يدوياً من /#/partners/login بالبيانات أعلاه.'
      : 'نوصي بتغيير كلمة المرور بعد أول دخول.',
    '',
    '— فريق حلاق ماب',
  ].join('\n');
  const intro = usesMagic
    ? 'تم إنشاء حسابك. افتح الرابط السريع للدخول المباشر إلى لوحة التحكم (بدون انتظار):'
    : 'تم إنشاء حسابك. استخدم البيانات التالية لتسجيل الدخول إلى لوحة التحكم:';
  const ctaLabel = usesMagic ? 'فتح لوحة التحكم (دخول سريع)' : 'فتح لوحة التحكم';
  const footer = usesMagic
    ? '<p style="font-size:13px;color:#64748b">يمكنك أيضاً الدخول يدوياً من صفحة تسجيل الدخول بالبريد وكلمة المرور أعلاه.</p>'
    : '<p style="font-size:13px;color:#64748b">يُفضّل تغيير كلمة المرور بعد أول دخول.</p>';
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:24px;background:#f8fafc"><p>أهلًا <strong>${escapeHtml(input.barberName)}</strong>،</p><p>${intro}</p><p><a href="${escapeHtml(primaryUrl)}" style="display:inline-block;padding:12px 22px;background:#0d9488;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">${ctaLabel}</a></p><table style="margin:16px 0;border-collapse:collapse;font-size:15px"><tr><td style="padding:8px 14px;border:1px solid #e2e8f0;background:#fff">البريد</td><td style="padding:8px 14px;border:1px solid #e2e8f0;background:#fff" dir="ltr">${escapeHtml(input.email)}</td></tr><tr><td style="padding:8px 14px;border:1px solid #e2e8f0;background:#fff">كلمة المرور</td><td style="padding:8px 14px;border:1px solid #e2e8f0;background:#fff;font-family:ui-monospace,monospace" dir="ltr">${escapeHtml(input.password)}</td></tr></table>${footer}</body></html>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      from: resolveResendFromAddress(input.fromEmail),
      to: [input.to],
      subject,
      text,
      html,
    }),
  });
  const raw = await resp.text();
  if (!resp.ok) {
    let msg = raw.slice(0, 400);
    try {
      const j = JSON.parse(raw) as { message?: string };
      if (j.message) msg = j.message;
    } catch {
      /* ignore */
    }
    return { ok: false, error: msg };
  }
  return { ok: true };
}

export async function ensureAuthUserWithPassword(
  supabase: SupabaseClient,
  emailRaw: string,
  password: string,
  fullName: string,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const email = emailRaw.trim().toLowerCase();
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (!createErr && created.user?.id) {
    return { ok: true, userId: created.user.id };
  }
  if (!createErr) {
    return { ok: false, error: 'createUser returned no user' };
  }
  const errMsg = createErr.message?.toLowerCase() ?? '';
  const dup =
    createErr.status === 422 ||
    errMsg.includes('already') ||
    errMsg.includes('registered') ||
    errMsg.includes('exists') ||
    errMsg.includes('duplicate') ||
    errMsg.includes('user already');
  if (!dup) {
    return { ok: false, error: createErr.message };
  }
  let foundId: string | null = null;
  for (let page = 1; page <= 10; page += 1) {
    const { data, error: listErr } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (listErr || !data?.users?.length) break;
    const u = data.users.find((x) => (x.email ?? '').toLowerCase() === email);
    if (u?.id) {
      foundId = u.id;
      break;
    }
    if (data.users.length < 200) break;
  }
  if (!foundId) {
    return { ok: false, error: createErr.message ?? 'User exists but could not be resolved' };
  }
  const { error: upErr } = await supabase.auth.admin.updateUserById(foundId, {
    password,
    email_confirm: true,
  });
  if (upErr) return { ok: false, error: upErr.message };
  return { ok: true, userId: foundId };
}

/** يُحدّث كلمة مرور حساب Supabase للدخول اليدوي من /partners/login (يُرفق في بريد التفعيل). */
export async function rotateBarberPortalLoginPassword(
  supabase: SupabaseClient,
  emailRaw: string,
  displayName: string,
): Promise<{ ok: true; password: string; userId: string } | { ok: false; error: string }> {
  const password = generateBarberTempPassword();
  const authResult = await ensureAuthUserWithPassword(supabase, emailRaw, password, displayName);
  if (authResult.ok === false) return authResult;
  return { ok: true, password, userId: authResult.userId };
}

function readNestedLocation(payload: Record<string, unknown>): {
  lat: number | null;
  lng: number | null;
  address: string;
} {
  const loc = payload.location;
  if (!loc || typeof loc !== 'object' || Array.isArray(loc)) {
    return { lat: null, lng: null, address: 'غير محدد' };
  }
  const l = loc as Record<string, unknown>;
  const latRaw = l.lat;
  const lngRaw = l.lng;
  const parseCoord = (raw: unknown): number | null => {
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    if (typeof raw === 'string') {
      const n = Number.parseFloat(raw.trim());
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };
  const lat = parseCoord(latRaw);
  const lng = parseCoord(lngRaw);
  const address = typeof l.address === 'string' && l.address.trim() ? l.address.trim() : 'غير محدد';
  return { lat, lng, address };
}

function readAttachmentUrls(payload: Record<string, unknown>): {
  shopExterior?: string;
  shopInterior?: string;
  banners?: string[];
} {
  const raw = payload.registrationAttachmentUrls;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const banners = Array.isArray(o.banners)
    ? o.banners
        .map((x) => String(x ?? '').trim())
        .filter((url) => url.length > 0)
    : [];
  return {
    shopExterior: typeof o.shopExterior === 'string' ? o.shopExterior : undefined,
    shopInterior: typeof o.shopInterior === 'string' ? o.shopInterior : undefined,
    ...(banners.length ? { banners } : {}),
  };
}

function readInclusiveCare(payload: Record<string, unknown>): {
  offered: boolean;
  price: number | null;
} {
  const raw = payload.inclusiveAccessibleCare;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { offered: false, price: null };
  }
  const o = raw as Record<string, unknown>;
  const offered = o.offered === true;
  const priceRaw = o.displayedPriceSar;
  const price =
    typeof priceRaw === 'number' && Number.isFinite(priceRaw) && priceRaw > 0 ? priceRaw : null;
  return { offered, price };
}

export function buildBarberUpsertRowFromRegistrationPayload(
  payload: Record<string, unknown>,
  tierOverride?: string | null,
): Record<string, unknown> {
  const loc = readNestedLocation(payload);
  const attachments = readAttachmentUrls(payload);
  const care = readInclusiveCare(payload);
  const shopImages = Array.isArray(payload.shopImages)
    ? payload.shopImages.filter((x) => typeof x === 'string')
    : [];
  const categories = Array.isArray(payload.categories)
    ? payload.categories.filter((x) => typeof x === 'string')
    : [];
  const tierRaw = String(tierOverride ?? payload.tier ?? 'bronze').trim().toLowerCase();
  const tier = tierRaw === 'gold' || tierRaw === 'diamond' ? tierRaw : 'bronze';
  const bannerUrls = attachments.banners?.length
    ? attachments.banners
    : readRegistrationBannerUrls(payload);
  const publicImages = resolveBarberPublicCoverAndFeatured({
    bannerUrls,
    shopExterior: attachments.shopExterior,
    shopInterior: attachments.shopInterior,
    shopImages,
  });

  return {
    name: String(payload.barberName ?? '').trim() || 'صالون بدون اسم',
    email: String(payload.email ?? '').trim(),
    phone: String(payload.phone ?? '').trim() || '0500000000',
    latitude: loc.lat,
    longitude: loc.lng,
    address: loc.address,
    city: loc.address !== 'غير محدد' ? loc.address : null,
    tier,
    is_active: true,
    is_verified: true,
    cover_image: publicImages.cover_image,
    profile_image: publicImages.profile_image,
    ...(publicImages.featured_images.length
      ? { featured_images: publicImages.featured_images }
      : {}),
    specialties: categories.length ? categories : null,
    inclusive_care_offered: care.offered,
    inclusive_care_price_sar: care.offered && care.price ? care.price : null,
    inclusive_care_public_visible: true,
    inclusive_care_restrict_days: false,
    inclusive_care_days: {},
    inclusive_care_customer_note: null,
    children_specialist: resolveChildrenSpecialistFlag({
      requested: payload.childrenSpecialist === true,
      acceptsChildren: categories.some((c) => c === 'حلاقة أطفال' || c === 'أطفال'),
      tier,
    }),
    ...(() => {
      const bannerLines = normalizeGroomingCenterBannerLines(payload.groomingCenterBannerLines);
      const mensGroomingRequested =
        payload.mensGroomingCenter === true && payload.digitalShiftAddonSelected === true;
      const hasMensHaircut =
        categories.some((c) => c === 'حلاقة رجالي' || c.includes('حلاقة رجال')) ||
        bannerLines.some((line) => line === 'حلاقة رجالي' || line.includes('حلاقة رجال'));
      const mensGroomingCenter = resolveMensGroomingCenterFlag({
        requested: mensGroomingRequested,
        tier,
        hasMensHaircutInSpecialties: hasMensHaircut,
        digitalShiftEnabled: mensGroomingRequested,
      });
      return {
        mens_grooming_center: mensGroomingCenter,
        grooming_center_banner_lines: mensGroomingCenter ? bannerLines : [],
      };
    })(),
  };
}

export function buildMinimalBarberUpsertRowFromPayment(input: {
  email: string;
  name: string;
  phone?: string | null;
  tier?: string | null;
}): Record<string, unknown> {
  const tierRaw = String(input.tier ?? 'bronze').trim().toLowerCase();
  const tier = tierRaw === 'gold' || tierRaw === 'diamond' ? tierRaw : 'bronze';
  return {
    name: input.name.trim() || 'شريك حلاق ماب',
    email: input.email.trim(),
    phone: (input.phone ?? '').trim() || '0500000000',
    address: 'يُستكمل من لوحة التحكم',
    city: null,
    tier,
    is_active: true,
    is_verified: true,
  };
}

async function ensureBarberSecurityTokens(
  supabase: SupabaseClient,
  barberId: string,
): Promise<{ shopOpenQuickHashLink?: string }> {
  const { data: tokenRow } = await supabase
    .from('barbers')
    .select('rating_invite_token, open_status_token')
    .eq('id', barberId)
    .maybeSingle();

  if (tokenRow) {
    const existingRating = String(
      (tokenRow as { rating_invite_token?: string | null }).rating_invite_token ?? '',
    ).trim();
    if (!existingRating) {
      const bytes = new Uint8Array(24);
      crypto.getRandomValues(bytes);
      const fresh = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      await supabase.from('barbers').update({ rating_invite_token: fresh }).eq('id', barberId);
    }
  }

  let shopOpenQuickHashLink: string | undefined;
  const { data: ostAgain } = await supabase
    .from('barbers')
    .select('open_status_token')
    .eq('id', barberId)
    .maybeSingle();
  let tok = String((ostAgain as { open_status_token?: string | null } | null)?.open_status_token ?? '').trim();
  if (!tok) {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    tok = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    await supabase.from('barbers').update({ open_status_token: tok }).eq('id', barberId);
  }
  if (tok) {
    shopOpenQuickHashLink = `/#/partners/shop-open?t=${encodeURIComponent(tok)}`;
  }
  return { shopOpenQuickHashLink };
}

export type ProvisionBarberAccountInput = {
  upsertRow: Record<string, unknown>;
  legalDisclaimerAccepted?: boolean;
  legalDisclaimerAcceptedAtIso?: string;
  sendCredentialsEmail?: boolean;
  forceAuthProvision?: boolean;
};

export type ProvisionBarberAccountResult =
  | {
      ok: true;
      barberId: string;
      memberNumber: number | null;
      authUserId: string | null;
      created: boolean;
      credentialEmailSent: boolean;
      credentialEmailError?: string;
      shopOpenQuickHashLink?: string;
      warning?: string;
    }
  | { ok: false; error: string; barberId?: string };

export async function provisionBarberAccount(
  supabase: SupabaseClient,
  input: ProvisionBarberAccountInput,
): Promise<ProvisionBarberAccountResult> {
  const wl = whitelistBarberUpsertRow(input.upsertRow);
  if (wl.ok === false) {
    return { ok: false, error: `disallowed_fields:${wl.disallowedKeys.join(',')}` };
  }

  const email = String((wl.row as { email?: unknown }).email ?? '').trim();
  if (!email || !email.includes('@')) {
    return { ok: false, error: 'missing_barber_email' };
  }

  const barberDisplayName = String((wl.row as { name?: unknown }).name ?? '').trim() || 'شريك حلاق ماب';

  const { data: existingByEmail } = await supabase
    .from('barbers')
    .select('id, member_number, user_id')
    .ilike('email', email)
    .maybeSingle();

  const hadExisting = Boolean(existingByEmail?.id);
  const existingUserId = existingByEmail?.user_id
    ? String((existingByEmail as { user_id?: string }).user_id)
    : null;

  const upsertSource = { ...(wl.row as Record<string, unknown>) };
  delete upsertSource.user_id;
  let upsertPayload: Record<string, unknown> = upsertSource;
  let skippedInclusiveCareDueToSchema = false;

  let { data, error } = await supabase
    .from('barbers')
    .upsert(upsertPayload, { onConflict: 'email' })
    .select('id, member_number, user_id')
    .single();

  if (error && isBarberUpsertMissingInclusiveCareColumnError(error.message)) {
    skippedInclusiveCareDueToSchema = true;
    upsertPayload = stripInclusiveCareKeysFromBarberUpsertRow(upsertSource);
    const second = await supabase
      .from('barbers')
      .upsert(upsertPayload, { onConflict: 'email' })
      .select('id, member_number, user_id')
      .single();
    data = second.data;
    error = second.error;
  }

  if (error || !data) {
    return { ok: false, error: error?.message || 'upsert_failed' };
  }

  const barberId = String((data as { id: string }).id);
  const memberNumberRaw = (data as { member_number?: number | null }).member_number;
  const memberNumber =
    memberNumberRaw != null && Number.isFinite(Number(memberNumberRaw)) ? Number(memberNumberRaw) : null;

  const tokenMeta = await ensureBarberSecurityTokens(supabase, barberId);

  const shouldAuth =
    input.forceAuthProvision === true ||
    input.sendCredentialsEmail === true ||
    !existingUserId;

  let authUserId: string | null = existingUserId;
  let credentialEmailSent = false;
  let credentialEmailError: string | undefined;

  if (shouldAuth) {
    const tempPassword = generateBarberTempPassword();
    const authResult = await ensureAuthUserWithPassword(supabase, email, tempPassword, barberDisplayName);
    if (authResult.ok === false) {
      return { ok: false, error: authResult.error, barberId };
    }
    authUserId = authResult.userId;

    const { error: linkErr } = await supabase.from('barbers').update({ user_id: authUserId }).eq('id', barberId);
    if (linkErr) {
      return { ok: false, error: linkErr.message || 'link_user_id_failed', barberId };
    }

    const profilePatch: Record<string, unknown> = {
      user_type: 'barber',
      full_name: barberDisplayName,
    };
    if (input.legalDisclaimerAccepted) {
      profilePatch.legal_disclaimer_accepted = true;
      profilePatch.acceptance_timestamp =
        input.legalDisclaimerAcceptedAtIso?.trim() || new Date().toISOString();
    }
    const { error: profilePatchErr } = await supabase.from('profiles').update(profilePatch).eq('id', authUserId);
    if (profilePatchErr && process.env.NODE_ENV !== 'production') {
      console.warn('[barberProvision] profile update:', profilePatchErr.message);
    }

    const sendMail = input.sendCredentialsEmail === true;
    if (sendMail) {
      const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
      const resendFromRaw = readResendFromEmailEnv();
      if (resendApiKey && resendFromRaw) {
        const siteBase = siteBaseUrlFromEnv();
        const tier = String((wl.row as { tier?: unknown }).tier ?? 'bronze').trim().toLowerCase();
        const magicDashboardUrl = buildBarberMagicEnterUrl(siteBase, barberId, email, tier);
        const mail = await sendBarberCredentialsViaResend({
          to: email,
          dashboardUrl: `${siteBase}/#/partners/login?next=${encodeURIComponent('/barber/dashboard')}`,
          magicDashboardUrl,
          email,
          password: tempPassword,
          barberName: barberDisplayName,
          apiKey: resendApiKey,
          fromEmail: resendFromRaw,
        });
        if (mail.ok) credentialEmailSent = true;
        else credentialEmailError = mail.error;
      } else {
        credentialEmailError =
          'RESEND_API_KEY أو RESEND_FROM_EMAIL غير مضبوطين — لم يُرسل بريد بيانات الدخول.';
      }
    }
  }

  return {
    ok: true,
    barberId,
    memberNumber,
    authUserId,
    created: !hadExisting,
    credentialEmailSent,
    ...(credentialEmailError ? { credentialEmailError } : {}),
    ...(tokenMeta.shopOpenQuickHashLink ? { shopOpenQuickHashLink: tokenMeta.shopOpenQuickHashLink } : {}),
    ...(skippedInclusiveCareDueToSchema
      ? {
          warning:
            'تم حفظ الحلاق دون حقول «رعاية شاملة» لأن قاعدة البيانات لا تزال بلا الأعمدة الجديدة.',
        }
      : {}),
  };
}

export type ProvisionBarberForPaymentInput = {
  registrationRequestId?: string | null;
  buyerEmail?: string | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
  tier?: string | null;
  moyasarPaymentId?: string | null;
  /** عند false (افتراضي لمسار الدفع): بيانات الدخول عبر رابط magic في بريد التفعيل الموحّد */
  sendCredentialsEmail?: boolean;
  /** تخطّي منح تجربة برونزي أثناء provision (مسار استرداد HM-TRY يمنح الإدراج بنفسه). */
  skipBronzeTrialEnsure?: boolean;
};

export type ProvisionBarberForPaymentResult =
  | {
      ok: true;
      barberId: string;
      created: boolean;
      credentialEmailSent: boolean;
      shopOpenQuickHashLink?: string;
      source: 'registration' | 'payment_email' | 'existing';
    }
  | { ok: false; error: string };

/** إن كان للحلاق كود تجربة برونزي مؤهل بلا إدراج — يمنح الإدراج تلقائياً. */
async function maybeEnsureBronzeTrialListing(
  supabase: SupabaseClient,
  barberId: string,
  email?: string | null,
  skip?: boolean,
): Promise<void> {
  if (skip) return;
  try {
    const { ensureBronzeTrialListingForBarber } = await import('./bronzeTrialListingEnsure.js');
    const ensured = await ensureBronzeTrialListingForBarber(supabase, {
      barberId,
      email: email ?? null,
    });
    if (!ensured.ok) {
      console.error('[provision] bronze_trial_listing_ensure_failed', ensured.error);
    }
  } catch (err) {
    console.error('[provision] bronze_trial_listing_ensure_threw', err);
  }
}

/** يفرض إحداثيات طلب التجربة الموافق عليه (مصدر الحقيقة) على سجل الحلاق. */
async function maybeApplyBronzeTrialGeo(
  supabase: SupabaseClient,
  barberId: string,
  email?: string | null,
): Promise<void> {
  try {
    const { applyApprovedBronzeTrialGeoToBarber } = await import('./bronzeTrialGeoSync.js');
    const geo = await applyApprovedBronzeTrialGeoToBarber(supabase, {
      barberId,
      email: email ?? null,
    });
    if (!geo.ok) {
      console.error('[provision] bronze_trial_geo_sync_failed', geo.error);
    }
  } catch (err) {
    console.error('[provision] bronze_trial_geo_sync_threw', err);
  }
}

async function maybeSyncWorkingHoursFromRegistration(
  supabase: SupabaseClient,
  barberId: string,
  registrationRequestId?: string | null,
  email?: string | null,
): Promise<void> {
  try {
    let payload: Record<string, unknown> | null = null;
    const requestId = String(registrationRequestId ?? '').trim();
    if (requestId) {
      const { data } = await supabase
        .from('registration_submissions')
        .select('payload')
        .eq('id', requestId)
        .maybeSingle();
      if (data?.payload && typeof data.payload === 'object' && !Array.isArray(data.payload)) {
        payload = data.payload as Record<string, unknown>;
      }
    }
    if (!payload) {
      const e = String(email ?? '').trim().toLowerCase();
      if (e.includes('@')) {
        const { data } = await supabase
          .from('registration_submissions')
          .select('payload')
          .filter('payload->>email', 'ilike', e)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data?.payload && typeof data.payload === 'object' && !Array.isArray(data.payload)) {
          payload = data.payload as Record<string, unknown>;
        }
      }
    }
    if (!payload) return;
    const { syncBarberWorkingHoursFromRegistrationPayload } = await import(
      './barberWorkingHoursSync.js'
    );
    const wh = await syncBarberWorkingHoursFromRegistrationPayload(supabase, barberId, payload);
    if (!wh.ok) {
      console.error('[provision] working_hours_sync_failed', wh.error);
    }
  } catch (err) {
    console.error('[provision] working_hours_sync_threw', err);
  }
}

export async function provisionBarberForPaidOrder(
  supabase: SupabaseClient,
  input: ProvisionBarberForPaymentInput,
): Promise<ProvisionBarberForPaymentResult> {
  const requestId = String(input.registrationRequestId ?? '').trim();
  const buyerEmail = String(input.buyerEmail ?? '').trim();
  const tier = input.tier ?? 'bronze';
  const skipTrialEnsure = input.skipBronzeTrialEnsure === true;

  if (buyerEmail && buyerEmail.includes('@')) {
    const { data: existing } = await supabase
      .from('barbers')
      .select('id, user_id')
      .ilike('email', buyerEmail)
      .maybeSingle();
    if (existing?.id && UUID_RE.test(String(existing.id))) {
      const barberId = String(existing.id);
      await ensureBarberSecurityTokens(supabase, barberId);
      if (requestId) {
        await linkRegistrationSubmissionToBarber(supabase, {
          registrationRequestId: requestId,
          barberId,
          moyasarPaymentId: input.moyasarPaymentId ?? null,
        });
      }
      await maybeEnsureBronzeTrialListing(supabase, barberId, buyerEmail, skipTrialEnsure);
      await maybeApplyBronzeTrialGeo(supabase, barberId, buyerEmail);
      await maybeSyncWorkingHoursFromRegistration(supabase, barberId, requestId || null, buyerEmail);
      return {
        ok: true,
        barberId,
        created: false,
        credentialEmailSent: false,
        source: 'existing',
      };
    }
  }

  let upsertRow: Record<string, unknown> | null = null;
  let legalDisclaimerAccepted = false;
  let legalDisclaimerAcceptedAtIso = '';

  if (requestId) {
    const { data, error } = await supabase
      .from('registration_submissions')
      .select('payload')
      .eq('id', requestId)
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!data?.payload || typeof data.payload !== 'object' || Array.isArray(data.payload)) {
      return { ok: false, error: 'registration_payload_missing' };
    }
    const payload = data.payload as Record<string, unknown>;
    const linked = typeof payload.linkedBarberId === 'string' ? payload.linkedBarberId.trim() : '';
    if (UUID_RE.test(linked)) {
      const { data: linkedRow } = await supabase.from('barbers').select('id').eq('id', linked).maybeSingle();
      if (linkedRow?.id) {
        await linkRegistrationSubmissionToBarber(supabase, {
          registrationRequestId: requestId,
          barberId: String(linkedRow.id),
          moyasarPaymentId: input.moyasarPaymentId ?? null,
        });
        await maybeEnsureBronzeTrialListing(supabase, String(linkedRow.id), buyerEmail, skipTrialEnsure);
        await maybeApplyBronzeTrialGeo(supabase, String(linkedRow.id), buyerEmail);
        await maybeSyncWorkingHoursFromRegistration(
          supabase,
          String(linkedRow.id),
          requestId,
          buyerEmail,
        );
        return {
          ok: true,
          barberId: String(linkedRow.id),
          created: false,
          credentialEmailSent: false,
          source: 'existing',
        };
      }
    }
    upsertRow = buildBarberUpsertRowFromRegistrationPayload(payload, tier);
    legalDisclaimerAccepted = payload.legalDisclaimerAccepted === true;
    legalDisclaimerAcceptedAtIso =
      typeof payload.legalDisclaimerAcceptedAtIso === 'string'
        ? payload.legalDisclaimerAcceptedAtIso.trim()
        : '';
  } else if (buyerEmail && buyerEmail.includes('@')) {
    upsertRow = buildMinimalBarberUpsertRowFromPayment({
      email: buyerEmail,
      name: String(input.buyerName ?? 'شريك حلاق ماب'),
      phone: input.buyerPhone ?? null,
      tier,
    });
  } else {
    return { ok: false, error: 'missing_provision_identity' };
  }

  const provision = await provisionBarberAccount(supabase, {
    upsertRow,
    legalDisclaimerAccepted,
    legalDisclaimerAcceptedAtIso,
    sendCredentialsEmail: input.sendCredentialsEmail === true,
    forceAuthProvision: true,
  });
  if (!provision.ok) return { ok: false, error: provision.error };

  if (requestId) {
    await linkRegistrationSubmissionToBarber(supabase, {
      registrationRequestId: requestId,
      barberId: provision.barberId,
      moyasarPaymentId: input.moyasarPaymentId ?? null,
    });
  }

  await maybeEnsureBronzeTrialListing(supabase, provision.barberId, buyerEmail, skipTrialEnsure);
  await maybeApplyBronzeTrialGeo(supabase, provision.barberId, buyerEmail);
  await maybeSyncWorkingHoursFromRegistration(
    supabase,
    provision.barberId,
    requestId || null,
    buyerEmail,
  );

  return {
    ok: true,
    barberId: provision.barberId,
    created: provision.created,
    credentialEmailSent: provision.credentialEmailSent,
    ...(provision.shopOpenQuickHashLink ? { shopOpenQuickHashLink: provision.shopOpenQuickHashLink } : {}),
    source: requestId ? 'registration' : 'payment_email',
  };
}

async function linkRegistrationSubmissionToBarber(
  supabase: SupabaseClient,
  input: {
    registrationRequestId: string;
    barberId: string;
    moyasarPaymentId: string | null;
  },
): Promise<void> {
  const { data: row } = await supabase
    .from('registration_submissions')
    .select('payload')
    .eq('id', input.registrationRequestId)
    .maybeSingle();
  if (!row?.payload || typeof row.payload !== 'object' || Array.isArray(row.payload)) return;

  const payload = {
    ...(row.payload as Record<string, unknown>),
    linkedBarberId: input.barberId,
    adminAccountState: 'active',
    paymentProvisionedAtIso: new Date().toISOString(),
    ...(input.moyasarPaymentId ? { lastMoyasarPaymentId: input.moyasarPaymentId } : {}),
  };

  await supabase
    .from('registration_submissions')
    .update({
      payload,
    })
    .eq('id', input.registrationRequestId);
}
