/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  StoreVisitorFooter,
  StoreVisitorHeader,
  StoreVisitorShell,
} from '@/components/store/StoreChrome';
import {
  STORE_ISSUED_BROWSE_CONSENT_NOTE_AR,
  STORE_ISSUED_CARDS_LEGAL_FOLD_HINT_AR,
  STORE_ISSUED_CARDS_LEGAL_FOLD_TRIGGER_AR,
  STORE_ISSUED_CARDS_LEGAL_SECTIONS,
  STORE_ISSUED_CARDS_LEGAL_SUBTITLE_AR,
  STORE_ISSUED_CARDS_LEGAL_TITLE_AR,
  STORE_ISSUED_CARDS_POLICY_VERSION,
  STORE_LEGAL_DOCUMENTS,
  STORE_PRODUCT_ANNEXES,
  acceptedChecksForTrack,
  consentsForTrack,
  unifiedConsentLabelForTrack,
  type StoreIssuedCardTrack,
} from '@/config/storeIssuedCardsLegal';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { renderLegalContentBlocks } from '@/lib/legalPageRender';
import { STORE_DIRECT_PAY_POLICY_TITLE_AR } from '@/config/storeDirectPayLegal';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { storeStoreIssuedConsent } from '@/lib/storeIssuedCardsConsent';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

function LegalSectionList({ sections }: { sections: readonly { id: string; title: string; content: string }[] }) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <article key={section.id} id={section.id} className="rounded-2xl border border-white/10 bg-[#0b1a24]/80 p-5">
          <h3 className="text-lg font-bold text-[#f4efe4]">{section.title}</h3>
          <div className="partner-legal-prose mt-3 max-w-none">{renderLegalContentBlocks(section.content)}</div>
        </article>
      ))}
    </div>
  );
}

