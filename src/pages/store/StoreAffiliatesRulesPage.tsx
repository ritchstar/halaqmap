/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { STORE_AFFILIATE_COPY, STORE_AFFILIATE_RULES_SECTIONS, STORE_AFFILIATE_RULES_VERSION } from '@/config/storeAffiliateLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { StoreAffiliatesChrome } from '@/pages/store/StoreAffiliatesChrome';

export default function StoreAffiliatesRulesPage() {
  useDocumentTitle(STORE_AFFILIATE_COPY.homeRulesCtaAr);

  return (
    <StoreAffiliatesChrome>
      <div className="text-center">
        <h1 className="text-3xl font-black text-white">{STORE_AFFILIATE_COPY.homeRulesCtaAr}</h1>
        <p className="mt-3 text-xs text-slate-500">نسخة القواعد: {STORE_AFFILIATE_RULES_VERSION}</p>
      </div>
      <div className="space-y-4">
        {STORE_AFFILIATE_RULES_SECTIONS.map((section) => (
          <section key={section.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
            <h2 className="text-lg font-extrabold text-white">{section.titleAr}</h2>
            <p dir="rtl" className="chat-arabic-text mt-2 text-sm leading-8 text-slate-300">
              {section.bodyAr}
            </p>
          </section>
        ))}
      </div>
    </StoreAffiliatesChrome>
  );
}
