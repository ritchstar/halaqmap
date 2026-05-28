/** Software License Manager doctrine — ISIC4 retail sale of software (474151). */
import {
  ON_DEMAND_VISIBILITY_ALGO_CODE,
  ON_DEMAND_VISIBILITY_PRODUCT_NAME_AR,
} from './onDemandVisibilityDoctrine.js';

export const ISIC_ACTIVITY_CODE = '474151' as const;

/** GaStat · ISIC4 */
export const ISIC_ACTIVITY_LABEL_AR = 'البيع بالتجزئة للبرمجيات (ISIC4 474151)' as const;

export const ISIC_MOC_ACTIVITY_NAME_AR = 'البيع بالتجزئة للبرمجيات' as const;
export const ISIC_MOC_MAIN_SECTOR_AR =
  'تجارة الجملة والتجزئة وإصلاح المركبات ذات المحركات والدرجات النارية' as const;
export const ISIC_MOC_SUB_SECTOR_AR =
  'بيع الحواسيب والمعدات الطرفية للحواسيب، والبرمجيات، ومعدات الاتصالات بالتجزئة في المتاجر المتخصصة' as const;

export const ISIC_ACTIVITY_GASTAT_DEFINITION_AR =
  `${ISIC_ACTIVITY_CODE} هو رمز ISIC4 لنشاط البيع بالتجزئة للبرمجيات — تجارة وعرض وبيع برمجيات حاسوبية جاهزة (Software).` as const;

export const GEOSPATIAL_LICENSE_ASSET_CLASS = 'Geospatial_License_Asset' as const;

/** بروتوكول الربط الفني — قيمة DB ثابتة، لا تُغيَّر دون migration. */
export const MAP_INTEGRATION_PROTOCOL = 'api_driven_v1' as const;

/** خوارزمية النفاذ الإعلامي (doctrine layer) — تُحقن في geo_snapshot. */
export const VISIBILITY_ALGORITHM = ON_DEMAND_VISIBILITY_ALGO_CODE;

export const SOFTWARE_LICENSE_MANAGER_LABEL_AR =
  'نظام إدارة رخص النفاذ الرقمية' as const;

export const PLATFORM_NAME_AR = 'حلاق ماب' as const;
export const PLATFORM_NAME_EN = 'Halaq Map' as const;

export const DIGITAL_LICENSE_OFFICIAL_NAME_AR = ON_DEMAND_VISIBILITY_PRODUCT_NAME_AR;

export const UNIFIED_DIGITAL_LICENSE_LABEL_AR = 'رقم رخصة النفاذ الرقمي الموحد' as const;
export const ISIC_ACTIVITY_CODE_LABEL_AR = 'كود النشاط ISIC4' as const;
export const BARBER_NAME_LABEL_AR = 'اسم الحلاق / الصالون' as const;

export type MapIntegrationStatus = 'pending_geospatial_bind' | 'map_live';
export type GeospatialAssetStatus = 'pending_activation' | 'map_live' | 'suspended' | 'expired';

export type DigitalActivationCertificatePayload = {
  certificateNumber: string;
  publicToken: string;
  isicCode: typeof ISIC_ACTIVITY_CODE;
  productClass: typeof GEOSPATIAL_LICENSE_ASSET_CLASS;
  tier: string;
  tierLabelAr: string;
  issuedAt: string;
  validUntil: string;
  mapIntegrationStatus: MapIntegrationStatus;
  mapIntegrationProtocol: typeof MAP_INTEGRATION_PROTOCOL;
  assetStatus: GeospatialAssetStatus;
  geoSnapshot: Record<string, unknown>;
  verifyPath: string;
};
