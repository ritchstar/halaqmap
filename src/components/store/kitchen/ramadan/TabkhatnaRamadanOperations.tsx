/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * القسم E — تنظيم ما يمكن تقديمه. ممنوع ذكر «استقبال آلي لكل الطلبات»
 * أو «توصيل» أو «إدارة كاملة» ما لم تكن مثبتة فعلياً في المنتج — النص
 * أدناه منقول حرفياً من المستند وهو خالٍ من ذلك أصلاً.
 */
import { StoreShot } from '@/components/store/StoreShot';

export interface TabkhatnaRamadanOperationsProps {
  titleAr: string;
  bodyAr: string;
  imageSrc: string;
  imageAltAr: string;
}

export function TabkhatnaRamadanOperations({ titleAr, bodyAr, imageSrc, imageAltAr }: TabkhatnaRamadanOperationsProps) {
  return (
    <section className="grid items-center gap-6 rounded-2xl border border-[#3d8b4a]/20 bg-[#faf6ec] p-5 lg:grid-cols-[0.95fr_1.05fr] lg:p-7">
      <figure className="order-1 overflow-hidden rounded-2xl border border-[#3d8b4a]/15 bg-[#fdfaf1] lg:order-1">
        <StoreShot src={imageSrc} alt={imageAltAr} className="aspect-[4/3] w-full" />
      </figure>
      <div className="order-2">
        <h2 className="text-2xl font-extrabold text-[#234226]">{titleAr}</h2>
        <p className="mt-3 text-sm leading-7 text-[#3f3527]/85 md:text-base md:leading-8">{bodyAr}</p>
      </div>
    </section>
  );
}
