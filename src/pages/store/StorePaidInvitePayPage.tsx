/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * دفع بطاقة مناسبة — مغلق حتى يُسعَّر المنتج في ميسر ويُربط بفاتورته.
 */
import { Link } from 'react-router-dom';
import {
  STORE_PAID_INVITE_CHECKOUT_ENABLED,
  STORE_PAID_INVITE_COPY,
} from '@/config/storeIssuedCardsCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StorePaidInvitePayPage() {
  useDocumentTitle('دفع بطاقة مناسبة — halaqmap');

  return (
    <div dir="rtl" className="min-h-[100svh] bg-[#061018] text-[#f4efe4]">
      <main className="mx-auto max-w-lg px-4 py-12">
        <p className="text-sm font-bold text-[#e8c547]">halaqmap</p>
        <h1 className="mt-2 text-2xl font-extrabold">دفع نشر بطاقة المناسبة</h1>
        <p className="mt-3 text-sm leading-7 text-white/70">
          {STORE_PAID_INVITE_CHECKOUT_ENABLED
            ? 'المبلغ يُحدَّد من القالب على الخادم بعد ربط المنتج بفاتورته في ميسر.'
            : STORE_PAID_INVITE_COPY.checkoutClosedAr}
        </p>
        <Link to={ROUTE_PATHS.STORE_INVITES} className="mt-8 inline-block text-sm text-white/50 underline">
          {STORE_PAID_INVITE_COPY.titleAr}
        </Link>
      </main>
    </div>
  );
}
