/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import {
  STORE_DIRECT_PAY_POLICY_SECTIONS,
  STORE_DIRECT_PAY_POLICY_SUBTITLE_AR,
  STORE_DIRECT_PAY_POLICY_TITLE_AR,
  STORE_DIRECT_PAY_POLICY_VERSION,
} from '@/config/storeDirectPayLegal';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { renderLegalContentBlocks } from '@/lib/legalPageRender';
import { ROUTE_PATHS } from '@/lib/routePaths';

export default function StoreDirectPayPolicyPage() {
  useDocumentTitle(STORE_DIRECT_PAY_POLICY_TITLE_AR);
  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-bold tracking-wide text-[#e8c547]">halaqmap · خريطة الحل</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#f4efe4]">{STORE_DIRECT_PAY_POLICY_TITLE_AR}</h1>
        <p className="mt-3 text-sm leading-7 text-white/75">{STORE_DIRECT_PAY_POLICY_SUBTITLE_AR}</p>
        <p className="mt-2 text-xs text-white/45">نسخة السياسات: {STORE_DIRECT_PAY_POLICY_VERSION}</p>
        <p className="mt-3 text-sm leading-7 text-white/70">
          تُقرأ مع{' '}
          <Link to={ROUTE_PATHS.STORE_ISSUED_CARDS_LEGAL} className="text-[#e8c547] underline">
            شروط شراء منتجات المتجر
          </Link>
          .
        </p>
        <div className="mt-8 space-y-4">
          {STORE_DIRECT_PAY_POLICY_SECTIONS.map((section) => (
            <article key={section.id} id={section.id} className="rounded-2xl border border-white/10 bg-[#0b1a24]/80 p-5">
              <h2 className="text-lg font-bold text-[#f4efe4]">{section.title}</h2>
              <div className="partner-legal-prose mt-3 max-w-none">{renderLegalContentBlocks(section.content)}</div>
            </article>
          ))}
        </div>
      </main>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
