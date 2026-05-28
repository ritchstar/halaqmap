/** Licensed activity scope — ISIC4 474151 · GaStat (mirrors src/config/legalActivityScope.ts). */
import {
  ISIC_ACTIVITY_CODE,
  ISIC_ACTIVITY_CODE_LABEL_AR,
  ISIC_ACTIVITY_GASTAT_DEFINITION_AR,
  ISIC_ACTIVITY_LABEL_AR,
} from './geospatialLicenseDoctrine.js';

export {
  ISIC_ACTIVITY_CODE,
  ISIC_ACTIVITY_CODE_LABEL_AR,
  ISIC_ACTIVITY_GASTAT_DEFINITION_AR,
  ISIC_ACTIVITY_LABEL_AR,
};

export const LICENSED_ACTIVITY_SCOPE_TITLE_AR = 'نطاق النشاط المرخّص';

export const LICENSED_ACTIVITY_SCOPE_PARAGRAPH_AR =
  `تعمل منصة حلاق ماب بموجب نشاط **${ISIC_ACTIVITY_LABEL_AR}** (${ISIC_ACTIVITY_CODE_LABEL_AR}: **${ISIC_ACTIVITY_CODE}**)، وفق GaStat. ` +
  `${ISIC_ACTIVITY_GASTAT_DEFINITION_AR} ` +
  'المنتج المعروض للبيع إلكترونياً هو رخصة نفاذ رقمية و/أو إضافات برمجية — وليس خدمة حلاقة أو حجزاً أو وساطة تجارية.';

export const LICENSED_ACTIVITY_AI_DOCTRINE_AR =
  `【نطاق النشاط المرخّص — ISIC4 ${ISIC_ACTIVITY_CODE} · GaStat】\n` +
  `- ${ISIC_ACTIVITY_LABEL_AR}\n` +
  `- GaStat: تجارة وعرض وبيع برمجيات حاسوبية جاهزة (Software)\n` +
  `- البيع: رخصة نفاذ رقمية + Add-ons برمجية فقط\n` +
  `- ممنوع وصف المنصة كوسيط حجز أو عمولة حلاقة\n` +
  `- B2C مجاني — B2B مدفوع`;
