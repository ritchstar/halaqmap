import { randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ListingLicenseTier } from './listingLicenseCatalog.js';
import {
  GEOSPATIAL_LICENSE_ASSET_CLASS,
  ISIC_ACTIVITY_CODE,
  MAP_INTEGRATION_PROTOCOL,
  SOFTWARE_LICENSE_MANAGER_LABEL_AR,
  type DigitalActivationCertificatePayload,
  type GeospatialAssetStatus,
  type MapIntegrationStatus,
} from './geospatialLicenseDoctrine.js';
import {
  ACTIVATION_STATUS_TECHNICAL_LINK,
  invoiceLineDescriptionAr,
  invoiceLineDescriptionEn,
} from './softwareLicenseTerminology.js';

function tierLabelAr(tier: ListingLicenseTier | string): string {
  const t = tier.toLowerCase();
  if (t === 'gold') return 'ذهبي';
  if (t === 'diamond') return 'ماسي';
  return 'برونزي';
}

export type ProvisionGeospatialAssetInput = {
  orderId: string;
  barberId: string | null;
  entitlementId: string | null;
  tier: ListingLicenseTier;
  validUntil: string;
  registrationRequestId?: string | null;
};

export type ProvisionGeospatialAssetResult =
  | {
      ok: true;
      assetId: string;
      certificateId: string;
      certificate: DigitalActivationCertificatePayload;
    }
  | { ok: false; error: string };

function generateCertificateNumber(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  return `HM-CERT-${y}${m}${day}-${suffix}`;
}

function generatePublicToken(): string {
  return randomBytes(24).toString('hex');
}

async function loadGeoSnapshot(
  supabase: SupabaseClient,
  barberId: string | null,
  registrationRequestId?: string | null,
): Promise<{
  latitude: number | null;
  longitude: number | null;
  snapshot: Record<string, unknown>;
}> {
  if (barberId) {
    const { data } = await supabase
      .from('barbers')
      .select('latitude, longitude, business_name, region_id, city_id, district_id')
      .eq('id', barberId)
      .maybeSingle();
    if (data) {
      const lat = typeof data.latitude === 'number' ? data.latitude : null;
      const lng = typeof data.longitude === 'number' ? data.longitude : null;
      return {
        latitude: lat,
        longitude: lng,
        snapshot: {
          businessName: data.business_name ?? null,
          regionId: data.region_id ?? null,
          cityId: data.city_id ?? null,
          districtId: data.district_id ?? null,
          source: 'barber_record',
        },
      };
    }
  }

  const reqId = registrationRequestId?.trim();
  if (reqId) {
    const { data } = await supabase
      .from('registration_submissions')
      .select('payload')
      .eq('id', reqId)
      .maybeSingle();
    const payload =
      data?.payload && typeof data.payload === 'object' && !Array.isArray(data.payload)
        ? (data.payload as Record<string, unknown>)
        : null;
    const location =
      payload?.location && typeof payload.location === 'object' && !Array.isArray(payload.location)
        ? (payload.location as Record<string, unknown>)
        : null;
    const lat = typeof location?.lat === 'number' ? location.lat : null;
    const lng = typeof location?.lng === 'number' ? location.lng : null;
    return {
      latitude: lat,
      longitude: lng,
      snapshot: {
        businessName: payload?.businessName ?? payload?.barberName ?? null,
        regionId: payload?.regionId ?? null,
        cityId: payload?.cityId ?? null,
        districtId: payload?.districtId ?? null,
        registrationRequestId: reqId,
        source: 'registration_submission',
      },
    };
  }

  return { latitude: null, longitude: null, snapshot: { source: 'unbound' } };
}

function resolveMapStatuses(input: {
  barberId: string | null;
  entitlementId: string | null;
  latitude: number | null;
  longitude: number | null;
}): { assetStatus: GeospatialAssetStatus; mapStatus: MapIntegrationStatus; mapIntegratedAt: string | null } {
  const geoReady =
    Boolean(input.barberId) &&
    Boolean(input.entitlementId) &&
    input.latitude != null &&
    input.longitude != null &&
    Number.isFinite(input.latitude) &&
    Number.isFinite(input.longitude);

  if (geoReady) {
    return {
      assetStatus: 'map_live',
      mapStatus: 'map_live',
      mapIntegratedAt: new Date().toISOString(),
    };
  }

  return {
    assetStatus: 'pending_activation',
    mapStatus: 'pending_geospatial_bind',
    mapIntegratedAt: null,
  };
}

