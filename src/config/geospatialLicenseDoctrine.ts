/** Software License Manager doctrine — mirrored for frontend display. */
export const ISIC_ACTIVITY_CODE = '474151' as const;
export const ISIC_ACTIVITY_LABEL_AR =
  'بيع برمجيات بالتجزئة في المتاجر المتخصصة (ISIC4 474151)' as const;

export const GEOSPATIAL_LICENSE_ASSET_CLASS = 'Geospatial_License_Asset' as const;
export const MAP_INTEGRATION_PROTOCOL = 'api_driven_v1' as const;

export const SOFTWARE_LICENSE_MANAGER_LABEL_AR = 'نظام إدارة تراخيص برمجية' as const;

export const PLATFORM_NAME_AR = 'حلاق ماب' as const;
export const PLATFORM_NAME_EN = 'Halaq Map' as const;

export const UNIFIED_DIGITAL_LICENSE_LABEL_AR = 'رقم الرخصة الرقمية الموحد' as const;
export const ISIC_ACTIVITY_CODE_LABEL_AR = 'كود النشاط ISIC4' as const;
export const BARBER_NAME_LABEL_AR = 'اسم الحلاق / الصالون' as const;

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
