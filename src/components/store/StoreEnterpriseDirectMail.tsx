/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * جملة مراسلة المنشآت عبر بريد الإدارة — فوتر واجهة المتجر فقط.
 */
import { STORE_ENTERPRISE_DIRECT } from '@/config/storeEnterpriseDirect';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  linkClassName?: string;
};

export function StoreEnterpriseDirectMail({ className, linkClassName }: Props) {
  return (
    <p className={cn('text-sm leading-7 text-white/70', className)}>
      {STORE_ENTERPRISE_DIRECT.lineAr}{' '}
      <a
        className={cn('underline', linkClassName)}
        href={`mailto:${STORE_ENTERPRISE_DIRECT.email}?subject=${encodeURIComponent(STORE_ENTERPRISE_DIRECT.subjectAr)}`}
      >
        <code dir="ltr">{STORE_ENTERPRISE_DIRECT.email}</code>
      </a>
    </p>
  );
}
