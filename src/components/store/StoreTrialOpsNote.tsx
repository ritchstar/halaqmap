/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ملاحظة تشغيل التجربة على لوحات المنتجات. لا تُستورد من App.
 */
import {
  STORE_PRODUCT_TRIAL_COPY,
  STORE_PRODUCT_TRIAL_PRODUCTS,
  type StoreProductTrialKey,
} from '@/config/storeProductTrial';

export function StoreTrialOpsNote({ productKey }: { productKey: StoreProductTrialKey }) {
  const copy = STORE_PRODUCT_TRIAL_PRODUCTS[productKey];
  return (
    <div className="rounded-2xl border border-amber-300/25 bg-amber-400/8 px-4 py-3 text-sm leading-7 text-amber-50">
      <p className="font-extrabold">{copy.titleAr}</p>
      <p className="mt-1">{copy.deskNoteAr}</p>
    </div>
  );
}

export function StoreTrialGiftEnded({ titleAr }: { titleAr: string }) {
  return (
    <div className="px-4 pt-[28svh] text-center">
      <h1 className="text-2xl font-extrabold text-white">{titleAr}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-white/75">{STORE_PRODUCT_TRIAL_COPY.giftEndedAr}</p>
    </div>
  );
}
