/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * زر لوحة التحكم بجانب ملصق الكيو آر: يفتح صفحة إبراز الرمز من الجوال.
 */
import { Link } from 'react-router-dom';
import { STORE_PRODUCT_PASS_COPY, STORE_PRODUCT_PASS_META, type StoreProductPassKind } from '@/config/storeProductPass';
import { passIssuerPath } from '@/lib/storeProductPass';

export function StoreProductPassDeskButton({
  kind,
  token,
  shopName,
  qrStamp,
}: {
  kind: StoreProductPassKind;
  token: string;
  shopName?: string;
  qrStamp?: string;
}) {
  const meta = STORE_PRODUCT_PASS_META[kind];
  const to = passIssuerPath({ kind, token, shopName, qrStamp });
  return (
    <div className="mt-2">
      <Link
        to={to}
        className="flex w-full items-center justify-center rounded-full border py-2 text-sm font-bold"
        style={{ borderColor: `${meta.accent}66`, color: meta.accent }}
      >
        {STORE_PRODUCT_PASS_COPY.deskCtaAr}
      </Link>
      <p className="mt-2 text-center text-xs leading-6 text-white/55">{STORE_PRODUCT_PASS_COPY.deskLeadAr}</p>
    </div>
  );
}
