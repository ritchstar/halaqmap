/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * "كل مسار يقود إلى منظومة تشغيل متكاملة" — مكونات مشتركة تحقّقنا من وجودها
 * فعلياً في الكود (StoreLiveShopShareDesk، StoreDeskArchiveDock، ساعات العمل)
 * بدل عرضها كميزة عامة غير مثبتة.
 */
const SHARED_ITEMS = [
  { titleAr: 'صفحة خاصة للزبائن', leadAr: 'رابط مستقل يعرض عرضك وهويتك.' },
  { titleAr: 'لوحة تشغيل', leadAr: 'إدارة الطلبات والعرض من الجوال.' },
  { titleAr: 'رابط خاص ورمز QR', leadAr: 'مشاركة سريعة عند نقطة البيع أو المتابعة.' },
  { titleAr: 'ساعات عمل واضحة', leadAr: 'يعرف الزبون متى يفتح نشاطك ومتى يغلق.' },
] as const;

export function SharedDeliverablesSection() {
  return (
    <section className="rounded-3xl border border-[#bdb5a7] bg-[#fffaf4] px-5 py-10 sm:px-10">
      <h2 className="text-center text-lg font-extrabold text-[#1f2933] sm:text-xl">
        أدوات تظهر عندما تكون ضمن المنتج
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-7 text-[#566269]">
        الصفحة واللوحة والرابط والرمز ليست وعداً لكل المسارات. صفحة كل منتج تذكر ما هو مثبت فيه فقط.
      </p>
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHARED_ITEMS.map((item) => (
          <div key={item.titleAr} className="rounded-2xl border border-[#bdb5a7] bg-[#fffdf8] p-4 text-center">
            <p className="text-sm font-extrabold text-[#1f2933]">{item.titleAr}</p>
            <p className="mt-1.5 text-xs leading-6 text-[#566269]">{item.leadAr}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
