/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نص توضيحي أسفل بحث صفحة المسارات — يوضح دور المنصة والمشغّل بلا وعد بنتائج.
 */
const PARAGRAPHS = [
  'توفر منصة خريطة الحل منتجات برمجية متخصصة واستضافة سحابية تساعدك على تشغيل نشاطك وتسويقه بطريقة أوضح وأقرب إلى واقع مهنتك.',
  'منتجاتنا لا تتحرك من تلقاء نفسها، ولا تستبدل المشغّل؛ أنت من يحدّث منتجاتك، يدير متجرك، يتواصل مع عملائك، ويتلقى المدفوعات مباشرة. ونحن نوفر لك البنية والأدوات التي تختصر المسافات التشغيلية والتسويقية، وتمنح نشاطك حضورًا رقميًا أكثر تنظيمًا.',
  'لا نعدك بنتائج مضمونة، لأن النمو يعتمد على نشاطك وجودة ما تقدمه وطريقة تشغيلك واستجابتك للسوق. لكننا نمنحك وسيلة أفضل للوصول والعمل.',
  'فإذا كان الوصول إلى مكان يبعد 40 كيلومترًا مشيًا قد يستغرق ست أو سبع ساعات، فإن المركبة المجهزة تختصر الطريق إلى نحو نصف ساعة. أنت من يقودها، لكنها تساعدك على الوصول بوقت وجهد أقل.',
] as const;

const CLOSING = [
  'من هذا المنطلق صُممت منتجات خريطة الحل.',
  'خريطة الحل لا تبيع نتائج جاهزة؛ بل تبيع مركبة رقمية متخصصة، والمشغّل هو من يقودها.',
  'أدوات متخصصة تختصر المسافات التشغيلية والتسويقية، وتترك القيادة للمشغّل.',
] as const;

export function PathsPlatformIntro() {
  return (
    <section
      aria-label="تعريف منصة خريطة الحل في صفحة المسارات"
      className="mx-auto max-w-3xl rounded-2xl border border-[#bdb5a7] bg-[#fffdf8] px-5 py-6 text-start sm:px-7 sm:py-7"
    >
      <div className="space-y-4 text-sm leading-8 text-[#3d3226] sm:text-base sm:leading-8">
        {PARAGRAPHS.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-5 space-y-3 border-t border-[#dac8aa] pt-5">
        {CLOSING.map((line, index) => (
          <p
            key={line}
            className={
              index === 1
                ? 'text-base font-extrabold leading-8 text-[#1f2933] sm:text-lg'
                : 'text-sm font-bold leading-7 text-[#2e2418] sm:text-base sm:leading-8'
            }
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
