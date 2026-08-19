/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { StoreServiceRequestForm } from '@/components/store/StoreServiceRequestForm';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import { STORE_LANDING_COPY } from '@/config/storeFront';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function StoreRequestPage() {
  useDocumentTitle(`${STORE_LANDING_COPY.latinMark} — طلب خدمة`);

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <section className="px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/12 bg-[#0b1a24]/80 p-5 md:p-6">
          <h1 className="text-3xl font-extrabold">{STORE_LANDING_COPY.requestTitle}</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{STORE_LANDING_COPY.requestLead}</p>
          <div className="mt-6">
            <StoreServiceRequestForm source="store-request" />
          </div>
        </div>
      </section>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
