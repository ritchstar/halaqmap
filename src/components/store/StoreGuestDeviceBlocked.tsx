/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة حظر رابط الضيف إن لم يصدر من لوحة المضيف أو أُعيد استخدامه.
 */
export function StoreGuestDeviceBlocked({
  productAr,
  hostAr = 'المضيف',
}: {
  productAr: string;
  hostAr?: string;
}) {
  const askAr =
    hostAr === 'المضيفة'
      ? 'اطلبي من المضيفة أن تزوّدك برابط خاص.'
      : 'اطلب من المضيف أن يزوّدك برابط خاص.';

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-[#050308] px-5 text-[#f4efe4]">
      <div className="max-w-md rounded-2xl border border-white/15 bg-[#0b0a12] p-6">
        <p className="text-sm font-bold tracking-wide text-[#d4a574]">{productAr}</p>
        <h1 className="mt-2 text-2xl font-extrabold">عذراً، غير مسموح قانونياً عرض هذه الدعوة.</h1>
        <p className="mt-4 text-sm leading-8 text-white/75">
          هذا الرابط معاد استخدامه طبقاً لسياسات الخصوصية، وقد حُظر الرابط. {askAr}
        </p>
        <p className="mt-3 text-sm leading-8 text-white/60">
          <code>halaqmap</code> خريطة الحل
        </p>
      </div>
    </div>
  );
}
