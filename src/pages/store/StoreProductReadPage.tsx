/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صفحة القراءة الموحّدة لمنتجات المتجر — تُعرض عبر المسارات /*.../read.
 * كل منتج منشور له مسار /read مستقل يرتبط بزر «اقرأ عن المنتج» في صفحة الشراء.
 * حلانا1 مستثنى حتى الاعتماد. لا تُستورد من App مباشرة.
 */
import { useMemo } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { StoreVisitorFooter, StoreVisitorHeader, StoreVisitorShell } from '@/components/store/StoreChrome';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { storeProductReadByPath } from '@/config/storeProductRead';
import { StoreSaipTrustLine } from '@/components/store/StoreSaipTrustLine';

export default function StoreProductReadPage() {
  const { pathname } = useLocation();
  const entry = useMemo(() => storeProductReadByPath(pathname), [pathname]);
  useDocumentTitle(entry?.documentTitle ?? 'خريطة الحل');

  if (!entry) {
    return <Navigate to={ROUTE_PATHS.STORE_LANDING} replace />;
  }

  const accent = entry.accent;

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />

      {/* Hero */}
      <section className="px-4 py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <p
            className="text-sm font-bold uppercase tracking-widest"
            style={{ color: accent }}
          >
            {entry.kickerAr}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
            {entry.titleAr}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/78">
            {entry.metaDescriptionAr}
          </p>
          {entry.saipProductId ? <StoreSaipTrustLine productId={entry.saipProductId} /> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={entry.buyPath}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-[#0e1a12] transition-opacity hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              {entry.buyCtaAr}
              <ArrowRight className="h-4 w-4 rotate-180" />
            </Link>
            <Link
              to={ROUTE_PATHS.STORE_LANDING}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/5"
            >
              جميع المنتجات
            </Link>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="px-4 pb-10">
        <div className="mx-auto max-w-3xl space-y-8">
          {entry.sections.map((s) => (
            <div key={s.headingAr}>
              <h2
                className="text-lg font-bold"
                style={{ color: accent }}
              >
                {s.headingAr}
              </h2>
              <p className="mt-2 text-base leading-8 text-white/80" dir="rtl">
                {s.bodyAr}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      {entry.tableRows && entry.tableHeader && (
        <section className="px-4 pb-10">
          <div className="mx-auto max-w-3xl overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 text-right font-semibold text-white/60">العنصر</th>
                  <th className="px-4 py-3 text-center font-semibold" style={{ color: accent }}>
                    {entry.tableHeader.product}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-white/60">
                    {entry.tableHeader.other}
                  </th>
                </tr>
              </thead>
              <tbody>
                {entry.tableRows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 last:border-0 odd:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 text-right text-white/75">{row.label}</td>
                    <td className="px-4 py-3 text-center text-white/90">{row.product}</td>
                    <td className="px-4 py-3 text-center text-white/50">{row.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* FAQs */}
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-xl font-bold">أسئلة شائعة</h2>
          <dl className="space-y-5">
            {entry.faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <dt className="font-semibold text-white/90">{faq.q}</dt>
                <dd className="mt-2 text-sm leading-7 text-white/72" dir="rtl">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="px-4 pb-16 text-center">
        <Link
          to={entry.buyPath}
          className="inline-flex items-center gap-2 rounded-xl px-7 py-4 text-base font-bold text-[#0e1a12] transition-opacity hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          {entry.buyCtaAr}
          <ArrowRight className="h-4 w-4 rotate-180" />
        </Link>
      </section>

      {/* JSON-LD FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: entry.faqJsonLd }}
      />

      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
