import { NavLink } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib';
import {
  DIGITAL_SOFTWARE_PACKAGES_POLICY_TITLE_AR,
  LEGAL_COMMERCIAL_REGISTRATION_ISSUED_AT_AR,
  LEGAL_ENTITY_TYPE_AR,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  LEGAL_REGISTRATION_ISSUING_AUTHORITY_AR,
  LEGAL_REGISTRATION_STATUS_AR,
  LEGAL_TRADE_NAME_AR,
  LEGAL_UNIFIED_NUMBER_LABEL_AR,
} from '@/config/partnerLegal';
import {
  ISIC_ACTIVITY_CODE,
  ISIC_ACTIVITY_CODE_LABEL_AR,
  ISIC_ACTIVITY_GASTAT_DEFINITION_AR,
  ISIC_ACTIVITY_LABEL_AR,
  ISIC_MOC_ACTIVITY_NAME_AR,
  ISIC_MOC_MAIN_SECTOR_AR,
  ISIC_MOC_SUB_SECTOR_AR,
} from '@/config/legalActivityScope';

type Variant = 'light' | 'dark';

/**
 * بيانات المنشأة الظاهرة للجمهور — تتماشى مع اشتراطات توثيق التجارة الإلكترونية (عرض السجل والسياسات).
 */
export function LegalEntityPublicStrip({ variant = 'light' }: { variant?: Variant }) {
  const muted = variant === 'dark' ? 'text-slate-400' : 'text-muted-foreground';
  const strong = variant === 'dark' ? 'text-slate-100' : 'text-foreground';

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${
        variant === 'dark' ? 'border-white/15 bg-white/5' : 'border-border/60 bg-muted/30'
      }`}
    >
      <p className={`font-medium ${strong}`}>بيانات المنشأة</p>
      <ul className={`mt-2 space-y-1 ${muted}`}>
        <li>
          <span className={strong}>الاسم التجاري:</span> {LEGAL_TRADE_NAME_AR}
        </li>
        <li>
          <span className={strong}>{LEGAL_UNIFIED_NUMBER_LABEL_AR}:</span>{' '}
          <span dir="ltr" className="font-mono">
            {LEGAL_NATIONAL_UNIFIED_NUMBER}
          </span>
        </li>
        <li>
          <span className={strong}>نوع الكيان:</span> {LEGAL_ENTITY_TYPE_AR}
        </li>
        <li>
          <span className={strong}>حالة السجل:</span> {LEGAL_REGISTRATION_STATUS_AR} — {LEGAL_REGISTRATION_ISSUING_AUTHORITY_AR}
        </li>
        <li>
          <span className={strong}>تاريخ إصدار السجل:</span> {LEGAL_COMMERCIAL_REGISTRATION_ISSUED_AT_AR}
        </li>
        <li>
          <span className={strong}>{ISIC_ACTIVITY_CODE_LABEL_AR}:</span> {ISIC_ACTIVITY_CODE} — {ISIC_MOC_ACTIVITY_NAME_AR}
        </li>
        <li>
          <span className={strong}>القطاع الرئيسي (ISIC4):</span> {ISIC_MOC_MAIN_SECTOR_AR}
        </li>
        <li>
          <span className={strong}>القطاع الفرعي (ISIC4):</span> {ISIC_MOC_SUB_SECTOR_AR}
        </li>
      </ul>
      <p className={`mt-3 text-xs leading-relaxed ${muted}`}>{ISIC_ACTIVITY_GASTAT_DEFINITION_AR.replace(/\*\*/g, '')}</p>
      <p className={`mt-2 text-xs ${muted}`}>
        النشاط المرخّص: {ISIC_ACTIVITY_LABEL_AR}. خدمة رقمية: شراء منتج برمجي (رخصة نفاذ و/أو إضافة برمجية) ضمن هذا
        النطاق — لا عمولة على الحلاقة؛ العلاقة مع الصالون مباشرة.
      </p>
      <div className={`mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs ${variant === 'dark' ? 'text-emerald-200/90' : 'text-primary'}`}>
        <NavLink to={ROUTE_PATHS.PRIVACY_DETAILED} className="underline-offset-2 hover:underline">
          سياسة الخصوصية
        </NavLink>
        <NavLink to={ROUTE_PATHS.SUBSCRIPTION_POLICY} className="underline-offset-2 hover:underline">
          {DIGITAL_SOFTWARE_PACKAGES_POLICY_TITLE_AR} والاسترداد والمدفوعات
        </NavLink>
        <NavLink to={ROUTE_PATHS.PARTNER_PRIVACY} className="underline-offset-2 hover:underline">
          خصوصية الشركاء
        </NavLink>
      </div>
    </div>
  );
}