export async function provisionGeospatialLicenseAsset(
  supabase: SupabaseClient,
  input: ProvisionGeospatialAssetInput,
): Promise<ProvisionGeospatialAssetResult> {
  const { data: existingAsset } = await supabase
    .from('geospatial_license_assets')
    .select('id')
    .eq('order_id', input.orderId)
    .maybeSingle();
  if (existingAsset?.id) {
    const cert = await fetchCertificateByOrderId(supabase, input.orderId);
    if (cert.ok) {
      return {
        ok: true,
        assetId: existingAsset.id,
        certificateId: cert.certificateId,
        certificate: cert.certificate,
      };
    }
    return { ok: false, error: 'asset_exists_without_certificate' };
  }

  const geo = await loadGeoSnapshot(supabase, input.barberId, input.registrationRequestId);
  const map = resolveMapStatuses({
    barberId: input.barberId,
    entitlementId: input.entitlementId,
    latitude: geo.latitude,
    longitude: geo.longitude,
  });
  const now = new Date().toISOString();
  const certificateNumber = generateCertificateNumber();
  const publicToken = generatePublicToken();

  const { data: asset, error: assetErr } = await supabase
    .from('geospatial_license_assets')
    .insert({
      barber_id: input.barberId,
      entitlement_id: input.entitlementId,
      order_id: input.orderId,
      isic_code: ISIC_ACTIVITY_CODE,
      asset_status: map.assetStatus,
      map_integration_protocol: MAP_INTEGRATION_PROTOCOL,
      geo_latitude: geo.latitude,
      geo_longitude: geo.longitude,
      geo_snapshot: geo.snapshot,
      map_integrated_at: map.mapIntegratedAt,
      activated_at: input.entitlementId ? now : null,
      valid_until: input.validUntil,
      tier: input.tier,
    })
    .select('id')
    .single();

  if (assetErr || !asset?.id) {
    return { ok: false, error: assetErr?.message || 'asset_insert_failed' };
  }

  const certificatePayload: DigitalActivationCertificatePayload & {
    invoiceProductEn: string;
    invoiceProductAr: string;
    activationStatus: string;
  } = {
    certificateNumber,
    publicToken,
    isicCode: ISIC_ACTIVITY_CODE,
    productClass: GEOSPATIAL_LICENSE_ASSET_CLASS,
    tier: input.tier,
    tierLabelAr: tierLabelAr(input.tier),
    issuedAt: now,
    validUntil: input.validUntil,
    mapIntegrationStatus: map.mapStatus,
    mapIntegrationProtocol: MAP_INTEGRATION_PROTOCOL,
    assetStatus: map.assetStatus,
    geoSnapshot: geo.snapshot,
    verifyPath: `/api/digital-activation-certificate?token=${publicToken}`,
    invoiceProductEn: invoiceLineDescriptionEn('Tier ' + input.tier),
    invoiceProductAr: invoiceLineDescriptionAr(tierLabelAr(input.tier)),
    activationStatus:
      map.mapStatus === 'map_live' ? ACTIVATION_STATUS_TECHNICAL_LINK : 'Pending Geospatial Bind',
  };

  const { data: certRow, error: certErr } = await supabase
    .from('digital_activation_certificates')
    .insert({
      asset_id: asset.id,
      order_id: input.orderId,
      barber_id: input.barberId,
      entitlement_id: input.entitlementId,
      certificate_number: certificateNumber,
      public_token: publicToken,
      isic_code: ISIC_ACTIVITY_CODE,
      tier: input.tier,
      issued_at: now,
      valid_until: input.validUntil,
      map_integration_status: map.mapStatus,
      certificate_payload: certificatePayload,
    })
    .select('id')
    .single();

  if (certErr || !certRow?.id) {
    return { ok: false, error: certErr?.message || 'certificate_insert_failed' };
  }

  return {
    ok: true,
    assetId: asset.id,
    certificateId: certRow.id,
    certificate: certificatePayload,
  };
}

