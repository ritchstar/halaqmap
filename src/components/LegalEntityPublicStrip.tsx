import { NavLink } from 'react-router-dom';

import { ROUTE_PATHS } from '@/lib';

import {
  DIGITAL_SOFTWARE_PACKAGES_POLICY_TITLE_AR,
  LEGAL_COMMERCIAL_REGISTRATION_ISSUED_AT_AR,
  LEGAL_ECOMMERCE_AUTH_ISSUER_AR,
  LEGAL_ECOMMERCE_AUTH_STATUS_LINE_AR,
  LEGAL_ECOMMERCE_AUTH_NUMBER,
  LEGAL_ECOMMERCE_AUTH_STATUS_AR,
  LEGAL_ENTITY_TYPE_AR,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  LEGAL_REGISTRATION_ISSUING_AUTHORITY_AR,
  LEGAL_REGISTRATION_STATUS_AR,
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

  const cardClass =
    variant === 'dark'
      ? 'border-white/10 bg-white/[0.04]'
      : 'border-border/50 bg-background/70';

  const detailRows = [
    { label: LEGAL_UNIFIED_NUMBER_LABEL_AR, value: LEGAL_NATIONAL_UNIFIED_NUMBER, mono: true },
    { label: 'رقم توثيق التجارة الإلكترونية', value: `${LEGAL_ECOMMERCE_AUTH_NUMBER} (${LEGAL_ECOMMERCE_AUTH_STATUS_AR})`, mono: true },
    { label: 'جهة توثيق التجارة الإلكترونية', value: LEGAL_ECOMMERCE_AUTH_ISSUER_AR, mono: false },
    { label: 'حالة توثيق التجارة الإلكترونية', value: LEGAL_ECOMMERCE_AUTH_STATUS_LINE_AR, mono: false },
    { label: 'نوع الكيان', value: LEGAL_ENTITY_TYPE_AR, mono: false },
    { label: 'حالة السجل', value: `${LEGAL_REGISTRATION_STATUS_AR} — ${LEGAL_REGISTRATION_ISSUING_AUTHORITY_AR}`, mono: false },
    { label: 'تاريخ إصدار السجل', value: LEGAL_COMMERCIAL_REGISTRATION_ISSUED_AT_AR, mono: false },
    { label: ISIC_ACTIVITY_CODE_LABEL_AR, value: `${ISIC_ACTIVITY_CODE} — ${ISIC_MOC_ACTIVITY_NAME_AR}`, mono: false },
    { label: 'القطاع الرئيسي (ISIC4)', value: ISIC_MOC_MAIN_SECTOR_AR, mono: false },
    { label: 'القطاع الفرعي (ISIC4)', value: ISIC_MOC_SUB_SECTOR_AR, mono: false },
  ] as const;



  return (

    <div

      className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${

        variant === 'dark' ? 'border-white/15 bg-white/5' : 'border-border/60 bg-muted/30'

      }`}

    >

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={`font-medium ${strong}`}>بيانات المنشأة</p>
        <p className={`text-xs ${muted}`}>إفصاح نظامي مختصر</p>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {detailRows.map((row) => (
          <div key={row.label} className={`rounded-lg border px-3 py-3 ${cardClass}`}>
            <p className={`text-xs font-medium ${muted}`}>{row.label}</p>
            <p
              className={`mt-1 text-sm leading-7 ${strong} ${row.mono ? 'font-mono tracking-wide' : ''}`}
              dir={row.mono ? 'ltr' : 'rtl'}
            >
              {row.value}
            </p>
          </div>
        ))}
      </div>

      <div className={`mt-3 rounded-lg border px-3 py-3 text-xs leading-relaxed ${cardClass} ${muted}`}>
        {ISIC_ACTIVITY_GASTAT_DEFINITION_AR.replace(/\*\*/g, '')}
      </div>

      <p className={`mt-3 text-xs leading-relaxed ${muted}`}>

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


