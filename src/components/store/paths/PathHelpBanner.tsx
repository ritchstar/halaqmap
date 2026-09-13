/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسار مساعدة المتردد — لمن لا يعرف المنتج المناسب بعد. يستخدم رقم واتساب
 * مكتب المؤسس الحقيقي (founderDeskCopy.ts) — نفس خط الدعم المستخدم فعلياً
 * في PartnerSupportChat.tsx وBarberGrowthLanding.tsx، بلا رقم مخترع.
 */
import { FOUNDER_DESK_WHATSAPP_E164 } from '@/config/founderDeskCopy';
import { StorePathEvents } from '@/lib/storePathAnalytics';

const HELP_MESSAGE = 'أحتاج مساعدة في اختيار المنتج المناسب من صفحة المسارات';

export function PathHelpBanner({ id, code }: { id?: string; code?: string }) {
  const href = `https://wa.me/${FOUNDER_DESK_WHATSAPP_E164}?text=${encodeURIComponent(HELP_MESSAGE)}`;
  return (
    <section
      id={id}
      className="rounded-3xl border border-[#bdb5a7] bg-[#f7f4ed] px-5 py-8 text-center sm:px-10"
    >
      <h2 className="text-lg font-extrabold text-[#1f2933] sm:text-xl">
        لست مضطراً لاختيار الحل من أول زيارة
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#566269]">
        ابدأ من طبيعة نشاطك، وتعرّف على المنتجات، ثم اطلب المساعدة في تحديد الخطوة المناسبة.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#1d4f69] px-6 py-3 text-sm font-extrabold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d4f69]"
        onClick={() => StorePathEvents.helpClick(code)}
      >
        ساعدني في اختيار المنتج
      </a>
    </section>
  );
}
