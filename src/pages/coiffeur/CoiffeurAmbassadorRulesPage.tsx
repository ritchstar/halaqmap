/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * وثيقة قواعد المسوّقات لكوافير ماب — نسخة مؤنثة مطابقة لسفراء حلاق ماب.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Scale, Wallet } from 'lucide-react';
import {
  CoiffeurVisitorFooter,
  CoiffeurVisitorHeader,
  CoiffeurVisitorShell,
} from '@/components/coiffeur/CoiffeurVisitorChrome';
import {
  COIFFEUR_AMBASSADOR_PROGRAM_NAME_AR,
  COIFFEUR_AMBASSADOR_RULES_HUB,
  COIFFEUR_AMBASSADOR_RULES_SECTIONS,
  COIFFEUR_AMBASSADOR_RULES_VERSION,
} from '@/config/coiffeurAmbassadorCopy';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { renderLegalContentBlocks } from '@/lib/legalPageRender';
import { ROUTE_PATHS } from '@/lib/routePaths';

const ICONS = [Scale, MapPin, Wallet] as const;

export default function CoiffeurAmbassadorRulesPage() {
  useDocumentTitle(COIFFEUR_AMBASSADOR_RULES_HUB.titleAr + ' · كوافير ماب');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <CoiffeurVisitorShell withMobileDock={false}>
      <CoiffeurVisitorHeader brandTo={ROUTE_PATHS.COIFFEUR_LANDING} />

      <main className="mx-auto max-w-3xl px-4 py-10 pb-16">
        <div className="mb-10 text-center">
          <p className="inline-flex rounded-full border border-[#f4d4c0]/30 bg-[#e8b4a2]/15 px-4 py-1 text-xs font-bold text-[#f4d4c0]">
            {COIFFEUR_AMBASSADOR_RULES_HUB.kickerAr}
          </p>
          <h1 className="mt-4 text-3xl font-black text-white md:text-4xl">
            {COIFFEUR_AMBASSADOR_RULES_HUB.titleAr}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-rose-100/75">
            {COIFFEUR_AMBASSADOR_RULES_HUB.subtitleAr}
          </p>
          <p className="mt-3 text-xs text-rose-100/50">{COIFFEUR_AMBASSADOR_PROGRAM_NAME_AR}</p>
          <p className="mt-1 text-xs text-rose-100/45">نسخة: {COIFFEUR_AMBASSADOR_RULES_VERSION}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-rose-50/80">
              {COIFFEUR_AMBASSADOR_RULES_HUB.geoChipAr}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-rose-50/80">
              {COIFFEUR_AMBASSADOR_RULES_HUB.windowChipAr}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-rose-50/80">
              {COIFFEUR_AMBASSADOR_RULES_HUB.payoutChipAr}
            </span>
          </div>
          <Link
            to={ROUTE_PATHS.COIFFEUR_AMBASSADORS}
            className="mt-6 inline-flex rounded-xl bg-[#e8b4a2] px-5 py-2.5 text-sm font-bold text-[#2a1218]"
          >
            {COIFFEUR_AMBASSADOR_RULES_HUB.enterCtaAr}
          </Link>
        </div>

        <div className="space-y-5">
          {COIFFEUR_AMBASSADOR_RULES_SECTIONS.map((section, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <section
                key={section.id}
                id={section.id}
                className="rounded-2xl border border-[#f4d4c0]/18 bg-[#2a1218]/80 p-6"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#f4d4c0]/25 bg-[#e8b4a2]/15">
                    <Icon className="h-5 w-5 text-[#f4d4c0]" aria-hidden />
                  </div>
                  <h2 className="pt-1 text-xl font-bold text-rose-50">{section.title}</h2>
                </div>
                <div className="partner-legal-prose max-w-none text-rose-50/85">
                  {renderLegalContentBlocks(section.content)}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <CoiffeurVisitorFooter showPartnersLater />
    </CoiffeurVisitorShell>
  );
}