export async function refreshGeospatialLicenseAssetBinding(
  supabase: SupabaseClient,
  input: {
    orderId: string;
    barberId: string;
    entitlementId: string;
    validUntil: string;
    tier: ListingLicenseTier;
  },
): Promise<void> {
  const geo = await loadGeoSnapshot(supabase, input.barberId, null);
  const map = resolveMapStatuses({
    barberId: input.barberId,
    entitlementId: input.entitlementId,
    latitude: geo.latitude,
    longitude: geo.longitude,
  });
  const now = new Date().toISOString();

  const { data: asset } = await supabase
    .from('geospatial_license_assets')
    .select('id')
    .eq('order_id', input.orderId)
    .maybeSingle();
  if (!asset?.id) return;

  await supabase
    .from('geospatial_license_assets')
    .update({
      barber_id: input.barberId,
      entitlement_id: input.entitlementId,
      asset_status: map.assetStatus,
      geo_latitude: geo.latitude,
      geo_longitude: geo.longitude,
      geo_snapshot: geo.snapshot,
      map_integrated_at: map.mapIntegratedAt,
      activated_at: now,
      valid_until: input.validUntil,
      tier: input.tier,
      updated_at: now,
    })
    .eq('id', asset.id);

  const { data: cert } = await supabase
    .from('digital_activation_certificates')
    .select('certificate_payload, certificate_number, public_token, issued_at')
    .eq('asset_id', asset.id)
    .maybeSingle();

  if (cert) {
    const payload = (cert.certificate_payload || {}) as DigitalActivationCertificatePayload;
    const nextPayload: DigitalActivationCertificatePayload = {
      ...payload,
      certificateNumber: cert.certificate_number,
      publicToken: cert.public_token,
      tier: input.tier,
      tierLabelAr: tierLabelAr(input.tier),
      issuedAt: cert.issued_at || payload.issuedAt,
      validUntil: input.validUntil,
      mapIntegrationStatus: map.mapStatus,
      assetStatus: map.assetStatus,
      geoSnapshot: geo.snapshot,
    };
    await supabase
      .from('digital_activation_certificates')
      .update({
        barber_id: input.barberId,
        entitlement_id: input.entitlementId,
        valid_until: input.validUntil,
        map_integration_status: map.mapStatus,
        certificate_payload: nextPayload,
        updated_at: now,
      })
      .eq('asset_id', asset.id);
  }
}

export async function fetchCertificateByOrderId(
  supabase: SupabaseClient,
  orderId: string,
): Promise<
  | { ok: true; certificateId: string; certificate: DigitalActivationCertificatePayload }
  | { ok: false; error: string }
> {
  const { data, error } = await supabase
    .from('digital_activation_certificates')
    .select('id, certificate_payload, revoked_at')
    .eq('order_id', orderId)
    .maybeSingle();
  if (error || !data?.id) return { ok: false, error: error?.message || 'certificate_not_found' };
  if (data.revoked_at) return { ok: false, error: 'certificate_revoked' };
  const payload = data.certificate_payload as DigitalActivationCertificatePayload;
  return { ok: true, certificateId: data.id, certificate: payload };
}

export async function fetchCertificateByMoyasarPaymentId(
  supabase: SupabaseClient,
  moyasarPaymentId: string,
): Promise<
  | { ok: true; orderId: string; certificate: DigitalActivationCertificatePayload }
  | { ok: false; error: string }
> {
  const { data: order, error: orderErr } = await supabase
    .from('listing_license_orders')
    .select('id')
    .eq('moyasar_payment_id', moyasarPaymentId.trim())
    .maybeSingle();
  if (orderErr || !order?.id) {
    return { ok: false, error: orderErr?.message || 'order_not_found' };
  }
  const cert = await fetchCertificateByOrderId(supabase, order.id);
  if (!cert.ok) return cert;
  return { ok: true, orderId: order.id, certificate: cert.certificate };
}

export async function fetchCertificateByPublicToken(
  supabase: SupabaseClient,
  token: string,
): Promise<
  | { ok: true; certificate: DigitalActivationCertificatePayload }
  | { ok: false; error: string }
