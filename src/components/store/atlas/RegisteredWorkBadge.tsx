/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * شارة المصنف المسجّل. خضارنا1 فقط في نموذج الأطلس.
 */
import { STORE_SAIP_COPY, storeSaipWorkById } from '@/config/storeSaipRegistry';

export function RegisteredWorkBadge({ productId = 'produce' }: { productId?: 'produce' }) {
  const work = storeSaipWorkById(productId);
  if (!work) return null;
  return (
    <p className="store-atlas__chip inline-flex min-h-11 items-center px-3 text-sm font-bold text-[var(--atlas-teal)]">
      {STORE_SAIP_COPY.certLabelAr} {work.certificateNo}
    </p>
  );
}
