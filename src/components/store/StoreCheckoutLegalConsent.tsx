/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { storeCheckoutConsentLabelAr } from '@/lib/storePurchaseLegalConsent';
import { cn } from '@/lib/utils';

type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  includeDirectPay?: boolean;
  className?: string;
  id?: string;
};

export function StoreCheckoutLegalConsent({
  checked,
  onChange,
  includeDirectPay = false,
  className,
  id = 'store-checkout-legal-consent',
}: Props) {
  return (
    <label className={cn('flex items-start gap-2 text-sm leading-7', className)}>
      <input
        id={id}
        type="checkbox"
        className="mt-1"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        {storeCheckoutConsentLabelAr({ includeDirectPay })}{' '}
        <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className="underline underline-offset-2">
          شروط المتجر
        </Link>
        {includeDirectPay ? (
          <>
            {' '}
            و{' '}
            <Link to={ROUTE_PATHS.STORE_DIRECT_PAY_POLICY} className="underline underline-offset-2">
              سياسة الدفع المباشر
            </Link>
          </>
        ) : null}
        .
      </span>
    </label>
  );
}
