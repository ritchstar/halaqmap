/** Software License Manager doctrine — mirrored for frontend display. */
import {
  ON_DEMAND_VISIBILITY_ALGO_CODE,
  ON_DEMAND_VISIBILITY_PRODUCT_NAME_AR,
} from '@/config/onDemandVisibilityDoctrine';

export const ISIC_ACTIVITY_CODE = '474151' as const;
export const ISIC_ACTIVITY_LABEL_AR =
  'بيع برمجيات بالتجزئة في المتاجر المتخصصة (ISIC4 474151)' as const;

export const GEOSPATIAL_LICENSE_ASSET_CLASS = 'Geospatial_License_Asset' as const;

/**
 * بروتوكول الربط الفني مع طبقة الخريطة (تخزين قاعدة البيانات) — ثابت
 * لأنه قيمة مخزَّنة في `geospatial_license_assets.map_integration_protocol`.
 * لا يُغيَّر دون migration. لمنطق الظهور للمستخدم النهائي راجع
 * `VISIBILITY_ALGORITHM` و `onDemandVisibilityDoctrine.ts`.
 */
export const MAP_INTEGRATION_PROTOCOL = 'api_driven_v1' as const;

/**
 * خوارزمية النفاذ الإعلامي للمستخدم — تظهر في شهادة التفعيل وفي مسوّغات
 * عدم الظهور الدائم على الخريطة. هذه قيمة منطقية (doctrine) لا تخزَّن
 * كعمود مستقل في DB، بل تُحقن في `geo_snapshot.visibilityAlgorithm`.
 */
export const VISIBILITY_ALGORITHM = ON_DEMAND_VISIBILITY_ALGO_CODE;

export const SOFTWARE_LICENSE_MANAGER_LABEL_AR =
  'نظام إدارة رخص النفاذ الرقمية' as const;

export const PLATFORM_NAME_AR = 'حلاق ماب' as const;
export const PLATFORM_NAME_EN = 'Halaq Map' as const;

/** اسم الرخصة الرقمية الموحّدة في شهادة التفعيل ولوحة الحلاق. */
export const DIGITAL_LICENSE_OFFICIAL_NAME_AR = ON_DEMAND_VISIBILITY_PRODUCT_NAME_AR;

export const UNIFIED_DIGITAL_LICENSE_LABEL_AR = 'رقم رخصة النفاذ الرقمي الموحد' as const;
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
