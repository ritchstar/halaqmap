/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة حظر رابط الضيف إن لم يصدر من لوحة المشتري أو فُتح على جهاز آخر.
 */
export function StoreGuestDeviceBlocked({ productAr }: { productAr: string }) {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-[#050308] px-5 text-[#f4efe4]">
      <div className="max-w-md rounded-2xl border border-white/15 bg-[#0b0a12] p-6">
        <p className="text-sm font-bold tracking-wide text-[#d4a574]">{productAr}</p>
        <h1 className="mt-2 text-2xl font-extrabold">هذه الدعوة محظورة على هذا الجهاز</h1>
        <p className="mt-4 text-sm leading-8 text-white/75">
          روابط المناسبات الخاصة والعائلية لا تُقبل إلا إذا صدرت من لوحة المشتري وأُرسلت من جهازه. كل رابط لمدعو واحد يُربط بجهازه بعد الدخول. إعادة إرسال الرابط من أي مدعو تُحظر برمجياً.
        </p>
        <p className="mt-3 text-sm leading-8 text-white/60">
          حماية الخصوصية الصارمة لعملائنا هي منطلق هذه النماذج: سرية تامة، وأنظمة حماية، ورقابة برمجية صارمة. اطلبوا رابطاً جديداً من صاحب الدعوة. ليست دفتر حضور ولا تتبعاً للمدعوين.
        </p>
      </div>
    </div>
  );
}
