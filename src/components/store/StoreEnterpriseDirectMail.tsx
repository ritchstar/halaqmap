/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * جملة تعامل المنشآت المباشر عبر بريد الإدارة. لا تُدرج في كاردي8.
 */
import { STORE_ENTERPRISE_DIRECT } from '@/config/storeEnterpriseDirect';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  linkClassName?: string;
  productTitleAr?: string;
};

export function StoreEnterpriseDirectMail({ className, linkClassName, productTitleAr }: Props) {
  const subject = productTitleAr
    ? `${STORE_ENTERPRISE_DIRECT.subjectAr} — ${productTitleAr}`
    : STORE_ENTERPRISE_DIRECT.subjectAr;
  return (
    <p className={cn('text-sm leading-7 text-white/70', className)}>
      {STORE_ENTERPRISE_DIRECT.lineAr}{' '}
      <a
        className={cn('underline', linkClassName)}
        href={`mailto:${STORE_ENTERPRISE_DIRECT.email}?subject=${encodeURIComponent(subject)}`}
      >
        <code dir="ltr">{STORE_ENTERPRISE_DIRECT.email}</code>
      </a>
    </p>
  );
}