> {
  const normalized = token.trim().toLowerCase();
  if (normalized.length < 16) return { ok: false, error: 'invalid_token' };
  const { data, error } = await supabase
    .from('digital_activation_certificates')
    .select('certificate_payload, revoked_at')
    .eq('public_token', normalized)
    .maybeSingle();
  if (error || !data) return { ok: false, error: error?.message || 'certificate_not_found' };
  if (data.revoked_at) return { ok: false, error: 'certificate_revoked' };
  return { ok: true, certificate: data.certificate_payload as DigitalActivationCertificatePayload };
}

export function buildActivationCertificateEmailBodies(input: {
  barberName: string;
  certificate: DigitalActivationCertificatePayload;
}): { subject: string; html: string; text: string } {
  const c = input.certificate;
  const mapLine =
    c.mapIntegrationStatus === 'map_live'
      ? 'تم تفعيل بروتوكول الربط الآلي (API-Driven Integration) — الإدراج الجغرافي نشط على الخريطة.'
      : 'بروتوكول الربط الآلي جاهز — سيُفعَّل الإدراج على الخريطة فور ربط الإحداثيات الجغرافية.';

  const subject = `حلاق ماب | شهادة تفعيل رقمية — ${c.certificateNumber}`;
  const text = [
    `أهلًا ${input.barberName}،`,
    '',
    SOFTWARE_LICENSE_MANAGER_LABEL_AR,
    `نوع الأصل: ${GEOSPATIAL_LICENSE_ASSET_CLASS}`,
    `رمز النشاط ISIC4: ${ISIC_ACTIVITY_CODE}`,
    '',
    `رقم الشهادة: ${c.certificateNumber}`,
    `الباقة: ${c.tierLabelAr}`,
    `صالحة حتى: ${c.validUntil}`,
    mapLine,
    '',
    `التحقق: ${c.verifyPath}`,
    '',
    '— فريق حلاق ماب',
  ].join('\n');

  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head>
<body style="font-family:Tahoma,Arial,sans-serif;line-height:1.85;padding:24px;background:#f0f9ff">
<p>أهلًا <strong>${input.barberName}</strong>،</p>
<p><strong>${SOFTWARE_LICENSE_MANAGER_LABEL_AR}</strong></p>
<p>تم إصدار <strong>شهادة تفعيل رقمية</strong> بدلاً من رسالة تأكيد تقليدية:</p>
<div style="border:2px solid #0ea5e9;border-radius:12px;padding:16px;background:#fff;margin:16px 0">
<p style="margin:0;font-size:12px;color:#64748b">Digital Activation Certificate</p>
<p style="margin:8px 0;font-size:18px;font-weight:bold;letter-spacing:1px">${c.certificateNumber}</p>
<p style="margin:0"><strong>Geospatial_License_Asset</strong> · ISIC4 ${ISIC_ACTIVITY_CODE}</p>
<p style="margin:8px 0 0">الباقة: <strong>${c.tierLabelAr}</strong> — حتى <strong>${c.validUntil.slice(0, 10)}</strong></p>
<p style="margin:12px 0 0;font-size:13px;color:#0369a1">${mapLine}</p>
</div>
<p style="font-size:13px;color:#64748b">— فريق حلاق ماب</p>
</body></html>`;

  return { subject, html, text };
}

/**
 * Doctrine entry point — LicenseEngine.generate + GeospatialLink.connect
 * @example activateGeospatialLicense(partnerId, packageType)
 */
export async function activateGeospatialLicense(
  supabase: SupabaseClient,
  input: ProvisionGeospatialAssetInput,
): Promise<
  | {
      status: typeof ACTIVATION_STATUS_TECHNICAL_LINK | 'Pending Geospatial Bind';
      certificate: DigitalActivationCertificatePayload;
      assetId: string;
    }
  | { status: 'Failed'; error: string }
> {
  const result = await provisionGeospatialLicenseAsset(supabase, input);
  if (!result.ok) return { status: 'Failed', error: result.error };
  const linkStatus =
    result.certificate.mapIntegrationStatus === 'map_live'
      ? ACTIVATION_STATUS_TECHNICAL_LINK
      : ('Pending Geospatial Bind' as const);
  return {
    status: linkStatus,
    certificate: result.certificate,
    assetId: result.assetId,
  };
}
