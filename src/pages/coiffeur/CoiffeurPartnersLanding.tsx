/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * هبوط شركاء كوافير ماب — لا فورم مستقل ولا دفع محلي.
 * طلب الانضمام = نفس /partners/register. الدفع = www.halaqmap.com.
 */
import { Link } from 'react-router-dom';
import { ArrowLeft, Scissors, ShieldCheck } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { CoiffeurBrandMark } from '@/components/coiffeur/CoiffeurBrandMark';
import {
  COIFFEUR_FOOTER_ECOMMERCE_AR,
  COIFFEUR_FOOTER_LEGAL_AR,
  COIFFEUR_HALAQMAP_PAYMENT_URL,
  COIFFEUR_LANDING_META,
  COIFFEUR_PARTNERS_COPY,
  COIFFEUR_UMBRELLA_LINE_AR,
} from '@/config/coiffeurMapUmbrella';

export default function CoiffeurPartnersLanding() {
  useDocumentTitle(COIFFEUR_LANDING_META.partnersTitle);

  return (
    <div dir="rtl" className="relative min-h-screen overflow-x-clip bg-[linear-gradient(165deg,#020912_0%,#041422_48%,#020912_100%)] text-slate-100">
      <header className="border-b border-white/10 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to={ROUTE_PATHS.COIFFEUR_LANDING} className="inline-flex no-underline">
            <CoiffeurBrandMark className="h-20 w-20" sizes="80px" wordmarkClassName="text-teal-100" />
          </Link>
          <span className="text-[11px] text-slate-400">{COIFFEUR_PARTNERS_COPY.badge}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-14 text-center">
        <h1 className="text-3xl font-black leading-tight text-white">{COIFFEUR_PARTNERS_COPY.title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-slate-300">{COIFFEUR_PARTNERS_COPY.lead}</p>

        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-teal-400/25 bg-white/[0.03] p-5 text-right">
          <p className="text-xs font-black tracking-wide text-teal-200">{COIFFEUR_PARTNERS_COPY.stepsTitle}</p>
          <ol className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
            {COIFFEUR_PARTNERS_COPY.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to={ROUTE_PATHS.COIFFEUR_REGISTER}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-teal-500 to-cyan-500 px-7 py-3.5 text-sm font-black text-white"
          >
            <Scissors className="h-4 w-4" />
            {COIFFEUR_PARTNERS_COPY.registerCta}
          </Link>
          <a
            href={COIFFEUR_HALAQMAP_PAYMENT_URL}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-slate-100"
          >
            صفحة الدفع المعتمدة
            <ArrowLeft className="h-4 w-4" />
          </a>
        </div>
        <p className="mx-auto mt-4 flex max-w-lg items-start gap-2 text-xs leading-6 text-amber-100/90">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          {COIFFEUR_PARTNERS_COPY.paymentNote}
        </p>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 text-center">
        <p className="text-xs leading-7 text-slate-400">{COIFFEUR_UMBRELLA_LINE_AR}</p>
        <p className="mt-2 text-[11px] text-slate-500">{COIFFEUR_FOOTER_LEGAL_AR}</p>
        <p className="mt-1 text-[11px] text-slate-500">{COIFFEUR_FOOTER_ECOMMERCE_AR}</p>
        <Link to={ROUTE_PATHS.USER_PRIVACY_POLICY} className="mt-3 inline-block text-[11px] text-slate-500">
          السياسات
        </Link>
        <Link to={ROUTE_PATHS.COIFFEUR_INTEREST} className="mt-3 block text-[11px] text-slate-500">
          سجّلي اهتمامك وتلقّي التحديثات
        </Link>
      </footer>
    </div>
  );
}
