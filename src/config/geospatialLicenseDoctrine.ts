/** Software License Manager doctrine — mirrored for frontend display. */
export const ISIC_ACTIVITY_CODE = '474151' as const;
export const ISIC_ACTIVITY_LABEL_AR =
  'بيع برمجيات بالتجزئة في المتاجر المتخصصة (ISIC4 474151)' as const;

export const GEOSPATIAL_LICENSE_ASSET_CLASS = 'Geospatial_License_Asset' as const;
export const MAP_INTEGRATION_PROTOCOL = 'api_driven_v1' as const;

export const SOFTWARE_LICENSE_MANAGER_LABEL_AR = 'نظام إدارة تراخيص برمجية' as const;

export type MapIntegrationStatus = 'pending_geospatial_bind' | 'map_live';
export type GeospatialAssetStatus = 'pending_activation' | 'map_live' | 'suspended' | 'expired';

export type DigitalActivationCertificateView = {
  certificateNumber: string;
  publicToken: string;
  isicCode: string;
  productClass: string;
  tier: string;
  tierLabelAr: string;
  issuedAt: string;
  validUntil: string;
  mapIntegrationStatus: MapIntegrationStatus;
  mapIntegrationProtocol: string;
  assetStatus: GeospatialAssetStatus;
  geoSnapshot: Record<string, unknown>;
  verifyPath: string;
};
