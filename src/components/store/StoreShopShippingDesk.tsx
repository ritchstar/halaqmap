/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إعدادات الشحن خارج النطاق — حقول حرة يملؤها المشغّل، بلا ربط شركات من المنصة.
 */
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  SHOP_SHIPPING_DISCLAIMER_AR,
  type ShopShippingProfile,
} from '@/lib/storeShopShipping';

export function StoreShopShippingDesk({
  value,
  onChange,
  accent,
}: {
  value: ShopShippingProfile;
  onChange: (next: ShopShippingProfile) => void;
  accent: string;
}) {
  function patch(partial: Partial<ShopShippingProfile>) {
    onChange({
      ...value,
      ...partial,
      shippingUpdatedAt: new Date().toISOString(),
    });
  }

  return (
    <section>
      <h3 className="font-extrabold text-[#2e2418]">الشحن خارج النطاق</h3>
      <p className="mt-2 text-sm leading-7 text-[#79674f]">
        صفّ لعملائك خارج النطاق طريقتك في الشحن. المنصة تعرض الحقول فقط؛ الاتفاق والتنفيذ بينك وبين العميل مباشرة.
      </p>

      <label className="mt-5 flex items-start gap-3 text-sm font-bold text-[#2e2418]">
        <input
          type="checkbox"
          checked={value.shippingEnabled}
          onChange={(e) => patch({ shippingEnabled: e.target.checked })}
          className="mt-1 size-4"
          style={{ accentColor: accent }}
        />
        <span>تفعيل الشحن لهذا النشاط</span>
      </label>

      <div className={`mt-5 space-y-4 ${value.shippingEnabled ? '' : 'pointer-events-none opacity-55'}`}>
        <label className="block text-xs font-bold text-[#6f6250]">
          اسم شركة الشحن أو طريقتك الخاصة
          <Input
            value={value.shippingCarrierAr}
            onChange={(e) => patch({ shippingCarrierAr: e.target.value.slice(0, 80) })}
            className="mt-2 h-11 border-[#dac8aa] bg-white"
            maxLength={80}
            placeholder="مثال: شركة شحن محلية / توصيل عبر وسيط"
          />
        </label>
        <label className="block text-xs font-bold text-[#6f6250]">
          السعر أو طريقة حسابه
          <Input
            value={value.shippingPriceAr}
            onChange={(e) => patch({ shippingPriceAr: e.target.value.slice(0, 120) })}
            className="mt-2 h-11 border-[#dac8aa] bg-white"
            maxLength={120}
            placeholder="مثال: ثابت ٢٥ ر.س / حسب المدينة / حسب الوزن"
          />
        </label>
        <label className="block text-xs font-bold text-[#6f6250]">
          المدة المتوقعة للوصول
          <Input
            value={value.shippingEtaAr}
            onChange={(e) => patch({ shippingEtaAr: e.target.value.slice(0, 80) })}
            className="mt-2 h-11 border-[#dac8aa] bg-white"
            maxLength={80}
            placeholder="مثال: يومان إلى أربعة أيام عمل"
          />
        </label>
        <label className="flex items-start gap-3 text-sm font-bold text-[#2e2418]">
          <input
            type="checkbox"
            checked={value.shippingCodAllowed}
            onChange={(e) => patch({ shippingCodAllowed: e.target.checked })}
            className="mt-1 size-4"
            style={{ accentColor: accent }}
          />
          <span>الدفع عند الاستلام متاح عبر هذه الشركة</span>
        </label>
        <label className="block text-xs font-bold text-[#6f6250]">
          ملاحظات إضافية للعميل
          <Textarea
            value={value.shippingNotesAr}
            onChange={(e) => patch({ shippingNotesAr: e.target.value.slice(0, 400) })}
            className="mt-2 min-h-24 border-[#dac8aa] bg-white"
            maxLength={400}
            placeholder="أي تفاصيل يحتاجها العميل قبل الطلب"
          />
        </label>
      </div>

      <p
        role="note"
        className="mt-5 rounded-xl border border-[#dac8aa] bg-[#f3e6cf] p-4 text-sm leading-7 text-[#6f4a26]"
      >
        {SHOP_SHIPPING_DISCLAIMER_AR}
      </p>
    </section>
  );
}
