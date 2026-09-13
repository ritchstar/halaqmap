/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مقدمة صفحة المسارات — العنوان والرسالة الأساسية وزرا الدعوة.
 */
export function PathsHero({
  onExplore,
  onHelp,
}: {
  onExplore: () => void;
  onHelp: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#bdb5a7] bg-[#fffaf4] px-5 py-10 text-center sm:px-10 sm:py-14">
      <p className="text-xs font-bold tracking-wide text-[#566269]">خريطة الحل — منظومة تشغيل رقمية متخصصة لمهنتك</p>
      <h1 className="mt-3 text-balance text-2xl font-extrabold leading-snug text-[#1f2933] sm:text-4xl">
        اختر مسار مهنتك، وابدأ بمنتج صُمم لطبيعة عملك
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#566269] sm:text-base">
        لكل مهنة طريقة مختلفة في التشغيل والوصول إلى الزبائن. استعرض المسارات، وتعرّف على المنتج المناسب قبل أن تبدأ.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onExplore}
          className="min-h-11 rounded-full bg-[#b84c3a] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b84c3a]"
        >
          استكشف المسارات
        </button>
        <button
          type="button"
          onClick={onHelp}
          className="min-h-11 rounded-full border border-[#1d4f69] px-6 py-3 text-sm font-extrabold text-[#1d4f69] transition hover:bg-[#1d4f69]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d4f69]"
        >
          ساعدني في الاختيار
        </button>
      </div>
    </section>
  );
}