export default function StoreIssuedCardsLegalHub() {
  useDocumentTitle(STORE_ISSUED_CARDS_LEGAL_TITLE_AR);
  const navigate = useNavigate();
  const track: StoreIssuedCardTrack = 'paid';
  const checksForTrack = consentsForTrack(track);
  const unifiedLabel = unifiedConsentLabelForTrack(track);

  const [accepted, setAccepted] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const allSections = useMemo(() => STORE_ISSUED_CARDS_LEGAL_SECTIONS, []);

  useEffect(() => {
    setAccepted(false);
    setDetailsOpen(false);
  }, [track]);

  const onContinue = () => {
    if (!accepted) {
      toast.error('وافق على الشروط للمتابعة.');
      return;
    }
    storeStoreIssuedConsent(track, acceptedChecksForTrack(track));
    navigate(ROUTE_PATHS.STORE_INVITES);
  };

  const onPrint = () => {
    window.print();
  };

  return (
    <StoreVisitorShell>
      <StoreVisitorHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 print:max-w-none print:py-4">
        <p className="text-xs font-bold tracking-wide text-[#e8c547]">halaqmap · خريطة الحل</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#f4efe4]">{STORE_ISSUED_CARDS_LEGAL_TITLE_AR}</h1>
        <p className="mt-3 text-sm leading-7 text-white/75">{STORE_ISSUED_CARDS_LEGAL_SUBTITLE_AR}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm leading-7 text-white/70">
          <Link to={ROUTE_PATHS.STORE_DIRECT_PAY_POLICY} className="text-[#e8c547] underline">
            {STORE_DIRECT_PAY_POLICY_TITLE_AR}
          </Link>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1 text-white/60 underline-offset-4 hover:text-[#e8c547] hover:underline print:hidden"
          >
            <Printer className="h-4 w-4" aria-hidden />
            نسخة للطباعة
          </button>
        </div>
        <p className="mt-2 text-xs text-white/45">
          نسخة السياسات:{' '}
          <bdi dir="ltr" className="inline-block">
            {STORE_ISSUED_CARDS_POLICY_VERSION}
          </bdi>
        </p>

        <Tabs defaultValue="terms" className="mt-8 print:hidden">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-[#0b1a24] p-1">
            {STORE_LEGAL_DOCUMENTS.map((doc) => (
              <TabsTrigger
                key={doc.id}
                value={doc.id}
                className="text-xs sm:text-sm data-[state=active]:bg-[#e8c547]/20 data-[state=active]:text-[#e8c547]"
              >
                {doc.title}
              </TabsTrigger>
            ))}
            <TabsTrigger
              value="annexes"
              className="text-xs sm:text-sm data-[state=active]:bg-[#e8c547]/20 data-[state=active]:text-[#e8c547]"
            >
              ملاحق المنتجات
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="text-xs sm:text-sm data-[state=active]:bg-[#e8c547]/20 data-[state=active]:text-[#e8c547]"
            >
              النص الكامل
            </TabsTrigger>
          </TabsList>

          {STORE_LEGAL_DOCUMENTS.map((doc) => (
            <TabsContent key={doc.id} value={doc.id} className="mt-4">
              <LegalSectionList sections={doc.sections} />
            </TabsContent>
          ))}

          <TabsContent value="annexes" className="mt-4 space-y-3">
            <p className="text-sm leading-7 text-white/65">
              **السعر والمدة والمزايا الملزمة** في ملخص الطلب قبل الدفع والفاتورة — لا في هذه الملاحق.
            </p>
            {STORE_PRODUCT_ANNEXES.map((annex) => (
              <article key={annex.id} id={`annex-${annex.id}`} className="rounded-2xl border border-white/10 bg-[#0b1a24]/80 p-5">
                <h3 className="text-lg font-bold text-[#e8c547]">
                  <bdi>{annex.productNameAr}</bdi>
                </h3>
                <div className="partner-legal-prose mt-3 max-w-none">{renderLegalContentBlocks(annex.content)}</div>
              </article>
            ))}
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <LegalSectionList sections={allSections} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 hidden print:block">
          <LegalSectionList sections={allSections} />
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-bold text-[#f4efe4]">ملاحق المنتجات</h2>
            {STORE_PRODUCT_ANNEXES.map((annex) => (
              <article key={annex.id} className="rounded-xl border border-black/10 p-4">
                <h3 className="font-bold">{annex.productNameAr}</h3>
                <div className="partner-legal-prose mt-2">{renderLegalContentBlocks(annex.content)}</div>
              </article>
            ))}
          </div>
        </div>

        <section id="issued-card-consents" className="mt-8 rounded-2xl border border-[#e8c547]/30 bg-[#0b1a24] p-5 print:hidden">
          <h2 className="text-xl font-bold text-[#e8c547]">موافقة تصفح قبل البدء</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{STORE_ISSUED_CARDS_LEGAL_FOLD_HINT_AR}</p>
          <p className="mt-1 text-xs leading-6 text-white/45">{STORE_ISSUED_BROWSE_CONSENT_NOTE_AR}</p>

          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="mt-5">
            <CollapsibleTrigger
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-right text-sm font-semibold text-[#f4efe4] transition-colors hover:bg-white/10"
            >
              <span>{STORE_ISSUED_CARDS_LEGAL_FOLD_TRIGGER_AR}</span>
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 text-[#e8c547] transition-transform', detailsOpen && 'rotate-180')}
                aria-hidden
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <LegalSectionList sections={allSections} />
              <article className="rounded-2xl border border-[#e8c547]/20 bg-[#e8c547]/5 p-5">
                <h3 className="text-lg font-bold text-[#e8c547]">التعهدات المدرجة في موافقة الشراء</h3>
                <ul className="mt-3 list-disc space-y-2 pr-5 text-sm leading-relaxed text-[#f4efe4]">
                  {checksForTrack.map((item) => (
                    <li key={item.id}>{item.label}</li>
                  ))}
                </ul>
              </article>
            </CollapsibleContent>
          </Collapsible>

          <div
            className={cn(
              'mt-5 flex items-start gap-3 rounded-xl border p-4',
              accepted ? 'border-[#e8c547]/40 bg-[#e8c547]/5' : 'border-white/10',
            )}
          >
            <Checkbox
              id="issued-unified-consent"
              checked={accepted}
              onCheckedChange={(v) => setAccepted(v === true)}
            />
            <Label htmlFor="issued-unified-consent" className="cursor-pointer text-sm leading-relaxed text-[#f4efe4]">
              {unifiedLabel}
            </Label>
          </div>
          <Button
            type="button"
            disabled={!accepted}
            onClick={onContinue}
            className="mt-6 w-full bg-[#e8c547] text-[#061018] hover:bg-[#f0d36a]"
          >
            أوافق وأبدأ الآن
          </Button>
        </section>
      </main>
      <StoreVisitorFooter />
    </StoreVisitorShell>
  );
}
