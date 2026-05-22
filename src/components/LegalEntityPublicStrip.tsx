import { NavLink } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib';
import {
  DIGITAL_SOFTWARE_PACKAGES_POLICY_TITLE_AR,
  LEGAL_NATIONAL_UNIFIED_NUMBER,
  LEGAL_TRADE_NAME_AR,
  getLegalCommercialRegistrationDisplay,
} from '@/config/partnerLegal';

type Variant = 'light' | 'dark';

/**
 * بيانات المنشأة الظاهرة للجمهور — تتماشى مع اشتراطات توثيق التجارة الإلكترونية (عرض السجل والسياسات).
 * لا تُعرض متغيرات بيئة أو تفاصيل تقنية.
 */
export function LegalEntityPublicStrip({ variant = 'light' }: { variant?: Variant }) {
  const commercialReg = getLegalCommercialRegistrationDisplay();
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
          <span className={strong}>الرقم الوطني الموحد:</span> {LEGAL_NATIONAL_UNIFIED_NUMBER}
        </li>
        {commercialReg ? (
          <li>
            <span className={strong}>رقم السجل التجاري:</span> {commercialReg}
          </li>
        ) : null}
      </ul>
      <p className={`mt-3 text-xs ${muted}`}>
        خدمة رقمية: شراء حزمة الرخصة والإدراج على المنصة يتم إلكترونياً. التواصل مع صالونك يكون مباشرة بينك وبين الصالون؛ لا
        تطالبك المنصة بأي عمولات على الحلاقة أو مواعيدها نهائياً؛ المنصة تخدم المستخدم مجاناً بشرط السماح برصد موقعه برمجياً
        وتفعيل الخيارات أمامه.
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
