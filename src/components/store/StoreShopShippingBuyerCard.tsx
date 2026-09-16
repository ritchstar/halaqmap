/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقة معلومات الشحن خارج النطاق للعميل — قيم المشغّل + إخلاء مسؤولية المنصة.
 */
import {
  SHOP_SHIPPING_DISCLAIMER_AR,
  type ShopShippingProfile,
} from '@/lib/storeShopShipping';

export function StoreShopShippingBuyerCard({
  profile,
  leadAr,
}: {
  profile: ShopShippingProfile;
  leadAr: string;
}) {
  return (
    <div className="mt-4 space-y-3 rounded-xl border border-[#dac8aa] bg-[#f3e6cf] p-4 text-right">
      <p className="text-sm leading-7 text-[#6f6250]">{leadAr}</p>
      <dl className="space-y-2 text-sm text-[#2e2418]">
        {profile.shippingCarrierAr ? (
          <div>
            <dt className="font-bold text-[#6f4a26]">طريقة الشحن</dt>
            <dd className="mt-0.5 leading-6">{profile.shippingCarrierAr}</dd>
          </div>
        ) : null}
        {profile.shippingPriceAr ? (
          <div>
            <dt className="font-bold text-[#6f4a26]">السعر أو طريقة حسابه</dt>
            <dd className="mt-0.5 leading-6">{profile.shippingPriceAr}</dd>
          </div>
        ) : null}
        {profile.shippingEtaAr ? (
          <div>
            <dt className="font-bold text-[#6f4a26]">المدة المتوقعة</dt>
            <dd className="mt-0.5 leading-6">{profile.shippingEtaAr}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-bold text-[#6f4a26]">الدفع عند الاستلام</dt>
          <dd className="mt-0.5 leading-6">
            {profile.shippingCodAllowed ? 'متاح عبر شركة الشحن التي يتعامل معها النشاط' : 'غير معلن عبر شركة الشحن'}
          </dd>
        </div>
        {profile.shippingNotesAr ? (
          <div>
            <dt className="font-bold text-[#6f4a26]">ملاحظات</dt>
            <dd className="mt-0.5 leading-6 whitespace-pre-wrap">{profile.shippingNotesAr}</dd>
          </div>
        ) : null}
      </dl>
      <p role="note" className="border-t border-[#dac8aa] pt-3 text-xs leading-6 text-[#6f4a26]">
        {SHOP_SHIPPING_DISCLAIMER_AR}
      </p>
    </div>
  );
}
