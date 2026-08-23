/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Link } from 'react-router-dom';
import {
  STORE_AFFILIATE_COPY,
  STORE_AFFILIATE_LINES,
  affiliateNetSar,
} from '@/config/storeAffiliateLive';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { StoreAffiliatesChrome } from '@/pages/store/StoreAffiliatesChrome';

export default function StoreAffiliatesHomePage() {
  useDocumentTitle(STORE_AFFILIATE_COPY.documentTitle);

  return (
    <StoreAffiliatesChrome>
      <div className="text-center">
        <p className="text-xs font-bold tracking-[0.14em] text-teal-300">{STORE_AFFILIATE_COPY.kickerAr}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-white">{STORE_AFFILIATE_COPY.titleAr}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">{STORE_AFFILIATE_COPY.leadAr}</p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300">{STORE_AFFILIATE_COPY.storeLeadAr}</p>
        <p className="mx-auto mt-3 max-w-xl rounded-2xl border border-amber-300/25 bg-amber-400/5 px-4 py-3 text-sm leading-7 text-amber-100">
          {STORE_AFFILIATE_COPY.reviewLeadAr}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-white">{STORE_AFFILIATE_COPY.tableTitleAr}</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[36rem] text-right text-sm">
            <thead className="bg-white/[0.04] text-slate-300">
              <tr>
                <th className="px-3 py-3">المنتج</th>
                <th className="px-3 py-3">الباقة</th>
                <th className="px-3 py-3">{STORE_AFFILIATE_COPY.priceLabelAr}</th>
                <th className="px-3 py-3">{STORE_AFFILIATE_COPY.commissionLabelAr}</th>
                <th className="px-3 py-3">{STORE_AFFILIATE_COPY.netLabelAr}</th>
              </tr>
            </thead>
            <tbody>
              {STORE_AFFILIATE_LINES.map((line) => (
                <tr key={line.id} className="border-t border-white/8">
                  <td className="px-3 py-3 font-bold text-white">{line.titleAr}</td>
                  <td className="px-3 py-3 text-slate-300">{line.packAr}</td>
                  <td className="px-3 py-3 text-slate-200">{line.priceSar} ر.س</td>
                  <td className="px-3 py-3 text-teal-200">{line.commissionSar} ر.س</td>
                  <td className="px-3 py-3 text-slate-300">
                    {affiliateNetSar(line.priceSar, line.commissionSar)} ر.س
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-7 text-slate-400">{STORE_AFFILIATE_COPY.storeOngoingAr}</p>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to={ROUTE_PATHS.STORE_AFFILIATES_ENTER}
          className="rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-black hover:bg-teal-400"
        >
          {STORE_AFFILIATE_COPY.homeApplyCtaAr}
        </Link>
        <Link
          to={ROUTE_PATHS.STORE_AFFILIATES_DESK}
          className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-slate-200 hover:border-teal-400/40"
        >
          {STORE_AFFILIATE_COPY.homeDeskCtaAr}
        </Link>
        <Link
          to={ROUTE_PATHS.STORE_AFFILIATES_RULES}
          className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-slate-200 hover:border-teal-400/40"
        >
          {STORE_AFFILIATE_COPY.homeRulesCtaAr}
        </Link>
      </div>
    </StoreAffiliatesChrome>
  );
}
